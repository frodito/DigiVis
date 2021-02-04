/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

/**
 * color functions for outer rings
 */
//function menuColor(i){return "hsl(300, 70%, " + getBrightness(i, 10) + "%)"};
function menuColor(i) {
    return "hsl(" + getHue(i, 30) + ", 75%, 40%)"
}

function backColor(i, id) {
    return "hsl(" + (backColorHues.backColorHue1 - ((id - 1) * 60)) + ", " + backColorHues.saturation + ", " + getBrightness(i, backColorHues.brightnessScale) + "%)"
}

function getHue(i, scale) {
    let hue = ((i) * scale);
    return hue;
}

function getBrightness(i, scale) {
    let brightness = ((i + 1) * scale)
    if (brightness >= 85) {
        brightness -= scale * 8;
    }
    if (brightness < 15) {
        brightness = 15 + 5 * i;
    }
    return brightness;
}
