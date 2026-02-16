export function loadAssets() {
    const sources = {
        // Tiles (im Unterordner kenney)
        PLAINS: 'img/kenney/tile_0001.png',
        FOREST: 'img/kenney/tile_0112.png',
        MOUNTAIN: 'img/kenney/tile_0005.png',
        WATER: 'img/kenney/tile_0037.png',
        TRAP: 'img/kenney/tile_0001_trap.png',
        // Einheiten (direkt in img)
        PIONEER_RED: 'img/unit_pioneer_red.png',
        PIONEER_YELLOW: 'img/unit_pioneer_yellow.png',
        PIONEER_GREEN: 'img/unit_pioneer_green.png',
        PIONEER_BLUE: 'img/unit_pioneer_blue.png',
        PIONEER_GREY: 'img/unit_pioneer_grey.png',
        // Gebäude (direkt in img)
        CITY_RED: 'img/city_red.png',
        CITY_RED2: 'img/city_red2.png',
        CITY_RED3: 'img/city_red3.png',
    };

    return new Promise((resolve) => {
        const assets = { tiles: {} };
        const keys = Object.keys(sources);
        let loadedCount = 0;

        keys.forEach(key => {
            const img = new Image();
            img.src = sources[key];
            img.onload = img.onerror = () => {
                loadedCount++;
                assets.tiles[key] = img;
                if (loadedCount === keys.length) resolve(assets);
            };
        });
    });
}