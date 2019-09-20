var audio = [];

var audioInitializer = () => {
    'use strict';

    audio[0] = new Audio();
    audio[1] = new Audio();
    audio[2] = new Audio();
    audio[3] = new Audio();
    audio[4] = new Audio();
    audio[5] = new Audio();
    audio[6] = new Audio();

    // Specify the source
    audio[0].src = "musics/pacman_remix.mp3";
    audio[1].src = "musics/pacman_eatfruit.wav";
    audio[2].src = "musics/pacman_change_volume_ringtone.wav";
    audio[3].src = "musics/pacman_death.wav";
    audio[4].src = "musics/pacman_eatghost.wav";
    audio[5].src = "musics/pacman_chomp.wav";
    audio[6].src = "musics/pacman_wallhitten.wav";

    // The audio is gonna loop over the source
    audio[0].loop = true;
    audio[1].loop = false;
    audio[2].loop = false;
    audio[3].loop = false;
    audio[4].loop = false;
    audio[5].loop = true;
    audio[6].loop = false;

    // Put the audio in pause
    audio[0].pause();
    audio[1].pause();
    audio[2].pause();
    audio[3].pause();
    audio[4].pause();
    audio[5].pause();
    audio[6].pause();

    // Set the volume
    audio[0].volume = 0.2;
    audio[1].volume = 0.2;
    audio[2].volume = 0.2;
    audio[3].volume = 0.2;
    audio[4].volume = 0.2;
    audio[5].volume = 0.2;
    audio[6].volume = 0.8;

    // Setting speed of playback
    audio[0].playbackRate = 1;
    audio[1].playbackRate = 2.75;
    audio[2].playbackRate = 1.15;
    audio[5].playbackRate = 2;
    audio[6].playbackRate = 1;

    var playPauseBtn = document.getElementById("playpausebtn");
    var muteBtn = document.getElementById("mutebtn");
    var volumeSlider = document.getElementById("volumeslider");

    volumeSlider.value = 20;
    
    // Event handling
    playPauseBtn.onclick = () => {
        if (audio[0].paused) {
            audio[0].play();
            playPauseBtn.style.background = "url(images/pause.png) no-repeat";
        } else {
            audio[0].pause();
            playPauseBtn.style.background = "url(images/play.png) no-repeat";
        }
    };

    muteBtn.onclick = () => {
        if (audio[0].muted) {
            audio[0].muted = false;
            audio[1].muted = false;
            audio[2].muted = false;
            audio[3].muted = false;
            audio[4].muted = false;
            audio[5].muted = false;
            audio[6].muted = false;

            muteBtn.style.background = "url(images/volume-high.png) no-repeat";
        } else {
            audio[0].muted = true;
            audio[1].muted = true;
            audio[2].muted = true;
            audio[3].muted = true;
            audio[4].muted = true;
            audio[5].muted = true;
            audio[6].muted = true;

            muteBtn.style.background = "url(images/muted.png) no-repeat";
        }
    };

    volumeSlider.onchange = () => {
        audio[0].volume = volumeSlider.value/100;
        audio[1].volume = volumeSlider.value/100;
        audio[2].volume = volumeSlider.value/100;
        audio[3].volume = volumeSlider.value/100;
        audio[4].volume = volumeSlider.value/100;
        audio[5].volume = volumeSlider.value/100;
        audio[6].volume = volumeSlider.value/100;
        
        audio[2].play();
    };

    return audio

};

export {
    audioInitializer,
    audio
};