let currentQuestion = 0;
let score = 0;
let health = 100;
let alienLeft = 8; // percentage from left

function checkAnswer(selectedIndex) {
    const correctAnswer = questions[currentQuestion].correct;
    answerButtons.forEach(b => { b.disabled = true; });

    if (selectedIndex === correctAnswer) {
        // Correct - move alien LEFT (away from earth)
        score += 100;
        alienLeft = Math.max(5, alienLeft - 12);
        document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        answerButtons[selectedIndex].classList.add("correct");
        // Shield glow on earth
        document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 30px #00ffcc) drop-shadow(0 0 60px #00ffcc)";
        setTimeout(() => { document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 25px rgba(30,144,255,0.7))"; }, 700);
    } else {
        // Wrong - move alien RIGHT (toward earth) + explosion
        health -= 20;
        alienLeft = Math.min(72, alienLeft + 12);
        document.getElementById("alienShipWrapper").style.left = alienLeft + "%";
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");

        // Explosion on earth after ship arrives
        setTimeout(() => {
            const ring = document.getElementById("explosionRing");
            ring.classList.remove("explode");
            void ring.offsetWidth; // reflow
            ring.classList.add("explode");
            document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 40px #ff2200) brightness(1.5)";
            setTimeout(() => {
                document.getElementById("earthCanvas").style.filter = "drop-shadow(0 0 25px rgba(30,144,255,0.7))";
            }, 600);
        }, 800);
    }

    // Update question counter
    const qNum = document.getElementById("questionNum");
    if (qNum) qNum.textContent = `${String(currentQuestion+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;

    updateHUD();

    setTimeout(() => {
        answerButtons.forEach(b => { b.disabled = false; b.classList.remove("correct", "wrong"); });
        currentQuestion++;
        if (currentQuestion < questions.length) { loadQuestion(); } else { endGame(); }
    }, 1800);
}

async function endGame() {
    answerButtons.forEach(b => { b.style.display = "none"; });
    if (health <= 0) {
        questionElement.textContent = "💀 GAME OVER - Earth Was Destroyed";
    } else {
        questionElement.textContent = "🚀 VICTORY - Earth Has Been Saved!";
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
