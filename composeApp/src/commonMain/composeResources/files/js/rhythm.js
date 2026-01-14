function generateRhythmQuiz() {
    div.innerHTML = "";
    const w = getResponsiveWidth();
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(w, 200);
    const context = renderer.getContext();

    const stave = new VF.Stave(10, 60, w - 20);
    stave.addTimeSignature("4/4");
    stave.getConfigForLines().forEach(line => line.visible = false);
    stave.setConfigForLine(2, { visible: true });
    stave.setContext(context).draw();

    const rhythm_notes = [];
    const all_beams = [];
    const noteHead = "b/4";

    // ✅ i를 4까지 돌리되, 2박자 패턴이 나오면 i를 추가로 증가시켜야 합니다.
    for (let i = 0; i < 4; ) {
        // 0~8까지 랜덤 패턴 선택
        const pattern = Math.floor(Math.random() * 9);
        let current_pattern_notes = [];
        let beatsUsed = 1; // 기본적으로 1박자 사용

        if (pattern === 0) {
            current_pattern_notes.push(new VF.StaveNote({ keys: [noteHead], duration: "q" }));
        } else if (pattern === 1) {
            current_beat_notes = [new VF.StaveNote({ keys: [noteHead], duration: "8" }),
                new VF.StaveNote({ keys: [noteHead], duration: "8" })];
            current_pattern_notes.push(...current_beat_notes);
        } else if (pattern === 2) {
            for(let j=0; j<4; j++) current_pattern_notes.push(new VF.StaveNote({ keys: [noteHead], duration: "16" }));
        } else if (pattern === 3) {
            // ✅ 점 8분 + 16분 (부점)
            const n1 = new VF.StaveNote({ keys: [noteHead], duration: "8" });
            VF.Dot.buildAndAttach([n1], { all: true });
            current_pattern_notes.push(n1, new VF.StaveNote({ keys: [noteHead], duration: "16" }));
        } else if (pattern === 4) {
            // ✅ 16분 + 점 8분 (역부점/싱코페이션) - 요청하신 리듬!
            const n2 = new VF.StaveNote({ keys: [noteHead], duration: "16" });
            const n3 = new VF.StaveNote({ keys: [noteHead], duration: "8" });
            VF.Dot.buildAndAttach([n3], { all: true });
            current_pattern_notes.push(n2, n3);
        } else if (pattern === 5 && i <= 2) {
            // ✅ 점 4분음표 + 8분음표 (총 2박자 소모)
            const n4 = new VF.StaveNote({ keys: [noteHead], duration: "q" });
            VF.Dot.buildAndAttach([n4], { all: true });
            current_pattern_notes.push(n4, new VF.StaveNote({ keys: [noteHead], duration: "8" }));
            beatsUsed = 2;
        } else if (pattern === 6) {
            current_pattern_notes.push(new VF.StaveNote({ keys: [noteHead], duration: "16" }),
                new VF.StaveNote({ keys: [noteHead], duration: "8" }),
                new VF.StaveNote({ keys: [noteHead], duration: "16" }));
        } else if (pattern === 7) {
            current_pattern_notes.push(new VF.StaveNote({ keys: [noteHead], duration: "8" }),
                new VF.StaveNote({ keys: [noteHead], duration: "16" }),
                new VF.StaveNote({ keys: [noteHead], duration: "16" }));
        } else {
            current_pattern_notes.push(new VF.StaveNote({ keys: [noteHead], duration: "16" }),
                new VF.StaveNote({ keys: [noteHead], duration: "16" }),
                new VF.StaveNote({ keys: [noteHead], duration: "8" }));
        }

        // 빔 생성 (1박자 단위 리듬들만)
        if (current_pattern_notes.length > 1 && beatsUsed === 1) {
            all_beams.push(new VF.Beam(current_pattern_notes));
        }

        rhythm_notes.push(...current_pattern_notes);
        i += beatsUsed; // 사용한 박자만큼 인덱스 증가
    }

    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false);
    voice.addTickables(rhythm_notes);
    new VF.Formatter().joinVoices([voice]).format([voice], w * 0.7);
    voice.draw(context, stave);
    all_beams.forEach(b => b.setContext(context).draw());
}