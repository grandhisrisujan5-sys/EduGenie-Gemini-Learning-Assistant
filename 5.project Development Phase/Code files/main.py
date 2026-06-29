from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from services.gemini_service import (
    generate_answer,
    generate_image_answer,
    generate_pdf_text_answer
)

from services.lamini_service import (
    generate_lamini_answer
)

import markdown
import os
import fitz



# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(
    title="EduGenie AI Learning Assistant",
    version="1.0"
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# ---------------------------------
# Global Chat Memory
# ---------------------------------

current_pdf = None
current_pdf_text = ""


# ---------------------------------
# Home Page
# ---------------------------------

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


# ---------------------------------
# Request Model
# ---------------------------------

class UserRequest(BaseModel):
    text: str


# ---------------------------------
# Helper Function
# ---------------------------------

def ai_response(prompt: str):
    answer = generate_answer(prompt)
    formatted_answer = markdown.markdown(answer)

    return {
        "response": formatted_answer
    }


# ---------------------------------
# Question Answering
# ---------------------------------

@app.post("/qa")
async def question_answer(data: UserRequest):

    return ai_response(
        f"""
You are EduGenie, an expert AI tutor.

Answer the student's question in simple language suitable for college students.

Use Markdown formatting.

Follow this exact structure:

# Title

## Definition

## Key Points
- Bullet 1
- Bullet 2
- Bullet 3

## Example

## Advantages (if applicable)

## Summary

Question:
{data.text}
"""
    )


# ---------------------------------
# Explanation
# ---------------------------------

@app.post("/explain")
async def explain(data: UserRequest):

    return ai_response(
        f"""
You are EduGenie, an expert teacher.

Explain the following topic in a way that a college student can easily understand.

Use Markdown formatting.

Follow this structure:

# Topic

## Simple Explanation

## Why is it Important?

## Real Life Example

## Key Concepts

- Point 1
- Point 2
- Point 3

## Common Mistakes

## Summary

Topic:
{data.text}
"""
    )


# ---------------------------------
# Summary
# ---------------------------------

@app.post("/summary")
async def summary(data: UserRequest):

    prompt = f"""
Summarize the following content.

Use Markdown formatting.

Follow this structure:

# Summary

## Main Points

- Point 1
- Point 2
- Point 3

## Important Keywords

## One-Line Revision

Text:
{data.text}
"""

    answer = generate_lamini_answer(prompt)

    formatted_answer = markdown.markdown(answer)

    return {
        "response": formatted_answer
    }


# ---------------------------------
# Quiz
# ---------------------------------

@app.post("/quiz")
async def quiz(data: UserRequest):

    return ai_response(
        f"""
Create a quiz for:

{data.text}

Use Markdown formatting.

Generate:

# Quiz

Create 5 Multiple Choice Questions.

Each question should have:

A)

B)

C)

D)

After all questions provide:

# Answer Key
"""
    )


# ---------------------------------
# Learning Recommendation
# ---------------------------------

@app.post("/learning")
async def learning(data: UserRequest):

    return ai_response(
        f"""
Create a complete learning roadmap for:

{data.text}

Use Markdown formatting.

Follow this structure:

# Learning Roadmap

## Beginner

## Intermediate

## Advanced

## Best Resources

## Practice Projects

## Final Goal
"""
    )

@app.post("/image")
async def image_analysis(
    image: UploadFile = File(...),
    prompt: str = Form(...)
):
    # Create uploads folder if it doesn't exist
    os.makedirs("uploads", exist_ok=True)

    image_path = os.path.join("uploads", image.filename)

    # Save uploaded image
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())

    # Ask Gemini Vision
    answer = generate_image_answer(image_path, prompt)

    formatted_answer = markdown.markdown(answer)

    return {
        "response": formatted_answer
    }

@app.post("/pdf")
async def pdf_analysis(
    pdf: UploadFile = File(None),
    prompt: str = Form(...)
):
    global current_pdf
    global current_pdf_text

    os.makedirs("uploads", exist_ok=True)

    # Upload a new PDF (only if user selected one)
    if pdf is not None:

        pdf_path = os.path.join("uploads", pdf.filename)

        with open(pdf_path, "wb") as buffer:
            buffer.write(await pdf.read())

        current_pdf = pdf_path

        # Extract text only once
        document = fitz.open(pdf_path)

        current_pdf_text = ""

        for page in document:
            current_pdf_text += page.get_text()

        document.close()

    # User hasn't uploaded any PDF yet
    if current_pdf_text.strip() == "":
        return {
            "response": "<p>Please upload a PDF first.</p>"
        }

    # Ask Gemini using extracted text
    answer = generate_pdf_text_answer(
        current_pdf_text,
        prompt
    )

    formatted_answer = markdown.markdown(answer)

    return {
        "response": formatted_answer
    }

@app.post("/new-chat")
async def new_chat():

    global current_pdf
    global current_pdf_text

    current_pdf = None
    current_pdf_text = ""

    return {
        "status": "success"
    }