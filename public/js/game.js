let currentQuestion = 0;
let score = 0;
let health = 100;
let alienPosition = 0;

function checkAnswer(selectedIndex) {
    const correctAnswer = questions[currentQuestion].correct;

    answerButtons.forEach(button => { button.disabled = true; });

    if (selectedIndex === correctAnswer) {
        score += 100;
        alienPosition -= 40;
        alienShip.style.transform = `translateY(${alienPosition}px)`;
        answerButtons[selectedIndex].classList.add("correct");
    } else {
        health -= 20;
        alienPosition += 40;
        alienShip.style.transform = `translateY(${alienPosition}px)`;
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");
    }

    updateHUD();

    setTimeout(() => {
        answerButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove("correct", "wrong");
        });

        currentQuestion++;

        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

async function endGame() {
    answerButtons.forEach(button => { button.style.display = "none"; });

    if (health <= 0) {
        questionElement.textContent = "💀 GAME OVER - Earth Was Destroyed";
    } else {
        questionElement.textContent = "🚀 VICTORY - Earth Has Been Saved!";
    }

    // Save score to database
    await saveScore(score);

    // Show leaderboard button
    const leaderBtn = document.createElement("button");
    leaderBtn.textContent = "🏆 View Leaderboard";
    leaderBtn.className = "answer-btn";
    leaderBtn.style.display = "block";
    leaderBtn.style.marginTop = "16px";
    leaderBtn.onclick = showLeaderboard;
    document.querySelector(".answers").appendChild(leaderBtn);

    // Show play again button
    const replayBtn = document.createElement("button");
    replayBtn.textContent = "🔄 Play Again";
    replayBtn.className = "answer-btn";
    replayBtn.style.display = "block";
    replayBtn.style.marginTop = "8px";
    replayBtn.onclick = () => location.reload();
    document.querySelector(".answers").appendChild(replayBtn);
}
