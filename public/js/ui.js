const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const scoreElement = document.getElementById("score");
const healthElement = document.getElementById("health");
const alienShip = document.getElementById("alienShip");

function loadQuestion() {
    const current = questions[currentQuestion];
    questionElement.textContent = current.question;
    answerButtons.forEach((button, index) => {
        button.textContent = current.answers[index];
        button.onclick = () => checkAnswer(index);
    });
}

function updateHUD() {
    scoreElement.textContent = score;
    healthElement.textContent = `${health}%`;
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
                <p class="modal-switch">
                    ${mode === "login"
                        ? 'No account? <a href="#" id="switchMode">Register</a>'
                        : 'Already have an account? <a href="#" id="switchMode">Login</a>'
                    }
                </p>
                <button id="authSkip">Play as guest</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("authSubmit").onclick = () => handleAuth(mode);
    document.getElementById("authSkip").onclick = () => { modal.remove(); };
    document.getElementById("switchMode").onclick = (e) => {
        e.preventDefault();
        showAuthModal(mode === "login" ? "register" : "login");
    };

    document.getElementById("authUsername").addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAuth(mode);
    });
    document.getElementById("authPassword").addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAuth(mode);
    });
}

async function handleAuth(mode) {
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    const errorEl = document.getElementById("authError");

    if (!username || !password) {
        errorEl.textContent = "Please fill in all fields.";
        return;
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || "Something went wrong.";
            return;
        }

        localStorage.setItem("mc_token", data.token);
        localStorage.setItem("mc_username", data.username);
        document.getElementById("authModal").remove();

    } catch (err) {
        errorEl.textContent = "Could not connect to server.";
    }
}

async function saveScore(finalScore) {
    const token = localStorage.getItem("mc_token");
    if (!token) return; // guest, don't save

    try {
        await fetch("/api/scores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ score: finalScore })
        });
    } catch (err) {
        console.log("Could not save score:", err);
    }
}

async function showLeaderboard() {
    try {
        const res = await fetch("/api/scores");
        const scores = await res.json();

        const existing = document.getElementById("leaderboardModal");
        if (existing) existing.remove();

        const rows = scores.length === 0
            ? "<tr><td colspan='3'>No scores yet!</td></tr>"
            : scores.map((s, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${s.username}</td>
                    <td>${s.score}</td>
                </tr>
            `).join("");

        const modal = document.createElement("div");
        modal.id = "leaderboardModal";
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-box">
                    <h2>🏆 Leaderboard</h2>
                    <table class="leaderboard-table">
                        <thead><tr><th>#</th><th>Player</th><th>Score</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <button id="closeLeaderboard">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById("closeLeaderboard").onclick = () => modal.remove();

    } catch (err) {
        console.log("Could not load leaderboard:", err);
    }
}
