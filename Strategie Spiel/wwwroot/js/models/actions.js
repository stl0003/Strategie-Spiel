namespace Strategie_Spiel.wwwroot.js.models
{
    // Definition aller möglichen Aktionen (wie in Ihrem script.js)
export const ACTIONS = {
    move: {
        label: "Move",
        range: 1,
        color: "rgba(255, 255, 0, 0.4)",
        canExecute: function (unit, tile, tx, ty, model) {
            if (!tile) return false;
            const dx = Math.abs(tx - unit.gridX);
            const dy = Math.abs(ty - unit.gridY);
            if (dx > 1 || dy > 1) return false;
            if (dx === 0 && dy === 0) return false;
            if (tile.terrainKey === "WATER") return false;
            const occupied = model.units.some(u => u !== unit && u.gridX === tx && u.gridY === ty);
            return !occupied;
        },
        execute: function (unit, tile, tx, ty, model, assets, controller) {
            unit.moveTo(tx, ty);
            // Trap-Check, Item-Check, etc. (siehe Ihre Logik)
            // Dazu benötigen wir Zugriff auf model und ggf. controller, um Items zu entfernen, Partikel zu spawnen
            if (tile.hasTrap) {
                unit.hp -= 20;
                tile.hasTrap = false;
                if (unit.hp <= 0) {
                    model.units = model.units.filter(u => u !== unit);
                    if (model.selectedUnit === unit) model.selectedUnit = null;
                }
            }
            const itemIndex = model.items.findIndex(i => i.gridX === tx && i.gridY === ty);
            if (itemIndex !== -1) {
                const item = model.items[itemIndex];
                if (item.type === "HEALTH_PACK") {
                    unit.hp = Math.min(unit.maxHp, unit.hp + 30);
                    // FloatingText + Partikel
                    model.floatingTexts.push(new FloatingText(tx*30+15, ty*30, "+30 HP", "#00FF00"));
                }
                // Partikel erzeugen
                const particleColor = item.type === "HEALTH_PACK" ? "#00FF00" : "#FFFF00";
                for (let i = 0; i < 15; i++) {
                    model.particles.push(new Particle(item.x+15, item.y+15, particleColor));
                }
                model.items.splice(itemIndex, 1);
            }
        }
    },
    attack: { /* ... */ },
    placeTrap: { /* ... */ },
    test: { /* ... */ }
};
}
