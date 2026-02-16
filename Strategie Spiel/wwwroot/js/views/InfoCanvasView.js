import { BaseView } from './BaseView.js';

export class InfoCanvasView extends BaseView {
    constructor(canvasId, model) {
        super(model);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentTile = null;
    }

    setTile(tile) {
        this.currentTile = tile;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';

        if (this.currentTile) {
            this.ctx.fillText('Terrain: ' + this.currentTile.terrainKey, 20, 50);
            this.ctx.fillText('Coordinates: ' + this.currentTile.gridX + ',' + this.currentTile.gridY, 20, 80);
        }
    }
}