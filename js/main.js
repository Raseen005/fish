import { isMobile, cols, rows, scaleVal, E, Colors, grid, moved, dirX, dirY, meta } from './globals.js';
import { updateSand } from './elements/sand.js';
import { updateWater } from './elements/water.js';
import { updateIce } from './elements/ice.js';
import { updateFire } from './elements/fire.js';
import { updateLava } from './elements/lava.js';
import { updateOil } from './elements/oil.js';
import { updateMite } from './elements/mite.js';
import { updateFish } from './elements/fish.js'; 
import { updateSeed } from './elements/seed.js';
import { updateGas } from './elements/gas.js'; // IMPORT NEW GAS ELEMENT

const canvas = document.getElementById('gameCanvas');
canvas.width = cols; canvas.height = rows;
const ctx = canvas.getContext('2d', { alpha: false });

const imgData = ctx.createImageData(cols, rows);
const data32 = new Uint32Array(imgData.data.buffer);
const isLittleEndian = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
const bgColor = isLittleEndian ? 0xFFF9F5F1 : 0xF1F5F9FF;

let currentElement = E.Sand; 
let isDrawing = false; 
let frameCount = 0; 
let brushRadius = scaleVal(10); 
let lastMouseX = -1, lastMouseY = -1, hoverX = -1, hoverY = -1;

let itemsSpawnedThisStroke = 0; 

window.scaleVal = scaleVal;
window.setBrush = function(size, btnElement) {
    brushRadius = size;
    document.querySelectorAll('.btn-size').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
};
window.selectElement = function(id, btnElement) {
    currentElement = id;
    document.querySelectorAll('.element-btn').forEach(btn => btn.classList.remove('active-element'));
    if (btnElement) btnElement.classList.add('active-element');
};
window.resetGrid = function() {
    for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) { grid[x][y] = E.Empty; meta[x][y] = 0; }
};

function applyBrush(cx, cy) {
    for(let i = -brushRadius; i <= brushRadius; i++) {
        for(let j = -brushRadius; j <= brushRadius; j++) {
            let nx = cx + i; let ny = cy + j;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (grid[nx][ny] === E.Wall && currentElement !== E.Empty) continue;

                if (currentElement === E.Ice) {
                    let half = Math.floor(brushRadius / 2);
                    if (Math.abs(i) <= half && Math.abs(j) <= half) {
                        grid[nx][ny] = currentElement;
                    }
                } else {
                    if (i*i + j*j <= brushRadius*brushRadius) {
                        
                        if (currentElement === E.Fish || currentElement === E.Seed) {
                            let limit = 25; 
                            if (brushRadius > 5 && brushRadius <= 12) limit = 50; 
                            else if (brushRadius > 12) limit = 100; 

                            if (itemsSpawnedThisStroke >= limit) continue;
                            if (Math.random() > 0.05) continue; 

                            itemsSpawnedThisStroke++;
                            grid[nx][ny] = currentElement; 
                            dirX[nx][ny] = Math.random() > 0.5 ? 1 : -1;
                            dirY[nx][ny] = 0; 
                            meta[nx][ny] = 0;
                            continue;
                        }

                        if (currentElement === E.Sand && Math.random() > 0.4) continue; 
                        if (currentElement === E.Water && Math.random() > 0.6) continue; 
                        if (currentElement === E.Fire && Math.random() > 0.95) continue; 
                        if (currentElement === E.Mite && Math.random() > 0.05) continue; 
                        
                        // Scatter gas loosely
                        if (currentElement === E.Gas && Math.random() > 0.15) continue; 

                        grid[nx][ny] = currentElement; 
                        dirX[nx][ny] = Math.random() > 0.5 ? 1 : -1;
                        dirY[nx][ny] = 0; 
                        meta[nx][ny] = 0;
                    }
                }
            }
        }
    }
}

function getEventCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX; let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    const x = Math.floor(((clientX - rect.left) / rect.width) * cols);
    const y = Math.floor(((clientY - rect.top) / rect.height) * rows);
    return { x, y };
}

