import React from "react";

import { useState, useCallback } from "react";
import axios from "axios";
import {
  FiUploadCloud,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiCpu,
} from "react-icons/fi";
import "./parse.css";

const API_URL = "http://127.0.0.1:5000/parse-resume";

function Parser() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setParsedData(null);
    setError("");
    setIsLoading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setParsedData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className="title">AI Resume Parser</h1>
      <p className="subtitle">
        Upload a resume (PDF or DOCX) to instantly extract key information.
      </p>

      <FileUpload onFileChange={handleFileChange} fileName={fileName} />

      {isLoading && <div className="spinner"></div>}

      {error && <div className="error-message">{error}</div>}

      {parsedData && <ResultsDisplay data={parsedData} />}
    </div>
  );
}

const FileUpload = ({ onFileChange, fileName }) => (
  <label htmlFor="resume-upload" className="file-upload-area">
    <FiUploadCloud className="upload-icon" />
    <input
      id="resume-upload"
      type="file"
      onChange={onFileChange}
      accept=".pdf,.docx"
      style={{ display: "none" }}
    />
    <p>Click to upload or drag and drop</p>
    <p className="subtitle">Supported formats: PDF, DOCX</p>
    {fileName && (
      <p>
        Selected: <strong>{fileName}</strong>
      </p>
    )}
  </label>
);

const ResultsDisplay = ({ data }) => {
  const { name, contact, role, skills } = data;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  return (
    <div className="results-card">
      <div className="results-header">
        <div className="avatar">{initials}</div>
        <div className="header-info">
          <h2>{name || "Name Not Found"}</h2>
          <p>
            <FiBriefcase /> {role || "Role Not Found"}
          </p>
        </div>
      </div>

      <div className="results-body">
        <div className="section contact-info">
          <h3>
            <FiUser /> Contact Information
          </h3>
          <p>
            <FiMail /> {contact?.email || "Email not found"}
          </p>
          <p>
            <FiPhone /> {contact?.phone || "Phone not found"}
          </p>
        </div>

        <div className="section skills-info">
          <h3>
            <FiCpu /> Skills
          </h3>
          {skills && skills.length > 0 ? (
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Parser;
