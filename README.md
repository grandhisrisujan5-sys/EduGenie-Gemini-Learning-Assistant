### INTERNSHIP PROJECT ###
# EduGenie – Gemini Learning Assistant

## Overview
EduGenie is an AI-powered educational assistant developed to help students learn more effectively using Generative AI. The application provides intelligent responses, summarizes text, generates quizzes, creates learning roadmaps, and analyzes PDFs and images using the Google Gemini API.

## Features
- AI Question Answering
- Text Summarization
- Quiz Generation
- Learning Roadmap Generation
- PDF Chat and Summarization
- Image Analysis
- Simple and Responsive Web Interface

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Jinja2

### Backend
- Python
- FastAPI
- Uvicorn

### AI & Libraries
- Google Gemini API
- Hugging Face Transformers
- PyMuPDF
- Pillow

## Project Structure

```
main.py
requirements.txt
services/
templates/
static/
uploads/
```

## Installation

1. Clone the repository
```
git clone https://github.com/grandhisrisujan5-sys/EduGenie-Gemini-Learning-Assistant.git
```

2. Install dependencies
```
pip install -r requirements.txt
```

3. Configure your Google Gemini API key.

4. Start the application
```
uvicorn main:app --reload
```

5. Open your browser and visit:
```
http://127.0.0.1:8000
```

## Team Members
- Grandhi Sri Sujan
- Kesava Sankar
- Saathvik

## Future Enhancements
- User Authentication
- Database Integration
- Cloud Deployment
- Progress Tracking
- Personalized Learning Analytics

## License
This project was developed as part of the SmartBridge AI/ML & Generative AI Internship Program.