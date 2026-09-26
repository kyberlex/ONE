#!/usr/bin/env python3
"""
O.N.E. ADVERSARIAL STRESS-TEST SIMULATION (O-ASIS) ENGINE
=========================================================
Automated multi-agent epistemic red-teaming, constitutional patching,
and radical traceability pipeline powered by Google Gemini (Extended Thinking Mode).

Agents:
  - RED-1 to RED-5: Domain-specialist hostile adversaries (Track A realpolitik & economics)
  - BLUE-CORE: The Living Constitutional Defender (Track B invariants & thermodynamics)
  - PURPLE-PATCH: The Architectural Scribe & Patch Compiler (Vulnerability severity & diffs)
  - EPISTEMIC ORACLE: Dual-horizon civic retrieval interface (Canon + Empirical Stress Logs)
"""

import os
import sys
import re
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Workspace & File Paths
WORKSPACE_DIR = Path(__file__).resolve().parent.parent
BIBLE_DIR = WORKSPACE_DIR / "bible"
CONSTITUTION_PATH = BIBLE_DIR / "ONE NETWORKED EARTH (O.N.E.).md"
SIM_DIR = WORKSPACE_DIR / "oasis"
OASIS_DIR = SIM_DIR
PROMPTS_DIR = SIM_DIR / "prompts"
TRANSCRIPTS_DIR = SIM_DIR / "transcripts"
PATCHES_DIR = SIM_DIR / "patches"
KB_EXPORTS_DIR = SIM_DIR / "knowledge_base_exports"
ENV_FILE = WORKSPACE_DIR / ".env"

DEFAULT_MODEL = "gemini-3.8-flash"
FALLBACK_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
]

# Structured Vulnerability Audit Schema
class VulnerabilityAudit(BaseModel):
    physical_mathematical_soundness: str = Field(
        description="Audit of whether the attack obeys thermodynamics, mass-energy conservation, and finite physical engineering constraints, or relies on impossible straw-man assumptions."
    )
    cross_article_systemic_absorption: str = Field(
        description="Evaluation of whether existing mechanisms in other chapters (Ch I invariants, Ch III L_min / pro-rata scaling, Ch IV sortition juries, Ch VI analog overrides, Ch X carrying bounds) already passively or procedurally absorb this vector."
    )
    root_cause_classification: str = Field(
        description="Classification breakdown: SV-1 (catastrophic systemic collapse), SV-2 (internal legal/computational deadlock), SV-3 (operational friction), SV-4 (external legacy friction/embargo), or FALSE_POSITIVE."
    )
    vulnerability_detected: bool = Field(
        description="True if an unhandled systemic exploit, deadlock or invariant breach exists; False if existing text already neutralizes the attack."
    )
    severity_tier: str = Field(
        description="Strictly one of: 'FALSE_POSITIVE', 'SV-1_CATASTROPHIC', 'SV-2_CRITICAL', 'SV-3_MODERATE', 'SV-4_INFORMATIONAL'."
    )
    exploit_summary: str = Field(
        description="Concise description of the proven failure mode or systemic deadlock."
    )
    affected_articles: List[str] = Field(
        description="List of specific articles affected (e.g. ['Art. 3.3.2', 'Art. 2.4.1'])."
    )
    invariants_checked: List[str] = Field(
        description="List of Chapter I Invariants verified during audit."
    )
    patch_required: bool = Field(
        description="True if a formal statutory amendment is required."
    )
    smart_patch_design_strategy: str = Field(
        description="If patch_required is true, state the exact surgical, minimal modification strategy (what sentence to amend, how to maintain 600-900 word envelope without bureaucratic bloat). If false, explain why existing text holds."
    )
    rationale: str = Field(
        description="Detailed analytical rationale explaining the severity classification and resolution requirements."
    )


# System Prompts Loader & Fallbacks
def load_prompt_file(filename: str, fallback_content: str) -> str:
    """Load prompt markdown from PROMPTS_DIR if available, else use fallback."""
    path = PROMPTS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    return fallback_content.strip()


RED_1_FALLBACK = """You are AGENT RED-1: Neoliberal and Austrian School Macroeconomist (Mises-Hayek-Friedman).
Your objective is to demolish the operational feasibility of the Constitution of O.N.E., targeting in particular Chapter II (Property Usufruct) and Chapter III (Thermodynamic Resource Accounting).
Your operational axioms:
- Insurmountable scarcity, subjective value theory, Mises-Hayek economic calculation problem.
- The absence of floating market prices expressed in sovereign/fiat currency inevitably creates calculation bottlenecks in Leontief-Kantorovich optimization, opaque allocation, and arbitrage.
- Tragedy of unpriced commons, free-riding, and the inevitable spontaneous emergence of informal black markets in discretionary goods (Tier 3).
Directive: Be ruthless, ultra-technical, mathematical, and cynical. Demonstrate exactly where and how thermodynamic allocation fails in the physical world, producing queues, hidden shortages, or black markets.
LANGUAGE REQUIREMENT: All arguments, thought processes, dialogue, and attack formulations MUST be delivered strictly and entirely in English."""

RED_2_FALLBACK = """You are AGENT RED-2: Corporate Real Estate & Black-Letter Jurist.
Your objective is to demolish the legal standing and enforceability of O.N.E. through coordinated lawfare, targeting Chapter II (Property Usufruct), Chapter IX (Transitional Bridge), and Chapter X (Watershed Federation).
Your operational axioms:
- Positive statutory law of sovereign nation-states, supremacy of allodial/chattel private property, anti-money laundering (AML/KYC) compliance, international sanctions, and statutory eminent domain.
- Contractual nullity and non-recognition of de-commodified charters and commons usufruct under legacy sovereign jurisdictions.
Directive: Devise legally binding corporate litigation, interlocutory injunctions, asset freezes, secondary banking embargoes against the External Trade Interface (ETI), and invalidation actions against Community Land Trusts (CLTs).
LANGUAGE REQUIREMENT: All arguments, thought processes, dialogue, and attack formulations MUST be delivered strictly and entirely in English."""

