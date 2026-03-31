"""
LearnPod — Document Text Extractor

Extracts raw text from PDF, DOCX, and EPUB files using:
  - PyMuPDF  (PDF)
  - python-docx (DOCX)
  - ebooklib + BeautifulSoup (EPUB)
"""

import os
import logging

import fitz  # PyMuPDF
from docx import Document
from ebooklib import epub
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_text(file_path: str) -> str:
    """Extract text from a document file (PDF, DOCX, or EPUB).

    Args:
        file_path: Absolute or relative path to the document.

    Returns:
        The full extracted text as a single string.

    Raises:
        FileNotFoundError: If *file_path* does not exist.
        ValueError: If the file extension is not supported.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    extractors = {
        ".pdf": _extract_pdf,
        ".docx": _extract_docx,
        ".epub": _extract_epub,
    }

    extractor = extractors.get(ext)
    if extractor is None:
        raise ValueError(
            f"Unsupported file type '{ext}'. Supported: {', '.join(extractors)}"
        )

    logger.info("Extracting text from %s (%s)", file_path, ext)
    text = extractor(file_path)
    logger.info("Extracted %d characters from %s", len(text), file_path)
    return text


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _extract_pdf(file_path: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    text_parts: list[str] = []
    with fitz.open(file_path) as doc:
        for page in doc:
            page_text = page.get_text()
            if page_text.strip():
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _extract_docx(file_path: str) -> str:
    """Extract text from a DOCX using python-docx."""
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def _extract_epub(file_path: str) -> str:
    """Extract text from an EPUB using ebooklib + BeautifulSoup."""
    book = epub.read_epub(file_path, options={"ignore_ncx": True})
    text_parts: list[str] = []

    for item in book.get_items_of_type(9):  # ITEM_DOCUMENT
        soup = BeautifulSoup(item.get_content(), "html.parser")
        body = soup.find("body")
        if body:
            text = body.get_text(separator="\n", strip=True)
            if text:
                text_parts.append(text)

    return "\n\n".join(text_parts)
