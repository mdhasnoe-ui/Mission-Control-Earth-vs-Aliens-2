// =====================
// BACKGROUND STARFIELD
// =====================
(function initBgStars() {
    const canvas = document.getElementById("bgCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const starGeo = new THREE.BufferGeometry();
    const starCount = 2500;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 200;
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.85 }));
    scene.add(stars);

    // Shooting stars
    setInterval(() => {
        const geo = new THREE.BufferGeometry();
        const verts = new Float32Array([0,0,0,-4,-0.5,0]);
        geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 }));
        line.position.set((Math.random()-0.5)*100, (Math.random()-0.5)*60, -10);
        line.userData.speed = 1.5 + Math.random();
        scene.add(line);
        setTimeout(() => scene.remove(line), 1500);
    }, 2500);

    // Background planets
    const planets = [
        { size: 50, x: 12, y: 22, color1: "#c84b31", color2: "#8b2500" },
        { size: 38, x: 78, y: 12, color1: "#e8c57a", color2: "#c4972e" },
        { size: 28, x: 5, y: 68, color1: "#f0a500", color2: "#c97d1a" },
    ];
    planets.forEach(p => {
        const div = document.createElement("div");
        div.style.cssText = `position:fixed;width:${p.size}px;height:${p.size}px;left:${p.x}%;top:${p.y}%;border-radius:50%;background:radial-gradient(circle at 35% 35%,${p.color1},${p.color2});opacity:0.4;z-index:1;pointer-events:none;box-shadow:0 0 ${p.size/2}px ${p.color1}33;animation:pfloat${p.size} 8s ease-in-out infinite;`;
        document.body.appendChild(div);
        const s = document.createElement("style");
        s.textContent = `@keyframes pfloat${p.size}{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}`;
        document.head.appendChild(s);
    });

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    function animate() {
        requestAnimationFrame(animate);
        stars.rotation.y += 0.0002;
        stars.rotation.x += 0.00008;
        renderer.render(scene, camera);
    }
    animate();
})();

// =====================
// 3D EARTH (large, bottom right)
// =====================
(function initEarth() {
    const canvas = document.getElementById("earthCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(380, 380);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.8;

    scene.add(new THREE.AmbientLight(0x334466));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Earth texture
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 1024; texCanvas.height = 512;
    const ctx = texCanvas.getContext("2d");

    // Ocean gradient
    const og = ctx.createLinearGradient(0,0,0,512);
    og.addColorStop(0, "#1a5f7a"); og.addColorStop(0.5, "#0d4a65"); og.addColorStop(1, "#1a5f7a");
    ctx.fillStyle = og; ctx.fillRect(0,0,1024,512);

    // Continents
    ctx.fillStyle = "#2d7a3a";
    const continents = [
        [200,170,100,85,-0.3], [280,320,60,95,0.2],
        [510,190,70,55,0], [520,320,60,105,0.1],
        [700,160,150,95,-0.1], [780,340,60,42,0],
        [90,200,55,40,0.2], [950,250,45,35,0.1]
    ];
    continents.forEach(([x,y,rx,ry,r]) => {
        ctx.beginPath(); ctx.ellipse(x,y,rx,ry,r,0,Math.PI*2); ctx.fill();
    });

    // Ice caps
    ctx.fillStyle = "#e8f4f8";
    ctx.beginPath(); ctx.ellipse(512,18,400,22,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(512,494,400,22,0,0,Math.PI*2); ctx.fill();

    // Desert areas
    ctx.fillStyle = "#c4a35a";
    ctx.beginPath(); ctx.ellipse(520,260,40,20,0.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(620,300,30,15,0,0,Math.PI*2); ctx.fill();

    const earthTex = new THREE.CanvasTexture(texCanvas);
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({ map: earthTex, specular: new THREE.Color(0x224466), shininess: 20 })
    );
    scene.add(earth);

    // Atmosphere
    scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x3366ff, transparent: true, opacity: 0.1, side: THREE.FrontSide })
    ));

    // Cloud layer
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = 1024; cloudCanvas.height = 512;
    const cctx = cloudCanvas.getContext("2d");
    cctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 60; i++) {
        cctx.beginPath();
        cctx.ellipse(Math.random()*1024, Math.random()*512, 25+Math.random()*70, 10+Math.random()*18, Math.random(), 0, Math.PI*2);
        cctx.fill();
    }
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 64, 64),
        new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(cloudCanvas), transparent: true, opacity: 0.45 })
    );
    scene.add(clouds);

    // Expose shake
    window.shakeEarth = function() {
        let t = 0;
        const shake = setInterval(() => {
            earth.position.x = Math.sin(t*30)*0.12;
            clouds.position.x = earth.position.x;
            t += 0.05;
            if (t > 0.6) { earth.position.x = 0; clouds.position.x = 0; clearInterval(shake); }
        }, 16);
    };

    function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += 0.003;
        clouds.rotation.y += 0.0035;
        renderer.render(scene, camera);
    }
    animate();
})();

// =====================
// 3D ALIEN SHIP (evil, top left)
// =====================
(function initAlienShip() {
    const canvas = document.getElementById("alienCanvas");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(200, 200);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0.5, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x110022));
    const redLight = new THREE.PointLight(0xff2200, 2, 8);
    redLight.position.set(2, 2, 2);
    scene.add(redLight);
    const purpleLight = new THREE.PointLight(0x6600ff, 1.5, 6);
    purpleLight.position.set(-2, -1, 1);
    scene.add(purpleLight);

    const ship = new THREE.Group();

    // Main dark body - angular/aggressive
    const bodyGeo = new THREE.SphereGeometry(1.1, 8, 6); // low poly = angular
    bodyGeo.scale(1, 0.28, 1);
    ship.add(new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({
        color: 0x1a0a0a, specular: 0xff2200, shininess: 60, emissive: 0x220000
    })));

    // Evil spikes/protrusions
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.4, 4),
            new THREE.MeshPhongMaterial({ color: 0x330000, emissive: 0xff0000, emissiveIntensity: 0.3 })
        );
        spike.position.set(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0);
        spike.rotation.z = Math.PI / 2;
        spike.rotation.y = angle;
        ship.add(spike);
    }

    // Dark dome (red tinted)
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI*2, 0, Math.PI/2),
        new THREE.MeshPhongMaterial({ color: 0x330000, transparent: true, opacity: 0.85, specular: 0xff4400, shininess: 100, emissive: 0x220000 })
    );
    dome.position.y = 0.28;
    ship.add(dome);

    // Rim - dark red glowing
    ship.add(new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.09, 8, 32),
        new THREE.MeshPhongMaterial({ color: 0xff2200, emissive: 0xaa0000, shininess: 80 })
    ));

    // Evil red lights
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const l = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        l.position.set(Math.cos(angle)*1.1, -0.08, Math.sin(angle)*1.1);
        ship.add(l);
    }

    // Engine glow (red/orange)
    const glow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 0.08, 16),
        new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.6 })
    );
    glow.position.y = -0.2;
    ship.add(glow);

    scene.add(ship);

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;
        ship.rotation.y += 0.008;
        ship.position.y = Math.sin(time * 0.8) * 0.1;
        glow.material.opacity = 0.4 + Math.sin(time*3)*0.2;
        redLight.intensity = 1.5 + Math.sin(time*2)*0.5;
        renderer.render(scene, camera);
    }
    animate();
})();
