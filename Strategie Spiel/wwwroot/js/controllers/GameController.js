import { GameModel } from '../models/GameModel.js';
import { MainCanvasView } from '../views/MainCanvasView.js';
import { InfoCanvasView } from '../views/InfoCanvasView.js';
import { Tile } from '../models/Tile.js';
import { Unit } from '../models/Unit.js';
import { Building } from '../models/Building.js';
import { Item } from '../models/Item.js';
import { Particle } from '../models/Particle.js';
import { FloatingText } from '../models/FloatingText.js';
import { ACTIONS } from '../utils/actions.js';

export class GameController {
    constructor(assets) {
        this.assets = assets;
        this.model = new GameModel();
        this.mainView = new MainCanvasView('myGameArea', this.model);
        this.infoView = new InfoCanvasView('myGameArea2', this.model);
        this.playerIndex = 0; // Im Singleplayer steuert der Spieler alle Einheiten? Oder eine?
        // In Ihrem script.js gibt es vier Einheiten, aber nur eine wird ausgewählt.
        // Wir lassen den Spieler alle Einheiten steuern (er kann jede per Klick auswählen).
        // Daher brauchen wir keinen playerIndex.

        this.init();
    }

    init() {
        this.createTiles();
        this.createUnits();
        this.createBuildings(); // falls gewünscht
        this.updateExplored();
        this.setupUI();
        this.startItemSpawner();
        this.gameLoop();
    }

