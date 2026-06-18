let shieldHealth = 100;

function initShield() {
    const earthWrapper = document.getElementById("earthWrapper");
    const existing = document.getElementById("shieldCanvas");
    if (existing) existing.remove();

    const shieldCanvas = document.createElement("canvas");
    shieldCanvas.id = "shieldCanvas";
    shieldCanvas.width = 380;
    shieldCanvas.height = 380;
    shieldCanvas.style.cssText = `
        position:absolute;
        top:0; left:0;
        pointer-events:none;
        z-index:10;
    `;
    earthWrapper.appendChild(shieldCanvas);
    drawShield();
}

function drawShield() {
    const canvas = document.getElementById("shieldCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 380, 380);

    const cx = 190, cy = 190, r = 185;
    const pct = shieldHealth;
    if (pct <= 0) return;

    let color, opacity;
    if (pct > 75) { color = "rgba(0,180,255,"; opacity = 0.32; }
    else if (pct > 50) { color = "rgba(0,120,255,"; opacity = 0.26; }
    else if (pct > 25) { color = "rgba(255,140,0,"; opacity = 0.24; }
    else { color = "rgba(255,50,0,"; opacity = 0.2; }

    // Outer glow
    const grd = ctx.createRadialGradient(cx, cy, r*0.85, cx, cy, r*1.08);
    grd.addColorStop(0, color + "0)");
    grd.addColorStop(0.5, color + (opacity*0.5) + ")");
    grd.addColorStop(1, color + "0)");
    ctx.beginPath(); ctx.arc(cx, cy, r*1.08, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Shield ring
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = color + (opacity*2.2) + ")";
    ctx.lineWidth = pct > 50 ? 3 : 2;
    ctx.stroke();

    // Hex grid
    if (pct > 25) {
        ctx.save();
        ctx.globalAlpha = (pct/100) * 0.25;
        ctx.strokeStyle = color + "1)";
        ctx.lineWidth = 0.5;
        const hexSize = 22;
        for (let row = -9; row < 10; row++) {
            for (let col = -9; col < 10; col++) {
                const hx = cx + col * hexSize * 1.73 + (row%2) * hexSize * 0.87;
                const hy = cy + row * hexSize * 1.5;
                if (Math.sqrt((hx-cx)**2+(hy-cy)**2) > r*0.92) continue;
                drawHex(ctx, hx, hy, hexSize*0.88);
            }
        }
        ctx.restore();
    }

    if (pct <= 74) drawCracks(ctx, cx, cy, r, pct);
    if (pct <= 49) drawSparks(ctx, cx, cy, r, pct);

    // Flicker
    if (pct <= 24 && Math.random() > 0.35) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.strokeStyle = color + (Math.random()*0.5) + ")";
        ctx.lineWidth = 1; ctx.stroke();
    }
}

function drawHex(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI/3)*i - Math.PI/6;
        i===0 ? ctx.moveTo(x+size*Math.cos(a), y+size*Math.sin(a)) : ctx.lineTo(x+size*Math.cos(a), y+size*Math.sin(a));
    }
    ctx.closePath(); ctx.stroke();
}

