# AskMedicine - Evidence-Based Medical Research Assistant

AskMedicine is a web application that provides evidence-based answers to medical questions using AI trained on medical research. The application uses a Flask backend with DeepSeek AI for generating answers, and a React frontend for a modern user interface.

## Project Structure

```
final_askmedicine_startup/
├── backend/
│   ├── medinquire.py         # Core functionality for AI response generation
│   └── medinquire_web.py     # Flask API server
└── frontend/
    ├── public/
    │   └── images/
    │       └── logo.svg      # AskMedicine logo
    ├── src/
    │   ├── components/       # React components
    │   ├── App.tsx           # Main application component
    │   ├── main.tsx          # Entry point
    │   └── types.ts          # TypeScript interfaces
    ├── index.html            # HTML entry point
    ├── package.json          # Dependencies
    ├── tsconfig.json         # TypeScript configuration
    └── vite.config.ts        # Vite configuration
```

## Setup Instructions

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install flask flask-cors requests python-dotenv
   ```

3. Create a `.env` file in the backend directory with your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. Start the Flask server:
   ```bash
   python medinquire_web.py --port 8086
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:3000 (or the port shown in your terminal)

## Features

- Evidence-based medical answers with proper citation
- Interactive "Related" questions for follow-up exploration
- Custom follow-up question input
- Dark mode support
- Responsive design for mobile and desktop
- Table formatting for comparative medical information

## Technology Stack

- Backend:
  - Flask (Python web framework)
  - DeepSeek AI (for natural language processing)
  
- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite (build tool)

## License

This project is proprietary and confidential. Unauthorized copying or distribution of this project is strictly prohibited. 