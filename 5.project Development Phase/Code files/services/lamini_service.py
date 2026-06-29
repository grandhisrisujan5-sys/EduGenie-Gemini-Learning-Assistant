from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import fitz

# ---------------------------------
# Load LaMini-Flan-T5 Model
# ---------------------------------

MODEL_NAME = "MBZUAI/LaMini-Flan-T5-248M"

print("Loading LaMini-Flan-T5...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

print("LaMini-Flan-T5 Loaded Successfully!")

# ---------------------------------
# Generate Response
# ---------------------------------

def generate_lamini_answer(prompt: str) -> str:

    try:

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512
        )

        with torch.no_grad():

            outputs = model.generate(

                **inputs,

                max_new_tokens=200,

                temperature=0.7,

                do_sample=True

            )

        answer = tokenizer.decode(

            outputs[0],

            skip_special_tokens=True

        )

        return answer

    except Exception as e:

        return f"Error: {e}"
    
# ---------------------------------
# PDF Analysis using LaMini
# ---------------------------------

def generate_pdf_answer_lamini(pdf_path: str, prompt: str) -> str:

    try:

        # Open PDF
        doc = fitz.open(pdf_path)

        pdf_text = ""

        for page in doc:
            pdf_text += page.get_text()

        doc.close()

        # Prevent huge prompts
        pdf_text = pdf_text[:3000]

        final_prompt = f"""
You are an educational AI assistant.

PDF Content:
{pdf_text}

User Question:
{prompt}

Answer based only on the PDF.
"""

        return generate_lamini_answer(final_prompt)

    except Exception as e:

        return f"Error: {e}"