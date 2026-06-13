// =====================
// WEAPON SYSTEM - Always missile on wrong answer
// =====================

function fireAlienMissile(onImpact) {
    const battleScene = document.getElementById("battleScene");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    if (!battleScene || !alienWrapper || !earthWrapper) {
        if (onImpact) onImpact();
        return;
    }

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();
    const sceneRect = battleScene.getBoundingClientRect();

    const startX = alienRect.right - sceneRect.left - 10;
    const startY = alienRect.top + alienRect.height / 2 - sceneRect.top;
    const endX = earthRect.left - sceneRect.left + 30;
    const endY = earthRect.top + earthRect.height / 2 - sceneRect.top;

    // Missile body
    const missile = document.createElement("div");
    missile.style.cssText = `
        position:absolute;
        width:28px; height:10px;
        background:linear-gradient(to right, #ff4400, #ffaa00, #ffffff);
        border-radius:5px 2px 2px 5px;
        left:${startX}px;
        top:${startY - 5}px;
        box-shadow: 0 0 14px #ff6600, 0 0 6px #fff;
        z-index:20;
        pointer-events:none;
    `;

    // Flame trail
    const trail = document.createElement("div");
    trail.style.cssText = `
        position:absolute;
        width:50px; height:4px;
        background:linear-gradient(to left, transparent, rgba(255,80,0,0.8), rgba(255,200,0,0.4));
        border-radius:2px;
        left:${startX - 50}px;
        top:${startY - 2}px;
        z-index:19;
        pointer-events:none;
    `;

    // Smoke particles
    const smoke = document.createElement("div");
    smoke.style.cssText = `
        position:absolute;
        width:8px; height:8px;
        background:rgba(200,200,200,0.4);
        border-radius:50%;
        left:${startX - 10}px;
        top:${startY - 4}px;
        z-index:18;
        pointer-events:none;
    `;

    battleScene.appendChild(missile);
    battleScene.appendChild(trail);
    battleScene.appendChild(smoke);

    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    missile.style.transform = `rotate(${angle}deg)`;

    let progress = 0;
    const steps = 45;
    const missileAnim = setInterval(() => {
        progress++;
        const t = progress / steps;
        const arcY = -Math.sin(t * Math.PI) * 25;
        const curX = startX + dx * t;
        const curY = startY + dy * t + arcY;

        missile.style.left = curX + "px";
        missile.style.top = (curY - 5) + "px";
        trail.style.left = (curX - 50) + "px";
        trail.style.top = (curY - 2) + "px";
        smoke.style.left = (curX - 15) + "px";
        smoke.style.top = (curY - 4 + Math.random() * 4 - 2) + "px";
        smoke.style.opacity = 0.3 + Math.random() * 0.3;

        // Rotate missile to follow arc
        const currentAngle = Math.atan2(dy + arcY * Math.cos(t * Math.PI) * Math.PI, dx) * (180 / Math.PI);
        missile.style.transform = `rotate(${currentAngle}deg)`;

        if (progress >= steps) {
            clearInterval(missileAnim);
            missile.remove(); trail.remove(); smoke.remove();

            // Big explosion at earth
            const exp = document.createElement("div");
            exp.style.cssText = `
                position:absolute;
                left:${endX - 40}px; top:${endY - 40}px;
                width:80px; height:80px;
                border-radius:50%;
                background:radial-gradient(circle, #ffffff 0%, #ffdd00 25%, #ff6600 55%, #ff2200 75%, transparent 100%);
                z-index:25; pointer-events:none;
                animation: missileExplode 0.6s ease-out forwards;
            `;

            // Shockwave ring
            const shockwave = document.createElement("div");
            shockwave.style.cssText = `
                position:absolute;
                left:${endX - 10}px; top:${endY - 10}px;
                width:20px; height:20px;
                border: 3px solid rgba(255,150,0,0.9);
                border-radius:50%;
                z-index:24; pointer-events:none;
                animation: shockwaveExpand 0.5s ease-out forwards;
            `;

            battleScene.appendChild(exp);
            battleScene.appendChild(shockwave);

            if (!document.getElementById("missileStyle")) {
                const style = document.createElement("style");
                style.id = "missileStyle";
                style.textContent = `
                    @keyframes missileExplode{0%{transform:scale(0);opacity:1}60%{transform:scale(2.2);opacity:0.8}100%{transform:scale(3);opacity:0}}
                    @keyframes shockwaveExpand{0%{transform:scale(1);opacity:1}100%{transform:scale(8);opacity:0}}
                `;
                document.head.appendChild(style);
            }

            setTimeout(() => { exp.remove(); shockwave.remove(); if (onImpact) onImpact(); }, 600);
        }
    }, 16);
}

// Always fire missile
function fireWeapon(onImpact) {
    fireAlienMissile(onImpact);
}
