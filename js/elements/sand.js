import { grid, cols, rows, E, swapGrids } from '../globals.js';

export function updateSand(x, y) {
    let down = y + 1; 
    let dir = Math.random() > 0.5 ? 1 : -1; 
    
    if (down < rows) {
        let b = grid[x][down];
        let b1 = (x + dir >= 0 && x + dir < cols) ? grid[x + dir][down] : -1;
        let b2 = (x - dir >= 0 && x - dir < cols) ? grid[x - dir][down] : -1;

       
        let canFallSt = (b === E.Empty || b === E.Water);
        let canFallD1 = (b1 === E.Empty || b1 === E.Water);
        let canFallD2 = (b2 === E.Empty || b2 === E.Water);

        if (canFallSt && canFallD1 && Math.random() < 0.15) swapGrids(x, y, x + dir, down);
        else if (canFallSt) swapGrids(x, y, x, down);
        else if (canFallD1) swapGrids(x, y, x + dir, down);
        else if (canFallD2) swapGrids(x, y, x - dir, down);
    }
}