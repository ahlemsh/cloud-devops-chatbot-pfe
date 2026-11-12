import React, { useEffect, useState } from "react";
import userIcon from "../assets/user-icon.png";
import BotIcon from "../assets/bot-icon.png";

const ChatMessage = ({ role, content }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
  }, []);

  return (
    <div className={`chat-message ${role} ${visible ? "fade-in" : ""}`}>
      {role === "bot" && (
          <img src={BotIcon} alt="BotLogo" className="chat-avatar" />
      )}
      {role === "user" && <img src={userIcon} alt="Utilisateur" className="chat-avatar" />}
      <div className="chat-bubble">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;