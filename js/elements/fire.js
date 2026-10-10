import { grid, cols, rows, E, swapGrids, moved } from '../globals.js';

export function updateFire(x, y) {
    let up = y - 1;
    let dir = Math.random() > 0.5 ? 1 : -1;

    
    if (Math.random() < 0.03) {
        grid[x][y] = E.Empty;
        moved[x][y] = true;
        return;
    }

   
    let neighbors = [
        {nx: x, ny: y - 1}, {nx: x, ny: y + 1},
        {nx: x - 1, ny: y}, {nx: x + 1, ny: y},
        {nx: x - 1, ny: y - 1}, {nx: x + 1, ny: y - 1} 
    ];

    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            let id = grid[n.nx][n.ny];
            if (id === E.Ice) {
                grid[n.nx][n.ny] = E.Water; grid[x][y] = E.Empty;
                moved[n.nx][n.ny] = true; moved[x][y] = true; return;
            } else if (id === E.Water) {
                grid[n.nx][n.ny] = E.Empty; grid[x][y] = E.Empty;
                moved[n.nx][n.ny] = true; moved[x][y] = true; return;
            } else if (id === E.Oil) {
                grid[n.nx][n.ny] = E.Fire; 
                moved[n.nx][n.ny] = true;
            }
        }
    }

    
    if (up >= 0) {
        let b = grid[x][up];
        let b1 = (x + dir >= 0 && x + dir < cols) ? grid[x + dir][up] : -1;
        let b2 = (x - dir >= 0 && x - dir < cols) ? grid[x - dir][up] : -1;

        if (b === E.Empty && Math.random() < 0.85) { 
            swapGrids(x, y, x, up);
            moved[x][up] = true;
        } else if (b1 === E.Empty) {
            swapGrids(x, y, x + dir, up);
            moved[x + dir][up] = true;
        } else if (b2 === E.Empty) {
            swapGrids(x, y, x - dir, up);
            moved[x - dir][up] = true;
        }
    }
}