

$(document).keydown(function(e) {
    if (e.keyCode == KEYCODE_ESC) {
        hidePopups(detailPopup);
        hidePopups(decisionPopup);
        hidePopups(helpPopup);
    };
    if(e.keyCode == KEYCODE_ENTER){
        //TODO check mode here
        $("#startGameRandom").click();
    }
});

// auxiliary functions --------------------------------------------------------

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

function getReducedPairs(originalPairs, maxNumber){
    var randomPairs = copyArray(originalPairs);
    while(randomPairs.length > maxNumber/2){
        randomPairs.splice(getRandomValue(0, randomPairs.length), 1);
    }
    return randomPairs;
}

function copyArray(originalArray){
    var newArray = [];
    originalArray.forEach(function(object){
        newArray.push(copyObject(object));
    })
    return newArray;
}

function copyObject(originalObject){
    return Object.assign({}, originalObject);
}

// ----------------------------------------------------------------------

function isEmpty(element){
    return element == null || element == "";
}

function addClassesToClassList(element, ...classes){
    classes.forEach(function(classString){
        element.classList.add(classString);
    })
}

function removeClassesFromClassList(element, ...classes){
    classes.forEach(function(classString){
        element.classList.remove(classString);
    })
}

function submitForm(formId) {
    document.forms[formId].submit();
}

function isImage(element){
    return element.tagName == 'IMG';
}

/*
function getCurrentStation() {
    var positionGet = findGetParameter("station");
    var position;
    if (positionGet != null) {
        position = parseInt(positionGet.split("+")[0]);
    } else {
        position = 0;
    }
    return position;
}
*/

function setImageRatio(img) {
    if (img.width > img.height) {
        return "horizontal";
    }
    return "vertical";

}

function replaceLineBreak(input) {
    return input.split("\n").join("<br\>");
}

function getCell(cellId) {
    return getById("td_" + cellId);
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function () {
        for (let i=this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});
