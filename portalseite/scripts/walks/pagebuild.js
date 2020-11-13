(function () {
    buildPage();
})();

function buildPage() {

    checkCompatibility();

    //$('body').append('<nav id="nav" class="navbar navbar-expand-sm fixed-top px-3"></nav>');

    setLanguage();

    var pageTitle = constantTexts.header;
    createNavigationBar(false, pageTitle);

    /*$('#nav').append(
        '<button id="walkSelectButton" onclick="location.href=' + homepageLink + '" ' +
        '       class="nav-link bg-transparent border-0"' +
        '       style="cursor: pointer !important;">' +
                walkIcon + '' +
        '</button>');*/

    $('#content').addClass("container");
    $('#content').append(
        '<div id="walkTableDiv" class="row table-responsive justify-content-center m-50" style="color: white !important;">' +
        '   <div class="col-12">' +
        '       <table id="walkTable"' +
        '           class="table table-striped table-bordered" ' +
        '           style="color: white !important;">' +
        '       </table>' +
        '   </div>' +
        '</div>');
    $('#walkTable').append('<thead><tr><th>' + pageTitle + '</th></tr></thead><tbody id="walkTableBody" style="background-color: grey"></tbody>');

    $('#content').append(
        '<div class="row">' +
        '<div id="title" class="col-12 center px-sm-4"></div>' +
        '</div>');
    $('#title').append(
        '<h1 id="walkTitleHeader">xy</h1>' +
        '<div id="titleText" class="titleText">' +
        '   <h2 id="walkName"></h2>' +
        '   <h3 id="subtitle" class="subtitle"></h3>' +
        '</div>'
    );
    $('#content').append('<div id="contentRow" class="row mb-3"></div>');
    $('#contentRow').append('<div id="leftSide" class="col-md-6"></div>');
    $('#leftSide').append('<div id="text" class="row m-3 text-justify"></div>');
    $('#leftSide').append('<div id="source" class="row m-3"></div>');
    $('#contentRow').append('<div id="media" class="col-md-6 center row"></div>');
    $('#media').append('<div id="imageDiv" class="row mb-sm-3"><div class="mediaDiv col-sm-12 center"></div></div>');
    $('#media').append('<div id="videoDiv" class="row mb-sm-3"><div class="mediaDiv col-sm-12 center"></div></div>');

    createFooter('footer-walks');

    if (inIFrame() && callerSameHostname()) {
        $('body').css("overflow", "hidden");
    }

    if (!isLandscape && width >= 1080) {
        $('#navigationButtons').removeClass("col-lg-5");
    }
    backToTop();
}

function createMenu() {

    createWalkSelect();

    var walkForm = document.getElementById("selectWalkForm");
    var walkTable = document.getElementById("walkTableDiv");
    var selectedWalk = getCurrentWalk();

    if (selectedWalk[0] == null || selectedWalk[1] == null) {
        setDisplay(true, walkForm);
    } else {
        //TODO initialize json
        //json = getJson(selectedWalk[0], selectedWalk[1], '../../src/input.json'); //solution outside of VPN
        json = getJson(selectedWalk[0], selectedWalk[1]);
        stations = json.stations;

        setDisplay(false, walkForm, walkTable);
        createStationSelection();
        setDisplay(true, document.getElementById("selectForm"));
        fillStationPage();
    }

}

function createWalkSelect() {

    $('body').append('<form id="selectWalkForm" name="selectWalkForm" class="" method="get" onsubmit="return validateWalkFormInput();" style="display: none !important;"></form>');
    //$('#selectWalkForm').append('<select id="walk-select" name="walk" class="dropDownText"><option value="-2">' + unselectedWalk + '</option></select>');
    $('#selectWalkForm').append('<input id="lg-walk" type="hidden" name="lg" value="' + selectedLanguage + '">');
    $('#selectWalkForm').append('<input id="walk-select" type="hidden" name="walk" value="' + constantTexts.unselectedWalk + '"/>');
    $('#selectWalkForm').append('<input id="walkTitle" type="hidden" name="walkTitle" value=""/>');
    //$('#selectWalkForm').append('<input id="stationInput" type="hidden" name="station" value=""/>');

    //TODO form
    //$('#selectWalkForm').append('<input id="load_walk_button" type="submit" value="Load Walk" onclick="loadJsonInput()"></input>');
    $('#selectWalkForm').append('<input id="load_walk_button" type="submit" value="Load Walk" onclick="" style="display: none"/>');


    var title = document.getElementById("title");
    var contentRow = document.getElementById("contentRow");
    setDisplay(false, title, contentRow);

}

