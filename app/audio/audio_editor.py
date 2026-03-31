"""
LearnPod — Audio Editor

Merges individual WAV audio chunks into a single MP3 podcast episode
using pydub (backed by ffmpeg).

Features:
  • Configurable silence gap between dialogue lines
  • Optional intro / outro music
  • MP3 export at 192 kbps
"""

import os
import logging

from pydub import AudioSegment

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

MP3_BITRATE = "192k"
DEFAULT_PAUSE_MS = 400  # milliseconds of silence between lines


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def merge_audio(
    chunk_paths: list[str],
    output_path: str,
    pause_ms: int = DEFAULT_PAUSE_MS,
    intro_path: str | None = None,
    outro_path: str | None = None,
) -> str:
    """Concatenate WAV chunks into a single MP3 file.

    Args:
        chunk_paths: Ordered list of WAV file paths.
        output_path: Destination path for the final MP3 file.
        pause_ms: Milliseconds of silence to insert between each chunk.
        intro_path: Optional path to an intro music file (MP3 or WAV).
        outro_path: Optional path to an outro music file (MP3 or WAV).

    Returns:
        The absolute path to the exported MP3 file.
    """
    if not chunk_paths:
        raise ValueError("No audio chunks provided — nothing to merge.")

    silence = AudioSegment.silent(duration=pause_ms)

    # Start with intro if provided.
    if intro_path and os.path.isfile(intro_path):
        logger.info("Adding intro from %s", intro_path)
        podcast = AudioSegment.from_file(intro_path) + silence
    else:
        podcast = AudioSegment.empty()

    # Concatenate dialogue chunks with pauses.
    total = len(chunk_paths)
    for idx, path in enumerate(chunk_paths):
        logger.info("[%d/%d] Appending %s", idx + 1, total, os.path.basename(path))
        chunk = AudioSegment.from_file(path)
        podcast += chunk

        # Add pause after every chunk except the last.
        if idx < total - 1:
            podcast += silence

    # Append outro if provided.
    if outro_path and os.path.isfile(outro_path):
        logger.info("Adding outro from %s", outro_path)
        podcast += silence + AudioSegment.from_file(outro_path)

    # Ensure output directory exists.
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    # Export to MP3.
    logger.info("Exporting podcast to %s (%s)", output_path, MP3_BITRATE)
    podcast.export(output_path, format="mp3", bitrate=MP3_BITRATE)
    logger.info(
        "Podcast exported — duration %.1f s, file size %d KB",
        podcast.duration_seconds,
        os.path.getsize(output_path) // 1024,
    )
    return os.path.abspath(output_path)
