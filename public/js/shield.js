// =====================
// SHIELD SYSTEM
// =====================

let shieldHealth = 100;

function initShield() {
    const earthWrapper = document.getElementById("earthWrapper");
    
    // Create shield canvas overlay
    const shieldCanvas = document.createElement("canvas");
    shieldCanvas.id = "shieldCanvas";
    shieldCanvas.width = 220;
    shieldCanvas.height = 220;
    shieldCanvas.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
    `;
    earthWrapper.appendChild(shieldCanvas);
    drawShield();
}

function drawShield() {
    const canvas = document.getElementById("shieldCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 220, 220);
    
    const cx = 110, cy = 110, r = 100;
    const pct = shieldHealth;

    if (pct <= 0) return; // Shield gone

    // Shield color based on health
    let color, opacity, glowColor;
    if (pct > 75) {
        color = "rgba(0, 180, 255,";
        glowColor = "#00b4ff";
        opacity = 0.35;
    } else if (pct > 50) {
        color = "rgba(0, 120, 255,";
        glowColor = "#0077ff";
        opacity = 0.28;
    } else if (pct > 25) {
        color = "rgba(255, 140, 0,";
        glowColor = "#ff8c00";
        opacity = 0.25;
    } else {
        color = "rgba(255, 50, 0,";
        glowColor = "#ff3200";
        opacity = 0.2;
    }

    // Outer glow
    const grd = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.1);
    grd.addColorStop(0, color + "0)");
    grd.addColorStop(0.5, color + (opacity * 0.6) + ")");
    grd.addColorStop(1, color + "0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Shield bubble
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = color + (opacity * 2.5) + ")";
    ctx.lineWidth = pct > 50 ? 3 : 2;
    ctx.stroke();

    // Hexagonal grid pattern
    if (pct > 25) {
        ctx.save();
        ctx.globalAlpha = (pct / 100) * 0.3;
        ctx.strokeStyle = color + "1)";
        ctx.lineWidth = 0.5;
        const hexSize = 18;
        for (let row = -6; row < 7; row++) {
            for (let col = -6; col < 7; col++) {
                const hx = cx + col * hexSize * 1.73 + (row % 2) * hexSize * 0.87;
                const hy = cy + row * hexSize * 1.5;
                const dist = Math.sqrt((hx - cx) ** 2 + (hy - cy) ** 2);
                if (dist > r * 0.9) continue;
                drawHex(ctx, hx, hy, hexSize * 0.9);
            }
        }
        ctx.restore();
    }

    // CRACKS based on damage
    if (pct <= 74) {
        drawCracks(ctx, cx, cy, r, pct);
    }

    // SPARKS when low
    if (pct <= 49) {
        drawSparks(ctx, cx, cy, r, pct);
    }

    // FLICKERING effect when critical
    if (pct <= 24) {
        if (Math.random() > 0.3) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = color + (Math.random() * 0.6) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawCracks(ctx, cx, cy, r, pct) {
    const numCracks = pct > 50 ? 3 : pct > 25 ? 6 : 10;
    ctx.save();
    ctx.strokeStyle = pct > 50 ? "rgba(150,200,255,0.7)" : pct > 25 ? "rgba(255,150,50,0.8)" : "rgba(255,80,0,0.9)";
    ctx.lineWidth = pct > 50 ? 1 : 1.5;

    // Seeded cracks (deterministic based on health stage)
    const crackSeeds = [0.2, 0.8, 1.4, 2.1, 2.7, 3.3, 3.9, 4.5, 5.1, 5.7];
    for (let i = 0; i < numCracks; i++) {
        const angle = crackSeeds[i % crackSeeds.length];
        const startR = r * 0.5;
        const endR = r * (0.85 + (i % 3) * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx + startR * Math.cos(angle), cy + startR * Math.sin(angle));
        // Jagged crack
        const midR = startR + (endR - startR) * 0.5;
        const midAngle = angle + 0.15 * (i % 2 === 0 ? 1 : -1);
        ctx.lineTo(cx + midR * Math.cos(midAngle), cy + midR * Math.sin(midAngle));
        ctx.lineTo(cx + endR * Math.cos(angle + 0.05), cy + endR * Math.sin(angle + 0.05));
        // Branch crack
        if (pct <= 49) {
            ctx.moveTo(cx + midR * Math.cos(midAngle), cy + midR * Math.sin(midAngle));
            const branchAngle = midAngle + 0.3;
            ctx.lineTo(cx + (midR * 0.7) * Math.cos(branchAngle), cy + (midR * 0.7) * Math.sin(branchAngle));
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawSparks(ctx, cx, cy, r, pct) {
    const numSparks = Math.floor((1 - pct / 49) * 8);
    ctx.save();
    for (let i = 0; i < numSparks; i++) {
        if (Math.random() > 0.4) continue;
        const angle = Math.random() * Math.PI * 2;
        const sparkR = r * (0.85 + Math.random() * 0.15);
        const sx = cx + sparkR * Math.cos(angle);
        const sy = cy + sparkR * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = pct > 25 ? `rgba(255,${150+Math.random()*100},0,${0.6+Math.random()*0.4})` : `rgba(255,${Math.random()*80},0,${0.7+Math.random()*0.3})`;
        ctx.fill();
    }
    ctx.restore();
}

function hitShield(amount) {
    shieldHealth = Math.max(0, shieldHealth - amount);
    
    // Flash effect
    const canvas = document.getElementById("shieldCanvas");
    if (canvas) {
        canvas.style.filter = "brightness(3)";
        setTimeout(() => { canvas.style.filter = ""; }, 150);
    }
    
    drawShield();
    return shieldHealth;
}

function animateShieldImpact(x, y) {
    const canvas = document.getElementById("shieldCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    const impact = setInterval(() => {
        drawShield();
        // Impact ripple
        ctx.beginPath();
        ctx.arc(110, 110, 40 + frame * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,200,0,${0.8 - frame * 0.13})`;
        ctx.lineWidth = 3 - frame * 0.4;
        ctx.stroke();
        frame++;
        if (frame > 6) clearInterval(impact);
    }, 40);
}

// Animate shield flicker continuously when critical
setInterval(() => {
    if (shieldHealth > 0 && shieldHealth <= 24) drawShield();
    else if (shieldHealth > 0 && shieldHealth <= 49) {
        // Occasional spark redraw
        if (Math.random() > 0.7) drawShield();
    }
}, 120);
