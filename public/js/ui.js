const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const alienShip = { style: { transform: "" } };

function loadQuestion() {
    const current = window.questions[currentQuestion];
    questionElement.textContent = current.question;
    const qNum = document.getElementById("questionNum");
    if (qNum) qNum.textContent = `${String(currentQuestion+1).padStart(2,'0')} / ${String(window.questions.length).padStart(2,'0')}`;
    answerButtons.forEach((button, index) => {
        button.textContent = current.answers[index];
        button.onclick = () => checkAnswer(index);
        button.style.display = "";
    });
}

function updateHUD() {
    scoreElement.textContent = score;
    healthElement.textContent = `${health}%`;
    const bar = document.getElementById("healthBar");
    if (bar) {
        bar.style.width = health + "%";
        bar.style.background = health > 60 ? "#00cc50" : health > 30 ? "#ffaa00" : "#ff3333";
    }
    if (health <= 40) healthElement.style.color = "#ff4466";
    else if (health <= 60) healthElement.style.color = "#ffaa00";
    else healthElement.style.color = "white";
}

function showAuthModal(mode = "login") {
    const existing = document.getElementById("authModal");
    if (existing) existing.remove();
    const modal = document.createElement("div");
    modal.id = "authModal";
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-box">
                <h2>${mode === "login" ? "🚀 Login" : "🛸 Register"}</h2>
                <input id="authUsername" type="text" placeholder="Username" />
                <input id="authPassword" type="password" placeholder="Password" />
                <div class="modal-error" id="authError"></div>
                <button id="authSubmit">${mode === "login" ? "Login" : "Register"}</button>
                <p class="modal-switch">${mode === "login" ? 'No account? <a href="#" id="switchMode">Register</a>' : 'Already have an account? <a href="#" id="switchMode">Login</a>'}</p>
                <button id="authSkip">Play as guest</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("authSubmit").onclick = () => handleAuth(mode);
    document.getElementById("authSkip").onclick = () => { modal.remove(); };
    document.getElementById("switchMode").onclick = (e) => { e.preventDefault(); showAuthModal(mode === "login" ? "register" : "login"); };
    document.getElementById("authPassword").addEventListener("keydown", (e) => { if (e.key === "Enter") handleAuth(mode); });
}

async function handleAuth(mode) {
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    const errorEl = document.getElementById("authError");
    if (!username || !password) { errorEl.textContent = "Please fill in all fields."; return; }
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    try {
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
        const data = await res.json();
        if (!res.ok) { errorEl.textContent = data.message || "Something went wrong."; return; }
        localStorage.setItem("mc_token", data.token);
        localStorage.setItem("mc_username", data.username);
        document.getElementById("authModal").remove();
    } catch (err) { errorEl.textContent = "Could not connect to server."; }
}

async function saveScore(finalScore) {
    const token = localStorage.getItem("mc_token");
    if (!token) return;
    try {
        await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": token }, body: JSON.stringify({ score: finalScore }) });
    } catch (err) { console.log("Could not save score:", err); }
}

async function showLeaderboard() {
    try {
        const res = await fetch("/api/scores");
        const scores = await res.json();
        const existing = document.getElementById("leaderboardModal");
        if (existing) existing.remove();
        const currentUser = localStorage.getItem("mc_username");
        const rows = scores.length === 0
            ? "<tr><td colspan='4'>No scores yet!</td></tr>"
            : scores.map((s, i) => {
                const isMe = s.username === currentUser;
                const date = new Date(s.created_at).toLocaleDateString();
                return `<tr style="${isMe ? 'background:rgba(0,255,204,0.15);color:#00ffcc;font-weight:bold;' : ''}">
                    <td>${i+1}</td>
                    <td>${s.username}${isMe ? ' ⭐' : ''}</td>
                    <td>${s.score}</td>
                    <td>${date}</td>
                </tr>`;
            }).join("");
        const modal = document.createElement("div");
        modal.id = "leaderboardModal";
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-box">
                    <h2>🏆 Leaderboard</h2>
                    <table class="leaderboard-table">
                        <thead><tr><th>#</th><th>Player</th><th>Score</th><th>Date</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <button id="closeLeaderboard">Close</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById("closeLeaderboard").onclick = () => modal.remove();
    } catch (err) { console.log("Could not load leaderboard:", err); }
}
