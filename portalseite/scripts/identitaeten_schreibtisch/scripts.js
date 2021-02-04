/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

function showOverlay() {
    $('#videoContainer').hide();
    $('#overlay').show();
}

function hideOverlay() {
    $('#videoContainer').show();
    $('#overlay').hide();
}

function showText(id) {
    $('#' + id).removeClass("hidden");
}

function hideText(id) {
    $('#' + id).addClass("hidden");
}

function playVideoAgain() {
    //document.getElementById('schreibtischVideo').play();
}
