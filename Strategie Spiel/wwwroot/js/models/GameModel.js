export class GameModel {
    constructor() {
        this.tiles = [];
        this.units = [];
        this.buildings = [];
        this.items = []
        this.particles = [];
        this.floatingTexts = [];
        this.selectedUnit = null;
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyAll() {
        this.listeners.forEach(cb => cb());
    }

    setSelectedUnit(unit) {
        this.selectedUnit = unit;
        this.notifyAll();
    }
}