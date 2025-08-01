import React, { useState, useEffect, useRef } from "react";
import { FiMic, FiMicOff } from "react-icons/fi";
import "./parse.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const AiInterview = ({ name, role, mode, onInterviewComplete, onClose }) => {
  const [isAiSpeaking, setIsAiSpeaking] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    "The AI bot is speaking..."
  );

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef(null);

  const [targetRoleText, setTargetRoleText] = useState("");
  const [careerGoalText, setCareerGoalText] = useState("");

  const interviewQuestion = `Hello ${
    name || "there"
  }. I see you're interested in a ${
    role || "new"
  } position. Could you tell me about your target role and your primary career goals?`;

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setStatusMessage("Sorry, TTS is not supported.");
      setIsAiSpeaking(false);
      return;
    }
    const speak = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(interviewQuestion);
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => {
        setStatusMessage("Now it's your turn. Please provide your response.");
        setIsAiSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
    return () => window.speechSynthesis.cancel();
  }, [interviewQuestion]);

  useEffect(() => {
    if (mode !== "voice" || !isSpeechRecognitionSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal)
          finalTranscript += event.results[i][0].transcript;
      }
      setVoiceTranscript((prev) => prev + finalTranscript);
    };
    recognition.onerror = (event) =>
      console.error("Speech recognition error:", event.error);
    recognition.onstart = () => {
      setStatusMessage("Listening...");
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage("Click mic to resume.");
    };
    recognitionRef.current = recognition;
  }, [mode]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleFinish = () => {
    let finalTranscript = "";
    if (mode === "voice") {
      if (isListening) recognitionRef.current.stop();
      finalTranscript = voiceTranscript;
    } else if (mode === "text") {
      finalTranscript = `My target role is ${targetRoleText}. My career goals are ${careerGoalText}.`;
    }
    onInterviewComplete(finalTranscript);
  };

  return (
    <div className="interview-modal-overlay" onClick={onClose}>
      <div
        className="interview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="close-button">
          ×
        </button>
        <h2>AI-Powered Interview</h2>
        <p className="interview-question">
          <i>{statusMessage}</i>
        </p>

        {mode === "voice" && (
          <>
            <div className="transcript-box">
              {voiceTranscript || (
                <span className="placeholder">
                  Your voice response will appear here...
                </span>
              )}
            </div>
            <div className="interview-controls">
              <button
                onClick={handleMicClick}
                className={`mic-button ${isListening ? "listening" : ""}`}
                disabled={isAiSpeaking}
              >
                {isListening ? <FiMicOff size={24} /> : <FiMic size={24} />}
              </button>
            </div>
          </>
        )}

        {mode === "text" && (
          <div className="text-input-group">
            <label>Your Target Role</label>
            <textarea
              value={targetRoleText}
              onChange={(e) => setTargetRoleText(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              readOnly={isAiSpeaking}
              className="interview-input"
              rows={2}
            />
            <label>Your Career Goals</label>
            <textarea
              value={careerGoalText}
              onChange={(e) => setCareerGoalText(e.target.value)}
              placeholder="e.g., To lead a team and build scalable, user-centric applications."
              readOnly={isAiSpeaking}
              className="interview-input"
              rows={4}
            />
          </div>
        )}

        <button
          className="finish-button"
          onClick={handleFinish}
          disabled={
            mode === "voice"
              ? !voiceTranscript
              : !targetRoleText || !careerGoalText
          }
        >
          Submit Response
        </button>
      </div>
    </div>
  );
};

export default AiInterview;
