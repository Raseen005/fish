import { grid, cols, rows, E, swapGrids, moved, dirX, dirY, meta } from '../globals.js';

export function updateFish(x, y) {
    let touchingWater = false;

    const neighbors = [
        { nx: x,     ny: y - 1 }, { nx: x,     ny: y + 1 },
        { nx: x - 1, ny: y },     { nx: x + 1, ny: y },
        { nx: x - 1, ny: y - 1 }, { nx: x + 1, ny: y - 1 },
        { nx: x - 1, ny: y + 1 }, { nx: x + 1, ny: y + 1 }
    ];

    // 1. SURVIVAL AND TOXICITY (Added E.Gas)
    for (const n of neighbors) {
        if (n.nx < 0 || n.nx >= cols || n.ny < 0 || n.ny >= rows) continue;
        
        const id = grid[n.nx][n.ny];
        
        if (id === E.Oil || id === E.Fire || id === E.Lava || id === E.Gas) {
            grid[x][y] = E.Empty; 
            meta[x][y] = 0; 
            moved[x][y] = true;
            return;
        }
        
        if (id === E.Water) touchingWater = true;
    }

    const down = y + 1;
    const below = down < rows ? grid[x][down] : -1;

    // 2. FALLING BEHAVIOR
    if (!touchingWater) {
        if (below === E.Empty || below === E.Smoke || below === E.Gas || below === E.Water) {
            dirX[x][y] = 0; 
            dirY[x][y] = 1;
            swapGrids(x, y, x, down);
            return;
        }
        if (below === E.Fish) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (x + dir >= 0 && x + dir < cols && (grid[x+dir][down] === E.Empty || grid[x+dir][down] === E.Water)) {
                swapGrids(x, y, x+dir, down);
                return;
            }
            if (x + dir >= 0 && x + dir < cols && (grid[x+dir][y] === E.Empty || grid[x+dir][y] === E.Water)) {
                swapGrids(x, y, x+dir, y);
                return;
            }
            moved[x][y] = true;
            return;
        }
        
        grid[x][y] = E.Empty; 
        meta[x][y] = 0; 
        moved[x][y] = true;
        return;
    }

    // 3. EAT MITES AND GROW
    let ateMite = false;
    for (const n of neighbors) {
        if (n.nx < 0 || n.nx >= cols || n.ny < 0 || n.ny >= rows) continue;
        
        if (grid[n.nx][n.ny] === E.Mite) {
            grid[n.nx][n.ny] = E.Empty; 
            meta[x][y] = Math.min((meta[x][y] || 0) + 0.05, 1.0); 
            moved[n.nx][n.ny] = true;
            ateMite = true;
            break;
        }
    }

    let dx = dirX[x][y];
    let dy = dirY[x][y];
    if (dx === 0 && dy === 0) {
        dx = Math.random() < 0.5 ? -1 : 1;
        dy = 0;
    }

    const isBursting = Math.abs(dx) > 1 || Math.abs(dy) > 1;

    // Decay burst back to normal speed
    if (isBursting && !ateMite && Math.random() < 0.25) {
        dx = Math.sign(dx);
        dy = Math.sign(dy);
    }

    // 4. ORGANIC DEPTH EXPLORATION 
    if (!ateMite && !isBursting) {
        if (Math.random() < 0.15) {
            let r = Math.random();
            if (r < 0.3) dy = 1;       
            else if (r < 0.6) dy = -1; 
            else dy = 0;               
        }
        
        if (Math.random() < 0.05) dx = -dx;
        if (dx === 0) dx = Math.random() < 0.5 ? -1 : 1; 
    }

    if (ateMite) {
        if (dx !== 0) dx = Math.sign(dx) * 2;
        dy = 0;
    }

    // 5. SLOWER SPEED PACING
    if (!isBursting && !ateMite && Math.random() < 0.85) {
        moved[x][y] = true;
        return;
    }

    let moveDx = Math.sign(dx);
    if (moveDx === 0) moveDx = Math.random() < 0.5 ? -1 : 1;
    let moveDy = Math.sign(dy);

    let nx = x + moveDx;
    let ny = y + moveDy;

    // 6. SMART BOUNCING
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && (grid[nx][ny] === E.Water || grid[nx][ny] === E.Fish)) {
        // Safe path ahead
    } else {
        if (ny < 0 || (ny >= 0 && ny < rows && (grid[x][ny] === E.Empty || grid[x][ny] === E.Smoke || grid[x][ny] === E.Gas))) {
            moveDy = 1; dy = 1;
        }
        else if (ny >= rows || (ny >= 0 && ny < rows && grid[x][ny] !== E.Water && grid[x][ny] !== E.Fish)) {
            moveDy = -1; dy = -1;
        }
        else {
            moveDx = -moveDx; dx = -dx;
            if (dy === 0) { 
                moveDy = Math.random() < 0.5 ? -1 : 1; 
                dy = moveDy; 
            }
        }
        nx = x + moveDx;
        ny = y + moveDy;
    }

    dirX[x][y] = dx;
    dirY[x][y] = dy;

    // 7. LIQUID PHASING MOVEMENT
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        let target = grid[nx][ny];

        if (target === E.Water) {
            grid[nx][ny] = E.Fish;
            meta[nx][ny] = meta[x][y];
            dirX[nx][ny] = dx;
            dirY[nx][ny] = dy;

            grid[x][y] = E.Water;
            meta[x][y] = 0;
            
            moved[nx][ny] = true;
            moved[x][y] = true;
        } else if (target === E.Fish) {
            swapGrids(x, y, nx, ny);
        } else {
            dirX[x][y] = -dx;
            moved[x][y] = true;
        }
    } else {
        dirX[x][y] = -dx;
        moved[x][y] = true;
    }
}