let currentQuestion=0;
let score=0;
let health=100;
let alienPosition=0;

function checkAnswer(selectedIndex){
    const correctAnswer=questions[currentQuestion].correct;
    answerButtons.forEach(b=>{b.disabled=true;});
    if(selectedIndex===correctAnswer){
        score+=100;alienPosition-=40;
        alienShip.style.transform=`translateY(${alienPosition}px)`;
        answerButtons[selectedIndex].classList.add("correct");
    }else{
        health-=20;alienPosition+=40;
        alienShip.style.transform=`translateY(${alienPosition}px)`;
        answerButtons[selectedIndex].classList.add("wrong");
        answerButtons[correctAnswer].classList.add("correct");
    }
    updateHUD();
    setTimeout(()=>{
        answerButtons.forEach(b=>{b.disabled=false;b.classList.remove("correct","wrong");});
        currentQuestion++;
        if(currentQuestion<questions.length){loadQuestion();}else{endGame();}
    },1500);
}

async function endGame(){
    answerButtons.forEach(b=>{b.style.display="none";});
    if(health<=0){questionElement.textContent="GAME OVER - Earth Was Destroyed";}
    else{questionElement.textContent="VICTORY - Earth Has Been Saved!";}
    await saveScore(score);
    const d=document.querySelector(".answers");
    const lb=document.createElement("button");lb.textContent="Leaderboard";lb.className="answer-btn";lb.style.marginTop="16px";lb.onclick=showLeaderboard;d.appendChild(lb);
    const rb=document.createElement("button");rb.textContent="Play Again";rb.className="answer-btn";rb.style.marginTop="8px";rb.onclick=()=>location.reload();d.appendChild(rb);
    const lo=document.createElement("button");lo.textContent="Logout";lo.className="answer-btn";lo.style.marginTop="8px";lo.style.borderColor="#ff4466";lo.style.color="#ff4466";lo.onclick=()=>{localStorage.removeItem("mc_token");localStorage.removeItem("mc_username");location.reload();};d.appendChild(lo);
}