import os
import fitz  # PyMuPDF
import docx
import json # Import the json library
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq # Import Groq instead of OpenAI
from dotenv import load_dotenv



load_dotenv()


client = Groq(
    api_key = os.environ.get("GROK_KEY")
)

app = Flask(__name__)
CORS(app)


def extract_text_from_pdf(file_stream):
    text = ""
    with fitz.open(stream=file_stream.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


def extract_text_from_docx(file_stream):
    doc = docx.Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


@app.route('/parse-resume',methods=['POST'])
def parse_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(file)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

    
        system_prompt = """
        You are an expert resume parser. Your task is to extract specific details 
        from a resume's text and return them as a clean JSON object.
        The JSON object must have these keys: 'name', 'contact', 'role', 'skills'.
        - 'name': The full name of the individual.
        - 'contact': An object containing 'email' and 'phone'. If a value is not found, use null.
        - 'role': The most recent or desired job title.
        - 'skills': An array of key skills, technologies, and tools.
        
        VERY IMPORTANT: Your response must be ONLY the JSON object, with no extra text, explanations, or markdown formatting like ```json.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Here is the resume text to parse:\n\n{text}",
                }
            ],
          
            model="llama3-8b-8192", 
        
            response_format={"type": "json_object"}, 
        )

        parsed_data_string = chat_completion.choices[0].message.content
        
      
        json_response = json.loads(parsed_data_string)

        return jsonify(json_response), 200

    except json.JSONDecodeError:
  
        return jsonify({"error": "Failed to parse LLM response as JSON."}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to process the resume.", "details": str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True)