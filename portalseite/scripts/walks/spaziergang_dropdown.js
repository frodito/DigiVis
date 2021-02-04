/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

/**
 * Populate page with dropdown menu, button to load a selected walk and a div to put the json into
 */
/*(function () {
    $('body').append('<select name="walk" id="walk-select"><option value="">-- Please choose a Walks --</option></select>');
    $('body').append('<button id="load_walk_button">Load Walk</button>');
    $('body').append('<div class="walk_json"></div>');
    $('#load_walk_button').click(loadWalkButtonClickHandler);
})();*/

/**
 * Function retrieves the names of the existing walks from the MediaWiki
 * installation through the API and populates the dropdown menu.
 */
(async function () {
    let run = true;
    let cmcontinue = '0';

    // const url = 'http://' + location['hostname'] + '/mediawiki/api.php';
    const url = 'https://dbis-digivis.uibk.ac.at/mediawiki/api.php';
    const params = `action=query&format=json&list=categorymembers&cmtitle=Category%3AWalks&cmlimit=200`;
    const origin = '&origin=*';

    while (run) {
        let response = await fetch(url + '?' + params + 'cmcontinue=' + cmcontinue + origin);
        let json = await response.json();
        let results = json.query.results;
        if (json.hasOwnProperty('query')) {
            if (json.query.hasOwnProperty('categorymembers')) {
                json.query.categorymembers.forEach(function (walk) {

                    $('#walk-select').append('<option value="' + walk.pageid + '">' + walk.title.substring(5) + '</option>')

                    $('#walkTableBody').append('<tr style="cursor: pointer" onclick="' +
                        'loadJsonInput(' + walk.pageid + ', \'' + walk.title.substring(5) + '\')"><th>' + walk.title.substring(5) + '</th></tr>');
                });
            }
        }
        if (json.hasOwnProperty('continue')) {  // is the case of amount of walks in MW > 200
            offset = json.continue.hasOwnProperty('cmcontinue') ? json.continue.cmcontinue : false;
        } else {
            offset = false;
        }
        run = offset !== false; // exit loop after last batch of walk-names retrieved
    }
    $('#walkTable').dataTable();
})();

/**
 * Click-handler for the load-button.
 *
 * @param ev the click-event object
 */
function loadJsonInput(walkId, walkTitle) {
    //let $dropdown = $('#walk-select');
    let json = null;
    let walkParams = getCurrentWalk();
    let walkParamsEmpty = walkParams[0] == null || walkParams[1] == null || walkParams[1] == constantTexts.unselectedWalk;
    //let option_value = walkParamsEmpty ? $dropdown.children("option:selected").val() : walkParams[0];
    let option_value = walkParamsEmpty ? walkId : walkParams[0];
    $('#walk-select').attr("value", walkId);
    if (option_value !== "") {
        //let option_text = walkParamsEmpty ? $dropdown.children('option:selected').text() : walkParams[1];
        let option_text = walkParamsEmpty ? walkTitle : walkParams[1];
        $('#walkTitle').attr("value", walkTitle);
        json = getWalkJSON(option_value, option_text);
        $('.walk_json').empty()
        $('.walk_json').text(JSON.stringify(json));
    } else {
        $('.walk_json').empty();
    }
    $('#load_walk_button').click();
}

function loadJsonInputDummy(walkId, walkTitle){
    let json = null;
    let walkParams = getCurrentWalk();
    let walkParamsEmpty = walkParams[0] == null || walkParams[1] == null || walkParams[1] == constantTexts.unselectedWalk;
    let option_value = walkParamsEmpty ? walkId : walkParams[0];
    $('#walk-select').attr("value", walkId);
    if (option_value !== "") {
        let option_text = walkParamsEmpty ? walkTitle : walkParams[1];
        $('#walkTitle').attr("value", walkTitle.toString());
        json = getJsonFileAsObject("json/input.json");
        $('.walk_json').empty()
        $('.walk_json').text(JSON.stringify(json));
    } else {
        $('.walk_json').empty();
    }

    $('#load_walk_button').click();
}

