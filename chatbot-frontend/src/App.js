import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ChatHistory from "./components/ChatHistory";
import ChatInput from "./components/ChatInput";
import WelcomeMessage from "./components/WelcomeMessage";
import TypingIndicator from "./components/TypingIndicator";
import "./App.css";

const App = () => {
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // ✅ Fix: Ajouté pour gérer l'effet de "typing"
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Fix: Défini par défaut à `true` pour éviter un affichage cassé

  const backendBaseUrl =
  process.env.REACT_APP_BACKEND_URL || "/api"

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchChatHistory(sessionId);
    } else {
      setChatHistory([]);
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${backendBaseUrl}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchChatHistory = async (sessionId) => {
    try {
      const response = await axios.get(`${backendBaseUrl}/history/${sessionId}`);
      setChatHistory(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setChatHistory([]);
  };

  const handleSelectSession = (sessionId) => {
    setSessionId(sessionId);
  };

  const handleQuestionClick = async (question) => {
    if (!question) return;
    setLoading(true);
    setIsTyping(true); // ✅ Fix: Afficher l'effet "typing" lors de la réponse du bot
    try {
      const response = await axios.post(`${backendBaseUrl}/chat`, {
        sessionId,
        message: question,
      });

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: question },
        { role: "bot", content: response.data.response },
      ]);

      if (!sessionId) {
        setSessionId(response.data.sessionId);
      }

      fetchSessions();
    } catch (error) {
      console.error("Error sending question:", error);
      if (error.response) {
        console.error("Backend response data:", error.response.data);
      }
    } finally {
      setIsTyping(false); // ✅ Fix: Arrêter l'effet "typing" après la réponse
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
  
    setLoading(true);
    setIsTyping(true);
  
    const userMessage = { role: "user", content: message };
  
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
  
    try {
      const response = await axios.post(`${backendBaseUrl}/chat`, {
        sessionId,
        message,
      });
  
      const botMessage = {
        role: "bot",
        content: response.data.response,
      };
  
      setChatHistory((prevHistory) => [...prevHistory, botMessage]);
  
      if (!sessionId) {
        setSessionId(response.data.sessionId);
      }
  
      setMessage("");
      fetchSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response) {
        console.error("Backend response data:", error.response.data);
      }
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };  

  const deleteSession = async (sessionIdToDelete) => {
    try {
      await axios.delete(`${backendBaseUrl}/history/${sessionIdToDelete}`);
      fetchSessions(); 
      if (sessionIdToDelete === sessionId) {
        setSessionId(null); 
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        sessions={sessions}
        onQuestionClick={handleQuestionClick}
        onDeleteSession={deleteSession}
      />
      <div className="chat-container">
        {chatHistory.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <>
            <ChatHistory chatHistory={chatHistory} />
            {isTyping && <TypingIndicator />} {/* ✅ Fix: Afficher l'effet "typing" */}
          </>
        )}
        <ChatInput
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default App;