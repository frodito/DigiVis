/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

function loadViabloryImages() {
    let run = true;
    let cmcontinue = '';
    let pipeSeparatedImageList = '';

    viabloryImages = {};

    while (run) {
        const params = 'action=query'
            + '&format=json'
            + '&list=categorymembers'
            + '&cmtitle=Category:ViabloryImages'
            + '&cmlimit=100'
            + '&cmcontinue=' + cmcontinue;
        let urlRequest = urlAPIBase + '?' + params + origin;
        $.ajax({
            url: urlRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                $.each(json.query.categorymembers, function (index, pagename) {
                    viabloryImages[pagename.title] = {};
                    pipeSeparatedImageList += (pagename.title + '|');
                });
                cmcontinue = json.hasOwnProperty('cmcontinue') ? json['cmcontinue'] : false;
                run = cmcontinue !== false;
            }
        });
    }
    // remove last pipesymbol
    pipeSeparatedImageList = pipeSeparatedImageList.substr(0, pipeSeparatedImageList.length - 1);
    loadViabloryImagesURLs(pipeSeparatedImageList);
    loadViabloryImagesDescriptions();
    if (viabloryImageKeysShuffled.length === 0) {
        let imageKeysShuffled = Object.keys(viabloryImages).shuffle();
        viabloryImageKeysShuffled = imageKeysShuffled.slice(0,maxNumFields/2);
    }
    createPairs();
}

function loadViabloryImagesURLs(pipeSeparatedImageList) {

    let run = true;
    let iicontinue = '';

    while (run) {
        let params = 'action=query'
            + '&format=json'
            + '&prop=imageinfo'
            + '&titles=' + pipeSeparatedImageList
            + '&iiprop=url'
            + origin;
        params += iicontinue === '' ? '' : '&iicontinue=' + iicontinue;
        let urlRequest = urlAPIBase + '?' + params;
        $.ajax({
            url: urlRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.hasOwnProperty('query')) {
                    let loadViabloryImageUrlsPagesJson = json.query.pages;
                    $.each(loadViabloryImageUrlsPagesJson, function (pageid, image) {
                        viabloryImages[image.title].imageUrl = image.imageinfo[0].url;
                        viabloryImages[image.title].descriptions = [];
                    });
                    cmcontinue = loadViabloryImageUrlsPagesJson.hasOwnProperty('iicontinue') ? loadViabloryImageUrlsPagesJson['iicontinue'] : false;
                    // console.log(cmcontinue);
                    run = cmcontinue !== false;
                } else {
                    run = false;
                }
            }
        });
    }
}

function loadViabloryImagesDescriptions() {

    for (let imagePageName of Object.keys(viabloryImages)) {
        let run = true;
        let offset = 0;

        let imageName = imagePageName.substr(5);
        let descriptionPageName = viabloryDescriptionPagenamePrefix + imageName;
        let askParams = 'action=ask&format=json';
        let askQuery = `%5B%5B-Has%20subobject%3A%3A${descriptionPageName}%5D%5D%7C%3Fsession%7C%3Fdescription%7C%3Flanguage`;
        let urlRequest = `${urlAPIBase}?${askParams}${origin}&query=${askQuery}|offset=${offset}`;
        while (run) {
            $.ajax({
                url: urlRequest,
                dataType: 'json',
                async: false,
                success: function (json) {
                    let results = json.query.results;
                    Object.keys(results).forEach(function (key) {
                        let description = propertySetNotEmpty(results[key].printouts, 'Description');
                        let sessionName = propertySetNotEmpty(results[key].printouts, 'Session');
                        let language = propertySetNotEmpty(results[key].printouts, 'Language');
                        viabloryImages[imagePageName].descriptions.push({
                            language: language,
                            sessionName: sessionName,
                            description: description
                        });
                    });
                    offset = json.hasOwnProperty('query-continue-offset') ? json['query-continue-offset'] : false;
                    run = offset !== false;
                }
            });
        }
    }
}

