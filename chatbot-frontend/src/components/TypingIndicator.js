import React from "react";
import "./TypingIndicator.css"; // Ajoute du style pour l'effet

const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
      <span>Un instant</span>
    </div>
  );
};

export default TypingIndicator;
