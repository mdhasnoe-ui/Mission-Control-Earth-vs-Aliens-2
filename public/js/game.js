let currentQuestion = 0;
let score = 0;
let health = 100;
let timerInterval = null;
let timeLeft = 15;
let gameOver = false;

function startGame(difficulty) {
    const qs = initQuestions(difficulty);
    window.questions = qs;

    document.getElementById("difficultyScreen").style.display = "none";
    document.getElementById("topBar").style.display = "flex";
    document.getElementById("gameArea").style.display = "block";

    const username = localStorage.getItem("mc_username");
    document.getElementById("welcomeUser").textContent = username ? "👋 " + username : "Playing as Guest";

    if (difficulty === "easy") timeLeft = 20;
    else if (difficulty === "medium") timeLeft = 15;
    else timeLeft = 10;
    window._baseTime = timeLeft;

    initShield();
    loadQuestion();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = window._baseTime;
    updateTimerUI();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) { clearInterval(timerInterval); timeUp(); }
    }, 1000);
}

function updateTimerUI() {
    const timerText = document.getElementById("timerText");
    const timerBar = document.getElementById("timerBar");
    if (timerText) timerText.textContent = timeLeft;
    if (timerBar) {
        const pct = (timeLeft / window._baseTime) * 100;
        timerBar.style.width = pct + "%";
        timerBar.style.background = pct > 50 ? "#00ffcc" : pct > 25 ? "#ffaa00" : "#ff3333";
    }
}

function takeDamage() {
    health = Math.max(0, health - 20);
    hitShield(20);
    updateHUD();
    if (health <= 0) {
        clearInterval(timerInterval);
        answerButtons.forEach(b => b.disabled = true);
        triggerEarthDestroyed();
        return true;
    }
    return false;
}

function timeUp() {
    if (gameOver) return;
    const correctAnswer = window.questions[currentQuestion].correct;
    answerButtons.forEach(b => b.disabled = true);
    answerButtons[correctAnswer].classList.add("correct");
    playSound("wrong");

    fireWeapon(() => {
        animateShieldImpact();
        const isOver = takeDamage();
        if (!isOver) {
            setTimeout(() => {
                answerButtons.forEach(b => { b.disabled=false; b.classList.remove("correct","wrong"); });
                currentQuestion++;
                if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
                else { endGame(); }
            }, 800);
        }
    });
}

