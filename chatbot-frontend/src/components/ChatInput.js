import React from "react";
import { FaPaperPlane } from "react-icons/fa"; 

const ChatInput = ({ message, setMessage, sendMessage, loading }) => {
  return (
    <div className="chat-box">
      <input
        type="text"
        placeholder="Écrivez un message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading} className="send-btn">
        <FaPaperPlane /> 
      </button>
    </div>
  );
};

export default ChatInput;
