"""
LearnPod — Text Chunker

Splits extracted text into LLM-friendly chunks using:
  - nltk  (sentence tokenisation)
  - tiktoken (token counting)

Each chunk stays within *max_tokens* and successive chunks overlap by
*overlap_sentences* sentences so the LLM retains context across boundaries.
"""

import logging

import nltk
import tiktoken

logger = logging.getLogger(__name__)

# Ensure the punkt tokeniser data is available.
try:
    nltk.data.find("tokenizers/punkt_tab")
except LookupError:
    nltk.download("punkt_tab", quiet=True)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def chunk_text(
    text: str,
    max_tokens: int = 800,
    overlap_sentences: int = 2,
    model_name: str = "cl100k_base",
) -> list[str]:
    """Split *text* into token-bounded chunks with sentence overlap.

    Args:
        text: The full document text.
        max_tokens: Maximum number of tokens per chunk.
        overlap_sentences: Number of trailing sentences to repeat at the
            start of each new chunk for context continuity.
        model_name: The tiktoken encoding to use for counting tokens.

    Returns:
        An ordered list of text chunks.
    """
    encoder = tiktoken.get_encoding(model_name)
    sentences = nltk.sent_tokenize(text)

    if not sentences:
        return []

    chunks: list[str] = []
    current_sentences: list[str] = []
    current_tokens = 0

    for sentence in sentences:
        sentence_tokens = len(encoder.encode(sentence))

        # If a single sentence exceeds the budget, emit it as its own chunk.
        if sentence_tokens > max_tokens:
            if current_sentences:
                chunks.append(" ".join(current_sentences))
                current_sentences = []
                current_tokens = 0
            chunks.append(sentence)
            continue

        # Would adding this sentence exceed the token limit?
        if current_tokens + sentence_tokens > max_tokens:
            chunks.append(" ".join(current_sentences))

            # Carry over the overlap tail into the next chunk.
            overlap = current_sentences[-overlap_sentences:] if overlap_sentences else []
            current_sentences = list(overlap)
            current_tokens = sum(len(encoder.encode(s)) for s in current_sentences)

        current_sentences.append(sentence)
        current_tokens += sentence_tokens

    # Don't forget the last chunk.
    if current_sentences:
        chunks.append(" ".join(current_sentences))

    logger.info(
        "Split text (%d chars) into %d chunks (max_tokens=%d, overlap=%d)",
        len(text),
        len(chunks),
        max_tokens,
        overlap_sentences,
    )
    return chunks