function propertySetNotEmpty(object, property) {
    return object.hasOwnProperty(property) && object[property].length !== 0 ? object[property][0] : "";
}

function requestEditToken() {
    let editToken = '';
    var urlTokenRequest = urlAPIBase + '?action=query&meta=tokens&format=json';
    $.ajax({
        url: urlTokenRequest,
        dataType: 'json',
        async: false,
        success: function (data) {
            editToken = data.query.tokens.csrftoken;
        },
        error: function (headers, textStatus, error) {
            console.log("Error on getting edit token.", textStatus, error);
        }
    });
    return editToken;
}

function writeViabloryImageDescriptionToMediaWiki(pageNameImage, description, sessionName) {
    let pagename = viabloryDescriptionPagenamePrefix + pageNameImage.substr(5);
    const subobject = '\n\n{{#subobject:\n'
        + `| session=${sessionName}\n`
        + `| language=${selectedLanguage}\n`
        + `| description=${description}\n`
        + '}}';

    $.post(urlAPIBase, {
        format: 'json',
        action: 'edit',
        title: pagename,
        appendtext: subobject,
        token: requestEditToken(),
    }, function (response) {
        if (selectedMode === Mode.student1) {
            selectMode(Mode.student2);
        } else if (selectedMode === Mode.student2) {
            selectMode(Mode.play);
        } else {
            // todo: error-handling
        }
    });
}

function publishSessionName() {
    let pageName = "ViablorySessions";
    let sessionName = $('#inputSessionName').val();
    let dateNow = new Date(Date.now());

    const subobject = '\n\n{{#subobject:\n'
        + `| session=${sessionName}\n`
        + `| sessionDate=${dateNow.toISOString()}\n`
        + '}}';

    $.post(urlAPIBase, {
        format: 'json',
        action: 'edit',
        title: pageName,
        appendtext: subobject,
        token: requestEditToken(),
    }, function () {
        alert(constantTexts.publishSessionNameSuccess);
    }).done(function () {
        // anything to do here?
    }).fail(function () {
        alert(constantTexts.publishSessionNameFail);
    }).always(function () {
        // anything to do here?
    });
}

function getCurrentSessions() {
    let run = true;
    let offset = 0;

    let askParams = 'action=ask&format=json';
    let askQuery = `%5B%5B-Has%20subobject%3A%3AViablorySessions%5D%5D%7C%3Fsession%7C%3FsessionDate%23ISO%7Cmainlabel%3D-%7Coffset%3D0`;
    let urlRequest = `${urlAPIBase}?${askParams}${origin}&query=${askQuery}|offset=${offset}`;
    while (run) {
        $.ajax({
            url: urlRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                let results = json.query.results;
                Object.keys(results).forEach(function (key) {
                    if (results[key].printouts.hasOwnProperty('Session') && results[key].printouts.hasOwnProperty('SessionDate')) {
                        let sessionName = results[key].printouts.Session[0];
                        let date_timestamp = results[key].printouts.SessionDate[0].timestamp;
                        let sessionDate = new Date(parseInt(date_timestamp) * 1000);
                        let now = new Date(Date.now());
                        if (sameDay(sessionDate, now)) {
                            currentViablorySessions.push(sessionName);
                        }
                    }
                });
                offset = json.hasOwnProperty('query-continue-offset') ? json['query-continue-offset'] : false;
                run = offset !== false;
            }
        });
    }
}

function createPairs(keys) {
    let i = 0;
    for (let key of viabloryImageKeysShuffled) {
        let image = viabloryImages[key];
        pairs[key] = {id: i, imageId: key, content: "", descriptions: image.descriptions, imageSource: image.imageUrl};
        i++;
    }
    sessionStorage.setItem("pairs", JSON.stringify(pairs));
}

// https://stackoverflow.com/a/43855221/8952149
function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}