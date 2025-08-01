import React from "react";
import { useState } from "react";
import axios from "axios";
import {
  FiUploadCloud,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiCpu,
  FiMessageSquare,
  FiMic,
  FiType,
} from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";

import "./parse.css";
import AiInterview from "./interview";
import AnalysisDisplay from "./analysis";

const API_BASE_URL = "http://127.0.0.1:5000";

function Parser() {
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const [showInterviewChoice, setShowInterviewChoice] = useState(false);
  const [interviewMode, setInterviewMode] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setParsedData(null);
    setError("");
    setFileName(file.name);
    setShowInterviewChoice(false);
    setInterviewMode(null);
    setAnalysisResult(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/parse-resume`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setParsedData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = (mode) => {
    setInterviewMode(mode);
    setShowInterviewChoice(false);
  };

  const handleInterviewComplete = async (transcript) => {
    setInterviewMode(null);
    if (!transcript?.trim()) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-interview`, {
        transcript,
      });
      setAnalysisResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to analyze interview transcript."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseInterview = () => {
    setInterviewMode(null);
    setShowInterviewChoice(false);
  };

  return (
    <div className="App">
      <h1 className="title">AI Resume & Interview Hub</h1>
      <p className="subtitle">
        Upload a resume, then choose your AI interview experience.
      </p>

      <FileUpload onFileChange={handleFileChange} fileName={fileName} />

      {isLoading && <div className="spinner"></div>}
      {error && <div className="error-message">{error}</div>}

      {parsedData && (
        <ResultsDisplay
          data={parsedData}
          onStartInterview={() => setShowInterviewChoice(true)}
        />
      )}

      {showInterviewChoice && (
        <InterviewChoiceModal
          onSelect={handleStartInterview}
          onClose={() => setShowInterviewChoice(false)}
        />
      )}

      {interviewMode && (
        <AiInterview
          name={parsedData.name}
          role={parsedData.role}
          mode={interviewMode}
          onInterviewComplete={handleInterviewComplete}
          onClose={handleCloseInterview}
        />
      )}

      {isAnalyzing && <div className="spinner"></div>}
      {analysisResult && <AnalysisDisplay data={analysisResult} />}
    </div>
  );
}

const InterviewChoiceModal = ({ onSelect, onClose }) => (
  <div className="interview-modal-overlay" onClick={onClose}>
    <div
      className="interview-modal-content choice-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Choose Your Interview Method</h2>
      <p>How would you like to provide your response?</p>
      <div className="choice-buttons">
        <button onClick={() => onSelect("voice")} className="choice-button">
          <FiMic size={24} />
          <span>Voice Response</span>
        </button>
        <button onClick={() => onSelect("text")} className="choice-button">
          <FiType size={24} />
          <span>Text Response</span>
        </button>
      </div>
    </div>
  </div>
);

const FileUpload = ({ onFileChange, fileName }) => (
  <label htmlFor="resume-upload" className="file-upload-area">
    {" "}
    <FiUploadCloud className="upload-icon" />{" "}
    <input
      id="resume-upload"
      type="file"
      onChange={onFileChange}
      accept=".pdf,.docx"
      style={{ display: "none" }}
    />{" "}
    <p>Click to upload or drag and drop</p>{" "}
    <p className="subtitle">Supported formats: PDF, DOCX</p>{" "}
    {fileName && (
      <p>
        {" "}
        Selected: <strong>{fileName}</strong>{" "}
      </p>
    )}{" "}
  </label>
);
const ResultsDisplay = ({ data, onStartInterview }) => {
  const { name, contact, role, skillgap, skills } = data;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";
  return (
    <div className="results-card">
      {" "}
      <div className="results-header">
        {" "}
        <div className="avatar">{initials}</div>{" "}
        <div className="header-info">
          {" "}
          <h2>{name || "Name Not Found"}</h2>{" "}
          <p>
            {" "}
            <FiBriefcase /> {role || "Role Not Found"}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="results-body">
        {" "}
        <div className="section contact-info">
          {" "}
          <h3>
            <FiUser /> Contact Information
          </h3>{" "}
          <p>
            <FiMail /> {contact?.email || "Email not found"}
          </p>{" "}
          <p>
            <FiPhone /> {contact?.phone || "Phone not found"}
          </p>{" "}
        </div>{" "}
        <div className="section skills-info">
          {" "}
          <h3>
            <FiCpu /> Skills
          </h3>{" "}
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
          )}{" "}
        </div>{" "}
        <div className="section skills-info">
          {" "}
          <h3>
            <FontAwesomeIcon icon={faPuzzlePiece} /> Skill Gap
          </h3>{" "}
          {skillgap && skillgap.length > 0 ? (
            <div className="skills-list">
              {skillgap.map((skill, index) => (
                <span key={index} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills found.</p>
          )}{" "}
        </div>{" "}
      </div>{" "}
      <div className="interview-button-container">
        {" "}
        <button className="interview-button" onClick={onStartInterview}>
          {" "}
          Proceed to AI Interview{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};

export default Parser;
