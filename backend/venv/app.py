import os
import fitz  
import docx
import json 
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq 
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
        The JSON object must have these keys: 'name', 'contact', 'role', 'skills','skill gap'.
        - 'name': The full name of the individual.
        - 'contact': An object containing 'email' and 'phone'. If a value is not found, use null.
        - 'role': The most recent or desired job title.
        - 'skills': An array of all skills, technologies, and tools.
        - 'skillgap': An array of 8-10 missing skills according to the user's role
        
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
          
            model="llama3-70b-8192",
        
            response_format={"type": "json_object"}, 
        )

        parsed_data_string = chat_completion.choices[0].message.content
        
      
        json_response = json.loads(parsed_data_string)
        print(json_response)

        return jsonify(json_response), 200

    except json.JSONDecodeError:
  
        return jsonify({"error": "Failed to parse LLM response as JSON."}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to process the resume.", "details": str(e)}), 500
    
# Add this new route to the bottom of your app.py file, before the if __name__ == '__main__': block

@app.route('/analyze-interview', methods=['POST'])
def analyze_interview():
    """
    Analyzes an interview transcript to extract career goals and target role.
    """
    data = request.get_json()
    if not data or 'transcript' not in data:
        return jsonify({"error": "Missing transcript in request body"}), 400

    transcript = data['transcript']
    
    # We can add a basic check to avoid sending empty text to the API
    if not transcript.strip():
        return jsonify({"target_role": "Not provided", "career_goal": "Not provided"}), 200

    try:
        # A new, specific prompt for this task
        system_prompt = """
        You are an expert career coach AI. Your task is to analyze an interview transcript
        and extract the user's specific target job role and their broader career goals.
        
        Return a clean JSON object with two keys: 'target_role' and 'career_goal'.
        
        - 'target_role': Identify the specific job title or position the user is aiming for. If they don't mention a specific title, infer it from their description or state 'Not specified'.
        - 'career_goal': Summarize the user's long-term ambitions or what they are looking for in a company/role in one or two sentences.
        
        VERY IMPORTANT: Your response must be ONLY the JSON object, with no extra text, explanations, or markdown formatting like ```json.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the user's interview response:\n\n{transcript}"}
            ],
            model="llama3-70b-8192",
            response_format={"type": "json_object"},
        )

        analysis_string = chat_completion.choices[0].message.content
        json_response = json.loads(analysis_string)
        
        return jsonify(json_response), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse LLM response as JSON."}), 500
    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return jsonify({"error": "Failed to analyze the interview transcript.", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)