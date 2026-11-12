import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const ChatHistory = ({ chatHistory = [] }) => {
  const chatHistoryRef = useRef(null);
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]); 

  if (!Array.isArray(chatHistory)) {
    console.error("Erreur: chatHistory n'est pas un tableau :", chatHistory);
    return <p>Erreur lors du chargement de l'historique.</p>;
  }

  return (
    <div className="chat-history" ref={chatHistoryRef}>
      {chatHistory.map((chat, index) => (
        <ChatMessage key={index} role={chat.role} content={chat.content} />
      ))}
    </div>
  );
};

export default ChatHistory;