# Constitution guide

A reader's guide to the O.N.E. Constitution: for each article, two to five questions a normal person would ask, answered in plain language. It explains the text; it does not replace it. **Where the guide and the article text differ, the article text prevails.**

## Files

| File | What it is |
|---|---|
| `constitution_guide_en.json` | The guide data, one entry per article. This is the file the script reads and writes. |
| `constitution_guide_en.md` | The same content as a readable page, chapter by chapter. Regenerated from the JSON on every run; do not edit it by hand. |
| `STYLE.md` | The writing rules. The script sends this file to the model with every article, so the style changes without touching the code. |

The generator is `scripts/build_constitution_guide.py`. It reads the English master text and never modifies it.

## Commands

Run from the repository root.

```bash
python3 scripts/build_constitution_guide.py --article 4.3    # generate or regenerate one article
python3 scripts/build_constitution_guide.py --chapter IV     # one chapter (IV or 4)
python3 scripts/build_constitution_guide.py --all            # every article
python3 scripts/build_constitution_guide.py --stale          # only changed articles and articles with no entry yet
python3 scripts/build_constitution_guide.py --audit          # change nothing; list missing, stale, unreviewed; exit 1 if missing or stale
python3 scripts/build_constitution_guide.py --article 4.3 --dry-run   # print what would be sent and written; no model call
python3 scripts/build_constitution_guide.py --article 4.3 --force     # regenerate even if the article text is unchanged
python3 scripts/build_constitution_guide.py --all --source path/to/working_copy.md
```

`--source` takes any Markdown file with the same heading pattern (`# **CHAPTER IV: ...**` and `### **Article 4.3 — Title**`), so the guide can be drafted from a working copy before a change reaches the master text. Articles are split at their heading and end at the next heading or `---` line. Unnumbered sections (the Preamble) are not part of the guide.

## How each article is made

1. **Generation:** one model call receives `STYLE.md` and the article text and returns the questions and answers.
2. **Check:** a second model call receives the article text and the answers and lists every statement the article does not support. These go into the entry under `"warnings"`, appear in the `.md` page and are counted by `--audit`. The script never deletes or rewrites an answer because of a warning; a person decides.

The JSON is saved after every article, so an interrupted `--all` keeps the finished ones.

## Hash and review

Each entry stores `source_hash`, the SHA-256 of the article text it was generated from (heading included).

- An article whose text has not changed is never regenerated unless `--force` is given.
- `--stale` and `--audit` compare the stored hash with the current text: a difference means the article changed after its guide entry was written.
- Every entry starts with `"reviewed": false`. After reading an entry against the article, set `"reviewed": true` by hand in the JSON. The script never sets it to true.
- Regenerating an entry, for any reason, sets `"reviewed"` back to false.

## Model

The script currently uses **Gemini (`gemini-3.8-flash`)**, with the same client and the same `GEMINI_API_KEY` from `.env` as `scripts/sync_webapp_i18n.py`. Each entry records the model in `"model"` (generation) and `"check_model"` (check).

Claude through the Claude Code command line (`claude -p`, JSON output, no tools) is also implemented, restricted to the subscription login: it stops if `ANTHROPIC_API_KEY` is set and stops unless `claude auth status` reports a `claude.ai` login. It is not the default because the Claude Code CLI on this machine has no subscription login of its own outside the desktop app.

To swap, change one line in the script:

```python
call_model = call_gemini   # or: call_model = call_claude
```

The CLI is found through `CLAUDE_BIN`, then `PATH`, then the copy bundled with the Claude desktop app. Translations of the guide are not part of this script.
