# LearnPod: AI-Powered Document-to-Podcast Pipeline 🎧

**LearnPod** is a fully local, zero-cost AI application that converts your uploaded documents into beautiful podcast-style audio conversations. Upload a PDF, Word document, or e-book, and LearnPod will automatically generate an engaging dialogue and vocalize it for you to listen to.

## Key Features
* 📄 **Document Ingestion:** Works with PDFs, DOCX files, and EPUBs.
* 🧠 **Local LLM integration:** Powered by [Ollama](https://ollama.com/) for lightning-fast, privacy-first script generation. No external API keys needed!
* 🗣️ **Text-to-Speech:** Uses high-quality Edge-TTS for clear and realistic voices.
* 🔗 **FastAPI Backend:** A lightweight, high-performance Python API that connects everything smoothly.
* 🎨 **Interactive User Interface:** A sleek dashboard built with React and styled beautifully to allow you to upload files, generate podcasts, and listen to the final audio right in the browser.

## Technologies Used
* **Frontend:** React (Vite-based), Tailwind CSS
* **Backend:** Python, FastAPI, Uvicorn
* **AI/LLM:** Ollama (Model: `gemma3:4b`)
* **Audio/TTS:** Edge-TTS (Voices: `en-US-GuyNeural` for Alex, `en-US-JennyNeural` for Jordan), Pydub
* **Parsing:** PyMuPDF, python-docx, EbookLib

## Getting Started

### Prerequisites
1. Installed **Python 3.10+** (or virtual environment).
2. Installed **Node.js** to run the frontend UI.
3. Installed **Ollama** running locally on your machine.
   * Make sure to have the correct models pulled via Ollama (e.g., `ollama pull llama3` or whatever model you prefer).

### 1. Start the Backend

Open a terminal in the root directory and install Python dependencies:

```bash
# Set up virtual environment and install dependencies
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Run the backend server:

```bash
python server.py
# Or run uvicorn: uvicorn server:app --reload
```

### 2. Start the Frontend

Open another terminal and navigate into the `ui-react` directory:

```bash
cd ui-react

# Install packages
npm install

# Start the development server
npm run dev
```

Browse to your `localhost` address (usually `http://localhost:5173`) to view and interact with LearnPod!


<img width="1917" height="941" alt="image" src="https://github.com/user-attachments/assets/86ef11d2-8369-4f71-b20b-7f6ff5756af2" />
<img width="1917" height="941" alt="image" src="https://github.com/user-attachments/assets/00114e74-c0f3-4007-9815-bcb55a037520" />
<img width="1912" height="937" alt="image" src="https://github.com/user-attachments/assets/32afd3e2-36a1-4300-8f51-c1e473e08579" />
<img width="1910" height="941" alt="image" src="https://github.com/user-attachments/assets/a637c2b0-f047-4740-8b70-4560a25062a2" />


