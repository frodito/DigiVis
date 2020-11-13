function setData() {

    Levels.level0
        .setData(constantTexts.dataLevel1)
        .setInnerRadius(selectedDimensions.innerRadius)
        .setOuterRadius(selectedDimensions.outerRadius);
    Levels.level1
        .setData(constantTexts.dataLevel1)
        .setInnerRadius(selectedDimensions.innerRadius)
        .setOuterRadius(selectedDimensions.outerRadius);
    Levels.level2
        .setData(constantTexts.dataLevel2)
        .setInnerRadius(selectedDimensions.innerRadius)
        .setOuterRadius(selectedDimensions.outerRadius);
    Levels.level3
        .setData(constantTexts.dataLevel2)
        .setInnerRadius(selectedDimensions.innerRadius)
        .setOuterRadius(selectedDimensions.outerRadius);


}

function getRandomArray(numberOptions) {
    let newRandom = Math.floor(Math.random() * ((numberOptions * 1.5) - (numberOptions + 1) + 1) + (numberOptions + 1));
    let randomData = new Array(newRandom);
    //randomData.fill(10);
    for (var i = 0; i < randomData.length; i++) {
        randomData[i] = 10;
    }
    return randomData;
}

function getArrayWithSize(size) {
    let array = new Array(size);
    //array.fill(10);
    for (var i = 0; i < array.length; i++) {
        array[i] = 10;
    }
    return array;
}

function getBack1Array() {
    let array = new Array(9);
    //array.fill({value: 10});
    for (var i = 0; i < array.length; i++) {
        array[i] = {value: 10};
    }
    array[4] = {value: 15};
    return array;
}

function getCircleData() {
    var r = innerRadius * 0.95;
    var startX = width / 2 - r;
    // ("d", "M start,cx a r,r 0 1,0 2r,0 a r,r 0 1,0 -2r,0");
    return 'm' + startX + ','
        + (height / 2) + ' ' + 'a' + r + ','
        + r + ' 0 1,' +
        '0 ' + (2 * r) + ',' +
        '0 a ' + r + ',' +
        r + ' 0 1,' +
        '0 -' + (2 * r) + ',0';
}

function getPathOfElement(element) {
    var path = d3.select(element).select("path").attr("d");
    return path;
}

function splitMultiline(string) {


    var newString = "- ";
    var counter = 0;
    var paragraphs = string.split('\n');

    //max number of needed lines (including line breaks)
    var numberElements = paragraphs.length - 1;
    for (var x = 0; x < paragraphs.length; x++) {
        numberElements += paragraphs[x].split(" ").length;
    }
    var newArray = new Array(numberElements);

    for (var i = 0; i < paragraphs.length; i++) {
        var splitWords = paragraphs[i].split(" ");
        var n = 0;
        for (n; n < splitWords.length; n++) {
            if (newString.length <= 10 && ((newString + splitWords[n]).length < numWordsDetailText)) {
                newString += " " + splitWords[n];
            } else if (splitWords[n].length >= numWordsDetailText) {
                if (newString != "") {
                    newArray[counter] = newString;
                    counter++;
                }
                newString = splitWords[n];
            } else {
                newArray[counter] = newString;
                counter++;
                newString = "";
                n -= 1;
            }
        }
        newArray[counter] = newString;
        counter++;
        newString = "- ";
        newArray[counter] = " ";
        counter++;
    }
    newArray[counter - 1] = "";
    for (var j = 0; j < newArray.length; j++) {
        if (newArray[j] == null || newArray[j] == "") {
            newArray.splice(j, 1);
        }
    }
    return newArray;
}

function appendMultilineText(element, text, side) {
    var lines = splitMultiline(text);
    var detailPathRight = d3.select(element);

    var bias = 1800;

    var correctX = 0;
    var moveX = 0;
    if (side == right) {
        correctX = (bias + height) / 33;
        moveX = 7;
    }
    if (side == left) {
        correctX = -(bias + height) / 112;
        moveX = -7;
    }

    var textField = detailPathRight.append("text")
        .attr("id", "detail_" + side)
        .attr("transform", function (d) {
            var x = arcBack1.centroid(d)[0] - correctX;
            var y = arcBack1.centroid(d)[1] - (bias + height) / 16;
            return "translate(" + x + ", " + y + ")";
        })
        .attr("class", "detailText");

    var xMove = 25;
    var yMove = 24;
    for (var i = 0; i < lines.length; i++) {
        textField.append("tspan")
            .attr("text-anchor", "middle")
            .attr("x", xMove += moveX)
            .attr("y", yMove += 24)
            .text(lines[i]);
    }
}

function checkGetParamsAndSwitchLanguage(language) {
    var page = findGetParameter('page');
    if (isEmpty(page)) {
        redirectToHomePage();
    }
    switchLanguage(language, {key: 'page', value: page});
}

function clone(selector) {
    var node = d3.select(selector).node();
    var clone = d3.select(node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling));
    clone.attr("id", "clone");
    return clone;
}

function isValidPageParam() {
    var page = findGetParameter("page");
    return !isEmpty(page) && !(page < 0) && !(page >= mainMenu.length);

}


function setIframe() {
    var page = findGetParameter("page");
    if (page == null || page == "") page = 0;
    var iframe = document.getElementById("top-frame");

    iframe.setAttribute("src", mainMenu[page].hyperlink + languageParameter + selectedLanguage);

    setIframeHeightToContentHeight('top-frame');

}

function changeIframe(i) {
    var language = findGetParameter("lg");
    window.location.href = "portal_evg_sub.html" + languageParameter + language + "&page=" + i;
}


function collapseSlider() {
    $('#infoText').hasClass("show") ? closeSlider() : openSlider();
}

function openSlider() {
    $('#infoText').css("margin-left", 0);
    $("#infoText").addClass("show");
    $('#infoCollapse').css("margin-left", sliderWidth - 1 + "%");
    $('#sliderArrow').css("transform", "rotate(180deg)");
}

function closeSlider() {
    $('#infoText').css("margin-left", "-" + sliderWidth + "%");
    $("#infoText").removeClass("show");
    $('#infoCollapse').css("margin-left", 0);
    $('#sliderArrow').css("transform", "rotate(0)");
}

function itemOnMouseover(id, i, level) {
    if (level === 1) {
        $('#' + id + i).css("background-color", colorScheme02TopHover[i]);
    } else if (level === 2) {
        $('#' + id + i).css("background-color", colorScheme02Hover[i]);
    }
}

function itemOnMouseout(id, i, level) {
    var page = findGetParameter(paramPage);
    var color;
    if (level === 1) {
        color = selectedMenuItem.superItem === i ? colorScheme02TopHover[i] : colorScheme02Top[i];
    } else if (level === 2) {
        color = page == i ? colorScheme02Hover[i] : colorScheme02[i];
    }

    $('#' + id + i).css("background-color", color);
}
