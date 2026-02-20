namespace Strategie_Spiel.wwwroot.js.models
{
    export class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.alpha = 1;
        this.speed = 1.5;
    }

    update() {
        this.y -= this.speed;
        this.alpha -= 0.015;
    }
}
}