function checkAnswer(selectedIndex) {
    if (gameOver) return;
    clearInterval(timerInterval);
    const correctAnswer = window.questions[currentQuestion].correct;
    answerButtons.forEach(b => { b.disabled = true; });

    if (selectedIndex === correctAnswer) {
        score += 100 + (timeLeft * 5);
        answerButtons[selectedIndex].classList.add("correct");
        playSound("correct");
        document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 30px #00ffcc) drop-shadow(0 0 50px #00ffcc)";
        setTimeout(() => { document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 25px rgba(30,144,255,0.5))"; }, 700);
        updateHUD();
        setTimeout(() => {
            answerButtons.forEach(b => { b.disabled=false; b.classList.remove("correct","wrong"); });
            currentQuestion++;
            if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
            else { endGame(); }
        }, 1800);
    } else {
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");
        playSound("wrong");

        fireWeapon(() => {
            animateShieldImpact();
            const isOver = takeDamage();
            if (!isOver) {
                setTimeout(() => {
                    answerButtons.forEach(b => { b.disabled=false; b.classList.remove("correct","wrong"); });
                    currentQuestion++;
                    if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
                    else { endGame(); }
                }, 800);
            }
        });
    }
}

function triggerEarthDestroyed() {
    gameOver = true;

    // Step 1: Shield collapses
    collapseShield(() => {
        // Step 2: Alien invasion - aliens fly from ship to earth
        triggerAlienInvasion(() => {
            // Step 3: Earth explodes
            triggerEarthExplosion(() => {
                endGame();
            });
        });
    });
}

function triggerAlienInvasion(onComplete) {
    const layer = document.getElementById("invasionLayer");
    const alienWrapper = document.getElementById("alienShipWrapper");
    const earthWrapper = document.getElementById("earthWrapper");

    const alienRect = alienWrapper.getBoundingClientRect();
    const earthRect = earthWrapper.getBoundingClientRect();

    const startX = alienRect.left + alienRect.width/2;
    const startY = alienRect.top + alienRect.height/2;
    const endX = earthRect.left + 100;
    const endY = earthRect.top + 80;

    const alienCount = 8;
    let arrived = 0;

    for (let i = 0; i < alienCount; i++) {
        setTimeout(() => {
            const alien = document.createElement("div");
            const offsetX = (Math.random()-0.5)*60;
            const offsetY = (Math.random()-0.5)*40;
            alien.style.cssText = `
                position:fixed;
                font-size:22px;
                left:${startX + offsetX}px;
                top:${startY}px;
                z-index:200;
                pointer-events:none;
                transition: left 1.2s ease-in, top 1.2s ease-in;
                filter: drop-shadow(0 0 8px #ff0000);
            `;
            alien.textContent = "👾";
            layer.appendChild(alien);

            setTimeout(() => {
                alien.style.left = (endX + offsetX) + "px";
                alien.style.top = (endY + offsetY) + "px";
            }, 50);

            setTimeout(() => {
                alien.remove();
                arrived++;
                if (arrived >= alienCount && onComplete) onComplete();
            }, 1400);
        }, i * 180);
    }

    // Red invasion flash
    const flash = document.createElement("div");
    flash.style.cssText = `position:fixed;inset:0;background:rgba(255,0,0,0.15);z-index:150;pointer-events:none;animation:invasionPulse 0.4s ease-in-out 4;`;
    layer.appendChild(flash);
    if (!document.getElementById("invasionStyle")) {
        const s = document.createElement("style");
        s.id = "invasionStyle";
        s.textContent = `@keyframes invasionPulse{0%,100%{opacity:0}50%{opacity:1}}`;
        document.head.appendChild(s);
    }
    setTimeout(() => flash.remove(), 1800);
}

function triggerEarthExplosion(onComplete) {
    const earthWrapper = document.getElementById("earthWrapper");
    const ring = document.getElementById("explosionRing");

    playSound("explosion");

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            ring.classList.remove("explode");
            void ring.offsetWidth;
            ring.classList.add("explode");
            playSound("explosion");
            document.getElementById("earthCanvas").style.filter = `drop-shadow(0 0 ${50+i*20}px #ff2200) brightness(${1.6+i*0.25})`;
        }, i * 350);
    }

    setTimeout(() => {
        document.getElementById("earthCanvas").style.filter = "";
        if (onComplete) onComplete();
    }, 2200);
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        if (type === "correct") {
            const osc = ctx.createOscillator(); osc.connect(gain);
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(659, ctx.currentTime+0.1);
            osc.frequency.setValueAtTime(784, ctx.currentTime+0.2);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
            osc.start(); osc.stop(ctx.currentTime+0.5);
        } else if (type === "wrong") {
            const osc = ctx.createOscillator(); osc.connect(gain);
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(160, ctx.currentTime+0.12);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.4);
            osc.start(); osc.stop(ctx.currentTime+0.4);
        } else if (type === "explosion") {
            const bufferSize = ctx.sampleRate*0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i=0;i<bufferSize;i++) data[i]=Math.random()*2-1;
            const source = ctx.createBufferSource(); source.buffer=buffer;
            const filter = ctx.createBiquadFilter(); filter.type="lowpass"; filter.frequency.value=350;
            source.connect(filter); filter.connect(gain);
            gain.gain.setValueAtTime(0.45, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5);
            source.start(); source.stop(ctx.currentTime+0.5);
        } else if (type === "victory") {
            [523,659,784,1047].forEach((freq,i)=>{
                const o=ctx.createOscillator(); const g=ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.frequency.value=freq;
                g.gain.setValueAtTime(0.25, ctx.currentTime+i*0.15);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+i*0.15+0.4);
                o.start(ctx.currentTime+i*0.15); o.stop(ctx.currentTime+i*0.15+0.4);
            });
        }
    } catch(e){}
}

function launchConfetti() {
    const container = document.getElementById("victoryParticles");
    const colors=["#00ffcc","#ff00ff","#ffff00","#00aaff","#ff6600","#ffffff"];
    for (let i=0;i<80;i++) {
        const p=document.createElement("div");
        p.style.cssText=`position:fixed;left:${Math.random()*100}%;top:-10px;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation:confettiFall ${2+Math.random()*3}s linear ${Math.random()*2}s forwards;z-index:999;pointer-events:none;`;
        container.appendChild(p);
    }
    if (!document.getElementById("confettiStyle")) {
        const s=document.createElement("style"); s.id="confettiStyle";
        s.textContent=`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`;
        document.head.appendChild(s);
    }
    setTimeout(()=>{container.innerHTML="";},6000);
}

async function endGame() {
    clearInterval(timerInterval);
    document.getElementById("invasionLayer").innerHTML = "";
    answerButtons.forEach(b=>{b.style.display="none";});

    if (health <= 0) {
        questionElement.textContent = "💀 GAME OVER - Earth Was Destroyed";
    } else {
        questionElement.textContent = "🚀 VICTORY - Earth Has Been Saved!";
        playSound("victory");
        launchConfetti();
    }

    await saveScore(score);
    const d = document.querySelector(".answers");
    d.style.gridTemplateColumns = "1fr";

    const lb = document.createElement("button");
    lb.textContent = "🏆 View Leaderboard"; lb.className = "answer-btn";
    lb.onclick = showLeaderboard; d.appendChild(lb);

    const rb = document.createElement("button");
    rb.textContent = "🔄 Play Again"; rb.className = "answer-btn";
    rb.onclick = () => location.reload(); d.appendChild(rb);

    if (localStorage.getItem("mc_token")) {
        const lo = document.createElement("button");
        lo.textContent = "🚪 Logout"; lo.className = "answer-btn";
        lo.style.borderColor = "#ff4466"; lo.style.color = "#ff4466";
        lo.onclick = () => { localStorage.removeItem("mc_token"); localStorage.removeItem("mc_username"); location.reload(); };
        d.appendChild(lo);
    }
}
