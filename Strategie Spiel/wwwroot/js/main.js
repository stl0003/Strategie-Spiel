import { GameController } from './controllers/GameController.js';

window.addEventListener('load', () => {
    // ---------- DOM-Elemente ----------
    const hostBtn = document.getElementById('host-game-btn');
    const joinBtn = document.getElementById('join-game-btn');
    const serverIpInput = document.getElementById('server-ip');
    const playerNameInput = document.getElementById('player-name');
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');
    const lobbyInfo = document.getElementById('lobby-info');
    const playerList = document.getElementById('player-list');
    const playersNeededSpan = document.getElementById('players-needed');

    // Prüfen, ob alle Elemente existieren (wichtig für Fehlervermeidung)
    if (!hostBtn || !joinBtn || !serverIpInput || !playerNameInput || !lobbyScreen || !gameScreen || !lobbyInfo || !playerList || !playersNeededSpan) {
        console.error('Ein oder mehrere Lobby-Elemente fehlen in der HTML!');
        return;
    }

    let connection = null;
    let controller = null;

    // ---------- Host-Button: Verbinde zu localhost ----------
    hostBtn.addEventListener('click', async () => {
        const name = playerNameInput.value.trim() || 'Host';
        // Verwende den gleichen Origin (Port), unter dem die Seite geladen wurde
        const serverUrl = window.location.origin; // z.B. https://localhost:7227 oder http://localhost:5000
        await connectToServer(serverUrl, name);
    });

    // ---------- Join-Button: Verbinde zu eingegebener IP ----------
    joinBtn.addEventListener('click', async () => {
        const ip = serverIpInput.value.trim();
        const name = playerNameInput.value.trim() || 'Spieler';
        if (!ip) {
            alert('Bitte eine Server-IP eingeben!');
            return;
        }
        // Im LAN läuft der Server meist auf Port 5000 (HTTP)
        const serverUrl = `http://${ip}:5000`;
        await connectToServer(serverUrl, name);
    });

    // ---------- Zentrale Verbindungsfunktion ----------
    async function connectToServer(serverUrl, playerName) {
        try {
            // SignalR-HubConnection erstellen
            connection = new signalR.HubConnectionBuilder()
                .withUrl(serverUrl + '/gamehub')
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // --- ALLE Listener MÜSSEN vor connection.start() registriert werden ---
            connection.on('LobbyUpdate', (players) => {
                console.log('LobbyUpdate empfangen:', players);
                updatePlayerList(players);
                lobbyInfo.style.display = 'block';
                const count = players.length;
                playersNeededSpan.textContent = 4 - count;
            });

            connection.on('GameStarted', (gameState, playerList) => {
                console.log('Spiel gestartet!', gameState);
                // Lobby ausblenden, Spiel anzeigen
                lobbyScreen.style.display = 'none';
                gameScreen.style.display = 'block';
                // Multiplayer-GameController erzeugen
                controller = new GameController(connection, gameState, playerList);
            });

            connection.onclose((error) => {
                console.log('Verbindung geschlossen', error);
                alert('Verbindung zum Server verloren!');
                lobbyScreen.style.display = 'block';
                gameScreen.style.display = 'none';
                controller = null;
            });

            // Verbindung starten
            await connection.start();
            console.log('Verbunden mit Server');

            // Der Lobby beitreten (Name wird an Server gesendet)
            await connection.invoke('JoinLobby', playerName);

        } catch (err) {
            console.error('Verbindungsfehler:', err);
            alert(`Konnte nicht zu ${serverUrl} verbinden. Ist der Server gestartet?\n\nDetails: ${err.message}`);
        }
    }

    // ---------- Hilfsfunktion: Spielerliste aktualisieren ----------
    function updatePlayerList(players) {
        playerList.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.name} (${p.unitIndex})`;
            playerList.appendChild(li);
        });
    }
});