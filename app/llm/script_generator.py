"""
LearnPod — LLM Script Generator

Uses Ollama (llama3) to:
  Phase 1  – Clean / preprocess messy extracted text.
  Phase 2  – Convert cleaned text into a podcast-style dialogue
             between Alex (curious, energetic) and Jordan (calm, informative).
"""

import logging
import ollama

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------
MODEL_NAME = "gemma3:4b"

# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

PREPROCESSING_SYSTEM_PROMPT = """\
You are a world-class text pre-processor.

Input will be messy text extracted from a PDF. The text may include:
  • formatting artifacts
  • LaTeX equations
  • broken new lines
  • irrelevant formatting

Your job is to:
  • Clean the text
  • Remove useless artifacts
  • Rewrite it into clear, readable paragraphs

IMPORTANT RULES:
  • DO NOT summarize.
  • DO NOT remove important context.
  • Only clean and rewrite.

Output must be clean readable text ready for a podcast script writer.
"""

SCRIPT_GENERATION_SYSTEM_PROMPT = """\
You are a professional podcast script writer.

Convert the provided clean text into an engaging podcast conversation
between two hosts.

Hosts:
  Alex  – curious, energetic, asks questions, reacts to explanations
  Jordan – calm, knowledgeable, explains topics clearly, occasionally witty

Rules:
  • Use a conversational tone.
  • Simplify complex concepts with analogies.
  • Avoid quoting the source text directly.
  • Break explanations into back-and-forth dialogue.
  • Keep the conversation feeling natural and dynamic.

Output format — every line MUST begin with the speaker name followed by a colon:

Alex: …
Jordan: …
Alex: …
Jordan: …
"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def preprocess_chunk(chunk: str) -> str:
    """Send a raw text chunk to the LLM for cleaning.

    Returns the cleaned text.
    """
    logger.info("Preprocessing chunk (%d chars) …", len(chunk))
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": PREPROCESSING_SYSTEM_PROMPT},
            {"role": "user", "content": chunk},
        ],
    )
    cleaned = response["message"]["content"]
    logger.info("Preprocessed → %d chars", len(cleaned))
    return cleaned


def generate_script(cleaned_chunk: str) -> str:
    """Convert a cleaned text chunk into podcast dialogue.

    Returns dialogue in ``Alex: … / Jordan: …`` format.
    """
    logger.info("Generating script for chunk (%d chars) …", len(cleaned_chunk))
    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SCRIPT_GENERATION_SYSTEM_PROMPT},
            {"role": "user", "content": cleaned_chunk},
        ],
    )
    script = response["message"]["content"]
    logger.info("Generated script → %d chars", len(script))
    return script


def generate_full_script(chunks: list[str], progress_callback=None) -> str:
    """Run the full two-phase pipeline on every chunk and return the
    concatenated podcast script.

    Args:
        chunks: Ordered list of raw text chunks.
        progress_callback: Optional callable(current, total) for UI progress.

    Returns:
        The complete podcast script as a single string.
    """
    total = len(chunks)
    script_parts: list[str] = []

    for idx, chunk in enumerate(chunks, start=1):
        logger.info("Processing chunk %d / %d", idx, total)

        # Generate dialogue directly (preprocessing skipped for speed)
        dialogue = generate_script(chunk)
        script_parts.append(dialogue)

        if progress_callback:
            progress_callback(idx, total)

    full_script = "\n\n".join(script_parts)
    logger.info("Full script generated — %d chars total", len(full_script))
    return full_script
