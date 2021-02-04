/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

$(document).keydown(function(e) {
    if (e.keyCode == KEYCODE_ESC) {
        closeOverlay();
    };
});

function changeIframe(hyperlink) {
    document.getElementById("top-frame").setAttribute("src", hyperlink);
}

function reset() {
    var iframe = document.getElementById("top-frame");
    if (window.history.length == 0) {
        window.location.reload();
    }
}
