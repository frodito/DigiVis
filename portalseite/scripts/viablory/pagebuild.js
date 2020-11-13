(function () {
    buildPage();
})();

function buildPage() {

    checkCompatibility();

    loadSessionStorage();
    player1Name = findGetParameter("p1");
    player2Name = findGetParameter("p2");
    selectedMode = findGetParameter("mode")
    var startNumber = findGetParameter("s");

    this.setLanguage();
    createMenu();

    switch (selectedMode) {
        case Mode.start:
            initializeGlobals();
            createModeSelection();
            break;
        case Mode.instructor:
            createInstructorPage();
            break;
        case Mode.selectSession:
            getCurrentSessions();
            createSelectSession();
            break;
        // case Mode.student1:
        //     createStudentPage();
        //     break;
        // case Mode.student2:
        //     createStudentPage();
        //     break;
        case Mode.describing:
            createImageDescriptionPage();
            break;
        case Mode.play:
            if (isEmpty(player1Name) || isEmpty(player2Name) || isEmpty(startNumber)) {
                createGameStart();
            } else {
                if (startNumber == 1 || startNumber == 2) {
                    turn = startNumber;
                } else {
                    turn = getRandomValue(1, 2);
                }
                buildPopups();
                createPlayerTable();
                buildBoard();
                fillTable();
                markSelectedPlayer();
            }
            break;
        default:
            throw new Error("Invalid mode.")
    }
    createFooter("footer-viablory");
    writeSessionStorage();


    if (isMobileHighResolution) {
        $('.playerNameInput').removeClass("col-sm-12");
        $('.playerNameInput').removeClass("col-lg-5");
        $('.playerNameInput').addClass("col-12");
    }
    backToTop();
}

function setLanguage() {
    var language = findGetParameter(paramLanguage);
    var p1 = findGetParameter(paramPlayer1);
    var p2 = findGetParameter(paramPlayer2);
    var start = findGetParameter(paramStartNumber);
    var mode = findGetParameter(paramMode);

    createLanguageForm();

    if (!isEmpty(p1) && !isEmpty(p2) && !isEmpty(start)) {
        $('#languageForm').append(
            '<input id="p1" name="p1" value="' + p1 + '">' +
            '<input id="p2" name="p2" value="' + p2 + '">' +
            '<input id="start" name="s" value="' + start + '">'
        );
    }

    if (isEmpty(mode)) {
        mode = Mode.start;
        $('#languageForm').append(
            '<input id="mode" name="mode" value="' + mode + '">'
        );
    }

    if (isEmpty(language)) {
        submitForm("languageForm");
    } else {
        switch (language) {
            case Language.ger:
                constantTexts = constantTextsGerman;
                break;
            case Language.eng:
                constantTexts = constantTextsEnglish;
                break;
            default:
                throw new Error("Invalid Language!");
        }
        selectedLanguage = language;
    }

    if (isEmpty(mode)) {
        submitForm("languageForm");
    } else {
        selectedMode = mode;
    }
}

function selectMode(mode) {
    if (!$('#mode').length) {
        $('#languageForm').append(
            `<input id="mode" name="mode" value="${mode}">`
        );
    } else {
        $('#mode').val(mode);
    }
    submitForm("languageForm");
}

function createInstructorPage() {
    $('#menuButtons').append('<button alt="back to entrance" class="navArrow" onclick="backStartPage()">' + backButton + '</button>');
    $("#content").append(`<div id="instructionsModeInstructor"><div id="instructorsInfo" class="text-justify p-5">${replaceLineBreak(constantTexts.instructionsModeInstructor)}</div></div>`);
    $('#content').append('<p><input id="inputSessionName" class="w-50" name="sessionsName"><button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="generateSessionName()">' + constantTexts.generateSessionNameButtonText + '</button></p>');
    $('#content').append('<p><button id="publishSessionNameButton" class="main-button defaultGradientButton" onclick="publishSessionName()">' + constantTexts.publishSessionNameButtonText + '</button></p>');
}

