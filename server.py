"""
LearnPod — FastAPI Server

Provides REST endpoints for the React frontend to:
  1. Upload documents
  2. Run the AI podcast pipeline
  3. Poll job status / progress
  4. List & download completed episodes
"""

import os
import uuid
import time
import logging
import threading
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.pipeline import run_learnpod_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="LearnPod API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory state (sufficient for single-user local app)
# ---------------------------------------------------------------------------
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("output")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Jobs dict: job_id -> { status, stage, detail, doc_path, mp3_path, script_path, error }
jobs: dict[str, dict] = {}


def _scan_existing_episodes():
    """Scan output dir on startup to restore jobs from previously generated files."""
    import re
    mp3_files = sorted(OUTPUT_DIR.glob("learnpod_*_episode.mp3"))
    for mp3 in mp3_files:
        # Extract an ID from the filename: learnpod_{id}_{name}_episode.mp3
        name_part = mp3.stem.replace("learnpod_", "").replace("_episode", "")
        # Try to find matching script
        script_candidates = list(OUTPUT_DIR.glob(f"learnpod_{name_part}_script.txt"))
        # Use the first 8 chars as job_id (or full name_part if shorter)
        # Try to split on first underscore: id_rest
        parts = name_part.split("_", 1)
        job_id = parts[0] if len(parts) > 1 else name_part
        display_name = parts[1] if len(parts) > 1 else name_part

        if job_id not in jobs:
            jobs[job_id] = {
                "status": "done",
                "stage": "done",
                "detail": "Podcast episode ready!",
                "doc_path": "",
                "mp3_path": str(mp3.resolve()),
                "script_path": str(script_candidates[0].resolve()) if script_candidates else None,
                "error": None,
                "filename": display_name.replace("_", " "),
                "filesize": mp3.stat().st_size,
                "created_at": time.strftime("%Y-%m-%d %H:%M", time.localtime(mp3.stat().st_mtime)),
            }
            logger.info("Restored episode: %s → %s", job_id, mp3.name)

_scan_existing_episodes()
logger.info("Found %d existing episodes on startup", len(jobs))


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class JobStatus(BaseModel):
    job_id: str
    status: str          # "queued" | "running" | "done" | "error"
    stage: str           # current pipeline stage
    detail: str          # human-readable detail
    mp3_path: str | None = None
    script_path: str | None = None
    error: str | None = None


class Episode(BaseModel):
    id: str
    title: str
    date: str
    duration: str
    status: str
    mp3_url: str | None = None
    script_url: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document and return a job_id for pipeline tracking."""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx", ".epub", ".txt"):
        raise HTTPException(400, f"Unsupported file type: {ext}")

    job_id = str(uuid.uuid4())[:8]
    save_path = UPLOAD_DIR / f"{job_id}_{file.filename}"

    content = await file.read()
    save_path.write_bytes(content)

    jobs[job_id] = {
        "status": "queued",
        "stage": "upload",
        "detail": f"File '{file.filename}' uploaded ({len(content) / 1024:.1f} KB)",
        "doc_path": str(save_path),
        "mp3_path": None,
        "script_path": None,
        "error": None,
        "filename": file.filename,
        "filesize": len(content),
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
    }

    return {"job_id": job_id, "filename": file.filename, "size": len(content)}


@app.post("/api/generate/{job_id}")
async def start_pipeline(job_id: str):
    """Start the podcast generation pipeline in a background thread."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")

    job = jobs[job_id]
    if job["status"] == "running":
        raise HTTPException(400, "Pipeline already running")

    def run_pipeline():
        try:
            job["status"] = "running"
            job["stage"] = "extract"
            job["detail"] = "Starting pipeline..."

            def progress_callback(stage: str, detail: str):
                job["stage"] = stage
                job["detail"] = detail

            mp3_path = run_learnpod_pipeline(
                doc_path=job["doc_path"],
                output_dir=str(OUTPUT_DIR),
                progress_callback=progress_callback,
            )

            # Find the script file matching this specific document
            base_name = os.path.splitext(os.path.basename(job["doc_path"]))[0]
            script_path = None
            for f in OUTPUT_DIR.iterdir():
                if f.suffix == ".txt" and "script" in f.name and base_name in f.name:
                    script_path = str(f.resolve())
                    break

            job["status"] = "done"
            job["stage"] = "done"
            job["detail"] = "Podcast episode ready!"
            job["mp3_path"] = os.path.abspath(mp3_path)
            job["script_path"] = script_path

        except Exception as e:
            logger.exception("Pipeline failed for job %s", job_id)
            job["status"] = "error"
            job["stage"] = "error"
            job["detail"] = str(e)
            job["error"] = str(e)

    thread = threading.Thread(target=run_pipeline, daemon=True)
    thread.start()

    return {"job_id": job_id, "status": "running"}


@app.get("/api/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    """Poll the current status of a pipeline job."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")

    job = jobs[job_id]
    return JobStatus(
        job_id=job_id,
        status=job["status"],
        stage=job["stage"],
        detail=job["detail"],
        mp3_path=f"/api/download/{job_id}/audio" if job["mp3_path"] else None,
        script_path=f"/api/download/{job_id}/script" if job["script_path"] else None,
        error=job.get("error"),
    )


@app.get("/api/episodes")
async def list_episodes():
    """List all completed jobs as episodes."""
    episodes = []
    for jid, job in jobs.items():
        if job["status"] == "done":
            episodes.append(Episode(
                id=jid,
                title=job.get("filename", "Untitled"),
                date=job.get("created_at", ""),
                duration="--",
                status="completed",
                mp3_url=f"/api/download/{jid}/audio",
                script_url=f"/api/download/{jid}/script",
            ))
    return episodes


@app.get("/api/download/{job_id}/audio")
async def download_audio(job_id: str):
    """Download the generated MP3 for a completed job."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    mp3 = jobs[job_id].get("mp3_path")
    if not mp3 or not os.path.isfile(mp3):
        raise HTTPException(404, "Audio file not found")
    return FileResponse(mp3, media_type="audio/mpeg", filename=os.path.basename(mp3))


@app.get("/api/download/{job_id}/script")
async def download_script(job_id: str):
    """Download the generated script for a completed job."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    script = jobs[job_id].get("script_path")
    if not script or not os.path.isfile(script):
        raise HTTPException(404, "Script file not found")
    return FileResponse(script, media_type="text/plain", filename=os.path.basename(script))


@app.get("/api/script/{job_id}")
async def get_script_text(job_id: str):
    """Return the generated script text as JSON for inline rendering."""
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    script_file = jobs[job_id].get("script_path")
    if not script_file or not os.path.isfile(script_file):
        raise HTTPException(404, "Script file not found")
    with open(script_file, "r", encoding="utf-8") as f:
        text = f.read()
    return {"job_id": job_id, "script": text}
