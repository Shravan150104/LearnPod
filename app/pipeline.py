"""
LearnPod — Pipeline Orchestrator

Runs the full document-to-podcast pipeline:

  1. Extract text from document
  2. Chunk text into LLM-friendly pieces
  3. LLM preprocessing (clean messy text)
  4. LLM script generation (Alex / Jordan dialogue)
  5. Text-to-Speech (per-line WAV files)
  6. Merge audio → final MP3

Usage:
    from app.pipeline import run_learnpod_pipeline
    mp3_path = run_learnpod_pipeline("assets/my_document.pdf")
"""

import os
import time
import logging

from app.extractor.extractor import extract_text
from app.chunker.chunker import chunk_text
from app.llm.script_generator import generate_full_script
from app.tts.tts_generator import parse_dialogue, generate_audio_chunks
from app.audio.audio_editor import merge_audio

logger = logging.getLogger(__name__)


def run_learnpod_pipeline(
    doc_path: str,
    output_dir: str = "output",
    max_tokens: int = 2000,
    pause_ms: int = 400,
    intro_path: str | None = None,
    outro_path: str | None = None,
    progress_callback=None,
) -> str:
    """Execute the full LearnPod pipeline.

    Args:
        doc_path: Path to the input document (PDF, DOCX, EPUB).
        output_dir: Base directory for all output artefacts.
        max_tokens: Token budget per chunk sent to the LLM.
        pause_ms: Silence (ms) between dialogue lines in the podcast.
        intro_path: Optional intro music file.
        outro_path: Optional outro music file.
        progress_callback: Optional callable(stage: str, detail: str)
            invoked to report progress to the UI.

    Returns:
        Absolute path to the final MP3 podcast episode.
    """
    start_time = time.time()
    base_name = os.path.splitext(os.path.basename(doc_path))[0]
    chunks_dir = os.path.join(output_dir, "audio_chunks")
    mp3_path = os.path.join(output_dir, f"learnpod_{base_name}_episode.mp3")

    def _progress(stage: str, detail: str = ""):
        logger.info("[%s] %s", stage, detail)
        if progress_callback:
            progress_callback(stage, detail)

    # ------------------------------------------------------------------
    # Stage 1: Extract text
    # ------------------------------------------------------------------
    _progress("extract", f"Reading {doc_path} …")
    raw_text = extract_text(doc_path)
    _progress("extract", f"Extracted {len(raw_text):,} characters")

    # ------------------------------------------------------------------
    # Stage 2: Chunk text
    # ------------------------------------------------------------------
    _progress("chunk", "Splitting text into chunks …")
    chunks = chunk_text(raw_text, max_tokens=max_tokens)
    _progress("chunk", f"Created {len(chunks)} chunks")

    # ------------------------------------------------------------------
    # Stage 3 & 4: LLM preprocessing + script generation
    # ------------------------------------------------------------------
    _progress("llm", f"Generating podcast script from {len(chunks)} chunks …")

    def _llm_progress(current, total):
        _progress("llm", f"Chunk {current}/{total} processed")

    full_script = generate_full_script(chunks, progress_callback=_llm_progress)
    _progress("llm", f"Script complete — {len(full_script):,} characters")

    # Save script to disk for reference / debugging.
    script_path = os.path.join(output_dir, f"learnpod_{base_name}_script.txt")
    os.makedirs(output_dir, exist_ok=True)
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(full_script)
    _progress("llm", f"Script saved to {script_path}")

    # ------------------------------------------------------------------
    # Stage 5: TTS
    # ------------------------------------------------------------------
    dialogue = parse_dialogue(full_script)
    _progress("tts", f"Generating audio for {len(dialogue)} dialogue lines …")

    def _tts_progress(current, total):
        _progress("tts", f"Line {current}/{total} synthesised")

    wav_paths = generate_audio_chunks(
        dialogue, chunks_dir, progress_callback=_tts_progress
    )
    _progress("tts", f"Generated {len(wav_paths)} audio chunks")

    # ------------------------------------------------------------------
    # Stage 6: Merge audio → MP3
    # ------------------------------------------------------------------
    _progress("merge", "Merging audio and exporting MP3 …")
    final_path = merge_audio(
        wav_paths,
        mp3_path,
        pause_ms=pause_ms,
        intro_path=intro_path,
        outro_path=outro_path,
    )

    elapsed = time.time() - start_time
    _progress("done", f"Podcast ready — {final_path} (took {elapsed:.1f}s)")

    return final_path
