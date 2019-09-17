var keyboard = {};

function keyDown(event) {
    // When you click on keyboard set true to start moving
    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    // When you let the keyboard key, set false to stop moving
    keyboard[event.keyCode] = false;
}

function addKeyboardListeners() {
    window.addEventListener('keyup', keyUp);
    window.addEventListener('keydown', keyDown);
}

export {
    keyboard,
    addKeyboardListeners
}
