import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

const SessionItem = ({
  sessionId,
  sessionName,
  onClick,
  onDeleteSession,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = useCallback((event) => {
    event.stopPropagation();
    setIsMenuOpen((prev) => !prev); 
  }, []);

  const handleDelete = useCallback((event) => {
    event.stopPropagation();
    onDeleteSession(sessionId); 
    setIsMenuOpen(false);
  }, [sessionId, onDeleteSession]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="session-item" onClick={() => onClick(sessionId)}>
      <span className="session-name">{sessionName}</span>
      <div className="menu-container" ref={menuRef}>
        <button className="menu-button" onClick={toggleMenu}>
          <FiMoreHorizontal />
        </button>
        {isMenuOpen && (
          <div className="menu-dropdown">
            <button
              className="menu-delete"
              onClick={handleDelete}
            >
              <FaTrash className="trash-icon" /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionItem;