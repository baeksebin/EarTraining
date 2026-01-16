/* =========================================
   1. AUDIO ENGINE & CONFIG (호환성 최우선)
   ========================================= */
if (!window.audioCtx) {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

async function startApp() {
    // 1. AudioContext 활성화 (브라우저 잠금 해제)
    if (window.audioCtx.state === 'suspended') {
        await window.audioCtx.resume();
    }

    // 2. 시작 화면 숨기기
    const overlay = document.getElementById("start-overlay");
    if (overlay) overlay.style.display = "none";

    // 3. 첫 문제 재생
    generateIntervalQuiz(false);
}

const audioBuffers = {};
const samples = {
    // 3옥타브 (Sharp 대신 Flat 파일명 매칭: Cs -> Db)
    "C3": "C3.mp3", "Cs3": "Db3.mp3", "D3": "D3.mp3", "Ds3": "Eb3.mp3", "E3": "E3.mp3",
    "F3": "F3.mp3", "Fs3": "Gb3.mp3", "G3": "G3.mp3", "Gs3": "Ab3.mp3", "A3": "A3.mp3", "As3": "Bb3.mp3", "B3": "B3.mp3",
    // 4옥타브
    "C4": "C4.mp3", "Cs4": "Db4.mp3", "D4": "D4.mp3", "Ds4": "Eb4.mp3", "E4": "E4.mp3",
    "F4": "F4.mp3", "Fs4": "Gb4.mp3", "G4": "G4.mp3", "Gs4": "Ab4.mp3", "A4": "A4.mp3", "As4": "Bb4.mp3", "B4": "B4.mp3",
    // 5옥타브
    "C5": "C5.mp3", "Cs5": "Db5.mp3", "D5": "D5.mp3", "Ds5": "Eb5.mp3", "E5": "E5.mp3",
    "F5": "F5.mp3", "Fs5": "Gb5.mp3", "G5": "G5.mp3", "Gs5": "Ab5.mp3", "A5": "A5.mp3", "As5": "Bb5.mp3", "B5": "B5.mp3"
};

const noteToMidi = { "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11 };
let isAudioLoaded = false;
let currentCorrectNote = "";
let isAnswered = false;

// ✅ 표준 MIDI 번호 계산 (C4 = 60)
function getMidiNumber(noteStr) {
    const parts = noteStr.split("/");
    const name = parts[0].toUpperCase().replace("S", "#");
    const oct = parseInt(parts[1]);
    return (oct + 1) * 12 + noteToMidi[name];
}

/* =========================================
   2. SAMPLE LOAD (new Audio 방식 유지)
   ========================================= */
async function loadSamples() {
    console.log("⏳ 샘플 로딩 시작...");
    const sampleEntries = Object.entries(samples);
    await Promise.all(sampleEntries.map(([name, file]) => {
        return new Promise((resolve) => {
            const audio = new Audio();
            // ✅ 상대 경로를 명시적으로 작성
            audio.src = "samples/" + file;
            audio.preload = "auto";

            audio.oncanplaythrough = () => {
                audioBuffers[name] = { audio };
                resolve();
            };
            audio.onerror = () => {
                console.error(`❌ 로드 실패: samples/${file}`);
                resolve();
            };
        });
    }));
    isAudioLoaded = true;
    console.log("🎹 모든 음원 로드 완료");
}

/* =========================================
   3. NOTE PLAY (피치 보정 로직 강화)
   ========================================= */
function playNoteNative(fullNote) {
    if (!isAudioLoaded) return;

    if (window.audioCtx.state === 'suspended') {
        window.audioCtx.resume();
    }

    // "C#/4" -> "Cs4" 형식으로 변환하여 매칭
    const parts = fullNote.split("/");
    const noteName = parts[0].replace("#", "s");
    const octave = parts[1];
    const sampleKey = noteName + octave;

    if (audioBuffers[sampleKey]) {
        const audio = audioBuffers[sampleKey].audio;

        // 안드로이드 중복 재생 방지 및 초기화
        // audio.pause();
        audio.currentTime = 0;

        // ✅ 배속 연산을 아예 하지 않음 (무조건 원본 음정 재생)
        audio.playbackRate = 1.0;

        // 즉시 재생 (setTimeout 0ms는 안드로이드 하드웨어 가속을 위해 유지하는 것이 좋습니다)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.error(`${fullNote} 재생 실패:`, e));
        }

        console.log(`🔊 [정밀 재생] ${fullNote} (사용 파일: ${samples[sampleKey]})`);
    } else {
        console.warn(`⚠️ 샘플 누락: ${sampleKey}.mp3 파일이 폴더에 없습니다.`);
    }
}

/* =========================================
   4. UI & QUIZ 로직 (기존 유지)
   ========================================= */
function playQuestion() {
    // 악보 영역 클릭 시 실행될 함수
    if (currentCorrectNote) {
        playNoteNative(currentCorrectNote);
        console.log("🎵 악보 클릭으로 소리 재생:", currentCorrectNote);
    }
}

function generateIntervalQuiz(preventAutoPlay = false) {
    if (!isAudioLoaded) {
        setTimeout(() => generateIntervalQuiz(preventAutoPlay), 300);
        return;
    }
    currentCorrectNote = getRandomNote();
    isAnswered = false;
    document.getElementById("quiz-instruction").innerHTML =
        "어떤 소리일까요? <br><small style='color:#666;'>(악보 칸을 터치하면 다시 들을 수 있습니다)</small>";
    const actionButtons = document.getElementById("action-buttons");
    if (actionButtons) {
        // 기존 '다시 듣기' 버튼 제거, '새 문제' 버튼만 작게 유지하거나 생략 가능
        actionButtons.innerHTML = `
            <button class="main-btn" style="background-color: #6c757d;" onclick="generateIntervalQuiz(false)">새 문제 만들기</button>
        `;
    }
    drawStave("");
    renderPianoKeyboard();
    if (!preventAutoPlay) setTimeout(playQuestion, 600);
}

function renderPianoKeyboard() {
    const container = document.getElementById("piano-container");
    const navContainer = document.getElementById("piano-navigator-container");
    const indicator = document.getElementById("navigator-indicator");
    const wrapper = document.getElementById("piano-wrapper");
    const navWrapper = document.getElementById("piano-navigator-wrapper");
    if (!container || !navContainer) return;
    container.innerHTML = ""; navContainer.innerHTML = "";
    const octaves = [3, 4, 5];
    const notes = [
        { n: "C", t: "white" }, { n: "C#", t: "black" }, { n: "D", t: "white" }, { n: "D#", t: "black" },
        { n: "E", t: "white" }, { n: "F", t: "white" }, { n: "F#", t: "black" }, { n: "G", t: "white" },
        { n: "G#", t: "black" }, { n: "A", t: "white" }, { n: "A#", t: "black" }, { n: "B", t: "white" }
    ];
    octaves.forEach(oct => {
        notes.forEach(note => {
            const full = `${note.n}/${oct}`;
            const key = document.createElement("div");
            key.className = note.t === "white" ? "white-key" : "black-key";
            key.addEventListener("pointerdown", e => {
                e.preventDefault();
                playNoteNative(full);
                key.classList.add("active");

                if (!isAnswered && currentCorrectNote) {
                    const isCorrect = (full === currentCorrectNote);
                    isAnswered = true;
                    drawStave(full, isCorrect);
                    showResultUI(isCorrect);
                }
            });
            key.addEventListener("pointerup", () => key.classList.remove("active"));
            key.addEventListener("pointerleave", () => key.classList.remove("active"));
            container.appendChild(key);
            const miniKey = document.createElement("div");
            miniKey.className = note.t === "white" ? "nav-white" : "nav-black";
            navContainer.appendChild(miniKey);
        });
    });
    setupSlider(container, navContainer, indicator, wrapper, navWrapper);
}

function setupSlider(container, navContainer, indicator, wrapper, navWrapper) {
    let isDragging = false;
    let containerRect = null;
    const moveIndicator = (clientX) => {
        if (!containerRect) return;
        const maxLeft = navContainer.clientWidth - indicator.offsetWidth;
        let leftPos = (clientX - containerRect.left) - (indicator.offsetWidth / 2);
        leftPos = Math.max(0, Math.min(leftPos, maxLeft));
        indicator.style.left = leftPos + "px";
        const movePercent = maxLeft > 0 ? leftPos / maxLeft : 0;
        wrapper.scrollLeft = movePercent * (container.scrollWidth - wrapper.clientWidth);
    };
    navWrapper.addEventListener('pointerdown', e => {
        isDragging = true; containerRect = navContainer.getBoundingClientRect();
        moveIndicator(e.clientX || e.touches[0].clientX);
    });
    window.addEventListener('pointermove', e => { if (isDragging) moveIndicator(e.clientX || e.touches[0].clientX); });
    window.addEventListener('pointerup', () => { isDragging = false; });
}

function drawStave(userNote = "", isCorrect = null) {
    const div = document.getElementById("output");
    if (!div) return;
    div.innerHTML = "";

    div.onclick = playQuestion;
    div.style.cursor = "pointer"; // 클릭 가능하다는 표시

    const w = div.offsetWidth || 320;
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(w, 200);
    const context = renderer.getContext();
    const stave = new VF.Stave((w - 260) / 2, 40, 260);
    stave.addClef("treble").setContext(context).draw();

    if (userNote && currentCorrectNote) {
        try {
            // ✅ VF 포맷 보정 (소문자로 변환)
            const formatForVF = (note) => note.toLowerCase();

            const notes = [
                new VF.StaveNote({ keys: [formatForVF(currentCorrectNote)], duration: "h" }),
                new VF.StaveNote({ keys: [formatForVF(userNote)], duration: "h" })
            ];

            // 1. 색상 및 임시표 처리
            [currentCorrectNote, userNote].forEach((noteStr, index) => {
                // 사용자가 누른 두 번째 노트에만 결과 색상 적용
                if (index === 1 && isCorrect !== null) {
                    const color = isCorrect ? "#28a745" : "#dc3545";
                    notes[index].setStyle({ fillStyle: color, strokeStyle: color });
                }

                // ✅ 임시표(#, b) 추가 로직 수정
                // .addAccidental 이 안될 경우를 대비해 .addModifier 사용 시도
                if (noteStr.includes("#")) {
                    const accidental = new VF.Accidental("#");
                    if (typeof notes[index].addAccidental === "function") {
                        notes[index].addAccidental(0, accidental);
                    } else {
                        // 최신 VexFlow 호환 방식
                        notes[index].addModifier(accidental, 0);
                    }
                } else if (noteStr.includes("b")) {
                    const accidental = new VF.Accidental("b");
                    if (typeof notes[index].addAccidental === "function") {
                        notes[index].addAccidental(0, accidental);
                    } else {
                        // 최신 VexFlow 호환 방식
                        notes[index].addModifier(accidental, 0);
                    }
                }
            });

            const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
            voice.addTickables(notes);
            new VF.Formatter().joinVoices([voice]).format([voice], 180);
            voice.draw(context, stave);

        } catch (e) {
            console.error("🚀 VexFlow 최종 렌더링 실패:", e);
        }
    }
    if (!userNote) {
        context.setFont("Arial", 12).setFillStyle("#999");
        context.fillText("탭하여 소리 듣기", (w / 2) - 40, 150);
    }
}

function getRandomNote() {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return `${noteNames[Math.floor(Math.random() * noteNames.length)]}/4`;
}

function showResultUI(isCorrect) {
    const instruction = document.getElementById("quiz-instruction");
    const actionButtons = document.getElementById("action-buttons");
    if (isCorrect) {
        instruction.innerHTML = "<span style='color:#28a745;font-weight:bold'>정답 🎉</span>";
        actionButtons.innerHTML = "";
        setTimeout(() => generateIntervalQuiz(false), 1200);
    } else {
        instruction.innerHTML = `<span style='color:#dc3545;font-weight:bold'>오답 ❌</span>`;
        actionButtons.innerHTML = `
            <button class="main-btn" onclick="generateIntervalQuiz(false)">다음 문제</button>
            <button class="main-btn" style="background:#6c757d" onclick="retryCurrentQuiz()">다시 시도</button>
        `;
    }
}

function retryCurrentQuiz() { isAnswered = false; drawStave(""); playQuestion(); }

window.addEventListener("load", async () => {
    if (document.getElementById("piano-container")) renderPianoKeyboard();
    await loadSamples();
    generateIntervalQuiz(true);
    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
        startBtn.innerText = "퀴즈 시작하기";
        startBtn.disabled = false;
    }
});