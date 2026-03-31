"""
LearnPod — TTS Audio Generator

Uses Edge TTS to synthesise dialogue
lines as individual MP3 files with speaker-specific voices.

Speaker mapping:
  Alex   → en-US-GuyNeural  (energetic male)
  Jordan → en-US-JennyNeural (calm female)
"""

import os
import re
import logging
import asyncio

import edge_tts

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SPEAKER_MAP: dict[str, str] = {
    "Alex": "en-US-GuyNeural",
    "Jordan": "en-US-JennyNeural",
}

DEFAULT_SPEAKER = "en-US-GuyNeural"

# Pre-compiled regex for parsing dialogue lines.
_DIALOGUE_RE = re.compile(r"^(Alex|Jordan)\s*:\s*(.+)", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_dialogue(script: str) -> list[tuple[str, str]]:
    """Parse a podcast script into (speaker, text) pairs.

    Only lines matching ``Speaker: text`` are included; everything else
    (stage directions, blank lines, etc.) is silently skipped.
    """
    dialogue: list[tuple[str, str]] = []
    for line in script.splitlines():
        line = line.strip()
        match = _DIALOGUE_RE.match(line)
        if match:
            speaker = match.group(1).capitalize()
            text = match.group(2).strip()
            if text:
                dialogue.append((speaker, text))
    logger.info("Parsed %d dialogue lines from script", len(dialogue))
    return dialogue


async def _generate_one(sem: asyncio.Semaphore, idx: int, speaker: str, text: str, output_dir: str, total: int) -> str:
    """Generate a single MP3 file with concurrency limiting."""
    async with sem:
        filename = f"{idx:04d}_{speaker}.mp3"
        filepath = os.path.join(output_dir, filename)
        voice = SPEAKER_MAP.get(speaker, DEFAULT_SPEAKER)

        logger.info(
            "[%d/%d] TTS → %s (voice=%s): %.60s…",
            idx + 1, total, filename, voice, text,
        )

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(filepath)
        return filepath


# Max concurrent edge-tts requests (keep reasonable to avoid throttling)
_MAX_CONCURRENT = 10


async def _generate_all(dialogue: list[tuple[str, str]], output_dir: str, progress_callback) -> list[str]:
    total = len(dialogue)
    sem = asyncio.Semaphore(_MAX_CONCURRENT)

    tasks = [
        _generate_one(sem, idx, speaker, text, output_dir, total)
        for idx, (speaker, text) in enumerate(dialogue)
    ]

    # Run all TTS calls concurrently and collect results in order
    audio_paths = await asyncio.gather(*tasks)

    if progress_callback:
        progress_callback(total, total)

    return list(audio_paths)


def generate_audio_chunks(
    dialogue: list[tuple[str, str]],
    output_dir: str,
    progress_callback=None,
) -> list[str]:
    """Generate one MP3 file per dialogue line.

    Args:
        dialogue: List of (speaker, text) tuples from :func:`parse_dialogue`.
        output_dir: Directory where MP3 files will be written.
        progress_callback: Optional callable(current, total) for UI progress.

    Returns:
        Ordered list of absolute paths to the generated MP3 files.
    """
    os.makedirs(output_dir, exist_ok=True)
    logger.info("Generating audio with edge-tts ...")
    
    # Run the asyncio loop to generate all chunks
    audio_paths = asyncio.run(_generate_all(dialogue, output_dir, progress_callback))

    logger.info("Generated %d audio chunks in %s", len(audio_paths), output_dir)
    return audio_paths
