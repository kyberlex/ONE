#!/usr/bin/env python3
"""
build_constitution_guide.py — Plain-language question-and-answer guide to the Constitution

Splits the English master text into articles by their headings and, for each article:
  1. Asks the model for 2-5 plain-language questions and answers, following guide/STYLE.md.
  2. Runs a second model call (check step) that lists every statement in the answers
     that the article text does not support; these are stored as "warnings", never auto-fixed.
  3. Stores the entry in guide/constitution_guide_en.json and rebuilds guide/constitution_guide_en.md.

Every entry keeps a SHA-256 hash of the article text it was generated from and "reviewed": false.
Only the maintainer sets "reviewed": true, by hand. Regenerating an entry resets it to false.

Usage:
  python3 scripts/build_constitution_guide.py --article 4.3        # one article
  python3 scripts/build_constitution_guide.py --chapter IV         # one chapter
  python3 scripts/build_constitution_guide.py --all                # every article
  python3 scripts/build_constitution_guide.py --stale              # changed or missing articles only
  python3 scripts/build_constitution_guide.py --audit              # report only, exit 1 if missing/stale
  python3 scripts/build_constitution_guide.py --article 4.3 --force   # regenerate unchanged text (also --dry-run)
  python3 scripts/build_constitution_guide.py --all --source path/to/working_copy.md
"""

import os
import re
import sys
import json
import time
import shutil
import hashlib
import argparse
import datetime
import tempfile
import subprocess
from pathlib import Path

# Setup paths
REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = REPO_ROOT / "bible" / "ONE NETWORKED EARTH (O.N.E.).md"
GUIDE_DIR = REPO_ROOT / "guide"
STYLE_PATH = GUIDE_DIR / "STYLE.md"
JSON_PATH = GUIDE_DIR / "constitution_guide_en.json"
MD_PATH = GUIDE_DIR / "constitution_guide_en.md"

# Load .env if present
ENV_PATH = REPO_ROOT / ".env"
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("\"'")

GEMINI_MODEL = "gemini-3.8-flash"
# Claude model per step (haiku, sonnet, opus or a full id): a lighter writer, a stricter checker.
CLAUDE_MODELS = {"write": os.environ.get("GUIDE_CLAUDE_MODEL", "sonnet"),
                 "check": os.environ.get("GUIDE_CLAUDE_CHECK_MODEL", "opus")}
# Short system prompt + neutral folder: no project CLAUDE.md, ~1.4k fixed tokens per call, still on subscription.
CLAUDE_SYSTEM_PROMPT = ("You write and check plain-language explanations of legal texts. "
                        "Follow the instructions in the message exactly and reply with JSON only.")

CHAPTER_RE = re.compile(r"^# \*\*CHAPTER ([IVXLC]+):\s*(.+?)\*\*\s*$")
ARTICLE_RE = re.compile(r"^### \*\*Article (\d+\.\d+)\s+[—-]\s+(.+?)\*\*\s*$")
BLOCK_END_RE = re.compile(r"^(#{1,3} |---\s*$)")


# ---------------------------------------------------------------- model calls

