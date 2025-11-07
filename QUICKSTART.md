# Quick Start Guide

## ✅ Setup Complete!

Both backend and frontend dependencies are installed. Follow these steps to run the system:

## 1. Configure OpenAI API Key

Create a `.env` file in the backend directory:

```bash
cd backend
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

**Get your OpenAI API key:** https://platform.openai.com/api-keys

## 2. Start the Backend

Open a terminal in the `backend` directory:

```bash
cd backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 3. Start the Frontend

Open a NEW terminal in the `frontend` directory:

```bash
cd frontend
npm run dev
```

You should see:
```
Local:        http://localhost:3000
```

## 4. Test the System

1. Open http://localhost:3000 in your browser
2. Click "Load Example" to load demo code with intentional issues
3. Click "Start Review"
4. Watch the agents work in real-time!
5. Review the comprehensive analysis

## Expected Results

The example code has:
- **Security Issues**: SQL injection vulnerability
- **Performance Issues**: N+1 query problem
- **Style Issues**: Poor error handling, no type hints

All three agents will identify and suggest fixes for these issues.

## Troubleshooting

**Backend won't start:**
- Make sure you activated the virtual environment: `source venv/bin/activate`
- Check that .env file exists with your OpenAI API key
- Verify OpenAI API key is valid

**Frontend won't connect:**
- Ensure backend is running on http://localhost:8000
- Check browser console for errors

**"Failed to connect" error:**
- Make sure both servers are running
- Backend should be on port 8000
- Frontend should be on port 3000

## API Costs

Each review makes 3 OpenAI API calls (one per agent).
- Using GPT-4: ~$0.03-0.06 per review
- For testing, you can edit `backend/agents/base_agent.py` and change `gpt-4-turbo-preview` to `gpt-3.5-turbo` for cheaper reviews (~$0.001 per review)

## Next Steps

- Try your own code!
- Experiment with different languages
- Add context to help agents understand your code better
- Check out the architecture in README.md
- Customize agent prompts in `backend/agents/`
