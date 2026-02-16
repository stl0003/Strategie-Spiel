import { BaseView } from './BaseView.js';

export class MainCanvasView extends BaseView {
    constructor(canvasId, model) {
        super(model);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.model.tiles.forEach(tile => {
            if (!tile.explored) {
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(tile.x, tile.y, 30, 30);
            } else {
                // Hintergrundfarbe (falls Bild fehlt oder transparent)
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

                // Bild zeichnen, wenn vorhanden und geladen
                if (tile.image && tile.image.naturalWidth > 0) {
                    this.ctx.drawImage(tile.image, tile.x, tile.y, 30, 30);
                }

                this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                this.ctx.strokeRect(tile.x, tile.y, 30, 30);
            }
        });

        this.model.buildings.forEach(building => {
            if (building.image && building.image.naturalWidth > 0) {
                this.ctx.drawImage(building.image, building.x + 5, building.y + 5, 20, 20);
            } else {
                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(building.x + 5, building.y + 5, 20, 20);
            }
        });

        this.model.units.forEach(unit => {
            if (unit.image && unit.image.naturalWidth > 0) {
                this.ctx.drawImage(unit.image, unit.x + 5, unit.y + 5, 20, 20);
            } else {
                this.ctx.fillStyle = 'blue';
                this.ctx.beginPath();
                this.ctx.arc(unit.x + 15, unit.y + 15, 10, 0, 2 * Math.PI);
                this.ctx.fill();
            }

            if (this.model.selectedUnit === unit) {
                this.ctx.beginPath();
                this.ctx.arc(unit.x + 15, unit.y + 15, 13, 0, 2 * Math.PI);
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }
}