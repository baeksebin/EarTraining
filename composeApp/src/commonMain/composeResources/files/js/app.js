let currentMode = 'melody';

// ✅ 홈에서 특정 훈련으로 이동
// ✅ 홈에서 특정 훈련으로 이동 (수정 버전)
async function navigateTo(mode) {
    console.log("🎹 [System] User gesture detected. Unlocking Audio...");

    // 1. AudioContext 활성화
    if (window.audioCtx && window.audioCtx.state === 'suspended') {
        await window.audioCtx.resume();
    }

    // 2. ✅ 모든 샘플 "무음 예열" (보안 빗장 풀기)
    // 이 작업은 반드시 클릭 이벤트 직후인 지금 이 함수 안에서 실행되어야 합니다.
    const samples = Object.values(audioBuffers);
    if (samples.length > 0) {
        samples.forEach(obj => {
            if (obj.audio) {
                obj.audio.muted = true;
                const playPromise = obj.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        obj.audio.pause();
                        obj.audio.currentTime = 0;
                        obj.audio.muted = false;
                        console.log("🔓 Audio Unlocked");
                    }).catch(e => console.log("Unlock pending..."));
                }
            }
        });
    }

    // 3. 화면 전환
    currentMode = mode;
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("training-screen").style.display = "flex";

    let titleText = "훈련";
    if (mode === 'melody') titleText = "선율+리듬 청음";
    else if (mode === 'interval') titleText = "음정 연습";
    else if (mode === 'rhythm') titleText = "리듬 훈련";
    document.getElementById("current-title").innerText = titleText;

    // 4. ✅ [수정 핵심] 자동 재생은 막고 '퀴즈 생성'만 수행
    if (isAudioLoaded && samples.length >= 12) { // 12개 샘플 전수 로드 확인
        // generateIntervalQuiz를 그대로 쓰되,
        // 내부의 playQuestion() 호출만 막는 로직이 필요합니다.
        generateIntervalQuiz(true); // 'true' 인자를 넘겨 자동재생 방지 플래그로 활용
    } else {
        document.getElementById("quiz-instruction").innerText = "음원 로딩 중입니다. 잠시만 기다려주세요.";
        const checkReady = setInterval(() => {
            if (isAudioLoaded && Object.keys(audioBuffers).length >= 12) {
                clearInterval(checkReady);
                generateIntervalQuiz(true);
            }
        }, 100);
    }
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