def call_gemini(prompt, step="write"):
    """Sends one prompt to Gemini (same client and key as sync_webapp_i18n.py). step is ignored. Returns (json, meta)."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("[!] ERROR: GEMINI_API_KEY not found. Add it to .env or export it in your shell.")
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        sys.exit("[!] ERROR: google-genai package not found. Run: pip install google-genai")
    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2)
    last_error = None
    for attempt in range(1, 4):
        try:
            t0 = time.time()
            response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt, config=config)
            usage = response.usage_metadata
            meta = {"model": GEMINI_MODEL, "seconds": round(time.time() - t0, 1),
                    "tokens_in": getattr(usage, "prompt_token_count", 0) or 0,
                    "tokens_out": (getattr(usage, "candidates_token_count", 0) or 0)
                                  + (getattr(usage, "thoughts_token_count", 0) or 0)}
            return json.loads(response.text.strip()), meta
        except Exception as e:  # network, quota or malformed JSON: retry, then stop
            last_error = e
            if attempt < 3:
                time.sleep(2 * attempt)
    sys.exit(f"[!] ERROR: Gemini call failed after 3 attempts: {last_error}")


def find_claude_binary():
    """CLAUDE_BIN, then PATH, then the newest CLI bundled with the Claude desktop app (macOS)."""
    explicit = os.environ.get("CLAUDE_BIN")
    if explicit:
        return explicit
    on_path = shutil.which("claude")
    if on_path:
        return on_path
    bundled = sorted(Path.home().glob(
        "Library/Application Support/Claude/claude-code/*/*/claude.app/Contents/MacOS/claude"))
    if bundled:
        return str(bundled[-1])
    sys.exit("[!] ERROR: Claude Code CLI not found. Install it or set CLAUDE_BIN.")


_CLAUDE_AUTH_OK = False


def call_claude(prompt, step="write"):
    """Sends one prompt to Claude Code (claude -p, JSON output, no tools) subscription login only; step picks the model."""
    global _CLAUDE_AUTH_OK
    if os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("[!] STOP: ANTHROPIC_API_KEY is set. This script never uses pay-per-use API billing.\n"
                 "    Unset it (and remove it from .env) to run on the subscription login.")
    claude = find_claude_binary()
    if not _CLAUDE_AUTH_OK:
        try:
            status = json.loads(subprocess.run([claude, "auth", "status"], capture_output=True,
                                               text=True, timeout=60).stdout)
        except (subprocess.SubprocessError, json.JSONDecodeError) as e:
            sys.exit(f"[!] ERROR: could not read Claude login status: {e}")
        if not status.get("loggedIn") or status.get("authMethod") != "claude.ai":
            sys.exit(f"[!] STOP: Claude Code is not on a subscription login (authMethod="
                     f"{status.get('authMethod')}). Run `claude /login` with the subscription account.")
        _CLAUDE_AUTH_OK = True
    t0 = time.time()
    try:
        cmd = [claude, "-p", "--output-format", "json", "--tools", "", "--system-prompt", CLAUDE_SYSTEM_PROMPT]
        cmd += ["--model", CLAUDE_MODELS[step]]
        with tempfile.TemporaryDirectory(prefix="guide_") as neutral_cwd:  # no project CLAUDE.md here
            proc = subprocess.run(cmd, input=prompt, capture_output=True, text=True, timeout=600,
                                  cwd=neutral_cwd)
        out = json.loads(proc.stdout)
    except (subprocess.SubprocessError, json.JSONDecodeError) as e:
        sys.exit(f"[!] ERROR: claude -p failed: {e}")
    if out.get("is_error"):
        sys.exit(f"[!] ERROR: claude -p returned an error: {out.get('result')}")
    text = out.get("result", "").strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    usage = out.get("usage", {})
    model = next(iter(out.get("modelUsage", {}) or {"claude": 0}))
    meta = {"model": model, "seconds": round(time.time() - t0, 1),
            "tokens_in": sum(usage.get(k, 0) or 0 for k in ("input_tokens", "cache_creation_input_tokens",
                                                            "cache_read_input_tokens")),
            "tokens_out": usage.get("output_tokens", 0)}
    try:
        return json.loads(text), meta
    except json.JSONDecodeError as e:
        sys.exit(f"[!] ERROR: Claude did not return valid JSON: {e}")


# One-line swap: set to call_gemini to use Gemini (same client and key as sync_webapp_i18n.py).
call_model = call_claude


# ---------------------------------------------------------------- source parsing

def parse_articles(source_path):
    """Returns an ordered list of articles: {id, title, chapter, chapter_title, text, hash}."""
    lines = source_path.read_text(encoding="utf-8").splitlines()
    articles, chapter, chapter_title, current = [], None, None, None

    def close(art):
        if art:
            art["text"] = "\n".join(art.pop("lines")).strip()
            art["hash"] = hashlib.sha256(art["text"].encode("utf-8")).hexdigest()
            articles.append(art)

    for line in lines:
        m_ch, m_art = CHAPTER_RE.match(line), ARTICLE_RE.match(line)
        if m_ch or m_art or (current and BLOCK_END_RE.match(line)):
            close(current)
            current = None
        if m_ch:
            chapter, chapter_title = m_ch.group(1), m_ch.group(2).strip()
        elif m_art:
            current = {"id": m_art.group(1), "title": m_art.group(2).strip(), "chapter": chapter,
                       "chapter_title": chapter_title, "lines": [line]}
        elif current is not None:
            current["lines"].append(line)
    close(current)
    return articles


def roman_to_int(s):
    values, total = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}, 0
    for i, ch in enumerate(s):
        v = values[ch]
        total += -v if i + 1 < len(s) and values[s[i + 1]] > v else v
    return total


# ---------------------------------------------------------------- prompts

def generation_prompt(style, article):
    return f"""You write a plain-language reader's guide to a constitution, one article at a time.
Follow these writing rules exactly:

{style}

