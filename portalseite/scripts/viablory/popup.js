
function buildPopups(){
    buildDetailPopup();
    buildDecicionPopup();
    buildHelpPopup();
}

function buildDetailPopup(){
    $('body').append('<div id="' + detailPopup + '" class="popup"></div>');
    $('#' + detailPopup).append('<div id="' + detailPopup + 'Content" class="popup-content row"></div>');
    $('#' + detailPopup + 'Content').append('<div class="row ml-0"><span class="col close" onclick="hidePopups()">&times;</span></div>');
    $('#' + detailPopup + 'Content').append('<div id="imagePart" class="col ml-1 sub-content halfWidth text-center p-4 float-left"></div>');
    $('#' + detailPopup + 'Content').append('<div id="textPart" class="col sub-content halfWidth text-center text-justify p-4 float-left"></div>');
    $('#imagePart').append('<img id="fullImage" style="max-height: 45vh; max-width: 60vw"/>');
    $('#textPart').append('<p id="textP"></p>');
}

function buildDecicionPopup(){
    $('body').append('<div id="' + decisionPopup + '" class="popup"></div>');
    $('#' + decisionPopup).append('<div id="' + decisionPopup + 'Content" class="popup-content"></div>');

    //$('#' + decisionPopup + 'Content').append('<span class="close" onclick="hidePopup(decisionPopup)">&times;</span>');
    $('#' + decisionPopup + 'Content').append(
        '<div id="finishedText" class="sub-content w-100 text-center p-4">' +
            '<div class="container-fluid">' +
                '<div class="row">' +
                    '<div id="whoWonCol" class="col-12"></div> ' +
                '</div>' +
                '<div id="congratsRow" class="row">' +
                    '<div id="congratsCol" class="col-12"></div> ' +
                '</div>' +
                '<div id="decisionRow" class="row mt-5 justify-content-center"></div>' +
            '</div>' +
        '</div>'
    );
    $('#decisionRow').append(
        '<button id="playAgainButton" ' +
            'class="col-6 main-button startButton m-1" ' +
            'onclick="confirmRestart()">' +
                '<p>' + constantTexts.playAgain + '</p>' +
        '</button>'
    );
    $('#decisionRow').append(
        '<button id="backToBoardButton" ' +
            'class="col-6 main-button startButton m-1" ' +
            'onclick="hidePopups()">' +
            '<p>' + constantTexts.backToBoard + '</p>' +
        '</button>'
    );
    // $('#decisionRown').append(
    //     '<button id="describeAgainButton" ' +
    //     'class="col-6 main-button startButton" ' +
    //     'onclick="confirmDescribeAgain()">' +
    //     '<p>' + constantTexts.describeAgain + '</p>' +
    //     '</button>'
    // );
}

function buildHelpPopup(){
    $('body').append('<div id="' + helpPopup + '" class="popup"></div>');
    $('#' + helpPopup).append('<div id="' + helpPopup + 'Content" class="popup-content row"></div>');
    $('#' + helpPopup + 'Content').append('<div class="row ml-0"><span class="col close" onclick="hidePopups()">&times;</span></div>');
    $('#' + helpPopup + 'Content').append(
        '<div id="finishedText" class="sub-content fullWidth center">' +
        '<div id="instructions" style="color: black">' +
        '<h2>' + constantTexts.instructionTitle + '</h2>' +
        replaceLineBreak(constantTexts.instructions) +
        '</div>' +
        '</div>'
    );

}

function showPopup(popupId, cellId, isImage){
    switch (popupId) {
        case helpPopup:
            break;
        case detailPopup:
            fillDetailPopup(cellId, isImage);
            break;
        case decisionPopup:
            fillDecisionPopup();
            break;
        default:
            throw new Error("Unknown Popup " + popupId);

    }

    if(popupId == detailPopup){
        fillDetailPopup(cellId, isImage);
    }
    setDisplay(true, getById(popupId));
}

function fillDetailPopup(cellId, isImage){
    var imagePart = getById("imagePart");
    var textPart = getById("textPart");
    var image = getById("fullImage");
    var text = getById("textP");

    var pairIndex = matchMap.get(cellId)
    setDisplay(true, imagePart, textPart);

    var pair = selectedPairs[pairIndex];

    $('#' + detailPopup + 'Content').removeClass('w-50');
    $('#' + detailPopup + 'Content').addClass('w-auto');

    var textDescription = constantTexts.describePicturePrefix + " \'" + pair.content + "\' " + constantTexts.describePictureSuffix;

    if(correctPairsList.has(pairIndex)){
        image.src = pair.imageSource;

        text.innerHTML = textDescription;
    }
    else if(isImage){
        setDisplay(false, textPart);
        image.src = pair.imageSource;
    }
    else {
        setDisplay(false, imagePart);
        $('#' + detailPopup + 'Content').addClass('w-50');
        $('#' + detailPopup + 'Content').removeClass('w-auto');
        text.innerHTML = textDescription;
    }
}

function fillDecisionPopup(){
    var congratsRow = document.getElementById("congratsRow");
    if(pointsPlayer1 == pointsPlayer2){
        setDisplay(false, congratsRow);
        $('#whoWonCol').append('<h2 id="result">' + constantTexts.draw + '</h2>');
    }
    else if (pointsPlayer1 > pointsPlayer2){
        setDisplay(true, congratsRow);
        $('#whoWonCol').append('<h2 id="result">' + player1Name + constantTexts.won + '</h2>');
        $('#congratsCol').append('<h3 id="congrats">' + constantTexts.congratulations + '</h3>');
    }
    else if (pointsPlayer2 > pointsPlayer1){
        setDisplay(true, congratsRow);
        $('#whoWonCol').append('<h2 id="result">' + player2Name + constantTexts.won + '</h2>');
        $('#congratsCol').append('<h3 id="congrats">' + constantTexts.congratulations + '</h3>');
    }
    //$('#finishedText').append('</br><span>' + replaceLineBreak(constantTexts.playAgain) + '</span>');
}


window.onclick = function(event) {
    var popupDetail = getById(detailPopup);
    var popupDecision = getById(decisionPopup);
    var popupHelp = getById(helpPopup);
    if (event.target == popupDetail || event.target == popupDecision || event.target == popupHelp) {
        setDisplay(false, popupDetail, popupDecision, popupHelp);
    }
}

function confirmRestart(){
    var result = confirm(constantTexts.restart);
    if(result){
        //window.location.reload();
        window.location.assign("viablory.html" + languageParameter + selectedLanguage + getParamForURL(paramMode, Mode.play));
    }
}

function confirmDescribeAgain() {
    if(confirm(constantTexts.restart)) {
        selectedMode(Mode.start);
    }
}