function createSelectSession() {
    $('#menuButtons').append('<button class="navArrow" onclick="backStartPage()">' + backButton + '</button>');
    $("#content").append(`<div id="instructionsModeSessionSelect"><div id="sessionSelectInfo" class="text-justify p-5">${replaceLineBreak(constantTexts.instructionsModeStudent)}</div></div>`);
    $('#content').append(`<input list="sessionNameSelect" id="sessionNameInput" name="sessionNameInput" placeholder="${constantTexts.selectSessionNameDefaultOption}" /><datalist id="sessionNameSelect"></datalist><button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="selectSessionName()">${constantTexts.selectSessionNameButtonText}</button>`)
    $.each(currentViablorySessions, function (key, sessionName) {
        $('#sessionNameSelect').append(`<option value="${sessionName}">${sessionName}</option>`);
    });
}

function selectSessionName() {
    let selection = $('#sessionNameInput').val();
    if (selection === "") {
        alert(constantTexts.sessionNameSelectionInvalid);
    } else {
        selectedSessionName = selection;
        sessionStorage.setItem('selectedSessionName', selectedSessionName);
        // selectMode(Mode.student1);
        selectMode(Mode.describing);
    }
}

function generateSessionName() {
    $('#inputSessionName').val(generateName());
}

function createImageDescriptionPage() {
    if (Object.keys(viabloryImages).length === 0) {
        loadViabloryImages();
    }
    $('#menuButtons').append('<button alt="back to entrance" class="navArrow" onclick="backStartPage()">' + backButton + '</button>');
    $("#content").append(`<div id="instructionsModeDescribingImages">${replaceLineBreak(constantTexts.instructionsModeDescribingImages)}</div>`);
    $('#content').append('<div id="tabView" class="container justify-content-center"></div>');

    // container for navigation-tabs to select the images which should be described by the users
    // $('#tabView').append('<div class="nav-center col-12"><ul class="nav nav-tabs nav-justified" role="tablist" id="describeImagesTabs"></ul></div>');
    $('#tabView').append('<div class="nav-center col-12"><ul class="tab-view nav nav-tabs" role="tablist" id="describeImagesTabs"></ul></div>');

    // container to host the selected images with the field to describe them
    $('#tabView').append(`<div class="tab-content col-12 container tab-view bottom bg-white-60" style="margin-left: 15px" id="describeImagesContent"></div>`);

    for (let i = 0; i < amountImages * 2; i++) {
        // tab navigation element
        let activeClass = i === 0 ? "active" : "bg-white-40";
        // let $tabLi = $(`<li class="${activeClass} nav-link tab-view top" id="imageTab"></li>`);
        let $tabLi = $(`<li class="tab-view nav-item waves-effect waves-light" id="imageTab"></li>`);
        let $tabAHref = $(`<a href="#image${i + 1}" 
                    class="tab-view nav-link ${activeClass}" 
                    data-toggle="tab" role="tab" 
                    aria-controls="image${i + 1}" aria-selected="true">
                    ${constantTexts.image} ${i + 1} 
                    <i id="check_${i + 1}" class="fas fa-check" style="visibility: hidden"></i>
                    </a>`);
        $tabLi.append($tabAHref);
        $('#describeImagesTabs').append($tabLi);

        // tab content
        activeClass = i === 0 ? 'active show' : '';
        let pageName = viabloryImageKeysShuffled[i];
        let image = viabloryImages[pageName];
        let $tabPane = $(`<div class="tab-pane fade ${activeClass} col-12 p-3 justify-content-center" id="image${i + 1}" role="tabpanel" aria-labelledby="image${i + 1}-tab"></div>`);
        let $img = $(`<img class="describingImagesImage mw-100" style="max-height: 55vh" src="${image.imageUrl}" id="${pageName}-image" alt="${pageName}"/>`);
        let $descriptionContainer = $('<div class="describingImagesDescriptionContainer row pb-3 justify-content-center"></div>');
        let $descriptionPrefix = $(`<h3 class="descriptionPrefix pr-2 col-sm-12 col-lg-2">${constantTexts.describePicturePrefix}</h3>`);
        let $description = $(`<input class="describingImagesDescription  col-sm-12 col-lg-5" type="text" id="${pageName}" placeholder="${constantTexts.describePicturePlaceholder}">`);
        let $descrptionSuffix = $(`<h3 class="descriptionSuffix pl-2 col-sm-12 col-lg-2">${constantTexts.describePictureSuffix}</h3>`);


        $descriptionContainer.append($descriptionPrefix, $description, $descrptionSuffix)
        $tabPane.append($descriptionContainer, $img);
        $('#describeImagesContent').append($tabPane);


        let input = document.getElementById(pageName);
        input.addEventListener('input', ev => {
            const value = input.value;

            let checkIcon = document.getElementById("check_" + (i + 1));
            checkIcon.style.visibility = !value ? "hidden" : "visible";
        });
    }
    $('#content').append(`<button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="submitPlayerDescriptions()">${constantTexts.sendImageDescriptions}</button>`);
    let keys = Object.keys(viabloryImageDescriptionsNew);
    if (keys.length > 0) {
        for (key of keys) {
            $(document.getElementById(`${key}`)).val(viabloryImageDescriptionsNew[key]);
        }
    }
}

