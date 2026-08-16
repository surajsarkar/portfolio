import { useEffect } from 'react';
import { CONTACT_EMAIL } from '../lib/contact';

const useConsoleEasterEgg = () => {
    useEffect(() => {
        const styles = {
            header: 'color: #00ffff; font-size: 14px; font-weight: bold; text-shadow: 0 0 10px #00ffff;',
            badge_ok: 'background: #10b981; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            badge_loading: 'background: #f59e0b; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            badge_active: 'background: #06b6d4; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
            text_dim: 'color: #6b7280;',
            text_green: 'color: #10b981;',
            text_cyan: 'color: #06b6d4;',
            text_white: 'color: #ffffff;',
            command: 'background: #1f2937; color: #10b981; padding: 4px 8px; border-radius: 4px; font-family: monospace;',
            divider: 'color: #374151;',
        };

        const asciiArt = `
%c███████╗██╗   ██╗██████╗  █████╗      ██╗    ███████╗ █████╗ ██████╗ ██╗  ██╗ █████╗ ██████╗ 
██╔════╝██║   ██║██╔══██╗██╔══██╗     ██║    ██╔════╝██╔══██╗██╔══██╗██║ ██╔╝██╔══██╗██╔══██╗
███████╗██║   ██║██████╔╝███████║     ██║    ███████╗███████║██████╔╝█████╔╝ ███████║██████╔╝
╚════██║██║   ██║██╔══██╗██╔══██║██   ██║    ╚════██║██╔══██║██╔══██╗██╔═██╗ ██╔══██║██╔══██╗
███████║╚██████╔╝██║  ██║██║  ██║╚█████╔╝    ███████║██║  ██║██║  ██║██║  ██╗██║  ██║██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚════╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝`;

        console.clear();
        console.log(asciiArt, styles.header);
        console.log('%c─────────────────────────────────────────────────────────────────────────────────────────', styles.divider);
        console.log('%c                              BACKEND & AI SYSTEMS ENGINEER                              ', styles.text_cyan);
        console.log('%c                     SYSTEM ONLINE // ARCHITECTURE: BROWNIE STUDIO                       ', styles.text_dim);
        console.log('%c─────────────────────────────────────────────────────────────────────────────────────────\n', styles.divider);

        console.log('%c🎉 Well, well... You found the Easter egg!', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
        console.log('%c   Curiosity is a sign of a great engineer. Welcome to the backend.\n', styles.text_dim);

        const bootSequence = [
            { badge: 'OK', style: styles.badge_ok, msg: 'Core modules initialized' },
            { badge: 'OK', style: styles.badge_ok, msg: 'React runtime: v18.2.0' },
            { badge: 'ACTIVE', style: styles.badge_active, msg: 'V8 Optimization enabled' },
            { badge: 'OK', style: styles.badge_ok, msg: 'Portfolio assets loaded' },
            { badge: 'ACTIVE', style: styles.badge_active, msg: 'Neural pathways online' },
            { badge: 'OK', style: styles.badge_ok, msg: 'Connection established' },
        ];

        console.log('%c⚡ SYSTEM BOOT SEQUENCE', styles.text_green);
        bootSequence.forEach(item => {
            console.log(`%c ${item.badge} %c ${item.msg}`, item.style, styles.text_dim);
        });
        console.log('');

        console.groupCollapsed('%c📦 SYSTEM MANIFEST (click to expand)', styles.text_cyan);
        console.log('%cTech Stack:', styles.text_white);
        console.log('%c  → Languages: %cPython, Rust, Go, TypeScript', styles.text_dim, styles.text_green);
        console.log('%c  → Infrastructure: %cAWS, Docker, Kubernetes', styles.text_dim, styles.text_green);
        console.log('%c  → Databases: %cPostgreSQL, Redis, Qdrant', styles.text_dim, styles.text_green);
        console.log('%c  → AI/ML: %cPyTorch, Hugging Face, vLLM', styles.text_dim, styles.text_green);
        console.groupEnd();

        console.log('');
        console.log('%c─────────────────────────────────────────────────────────────────────────────────────────', styles.divider);
        console.log('%c🎮 AVAILABLE COMMANDS', styles.text_cyan);
        console.log('%c─────────────────────────────────────────────────────────────────────────────────────────', styles.divider);
        console.log('%c  contact()   %c → Open communication channel', styles.command, styles.text_dim);
        console.log('%c  github()    %c → Access source repositories', styles.command, styles.text_dim);
        console.log('%c  linkedin()  %c → View professional profile', styles.command, styles.text_dim);
        console.log('%c  tictactoe() %c → Play Tic-Tac-Toe 🎮', styles.command, styles.text_dim);
        console.log('%c  help()      %c → Display this menu', styles.command, styles.text_dim);
        console.log('%c─────────────────────────────────────────────────────────────────────────────────────────\n', styles.divider);

        (window as any).contact = () => {
            console.log('%c📡 Opening communication channel...', styles.text_green);
            setTimeout(() => {
                window.location.href = `mailto:${CONTACT_EMAIL}`;
            }, 500);
        };

        (window as any).github = () => {
            console.log('%c🔓 Accessing repository vault...', styles.text_green);
            setTimeout(() => {
                window.open('https://github.com/surajsarkar', '_blank');
            }, 500);
        };

        (window as any).linkedin = () => {
            console.log('%c🔗 Establishing professional link...', styles.text_green);
            setTimeout(() => {
                window.open('https://linkedin.com/in/surajsarkar', '_blank');
            }, 500);
        };

        (window as any).help = () => {
            console.log('%c\n🎮 COMMAND REFERENCE', styles.text_cyan);
            console.log('%c─────────────────────────────────────────', styles.divider);
            console.log('%c  contact()  %c → Send an email', styles.command, styles.text_dim);
            console.log('%c  github()   %c → View GitHub profile', styles.command, styles.text_dim);
            console.log('%c  linkedin() %c → View LinkedIn profile', styles.command, styles.text_dim);
            console.log('%c  tictactoe()%c → Play Tic-Tac-Toe 🎮', styles.command, styles.text_dim);
            console.log('%c─────────────────────────────────────────\n', styles.divider);
        };

        // Tic-Tac-Toe Game State
        let board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let gameActive = false;
        const playerSymbol = 'X';
        const aiSymbol = 'O';

        const renderBoard = () => {
            console.log('%c\n ┌───┬───┬───┐', styles.text_cyan);
            console.log(`%c │ ${board[0]} │ ${board[1]} │ ${board[2]} │`, styles.text_white);
            console.log('%c ├───┼───┼───┤', styles.text_cyan);
            console.log(`%c │ ${board[3]} │ ${board[4]} │ ${board[5]} │`, styles.text_white);
            console.log('%c ├───┼───┼───┤', styles.text_cyan);
            console.log(`%c │ ${board[6]} │ ${board[7]} │ ${board[8]} │`, styles.text_white);
            console.log('%c └───┴───┴───┘\n', styles.text_cyan);
        };

        const checkWin = (symbol: string): boolean => {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
                [0, 4, 8], [2, 4, 6]              // diagonals
            ];
            return winPatterns.some(pattern =>
                pattern.every(i => board[i] === symbol)
            );
        };

        const checkDraw = (): boolean => {
            return board.every(cell => cell === 'X' || cell === 'O');
        };

        const getAiMove = (): number => {
            const available = board
                .map((cell, i) => (cell !== 'X' && cell !== 'O' ? i : -1))
                .filter(i => i !== -1);
            return available[Math.floor(Math.random() * available.length)];
        };

        (window as any).tictactoe = () => {
            board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            gameActive = true;
            console.log('%c\n🎮 TIC-TAC-TOE', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
            console.log('%c   You are X, AI is O.\n', styles.text_dim);
            renderBoard();
            console.log('%c💡 Type %cplay(5)%c to place X in position 5',
                styles.text_cyan, styles.command, styles.text_dim);
            console.log('%c   Positions: 1-9 (like a phone keypad)\n', styles.text_dim);
        };

        (window as any).play = (position: number) => {
            if (!gameActive) {
                console.log('%c⚠️ Start a game first with tictactoe()', 'color: #f59e0b;');
                return;
            }
            if (position < 1 || position > 9) {
                console.log('%c❌ Invalid position. Use 1-9.', 'color: #ef4444;');
                return;
            }
            const index = position - 1;
            if (board[index] === 'X' || board[index] === 'O') {
                console.log('%c❌ That spot is taken!', 'color: #ef4444;');
                return;
            }

            // Player move
            board[index] = playerSymbol;

            if (checkWin(playerSymbol)) {
                renderBoard();
                console.log('%c🎉 YOU WIN! Impressive.', 'color: #10b981; font-size: 14px; font-weight: bold;');
                gameActive = false;
                return;
            }

            if (checkDraw()) {
                renderBoard();
                console.log('%c🤝 It\'s a draw!', 'color: #f59e0b; font-size: 14px;');
                gameActive = false;
                return;
            }

            // AI move
            const aiMove = getAiMove();
            board[aiMove] = aiSymbol;

            renderBoard();

            if (checkWin(aiSymbol)) {
                console.log('%c🤖 AI wins! Try again with tictactoe()', 'color: #ef4444; font-size: 14px;');
                gameActive = false;
                return;
            }

            if (checkDraw()) {
                console.log('%c🤝 It\'s a draw!', 'color: #f59e0b; font-size: 14px;');
                gameActive = false;
            }
        };

        console.log('%c💡 TIP: %cType %chelp()%c to see available commands',
            styles.text_cyan, styles.text_dim, styles.command, styles.text_dim);

    }, []);
};

export default useConsoleEasterEgg;
