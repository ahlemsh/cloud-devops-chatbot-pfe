import React from "react";
import "@testing-library/jest-dom"; 
import { render, screen, fireEvent } from "@testing-library/react";
import ChatInput from "../components/ChatInput";
import ChatHistory from "../components/ChatHistory";
import ChatMessage from "../components/ChatMessage";
import SessionItem from "../components/SessionItem";
import Sidebar from "../components/Sidebar";
import WelcomeMessage from "../components/WelcomeMessage"; 
import TypingIndicator from "../components/TypingIndicator"; 

// 🔹 ChatInput
describe("ChatInput", () => {
  test("affiche le champ de saisie", () => {
    render(<ChatInput message="" setMessage={() => {}} sendMessage={() => {}} loading={false} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  test("déclenche sendMessage au clic", () => {
    const sendMessage = jest.fn();
    render(<ChatInput message="Bonjour" setMessage={() => {}} sendMessage={sendMessage} loading={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(sendMessage).toHaveBeenCalled();
  });

  test("déclenche sendMessage avec la touche Entrée", () => {
    const sendMessage = jest.fn();
    render(<ChatInput message="Salut" setMessage={() => {}} sendMessage={sendMessage} loading={false} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(sendMessage).toHaveBeenCalled();
  });

  test("désactive input et bouton quand loading est actif", () => {
    render(<ChatInput message="..." setMessage={() => {}} sendMessage={() => {}} loading={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

// 🔹 ChatHistory
describe("ChatHistory", () => {
  test("affiche la liste des messages", () => {
    const messages = [
      { role: "user", content: "Salut" },
      { role: "bot", content: "Bonjour, comment puis-je vous aider ?" },
    ];
    render(<ChatHistory chatHistory={messages} />);
    expect(screen.getByText(/Salut/i)).toBeInTheDocument();
    expect(screen.getByText(/Bonjour, comment puis-je vous aider/i)).toBeInTheDocument();
  });

  test("affiche un message d'erreur si chatHistory n'est pas un tableau", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<ChatHistory chatHistory={null} />);
    expect(screen.getByText(/Erreur lors du chargement de l'historique/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

// 🔹 ChatMessage
describe("ChatMessage", () => {
  test("affiche un message utilisateur", () => {
    render(<ChatMessage role="user" content="Bonjour" />);
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
  });

  test("affiche un message du bot", () => {
    render(<ChatMessage role="bot" content="Bienvenue chez RFC" />);
    expect(screen.getByText("Bienvenue chez RFC")).toBeInTheDocument();
  });
});

// 🔹 SessionItem
describe("SessionItem", () => {
  test("affiche le nom de la session", () => {
    render(
      <SessionItem
        sessionId="1"
        sessionName="Session 1"
        onClick={() => {}}
        onDeleteSession={() => {}}
      />
    );
    expect(screen.getByText("Session 1")).toBeInTheDocument();
  });

  test("déclenche onClick quand on clique sur l'élément", () => {
    const handleClick = jest.fn();
    render(
      <SessionItem
        sessionId="1"
        sessionName="Session test"
        onClick={handleClick}
        onDeleteSession={() => {}}
      />
    );
    fireEvent.click(screen.getByText("Session test"));
    expect(handleClick).toHaveBeenCalled();
  });

  test("ouvre le menu et clique sur Supprimer", () => {
    const onDeleteSession = jest.fn();
    render(
      <SessionItem
        sessionId="1"
        sessionName="Session test"
        onClick={() => {}}
        onDeleteSession={onDeleteSession}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Supprimer"));
    expect(onDeleteSession).toHaveBeenCalledWith("1");
  });
});

// 🔹 Sidebar
describe("Sidebar", () => {
  test("affiche les questions FAQ", () => {
    render(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={() => {}}
        onNewChat={() => {}}
        onSelectSession={() => {}}
        onDeleteSession={() => {}}
        onQuestionClick={() => {}}
        sessions={[]}
      />
    );
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("En quoi se spécialise RFC ?")).toBeInTheDocument();
  });

  test("affiche le bouton New Chat", () => {
    render(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={() => {}}
        onNewChat={() => {}}
        onSelectSession={() => {}}
        onDeleteSession={() => {}}
        onQuestionClick={() => {}}
        sessions={[]}
      />
    );
    expect(screen.getByText("+ New Chat")).toBeInTheDocument();
  });

  test("clique sur une question FAQ appelle onQuestionClick", () => {
    const onQuestionClick = jest.fn();
    render(
      <Sidebar
        isSidebarOpen={true}
        setIsSidebarOpen={() => {}}
        onNewChat={() => {}}
        onSelectSession={() => {}}
        onDeleteSession={() => {}}
        onQuestionClick={onQuestionClick}
        sessions={[]}
      />
    );
    fireEvent.click(screen.getByText("En quoi se spécialise RFC ?"));
    expect(onQuestionClick).toHaveBeenCalled();
  });
});

// 🔹 WelcomeMessage
describe("WelcomeMessage", () => {
  test("affiche le message de bienvenue", () => {
    render(<WelcomeMessage />);
    expect(screen.getByText(/Bienvenue sur le Chatbot RFC/i)).toBeInTheDocument();
  });

  test("affiche l'icône du bot", () => {
    render(<WelcomeMessage />);
    const botImage = screen.getByAltText("BotLogo");
    expect(botImage).toBeInTheDocument();
  });
});

// 🔹 TypingIndicator
describe("TypingIndicator", () => {
  test("affiche l’indicateur 'Un instant'", () => {
    render(<TypingIndicator />);
    expect(screen.getByText("Un instant")).toBeInTheDocument();
  });

  test("affiche les 3 points animés", () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll(".dot"); 
    expect(dots.length).toBe(3);
  });
});
