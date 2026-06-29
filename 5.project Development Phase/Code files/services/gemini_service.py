import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image


# Load environment variables
load_dotenv()

# Read Gemini API Key
API_KEY = os.getenv("GEMINI_API_KEY")
print(API_KEY)

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=API_KEY)

# Gemini Model
model = genai.GenerativeModel("gemini-2.5-flash")


# ==========================================
# Text Generation
# ==========================================

def generate_answer(prompt: str) -> str:

    try:

        response = model.generate_content(prompt)

        if response.text:
            return response.text

        return "No response generated."

    except Exception as e:

        return f"Error: {str(e)}"


# ==========================================
# Image Analysis
# ==========================================

def generate_image_answer(image_path: str, prompt: str) -> str:

    try:

        image = Image.open(image_path)

        response = model.generate_content([
            prompt,
            image
        ])

        if response.text:
            return response.text

        return "No response generated."

    except Exception as e:

        return f"Error: {str(e)}"


# ==========================================
# PDF Analysis
# ==========================================

def generate_pdf_answer(pdf_path: str, prompt: str) -> str:

    try:

        print(f"PDF Path: {pdf_path}")

        # Upload PDF
        pdf_file = genai.upload_file(pdf_path)

        print("PDF Uploaded Successfully")

        # Ask Gemini
        response = model.generate_content([
            pdf_file,
            prompt
        ])

        print(response)

        if response.text:
            return response.text

        return "No response generated."

    except Exception as e:

        import traceback

        print("\n========== PDF ERROR ==========")
        print(e)
        traceback.print_exc()
        print("================================\n")

        return f"Error: {str(e)}"
    
# ==========================================
# Chat with Extracted PDF Text
# ==========================================

def generate_pdf_text_answer(pdf_text: str, question: str) -> str:

    try:

        # Limit context size (safe for Gemini)
        pdf_text = pdf_text[:25000]

        prompt = f"""
You are EduGenie AI, an expert educational assistant.

Use ONLY the information provided in the PDF below.

If the answer is not present in the PDF,
reply:

"The answer is not available in the uploaded PDF."

=========================
PDF CONTENT
=========================

{pdf_text}

=========================
STUDENT QUESTION
=========================

{question}

=========================
INSTRUCTIONS
=========================

Respond in Markdown.

If explaining:

# Topic

## Definition

## Explanation

## Key Points

## Example

## Summary

If summarizing:

# Summary

## Main Topics

## Important Concepts

## Key Definitions

## Exam Points

## Final Revision
"""

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        return f"Error: {e}"