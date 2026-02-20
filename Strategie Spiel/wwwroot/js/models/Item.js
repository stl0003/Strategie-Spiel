namespace Strategie_Spiel.wwwroot.js.models
{
    export class Item {
        constructor(gridX, gridY, type, assets) {
            this.gridX = gridX;
            this.gridY = gridY;
            this.type = type;          // "HEALTH_PACK" oder "P_PACK"
            this.image = assets.tiles[type]; // Bild aus assetsLoader
            this.x = gridX * 30;
            this.y = gridY * 30;
            this.bobOffset = Math.random() * Math.PI * 2; // für Schwebeeffekt
        }
    }
}
