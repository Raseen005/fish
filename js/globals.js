export const isMobile = window.innerWidth <= 768;
export const cols = isMobile ? 200 : 400; 
export const rows = isMobile ? 138 : 275; 

export function scaleVal(val) { return isMobile ? Math.max(1, Math.round(val / 2)) : val; }

export const grid = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
export const meta = new Array(cols).fill(0).map(() => new Array(rows).fill(0)); 
export const dirX = new Array(cols).fill(0).map(() => new Array(rows).fill(1));
export const dirY = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
export const moved = new Array(cols).fill(0).map(() => new Array(rows).fill(false));

export const E = { 
    Empty: 0, Wind: 1, Water: 3, Sand: 4, Fish: 5, Mite: 6, Plant: 7, Seed: 8, 
    Fire: 9, Oil: 10, Lava: 11, Gas: 12, Wall: 13, Ice: 14, Human: 15, Smoke: 16 
};

export const Colors = { 
    0: {r:241, g:245, b:249}, 
    3: {r:2, g:132, b:199},   
    4: {r:212, g:180, b:131},
    9: {r:255, g:100, b:0},   
    13: {r:100, g:116, b:139},
    10: {r:20, g:20, b:20},   
    6: {r:70, g:40, b:50},   
    5: {r:255, g:140, b:20},  
    14: {r:140, g:205, b:245}, 
    11: {r:255, g:60, b:0},   
};
export function swapGrids(x1, y1, x2, y2) {
    let tempG = grid[x1][y1]; grid[x1][y1] = grid[x2][y2]; grid[x2][y2] = tempG;
    moved[x1][y1] = true; moved[x2][y2] = true;
}


export function moveGrids(x1, y1, x2, y2, fill = E.Empty) {
    grid[x2][y2] = grid[x1][y1]; grid[x1][y1] = fill;
    meta[x2][y2] = meta[x1][y1]; meta[x1][y1] = 0;
    dirX[x2][y2] = dirX[x1][y1]; dirX[x1][y1] = 0; 
    dirY[x2][y2] = dirY[x1][y1]; dirY[x1][y1] = 0;
    moved[x1][y1] = true; moved[x2][y2] = true;
}