import { grid, cols, rows, E, swapGrids, moved } from '../globals.js';

export function updateLava(x, y) {
    let down = y + 1; 
    let dir = Math.random() > 0.5 ? 1 : -1; 
    let movedDown = false;

    
    if (y - 1 >= 0 && grid[x][y - 1] === E.Empty && Math.random() < 0.08) {
        grid[x][y - 1] = E.Fire;
        moved[x][y - 1] = true;
    }

   
    let neighbors = [
        {nx: x, ny: y + 1}, {nx: x - 1, ny: y}, {nx: x + 1, ny: y}, {nx: x, ny: y - 1}
    ];
    for (let n of neighbors) {
        if (n.nx >= 0 && n.nx < cols && n.ny >= 0 && n.ny < rows) {
            let id = grid[n.nx][n.ny];
            if (id === E.Water || id === E.Ice) {
                grid[n.nx][n.ny] = E.Fire; 
                moved[n.nx][n.ny] = true;
            }
        }
    }

   
    if (down < rows) {
        let b = grid[x][down];
        let b1 = (x + dir >= 0 && x + dir < cols) ? grid[x + dir][down] : -1;
        let b2 = (x - dir >= 0 && x - dir < cols) ? grid[x - dir][down] : -1;

        if (b === E.Empty) { swapGrids(x, y, x, down); movedDown = true; }
        else if (b1 === E.Empty) { swapGrids(x, y, x + dir, down); movedDown = true; }
        else if (b2 === E.Empty) { swapGrids(x, y, x - dir, down); movedDown = true; }
    }

    
    if (!movedDown) {
        let dispersionRate = 2; 
        let movedHorizontally = false;
        
        for (let i = 1; i <= dispersionRate; i++) {
            let nx = x + (dir * i);
            if (nx < 0 || nx >= cols) break; 
            
            if (grid[nx][y] === E.Empty) {
                swapGrids(x, y, nx, y);
                movedHorizontally = true;
                break;
            } else if (grid[nx][y] !== E.Lava) {
                break; 
            }
        }
        
        if (!movedHorizontally) {
            dir = -dir; 
            for (let i = 1; i <= dispersionRate; i++) {
                let nx = x + (dir * i);
                if (nx < 0 || nx >= cols) break; 
                
                if (grid[nx][y] === E.Empty) {
                    swapGrids(x, y, nx, y);
                    break;
                } else if (grid[nx][y] !== E.Lava) {
                    break; 
                }
            }
        }
    }
}