import { BaseView } from './BaseView.js';

export class MainCanvasView extends BaseView {
    constructor(canvasId, model) {
        super(model);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ---------- TILES ----------
        this.model.tiles.forEach(tile => {
            if (!tile.explored) {
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(tile.x, tile.y, 30, 30);
            } else {
                // Hintergrundfarbe
                let baseColor;
                switch (tile.terrainKey) {
                    case 'PLAINS': baseColor = '#90EE90'; break;
                    case 'FOREST': baseColor = '#228B22'; break;
                    case 'MOUNTAIN': baseColor = '#8B4513'; break;
                    case 'WATER': baseColor = '#4682B4'; break;
                    case 'TRAP': baseColor = '#888888'; break;
                    default: baseColor = '#CCCCCC';
                }
                this.ctx.fillStyle = baseColor;
                this.ctx.fillRect(tile.x, tile.y, 30, 30);

                if (tile.image && tile.image.naturalWidth > 0) {
                    this.ctx.drawImage(tile.image, tile.x, tile.y, 30, 30);
                }

                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.strokeRect(tile.x, tile.y, 30, 30);
            }
        });

        // ---------- NEU: ITEMS ----------
        this.model.items.forEach(item => {
            const tile = this.model.tiles[item.gridY]?.[item.gridX];
            if (tile && tile.explored) {
                // Schwebeeffekt
                const bob = Math.sin(Date.now() / 300 + item.bobOffset) * 3;
                const drawX = item.x + 5;
                const drawY = item.y + 5 + bob;
                const size = 20;

                if (item.image && item.image.naturalWidth > 0) {
                    this.ctx.drawImage(item.image, drawX, drawY, size, size);
                } else {
                    this.ctx.fillStyle = 'magenta';
                    this.ctx.fillRect(drawX, drawY, size, size);
                }

                // Schatten
                this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                this.ctx.beginPath();
                this.ctx.ellipse(item.x + 15, item.y + 25, 8, 3, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // ---------- NEU: PARTIKEL ----------
        this.model.particles.forEach(p => {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        // ---------- NEU: FLOATING TEXTS ----------
        this.model.floatingTexts.forEach(ft => {
            this.ctx.globalAlpha = ft.alpha;
            this.ctx.fillStyle = ft.color;
            this.ctx.font = "bold 18px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(ft.text, ft.x, ft.y);
        });
        this.ctx.globalAlpha = 1.0;

        // ---------- BUILDINGS ----------
        this.model.buildings.forEach(building => {
            if (building.image && building.image.naturalWidth > 0) {
                this.ctx.drawImage(building.image, building.x + 5, building.y + 5, 20, 20);
            } else {
                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(building.x + 5, building.y + 5, 20, 20);
            }
        });

        // ---------- UNITS ----------
        this.model.units.forEach(unit => {
            if (unit.image && unit.image.naturalWidth > 0) {
                this.ctx.drawImage(unit.image, unit.x + 5, unit.y + 5, 20, 20);
            } else {
                this.ctx.fillStyle = 'blue';
                this.ctx.beginPath();
                this.ctx.arc(unit.x + 15, unit.y + 15, 10, 0, 2 * Math.PI);
                this.ctx.fill();
            }

            // Auswahlmarkierung
            if (this.model.selectedUnit === unit) {
                this.ctx.beginPath();
                this.ctx.arc(unit.x + 15, unit.y + 15, 13, 0, 2 * Math.PI);
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            // Gesundheitsbalken (optional, wie in Ihrer alten Unit.update)
            const barWidth = 20;
            const barHeight = 4;
            const barX = unit.x + 5;
            const barY = unit.y - 6;
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(barX, barY, barWidth * (unit.hp / unit.maxHp), barHeight);
        });
    }
}