function drawOnGrid(e) {
    if (!isDrawing) return;
    const { x, y } = getEventCoords(e);
    
    if (lastMouseX !== -1 && lastMouseY !== -1) {
        let x0 = lastMouseX; let y0 = lastMouseY;
        let x1 = x; let y1 = y;
        let dx = Math.abs(x1 - x0); let dy = -Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1; let sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        
        while (true) {
            applyBrush(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
    } else applyBrush(x, y); 
    lastMouseX = x; lastMouseY = y;
}

function trackHover(e) {
    const { x, y } = getEventCoords(e);
    hoverX = x; hoverY = y;
    if (isDrawing) drawOnGrid(e);
}

canvas.addEventListener('mousedown', (e) => { 
    isDrawing = true; lastMouseX = -1; lastMouseY = -1; 
    itemsSpawnedThisStroke = 0; 
    trackHover(e); 
});
canvas.addEventListener('mousemove', trackHover);
canvas.addEventListener('mouseleave', () => { isDrawing = false; hoverX = -1; hoverY = -1; lastMouseX = -1; });
window.addEventListener('mouseup', () => { isDrawing = false; lastMouseX = -1; });

canvas.addEventListener('touchstart', (e) => { 
    e.preventDefault(); isDrawing = true; lastMouseX = -1; lastMouseY = -1; 
    itemsSpawnedThisStroke = 0; 
    trackHover(e); 
}, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); trackHover(e); }, { passive: false });
window.addEventListener('touchend', () => { isDrawing = false; hoverX = -1; hoverY = -1; lastMouseX = -1; });

let fishesX = new Int32Array(50000);
let fishesY = new Int32Array(50000);
let fishCount = 0;

function updateGrid() {
    frameCount++;
    for(let i = 0; i < cols; i++) moved[i].fill(false);
    let sweepDir = frameCount % 2 === 0 ? 1 : -1; 

    for (let y = rows - 1; y >= 0; y--) {
        for (let i = 0; i < cols; i++) {
            let x = sweepDir === 1 ? i : cols - 1 - i;
            if (moved[x][y]) continue; 
            
            let id = grid[x][y];
            if (id === E.Empty || id === E.Wall) continue;
            
            switch(id) {
                case E.Sand: updateSand(x, y); break;
                case E.Water: updateWater(x, y); break; 
                case E.Ice: updateIce(x, y); break; 
                case E.Fire: updateFire(x, y); break; 
                case E.Lava: updateLava(x, y); break; 
                case E.Oil: updateOil(x, y); break; 
                case E.Mite: updateMite(x, y); break; 
                case E.Fish: updateFish(x, y); break;
                case E.Seed: updateSeed(x, y); break;
                case E.Gas: updateGas(x, y); break; // REGISTERS THE GAS LOGIC
            }
        }
    }
}