function backStartPage() {
    window.location.assign("viablory.html" + languageParameter + selectedLanguage);
}

// function backStudent1() {
//     submitDescriptions(2, Movement.backward);
//     $('#mode').val(Mode.student1);
//     selectMode(Mode.student1);
// }

function createModeSelection() {
    $('#content').append('<div id="selectMode"></div>');
    $("#selectMode").append(`<div id="instructions">${replaceLineBreak(constantTexts.instructions)}</div>`);
    $("#selectMode").append(`<div id="instructionsModeSelect">${replaceLineBreak(constantTexts.instructionsModeSelect)}</div>`);
    $("#selectMode").append('<button id="modeInstructorButton" class="main-button defaultGradientButton" onclick="selectMode(Mode.instructor)"><h2>' + constantTexts.instructorBtnText + '</h2></button>');
    $("#selectMode").append('<button id="modeStudentButton" class="main-button defaultGradientButton" onclick="selectMode(Mode.selectSession)"><h2>' + constantTexts.studentBtnText + '</h2></button>');
}

function createGameStart() {
    $('#content').append('<div id="gameStart" class="container-fluid"></div>');
    $('#gameStart').append(
        '<div id="instructions" class="collapseContainer">' +
        '   <button id="openInstructionsButton" type="button" ' +
        '       data-toggle="collapse" ' +
        '       data-target="#instructionsText" ' +
        '       aria-expanded="false" ' +
        '       aria-controls="instructionsText"' +
        '       class="pt-2 pl-2">' +
        '       <h3>' + constantTexts.instructionTitle + ' <i id="collapseArrow" class="fas fa-plus" style="font-size: .7em !important;"></i></h3>' +
        '   </button>' +
        '   <div id="instructionsText" class="collapse">' +
        '       <div class="card card-body">' +
        replaceLineBreak(constantTexts.instructions) +
        '       </div>' +
        '   </div>' +
        '</div>');

    document.getElementById('openInstructionsButton').addEventListener("click", function () {
        var arrow = document.getElementById('collapseArrow');
        var plus = 'fa-plus';
        var minus = 'fa-minus';

        if (arrow.classList.contains(plus)) {
            arrow.classList.remove(plus);
            arrow.classList.add(minus);
        } else {
            arrow.classList.remove(minus);
            arrow.classList.add(plus);
        }

    })

    $('#gameStart').append('<div id="playerNames" class="row"><h3 class="col-12 text-center">' + constantTexts.playerFormTitle + '</h3></div>');
    $('#playerNames').append('<div class="col"></div>');
    $('#playerNames').append(
        '<div class="col-8 justify-content-center"> ' +
        '   <div id="playerNameFormAlert" class="alert bg-danger mt-3 invisible d-inline-block">' +
        '       <i class="fa fa-exclamation-triangle"></i> ' + constantTexts.errorMessages.playerNamesMustNotMatch +
        '   </div>' +
        '   <form id="playerNameForm" method="get" class="text-center justify-content-center">' +
        '       <div class="row justify-content-center">' +
        '       <div class="playerNameInput col-sm-12 col-lg-5">' +
        '           <label for="namePlayer1">' + constantTexts.namePlayer1 + '</label>' +
        '           <br/>' +
        '           <input id="namePlayer1" tabindex="1" name="p1" onkeyup="validateInputPlayerNames()" required="true" autofocus>' +
        '           <br/>' +
        '           <div id="namePlayer1Alert" class="alert bg-danger mt-3 invisible d-inline-block">' +
        '               <i class="fa fa-exclamation-triangle"></i> ' + constantTexts.errorMessages.playerNameMustContain +
        '           </div>' +
        '       </div>' +
        '       <div class="col"></div>' +
        '       <div  class="playerNameInput col-sm-12 col-lg-5">' +
        '           <label for="namePlayer2">' + constantTexts.namePlayer2 + '</label>' +
        '           <br/>' +
        '           <input id="namePlayer2" tabindex="2" name="p2" onkeyup="validateInputPlayerNames()" required="true">' +
        '           <br/>' +
        '           <div id="namePlayer2Alert" class="alert bg-danger mt-3 invisible d-inline-block">' +
        '               <i class="fa fa-exclamation-triangle"></i> ' + constantTexts.errorMessages.playerNameMustContain +
        '           </div>' +
        '       </div>' +
        '       </div>' +
        '       <input id="startNumberField" name="s" type="hidden">' +
        '       <input id="languageInput2" name="lg" value="' + selectedLanguage + '" type="hidden">' +
        '       <input id="mode2" name="mode" value="' + selectedMode + '" type="hidden">' +
        '       <input id="submitPlayerNames" type="submit" style="display: none">' +
        '   </form>' +
        '</div>'
    );

    $('#gameStart').append('<div id="startButtons" class="row d-flex"></div>');
    $('#startButtons').append('<div class="col"><button id="startPlayer1" tabindex="4" class="main-button startPlayer1" onclick="startGame(1)"><h2>Start</h2></button></div>');
    $('#startButtons').append('<div class="col"><button id="startGameRandom" tabindex="3" class="main-button startButton" onclick="startGame(0)"><h2>Start</h2></button></div>');
    $('#startButtons').append('<div class="col"><button id="startPlayer2" tabindex="5" class="main-button startPlayer2" onclick="startGame(2)"><h2>Start</h2></button></div>');
    $('#startPlayer1').append('<p>' + constantTexts.player1First + '</p>');
    $('#startGameRandom').append('<p>' + constantTexts.randomPlayerFirst + '</p>');
    $('#startPlayer2').append('<p>' + constantTexts.player2First + '</p>');

    $('#playerNames').append('<div class="col"></div>');
}

