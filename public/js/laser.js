// =====================
// MISSILE SYSTEM
// Always fires missile from top-left alien ship to bottom-right earth
// =====================

function fireAlienMissile(onImpact) {
    const layer = document.getElementById("missileLayer");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    if (!layer || !alienWrapper || !earthWrapper) {
        if (onImpact) onImpact();
        return;
    }

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();

    // Start: bottom-right of alien ship
    const startX = alienRect.right - 20;
    const startY = alienRect.bottom - 20;

    // End: center-left of earth (visible part)
    const endX = earthRect.left + 60;
    const endY = earthRect.top + 80;

    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Missile element
    const missile = document.createElement("div");
    missile.style.cssText = `
        position:fixed;
        width:32px; height:10px;
        background:linear-gradient(to right, #660000, #ff4400, #ffaa00, #ffffff);
        border-radius:5px 2px 2px 5px;
        left:${startX}px; top:${startY - 5}px;
        box-shadow: 0 0 16px #ff3300, 0 0 6px #ff8800;
        transform: rotate(${angle}deg);
        transform-origin: left center;
        z-index:100; pointer-events:none;
    `;

    // Flame trail
    const trail = document.createElement("div");
    trail.style.cssText = `
        position:fixed;
        width:55px; height:5px;
        background:linear-gradient(to left, transparent, rgba(255,60,0,0.9), rgba(255,200,0,0.5));
        border-radius:3px;
        left:${startX - 55}px; top:${startY - 2}px;
        transform: rotate(${angle}deg);
        transform-origin: right center;
        z-index:99; pointer-events:none;
    `;

    layer.appendChild(missile);
    layer.appendChild(trail);

    let progress = 0;
    const steps = 50;

    const anim = setInterval(() => {
        progress++;
        const t = progress / steps;
        // Slight arc
        const arc = Math.sin(t * Math.PI) * -30;
        const curX = startX + dx * t;
        const curY = startY + dy * t + arc;

        const curAngle = Math.atan2(dy + arc * Math.cos(t * Math.PI) * Math.PI / steps, dx) * (180 / Math.PI);

        missile.style.left = curX + "px";
        missile.style.top = (curY - 5) + "px";
        missile.style.transform = `rotate(${curAngle}deg)`;
        trail.style.left = (curX - 55) + "px";
        trail.style.top = (curY - 2) + "px";
        trail.style.transform = `rotate(${curAngle}deg)`;

        if (progress >= steps) {
            clearInterval(anim);
            missile.remove(); trail.remove();

            // Explosion at impact
            const exp = document.createElement("div");
            exp.style.cssText = `
                position:fixed;
                left:${endX - 45}px; top:${endY - 45}px;
                width:90px; height:90px;
                border-radius:50%;
                background:radial-gradient(circle, #fff 0%, #ffdd00 20%, #ff6600 50%, #ff2200 75%, transparent 100%);
                z-index:101; pointer-events:none;
                animation: impactExplode 0.55s ease-out forwards;
            `;

            const shock = document.createElement("div");
            shock.style.cssText = `
                position:fixed;
                left:${endX - 8}px; top:${endY - 8}px;
                width:16px; height:16px;
                border: 3px solid rgba(255,140,0,0.9);
                border-radius:50%;
                z-index:100; pointer-events:none;
                animation: shockExpand 0.5s ease-out forwards;
            `;

            layer.appendChild(exp);
            layer.appendChild(shock);

            if (!document.getElementById("impactStyle")) {
                const s = document.createElement("style");
                s.id = "impactStyle";
                s.textContent = `
                    @keyframes impactExplode{0%{transform:scale(0);opacity:1}60%{transform:scale(2.2);opacity:0.8}100%{transform:scale(3.2);opacity:0}}
                    @keyframes shockExpand{0%{transform:scale(1);opacity:1}100%{transform:scale(10);opacity:0}}
                `;
                document.head.appendChild(s);
            }

            setTimeout(() => { exp.remove(); shock.remove(); if (onImpact) onImpact(); }, 600);
        }
    }, 16);
}

function fireWeapon(onImpact) {
    fireAlienMissile(onImpact);
}