Write the questions and answers for the article below. Use only what the article says.
Return ONLY valid JSON of the form {{"qa": [{{"q": "question", "a": "answer"}}]}}.

ARTICLE:
{article["text"]}
"""


def check_prompt(article, qa):
    numbered = "\n".join(f"Q{i + 1}: {x['q']}\nA{i + 1}: {x['a']}" for i, x in enumerate(qa))
    return f"""You are a strict fact checker. Below is an article of a constitution and a set of
questions and answers written about it. List every statement in an answer that the article text
does not support: anything added, guessed, generalised beyond the text, or with a number that
differs from the article. Statements that only rephrase the article are supported. Do not judge style.
Return ONLY valid JSON of the form
{{"warnings": [{{"answer": <answer number>, "statement": "the unsupported statement", "reason": "why"}}]}}
Return {{"warnings": []}} if every statement is supported.

ARTICLE:
{article["text"]}

QUESTIONS AND ANSWERS:
{numbered}
"""


# ---------------------------------------------------------------- storage

def load_guide():
    if not JSON_PATH.exists():
        return {}
    try:
        data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"[!] ERROR: {JSON_PATH.name} is not valid JSON ({e}); fix it by hand first.")
    return {e["article_id"]: e for e in data.get("articles", [])}


def sort_key(article_id):
    major, minor = article_id.split(".")
    return int(major), int(minor)


def save_guide(entries, source_name):
    ordered = [entries[k] for k in sorted(entries, key=sort_key)]
    payload = {"source": source_name, "articles": ordered}
    tmp = JSON_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(JSON_PATH)
    write_markdown(ordered)


def write_markdown(ordered):
    out = ["# The Constitution in plain questions and answers", "",
           "A reader's guide, written one article at a time. It explains; it does not replace. "
           "Where this guide and the article text differ, the article text prevails.", "",
           "Entries marked *not yet reviewed* have not been checked by a person. "
           "Warnings list statements that an automatic check found unsupported by the article.", ""]
    chapter = None
    for e in ordered:
        if e.get("chapter") != chapter:
            chapter = e.get("chapter")
            out += [f"## Chapter {chapter}: {e.get('chapter_title', '').title()}", ""]
        status = "reviewed" if e.get("reviewed") else "not yet reviewed"
        out += [f"### Article {e['article_id']}: {e['article_title']}", "",
                f"*{status} · {e['model']} · {e['date']}*", ""]
        for x in e["qa"]:
            out += [f"**{x['q']}**", "", x["a"], ""]
        if e.get("warnings"):
            out += ["> **Warnings (unsupported by the article text):**"]
            for w in e["warnings"]:
                out += [f"> - Answer {w.get('answer', '?')}: \"{w.get('statement', '')}\" ({w.get('reason', '')})"]
            out += [""]
    MD_PATH.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")


# ---------------------------------------------------------------- commands

def generate(article, style):
    data, meta = call_model(generation_prompt(style, article))
    qa = [{"q": str(x["q"]).strip(), "a": str(x["a"]).strip()}
          for x in data.get("qa", []) if isinstance(x, dict) and x.get("q") and x.get("a")]
    if not qa:
        sys.exit(f"[!] ERROR: no questions returned for Article {article['id']}: {data}")
    skip = {"model": "none", "seconds": 0, "tokens_in": 0, "tokens_out": 0}  # GUIDE_CLAUDE_CHECK_MODEL=none
    check, meta_c = ({}, skip) if CLAUDE_MODELS["check"] == "none" else call_model(check_prompt(article, qa), "check")
    warnings = [w for w in check.get("warnings", []) if isinstance(w, dict) and w.get("statement")]
    entry = {"article_id": article["id"], "article_title": article["title"],
             "chapter": article["chapter"], "chapter_title": article["chapter_title"],
             "source_hash": article["hash"], "qa": qa, "warnings": warnings,
             "model": meta["model"], "check_model": meta_c["model"],
             "date": datetime.date.today().isoformat(), "reviewed": False}
    totals = {k: round(meta[k] + meta_c[k], 1) for k in ("seconds", "tokens_in", "tokens_out")}
    return entry, totals


def select(articles, entries, args):
    if args.article:
        chosen = [a for a in articles if a["id"] == args.article]
        if not chosen:
            sys.exit(f"[!] ERROR: Article {args.article} not found in the source.")
    elif args.chapter:
        want = args.chapter.upper()
        chosen = [a for a in articles if a["chapter"] == want
                  or (args.chapter.isdigit() and roman_to_int(a["chapter"] or "I") == int(args.chapter))]
        if not chosen:
            sys.exit(f"[!] ERROR: Chapter {args.chapter} not found in the source.")
    else:  # --all or --stale
        chosen = list(articles)
    if args.stale or not args.force:
        chosen = [a for a in chosen if a["id"] not in entries or entries[a["id"]]["source_hash"] != a["hash"]]
    return chosen


def audit(articles, entries):
    missing = [a["id"] for a in articles if a["id"] not in entries]
    stale = [a["id"] for a in articles if a["id"] in entries and entries[a["id"]]["source_hash"] != a["hash"]]
    unreviewed = [a["id"] for a in articles if a["id"] in entries and not entries[a["id"]].get("reviewed")]
    with_warn = [(a["id"], len(entries[a["id"]].get("warnings", []))) for a in articles
                 if a["id"] in entries and entries[a["id"]].get("warnings")]
    orphans = sorted(set(entries) - {a["id"] for a in articles}, key=sort_key)
    print(f"Articles in source: {len(articles)} · entries in guide: {len(entries)}")
    print(f"  missing      ({len(missing)}): {', '.join(missing) or '-'}")
    print(f"  stale        ({len(stale)}): {', '.join(stale) or '-'}")
    print(f"  not reviewed ({len(unreviewed)}): {', '.join(unreviewed) or '-'}")
    print(f"  with warnings({len(with_warn)}): {', '.join(f'{i} ({n})' for i, n in with_warn) or '-'}")
    if orphans:
        print(f"  not in source ({len(orphans)}): {', '.join(orphans)}")
    return 1 if missing or stale else 0


def main():
    parser = argparse.ArgumentParser(description="Build the plain-language Constitution guide.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--article", help="one article, e.g. 4.3")
    mode.add_argument("--chapter", help="one chapter, e.g. IV")
    mode.add_argument("--all", action="store_true", help="every article")
    mode.add_argument("--stale", action="store_true", help="changed or missing articles only")
    mode.add_argument("--audit", action="store_true", help="report only; exit 1 if missing or stale")
    parser.add_argument("--source", default=str(DEFAULT_SOURCE), help="markdown file with the same heading pattern")
    parser.add_argument("--force", action="store_true", help="regenerate even if the article text is unchanged")
    parser.add_argument("--dry-run", action="store_true", help="print what would be sent and written; call no model")
    args = parser.parse_args()

    source = Path(args.source)
    if not source.exists():
        sys.exit(f"[!] ERROR: source not found: {source}")
    articles = parse_articles(source)
    if not articles:
        sys.exit("[!] ERROR: no '### **Article N.M — Title**' headings found in the source.")
    entries = load_guide()

    if args.audit:
        sys.exit(audit(articles, entries))

    style = STYLE_PATH.read_text(encoding="utf-8")
    todo = select(articles, entries, args)
    print(f"Source: {source.name} · {len(articles)} articles · to generate: {len(todo)}")
    if not todo:
        print("Nothing to do (text unchanged; use --force to regenerate).")
        return

    if args.dry_run:
        for a in todo:
            state = "new" if a["id"] not in entries else "regenerate (reviewed -> false)"
            print("=" * 75)
            print(f"Article {a['id']} — {a['title']} [{state}] hash {a['hash'][:12]}")
            print("-" * 75 + "\n" + generation_prompt(style, a))
            print("-" * 75 + "\n(then one check call with the article text and the generated answers)")
        print("=" * 75)
        print(f"Would write: {JSON_PATH.relative_to(REPO_ROOT)}, {MD_PATH.relative_to(REPO_ROOT)}")
        return

    GUIDE_DIR.mkdir(exist_ok=True)
    grand = {"seconds": 0, "tokens_in": 0, "tokens_out": 0}
    for i, a in enumerate(todo, 1):
        print(f"[{i}/{len(todo)}] Article {a['id']} — {a['title']} ...", flush=True)
        entry, totals = generate(a, style)
        entries[a["id"]] = entry
        save_guide(entries, source.name)  # saved after every article, so a partial run keeps its work
        for k in grand:
            grand[k] += totals[k]
        print(f"    {len(entry['qa'])} Q&A · {len(entry['warnings'])} warnings · {totals['seconds']}s · "
              f"{totals['tokens_in']} in / {totals['tokens_out']} out tokens")
    print(f"Done: {len(todo)} articles · {round(grand['seconds'], 1)}s · "
          f"{grand['tokens_in']} in / {grand['tokens_out']} out tokens")
    print(f"Wrote {JSON_PATH.relative_to(REPO_ROOT)} and {MD_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