function createMenu() {

    createNavigationBar(false, pageTitle);
    $('#homeButton').attr('onclick', 'checkGetParamsAndRedirectToHomePage()');

}

function checkGetParamsAndRedirectToHomePage() {
    if (emptyGetParameters(siteParameters)) {
        redirectToHomePage();
    } else if (confirm(constantTexts.returnToHomePage)) {
        redirectToHomePage();
    }
}

function createPlayerTable() {

    $('#collapseToggler').removeClass("d-inline-block");
    $('#collapseToggler').addClass("d-none");

    $('<div id="playerNavigation" ' +
        '   class="navbar navbar-expand-lg navbar-dark bg-dark" ' +
        '   style="margin-top: -1rem; margin-bottom: 1rem; font-size: 1.2em">' +
        '</div>').insertBefore('#content');

    $('#nav').append(
        '<div class="text-white ml-2 ml-lg-auto">' +
        '   <ul id="helpButtons" class="navbar-nav ml-auto d-flex flex-row">' +
        '       <li class="nav-item active mr-3">' +
        '           <button id="reloadButton" alt="reload game" ' +
        '               class="nav-link bg-transparent border-0" ' +
        '               style="cursor: pointer"' +
        '               onclick="confirmRestart()">' +
                        reloadButton +
        '           </button>' +
        '       </li>' +
        '       <li class="nav-item active mr-3">' +
        '           <button id="help" class="nav-link bg-transparent border-0"' +
        '               style="cursor: pointer"' +
        '               onclick="showPopup(helpPopup)" >' +
                        helpSymbol +
        '           </button>' +
        '       </li>' +
        '   </ul>' +
        '</div>'
    );

    $('#playerNavigation').append(
        '<div id="navContainer" class="container-fluid col-12 d-flex justify-content-center">' +
        '<div id="navRow" class="row col-12 p-0 d-flex justify-content-center h-auto"></div>' +
        '</div>');

    //name player 1
    $('#navRow').append('' +
        '<div id="player1Row" class="row w-100 col-12 col-sm-4 text-center my-1 justify-content-center mx-auto">' +
        '</div>');
    $('#player1Row').append(
        '<div id="player1NameLabel" class="col-8 field text-white text-center pt-2" ' +
        '   style="word-break: break-word; background-color: ' + player1ColorSoft + '">' +
        player1Name +
        '       <i class="fas fa-user col-sm-12"></i>' +
        '</div>');
    // hand point left
    $('#player1Row').append(
        '<div id="handPointLeft" class="col-3 pt-2 leaderboard">' +
        '   <i class="fas fa-hand-point-left"></i>' +
        '</div>');

    //points
    $('#navRow').append(
        '<div id="pointsRow" class="row w-100 px-2 col-12 col-sm-4 text-center my-1 pl-5 justify-content-center mx-auto">' +
        '</div>'
    );
    // points player 1
    $('#pointsRow').append(
        '<div id="points1TD" ' +
        '   class="col text-right leaderboard" >' +
        pointsPlayer1 +
        '</div>'
    );
    // colon
    $('#pointsRow').append(
        '<div id="pointsColon" ' +
        '   class="col-2 leaderboard px-0 text-white" ' +
        '   style="text-align: center !important">' +
        ' : ' +
        '</div>'
    );
    //points player 2
    $('#pointsRow').append(
        '<div id="points2TD" class="col text-left leaderboard" >' +
        pointsPlayer2 +
        '</div>'
    );


    //name player 2
    $('#navRow').append('' +
        '<div id="player2Row" class="row w-100 col-12 col-sm-4 text-center my-1 justify-content-center mx-auto">' +
        '</div>');
    // hand point left
    $('#player2Row').append(
        '<div id="handPointRight" ' +
        '   class="col-3 pt-2 leaderboard">' +
        '   <i class="fas fa-hand-point-right"></i>' +
        '</div>');
    $('#player2Row').append(
        '<div id="player2NameLabel" ' +
        '   class="col-9 field text-white text-center pt-2 py-auto" ' +
        '   style="word-break: break-word; background-color: ' + player2ColorSoft + '">' +
        '       <i class="fas fa-user col-sm-12"></i> ' +
        player2Name +
        '</div>');


    var handLeft = getById("handPointLeft");
    var handRight = getById("handPointRight");

    turn == 1 ? setVisibility(false, handRight) : setVisibility(false, handLeft);

}

