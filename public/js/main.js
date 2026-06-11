const existingToken = localStorage.getItem("mc_token");
if (!existingToken) {
    showAuthModal("login");
}
loadQuestion();