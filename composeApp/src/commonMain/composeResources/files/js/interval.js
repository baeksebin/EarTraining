function generateIntervalQuiz() {
    div.innerHTML = "";
    const w = getResponsiveWidth();
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(w, 200);
    const context = renderer.getContext();

    const staveWidth = Math.min(w * 0.6, 260);
    const staveX = (w - staveWidth) / 2;

    const stave = new VF.Stave(staveX, 40, staveWidth);
    stave.addClef("treble").setContext(context).draw();

    const note1 = getRandomNote();
    const note2 = getRandomNote();

    const interval_notes = [
        new VF.StaveNote({ keys: [note1], duration: "h" }),
        new VF.StaveNote({ keys: [note2], duration: "h" })
    ];

    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(interval_notes);

    new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
    voice.draw(context, stave);
}