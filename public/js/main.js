// Show auth modal first, then difficulty screen handles game start
const existingToken = localStorage.getItem("mc_token");
if (!existingToken) {
    showAuthModal("login");
}
