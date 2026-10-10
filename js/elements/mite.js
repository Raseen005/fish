import { grid, cols, rows, E, swapGrids, moved, meta } from '../globals.js';

export function updateMite(x, y) {
    let isDead = false;
    
    // Check for deadly elements nearby (Added E.Gas)
    if (y > 0 && (grid[x][y - 1] === E.Oil || grid[x][y - 1] === E.Fire || grid[x][y - 1] === E.Lava || grid[x][y - 1] === E.Gas)) isDead = true;
    else if (y < rows - 1 && (grid[x][y + 1] === E.Oil || grid[x][y + 1] === E.Fire || grid[x][y + 1] === E.Lava || grid[x][y + 1] === E.Gas)) isDead = true;
    else if (x > 0 && (grid[x - 1][y] === E.Oil || grid[x - 1][y] === E.Fire || grid[x - 1][y] === E.Lava || grid[x - 1][y] === E.Gas)) isDead = true;
    else if (x < cols - 1 && (grid[x + 1][y] === E.Oil || grid[x + 1][y] === E.Fire || grid[x + 1][y] === E.Lava || grid[x + 1][y] === E.Gas)) isDead = true;

    if (isDead) {
        grid[x][y] = E.Empty; 
        meta[x][y] = 0;
        moved[x][y] = true;
        return;
    }

    let up = y - 1;
    let down = y + 1;
    let dir = Math.random() > 0.5 ? 1 : -1;

    // 1. PREDATOR TRAVERSAL: Checks ALL 8 directions for Seeds/Flowers to eat
    let neighbors = [
        {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
        {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
        {nx: x - 1, ny: y - 1}, {nx: x + 1, ny: y - 1},
        {nx: x - 1, ny: y + 1}, {nx: x + 1, ny: y + 1} 
    ];
    
    // Scramble the array so the mite eats chaotically and naturally
    neighbors.sort(() => Math.random() - 0.5); 
    
    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            if (grid[n.nx][n.ny] === E.Seed) { 
                // Mite seamlessly swaps its position directly into the plant cell it just ate
                grid[x][y] = E.Empty; 
                grid[n.nx][n.ny] = E.Mite;
                meta[n.nx][n.ny] = Math.min((meta[x][y] || 0) + 1, 15); // Grow giant
                
                moved[x][y] = true;
                moved[n.nx][n.ny] = true;
                return; 
            }
        }
    }

    // 2. WATER BUOYANCY (Floats up in water)
    if (up >= 0 && grid[x][up] === E.Water) {
        if (Math.random() < 0.8) {
            swapGrids(x, y, x, up);
            return;
        }
    }

    // 3. GRAVITY (Falls if the space directly below is empty)
    let falling = false;
    if (down < rows && grid[x][down] === E.Empty) {
        swapGrids(x, y, x, down);
        falling = true;
    }

    // 4. WANDERING AI: Scurry around when on flat ground, the bottom of the screen, or blocked!
    if (!falling) {
        let r = Math.random();
        
        if (r < 0.15 && up >= 0 && grid[x][up] === E.Empty) {
            swapGrids(x, y, x, up);
        } else if (r < 0.75) {
            if (x + dir >= 0 && x + dir < cols) {
                if (grid[x + dir][y] === E.Empty) {
                    swapGrids(x, y, x + dir, y);
                } else if (up >= 0 && grid[x + dir][up] === E.Empty) {
                    swapGrids(x, y, x + dir, up);
                }
            }
        }
    }
}