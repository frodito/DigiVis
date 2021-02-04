/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

$(document).on("swiperight", function () {
    var backButton = document.getElementById("backButton");
    if (!isEmpty(backButton)) {
        backButton.click();
    }
});

$(document).on("swipeleft", function () {
    var forwardButton = document.getElementById("forwardButton");
    if (!isEmpty(forwardButton)) {
        forwardButton.click();
    }
});

function getJsonFileAsObject(jsonFilePath) {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': jsonFilePath,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
}

function noTitle() {
    return json.title == "" && json.subtitle == "";
}

function validateWalkFormInput() {
    var walkTitle = document.getElementById(paramWalkTitle);
    if ((walkTitle.value).includes(constantTexts.unselectedWalk)) {
        setDisplay(true, document.getElementById("title"));
        $('#title').append(' <span class="error">You need to choose a walk</span>');
        return false;
    }
    return true;
}

function selectStation(stationNumber) {
    $('#dropdownNavigation').val(stationNumber);
    submitStationForm();
}

function submitStationForm() {
    document.forms["selectForm"].submit();
}


function preselectElement(id, valueToSelect) {
    var element = document.getElementById(id);
    element.value = valueToSelect;
}

function back() {
    var position = getCurrentStation();
    position -= position == 1 ? 1 : 0.5;
    if (!selectContainsOption("dropdownNavigation", position)) {
        position -= 0.5;
    }
    preselectElement("dropdownNavigation", position);
    document.forms["selectForm"].submit();
}

function forward() {
    var position = getCurrentStation();
    position += position == 0 ? 1 : 0.5;
    if (!selectContainsOption("dropdownNavigation", position)) {
        position += 0.5;
    }
    preselectElement("dropdownNavigation", position);
    document.forms["selectForm"].submit();
}

function selectContainsOption(selectId, optionValue) {
    return $("#" + selectId + " option[value='" + optionValue + "']").length !== 0;
}

function getCurrentStation() {
    var positionGet = findGetParameter(paramStation);
    var position;
    if (positionGet != null) {
        position = parseFloat(positionGet.split("+")[0]);
    } else {
        position = (noTitle() ? 1 : 0);
    }

    return position;
}

function getCurrentWalk() {
    var walkGet = findGetParameter(paramWalk);
    var walkTitleGet = findGetParameter(paramWalkTitle);
    walkGet = walkGet != null ? walkGet.split("+"[0]) : walkGet;
    walkTitleGet = walkTitleGet != null ? walkTitleGet.split("+"[0]) : walkTitleGet;
    return [walkGet, walkTitleGet];
}

function setImageRatio(img) {
    if (img.width > img.height) {
        return "horizontal";
    }
    return "vertical";

}

function clearText(element) {
    element.innerHTML = "";
}

function replaceLineBreak(input) {
    return input.split("\n").join("<br\>");
}