function createStationSelection() {

    var currentWalk = getCurrentWalk();
    //setVisibility(true, document.getElementById("walkSelectButton"));

    //$('#formTD').append('<div id="navForm" class="navMiddle"></div>');
    //$('#navMiddlePart').append('<div id="navForm" class="centerForm"></div>');
    $('#nav').append('<div id="navigationButtons" class="col-12 col-lg-5 m-auto d-flex justify-content-around" style="margin: 1em auto;" ></div>');
    $('#navigationButtons').append('<button id="backButton" class="navigationButton nav-link bg-transparent border-0 col" onclick="back()">' + arrowLeft + '</button>');
    $('#navigationButtons').append('<button id="forwardButton" class="navigationButton nav-link bg-transparent border-0 col" onclick="forward()">' + arrowRight + '</button>');
    $('body').append('<form id="selectForm" class="stationForm w-100 d-none" text-align: right" name="selectForm" method="get"></form>');
    $('#selectForm').append('<input id="lg-station" type="hidden" name="lg" value="' + selectedLanguage + '">');
    $('#selectForm').append('<input id="walkInput" type="hidden" name="' + paramWalk + '" value="' + currentWalk[0] + '"/>');
    $('#selectForm').append('<input id="walkInputTitle" type="hidden" name="' + paramWalkTitle + '" value="' + currentWalk[1] + '"/>');
    $('#selectForm').append('<select id="dropdownNavigation" name="station" class="dropDownText"></select>');


    $('#nav').append(
        '<div id="walkSelectPanel" class="nav-link dropdown col-12 col-lg-3">' +
        '  <button class="btn btn-secondary dropdown-toggle text-left w-100 navigationPanel" ' +
        '           type="button" ' +
        '           id="dropdownMenuButton" ' +
        '           data-toggle="dropdown" ' +
        '           aria-haspopup="true" ' +
        '           aria-expanded="false">' +
        constantTexts.selectStation +
        '  </button>' +
        '  <div id="stationDropdownButton" ' +
        '       class="dropdown-menu col-12" ' +
        '       style="background: ' + backgroundNav + '"' +
        '       aria-labelledby="dropdownMenuButton">' +
        '  </div>' +
        '</div>'
    );

    if (isMobileHighResolution) {
        $('#navigationButtons').removeClass("col-lg-5");
        $('#walkSelectPanel').removeClass("col-lg-3");
    }

    var select = document.getElementById("dropdownNavigation");
    var dropDownButton = document.getElementById("stationDropdownButton");

    for (var i = -1; i < (stations.length + 1); i++) {
        var option = document.createElement("option");
        var button = document.createElement("button");
        button.setAttribute("class", "dropdown-item text-truncate bg-dark");
        var zero = i < 10 ? "0" : "";
        var number = 0;
        var text = "";
        var value = "";
        var stationConclusionText =
                '<div class="float-left col-1 p-0 m-0">' + number + (i + 1.5) + '</div>' +
                '<div class="float-left col-1"> | </div>' +
                '<div class="text-truncate col-9 float-left">' + text + constantTexts.conclusion + '</div>';

        switch (i) {
            case -1:
                if (noTitle()) {
                    continue;
                }
                text += constantTexts.title;
                value = '0';

                var buttonContent =
                    '<div class="float-left col-1 p-0 m-0">' + zero + number + '</div>' +
                    '<div class="float-left col-1"> | </div>' +
                    '<div class="text-truncate col-9 float-left">' + text + '</div>';

                $('#dropdownMenuButton').html(buttonContent);

                break;
            case (stations.length):
                if (json.conclusion.conclusionHeader == "" && json.conclusion.conclusionText == "") {
                    text = null;
                    break;
                }
                number = (stations.length + 1);
                text +=  constantTexts.conclusion;
                value = (stations.length + 1).toString();
                break;
            default:
                number = (i + 1);
                text +=  stations[i].stationHeader;
                value = (i + 1).toString();
        }


        var optionConclusion = document.createElement("option");
        optionConclusion.innerHTML = stationConclusionText;
        optionConclusion.setAttribute("value", (number + 0.5).toString());

        var buttonConclusion = document.createElement("button");
        buttonConclusion.setAttribute("class", "dropdown-item bg-dark");
        buttonConclusion.setAttribute("onclick", "selectStation(" + (number + 0.5) + ")");
        buttonConclusion.innerHTML = stationConclusionText;

        var buttonContent =
            '<div class="float-left col-1 p-0 m-0">' + zero + number + '</div>' +
            '<div class="float-left col-1"> | </div>' +
            '<div class="text-truncate col-9 float-left">' + text + '</div>';

        if (text != null) {
            option.innerHTML = text;
            option.setAttribute("value", value);
            select.appendChild(option);
            button.innerHTML = buttonContent;
            button.setAttribute("onclick", "selectStation(" + value + ")");

            dropDownButton.appendChild(button);
        }
        if (i != -1 && i != stations.length && stations[i].stationConclusion != "") {
            select.appendChild(optionConclusion);
            dropDownButton.appendChild(buttonConclusion);
        }

        if(findGetParameter(paramStation) == number){
            $('#dropdownMenuButton').html(buttonContent);
        } else if (findGetParameter(paramStation) == (number + 0.5)){
            $('#dropdownMenuButton').html(stationConclusionText);
        }
    }

    var before = document.getElementById("backButton");
    var after = document.getElementById("forwardButton");
    setVisibility(false, before, after);
}