    createTiles() {
        const GRID_SIZE = 20; // oder 30? In Ihrem script.js ist 30, aber hier 20? Wir nehmen 20.
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const rand = Math.random();
                let terrainKey;
                if (rand < 0.1) terrainKey = 'MOUNTAIN';
                else if (rand < 0.2) terrainKey = 'WATER';
                else if (rand < 0.4) terrainKey = 'FOREST';
                else terrainKey = 'PLAINS';

                const tile = new Tile(
                    x * 30,
                    y * 30,
                    terrainKey,
                    this.assets.tiles[terrainKey]
                );
                this.model.tiles.push(tile);
            }
        }
    }

    createUnits() {
        // Wie in script.js: vier Einheiten an den Ecken
        const unitData = [
            { color: 'RED', x: 1, y: 1, name: 'RED' },
            { color: 'BLUE', x: 1, y: 28, name: 'BLUE' }, // Achtung: GRID_SIZE=20, also 28 ist außerhalb! Passen Sie an.
            { color: 'YELLOW', x: 28, y: 1, name: 'YELLOW' },
            { color: 'GREEN', x: 28, y: 28, name: 'GREEN' }
        ];
        // Da GRID_SIZE=20, setzen wir die Positionen auf 1, 18 etc.
        // Ich passe an: (1,1), (1,18), (18,1), (18,18)
        unitData[1].x = 1; unitData[1].y = 18;
        unitData[2].x = 18; unitData[2].y = 1;
        unitData[3].x = 18; unitData[3].y = 18;

        unitData.forEach(data => {
            const unit = new Unit(
                data.x,
                data.y,
                this.assets.tiles[`PIONEER_${data.color}`],
                data.color,
                data.name
            );
            unit.hp = 100;
            unit.maxHp = 100;
            this.model.units.push(unit);
        });
    }

    createBuildings() {
        // Falls Sie Gebäude initialisieren wollen, z.B.:
        // this.model.buildings.push(new Building(...));
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

    setupUI() {
        // Kontextmenü (Rechtsklick) – muss im HTML vorhanden sein
        this.contextMenu = document.getElementById('contextMenu');
        this.rebuildContextMenu();

        // Event-Listener für Canvas
        const canvas = document.getElementById('myGameArea');
        if (!canvas) return;

        // Linksklick
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const gridX = Math.floor((e.clientX - rect.left) / 30);
            const gridY = Math.floor((e.clientY - rect.top) / 30);
            const tile = this.model.tiles.find(t => t.gridX === gridX && t.gridY === gridY);
            const unitHit = this.model.units.find(u => u.gridX === gridX && u.gridY === gridY);

            // Wenn eine Aktion aktiv ist, versuche sie auszuführen
            if (this.model.selectedUnit && this.model.selectedUnit.activeAction) {
                const action = ACTIONS[this.model.selectedUnit.activeAction];
                if (action && action.canExecute(this.model.selectedUnit, tile, gridX, gridY, this.model)) {
                    action.execute(this.model.selectedUnit, tile, gridX, gridY, this.model, this.assets, this);
                    this.updateInfoPanel();
                    this.model.notifyAll();
                    return;
                }
            }

            // Sonst: Einheit auswählen, falls vorhanden
            if (unitHit) {
                this.model.setSelectedUnit(unitHit);
                if (!unitHit.activeAction) unitHit.activeAction = 'move';
                this.updateInfoPanel();
            } else {
                // Nichts angeklickt
                this.model.setSelectedUnit(null);
            }
            this.model.notifyAll();
            this.contextMenu.style.display = 'none';
        });

        // Rechtsklick (Kontextmenü)
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const gridX = Math.floor((e.clientX - rect.left) / 30);
            const gridY = Math.floor((e.clientY - rect.top) / 30);
            const unit = this.model.units.find(u => u.gridX === gridX && u.gridY === gridY);
            if (this.model.selectedUnit && this.model.selectedUnit === unit) {
                // Menü an der Mausposition anzeigen
                this.contextMenu.style.display = 'block';
                this.contextMenu.style.left = e.pageX + 'px';
                this.contextMenu.style.top = e.pageY + 'px';
            } else {
                this.contextMenu.style.display = 'none';
            }
        });

        // Mausbewegung (für Koordinaten im Infopanel)
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const gridX = Math.floor((e.clientX - rect.left) / 30);
            const gridY = Math.floor((e.clientY - rect.top) / 30);
            if (gridX >= 0 && gridX < 20 && gridY >= 0 && gridY < 20) {
                this.infoView.setTile(this.model.tiles[gridY * 20 + gridX]); // Achtung: tiles ist 1D-Array! Besser in 2D speichern? In Ihrem Model ist tiles ein 1D-Array. Wir müssen umrechnen.
                // Alternative: this.infoView.setTileCoords(gridX, gridY);
            }
        });

        canvas.addEventListener('mouseleave', () => {
            this.infoView.setTile(null);
        });

        // Tastatur WASD
        window.addEventListener('keydown', (e) => {
            if (!this.model.selectedUnit) return;
            const unit = this.model.selectedUnit;
            let newX = unit.gridX;
            let newY = unit.gridY;
            switch (e.key.toLowerCase()) {
                case 'w': newY--; break;
                case 's': newY++; break;
                case 'a': newX--; break;
                case 'd': newX++; break;
                default: return;
            }
            e.preventDefault();
            const tile = this.model.tiles.find(t => t.gridX === newX && t.gridY === newY);
            if (tile && tile.terrainKey !== 'WATER' && tile.terrainKey !== 'MOUNTAIN') {
                // Bewegung als Aktion 'move' ausführen
                const action = ACTIONS.move;
                if (action.canExecute(unit, tile, newX, newY, this.model)) {
                    action.execute(unit, tile, newX, newY, this.model, this.assets, this);
                    this.updateInfoPanel();
                }
            }
        });

        // UI-Buttons
        document.getElementById('ui_btn_move')?.addEventListener('click', () => this.setAction('move'));
        document.getElementById('ui_btn_build')?.addEventListener('click', () => this.setAction('placeTrap'));
        document.getElementById('ui_btn_fight')?.addEventListener('click', () => this.setAction('attack'));
        document.getElementById('ui_btn_test')?.addEventListener('click', () => this.setAction('test'));

        // Info-Panel regelmäßig aktualisieren (oder per Event)
        this.model.addListener(() => this.updateInfoPanel());
    }

    rebuildContextMenu() {
        if (!this.contextMenu) return;
        this.contextMenu.innerHTML = '';
        Object.keys(ACTIONS).forEach(key => {
            const action = ACTIONS[key];
            const item = document.createElement('div');
            item.textContent = action.label || key;
            item.style.padding = '4px 8px';
            item.style.border = '1px solid black';
            item.onclick = () => this.setAction(key);
            this.contextMenu.appendChild(item);
        });
    }

    setAction(type) {
        if (!this.model.selectedUnit) return;
        this.model.selectedUnit.activeAction = type;
        this.contextMenu.style.display = 'none';
        this.updateInfoPanel();
        this.model.notifyAll();
    }

    updateInfoPanel() {
        const uiCoordY = document.getElementById('ui_coord_y');
        const uiCoordX = document.getElementById('ui_coord_x');
        const uiUnit = document.getElementById('ui_unit');
        const uiAction = document.getElementById('ui_action');

        if (uiCoordY && uiCoordX) {
            const hoverTile = this.infoView.currentTile;
            if (hoverTile) {
                uiCoordY.textContent = hoverTile.gridY;
                uiCoordX.textContent = hoverTile.gridX;
            } else {
                uiCoordY.textContent = '-';
                uiCoordX.textContent = '-';
            }
        }

        if (uiUnit) {
            if (this.model.selectedUnit) {
                uiUnit.innerHTML = `<strong>${this.model.selectedUnit.nameKey}</strong><br>HP: ${this.model.selectedUnit.hp}/${this.model.selectedUnit.maxHp}`;
            } else {
                uiUnit.textContent = '-';
            }
        }

        if (uiAction) {
            if (this.model.selectedUnit && this.model.selectedUnit.activeAction) {
                const action = ACTIONS[this.model.selectedUnit.activeAction];
                uiAction.textContent = action ? action.label : this.model.selectedUnit.activeAction;
            } else {
                uiAction.textContent = '-';
            }
        }

        // Buttons hervorheben
        document.querySelectorAll('.menuButtons').forEach(btn => btn.style.border = '1px solid #999');
        if (this.model.selectedUnit && this.model.selectedUnit.activeAction) {
            const active = this.model.selectedUnit.activeAction;
            if (active === 'move') document.getElementById('ui_btn_move').style.border = '2px solid yellow';
            if (active === 'placeTrap') document.getElementById('ui_btn_build').style.border = '2px solid purple';
            if (active === 'attack') document.getElementById('ui_btn_fight').style.border = '2px solid red';
        }
    }

    startItemSpawner() {
        setInterval(() => {
            const GRID_SIZE = 20;
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            const tile = this.model.tiles.find(t => t.gridX === x && t.gridY === y);
            if (tile && tile.terrainKey !== 'WATER' &&
                !this.model.units.some(u => u.gridX === x && u.gridY === y) &&
                !this.model.items.some(i => i.gridX === x && i.gridY === y)) {
                const type = Math.random() > 0.5 ? 'HEALTH_PACK' : 'P_PACK';
                this.model.items.push(new Item(x, y, type, this.assets));
            }
        }, 30000); // 30 Sekunden
    }

    gameLoop() {
        const tick = () => {
            // Einheiten sanft bewegen
            this.model.units.forEach(u => u.updatePosition());

            // Partikel aktualisieren und alte entfernen
            this.model.particles = this.model.particles.filter(p => {
                p.update();
                return p.alpha > 0;
            });

            // Floating Texts aktualisieren und alte entfernen
            this.model.floatingTexts = this.model.floatingTexts.filter(ft => {
                ft.update();
                return ft.alpha > 0;
            });

            // Explored neu berechnen (optional, wenn sich Einheiten bewegen)
            this.updateExplored();

            this.model.notifyAll();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
}