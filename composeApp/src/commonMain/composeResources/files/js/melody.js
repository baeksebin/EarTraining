function generateRandomQuiz() {
    div.innerHTML = "";
    const w = getResponsiveWidth();
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(w, 200);
    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, w - 20);
    stave.addClef("treble").addTimeSignature("4/4");
    stave.setContext(context).draw();

    const random_notes = [];
    const ties = [];

    for (let i = 0; i < 4; i++) {
        const pattern = Math.floor(Math.random() * 6);
        let current_beat_notes = [];
        if (pattern === 0) current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "q" }));
        else if (pattern === 1) current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "8" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "8" }));
        else if (pattern === 2) for(let j=0; j<4; j++) current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }));
        else if (pattern === 3) current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "8" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }));
        else if (pattern === 4) current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "8" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }));
        else current_beat_notes.push(new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "16" }), new VF.StaveNote({ keys: [getRandomNote()], duration: "8" }));

        if (i > 0 && Math.random() > 0.6) {
            const prev_beat_last_note = random_notes[random_notes.length - 1];
            const current_beat_first_note = current_beat_notes[0];
            current_beat_first_note.keys = prev_beat_last_note.keys;
            ties.push(new VF.StaveTie({ first_note: prev_beat_last_note, last_note: current_beat_first_note }));
        }
        random_notes.push(...current_beat_notes);
    }

    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false);
    voice.addTickables(random_notes);
    const beams = VF.Beam.generateBeams(random_notes);
    const formatterWidth = w * 0.7;
    new VF.Formatter().joinVoices([voice]).format([voice], formatterWidth);

    voice.draw(context, stave);
    beams.forEach(b => b.setContext(context).draw());
    ties.forEach(t => t.setContext(context).draw());
}