"""
LearnPod — Streamlit UI

A sleek, modern interface for generating podcast episodes from documents.

Run:
    streamlit run ui/streamlit_app.py
"""

import os
import sys
import tempfile
import logging

import streamlit as st

# Ensure the project root is on sys.path so ``app.*`` imports work
# regardless of where Streamlit is launched from.
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from app.pipeline import run_learnpod_pipeline  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(name)-30s  %(levelname)-7s  %(message)s",
)

# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="LearnPod — Document to Podcast",
    page_icon="🎙️",
    layout="centered",
)

# ---------------------------------------------------------------------------
# Custom CSS for a modern dark-themed look
# ---------------------------------------------------------------------------
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    /* --- Global --- */
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* --- Header --- */
    .hero {
        text-align: center;
        padding: 2rem 0 1rem;
    }
    .hero h1 {
        font-size: 2.8rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.3rem;
    }
    .hero p {
        font-size: 1.05rem;
        opacity: 0.7;
    }

    /* --- Card --- */
    .card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 2rem;
        margin: 1.5rem 0;
    }

    /* --- Buttons --- */
    .stButton > button {
        background: linear-gradient(135deg, #6366f1, #a855f7) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 0.75rem 2rem !important;
        font-weight: 600 !important;
        font-size: 1rem !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease !important;
    }
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
    }

    /* --- Footer --- */
    .footer {
        text-align: center;
        padding: 2rem 0 1rem;
        opacity: 0.4;
        font-size: 0.85rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Hero header
# ---------------------------------------------------------------------------
st.markdown(
    """
    <div class="hero">
        <h1>🎙️ LearnPod</h1>
        <p>Transform your documents into engaging podcast conversations — 100 % local & free.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Upload section
# ---------------------------------------------------------------------------
st.markdown('<div class="card">', unsafe_allow_html=True)
st.subheader("📄  Upload a Document")
uploaded_file = st.file_uploader(
    "Drag & drop or browse",
    type=["pdf", "docx", "epub"],
    label_visibility="collapsed",
)

if uploaded_file:
    st.success(f"**{uploaded_file.name}** ({uploaded_file.size / 1024:.0f} KB)")

st.markdown("</div>", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Settings (collapsed by default)
# ---------------------------------------------------------------------------
with st.expander("⚙️  Advanced Settings"):
    max_tokens = st.slider("Max tokens per chunk", 400, 4000, 2000, 100)
    pause_ms = st.slider("Pause between lines (ms)", 100, 1000, 400, 50)

    intro_path = st.text_input(
        "Intro music path (optional)",
        placeholder="assets/intro.mp3",
    )
    outro_path = st.text_input(
        "Outro music path (optional)",
        placeholder="assets/outro.mp3",
    )

# ---------------------------------------------------------------------------
# Generate
# ---------------------------------------------------------------------------
generate_clicked = st.button(
    "🚀  Generate Podcast",
    disabled=uploaded_file is None,
    use_container_width=True,
)

if generate_clicked and uploaded_file is not None:
    # Write uploaded file to a temp location so the pipeline can read it.
    suffix = os.path.splitext(uploaded_file.name)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded_file.getbuffer())
        tmp_path = tmp.name

    output_dir = os.path.join(_PROJECT_ROOT, "output")

    status_container = st.empty()
    progress_bar = st.progress(0, text="Starting …")

    # ---- stage weights for a smoother progress bar ----
    STAGE_WEIGHTS = {
        "extract": 0.05,
        "chunk": 0.05,
        "llm": 0.50,
        "tts": 0.30,
        "merge": 0.10,
    }
    _stage_starts = {}
    _cum = 0.0
    for s, w in STAGE_WEIGHTS.items():
        _stage_starts[s] = _cum
        _cum += w

    def _progress_cb(stage: str, detail: str):
        base = _stage_starts.get(stage, 0.95)
        progress_bar.progress(
            min(base + 0.01, 1.0),
            text=f"**{stage.upper()}** — {detail}",
        )

    try:
        final_mp3 = run_learnpod_pipeline(
            doc_path=tmp_path,
            output_dir=output_dir,
            max_tokens=max_tokens,
            pause_ms=pause_ms,
            intro_path=intro_path or None,
            outro_path=outro_path or None,
            progress_callback=_progress_cb,
        )
        progress_bar.progress(1.0, text="✅ Done!")

        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.subheader("🎧  Your Podcast Is Ready")

        # Playback
        with open(final_mp3, "rb") as f:
            audio_bytes = f.read()
        st.audio(audio_bytes, format="audio/mp3")

        # Download
        st.download_button(
            label="⬇️  Download MP3",
            data=audio_bytes,
            file_name=os.path.basename(final_mp3),
            mime="audio/mpeg",
            use_container_width=True,
        )
        st.markdown("</div>", unsafe_allow_html=True)

    except Exception as exc:
        progress_bar.empty()
        st.error(f"Pipeline failed: {exc}")
        logging.exception("Pipeline error")

    finally:
        # Clean up temp file.
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
st.markdown(
    '<div class="footer">LearnPod · 100 % local · zero cost · powered by Ollama + Edge TTS</div>',
    unsafe_allow_html=True,
)
