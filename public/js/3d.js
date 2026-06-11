// =====================
// BACKGROUND STARFIELD
// =====================
(function initBgStars() {
    const canvas = document.getElementById("bgCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Shooting stars
    const shootingStars = [];
    function createShootingStar() {
        const geo = new THREE.BufferGeometry();
        const verts = new Float32Array([0,0,0, -3,-0.5,0]);
        geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(geo, mat);
        line.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -10);
        line.rotation.z = -0.3;
        line.userData.speed = 1.5 + Math.random();
        scene.add(line);
        shootingStars.push(line);
        setTimeout(() => {
            scene.remove(line);
            shootingStars.splice(shootingStars.indexOf(line), 1);
        }, 1500);
    }
    setInterval(createShootingStar, 2000);

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    function animate() {
        requestAnimationFrame(animate);
        stars.rotation.y += 0.0003;
        stars.rotation.x += 0.0001;
        shootingStars.forEach(s => { s.position.x += s.userData.speed; s.position.y -= s.userData.speed * 0.3; });
        renderer.render(scene, camera);
    }
    animate();
})();

// =====================
// 3D EARTH
// =====================
(function initEarth() {
    const canvas = document.getElementById("earthCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(220, 220);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    // Lighting
    const ambient = new THREE.AmbientLight(0x333333);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Earth sphere with procedural texture
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);

    // Create canvas texture for earth
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512; texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");

    // Ocean
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, "#1a6b8a");
    oceanGrad.addColorStop(0.5, "#0d4f6e");
    oceanGrad.addColorStop(1, "#1a6b8a");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Continents (simplified green blobs)
    ctx.fillStyle = "#2d7a3a";
    // North America
    ctx.beginPath(); ctx.ellipse(120, 90, 55, 45, -0.3, 0, Math.PI*2); ctx.fill();
    // South America
    ctx.beginPath(); ctx.ellipse(145, 160, 30, 50, 0.2, 0, Math.PI*2); ctx.fill();
    // Europe/Africa
    ctx.beginPath(); ctx.ellipse(260, 100, 35, 30, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(265, 165, 30, 55, 0.1, 0, Math.PI*2); ctx.fill();
    // Asia
    ctx.beginPath(); ctx.ellipse(370, 80, 80, 50, -0.1, 0, Math.PI*2); ctx.fill();
    // Australia
    ctx.beginPath(); ctx.ellipse(400, 175, 30, 22, 0, 0, Math.PI*2); ctx.fill();

    // Ice caps
    ctx.fillStyle = "#e8f4f8";
    ctx.beginPath(); ctx.ellipse(256, 10, 200, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(256, 246, 200, 20, 0, 0, Math.PI*2); ctx.fill();

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random()*512, Math.random()*256, 30+Math.random()*40, 10+Math.random()*15, Math.random(), 0, Math.PI*2);
        ctx.fill();
    }

    const earthTex = new THREE.CanvasTexture(texCanvas);
    const earthMat = new THREE.MeshPhongMaterial({
        map: earthTex,
        specular: new THREE.Color(0x4488aa),
        shininess: 25,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.FrontSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Cloud layer
    const cloudGeo = new THREE.SphereGeometry(1.02, 64, 64);
    const cloudTexCanvas = document.createElement("canvas");
    cloudTexCanvas.width = 512; cloudTexCanvas.height = 256;
    const cctx = cloudTexCanvas.getContext("2d");
    cctx.fillStyle = "rgba(0,0,0,0)";
    cctx.fillRect(0,0,512,256);
    cctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 30; i++) {
        cctx.beginPath();
        cctx.ellipse(Math.random()*512, Math.random()*256, 20+Math.random()*50, 8+Math.random()*12, Math.random(), 0, Math.PI*2);
        cctx.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudTexCanvas);
    const cloudMat = new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.5 });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    // Expose shake function
    window.shakeEarth = function() {
        let t = 0;
        const orig = earth.position.x;
        const shake = setInterval(() => {
            earth.position.x = orig + Math.sin(t * 30) * 0.15;
            clouds.position.x = earth.position.x;
            t += 0.05;
            if (t > 0.6) { earth.position.x = orig; clouds.position.x = 0; clearInterval(shake); }
        }, 16);
    };

    function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += 0.004;
        clouds.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();
})();

// =====================
// 3D ALIEN SHIP
// =====================
(function initAlienShip() {
    const canvas = document.getElementById("alienCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(220, 220);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5;

    // Lighting
    scene.add(new THREE.AmbientLight(0x222222));
    const light1 = new THREE.DirectionalLight(0x00ffcc, 1.5);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xff00ff, 1, 10);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    // Ship group
    const ship = new THREE.Group();

    // Main saucer body (flattened sphere)
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 16);
    bodyGeo.scale(1, 0.35, 1);
    const bodyMat = new THREE.MeshPhongMaterial({
        color: 0x334455,
        specular: 0x00ffcc,
        shininess: 80,
        emissive: 0x001122,
    });
    ship.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Top dome
    const domeGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/2);
    const domeMat = new THREE.MeshPhongMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.7,
        specular: 0xffffff,
        shininess: 150,
        emissive: 0x004433,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.35;
    ship.add(dome);

    // Rim ring
    const rimGeo = new THREE.TorusGeometry(1.2, 0.1, 8, 32);
    const rimMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc, emissive: 0x004433, shininess: 100 });
    ship.add(new THREE.Mesh(rimGeo, rimMat));

    // Lights around rim
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00ffff : 0xff00ff });
        const lightSphere = new THREE.Mesh(lightGeo, lightMat);
        lightSphere.position.set(Math.cos(angle) * 1.2, -0.1, Math.sin(angle) * 1.2);
        ship.add(lightSphere);
    }

    // Engine glow underneath
    const glowGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.1, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -0.25;
    ship.add(glow);

    scene.add(ship);

    // Particle beam when moving down
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.3, 2, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = -1.2;
    ship.add(beam);

    // Expose move function to game.js
    window.alienShipY = 0;
    window.moveAlienShip = function(direction) {
        // direction: -1 = up (correct), 1 = down (wrong)
        window.alienShipY += direction * 0.5;
        if (direction > 0) {
            beamMat.opacity = 0.6;
            setTimeout(() => { beamMat.opacity = 0; }, 800);
        }
    };

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;

        // Hover float
        ship.position.y = window.alienShipY + Math.sin(time) * 0.15;
        ship.rotation.y += 0.01;

        // Pulse rim lights
        ship.children.forEach((child, i) => {
            if (i > 3 && i < 12) {
                child.material && (child.material.emissiveIntensity = 0.5 + Math.sin(time * 3 + i) * 0.5);
            }
        });

        // Pulse glow
        glow.material.opacity = 0.3 + Math.sin(time * 4) * 0.2;

        renderer.render(scene, camera);
    }
    animate();
})();