function drawCracks(ctx, cx, cy, r, pct) {
    const num = pct > 50 ? 3 : pct > 25 ? 7 : 12;
    ctx.save();
    ctx.strokeStyle = pct > 50 ? "rgba(150,200,255,0.7)" : pct > 25 ? "rgba(255,150,50,0.8)" : "rgba(255,80,0,0.9)";
    ctx.lineWidth = pct > 50 ? 1.2 : 1.8;
    const seeds = [0.2,0.8,1.4,2.1,2.7,3.3,3.9,4.5,5.1,5.7,0.5,1.1];
    for (let i = 0; i < num; i++) {
        const angle = seeds[i%seeds.length];
        const startR = r*0.45, endR = r*(0.82+i%3*0.06);
        ctx.beginPath();
        ctx.moveTo(cx+startR*Math.cos(angle), cy+startR*Math.sin(angle));
        const midR = startR+(endR-startR)*0.5;
        const midA = angle+0.18*(i%2===0?1:-1);
        ctx.lineTo(cx+midR*Math.cos(midA), cy+midR*Math.sin(midA));
        ctx.lineTo(cx+endR*Math.cos(angle+0.06), cy+endR*Math.sin(angle+0.06));
        if (pct<=49) {
            ctx.moveTo(cx+midR*Math.cos(midA), cy+midR*Math.sin(midA));
            const bA = midA+0.35;
            ctx.lineTo(cx+(midR*0.65)*Math.cos(bA), cy+(midR*0.65)*Math.sin(bA));
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawSparks(ctx, cx, cy, r, pct) {
    const num = Math.floor((1-pct/49)*10);
    ctx.save();
    for (let i=0; i<num; i++) {
        if (Math.random()>0.45) continue;
        const a = Math.random()*Math.PI*2;
        const sr = r*(0.84+Math.random()*0.16);
        ctx.beginPath();
        ctx.arc(cx+sr*Math.cos(a), cy+sr*Math.sin(a), 1.5+Math.random()*2.5, 0, Math.PI*2);
        ctx.fillStyle = pct>25 ? `rgba(255,${150+Math.random()*100},0,${0.6+Math.random()*0.4})` : `rgba(255,${Math.random()*60},0,${0.7+Math.random()*0.3})`;
        ctx.fill();
    }
    ctx.restore();
}

function hitShield(amount) {
    shieldHealth = Math.max(0, shieldHealth - amount);
    const canvas = document.getElementById("shieldCanvas");
    if (canvas) { canvas.style.filter="brightness(3)"; setTimeout(()=>{canvas.style.filter="";},120); }
    drawShield();
    return shieldHealth;
}

function animateShieldImpact() {
    const canvas = document.getElementById("shieldCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    const impact = setInterval(() => {
        drawShield();
        ctx.beginPath();
        ctx.arc(190, 190, 50+frame*12, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(255,200,0,${0.7-frame*0.12})`;
        ctx.lineWidth = 3-frame*0.4;
        ctx.stroke();
        frame++;
        if (frame>5) clearInterval(impact);
    }, 40);
}

function collapseShield(onComplete) {
    const canvas = document.getElementById("shieldCanvas");
    if (!canvas) { if (onComplete) onComplete(); return; }
    const ctx = canvas.getContext("2d");
    const cx=190, cy=190, r=185;
    let frame=0;
    const total=70;

    const anim = setInterval(()=>{
        frame++;
        const t=frame/total;
        ctx.clearRect(0,0,380,380);
        const curR = r*(1-t*0.35);
        const op = 1-t;

        if (Math.random()>0.25) {
            ctx.beginPath(); ctx.arc(cx,cy,curR,0,Math.PI*2);
            ctx.strokeStyle = `rgba(255,${Math.floor(80*(1-t))},0,${op})`;
            ctx.lineWidth = 2+Math.random()*4; ctx.stroke();
        }

        // Pieces flying off
        const pieces = Math.floor(t*25);
        for (let i=0;i<pieces;i++) {
            const a=(i/pieces)*Math.PI*2+t*6;
            const pr=curR+t*100*Math.random();
            const ps=(1-t)*10+2;
            ctx.beginPath();
            ctx.rect(cx+pr*Math.cos(a)-ps/2, cy+pr*Math.sin(a)-ps/2, ps, ps);
            ctx.fillStyle = `rgba(0,${Math.floor(120*(1-t))},255,${op*0.9})`;
            ctx.fill();
        }

        // Electric sparks
        for (let i=0;i<6;i++) {
            if (Math.random()>0.45) continue;
            const a=Math.random()*Math.PI*2;
            const len=25+Math.random()*50;
            ctx.beginPath();
            ctx.moveTo(cx+curR*Math.cos(a), cy+curR*Math.sin(a));
            ctx.lineTo(cx+(curR+len)*Math.cos(a+0.25), cy+(curR+len)*Math.sin(a+0.25));
            ctx.strokeStyle=`rgba(255,255,0,${Math.random()*op})`;
            ctx.lineWidth=1.5; ctx.stroke();
        }

        drawCracks(ctx, cx, cy, curR, 1);

        if (frame>=total) {
            clearInterval(anim);
            ctx.clearRect(0,0,380,380);
            ctx.beginPath(); ctx.arc(cx,cy,r*1.4,0,Math.PI*2);
            ctx.fillStyle="rgba(255,80,0,0.35)"; ctx.fill();
            setTimeout(()=>{ ctx.clearRect(0,0,380,380); if(onComplete) onComplete(); },200);
        }
    }, 22);
}

setInterval(()=>{
    if (shieldHealth>0 && shieldHealth<=49) { if(Math.random()>0.6) drawShield(); }
},130);
