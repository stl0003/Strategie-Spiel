import { GameController } from './controllers/GameController.js';

window.addEventListener('load', () => {
    // DOM-Elemente holen
    const hostBtn = document.getElementById('host-game-btn');
    const joinBtn = document.getElementById('join-game-btn');
    const serverIpInput = document.getElementById('server-ip');
    const playerNameInput = document.getElementById('player-name');
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');
    const lobbyInfo = document.getElementById('lobby-info');
    const playerList = document.getElementById('player-list');
    const playersNeededSpan = document.getElementById('players-needed');

    let connection = null;
    let controller = null;

    // Host-Button
    hostBtn.addEventListener('click', async () => {
        const name = playerNameInput.value.trim() || 'Host';
        // Verbindung zu localhost (gleiche Adresse wie die Seite)
        const serverUrl = window.location.origin; // z.B. https://localhost:7227
        await connectToServer(serverUrl, name);
    });

    // Join-Button
    joinBtn.addEventListener('click', async () => {
        const ip = serverIpInput.value.trim();
        const name = playerNameInput.value.trim() || 'Spieler';
        if (!ip) {
            alert('Bitte eine Server-IP eingeben!');
            return;
        }
        // Achtung: HTTP oder HTTPS? Normalerweise läuft der Server auf HTTP unter Port 5000
        // Wenn Sie HTTPS verwenden, müssen Sie das Protokoll anpassen. Hier nehmen wir HTTP für LAN.
        const serverUrl = `http://${ip}:5000`; // Port 5000 ist Standard für ASP.NET Core ohne HTTPS
        await connectToServer(serverUrl, name);
    });

    async function connectToServer(serverUrl, playerName) {
        try {
            connection = new signalR.HubConnectionBuilder()
                .withUrl(serverUrl + '/gamehub')
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // --- ALLE Listener VOR start() registrieren ---
            connection.on('LobbyUpdate', (players) => {
                console.log('LobbyUpdate empfangen:', players);
                updatePlayerList(players);
                lobbyInfo.style.display = 'block';
                const count = players.length;
                playersNeededSpan.textContent = 4 - count;
            });

            connection.on('GameStarted', (gameState, playerList) => {
                console.log('Spiel gestartet!', gameState);
                lobbyScreen.style.display = 'none';
                gameScreen.style.display = 'block';
                controller = new GameController(connection, gameState, playerList);
            });

            connection.onclose((error) => {
                console.log('Verbindung geschlossen', error);
                alert('Verbindung zum Server verloren!');
                lobbyScreen.style.display = 'block';
                gameScreen.style.display = 'none';
            });

            await connection.start();
            console.log('Verbunden mit Server');

            // Jetzt erst beitreten
            await connection.invoke('JoinLobby', playerName);

        } catch (err) {
            console.error('Verbindungsfehler:', err);
            alert(`Konnte nicht zu ${serverUrl} verbinden. Ist der Server gestartet?`);
        }
    }

    function updatePlayerList(players) {
        playerList.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.name} (${p.unitIndex})`;
            playerList.appendChild(li);
        });
    }
});