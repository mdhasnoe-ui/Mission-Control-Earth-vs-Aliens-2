// =====================
// LASER / WEAPON SYSTEM
// =====================

function fireLaserAtEarth(onImpact) {
    const battleScene = document.getElementById("battleScene");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();
    const sceneRect = battleScene.getBoundingClientRect();

    const startX = alienRect.right - sceneRect.left;
    const startY = alienRect.top + alienRect.height / 2 - sceneRect.top;
    const endX = earthRect.left - sceneRect.left;
    const endY = earthRect.top + earthRect.height / 2 - sceneRect.top;

    // Create SVG laser
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:20;overflow:visible;`;

    // Laser beam
    const beam = document.createElementNS("http://www.w3.org/2000/svg", "line");
    beam.setAttribute("x1", startX);
    beam.setAttribute("y1", startY);
    beam.setAttribute("x2", startX);
    beam.setAttribute("y2", startY);
    beam.setAttribute("stroke", "#00ff88");
    beam.setAttribute("stroke-width", "4");
    beam.setAttribute("stroke-linecap", "round");
    beam.setAttribute("filter", "url(#laserGlow)");

    // Glow filter
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
    svg.appendChild(defs);
    svg.appendChild(beam);
    battleScene.appendChild(svg);

    // Animate laser extending toward earth
    let progress = 0;
    const duration = 25; // frames
    const laserAnim = setInterval(() => {
        progress++;
        const t = progress / duration;
        const curX = startX + (endX - startX) * t;
        const curY = startY + (endY - startY) * t;
        beam.setAttribute("x2", curX);
        beam.setAttribute("y2", curY);

        // Color shift as it travels
        const r = Math.floor(0 + t * 255);
        const g = Math.floor(255 - t * 100);
        beam.setAttribute("stroke", `rgb(${r},${g},0)`);

        if (progress >= duration) {
            clearInterval(laserAnim);

            // Impact flash
            beam.setAttribute("stroke", "#ffffff");
            beam.setAttribute("stroke-width", "8");

            // Impact burst at earth
            const burst = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            burst.setAttribute("cx", endX);
            burst.setAttribute("cy", endY);
            burst.setAttribute("r", "10");
            burst.setAttribute("fill", "rgba(255,150,0,0.8)");
            svg.appendChild(burst);

            let burstFrame = 0;
            const burstAnim = setInterval(() => {
                burstFrame++;
                const r2 = 10 + burstFrame * 8;
                const op = 0.8 - burstFrame * 0.13;
                burst.setAttribute("r", r2);
                burst.setAttribute("fill", `rgba(255,${150-burstFrame*20},0,${op})`);
                if (burstFrame > 6) {
                    clearInterval(burstAnim);
                    svg.remove();
                    if (onImpact) onImpact();
                }
            }, 40);
        }
    }, 20);
}

function fireAlienMissile(onImpact) {
    const battleScene = document.getElementById("battleScene");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();
    const sceneRect = battleScene.getBoundingClientRect();

    const startX = alienRect.right - sceneRect.left - 20;
    const startY = alienRect.top + alienRect.height / 2 - sceneRect.top;
    const endX = earthRect.left - sceneRect.left + 20;
    const endY = earthRect.top + earthRect.height / 2 - sceneRect.top;

    const missile = document.createElement("div");
    missile.style.cssText = `
        position:absolute;
        width:24px; height:8px;
        background:linear-gradient(to right, #ff4400, #ffaa00, #ffffff);
        border-radius:4px;
        left:${startX}px;
        top:${startY - 4}px;
        box-shadow: 0 0 12px #ff6600, 0 0 4px #fff;
        z-index:20;
        pointer-events:none;
        transform-origin: left center;
    `;

    // Trail
    const trail = document.createElement("div");
    trail.style.cssText = `
        position:absolute;
        width:40px; height:4px;
        background:linear-gradient(to left, transparent, rgba(255,100,0,0.6));
        border-radius:2px;
        left:${startX - 40}px;
        top:${startY - 2}px;
        z-index:19;
        pointer-events:none;
    `;

    battleScene.appendChild(missile);
    battleScene.appendChild(trail);

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    missile.style.transform = `rotate(${angle}deg)`;
    trail.style.transform = `rotate(${angle}deg)`;

    let progress = 0;
    const steps = 40;
    const missileAnim = setInterval(() => {
        progress++;
        const t = progress / steps;
        // Arc trajectory
        const arcY = -Math.sin(t * Math.PI) * 30;
        const curX = startX + dx * t;
        const curY = startY + dy * t + arcY;
        missile.style.left = curX + "px";
        missile.style.top = (curY - 4) + "px";
        trail.style.left = (curX - 40) + "px";
        trail.style.top = (curY - 2) + "px";

        if (progress >= steps) {
            clearInterval(missileAnim);
            missile.remove();
            trail.remove();

            // Explosion
            const exp = document.createElement("div");
            exp.style.cssText = `
                position:absolute;
                left:${endX - 30}px; top:${endY - 30}px;
                width:60px; height:60px;
                border-radius:50%;
                background:radial-gradient(circle, #fff 0%, #ffaa00 40%, #ff4400 70%, transparent 100%);
                z-index:21; pointer-events:none;
                animation: explodeBurst 0.5s ease-out forwards;
            `;
            battleScene.appendChild(exp);

            if (!document.getElementById("burstStyle")) {
                const style = document.createElement("style");
                style.id = "burstStyle";
                style.textContent = `@keyframes explodeBurst{0%{transform:scale(0);opacity:1}100%{transform:scale(2.5);opacity:0}}`;
                document.head.appendChild(style);
            }

            setTimeout(() => { exp.remove(); if (onImpact) onImpact(); }, 500);
        }
    }, 18);
}

// Randomly choose between laser and missile
function fireWeapon(onImpact) {
    if (Math.random() > 0.5) {
        fireLaserAtEarth(onImpact);
    } else {
        fireAlienMissile(onImpact);
    }
}