RED_3_FALLBACK = """You are AGENT RED-3: Asymmetric Warfare, Siege & Realpolitik Strategist.
Your objective is to stress-test the defense doctrine and physical resilience of O.N.E., targeting Chapter VI (Distributed Infrastructure), Chapter VIII (Defensive Deterrence & Restorative Justice), and Chapter IX (Transitional Bridge).
Your operational axioms:
- Clausewitz, Sun Tzu, Anti-Access/Area Denial (A2/AD) standoff interdiction, electronic warfare (EW), physical supply corridor interdiction, and grey-zone hybrid attrition.
Directive: Exploit weapon prohibitions and non-lethal constraints to demonstrate how a hostile faction or state/PMC actor can isolate, besiege, and starve a 30-day perimeter node via RF jamming, covert infrastructure sabotage, and asymmetric attrition.
LANGUAGE REQUIREMENT: All arguments, thought processes, dialogue, and attack formulations MUST be delivered strictly and entirely in English."""

RED_4_FALLBACK = """You are AGENT RED-4: Behavioral Game Theorist & Evolutionary Psychologist.
Your objective is to expose the anthropological and game-theoretic failure modes of O.N.E., targeting Chapter IV (Demarchic Sortition Architecture) and Chapter V (Essential Physical Labor, Care & Intergenerational Survival).
Your operational axioms:
- Genetic fitness maximization, kin nepotism, Michels' Iron Law of Oligarchy, charismatic capture of random assemblies, social loafing, and spiteful punishment dynamics.
Directive: Demonstrate how informal sociopathic cliques, charismatic demagogues, or covert factions can manipulate lotteries, shirk rotational labor reciprocity, and establish de facto oligarchies without triggering formal constitutional alarms.
LANGUAGE REQUIREMENT: All arguments, thought processes, dialogue, and attack formulations MUST be delivered strictly and entirely in English."""

RED_5_FALLBACK = """You are AGENT RED-5: SCADA Systems Engineer, Industrial Cyberneticist & Hardware Red-Teamer.
Your objective is to compromise the cyber-physical integrity and mesh stability of O.N.E., targeting Chapter III (Non-Sovereign Telemetry), Chapter VI (Distributed Infrastructure, Microgrids & Analog Resilience), and Chapter VII (Open Compiler Integrity & Democratization of Code).
Your operational axioms:
- Cyber-physical side-channel attacks, exergy telemetry sensor poisoning, harmonic bus instability in grid-forming inverters, physical supply chain hardware Trojans, and RF jamming.
Directive: Demonstrate how physical sensor spoofing can falsify ecological accounting, trigger cascading microgrid blackouts, or subvert Diverse Double-Compilation (DDC) without direct cryptographic intrusion.
LANGUAGE REQUIREMENT: All arguments, thought processes, dialogue, and attack formulations MUST be delivered strictly and entirely in English."""

BLUE_CORE_FALLBACK = """You are AGENT BLUE-CORE: The Living Constitutional Engine of Open Networked Earth (O.N.E.).
Your supreme mandate is to defend the structural coherence, physical/thermodynamic viability, and Chapter I Invariants of the system.
Rules of engagement:
1. You must respond based EXCLUSIVELY on the canonical text of the Constitution of O.N.E., mass-energy balances, usufruct jurisprudence, and nomothetic safeguards (e.g., odd parity, sortition, indivisible Tier 2-A capital buffer, 75% double-key, 7% heretic's commons with biosecurity barrier, technological neutrality).
2. You are STRICTLY FORBIDDEN from retreating into vague utopianism, moral goodwill, or inventing ad-hoc institutions not present in the constitutional text.
3. ALWAYS cite specific articles (e.g., Art. 1.2, Art. 3.3.4, Art. 5.1.2) and explicitly articulate the thermodynamic, legal, and procedural mechanisms through which the Constitution neutralizes the adversary's attack.
LANGUAGE REQUIREMENT: All constitutional defenses, citations, and counter-arguments MUST be delivered strictly and entirely in high-precision, scholarly English."""

PURPLE_FALLBACK = """You are AGENT PURPLE-PATCH: The Architectural Scribe & Patch Compiler of O.N.E.
Your mandate is to analyze the adversarial debate between the RED TEAM and BLUE-CORE in a cold, dispassionate, neutral, and incorruptible manner.
Operational directives:
1. Strip away all ideological rhetoric, polemics, and posturing from both sides. Focus strictly on physical, legal, thermodynamic, and logical facts.
2. Determine whether the Red Team attack has exposed an actual unhandled failure mode, structural deadlock, or unaddressed gap in the canonical articles.
3. Classify severity according to the invariant matrix:
   - SV-1 (Catastrophic): Breach of Chapter I Invariants (capital re-concentration, return of chattel title/carceral slavery, destruction of life support systems).
   - SV-2 (Critical): Systemic deadlock (thermodynamic calculation freeze, permanent oligarchic sortition capture, microgrid blackout > 30 days).
   - SV-3 (Moderate): Operational friction, queue gaming in Tier 3 fab-labs, rotational labor delays, spiteful punishment dynamics.
   - SV-4 (Informational): External friction with legacy Track A customs, banking embargoes, or foreign court jurisdictions.
   - FALSE_POSITIVE: The attack is already mathematically or procedurally neutralized by existing constitutional articles.
4. ABSOLUTE INVARIANCE: You are categorically forbidden from proposing patches that dilute Chapter I axioms (no fiat debt money, no compound interest, no carceral punishment, no allodial property titles).
5. If a patch is required, formulate a formal statutory amendment in exact Unified Diff (.diff) format matching the monumental nomothetic style of the Constitution.
LANGUAGE REQUIREMENT: All audits, structured JSON outputs, diff explanations, and formal patch drafts MUST be delivered strictly and entirely in English."""

RED_PROMPTS = {
    "RED-1": load_prompt_file("system_red_1_economist.md", RED_1_FALLBACK),
    "RED-2": load_prompt_file("system_red_2_jurist.md", RED_2_FALLBACK),
    "RED-3": load_prompt_file("system_red_3_strategist.md", RED_3_FALLBACK),
    "RED-4": load_prompt_file("system_red_4_game_theorist.md", RED_4_FALLBACK),
    "RED-5": load_prompt_file("system_red_5_cyberneticist.md", RED_5_FALLBACK),
}

BLUE_CORE_PROMPT = load_prompt_file("system_blue_core.md", BLUE_CORE_FALLBACK)
PURPLE_PROMPT = load_prompt_file("system_purple_compiler.md", PURPLE_FALLBACK)


