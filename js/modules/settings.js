import {audio} from './audio.js';
var settinged = false, stopped = false;

var settingsInitializer = () => {

    var settingsBtn = document.getElementById("settings");
    var settingsTable = document.getElementById("container");
    var backBtn = document.getElementById("back");

    settingsBtn.onclick = () => {
        settinged = true;
        settingsTable.style.display = 'initial';
        if (!audio[0].paused) {
            audio[0].pause();
            stopped = true;
        }
    }

    backBtn.onclick = () => {
        settingsTable.style.display = 'none';
        if (stopped) {
            audio[0].play();
            stopped = false;
        }
        settinged = false;
    }
}

export {
    settingsInitializer,
    settinged,
    stopped,
}