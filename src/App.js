import { useState, useEffect, useRef } from 'react';
import './App.css';

// Helper functions for Blackjack game
const createDeck = () => {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(rank + suit);
    }
  }
  return deck;
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getCardValue = (card) => {
  const rank = card.slice(0, -1);
  if (rank === 'J' || rank === 'Q' || rank === 'K') {
    return 10;
  } else if (rank === 'A') {
    return 11;
  } else {
    return parseInt(rank);
  }
};

const calculateHandValue = (hand) => {
  let value = 0;
  let numAces = 0;
  for (const card of hand) {
    value += getCardValue(card);
    if (card.includes('A')) {
      numAces++;
    }
  }
  while (value > 21 && numAces > 0) {
    value -= 10;
    numAces--;
  }
  return value;
};

const displayHand = (hand, hideOne = false) => {
  if (hideOne && hand.length > 0) {
    return `[${hand[0]}] [??]`;
  }
  return hand.map(card => `[${card}]`).join(' ');
};

export default function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([]);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const [theme, setTheme] = useState('dark');

  // Blackjack game state
  const [gameActive, setGameActive] = useState(false);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const data = {
    name: "VASANTHKUMAR J",
    title: "Software Engineer",
    email: "vasanthkumar5398@gmail.com",
    location: "Bangalore",
    github: "Not provided",
    linkedin: "VasanthKumar"
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setLines([     
      { type: 'text', value: "" },
      { type: 'text', value: "Type 'help' to see available commands" },
      { type: 'text', value: "" }
      ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addOutput = (content) => {
    const newLines = Array.isArray(content) 
      ? content.map(c => ({ type: 'text', value: c }))
      : [{ type: 'text', value: content }];
    setLines(prev => [...prev, ...newLines]);
  };

  const startGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const newPlayerHand = [newDeck.pop(), newDeck.pop()];
    const newDealerHand = [newDeck.pop(), newDeck.pop()];

    const initialPlayerScore = calculateHandValue(newPlayerHand);
    const initialDealerScore = calculateHandValue(newDealerHand);

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setPlayerScore(initialPlayerScore);
    setDealerScore(initialDealerScore);
    setGameActive(true);

    addOutput([
      "Starting a new game of Blackjack!",
      `Your hand: ${displayHand(newPlayerHand)} (Score: ${initialPlayerScore})`,
      `Dealer's hand: ${displayHand(newDealerHand, true)}`,
    ]);

    if (initialPlayerScore === 21 && initialDealerScore === 21) {
      endGame("It's a push! Both have Blackjack.");
    } else if (initialPlayerScore === 21) {
      endGame("Blackjack! You win!");
    } else if (initialDealerScore === 21) {
      endGame("Dealer has Blackjack! You lose.");
    } else {
      addOutput("Type 'hit' to take another card or 'stand' to end your turn.");
    }
  };

  const endGame = (message) => {
    setGameActive(false);
    addOutput([
      `--- Game Over ---`,
      `Your hand: ${displayHand(playerHand)} (Score: ${playerScore})`,
      `Dealer's hand: ${displayHand(dealerHand)} (Score: ${dealerScore})`,
      message,
      "Type 'blackjack' to play again."
    ]);
  };

  const handleHit = () => {
    const newDeck = [...deck];
    const newPlayerHand = [...playerHand, newDeck.pop()];
    const newPlayerScore = calculateHandValue(newPlayerHand);

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setPlayerScore(newPlayerScore);

    addOutput(`Your hand: ${displayHand(newPlayerHand)} (Score: ${newPlayerScore})`);

    if (newPlayerScore > 21) {
      endGame("Bust! You went over 21. You lose.");
    } else if (newPlayerScore === 21) {
      handleStand(); // Auto-stand on 21
    } else {
      addOutput("Type 'hit' or 'stand'.");
    }
  };

  const handleStand = () => {
    let currentDealerHand = [...dealerHand];
    let currentDealerScore = calculateHandValue(currentDealerHand);
    let currentDeck = [...deck];

    addOutput(`Dealer's turn. Dealer's hand: ${displayHand(currentDealerHand)} (Score: ${currentDealerScore})`);

    while (currentDealerScore < 17) {
      const newCard = currentDeck.pop();
      currentDealerHand.push(newCard);
      currentDealerScore = calculateHandValue(currentDealerHand);
      addOutput(`Dealer hits: ${displayHand(currentDealerHand)} (Score: ${currentDealerScore})`);
    }

    setDeck(currentDeck);
    setDealerHand(currentDealerHand);
    setDealerScore(currentDealerScore);

    if (currentDealerScore > 21) {
      endGame("Dealer busts! You win!");
    } else if (playerScore > currentDealerScore) {
      endGame("You win!");
    } else if (currentDealerScore > playerScore) {
      endGame("Dealer wins! You lose.");
    } else {
      endGame("It's a push!");
    }
  };

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    
    setLines(prev => [...prev, { type: 'cmd', value: cmd }]);

    if (!trimmed) return;

    if (gameActive) {
      if (trimmed === 'hit') {
        handleHit();
      } else if (trimmed === 'stand') {
        handleStand();
      } else {
        addOutput("Game in progress. Type 'hit' or 'stand'.");
      }
      return;
    }

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    if (trimmed === 'help') {
      addOutput([
        "Available commands:",
        "",
        "  help        - show this help",
        "  ls          - list files",
        "  whoami      - personal info",
        "  skills      - technical skills",
        "  experience  - work history",
        "  projects    - key projects",
        "  education   - education",
        "  certs       - certifications",
        "  blackjack   - play a game of blackjack",
        "  clear       - clear screen",
        ""
      ]);
      return;
    }

    if (trimmed === 'ls') {
      addOutput([
        "personal.txt",
        "skills.txt",
        "experience.log",
        "projects.txt",
        "education.txt",
        "certs.txt"
      ]);
      return;
    }

    if (trimmed === 'whoami') {
      addOutput([
        `Name:     ${data.name}`,
        `Title:    ${data.title}`,
        `Email:    ${data.email}`,
        `Location: ${data.location}`,
        `GitHub:   ${data.github}`,
        `LinkedIn: ${data.linkedin}`
      ]);
      return;
    }

    if (trimmed === 'skills') {
      addOutput([
        "TECHNICAL SKILLS",
        "================",
        "",
        "Languages: Clojure, Java, HTML/CSS/JavaScript",
        "Databases: MySQL, Redis, Kafka",
        ""
      ]);
      return;
    }

    if (trimmed === 'experience') {
      addOutput([
        "PROFESSIONAL EXPERIENCE",
        "=======================",
        "",
        "Software Engineer, Game",
        "Peak 42 Innovation Labs Pvt Ltd | March 2025 - present",
        "  → Developed scalable, microservices-based backend systems for multiplayer real-time matchmaking, and Remote Game Server (RGS) services and integrated payment gateways' fault-tolerant systems.",
        "",
        "Associate Software Engineer, Game",
        "Vume Interactive Pvt Ltd | November 2021 - March 2025",
        "  → Developed scalable, microservices-based backend systems for multiplayer real-time game servers, matchmaking, and Remote Game Server (RGS) services using Clojure.",
        "  → Designed and implemented RESTful APIS and WebSocket protocols.",
        "  → Created Peka, a backend game engine written entirely in Clojure.",
        "",
        "Junior Programmer",
        "Playmantis Studio Pvt Ltd | October 2020 - November 2021",
        "  → Wrote clean, readable and reusable code.",
        "  → Helped define and develop limited-scale cross-platform prototypes.",
        "",
        "Technical Facilitator",
        "Ark Infosolutions Pvt Ltd | February 2019 - July 2020",
        "  → Worked as part of an interdisciplinary team to collaborate regularly and implement Curricula and activities.",
        ""
      ]);
      return;
    }

    if (trimmed === 'projects') {
      addOutput([
        "KEY PROJECTS",
        "============",
        "",
        "No projects listed.",
        ""
      ]);
      return;
    }

    if (trimmed === 'education') {
      addOutput([
        "EDUCATION",
        "=========",
        "",
        "Degree:     Bachelor of Engineering [Electronics and Communication Engineering]",
        "University: Paavai Engineering College, Namakkal",
        "Year:       2018"
      ]);
      return;
    }

    if (trimmed === 'certs') {
      addOutput([
        "CERTIFICATIONS",
        "==============",
        "",
        "No certifications listed.",
        ""
      ]);
      return;
    }

    if (trimmed === 'blackjack') {
      startGame();
      return;
    }

    addOutput(`Command not found: ${trimmed}. Type 'help' for available commands.`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleClose = () => {
    setIsClosed(true);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isClosed) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-screen p-4">
      <div className={`mx-auto w-full ${isMaximized ? 'max-w-full h-full' : 'max-w-4xl'}`}>
        <div className="terminal rounded-lg overflow-hidden">
          <div className="terminal-inner">
          <div className="terminal-header px-4 py-2 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={handleClose}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" onClick={handleMinimize}></div>
              <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer" onClick={handleMaximize}></div>
            </div>
            <span className="text-sm">terminal</span>
            <button className="theme-switcher" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>
          
          {!isMinimized && (
          <div 
            ref={terminalRef}
            className="p-4 overflow-y-auto"
            style={{ height: isMaximized ? 'calc(100vh - 100px)' : '60vh' }}
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((line, i) => (
              <div key={i} className="mb-1">
                {line.type === 'cmd' ? (
                  <div className="flex gap-2">
                    <span className="prompt">$</span>
                    <span className="command">{line.value}</span>
                  </div>
                ) : (
                  <div className="font-mono text-sm">{line.value}</div>
                )}
              </div>
            ))}
            
            <div className="flex gap-2 items-center mt-2">
              <span className="prompt">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none font-mono text-sm"
                autoFocus
              />
              <span className="w-2 h-4 bg-green-400 animate-pulse"></span>
            </div>
          </div>
          )}
        </div>
      </div>
        
        <p className="text-center mt-4 text-sm">
          Type "help" to see available commands
        </p>
      </div>
    </div>
  );
}