export class Unit {
    constructor(gridX, gridY, image, colorKey) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * 30;
        this.y = gridY * 30;
        this.image = image;
        this.colorKey = colorKey;
        this.speed = 2;
        this.onChange = null;
        this.playerIndex = -1;
        this.nameKey = nameKey || colorKey;
        this.hp = 100;
        this.maxHp = 100;
        this.activeAction = null;
        this.playerIndex = -1;
    }

    moveTo(newGridX, newGridY) {
        this.gridX = newGridX;
        this.gridY = newGridY;
        if (this.onChange) this.onChange();
    }

    updatePosition() {
        const targetX = this.gridX * 30;
        const targetY = this.gridY * 30;
        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
    }
}