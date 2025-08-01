# CV Parser & AI Interview Assistant

This project is a **CV Parser and AI Interview Assistant** that processes resumes (PDF/DOCX), extracts relevant information, identifies skill gaps, and provides an **AI-powered interview assistant** that understands user goals and desired roles through **text or voice input**.

---

## Features

### 1. **CV Parser**
- Upload a **PDF or DOCX resume**.
- Automatically extracts:
  - Name  
  - Role  
  - Contact Information  
  - Skills  
  - Skill gaps  

Uses **LLaMA AI (via Groq API)** to parse and process resume data.

### 2. **AI Interview Assistant**
- User can interact with the AI to share:
  - Career goals  
  - Desired role/position  
- Input is supported via:
  - **Text** (manual entry)  
  - **Voice** (using browser's speech recognition API).  
- AI then identifies and displays the **role** and **goals** mentioned.

---

## Tech Stack

### **Frontend**
- **React.js** (UI for uploading resumes and interacting with AI)
- **Window Speech Recognition API** (for voice input support)

### **Backend**
- **Flask (Python)** for handling API requests
- **Groq API (LLaMA AI)** for parsing resumes and AI interview logic
- **PDF/DOCX Parsing** to extract resume content

---

## Setup & Installation

### **1. Clone the repository**
```bash
git clone <your-repo-url>
cd <repo-name>
