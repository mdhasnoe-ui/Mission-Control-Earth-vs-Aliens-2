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

    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 200;
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

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
        setTimeout(() => { scene.remove(line); shootingStars.splice(shootingStars.indexOf(line), 1); }, 1500);
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
// BACKGROUND PLANETS
// =====================
(function initBgPlanets() {
    const planets = [
        { size: 60, x: 8, y: 20, color1: "#c84b31", color2: "#8b2500", name: "mars" },
        { size: 45, x: 85, y: 15, color1: "#e8c57a", color2: "#c4972e", name: "saturn" },
        { size: 35, x: 92, y: 65, color1: "#7fb3d3", color2: "#2e86ab", name: "neptune" },
        { size: 28, x: 5, y: 75, color1: "#f0a500", color2: "#c97d1a", name: "jupitermini" },
    ];
    planets.forEach(p => {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;width:${p.size}px;height:${p.size}px;left:${p.x}%;top:${p.y}%;border-radius:50%;background:radial-gradient(circle at 35% 35%,${p.color1},${p.color2});opacity:0.5;z-index:0;pointer-events:none;box-shadow:0 0 ${p.size/2}px ${p.color1}44;`;
        if (p.name === "saturn") div.style.boxShadow += `,0 0 0 8px ${p.color1}33,0 0 0 14px ${p.color1}22`;
        document.body.appendChild(div);
        const style = document.createElement("style");
        style.textContent = `@keyframes pf${p.name}{0%,100%{transform:translateY(0px)}50%{transform:translateY(8px)}}`;
        div.style.animation = `pf${p.name} 7s ease-in-out infinite`;
        document.head.appendChild(style);
    });
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

    scene.add(new THREE.AmbientLight(0x333333));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512; texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, "#1a6b8a");
    oceanGrad.addColorStop(0.5, "#0d4f6e");
    oceanGrad.addColorStop(1, "#1a6b8a");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#2d7a3a";
    [[120,90,55,45,-0.3],[145,160,30,50,0.2],[260,100,35,30,0],[265,165,30,55,0.1],[370,80,80,50,-0.1],[400,175,30,22,0]].forEach(([x,y,rx,ry,r]) => { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,r,0,Math.PI*2); ctx.fill(); });
    ctx.fillStyle = "#e8f4f8";
    ctx.beginPath(); ctx.ellipse(256,10,200,20,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(256,246,200,20,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.ellipse(Math.random()*512,Math.random()*256,30+Math.random()*40,10+Math.random()*15,Math.random(),0,Math.PI*2); ctx.fill(); }

    const earthTex = new THREE.CanvasTexture(texCanvas);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1,64,64), new THREE.MeshPhongMaterial({ map: earthTex, specular: new THREE.Color(0x4488aa), shininess: 25 }));
    scene.add(earth);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.06,64,64), new THREE.MeshPhongMaterial({ color: 0x4488ff, transparent: true, opacity: 0.12 })));

    const cloudTexCanvas = document.createElement("canvas");
    cloudTexCanvas.width = 512; cloudTexCanvas.height = 256;
    const cctx = cloudTexCanvas.getContext("2d");
    cctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 30; i++) { cctx.beginPath(); cctx.ellipse(Math.random()*512,Math.random()*256,20+Math.random()*50,8+Math.random()*12,Math.random(),0,Math.PI*2); cctx.fill(); }
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.02,64,64), new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(cloudTexCanvas), transparent: true, opacity: 0.5 }));
    scene.add(clouds);

    window.shakeEarth = function() {
        let t = 0;
        const shake = setInterval(() => {
            earth.position.x = Math.sin(t * 30) * 0.15;
            clouds.position.x = earth.position.x;
            t += 0.05;
            if (t > 0.6) { earth.position.x = 0; clouds.position.x = 0; clearInterval(shake); }
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

    scene.add(new THREE.AmbientLight(0x222222));
    const light1 = new THREE.DirectionalLight(0x00ffcc, 1.5);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xff00ff, 1, 10);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    const ship = new THREE.Group();
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 16);
    bodyGeo.scale(1, 0.35, 1);
    ship.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ color: 0x334455, specular: 0x00ffcc, shininess: 80, emissive: 0x001122 })));

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55,32,16,0,Math.PI*2,0,Math.PI/2), new THREE.MeshPhongMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.7, specular: 0xffffff, shininess: 150, emissive: 0x004433 }));
    dome.position.y = 0.35;
    ship.add(dome);
    ship.add(new THREE.Mesh(new THREE.TorusGeometry(1.2,0.1,8,32), new THREE.MeshPhongMaterial({ color: 0x00ffcc, emissive: 0x004433, shininess: 100 })));

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lightSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00ffff : 0xff00ff }));
        lightSphere.position.set(Math.cos(angle)*1.2, -0.1, Math.sin(angle)*1.2);
        ship.add(lightSphere);
    }

    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.6,0.1,16), new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 }));
    glow.position.y = -0.25;
    ship.add(glow);

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.3,2,8), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0 }));
    beam.position.y = -1.2;
    ship.add(beam);

    scene.add(ship);

    // X movement: positive = right (toward earth), negative = left (away from earth)
    window.alienShipX = 0;
    window.moveAlienShip = function(direction) {
        window.alienShipX += direction * 0.5;
        if (direction > 0) {
            beam.material.opacity = 0.6;
            setTimeout(() => { beam.material.opacity = 0; }, 800);
        }
    };

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;
        ship.position.x = window.alienShipX;
        ship.position.y = Math.sin(time) * 0.15;
        ship.rotation.y += 0.01;
        glow.material.opacity = 0.3 + Math.sin(time * 4) * 0.2;
        renderer.render(scene, camera);
    }
    animate();
})();