function buildBoard() {

    var elementCounter = 0;

    $('#content').append('<div id="boardContainer" class="container-fluid"></div>');
    for (var i = 0; i < rows; i++) {
        $('#boardContainer').append(
            '<div id="row_' + i + '" ' +
            '   class="row" ' +
            '   style="min-height: ' + imageMaxHeight + 'px;">' +
            '</div>');
        for (var j = 0; j < columns; j++) {
            $('#row_' + i).append(
                '<div id="td_' + elementCounter + '" ' +
                'class="col-sm m-2 col-centered embed-responsive" ' +
                'style="border: 3px solid transparent;' + fieldStyle + '">' +
                '</div>'
            );
            elementCounter++;
        }
    }
}

function selectPairs() {
    let result = [];
    let imageKeys = Object.keys(pairs);
    for (let i = 0; i < imageKeys.length; i++) {
        var image = pairs[imageKeys[i]];
        // if image not described by current users, choose random description
        if (image.content === "") {
            let descriptions = [];
            for (description of image.descriptions) {
                if (description.language === selectedLanguage && !isEmpty(description.description)) {
                    descriptions.push(description.description);
                }
            }

            image.content = image.descriptions[getRandomValue(0, descriptions.length - 1)].description;
            //image.content = image.descriptions[0].description;
        }
        result.push({id: i, content: image.content, imageSource: image.imageSource});
    }
    return result;
}