function getJson(walkId, walkTitle, input){
    //TODO here solution outside VPN
    return isEmpty(input) ? getWalkJSON(walkId, walkTitle) : getJsonFileAsObject("json/input.json");
    //return getWalkJSON(walkId, walkTitle);
}

/**
 * Build the JSON for the stations of the walk
 * @param pageId ID of the corresponding page in MediaWiki
 * @param walkName Title of the corresponding page in MediaWiki
 * @returns {{conclusion: {conclusionHeader: string, conclusionText: string}, subtitle: string, stations: [], title: string, explanation: string}}
 */
function getWalkJSON(pageId, walkName) {
    let walk = getWalkFromMWAPI2(pageId, walkName);
    let json = {
        title: "",
        subtitle: "",
        explanation: "",
        conclusion: {
            conclusionHeader: "",
            conclusionText: ""
        },
        stations: []
    };
    Object.keys(walk).forEach(function (key) {
        let station = walk[key];
        let obj = {};
        switch (station.stationType) {
            case "title":
                json.title = station.walkTitle;
                json.subtitle = station.subTitle;
                break;
            case "explanation":
                json.explanation = station.explanationText;
                break;
            case "normal":
                // let obj = {};
                obj.stationId = station.stationId;
                obj.stationHeader = station.stationHeader;
                obj.stationText = station.stationText;
                obj.stationDocumentSourceTitle = station.stationDocumentSourceTitle;
                obj.stationDocumentSourceURL = station.stationDocumentSourceURL;
                obj.stationVideoURL = station.stationVideoURL;
                obj.stationImageURL = station.stationImageURL;
                obj.stationConclusion = station.stationConclusion;
                json.stations.push(obj);
                break;
            case "custom":
                // let obj = {};
                obj.stationId = station.stationId;
                obj.stationHeader = station.stationHeader;
                obj.stationText = station.stationText;
                // obj.stationDocumentSourceTitle = station.stationDocumentSourceTitle;
                // obj.stationDocumentSourceURL = station.stationDocumentSourceURL;
                obj.stationVideoURL = station.stationVideoURL;
                obj.stationImageURL = station.stationImageURL;
                obj.stationConclusion = station.stationConclusion;
                json.stations.push(obj);
                break;
            case "conclusion":
                json.conclusion.conclusionHeader = station.conclusionHeader;
                json.conclusion.conclusionText = station.conclusionText;
                break;
            default:
            // should not happen, use some error handling
        }
    });
    return json;
}

/**
 * Loading a walk via MediaWiki API for a given walk-name
 * @param pageId ID of the corresponding page in MediaWiki
 * @param walkName Title of the corresponding page in MediaWiki
 * @returns {[]} an array containing the stations for the walk
 */
function getWalkFromMWAPI2(pageId, walkName) {

    const urlAPIBase = 'https://dbis-digivis.uibk.ac.at/mediawiki/api.php';
    const params = 'action=ask&format=json';
    const origin = '&origin=*';     // needed for CORS

    let query = '&query=%5B%5B-Has%20subobject%3A%3AWalk%3A' + walkName + '%5D%5D%7C%3FstationId%7C%3FstationType%7C%3FwalkTitle%7C%3FsubTitle%7C%3FexplanationText%7C%3FconclusionHeader%7C%3FconclusionText%7C%3FstationHeader%7C%3FstationText%7C%3FstationDocumentSourceTitle%7C%3FstationDocumentSourceURL%7C%3FstationVideoURL%7C%3FstationImageURL%7C%3FstationConclusion%7Csort%3DstationId%7Corder%3Dasc%7limit%3D50';
    let walk = [];
    // let urlRequest = urlAPIBase + '?' + params + origin + query + '|offset=' + offset;
    let urlRequest = urlAPIBase + '?' + params + origin + query;

    $.ajax({
        url: urlRequest,
        dataType: 'json',
        async: false,
        success: function (json) {
            // loop over key, value pairs of api-result
            $.each(json.query.results, function (k, v) {
                let station = new Station(v.printouts);
                walk.push(station);
            });

        }
    });
    return walk;
}
