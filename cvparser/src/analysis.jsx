import React from "react";
import { FiTarget, FiTrendingUp } from "react-icons/fi";
import "./parse.css"; // We'll use our existing styles

const AnalysisDisplay = ({ data }) => {
  if (!data) return null;

  const { target_role, career_goal } = data;

  return (
    <div className="results-card analysis-result">
      <h2>Interview Analysis</h2>

      <div className="section">
        <h3>
          <FiTarget /> Inferred Target Role
        </h3>
        <p>{target_role || "Not specified by the user."}</p>
      </div>

      <div className="section">
        <h3>
          <FiTrendingUp /> Stated Career Goals
        </h3>
        <p>{career_goal || "Not specified by the user."}</p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
