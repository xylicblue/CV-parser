# 📄 CV Parser & AI Interview (React + Flask + LLaMA via Groq)

This project is a **CV parsing and AI interview platform** that extracts key details from resumes (PDF/DOCX) and conducts an **AI-driven interview** to understand the candidate’s career goals and targeted role. It uses **React** for the frontend, **Flask** for the backend, and **LLaMA (via Groq API)** for AI processing.

---

## 🔑 Features

- **CV Parsing**:
  - Upload PDF/DOCX resumes.
  - Extracts **name, role, contact info, skills, and skill gaps**.

- **AI Interview**:
  - Asks users for their **career goals and desired role**.
  - Supports both **text input** and **voice input** (via Web Speech API).
  - Displays parsed responses: role aimed for & goals.

- **Tech Stack**:
  - **Frontend**: React (with Web Speech Recognition for voice input).
  - **Backend**: Flask (Python) using Groq’s **LLaMA AI** for parsing logic.
  - **Environment Variables**: Groq API key stored in `.env`.

---

## 📂 Project Structure

