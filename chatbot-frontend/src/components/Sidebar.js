import React, { useState, useRef, useEffect, useCallback } from "react";
import logoRFC from "../assets/logo-rfc.png";
import { FaFacebook, FaInstagram, FaLinkedin, FaGlobe, FaBars } from "react-icons/fa";
import SessionItem from "./SessionItem";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onNewChat,
  onSelectSession,
  sessions,
  onQuestionClick,
  onDeleteSession,
}) => {
  const faqQuestions = [
    "En quoi se spécialise RFC ?",
    "Quels sont les services de RFC ?",
    "Par quoi se distingue RFC",
  ];
  const [openMenuId, setOpenMenuId] = useState(null);
  const sidebarRef = useRef(null);
  const burgerMenuRef = useRef(null);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        burgerMenuRef.current &&
        !burgerMenuRef.current.contains(event.target)
      ) {
        closeSidebar(); 
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, closeSidebar]); 

  return (
    <>
      <button className="burger-menu" onClick={toggleSidebar} ref={burgerMenuRef}>
        <FaBars className="burger-icon" />
      </button>

    <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`} ref={sidebarRef}>
    <div className="sidebar-header">
        <a href="https://www.rfc.com.tn" target="_blank" rel="noopener noreferrer">
            <img src={logoRFC} alt="RFC Logo" className="logo" />
        </a>
        <h2 className="chatbot-title">Chatbot RFC</h2>
    </div>

        <button
          className="new-chat-btn"
          onClick={() => {
            onNewChat(); 
            closeSidebar(); 
          }}
        >
          + New Chat
        </button>

        <h3>Historique des sessions</h3>
        <div className="session-list">
          {Array.isArray(sessions) && sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionItem
                key={session.sessionId}
                sessionId={session.sessionId}
                sessionName={session.sessionName}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onClick={() => {
                  onSelectSession(session.sessionId);
                  closeSidebar();
                }}
                onDeleteSession={onDeleteSession}
              />
            ))
          ) : (
            <p style={{ color: "#aaa", paddingLeft: "10px" }}>
              Aucune session pour le moment.
            </p>
          )}
        </div>
        

        <h3>FAQ</h3>

        {/* FAQ List */}
        <ul className="faq-list">
          {faqQuestions.map((question, index) => (
            <li
              key={index}
              className="faq-item"
              onClick={() => {
                onQuestionClick(question); 
                closeSidebar(); 
              }}
            >
              {question}
            </li>
          ))}
        </ul>

        <h3>Contact</h3>
        <div className="contact-icons">
          <a
            href="https://www.facebook.com/share/1HDe9dUxbM"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <FaFacebook className="icon" />
          </a>
          <a
            href="https://www.instagram.com/rfc__reseaux_formation_conseil?"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <FaInstagram className="icon" />
          </a>
          <a
            href="https://www.linkedin.com/company/rfc_2/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <FaLinkedin className="icon" />
          </a>
          <a
            href="https://www.rfc.com.tn"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <FaGlobe className="icon" />
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;