function fillTable() {

    let pairsSelected = selectPairs();
    selectedPairs = copyArray(pairsSelected);

    for (var i = 0; i < maxNumFields; i++) {
        var td = getCell(i);

        // var inner = getRandomPairElement();
        let inner = getRandomSelectedPairs(pairsSelected);
        pairsSelected = inner[2];
        var content = inner[0];
        //var player = inner[2];

        var id = inner[1];
        matchMap.set(i, id);

        addClassesToClassList(td, "field", "card", "playerBackground", "flip-card");
        td.setAttribute("onclick", "clickCard(" + i + ")");

        var flipInner = document.createElement("div");
        flipInner.setAttribute("id", "flipInner_" + i);
        flipInner.classList.add("flip-card-inner");
        flipInner.classList.add("d-flex");

        var flipFront = document.createElement("div");
        flipFront.setAttribute("id", "flipFront_" + i);
        flipFront.setAttribute("class", "flip-card-front");
        flipFront.innerHTML = "<i class='fas fa-question'></i>";

        var flipBack = document.createElement("div");
        flipBack.setAttribute("id", "flipBack_" + i);
        flipBack.classList.add("flip-card-back");
        flipBack.classList.add("d-flex");
        flipBack.classList.add("align-items-center");
        flipBack.classList.add("justify-content-center");

        if (isImage(content)) {
            flipBack.appendChild(content);
            content.classList.add("align-self-center");
            flipBack.style.padding = '10px';
            flipBack.setAttribute("onclick", "showPopup('" + detailPopup + "', " + i + ", true)");
        } else {
            flipBack.innerHTML = "<p>" + content + "</p>";
            flipBack.classList.add("fieldText");
            flipBack.setAttribute("onclick", "showPopup('" + detailPopup + "', " + i + ", false)");
        }

        flipInner.appendChild(flipFront);
        flipInner.appendChild(flipBack);
        td.appendChild(flipInner);

    }

}

function getRandomIndexFromRemainingIndexes(selectedPairs) {
    let remaining = [];
    // for (let pair of selectedPairs) {
    for (let i = 0; i < selectedPairs.length; i++) {
        let pair = selectedPairs[i];
        if (pair.hasOwnProperty('content') || pair.hasOwnProperty('imageSource')) {
            remaining.push(i);
        }
    }
    remaining.shuffle();
    return remaining[0];
}

function getRandomSelectedPairs(selectedPairs) {

    while (true) {
        // var randomIndex = getRandomValue(0, selectedPairs.length - 1);
        var randomIndex = getRandomIndexFromRemainingIndexes(selectedPairs);
        var pairElement = selectedPairs[randomIndex];

        if (pairElement == null) {
            continue;
        }

        var existsContent = pairElement.hasOwnProperty('content');
        var existsImageSource = pairElement.hasOwnProperty('imageSource');

        if ((!existsContent && !existsImageSource)) {
            // delete pairElement;
            // selectedPairs.splice(randomIndex, 1);
            continue;
        }
        if (selectedPairs.length === 0) {
            return;
        }

        var random = getRandomValue(0, 1);
        var img = document.createElement("img");
        img.setAttribute("class", "image");


        if ((random == 0 && existsContent) || (random == 1 && !existsImageSource)) {
            var text = replaceLineBreak(pairElement.content);
            delete pairElement.content;
            return [text, randomIndex, selectedPairs]; //pairElement.player
        } else if ((random == 0 && !existsContent) || (random == 1 && existsImageSource)) {
            img.setAttribute("src", pairElement.imageSource);
            delete pairElement.imageSource;
            return [img, randomIndex, selectedPairs];
        }

    }
}