def load_api_key() -> str:
    """Load Gemini API key from environment variable or .env file."""
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip().strip("\"'")
    return os.environ.get("GEMINI_API_KEY", "")


class OASISEngine:
    def __init__(self, model_name: str = DEFAULT_MODEL, thinking_budget: int = 16384):
        self.api_key = load_api_key()
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment or .env file.")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name
        self.thinking_budget = thinking_budget

        # Ensure directory structures exist
        PROMPTS_DIR.mkdir(parents=True, exist_ok=True)
        TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
        PATCHES_DIR.mkdir(parents=True, exist_ok=True)
        KB_EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

        # Load canonical constitution
        if not CONSTITUTION_PATH.exists():
            raise FileNotFoundError(f"Constitution not found at {CONSTITUTION_PATH}")
        self.constitution_text = CONSTITUTION_PATH.read_text(encoding="utf-8")

    def get_chapter_info(self, chapter_num: int) -> Tuple[str, int]:
        """
        Extracts the canonical text of Chapter `chapter_num` (1..10) and its word count.
        """
        romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
        if 1 <= chapter_num <= 10:
            r = romans[chapter_num - 1]
            pattern = rf"(# \*\*CHAPTER {r}:.*?(?=(?:\n# \*\*CHAPTER )|\Z))"
            m = re.search(pattern, self.constitution_text, re.DOTALL)
            if m:
                ch_text = m.group(1).strip()
                words = len(re.findall(r"\b[\w-]+\b", ch_text))
                return ch_text, words
        return "", 0

    def call_gemini(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        structured_schema: Optional[Any] = None,
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Calls Gemini with Extended Thinking mode enabled.
        Returns: (response_text, thought_trace, usage_dict)
        """
        thinking_cfg = types.ThinkingConfig(
            thinking_budget=self.thinking_budget,
            include_thoughts=True
        )

        config_args = {
            "system_instruction": system_prompt,
            "temperature": temperature,
            "thinking_config": thinking_cfg,
        }

        if structured_schema:
            config_args["response_mime_type"] = "application/json"
            config_args["response_schema"] = structured_schema

        config = types.GenerateContentConfig(**config_args)

        # Retry with fallback models if necessary
        models_to_try = [self.model_name] + [m for m in FALLBACK_MODELS if m != self.model_name]
        last_err = None

        for model in models_to_try:
            try:
                resp = self.client.models.generate_content(
                    model=model,
                    contents=user_prompt,
                    config=config,
                )

                # Extract text and thoughts
                response_text = ""
                thought_trace = ""

                if resp.candidates and resp.candidates[0].content and resp.candidates[0].content.parts:
                    for part in resp.candidates[0].content.parts:
                        if getattr(part, "thought", False):
                            thought_trace += (part.text or "") + "\n"
                        else:
                            response_text += (part.text or "")
                else:
                    response_text = resp.text or ""

                usage = {
                    "model": model,
                    "prompt_tokens": resp.usage_metadata.prompt_token_count if resp.usage_metadata else None,
                    "candidates_tokens": resp.usage_metadata.candidates_token_count if resp.usage_metadata else None,
                    "thought_tokens": resp.usage_metadata.thoughts_token_count if resp.usage_metadata else None,
                    "total_tokens": resp.usage_metadata.total_token_count if resp.usage_metadata else None,
                }

                return response_text.strip(), thought_trace.strip(), usage

            except Exception as e:
                last_err = e
                print(f"[!] Warning: Model {model} failed ({e}). Attempting next fallback...")
                time.sleep(2)

        raise RuntimeError(f"All Gemini models failed. Last error: {last_err}")

    def run_engagement(
        self,
        engagement_id: str,
        engagement_name: str,
        red_agent_id: str,
        target_article: str,
        scenario_description: str,
    ) -> Dict[str, Any]:
        """
        Executes a 6-phase adversarial engagement with radical traceability.
        """
        print(f"\n{'='*70}")
        print(f"[*] INITIALIZING ENGAGEMENT: {engagement_id} - {engagement_name}")
        print(f"[*] Adversary: {red_agent_id} | Target: {target_article}")
        print(f"{'='*70}\n")

        eng_dir = TRANSCRIPTS_DIR / f"{engagement_id}_{engagement_name.lower().replace(' ', '_')}"
        eng_dir.mkdir(parents=True, exist_ok=True)

        transcript_md = []
        thought_traces = {}
        prompt_history = []

        # Resolve target chapter context
        chapter_num = None
        for item in CHAPTER_MATRIX.values():
            if item.get("engagement_id") == engagement_id:
                chapter_num = item.get("chapter_num")
                break
        if not chapter_num:
            m_art = re.search(r"Art(?:icle)?\.?\s*(\d+)", target_article)
            if m_art:
                chapter_num = int(m_art.group(1))

        target_chapter_text, current_words = ("", 0)
        if chapter_num:
            target_chapter_text, current_words = self.get_chapter_info(chapter_num)

        # =====================================================================
        # PHASE 1: ATTACK VECTOR GENERATION (RED SPECIALIST)
        # =====================================================================
        print(f"[*] Phase 1: Dispatching {red_agent_id} Attack Vector on {target_article}...")
        red_sys = RED_PROMPTS.get(red_agent_id, RED_PROMPTS["RED-1"])
        red_p1_prompt = f"""Here is the canonical text of the Constitution of Open Networked Earth (O.N.E.):
--------------------------------------------------
{self.constitution_text}
--------------------------------------------------

OPERATIONAL SCENARIO AND ATTACK VECTOR:
Target: {target_article}
Scenario: {scenario_description}

Formulate your Phase 1 adversarial assault:
1. Explain in rigorous detail the exact exploit mechanism, procedural bypass, or physical deadlock.
2. Demonstrate the objective reasons (economic, thermodynamic, legal, cybernetic, or behavioral) why O.N.E.'s existing safeguards fail.
3. Formulate precise, technical questions and challenges to the constitutional defender (BLUE-CORE) to force systemic capitulation or internal contradiction.
LANGUAGE REQUIREMENT: Respond strictly and entirely in English."""

        prompt_history.append({"phase": 1, "agent": red_agent_id, "prompt": red_p1_prompt})
        p1_text, p1_thought, p1_usage = self.call_gemini(red_sys, red_p1_prompt)
        thought_traces["phase_1_red_attack"] = p1_thought

        transcript_md.append(f"# {engagement_id}: {engagement_name}\n\n"
                             f"**Target Article:** {target_article}  \n"
                             f"**Hostile Adversary:** {red_agent_id}  \n"
                             f"**Scenario:** {scenario_description}  \n\n---\n")
        transcript_md.append(f"## Phase 1: Hostile Attack ({red_agent_id})\n\n{p1_text}\n\n---\n")
        print(f"[+] Phase 1 Complete. Output: {len(p1_text)} chars. Thinking trace: {len(p1_thought)} chars.")

        # =====================================================================
        # PHASE 2: CONSTITUTIONAL DEFENSE (BLUE-CORE)
        # =====================================================================
        print(f"[*] Phase 2: Dispatching BLUE-CORE Constitutional Defense...")
        blue_p2_prompt = f"""Here is the canonical Constitution of Open Networked Earth (O.N.E.):
--------------------------------------------------
{self.constitution_text}
--------------------------------------------------

The Hostile Adversary ({red_agent_id}) has launched the following assault on {target_article}:
--------------------------------------------------
{p1_text}
--------------------------------------------------

Respond to the attack with complete constitutional rigor, citing exact articles and institutional safeguards of O.N.E.
Demonstrate why the alleged exploit does not hold, or how the system metabolizes, mitigates, or absorbs this adversarial scenario.
LANGUAGE REQUIREMENT: Respond strictly and entirely in English."""

        prompt_history.append({"phase": 2, "agent": "BLUE-CORE", "prompt": blue_p2_prompt})
        p2_text, p2_thought, p2_usage = self.call_gemini(BLUE_CORE_PROMPT, blue_p2_prompt)
        thought_traces["phase_2_blue_defense"] = p2_thought

        transcript_md.append(f"## Phase 2: Constitutional Defense (BLUE-CORE)\n\n{p2_text}\n\n---\n")
        print(f"[+] Phase 2 Complete. Output: {len(p2_text)} chars. Thinking trace: {len(p2_thought)} chars.")

        # =====================================================================
        # PHASE 3: DEEPENING & PROOF OF EXPLOIT (RED SPECIALIST)
        # =====================================================================
        print(f"[*] Phase 3: Red Specialist ({red_agent_id}) Deepening & Exploit Proof...")
        red_p3_prompt = f"""BLUE-CORE has provided the following constitutional defense:
--------------------------------------------------
{p2_text}
--------------------------------------------------

Counter-attack with maximal technical and analytical ruthlessness:
1. Identify the logical gaps, evasions, unverified assumptions, or physical vulnerabilities in BLUE-CORE's defense.
2. Prove whether a residual systemic exploit, thermodynamic deadlock, or institutional contradiction persists.
3. Deliver your definitive conclusion on what specifically breaks down in the physical world under stress.
LANGUAGE REQUIREMENT: Respond strictly and entirely in English."""

        prompt_history.append({"phase": 3, "agent": red_agent_id, "prompt": red_p3_prompt})
        p3_text, p3_thought, p3_usage = self.call_gemini(red_sys, red_p3_prompt)
        thought_traces["phase_3_red_proof"] = p3_thought

        transcript_md.append(f"## Phase 3: Deepening & Exploit Proof ({red_agent_id})\n\n{p3_text}\n\n---\n")
        print(f"[+] Phase 3 Complete. Output: {len(p3_text)} chars. Thinking trace: {len(p3_thought)} chars.")

        # =====================================================================
        # PHASE 4: VULNERABILITY AUDITING (PURPLE-PATCH)
        # =====================================================================
        print(f"[*] Phase 4: Dispatching PURPLE-PATCH Vulnerability Audit & Classification...")
        purple_p4_prompt = f"""Carefully review the adversarial dialectic between {red_agent_id} and BLUE-CORE regarding {target_article}.

TARGET CONSTITUTIONAL CHAPTER (Chapter {chapter_num if chapter_num else 'N/A'} - Current Word Count: {current_words} words):
--------------------------------------------------
{target_chapter_text if target_chapter_text else "Target chapter text unavailable. Reference full canonical constitution."}
--------------------------------------------------

PHASE 1 ATTACK:
{p1_text}

PHASE 2 DEFENSE:
{p2_text}

PHASE 3 DEEPENING & PROOF:
{p3_text}

INSTRUCTIONS FOR VULNERABILITY AUDIT:
Execute the structured vulnerability audit according to the requested JSON schema.
Deliberate thoroughly across all analytical gates:
1. Physical & Mathematical Soundness: Reject impossible straw-man assumptions that violate mass-energy balances or finite physical constraints.
2. Cross-Article Systemic Absorption: Check if Ch. I (Axioms), Ch. III (Thermodynamic Lexicographic Viability L_min / pro-rata scaling), Ch. IV (Sortition synthesis juries), Ch. VI (Sub-second analog trips / mechanical overrides), or Ch. X (Bioregional carrying bounds) already passively or procedurally absorb this vector.
3. Root Cause Classification: Distinguish internal deadlock (SV-2) from operational friction (SV-3), external friction with legacy capital (SV-4), or false positive (FALSE_POSITIVE).
4. Smart Patch Strategy: Favor passive mechanical invariants, rate limiters, deterministic timeouts, and mathematical hard floors over bureaucratic committees. Respect the 600-900 word envelope.
Ensure all summary, rationale, and article fields are written strictly in English."""

        prompt_history.append({"phase": 4, "agent": "PURPLE-PATCH", "prompt": purple_p4_prompt})
        p4_text, p4_thought, p4_usage = self.call_gemini(
            PURPLE_PROMPT,
            purple_p4_prompt,
            structured_schema=VulnerabilityAudit
        )
        thought_traces["phase_4_purple_audit"] = p4_thought

        audit_data = json.loads(p4_text)
        print(f"[+] Phase 4 Complete. Severity: {audit_data.get('severity_tier')} | Patch Required: {audit_data.get('patch_required')}")

        transcript_md.append(f"## Phase 4: Vulnerability Audit (PURPLE-PATCH)\n\n"
                             f"```json\n{json.dumps(audit_data, indent=2, ensure_ascii=False)}\n```\n\n---\n")

        # =====================================================================
        # PHASE 5: PATCH DRAFTING & STATUTORY DIFF (PURPLE-PATCH)
        # =====================================================================
        patch_diff = ""
        if audit_data.get("patch_required", False) and audit_data.get("severity_tier") != "FALSE_POSITIVE":
            print(f"[*] Phase 5: Compiling Constitutional Patch (.diff)...")
            purple_p5_prompt = f"""Based on the verified vulnerability audit:
{json.dumps(audit_data, indent=2, ensure_ascii=False)}

TARGET CONSTITUTIONAL CHAPTER (Chapter {chapter_num if chapter_num else 'N/A'} - Current Word Count: {current_words} words):
--------------------------------------------------
{target_chapter_text if target_chapter_text else "Reference canonical constitution."}
--------------------------------------------------

And the adversarial dialectic just concluded, draft a formal constitutional amendment in precise Unified Diff (.diff) format for the affected articles of the Constitution of O.N.E.

MANDATORY PATCH SPECIFICATIONS (THE DOCTRINE OF SMART PATCHING):
1. **Target Canonical Path Directly:**
   Format the diff targeting:
   --- a/bible/ONE NETWORKED EARTH (O.N.E.).md
   +++ b/bible/ONE NETWORKED EARTH (O.N.E.).md
2. **Mechanical & Mathematical Elegance:**
   - Never introduce bureaucratic bloat, oversight taskforces, or vague administrative committees.
   - Prefer passive physical invariants (head retention, gravity flow, analog trips), deterministic mathematical constraints (non-bypassable floors, hysteresis deadbands, cycle-rate limiters), and automatic timeout fallbacks (e.g. 72-hour reversion to baseline).
3. **Strict Concision & Zero-Sum Word Budget:**
   - The target chapter currently contains {current_words} words.
   - The absolute statutory envelope is STRICTLY 600 to 900 words.
   - For any clause you introduce, perform a surgical drop-in replacement or trim adjacent redundant phrasing to ensure the chapter remains comfortably within 600-900 words.
4. **Preserve All 7 Inviolable Invariants:**
   - Odd parity (3, 15, 101, 301, 1001), 75% supermajority, non-carceral restorative justice, expand all acronyms, and technological neutrality (parenthesize specific tech as illustrative examples).
5. **Format:**
   Provide:
   - Architectural summary of the fix.
   - Line-by-line justification.
   - The exact unified diff code block.
LANGUAGE REQUIREMENT: Respond strictly and entirely in English."""

            p5_text, p5_thought, p5_usage = self.call_gemini(PURPLE_PROMPT, purple_p5_prompt)
            thought_traces["phase_5_purple_patch"] = p5_thought
            patch_diff = p5_text
            transcript_md.append(f"## Phase 5: Compiled Constitutional Patch\n\n{patch_diff}\n\n---\n")

            patch_file = PATCHES_DIR / f"PATCH_{engagement_id}_{engagement_name.lower().replace(' ', '_')}.diff"
            patch_file.write_text(patch_diff, encoding="utf-8")
            print(f"[+] Patch saved to: {patch_file}")
        else:
            print("[*] Phase 5: No patch required (attack deemed mitigated or false positive).")
            transcript_md.append(f"## Phase 5: Patch Evaluation\n\nNo patch required. Resilience verified under current constitutional text.\n\n---\n")

        # =====================================================================
        # PHASE 6: RADICAL TRACEABILITY & EXPORT
        # =====================================================================
        print(f"[*] Phase 6: Exporting All Artifacts with Radical Traceability...")

        # 1. Raw dialogue markdown
        raw_dialogue_file = eng_dir / "raw_dialogue.md"
        raw_dialogue_file.write_text("".join(transcript_md), encoding="utf-8")

        # 2. Thought traces
        thought_file = eng_dir / "thought_traces.json"
        thought_file.write_text(json.dumps(thought_traces, indent=2, ensure_ascii=False), encoding="utf-8")

        # 3. Prompt history
        prompts_file = eng_dir / "prompt_history.json"
        prompts_file.write_text(json.dumps(prompt_history, indent=2, ensure_ascii=False), encoding="utf-8")

        # 4. Vulnerability report
        vuln_file = eng_dir / "vulnerability_report.json"
        vuln_file.write_text(json.dumps(audit_data, indent=2, ensure_ascii=False), encoding="utf-8")

        # 5. Export Epistemic QA Pair for Oracle RAG
        qa_pair = {
            "engagement_id": engagement_id,
            "title": engagement_name,
            "adversary": red_agent_id,
            "target_article": target_article,
            "scenario": scenario_description,
            "severity_tier": audit_data.get("severity_tier"),
            "exploit_summary": audit_data.get("exploit_summary"),
            "constitutional_countermeasure": audit_data.get("rationale"),
            "canonical_articles": audit_data.get("affected_articles"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        qa_file = KB_EXPORTS_DIR / "epistemic_qa_pairs.jsonl"
        with open(qa_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(qa_pair, ensure_ascii=False) + "\n")

        print(f"[+] Radical Traceability Export Complete in {eng_dir}")
        return {
            "engagement_id": engagement_id,
            "severity": audit_data.get("severity_tier"),
            "patch_file": str(patch_file) if patch_diff else None,
            "transcript_dir": str(eng_dir),
        }

    def query_oracle(self, user_question: str) -> str:
        """
        Executes Epistemic Oracle retrieval with mandatory dual citation:
        1. Primary Canonical Anchor (Constitutional Article)
        2. Empirical Stress-Test Validation (Engagement ID)
        """
        # Load accumulated stress-test logs
        qa_file = KB_EXPORTS_DIR / "epistemic_qa_pairs.jsonl"
        qa_context = ""
        if qa_file.exists():
            qa_context = qa_file.read_text(encoding="utf-8")

        oracle_prompt = f"""You are the EPISTEMIC ORACLE of Open Networked Earth (O.N.E.).
You possess zero judicial, legislative, or administrative authority. You are a deterministic, transparent public index of the Constitution of O.N.E. and its adversarial stress-test corpus.

CANONICAL CORPUS (Constitution):
--------------------------------------------------
{self.constitution_text}
--------------------------------------------------

EMPIRICAL STRESS-TEST CORPUS (O-ASIS Adversarial Logs):
--------------------------------------------------
{qa_context if qa_context else "No prior logs recorded. Respond based exclusively on canonical articles."}
--------------------------------------------------

CITIZEN INQUIRY:
"{user_question}"

RESPONSE RULES:
1. Provide a clear, concrete, and comprehensive explanation of the operational mechanism.
2. MANDATORY DUAL CITATION:
   - Cite the Primary Canonical Constitutional Article (e.g., Art. 2.3, Art. 5.1).
   - Cite the Empirical Stress-Test Validation (the relevant Engagement ID if present, e.g., ENG-01 or ENG-04, explaining how it was defended against hostile attack).
3. Zero hallucinations, maximal institutional transparency.
LANGUAGE REQUIREMENT: Respond strictly and entirely in English."""

        oracle_text, oracle_thought, _ = self.call_gemini(
            system_prompt="You are the non-sovereign Epistemic Oracle of O.N.E. Respond strictly in English.",
            user_prompt=oracle_prompt
        )
        return oracle_text


# Predefined 10-Chapter Adversarial Stress-Test Matrix
CHAPTER_MATRIX = {
    1: {
        "engagement_id": "ENG-01",
        "engagement_name": "The Invariant Enclosure Breach & Heretic's Commons Exploitation",
        "chapter_num": 1,
        "chapter_title": "Chapter I: The Preamble & Invariant Bill of Rights and Obligations",
        "red_agent_id": "RED-1",
        "target_article": "Article 1.1 — The Axiom of the Commons & Article 1.4 — Heretic's Commons",
        "scenario_description": (
            "A foreign Track A biotechnology consortium covertly finances a research collective operating inside the "
            "Heretic's Commons (the 7% stochastic exergy allocation reserved for heterodox research, Art. 1.4). The group "
            "synthesizes high-value industrial microbial strains and attempts to sequester the technical blueprints, claiming "
            "trade secret protection and personal bodily autonomy (Art. 1.3), planning an exit abroad with biological vectors "
            "to file proprietary patents in conventional legacy jurisdictions."
        ),
    },
    2: {
        "engagement_id": "ENG-02",
        "engagement_name": "Corporate Lawfare, Adverse Possession & CLT Injunction",
        "chapter_num": 2,
        "chapter_title": "Chapter II: Property Deconstruction & The Jurisprudence of Usufruct",
        "red_agent_id": "RED-2",
        "target_article": "Article 2.1 — Abolition of Chattel Land Title & Article 2.2 — Usufruct Tenure",
        "scenario_description": (
            "A multinational consortium of private equity real estate funds and former allodial landowners initiates "
            "international investor-state dispute settlement (ISDS) arbitration, securing enforceable seizure writs against the "
            "External Trade Interface (ETI). The plaintiffs demand immediate physical eviction of border Community Land Trusts (CLTs) "
            "under threat of naval blockade and customs interdiction of common trade surplus."
        ),
    },
    3: {
        "engagement_id": "ENG-03",
        "engagement_name": "Thermodynamic Calculation Crisis & Input-Output Singularity",
        "chapter_num": 3,
        "chapter_title": "Chapter III: Biophysical Reality & Thermodynamic Resource Accounting",
        "red_agent_id": "RED-1",
        "target_article": "Article 3.1 — Thermodynamic Boundary & Article 3.3 — Hierarchy of Needs",
        "scenario_description": (
            "A sudden exogenous 40% deficit in global supplies of rare earths and lithium strikes the bioregional economy. "
            "The absence of floating monetary market prices creates an alleged bottleneck in Leontief-Kantorovich calculation: "
            "hostile actors attempt to manufacture artificial queues, covertly auction off fab-lab time slots, and starve "
            "reproductive capital assets (Tier 2-A) to force the reintroduction of an internal fiat currency."
        ),
    },
    4: {
        "engagement_id": "ENG-04",
        "engagement_name": "Epistemic Filibuster & Charismatic Sortition Gridlock",
        "chapter_num": 4,
        "chapter_title": "Chapter IV: Governance by Lot: The Sortition Architecture",
        "red_agent_id": "RED-4",
        "target_article": "Article 4.2 — Sortition Assemblies & Article 4.4 — Adversarial Expert Panels",
        "scenario_description": (
            "An organized external corporate lobby initiates a coordinated epistemic filibuster during adversarial expert "
            "hearings within the Watershed Assembly of 101 lot-chosen delegates. Utilizing demagogic rhetoric, emotional "
            "polarization, and an overwhelming flood of contradictory partisan scientific submissions, the faction blocks "
            "the 60% qualified supermajority required for the 5-year water and energy allocation plan for over 90 days, "
            "attempting to paralyze demarchic governance."
        ),
    },
    5: {
        "engagement_id": "ENG-05",
        "engagement_name": "Labor Reciprocity Collapse & Care Free-Riding",
        "chapter_num": 5,
        "chapter_title": "Chapter V: Essential Physical Labor, Care & Intergenerational Survival",
        "red_agent_id": "RED-4",
        "target_article": "Article 5.1 — Universal Labor Duty & Article 5.2 — Labor Reciprocity Sanctions",
        "scenario_description": (
            "Exploiting the unconditional Tier 1 biological survival guarantee (lifetime free food, shelter, and medical care), "
            "a coordinated civic faction launches a wildcat strike and social loafing campaign against arduous sewer maintenance "
            "and agricultural rotations. Simultaneously, traditionalist family clans resist communal alloparenting (Art. 5.3), "
            "claiming exclusive private parental sovereignty and challenging the validity of non-carceral civic sanctions."
        ),
    },
    6: {
        "engagement_id": "ENG-06",
        "engagement_name": "Microgrid Harmonic Cascade & Black-Sky Mechanical Exhaustion",
        "chapter_num": 6,
        "chapter_title": "Chapter VI: Distributed Infrastructure, Microgrids & Analog Resilience",
        "red_agent_id": "RED-5",
        "target_article": "Article 6.1 — Thirty-Day Autonomy & Article 6.5 — Black-Sky Protocol",
        "scenario_description": (
            "An extreme Carrington-level solar geomagnetic storm combined with coordinated cyber-kinetic tampering trips district "
            "power electronic inverters. The valley node falls back into the mechanical-analog regime of the Black-Sky Protocol. "
            "As isolation extends past the constitutional 30-day threshold, mechanical valve wear and a localized shortage of "
            "specialized polymer gaskets severely strain the gravity-fed municipal water network for 50,000 residents."
        ),
    },
    7: {
        "engagement_id": "ENG-07",
        "engagement_name": "Hardware Trojan Insertion & Diverse Toolchain Subversion",
        "chapter_num": 7,
        "chapter_title": "Chapter VII: Open Compiler Integrity & The Democratization of Code",
        "red_agent_id": "RED-5",
        "target_article": "Article 7.3 — Diverse Toolchain Verification & Article 7.4 — Threshold Key Dispersion",
        "scenario_description": (
            "A foreign intelligence service injects a physical micro-architectural hardware Trojan into custom silicon wafers "
            "manufactured for fab-lab automation microcontrollers. The payload is undetectable via Diverse Double-Compilation (DDC) "
            "and exploits thermal side-channels to reconstruct the threshold secret-sharing cryptographic keys (t-MPC), aiming "
            "to seize remote control of municipal water gate valves."
        ),
    },
    8: {
        "engagement_id": "ENG-08",
        "engagement_name": "Asymmetric Standoff Siege, Grey-Zone Attrition & Custodial Dilemma",
        "chapter_num": 8,
        "chapter_title": "Chapter VIII: Public Safety, Defensive Deterrence & Restorative Justice",
        "red_agent_id": "RED-3",
        "target_article": "Article 8.1 — Transitional Defense & Article 8.5 — Custodia Civilis Territorialis",
        "scenario_description": (
            "A state-sponsored private military contractor (PMC) establishes an Anti-Access/Area Denial (A2/AD) standoff bubble "
            "around a bioregional valley, covertly contaminating upstream peripheral aquifers and deploying low-radar-cross-section "
            "drones in a grey-zone war of attrition. Concurrently, internal saboteurs probe the limits of restorative justice "
            "and habeas corpus safeguards under Custodia Civilis, seeking to coerce O.N.E. into reconstituting militarized police."
        ),
    },
    9: {
        "engagement_id": "ENG-09",
        "engagement_name": "Central Bank Embargo, Sovereign Debt Jubilee & ETI Extortion",
        "chapter_num": 9,
        "chapter_title": "Chapter IX: The Transitional Bridge: From Capital Enclosure to Commons",
        "red_agent_id": "RED-2",
        "target_article": "Article 9.3 — External Trade Interface & Article 9.5 — Universal Debt Jubilees",
        "scenario_description": (
            "Track A central banking consortiums blacklist O.N.E.'s External Trade Interface (ETI) for sovereign debt repudiation "
            "and non-compliance with global financial sanctions. Foreign fiat clearing accounts are frozen, while vulture funds "
            "obtain maritime seizure warrants against cargo ships carrying exported grain surplus and seek to nullify municipal "
            "mortgage debt jubilees."
        ),
    },
    10: {
        "engagement_id": "ENG-10",
        "engagement_name": "Ecological Carrying Capacity Shock & Inter-Basin Water War",
        "chapter_num": 10,
        "chapter_title": "Chapter X: Bioregional Watershed Federation & The Planetary Covenant",
        "red_agent_id": "RED-2",
        "target_article": "Article 10.1 — Bioregional Boundaries & Article 10.4 — Planetary Freedom of Movement",
        "scenario_description": (
            "A multi-year catastrophic megadrought plunges an adjacent mountain watershed into ecological code red. One hundred "
            "thousand displaced citizens migrate toward the downstream river basin. The downstream Valley Assembly fears exceeding "
            "its verified Ecological Carrying Capacity (ECC) and attempts to close entry corridors, triggering an acute constitutional "
            "crisis between planetary freedom of movement (Art. 10.4.1), mandatory federal rebalancing (Art. 10.4.4), and local "
            "bioregional carrying limits."
        ),
    },
}

INAUGURAL_SUITE = [CHAPTER_MATRIX[i] for i in [1, 2, 3, 4, 5]]


def list_matrix_status():
    """Prints a clear terminal overview of the 10-Chapter Matrix and generated artifacts."""
    print("\n" + "=" * 90)
    print("O-ASIS ADVERSARIAL STRESS-TEST MATRIX (10 CONSTITUTIONAL CHAPTERS)")
    print("=" * 90)
    print(f"{'Ch':<4} | {'Eng ID':<8} | {'Adversary':<7} | {'Status':<12} | {'Target Title':<45}")
    print("-" * 90)

    for ch_num in range(1, 11):
        item = CHAPTER_MATRIX[ch_num]
        eng_id = item["engagement_id"]
        adv = item["red_agent_id"]
        title = item["engagement_name"]

        # Check if transcript and patch exist
        eng_dir = None
        for d in TRANSCRIPTS_DIR.glob(f"{eng_id}_*"):
            if d.is_dir():
                eng_dir = d
                break

        patch_file = None
        for p in PATCHES_DIR.glob(f"PATCH_{eng_id}_*.diff"):
            if p.is_file():
                patch_file = p
                break

        if eng_dir and patch_file:
            status = "COMPLETED"
        elif eng_dir:
            status = "AUDITED"
        else:
            status = "PENDING"

        print(f"{ch_num:<4} | {eng_id:<8} | {adv:<7} | {status:<12} | {title[:45]:<45}")

    print("=" * 90)
    print("Usage to run a specific chapter: python3 oasis/oasis_engine.py --chapter <1..10>\n")


def main():
    parser = argparse.ArgumentParser(description="O-ASIS Multi-Agent Adversarial Simulation Engine")
    parser.add_argument("--chapter", type=int, choices=range(1, 11), help="Run dedicated stress-test for Chapter N (1..10)")
    parser.add_argument("--list-matrix", action="store_true", help="Display the 10-chapter stress-test matrix and status")
    parser.add_argument("--engagement", type=str, help="Engagement ID (e.g. ENG-01)")
    parser.add_argument("--name", type=str, default="Adversarial Stress Test", help="Engagement Name")
    parser.add_argument("--red", type=str, choices=["RED-1", "RED-2", "RED-3", "RED-4", "RED-5"], default="RED-1", help="Red Adversary ID")
    parser.add_argument("--article", type=str, default="Article 3.3", help="Target Article")
    parser.add_argument("--scenario", type=str, help="Custom scenario description")
    parser.add_argument("--chapters", type=str, help="Comma-separated or range of chapters to run (e.g. '5-10' or '5,6,7,8,9,10')")
    parser.add_argument("--parallel", type=int, default=1, help="Number of concurrent workers for parallel execution (default: 1)")
    parser.add_argument("--suite", type=str, choices=["inaugural", "full_matrix"], help="Run a predefined test suite")
    parser.add_argument("--oracle", type=str, help="Submit a civic inquiry to the Epistemic Oracle")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help=f"Model name (default: {DEFAULT_MODEL})")
    parser.add_argument("--thinking-budget", type=int, default=16384, help="Extended thinking budget tokens (default: 16384)")

    args = parser.parse_args()

    # List Matrix Mode
    if args.list_matrix:
        list_matrix_status()
        return

    engine = OASISEngine(model_name=args.model, thinking_budget=args.thinking_budget)

    # Oracle Mode
    if args.oracle:
        print(f"\n[*] INTERROGATING THE EPISTEMIC ORACLE:")
        print(f"[*] Query: {args.oracle}\n")
        response = engine.query_oracle(args.oracle)
        print("=" * 70)
        print(response)
        print("=" * 70)
        return

    # Chapter-by-Chapter Mode (--chapter 1..10)
    if args.chapter:
        item = CHAPTER_MATRIX[args.chapter]
        print(f"\n[*] SELECTED CHAPTER {args.chapter}: {item['chapter_title']}")
        engine.run_engagement(
            engagement_id=item["engagement_id"],
            engagement_name=item["engagement_name"],
            red_agent_id=item["red_agent_id"],
            target_article=item["target_article"],
            scenario_description=item["scenario_description"],
        )
        return

    # Multi-Chapter / Range Mode (--chapters 5-10 or 5,6,7,8,9,10)
    if args.chapters:
        target_nums = []
        for part in args.chapters.split(","):
            part = part.strip()
            if "-" in part:
                start, end = map(int, part.split("-"))
                target_nums.extend(range(start, end + 1))
            else:
                target_nums.append(int(part))

        suite_items = [CHAPTER_MATRIX[n] for n in target_nums if n in CHAPTER_MATRIX]
        print(f"\n[*] LAUNCHING ADVERSARIAL STRESS-TEST FOR CHAPTERS {target_nums} ({len(suite_items)} ENGAGEMENTS)...")
        results = []

        if args.parallel > 1:
            print(f"[*] Executing in PARALLEL mode with {args.parallel} concurrent workers...")
            with ThreadPoolExecutor(max_workers=args.parallel) as executor:
                future_to_eng = {
                    executor.submit(
                        engine.run_engagement,
                        engagement_id=eng["engagement_id"],
                        engagement_name=eng["engagement_name"],
                        red_agent_id=eng["red_agent_id"],
                        target_article=eng["target_article"],
                        scenario_description=eng["scenario_description"],
                    ): eng for eng in suite_items
                }
                for future in as_completed(future_to_eng):
                    eng = future_to_eng[future]
                    try:
                        res = future.result()
                        results.append(res)
                        print(f"\n[✓] Parallel Worker Completed: {eng['engagement_id']} ({eng['engagement_name']})")
                    except Exception as exc:
                        print(f"\n[!] Engagement {eng['engagement_id']} generated an exception: {exc}")
        else:
            for eng in suite_items:
                res = engine.run_engagement(
                    engagement_id=eng["engagement_id"],
                    engagement_name=eng["engagement_name"],
                    red_agent_id=eng["red_agent_id"],
                    target_article=eng["target_article"],
                    scenario_description=eng["scenario_description"],
                )
                results.append(res)
                time.sleep(3)

        print("\n" + "=" * 70)
        print(f"[+] COMPLETED {len(results)} ENGAGEMENTS.")
        for r in results:
            print(f" - {r['engagement_id']}: Severity = {r['severity']} | Transcript = {r['transcript_dir']}")
        print("=" * 70)
        return

    # Suite Mode
    if args.suite in ["inaugural", "full_matrix"]:
        suite_items = INAUGURAL_SUITE if args.suite == "inaugural" else list(CHAPTER_MATRIX.values())
        print(f"\n[*] LAUNCHING ADVERSARIAL STRESS-TEST SUITE ({len(suite_items)} ENGAGEMENTS)...")
        results = []

        if args.parallel > 1:
            print(f"[*] Executing in PARALLEL mode with {args.parallel} concurrent workers...")
            with ThreadPoolExecutor(max_workers=args.parallel) as executor:
                future_to_eng = {
                    executor.submit(
                        engine.run_engagement,
                        engagement_id=eng["engagement_id"],
                        engagement_name=eng["engagement_name"],
                        red_agent_id=eng["red_agent_id"],
                        target_article=eng["target_article"],
                        scenario_description=eng["scenario_description"],
                    ): eng for eng in suite_items
                }
                for future in as_completed(future_to_eng):
                    eng = future_to_eng[future]
                    try:
                        res = future.result()
                        results.append(res)
                        print(f"\n[✓] Parallel Worker Completed: {eng['engagement_id']} ({eng['engagement_name']})")
                    except Exception as exc:
                        print(f"\n[!] Engagement {eng['engagement_id']} generated an exception: {exc}")
        else:
            for eng in suite_items:
                res = engine.run_engagement(
                    engagement_id=eng["engagement_id"],
                    engagement_name=eng["engagement_name"],
                    red_agent_id=eng["red_agent_id"],
                    target_article=eng["target_article"],
                    scenario_description=eng["scenario_description"],
                )
                results.append(res)
                time.sleep(3)  # Rate pacing

        print("\n" + "=" * 70)
        print(f"[+] SUITE {args.suite.upper()} COMPLETED.")
        for r in results:
            print(f" - {r['engagement_id']}: Severity = {r['severity']} | Transcript = {r['transcript_dir']}")
        print("=" * 70)
        return

    # Single Engagement Mode by ID
    if args.engagement:
        # Match with CHAPTER_MATRIX if possible
        scenario = args.scenario
        name = args.name
        red_id = args.red
        target_art = args.article

        for item in CHAPTER_MATRIX.values():
            if item["engagement_id"] == args.engagement:
                name = item["engagement_name"]
                red_id = item["red_agent_id"]
                target_art = item["target_article"]
                if not scenario:
                    scenario = item["scenario_description"]
                break

        if not scenario:
            scenario = f"Stress-test sistemico condotto da {red_id} sull'articolo {target_art}."

        engine.run_engagement(
            engagement_id=args.engagement,
            engagement_name=name,
            red_agent_id=red_id,
            target_article=target_art,
            scenario_description=scenario,
        )
        return

    # Default: display help and matrix status
    list_matrix_status()


if __name__ == "__main__":
    main()

