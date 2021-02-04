/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

var ua = window.navigator.userAgent;

window.onload = function () {
    if ((isIE() && !isEdge()) || (isWindows() && isSafari())) {
        this.window.location.href = "incompatible.html";
        throw new Error("Internet Explorer and Safari on Windows are not supported");
        return;
    }
}

function isWindows() {
    return navigator.platform.indexOf('Win') > -1;
}

function isIE() {
    var old_ie = ua.indexOf('MSIE ');
    var new_ie = ua.indexOf('Trident/');
    return ((old_ie > -1) || (new_ie > -1));
}

function isEdge() {
    var edge = ua.indexOf("Edge/");
    return edge > -1;
}

function isSafari() {
    var safari = ua.indexOf('Safari');
    var chrome = ua.indexOf('Chrome');
    var versionNumber = $.browser.versionNumber;
    return safari > -1 && chrome == -1 && versionNumber < 6;
}