function getRandomPairElement() {
    while (true) {
        var randomIndex = getRandomValue(0, pairListForRandom.length - 1);
        var pairElement = pairListForRandom[randomIndex];

        if (pairElement == null) {
            continue;
        }

        var existsContent = pairElement.hasOwnProperty('content');
        var existsImageSource = pairElement.hasOwnProperty('imageSource');

        if ((!existsContent && !existsImageSource)) {
            delete pairElement;
            continue;
        }
        if (pairListForRandom.length == 0) {
            return;
        }

        var random = getRandomValue(0, 1);
        var img = document.createElement("img");
        img.setAttribute("class", "image");

        if ((random == 0 && existsContent) || (random == 1 && !existsImageSource)) {
            var text = replaceLineBreak(pairElement.content);
            delete pairElement.content;
            return [text, randomIndex]; //pairElement.player
        } else if ((random == 0 && !existsContent) || (random == 1 && existsImageSource)) {
            img.setAttribute("src", pairElement.imageSource);
            delete pairElement.imageSource;
            return [img, randomIndex];
        }
    }
}

function emptySessionStorage() {
    sessionStorage.clear();
}

function loadSessionStorage() {
    if (sessionStorage.getItem('viabloryImages')) {
        viabloryImages = JSON.parse(sessionStorage.getItem('viabloryImages'));
        if (Object.keys(viabloryImages).length === 0) {
            loadViabloryImages();
        }
    } else {
        loadViabloryImages();
    }
    if (sessionStorage.getItem('viabloryImageKeysShuffled')) {
        viabloryImageKeysShuffled = JSON.parse(sessionStorage.getItem('viabloryImageKeysShuffled'));
    }
    if (sessionStorage.getItem('selectedSessionName') && sessionStorage.getItem('selectedSessionName') !== "") {
        selectedSessionName = sessionStorage.getItem('selectedSessionName');
    }
    if (sessionStorage.getItem('pairs') && sessionStorage.getItem('pairs') !== "") {
        pairs = JSON.parse(sessionStorage.getItem('pairs'));
        numFields = Object.keys(pairs).length * 2 > maxNumFields ? maxNumFields : Object.keys(pairs) * 2;
    }
    if (sessionStorage.getItem('viabloryImageDescriptionsNew')) {
        viabloryImageDescriptionsNew = JSON.parse(sessionStorage.getItem('viabloryImageDescriptionsNew'));
    }
}

function writeSessionStorage() {
    sessionStorage.setItem('viabloryImages', JSON.stringify(viabloryImages));
    sessionStorage.setItem('viabloryImageKeysShuffled', JSON.stringify(viabloryImageKeysShuffled));
    sessionStorage.setItem('selectedSessionName', selectedSessionName);
    sessionStorage.setItem('pairs', JSON.stringify(pairs));
    // get value from input fields
    $('.describingImagesDescription').each(function (index) {
        let value = $(this).val();
        let id = $(this).attr("id");
        viabloryImageDescriptionsNew[id] = value;
    });
    sessionStorage.setItem('viabloryImageDescriptionsNew', JSON.stringify(viabloryImageDescriptionsNew));
}

function initializeGlobals() {
    sessionStorage.clear();
    viabloryImages = {}
    viabloryImageKeysShuffled = [];
    selectedSessionName = "";
    pairs = {};
    numFields = 0;
    viabloryImageDescriptionsNew = [];
    loadViabloryImages();
}
