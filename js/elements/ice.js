import { grid, cols, rows, E, swapGrids, moved } from '../globals.js';

const MELT_RATE = 0.002; 

export function updateIce(x, y) {
    let down = y + 1; 

    
    if (down < rows) {
        let b = grid[x][down];
        if (b === E.Empty || b === E.Water) {
            swapGrids(x, y, x, down);
            moved[x][down] = true;
            return;
        }
    }

   
    let neighbors = [
        {nx: x + 1, ny: y}, {nx: x - 1, ny: y},
        {nx: x, ny: y + 1}, {nx: x, ny: y - 1}
    ];
    
    let touchCount = 0;
    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            if (grid[n.nx][n.ny] === E.Water || grid[n.nx][n.ny] === E.Empty) {
                touchCount++;
            }
        }
    }

    if (touchCount > 0 && Math.random() < MELT_RATE) {
        grid[x][y] = E.Water;
        moved[x][y] = true;
    }
}