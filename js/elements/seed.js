import { grid, cols, rows, E, swapGrids, moved, meta, dirY } from '../globals.js';

export function updateSeed(x, y) {
    let state = meta[x][y] || 0; 
    let down = y + 1;
    
    // 1. TOXICITY AND SLOW BURN
    let touchingFire = false;
    let neighbors = [
        {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
        {nx: x - 1, ny: y}, {nx: x + 1, ny: y}
    ];
    
    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            let id = grid[n.nx][n.ny];
            
            // Toxic gas still instantly withers and kills the plant
            if (id === E.Gas) {
                grid[x][y] = E.Empty; 
                moved[x][y] = true;
                return;
            }
            
            // Detect nearby fire/lava
            if (id === E.Fire || id === E.Lava) {
                touchingFire = true;
            }
        }
    }

    // THE FIX: Plants are moist living organisms! 
    // They only have a 3% chance per frame to catch fire, making it creep slowly.
    if (touchingFire && Math.random() < 0.03) {
        grid[x][y] = E.Fire;
        moved[x][y] = true;
        return;
    }

    // 2. DORMANT SEED (Waits for Water or a Sprouted Plant)
    if (state === 0) {
        let shouldSprout = false;
        let waterCoords = null;

        let search = [
            {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
            {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
            {nx: x - 1, ny: y - 1}, {nx: x + 1, ny: y - 1},
            {nx: x - 1, ny: y + 1}, {nx: x + 1, ny: y + 1}
        ];
        
        for (let n of search) {
            if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
                let id = grid[n.nx][n.ny];
                let m = meta[n.nx][n.ny];

                if (id === E.Water) { 
                    shouldSprout = true; 
                    waterCoords = n; 
                }
                
                if (id === E.Seed && m !== 0) { 
                    shouldSprout = true; 
                }
            }
        }

        if (shouldSprout) {
            if (waterCoords) {
                grid[waterCoords.nx][waterCoords.ny] = E.Empty; // Drink the water
                dirY[x][y] = 100; // Start with huge energy
            } else {
                dirY[x][y] = 5; // Minimal energy for internal roots
            }
            
            let hasSpace = false;
            let up = y - 1;
            let left = x - 1;
            let right = x + 1;
            let isValid = (id) => id === E.Empty || id === E.Water;

            if (up >= 0 && isValid(grid[x][up])) hasSpace = true;
            else if (left >= 0 && isValid(grid[left][y])) hasSpace = true;
            else if (right < cols && isValid(grid[right][y])) hasSpace = true;

            if (hasSpace) meta[x][y] = 1; // Growing Tip
            else meta[x][y] = 2; // Solid Root Base

            moved[x][y] = true;
            return;
        }

        let dir = Math.random() > 0.5 ? 1 : -1;
        if (down < rows) {
            let b = grid[x][down];
            let b1 = (x + dir >= 0 && x + dir < cols) ? grid[x + dir][down] : -1;
            let b2 = (x - dir >= 0 && x - dir < cols) ? grid[x - dir][down] : -1;

            if (b === E.Empty || b === E.Water) { swapGrids(x, y, x, down); }
            else if (b1 === E.Empty || b1 === E.Water) { swapGrids(x, y, x + dir, down); }
            else if (b2 === E.Empty || b2 === E.Water) { swapGrids(x, y, x - dir, down); }
        }
        return;
    }

    // 3. REVIVAL MECHANIC: Stopped Stems (2) or Flowers (<0) can be watered to grow again!
    if (state === 2 || state < 0) {
        let search = [
            {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
            {nx: x - 1, ny: y}, {nx: x + 1, ny: y}
        ];
        for (let n of search) {
            if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
                if (grid[n.nx][n.ny] === E.Water) {
                    grid[n.nx][n.ny] = E.Empty; // Drink the water
                    meta[x][y] = 1; // Revive into an actively growing tip!
                    dirY[x][y] = 100; // Refuel energy
                    moved[x][y] = true;
                    return;
                }
            }
        }
    }

    // 4. ACTIVELY GROWING TIP
    if (state === 1) {
        if (Math.random() < 0.15) { 
            let energy = dirY[x][y] || 0;

            let search = [
                {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
                {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
                {nx: x - 1, ny: y - 1}, {nx: x + 1, ny: y - 1},
                {nx: x - 1, ny: y + 1}, {nx: x + 1, ny: y + 1}
            ];
            for (let n of search) {
                if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
                    if (grid[n.nx][n.ny] === E.Water) {
                        grid[n.nx][n.ny] = E.Empty; 
                        energy += 50; 
                        moved[n.nx][n.ny] = true;
                        break; 
                    }
                }
            }
            
            dirY[x][y] = energy; 

            if (energy <= 0) {
                if (Math.random() < 0.3) meta[x][y] = -1 - Math.floor(Math.random() * 5); 
                else meta[x][y] = 2; 
                return;
            }

            let choices = [];
            let up = y - 1;
            let left = x - 1;
            let right = x + 1;

            let isValid = (id) => id === E.Empty || id === E.Water || id === E.Gas;

            if (up >= 0 && isValid(grid[x][up])) choices.push({nx: x, ny: up});
            if (up >= 0 && left >= 0 && isValid(grid[left][up])) choices.push({nx: left, ny: up});
            if (up >= 0 && right < cols && isValid(grid[right][up])) choices.push({nx: right, ny: up});
            
            if (left >= 0 && isValid(grid[left][y])) { choices.push({nx: left, ny: y}); choices.push({nx: left, ny: y}); }
            if (right < cols && isValid(grid[right][y])) { choices.push({nx: right, ny: y}); choices.push({nx: right, ny: y}); }

            if (choices.length > 0) {
                let choice = choices[Math.floor(Math.random() * choices.length)];
                
                grid[choice.nx][choice.ny] = E.Seed;
                meta[choice.nx][choice.ny] = 1; 
                dirY[choice.nx][choice.ny] = energy - 1; 
                moved[choice.nx][choice.ny] = true;
                
                if (choices.length > 1 && Math.random() < 0.15 && energy > 5) {
                    let c2 = choices[Math.floor(Math.random() * choices.length)];
                    if (c2.nx !== choice.nx || c2.ny !== choice.ny) {
                        grid[c2.nx][c2.ny] = E.Seed;
                        meta[c2.nx][c2.ny] = 1; 
                        dirY[c2.nx][c2.ny] = energy - 1; 
                        moved[c2.nx][c2.ny] = true;
                    }
                }

                if (Math.random() < 0.08) {
                    meta[x][y] = -1 - Math.floor(Math.random() * 5); 
                } else {
                    meta[x][y] = 2; 
                }
            } else {
                if (Math.random() < 0.5) meta[x][y] = -1 - Math.floor(Math.random() * 5); 
                else meta[x][y] = 2; 
            }
        }
    }
}