import React from "react";
import BotIcon from "../assets/bot-icon.png";

const WelcomeMessage = () => {
  return (
    <div className="welcome-message">
      <div className="chat-message bot">
          <img src={BotIcon} alt="BotLogo" className="chat-avatar" />
        <div className="chat-bubble">
          Bienvenue sur le Chatbot RFC ! N'hésitez pas à poser vos questions sur les services de RFC.
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