function draw() {
    data32.fill(bgColor);
    fishCount = 0; 

    // PASS 1: BACKGROUND & PLANTS
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let id = grid[x][y];
            if (id === E.Empty) continue; 
            
            if (id === E.Fish) {
                if (fishCount < fishesX.length) {
                    fishesX[fishCount] = x;
                    fishesY[fishCount] = y;
                    fishCount++;
                }
                continue; 
            }
            
            let c = Colors[id] || {r: 255, g: 0, b: 255}; 
            let rInt = c.r | 0, gInt = c.g | 0, bInt = c.b | 0;

            if (id === E.Water) {
                let shimmer = (Math.random() * 12) | 0; 
                bInt = Math.max(0, Math.min(255, bInt + shimmer + 10)); 
            } 
            else if (id === E.Wall) {
                let noise = ((x * 12345 + y * 67890) % 25) - 10; 
                let r = rInt + noise, g = gInt + noise, b = bInt + noise;
                if (x % 14 === 0 || y % 14 === 0) { r -= 25; g -= 25; b -= 25; } 
                else if (x % 14 === 1 || y % 14 === 1) { r += 15; g += 15; b += 15; }
                rInt = Math.max(0, Math.min(255, r)); gInt = Math.max(0, Math.min(255, g)); bInt = Math.max(0, Math.min(255, b));
            }
            else if (id === E.Ice) {
                let hasLeft = (x > 0 && grid[x - 1][y] === E.Ice);
                let hasRight = (x < cols - 1 && grid[x + 1][y] === E.Ice);
                let hasTop = (y > 0 && grid[x][y - 1] === E.Ice);
                let hasBottom = (y < rows - 1 && grid[x][y + 1] === E.Ice);
                if (!hasLeft || !hasRight || !hasTop || !hasBottom) { rInt=220; gInt=240; bInt=255; } 
                else { rInt=140; gInt=205; bInt=245; }
            }
            else if (id === E.Fire) {
                let flicker = Math.random();
                rInt = 255; gInt = 50 + (flicker * 100); bInt = 0; 
            }
            else if (id === E.Lava) {
                let flicker = Math.random();
                if (flicker > 0.96) { rInt = 255; gInt = 255; bInt = 150; }
                else if (flicker > 0.6) { rInt = 255; gInt = 90 + (Math.random() * 30); bInt = 0; }
                else { rInt = 220 + (Math.random() * 30); gInt = 15; bInt = 0; }
                rInt = Math.max(0, Math.min(255, rInt)); gInt = Math.max(0, Math.min(255, gInt)); bInt = Math.max(0, Math.min(255, bInt));
            }
            // LIGHT GREEN GAS SHADER
            else if (id === E.Gas) {
                let flicker = Math.random() * 25;
                rInt = 150 + flicker; gInt = 230 + flicker; bInt = 100 + flicker; 
            }
            else if (id === E.Seed) {
                let state = meta[x][y] || 0;
                
                if (state === 0) {
                    rInt = 140; gInt = 80; bInt = 30; // Dormant Seed
                } else {
                    rInt = 34; gInt = 160 + (Math.random() * 40); bInt = 50; // Stem
                    if (state === 1) { rInt = 100; gInt = 230; bInt = 100; } // Growing Tip

                    if (state < 0) {
                        let fr = 255, fg = 255, fb = 255;
                        if (state === -1) { fr = 255; fg = 100; fb = 150; } 
                        else if (state === -2) { fr = 100; fg = 150; fb = 255; } 
                        else if (state === -3) { fr = 255; fg = 220; fb = 50; } 
                        else if (state === -4) { fr = 200; fg = 50; fb = 255; } 
                        else if (state === -5) { fr = 255; fg = 80; fb = 50; } 

                        let fColor = isLittleEndian ? (255 << 24) | (fb << 16) | (fg << 8) | fr : (fr << 24) | (fg << 16) | (fb << 8) | 255;
                        
                        let petals = [ {px: x, py: y - 1}, {px: x - 1, py: y}, {px: x + 1, py: y}, {px: x, py: y + 1} ];
                        for (let p of petals) {
                            if (p.px >= 0 && p.px < cols && p.py >= 0 && p.py < rows) {
                                if (grid[p.px][p.py] === E.Empty || grid[p.px][p.py] === E.Water || grid[p.px][p.py] === E.Gas) {
                                    data32[p.py * cols + p.px] = fColor; 
                                }
                            }
                        }
                        rInt = 255; gInt = 220; bInt = 0; 
                    }
                }
            }
            else if (id === E.Mite) {
                let growth = meta[x][y] || 0;
                let wiggle = (Math.random() * 20) | 0;
                rInt = 60 + wiggle; gInt = 30 + wiggle; bInt = 40 + wiggle;

                let size = Math.floor(growth / 4); 
                if (size > 0) {
                    for (let i = -size; i <= size; i++) {
                        for (let j = -size; j <= size; j++) {
                            if (Math.abs(i) + Math.abs(j) <= size) { 
                                let mx = x + i, my = y + j;
                                if (mx >= 0 && mx < cols && my >= 0 && my < rows) {
                                    let bg = grid[mx][my];
                                    if (bg === E.Empty || bg === E.Seed || bg === E.Mite || bg === E.Water || bg === E.Gas) {
                                        let br = Math.max(0, rInt - (Math.abs(i)*15));
                                        let bg_col = Math.max(0, gInt - (Math.abs(i)*15));
                                        let bb = Math.max(0, bInt - (Math.abs(i)*15));
                                        data32[my * cols + mx] = isLittleEndian ? (255 << 24) | (bb << 16) | (bg_col << 8) | br : (br << 24) | (bg_col << 16) | (bb << 8) | 255;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            data32[y * cols + x] = isLittleEndian ? (255 << 24) | (bInt << 16) | (gInt << 8) | rInt : (rInt << 24) | (gInt << 16) | (bInt << 8) | 255;
        } 
    } 

    // PASS 2: DRAW FISH ON TOP
    for (let i = 0; i < fishCount; i++) {
        let x = fishesX[i]; let y = fishesY[i];
        let growth = meta[x][y] || 0;
        let fDirX = Math.sign(dirX[x][y]);
        let fDirY = Math.sign(dirY[x][y]);
        let isBursting = Math.abs(dirX[x][y]) > 1 || Math.abs(dirY[x][y]) > 1;

        if (fDirX === 0 && fDirY === 0) fDirX = 1; 
        
        let rInt = 250, gInt = 130, bInt = 30; 
        if (isBursting && frameCount % 6 < 3) { rInt = 255; gInt = 180; bInt = 50; }

        let extraLength = Math.floor(growth);
        let totalLength = 1 + extraLength; 
        let tx = x; let ty = y;

        for (let j = 1; j <= totalLength; j++) {
            tx = x - (fDirX * j); ty = y - (fDirY * j);
            if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
                let bg = grid[tx][ty];
                if (bg === E.Water || bg === E.Empty || bg === E.Fish || bg === E.Seed || bg === E.Gas) {
                    let tr = Math.max(150, 230 - (j * 20));
                    let tg = Math.max(50, 100 - (j * 15));
                    let tb = 20;
                    data32[ty * cols + tx] = isLittleEndian ? (255 << 24) | (tb << 16) | (tg << 8) | tr : (tr << 24) | (tg << 16) | (tb << 8) | 255;
                }
            }
        }

        if (tx >= 0 && tx < cols && ty >= 0 && ty < rows) {
            let px1 = -1, py1 = -1, px2 = -1, py2 = -1;
            
            if (fDirX !== 0 && fDirY === 0) { 
                px1 = tx; py1 = ty - 1; px2 = tx; py2 = ty + 1;
            } else if (fDirX === 0 && fDirY !== 0) { 
                px1 = tx - 1; py1 = ty; px2 = tx + 1; py2 = ty;
            } else { 
                px1 = tx - fDirX; py1 = ty; px2 = tx; py2 = ty - fDirY;
            }

            let finR = 210, finG = 90, finB = 10;
            let finColor = isLittleEndian ? (255 << 24) | (finB << 16) | (finG << 8) | finR : (finR << 24) | (finG << 16) | (finB << 8) | 255;

            if (px1 >= 0 && px1 < cols && py1 >= 0 && py1 < rows) {
                let bg = grid[px1][py1];
                if (bg === E.Water || bg === E.Empty || bg === E.Fish || bg === E.Seed || bg === E.Gas) data32[py1 * cols + px1] = finColor;
            }
            if (px2 >= 0 && px2 < cols && py2 >= 0 && py2 < rows) {
                let bg = grid[px2][py2];
                if (bg === E.Water || bg === E.Empty || bg === E.Fish || bg === E.Seed || bg === E.Gas) data32[py2 * cols + px2] = finColor;
            }
        }
        data32[y * cols + x] = isLittleEndian ? (255 << 24) | (bInt << 16) | (gInt << 8) | rInt : (rInt << 24) | (gInt << 16) | (bInt << 8) | 255;
    }
    
    ctx.putImageData(imgData, 0, 0);

    if (hoverX >= 0 && hoverY >= 0) {
        let r = 100, g = 116, b = 139; 
        if (currentElement === E.Empty) { r = 255; g = 255; b = 255; }
        else if (Colors[currentElement]) { r = Colors[currentElement].r; g = Colors[currentElement].g; b = Colors[currentElement].b; }

        ctx.beginPath(); 
        if (currentElement === E.Ice) {
            let size = brushRadius * 2;
            ctx.rect(hoverX - brushRadius, hoverY - brushRadius, size, size);
        } else {
            ctx.arc(hoverX, hoverY, brushRadius, 0, Math.PI * 2);
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`; 
        ctx.fill();
        ctx.lineWidth = 1.5;
        
        if (currentElement === E.Empty) { 
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'; 
            ctx.setLineDash([4, 4]); 
        } else { 
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`; 
            ctx.setLineDash([]); 
        }
        
        ctx.stroke(); 
        ctx.setLineDash([]); 
    }
}

function loop() { updateGrid(); draw(); requestAnimationFrame(loop); }
loop();