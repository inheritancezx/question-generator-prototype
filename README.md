
# Question Generator Prototype

This is a prototype web app that generates creative questions about any theme you enter, powered by a local LLM (Ollama) and Next.js.

## ⚡ Quick Start

1. **Clone the repo and install dependencies:**
	```powershell
	git clone <your-repo-url>
	cd question-generator
	npm install
	```

2. **Install and start Ollama:**
	- Download Ollama: https://ollama.com
	- Start the Ollama service (default: http://localhost:11434)

3. **Pull a model (gemma3:4b):**
	```powershell
	ollama pull gemma3:4b
	```
	- You can use any supported model (e.g., llama3:instruct, qwen2.5:7b-instruct). Adjust the model name as needed.

4. **Configure the model:**
	- To use a the model, set the environment variable:
	  ```powershell
	  cp .env.local.example .env.local
	  ```

5. **Run the app:**
	```powershell
	npm run dev
	```
	- Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧑‍💻 How It Works (Flow)

1. **User enters a theme** in the web UI and clicks "Generate".
2. The frontend sends a POST request to `/api/generate-questions` with the theme.
3. The Next.js API route builds a prompt and sends it to the Ollama model running locally.
4. Ollama generates a list of questions and returns them to the API.
5. The API parses and cleans up the output, then sends the questions back to the frontend.
6. The frontend displays the questions to the user.

### Why use Next.js API routes?
- **Security:** Keeps your Ollama host/model details and any secrets on the server, not in the browser.
- **Browser compatibility:** Browsers can't call localhost:11434 directly (CORS, network issues), but they can call your Next.js API.
- **Custom logic:** Lets you validate input, handle errors, and format responses for the frontend.
- **Flexibility:** Makes it easy to swap models, add authentication, or change backend logic later.

## ⚠️ Prototype Notice
This project is a prototype for experimenting with local LLM-powered question generation. It is not production-ready. Expect rough edges, and use at your own risk!

## 🛠️ Troubleshooting
- **Model not found:**
  - Error: `model 'llama3:instruct' not found`
  - Solution: Pull the model you want (e.g., `ollama pull gemma3:4b`) and set `OLLAMA_MODEL` if needed.
- **Timeouts:**
  - Error: `HeadersTimeoutError` or `Request timed out...`
  - Solution: Use a smaller/faster model, or pre-load the model by running a dummy prompt in Ollama first.
- **Permission errors on .next folder:**
  - Solution: Run the project from a local drive (not a network share) or ensure the `.next` directory is writable.