function fillStationPage() {

    const title = document.getElementById("title");
    const titleText = document.getElementById("titleText");
    const h1 = document.getElementById("walkTitleHeader");
    const h2 = document.getElementById("walkName");
    const subtitle = document.getElementById("subtitle");
    const contentRow = document.getElementById("contentRow");
    const leftSide = document.getElementById("leftSide");
    const text = document.getElementById("text");
    const media = document.getElementById("media");
    const back = document.getElementById("backButton");
    const forward = document.getElementById("forwardButton");
    const imageDiv = $('#imageDiv').find("div");
    const videoDiv = $('#videoDiv').find("div");
    const source = $('#source');

    if (isMobileHighResolution) {
        leftSide.classList.remove("col-md-6");
        leftSide.classList.add("col-md-12");

        media.classList.remove("col-md-6");
        media.classList.add("col-md-12");
    }

    setDisplay(false, contentRow, media);
    setDisplay(true, title);

    var position = getCurrentStation();

    subtitle.innerHTML = replaceLineBreak(json.subtitle);
    preselectElement("dropdownNavigation", position);

    //if station is conclusion
    if (position > 1 && position % 1 != 0) {
        setVisibility(true, back, forward);
        setDisplay(true, subtitle);
        contentRow.style.display = "flex";

        subtitle.innerHTML = constantTexts.conclusion;
        h1.innerHTML = replaceLineBreak(json.stations[position - 1.5].stationHeader);

        leftSide.classList.remove("col-md-6");
        leftSide.classList.add("col-md-12");
        text.innerHTML = replaceLineBreak(json.stations[position - 1.5].stationConclusion);
    } else {
        switch (position) {
            case 0:
                setVisibility(true, forward);
                setVisibility(false, back);
                setDisplay(true, subtitle);
                setDisplay(false, contentRow);

                h1.innerHTML = "\"" + findGetParameter(paramWalkTitle) + "\"";
                h2.innerHTML = replaceLineBreak(json.title);

                break;
            case stations.length + 1:
                setVisibility(true, back);
                setVisibility(false, forward);
                contentRow.style.display = "flex";

                if (json.conclusion.conclusionHeader == "") {
                    setDisplay(false, title);
                } else {
                    h1.innerHTML = replaceLineBreak(json.conclusion.conclusionHeader);
                    setDisplay(false, subtitle);
                }

                leftSide.classList.remove("col-md-6");
                leftSide.classList.add("col-md-12");
                text.setAttribute("style", "margin: 35px");
                text.innerHTML = replaceLineBreak(json.conclusion.conclusionText);
                break;
            default:
                if (position == 1 && noTitle()) {
                    setVisibility(false, back);
                    setVisibility(true, forward);
                } else if (position == stations.length && !json.conclusion.conclusionHeader && !json.conclusion.conclusionText) {
                    setVisibility(true, back);
                    setVisibility(false, forward);
                } else {
                    setVisibility(true, back, forward);
                }
                contentRow.style.display = "flex";
                setDisplay(false, subtitle);

                var currentStation = json.stations[position - 1];
                //title
                if (!stations[position - 1].stationHeader) {
                    setDisplay(false, title);
                } else {
                    setDisplay(true, title);
                    h1.innerHTML = replaceLineBreak(json.stations[position - 1].stationHeader);
                }

                //if no image or video
                if (currentStation.stationVideoURL == "" && currentStation.stationImageURL == "") {
                    setDisplay(false, media);
                    leftSide.classList.remove("col-md-6");
                    leftSide.classList.add("col-md-12");
                    text.setAttribute("style", "margin: 35px");
                } else {
                    setDisplay(true, media);
                }

                //image
                if (currentStation.stationImageURL != "") {
                    imageDiv.append('<img id="stationImage" src="' + currentStation.stationImageURL + '"/>');
                } else {
                    $('#imageDiv').hide();
                }

                //video
                if (currentStation.stationVideoURL != "") {
                    var video;
                    if (currentStation.stationVideoURL.includes("https://") || currentStation.stationVideoURL.includes("http://")) {

                        videoDiv.append(
                            '<div id="stationVideo" ' +
                            'class="embed-responsive embed-responsive-16by9">' +
                            '<iframe class="embed-responsive-item img-rounded" ' +
                            'style="border-radius: 15px 15px 15px 15px;" ' +
                            'src="' + currentStation.stationVideoURL + '"/>' +
                            '</div>'
                        );
                    } else {
                        videoDiv.append(
                            '<video id="stationVideo"' +
                            'controls="true">' +
                            '<source src="' + currentStation.stationVideoURL + '"' +
                            'type="video/mp4"' +
                            '</video>'
                        );
                    }
                } else {
                    $('#videoDiv').hide();
                }

                //text
                text.innerHTML = replaceLineBreak(currentStation.stationText);

                //source
                if (currentStation.stationDocumentSourceURL != "") {
                    var sourceText;
                    if (currentStation.stationDocumentSourceTitle != "") {
                        sourceText = replaceLineBreak(currentStation.stationDocumentSourceTitle);
                    } else {
                        sourceText = currentStation.stationDocumentSourceURL;
                    }
                    source.append(
                        '<div class="col-sm-12 ml-3">' +
                        '<a id="sourceLink"' +
                        'href="' + currentStation.stationDocumentSourceURL + '"' +
                        'target="_blank">' +
                        '<p id="sourceTitle">' + sourceText + '</p>' +
                        '</a>' +
                        '</div>'
                    );
                } else {
                    source.hide();
                }

        }
    }


    var image = document.getElementById("stationImage");
    var video = document.getElementById("stationVideo");

    if (image != null) {
        image.setAttribute("class", setImageRatio(image));
    }

}


function setLanguage() {
    var language = findGetParameter(paramLanguage);
    var walk = findGetParameter(paramWalk);
    var walkTitle = findGetParameter(paramWalkTitle);
    var station = findGetParameter(paramStation);

    createLanguageForm();

    if (!isEmpty(walk) && !isEmpty(walkTitle)) {
        $('#walk').attr("value", walk);
        $('#walkTitle').attr("value", walkTitle);
    }
    if (!isEmpty(station)) {
        $('#station').attr("value", station);
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

}
