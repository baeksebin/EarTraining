// js/utils.js
var VF = Vex.Flow;
var div = document.getElementById("output");

function getRandomNote() {
    const notes_list = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];
    return notes_list[Math.floor(Math.random() * notes_list.length)];
}

function getResponsiveWidth() {
    return Math.min(window.innerWidth - 30, 500);
}