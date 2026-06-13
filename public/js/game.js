let currentQuestion = 0;
let score = 0;
let health = 100;
let alienLeft = 8;
let timerInterval = null;
let timeLeft = 15;
let currentDifficulty = "easy";
let gameOver = false;

function startGame(difficulty) {
    currentDifficulty = difficulty;
    const qs = initQuestions(difficulty);
    window.questions = qs;

    document.getElementById("difficultyScreen").style.display = "none";
    document.getElementById("topBar").style.display = "flex";
    document.getElementById("battleScene").style.display = "block";
    document.getElementById("questionArea").style.display = "flex";

    const username = localStorage.getItem("mc_username");
    const welcomeEl = document.getElementById("welcomeUser");
    if (username) welcomeEl.textContent = "👋 " + username;
    else welcomeEl.textContent = "Playing as Guest";

    if (difficulty === "easy") timeLeft = 20;
    else if (difficulty === "medium") timeLeft = 15;
    else timeLeft = 10;
    window._baseTime = timeLeft;

    // Init shield
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

    alienLeft = Math.min(68, alienLeft + 10);
    document.getElementById("alienShipWrapper").style.left = alienLeft + "%";

    // Fire weapon then damage
    fireWeapon(() => {
        animateShieldImpact();
        const isOver = takeDamage();
        if (!isOver) {
            setTimeout(() => {
                answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
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
        alienLeft = Math.max(5, alienLeft - 12);
        document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        answerButtons[selectedIndex].classList.add("correct");
        playSound("correct");
        document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 30px #00ffcc) drop-shadow(0 0 60px #00ffcc)";
        setTimeout(() => { document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 25px rgba(30,144,255,0.7))"; }, 700);
        updateHUD();

        setTimeout(() => {
            answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
            currentQuestion++;
            if (currentQuestion < window.questions.length) { loadQuestion(); startTimer(); }
            else { endGame(); }
        }, 1800);
    } else {
        alienLeft = Math.min(68, alienLeft + 10);
        document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");
        playSound("wrong");

        // Fire weapon at earth
        fireWeapon(() => {
            animateShieldImpact();
            const isOver = takeDamage();
            if (!isOver) {
                setTimeout(() => {
                    answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
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
    playSound("explosion");

    // First collapse the shield spectacularly
    collapseShield(() => {
        // Then explode the earth
        const ring = document.getElementById("explosionRing");
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                ring.classList.remove("explode");
                void ring.offsetWidth;
                ring.classList.add("explode");
                playSound("explosion");
                document.getElementById("earthCanvas").style.filter = `drop-shadow(0 0 ${40+i*20}px #ff2200) brightness(${1.5+i*0.3})`;
            }, i * 350);
        }

        // Red invasion flash
        setTimeout(() => {
            const overlay = document.createElement("div");
            overlay.id = "invasionOverlay";
            overlay.style.cssText = `position:fixed;inset:0;background:rgba(255,30,0,0.2);z-index:50;pointer-events:none;animation:invasionFlash 0.4s ease-in-out 4;`;
            document.body.appendChild(overlay);
            const style = document.createElement("style");
            style.textContent = `@keyframes invasionFlash{0%,100%{opacity:0}50%{opacity:1}}`;
            document.head.appendChild(style);
            setTimeout(() => { overlay.remove(); }, 1800);
        }, 300);

        document.getElementById("alienShipWrapper").style.left = "68%";
        setTimeout(() => { endGame(); }, 2800);
    });
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        if (type === "correct") {
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
        } else if (type === "wrong") {
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(); osc.stop(ctx.currentTime + 0.4);
        } else if (type === "explosion") {
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass"; filter.frequency.value = 400;
            source.connect(filter); filter.connect(gain);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            source.start(); source.stop(ctx.currentTime + 0.5);
        } else if (type === "victory") {
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const o = ctx.createOscillator(); const g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.frequency.value = freq;
                g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
                g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                o.start(ctx.currentTime + i * 0.15); o.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        }
    } catch(e) {}
}

function launchConfetti() {
    const container = document.getElementById("victoryParticles");
    const colors = ["#00ffcc","#ff00ff","#ffff00","#00aaff","#ff6600","#ffffff"];
    for (let i = 0; i < 80; i++) {
        const p = document.createElement("div");
        p.style.cssText = `position:fixed;left:${Math.random()*100}%;top:-10px;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation:confettiFall ${2+Math.random()*3}s linear ${Math.random()*2}s forwards;z-index:999;pointer-events:none;`;
        container.appendChild(p);
    }
    if (!document.getElementById("confettiStyle")) {
        const style = document.createElement("style");
        style.id = "confettiStyle";
        style.textContent = `@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`;
        document.head.appendChild(style);
    }
    setTimeout(() => { container.innerHTML = ""; }, 6000);
}

async function endGame() {
    clearInterval(timerInterval);
    answerButtons.forEach(b => { b.style.display = "none"; });
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

    const token = localStorage.getItem("mc_token");
    if (token) {
        const lo = document.createElement("button");
        lo.textContent = "🚪 Logout"; lo.className = "answer-btn";
        lo.style.borderColor = "#ff4466"; lo.style.color = "#ff4466";
        lo.onclick = () => { localStorage.removeItem("mc_token"); localStorage.removeItem("mc_username"); location.reload(); };
        d.appendChild(lo);
    }
}
