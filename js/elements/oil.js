import { grid, cols, rows, E, swapGrids, moved } from '../globals.js';

export function updateOil(x, y) {
    let down = y + 1;
    let up = y - 1;
    let dir = Math.random() > 0.5 ? 1 : -1;
    let movedDown = false;

    
    if (up >= 0) {
        let w = grid[x][up];
        let w1 = (x + dir >= 0 && x + dir < cols) ? grid[x + dir][up] : -1;
        
        if (w === E.Water) { 
            swapGrids(x, y, x, up); 
            return; 
        } else if (w1 === E.Water) { 
            swapGrids(x, y, x + dir, up); 
            return; 
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
        let dispersionRate = 3; 
        let movedHorizontally = false;
        
        for (let i = 1; i <= dispersionRate; i++) {
            let nx = x + (dir * i);
            if (nx < 0 || nx >= cols) break; 
            
            if (grid[nx][y] === E.Empty) {
                swapGrids(x, y, nx, y);
                movedHorizontally = true;
                break;
            } else if (grid[nx][y] !== E.Oil) {
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
                } else if (grid[nx][y] !== E.Oil) {
                    break; 
                }
            }
        }
    }
}