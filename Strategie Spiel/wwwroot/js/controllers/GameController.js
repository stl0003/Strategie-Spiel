import { GameModel } from '../models/GameModel.js';
import { MainCanvasView } from '../views/MainCanvasView.js';
import { InfoCanvasView } from '../views/InfoCanvasView.js';
import { loadAssets } from '../utils/assetsLoader.js';
import { Tile } from '../models/Tile.js';
import { Unit } from '../models/Unit.js';
import { Building } from '../models/Building.js';

export class GameController {
    constructor(connection, gameState, playerList) {
        this.connection = connection;
        this.model = new GameModel();
        this.assets = null;
        
        // Eigenen Spieler-Index finden
        const myConnectionId = this.connection.connectionId;
        const myEntry = playerList.find(p => p.connectionId === myConnectionId);
        this.playerIndex = myEntry ? myEntry.unitIndex : 0;
        
        this.init(gameState);
    }

    async init(gameState) {
        this.assets = await loadAssets();

        // Tiles aus gameState erstellen
        this.model.tiles = gameState.tiles.map(t => 
            new Tile(t.gridX * 30, t.gridY * 30, t.terrainKey, this.assets.tiles[t.terrainKey])
        );

        // Einheiten aus gameState erstellen
        this.model.units = gameState.units.map(u => {
            const unit = new Unit(u.gridX, u.gridY, this.assets.tiles[`PIONEER_${u.colorKey}`], u.colorKey);
            unit.playerIndex = u.playerIndex;
            return unit;
        });

        // Einmalig explored updaten
        this.updateExplored();

        // Views initialisieren
        this.mainView = new MainCanvasView('myGameArea', this.model);
        this.infoView = new InfoCanvasView('myGameArea2', this.model);

        // SignalR-Events empfangen
        this.setupSignalR();

        // Eigene Eingaben registrieren
        this.registerLocalEventListeners();

        // Gameloop starten
        this.gameLoop();
    }

    setupSignalR() {
        this.connection.on('UnitMoved', (playerIndex, newX, newY) => {
            const unit = this.model.units.find(u => u.playerIndex === playerIndex);
            if (unit) {
                unit.moveTo(newX, newY);
                this.updateExplored();
            }
        });
    }

    updateExplored() {
        this.model.units.forEach(unit => {
            this.model.tiles.forEach(tile => {
                const dx = Math.abs(unit.gridX - tile.gridX);
                const dy = Math.abs(unit.gridY - tile.gridY);
                if (dx <= 1 && dy <= 1) {
                    tile.explored = true;
                }
            });
        });
    }

    registerLocalEventListeners() {
        const myUnit = this.model.units.find(u => u.playerIndex === this.playerIndex);
        if (!myUnit) return;

        // Canvas-Klick
        document.getElementById('myGameArea').addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const gridX = Math.floor(clickX / 30);
            const gridY = Math.floor(clickY / 30);

            const targetTile = this.model.tiles.find(t => t.gridX === gridX && t.gridY === gridY);
            if (targetTile && targetTile.terrainKey !== 'WATER' && targetTile.terrainKey !== 'MOUNTAIN') {
                this.connection.invoke('MoveUnit', gridX, gridY);
            }
        });

        // Tastatur WASD
        window.addEventListener('keydown', (e) => {
            if (!myUnit) return;
            
            let newX = myUnit.gridX;
            let newY = myUnit.gridY;
            if (e.key === 'w') newY--;
            if (e.key === 'a') newX--;
            if (e.key === 's') newY++;
            if (e.key === 'd') newX++;

            const targetTile = this.model.tiles.find(t => t.gridX === newX && t.gridY === newY);
            if (targetTile && targetTile.terrainKey !== 'WATER' && targetTile.terrainKey !== 'MOUNTAIN') {
                this.connection.invoke('MoveUnit', newX, newY);
            }
        });
    }

    gameLoop() {
        const tick = () => {
            this.model.units.forEach(u => u.updatePosition());
            this.model.notifyAll();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
}