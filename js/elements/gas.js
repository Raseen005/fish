import { grid, cols, rows, E, swapGrids, moved } from '../globals.js';

export function updateGas(x, y) {
    let neighbors = [
        {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
        {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
        {nx: x - 1, ny: y - 1}, {nx: x + 1, ny: y - 1},
        {nx: x - 1, ny: y + 1}, {nx: x + 1, ny: y + 1}
    ];
    
    let touchingWater = false;

    // 1. HIGHLY FLAMMABLE & EXTREME TOXICITY
    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            let id = grid[n.nx][n.ny];
            
            // Explosive Ignition! (100% chance to instantly convert to fire)
            if (id === E.Fire || id === E.Lava) {
                grid[x][y] = E.Fire; 
                moved[x][y] = true;
                return;
            }
            
            // Actively kills the entire ecosystem on contact
            if (id === E.Fish || id === E.Mite || id === E.Seed) {
                grid[n.nx][n.ny] = E.Empty; 
                moved[n.nx][n.ny] = true;
            }

            // Check if dissolving in water
            if (id === E.Water) {
                touchingWater = true;
            }
        }
    }

    // 2. BROWNIAN MOTION (Pure random walk, no ceiling bias)
    let dx = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    let dy = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1

    if (dx === 0 && dy === 0) return;

    let nx = x + dx;
    let ny = y + dy;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        let target = grid[nx][ny];
        
        // 3. WATER TRAP MECHANIC
        if (touchingWater) {
            // If dissolved in water, it can ONLY move into other water blocks, never empty air!
            if (target === E.Water) {
                swapGrids(x, y, nx, ny);
            }
        } else {
            // If in the air, diffuse smoothly into empty space
            if (target === E.Empty) {
                swapGrids(x, y, nx, ny);
            }
        }
    }
}