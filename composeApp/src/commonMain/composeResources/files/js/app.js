let currentMode = 'melody';

// ✅ 홈에서 특정 훈련으로 이동
function navigateTo(mode) {
    currentMode = mode;
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("training-screen").style.display = "flex";

    let titleText = "훈련";
    if (mode === 'melody') titleText = "선율+리듬 청음";
    else if (mode === 'interval') titleText = "음정 연습";
    else if (mode === 'rhythm') titleText = "리듬 훈련"; // 추가

    document.getElementById("current-title").innerText = titleText;

    refreshQuiz();
}

// ✅ 다시 홈화면으로 복귀
function goHome() {
    document.getElementById("home-screen").style.display = "flex";
    document.getElementById("training-screen").style.display = "none";
}

function refreshQuiz() {
    // utils.js에서 선언된 div를 여기서 한 번 더 체크 (경로 문제 방지)
    const outputDiv = document.getElementById("output");
    if (!outputDiv) return;

    if (currentMode === 'melody') {
        generateRandomQuiz();
    } else if (currentMode === 'interval') {
        generateIntervalQuiz();
    } else if (currentMode === 'rhythm') { // 추가
        generateRhythmQuiz();
    }
}

window.onresize = () => {
    if (document.getElementById("training-screen").style.display === "flex") {
        refreshQuiz();
    }
};