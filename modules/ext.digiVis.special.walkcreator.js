const delay = 600;
const url = 'http://' + location.hostname + '/mediawiki/api.php';
const params = 'action=ask&format=json';
const origin = '&origin=*';

// The query needs to reflect your use case, i.e., adapt the query with your custom attributes
const query = '&query=%5B%5BAnnotation%20of%3A%3A%2B%5D%5D%5B%5B~Text%3A*%7C%7C~Annotationen%3A*%5D%5D%7C%3FAnnotationComment%7C%3FAnnotationMetadata%7C%3FCategory%7C%3FATTRIBUTE1%7C%3FATTRIBUTE2%7C%3FATTRIBUTE3%7C%3FATTRIBUTE4%7Climit%3D1000';
const query_plain = '[[Annotation of::+]][[~Text:*||~Annotationen:*]]|?AnnotationComment|?AnnotationMetadata|?Category|?ATTRIBUTE1|?ATTRIBUTE2|?ATTRIBUTE3|?ATTRIBUTE4';

let annotationMap = new Map();
let offset = 0;
let run = true;
let counter = 0;
let timeout = 0;
let mappingData = [];
let cmcontinue = "";
let $listAnnotationsFiltered = [];
let indexCurrentAnnotation = 0;


/**
 * Add the necessary HTML elements, fill with content, checkbox hierarchy and event listeners for drag and drop
 * functionality.
 */
(function () {
    'use strict';
    let $tableContainer = $('<table class="container_table" id="container_table"></table>');
    let $headerRow = $('<tr></tr>');
    let $thDrop = $('<th><div><input type="text" placeholder="Name of walk" name="walkNameInput" id="walkNameInput"><button class="walkCreateButton" id="btnSaveWalk">Save walk</button></div><div><select name="existingWalks" id="existingWalkSelect"><option value="">--Select existing walk to edit--</option></select><button class="walkCreateButton" id="btnLoadWalk">Reset</button></div></th>');
    let $thAnnotations = $('<th>Annotations<input type="text" placeholder="Search.." name="search" id="filter_annotation"></th>');
    let $thSearch = $('<th>Search/Filter</th>');
    $headerRow.append($thDrop, $thAnnotations, $thSearch);
    let $dataRow = $('<tr></tr>');
    let $drop = $('<td class="drop-column" id="drop-column">Drop annotations in the field below or add an empty station by pressing <span class="add_empty_station_button">here</span><ol class="droparea" id="droparea"></ol></td>');
    let $select = $('<td><div class="selectarea"></div></td>');
    let $filter = $('<td></td>');
    let $filterWrapper = $('<div class="filterWrapper"></div>');
    let $hierarchyWrapper = $('<div class="hierarchyWrapper"></div>');
    let $treeview = $('<ul class="treeview"></ul>');
    $hierarchyWrapper.append($treeview);
    $filterWrapper.append($hierarchyWrapper);
    $filter.append($filterWrapper);
    $dataRow.append($drop, $select, $filter);
    $tableContainer.append($headerRow, $dataRow);
    $('.digivis-walkcreator-container').append($tableContainer);

    $('#filter_annotation').keyup(handleFreetextFilter);
    $('.overlayCloseButton').click(closeButtonClickHandler);
    $('.previous_annotation').click(previousButtonClickHandler);
    $('.next_annotation').click(nextButtonClickHandler);
    $('#btnSaveWalk').click(saveWalkButtonClickHandler);

    $('#existingWalkSelect').change(function () {
        let $select = $('#existingWalkSelect');
        let $value = $select.children("option:selected").val();
        if ($value === "") {
            $('#btnLoadWalk').text("Reset");
            $('#btnLoadWalk').off('click');
            $('#btnLoadWalk').click(resetWalkClickHandler);
        } else {
            $('#btnLoadWalk').text("Load Walk");
            $('#btnLoadWalk').off('click');
            $('#btnLoadWalk').click(loadWalkButtonClickHandler);
        }
    });

    $('.droparea').sortable({
        helper: function (ev, target) {
            return $('<div class="sortable_list_helper"></div>');
        },
        receive: da_receive_handler,
    });
    $('.add_empty_station_button').click(addCustomStationButtonClickHandler);
    addWalkTemplate();
}());

// load already created walks and populate the dropdown element
(async function () {
    let apiCall = new mw.Api();
    while (run) {
        await apiCall.get({
            action: "query",
            list: "categorymembers",
            cmtitle: "Category:Walks",
            cmlimit: 200,
            cmcontinue: cmcontinue
        }).then(function (ret) {
            if (ret.hasOwnProperty('query')) {
                if (ret.query.hasOwnProperty('categorymembers')) {
                    let $select = $('#existingWalkSelect');
                    $.each(ret.query.categorymembers, function () {
                        $select.append('<option value="' + this.pageid + '">' + this.title.substring(5) + '</option>');
                    });
                }
            }
            if (ret.hasOwnProperty('continue')) {
                if (ret.continue.hasOwnProperty('cmcontinue')) {
                    cmcontinue = ret.continue.cmcontinue;
                } else {
                    cmcontinue = false;
                }
            } else {
                cmcontinue = false;
            }
            run = cmcontinue;
        }, function (error) {
            run = false;
            console.log("Error retrieving annotations via ask query.");
        });
    }
})();

/**
 * Load annotations from MediaWiki and populate the select area and add custom data to the HTML elements.
 * Also fill mappingData to create the checkbox hierarchy.
 */
(async function () {
    while (run) {
        let apiCall = new mw.Api();
        await apiCall.get({
            action: "ask",
            query: (query_plain + '|offset=' + offset)
        }).then(function (ret) {
            $.each(ret.query.results, function () {
                let annotation = new Annotation(this, "walkcreator");
                fillMappingData(annotation);
                annotationMap.set(annotation.id, annotation);
            });
            offset = ret.hasOwnProperty('query-continue-offset') ? ret['query-continue-offset'] : false;
            run = offset !== false;
        }, function (error) {
            run = false;
            console.log("Error retrieving annotations via ask query.");
        });
        // 	break;
    }
    run = true;
    Object.keys(mappingData).forEach(function (lv2Cat) {
        mappingData[lv2Cat] = Array.from(mappingData[lv2Cat]).sort();
    });
    Annotation.prototype.createMappings(mappingData);
    createCheckboxHierarchy();
    $('input[type="checkbox"]').change(checkboxChanged);
    annotationMap.forEach(function (annotation, annotationId) {
        $(annotation.html).click(cardClickHandler);
        $('.selectarea').append(annotation.html);
        $('#' + annotation.id).draggable({
            cursors: 'move',
            containment: '#container_table',
            helper: function () {
                return $(this).clone(true, true);
            },
            connectToSortable: ".droparea"
        });
        $('#' + annotationId).attr({
            'data-annotation_id': annotationId,
            'data-doc_url': annotation.doc_url,
            'data-doc_title': annotation.doc_title,
            'data-fulltext': annotation.fulltext,
            'data-cat_intern': annotation.cat_intern
        });
    });
})();

/**
 * Empty template with title, explanation and walk-conclusion slide when starting or when reset button is pressed.
 */
function addWalkTemplate() {
    let $droparea = $('.droparea');
    let $title_slide = createTitleSlideEmpty();
    let $explanation_slide = createExplanationSlideEmpty();
    let $conclusion_slide = createConclusionSlideEmpty();

    $droparea.append($title_slide);
    $droparea.append($explanation_slide);
    $droparea.append($conclusion_slide);
}

/**
 * Helper method to create HTML code of a station.
 *
 * @param $content
 * @returns {*}
 */
function createStation($content) {
    let $close_button = $('<button class="station_close_button">X</button>');
    $close_button.click(function (ev) {
        $(ev.target).parent().remove();
    });
    $content.prepend($close_button);
    return $content;
}

/**
 * Create HTML container for an empty title slide.
 *
 * @returns {*}
 */
function createTitleSlideEmpty() {
    let $container = $('<div class="station title static" id="title_station"></div>');
    let $title = $('<input type="text" id="walk_title" name="walk_title" placeholder="Title of the walk">');
    let $subtitle = $('<input type="text" id="walk_subtitle" name="walk_subtitle" placeholder="Subtitle (optional)">');
    let $link_video = $('<input type="text" id="video_url_title" name="station_video_url" placeholder="Paste URL of a video." required >');
    let $link_image = $('<input type="text" id="image_url_title" name="station_image_url" placeholder="Paste URL of an image." required >');
    $container.append($title);
    $container.append($subtitle);
    $container.append($link_video);
    $container.append($link_image);
    return createStation($container);
}

/**
 * Create HTML container for an empty explanation slide.
 *
 * @returns {*}
 */
function createExplanationSlideEmpty() {
    let $container = $('<div class="station explanation static" id="explanation_station"></div>\'');
    let $explanation = $('<textarea rows="4" type="text" id="explanation_text" name="explanation_text" placeholder="Explanation about the walk"></textarea>');
    $container.append($explanation);
    return createStation($container);
}

/**
 * Create HTML container for an empty conclusion slide.
 *
 * @returns {*}
 */
function createConclusionSlideEmpty() {
    let $container = $('<div class="station conclusion static" id="conclusion_station"></div>');
    let $header = $('<input id="conclusion_header" name="conclusion_header" placeholder="Header for the conclusion of the walk.">');
    let $conclusion = $('<textarea rows="4" id="conclusion_text" name="conclusion_text" placeholder="Conclusion of the walk."></textarea>');
    let $link_video = $('<input type="text" id="video_url_conclusion" name="station_video_url" placeholder="Paste URL of a video." required >');
    let $link_image = $('<input type="text" id="image_url_conclusion" name="station_image_url" placeholder="Paste URL of an image." required >');
    $container.append($header);
    $container.append($conclusion);
    $container.append($link_video);
    $container.append($link_image);
    return createStation($container);
}

/**
 * Construct HTML when dragging an annotation to the droparea
 *
 * @param id    the id of the annotation
 * @param quote the quote to use in this station
 * @param doc_title the title of the source-text
 * @param doc_url url of the original document in MediaWiki
 * @returns {jQuery|HTMLElement|*} the HTML for an annotation dropped into the droparea
 */
function createStationContent(id, quote, doc_title, doc_url) {
    let $container = $('<div class="station normal" id="station_' + id + '"></div>');
    let $header = $('<input type="text" id="header_' + id + '" name="station_header" placeholder="Header for the station." required >');
    let $quote = $('<div class="station_quote" id="quote_' + id + '">' + quote + '</div>');
    let $link_video = $('<input type="text" id="video_url_' + id + '" name="station_video_url" placeholder="Paste URL of a video." required >');
    let $link_image = $('<input type="text" id="image_url_' + id + '" name="station_image_url" placeholder="Paste URL of an image." required >');
    let $source = $('<div class="document_source">Source: <a href="' + doc_url + '" target="_blank">' + doc_title + '</a> </div>');
    let $conclusion = $('<textarea rows="4" type="text" id="conclusion_' + id + '" name="station_conclusion_' + id + '" placeholder="Conclusion of the station."></textarea>');
    $container.append($header);
    $container.append($quote);
    $container.append($link_video);
    $container.append($link_image);
    $container.append($source);
    $container.append($conclusion);
    return createStation($container);
}

/**
 * Construct the HTML when adding an empty station to the droparea
 *
 * @param id    the id of the annotation
 * @param quote the quote to use in this station
 * @param doc_title the title of the source-text
 * @param doc_url url of the original document in MediaWiki
 * @returns {jQuery|HTMLElement|*} the HTML for an annotation dropped into the droparea
 */
function createStationCustom() {
    let id = Date.now();
    let $container = $('<div class="station custom"></div>');
    let $header = $('<input type="text" name="station_header" id="header_' + id + '" placeholder="Header for the station." required >');
    let $quote = $('<textarea rows="4" class="station_quote" id="quote_' + id + '" placeholder="Enter your own text for this station."></textarea>');
    let $link_video = $('<input type="text" name="station_video_url" id="video_url_' + id + '" placeholder="Paste URL of a video." required >');
    let $link_image = $('<input type="text" name="station_image_url" id="image_url_' + id + '" placeholder="Paste URL of an image." required >');
    // let $source = $('<div class="document_source">Source: <a href="' + doc_url + '" target="_blank">' + doc_title + '</a> </div>');
    let $conclusion = $('<textarea rows="4" type="text" id="' + id + '" name="station_conclusion" placeholder="Conclusion of the station."></textarea>');
    $container.append($header);
    $container.append($quote);
    $container.append($link_video);
    $container.append($link_image);
    // $container.append($source);
    $container.append($conclusion);
    return createStation($container);
}

/**
 * Handler to add empty custom station when corresponding button is pressed.
 *
 * @param ev
 */
function addCustomStationButtonClickHandler(ev) {
    $newStation = createStationCustom();
    $('.droparea').prepend($newStation);
}


/**
 * Handler for saving a walk when the corresponding button is pressed.
 *
 * @param ev
 */
function saveWalkButtonClickHandler(ev) {
    let $walkname = 'Walk:' + $('#walkNameInput')[0].value;

    // check given name for walk with MediaWiki API and handle errors
    new mw.Api().get({
        action: "query",
        titles: [$walkname],
    }).then(function (ret) {
        $.each(ret.query.pages, function (index, value) {
            let title = value.title;
            if (value.hasOwnProperty('invalid')) {
                // chosen pagename is invalid, give feedback to user
                let invalidReason = value.invalidreason;
            } else {
                let stationId = 1;
                // loop over all entries in droparea and create string for Semantic MediaWiki
                let smwString = "";
                $('.droparea > div').each(function (index, element) {
                    let tmpString = ``;
                    if (element.classList.value.includes('title')) {
                        // title station
                        let stationVideoURL = $(element).children('[id^=video_url_]').val();
                        let stationImageURL = $(element).children('[id^=image_url_]').val();
                        tmpString = `{{#subobject:TitleStation\n|stationId=${stationId}\n|stationType=title\n|walkTitle=${$('#walk_title').val()}\n|subTitle=${$('#walk_subtitle').val()}\n|stationVideoURL=${stationVideoURL}\n|stationImageURL=${stationImageURL}\n}}\n\n`;
                    } else if (element.classList.value.includes('explanation')) {
                        // explanation station
                        tmpString = `{{#subobject:ExplanationStation\n|stationId=${stationId}\n|stationType=explanation\n|explanationText=${$('#explanation_text').val()}\n}}\n\n`;
                    } else if (element.classList.value.includes('conclusion')) {
                        // conclusion station
                        let stationVideoURL = $(element).children('[id^=video_url_]').val();
                        let stationImageURL = $(element).children('[id^=image_url_]').val();
                        tmpString = `{{#subobject:ConclusionStation\n|stationId=${stationId}\n|stationType=conclusion\n|conclusionHeader=${$('#conclusion_header').val()}\n|conclusionText=${$('#conclusion_text').val()}\n|stationVideoURL=${stationVideoURL}\n|stationImageURL=${stationImageURL}\n}}\n\n`;
                    } else if (element.classList.value.includes('normal')) {
                        // ordinary station
                        let stationHeader = $(element).children('[id^=header_]').val();
                        let stationText = $(element).children('[id^=quote_]').text();
                        let stationDocumentSourceTitle = $(element).children('.document_source').text();
                        let stationDocumentSourceURL = $(element).children('.document_source').children('a').attr('href');
                        let stationVideoURL = $(element).children('[id^=video_url_]').val();
                        let stationImageURL = $(element).children('[id^=image_url_]').val();
                        let stationConclusion = $(element).children('[id^=conclusion_]').val();
                        tmpString = `{{#subobject:\n|stationId=${stationId}\n|stationType=normal\n|stationHeader=${stationHeader}\n|stationText=${stationText}\n|stationDocumentSourceTitle=${stationDocumentSourceTitle}\n|stationDocumentSourceURL=${stationDocumentSourceURL}\n|stationVideoURL=${stationVideoURL}\n|stationImageURL=${stationImageURL}\n|stationConclusion=${stationConclusion}\n}}\n\n`;
                    } else if (element.classList.value.includes('custom')) {
                        // custom station
                        let stationHeader = $(element).children('[id^=header_]').val();
                        let stationText = $(element).children('[id^=quote_]').val();
                        // let stationDocumentSourceTitle = $(element).children('.document_source').text();
                        // let stationDocumentSourceURL = $(element).children('.document_source').children('a').attr('href');
                        let stationVideoURL = $(element).children('[id^=video_url_]').val();
                        let stationImageURL = $(element).children('[id^=image_url_]').val();
                        let stationConclusion = $(element).children('[id^=conclusion_]').val();
                        // tmpString = `{{#subobject:\n|stationId=${stationId}\n|stationType=custom\n|stationHeader=${stationHeader}\n|stationText=${stationText}\n|stationDocumentSourceTitle=${stationDocumentSourceTitle}\n|stationDocumentSourceURL=${stationDocumentSourceURL}\n|stationVideoURL=${stationVideoURL}\n|stationImageURL=${stationImageURL}\n|stationConclusion=${stationConclusion}\n}}\n\n`;
                        tmpString = `{{#subobject:\n|stationId=${stationId}\n|stationType=custom\n|stationHeader=${stationHeader}\n|stationText=${stationText}\n|stationDocumentSourceTitle=\n|stationDocumentSourceURL=\n|stationVideoURL=${stationVideoURL}\n|stationImageURL=${stationImageURL}\n|stationConclusion=${stationConclusion}\n}}\n\n`;
                    }
                    smwString += tmpString;
                    stationId++;
                });
                smwString + = '\n\n[[Category:Walks]]';

                if (value.hasOwnProperty('missing')) {
                    // new page, need to be created
                    editPage($walkname, smwString);
                } else {
                    // existing page, need to overwrite content
                    // give feedback to user before actually overwriting things
                    editPage($walkname, smwString);
                }

                // Add new page to dropdown
                new mw.Api().get({
                    action: "query",
                    titles: [$walkname],
                }).then(function (ret) {
                    $.each(ret.query.pages, function (pageId, value) {
                        let title = value.title;
                        if (!$(`#existingWalkSelect option[value=${pageId}]`)) {
                            $('#existingWalkSelect').append('<option value="' + pageId + '">' + title.substring(5) + '</option>');
                        }
                    });
                });

            }
        });
    }, function (error) {
        console.log("Error when checking if page ", $walkname, " exists.");
    });
}

/**
 * Helper method to handle editing a MediaWiki page.
 * Retrieves an edit-token from the API, if successful sends the edit of the page to the API.
 *
 * @param pagename
 * @param content
 */
function editPage(pagename, content) {
    var getTokenUrl = mw.config.get('wgScriptPath') + '/api.php?action=query&meta=tokens&format=json';
    var token;
    $.getJSON(getTokenUrl, function (json) {
        token = json.query.tokens.csrftoken;
        var url = mw.util.wikiScript('api');
        $.post(url, {
            format: 'json',
            action: 'edit',
            title: pagename,
            text: content,
            token: token
        });
    });
}

/**
 * Handler to load a selected walk when the corresponding button is pressed.
 */
function loadWalkButtonClickHandler() {
    let $select = $('#existingWalkSelect');
    let $value = $select.children("option:selected").val();
    if ($value !== "") {
        let $page_title = $select.children('option:selected').text();
        $('#walkNameInput').val($page_title);

        let query = '[[-Has subobject::Walk:' + $page_title + ']]|?stationId|?stationType|?walkTitle|?subTitle|?explanationText|?conclusionHeader|?conclusionText|?stationHeader|?stationText|?stationDocumentSourceTitle|?stationDocumentSourceURL|?stationVideoURL|?stationImageURL|?stationConclusion|sort=stationId|order=asc';
        let apiCall = new mw.Api();
        apiCall.get({
            action: "ask",
            query: query
        }).then(function (ret) {
            let walk = [];
            $.each(ret.query.results, function () {
                let station = new Station(this.printouts);
                walk[station.stationId] = station;
            });
            let $droparea = $('.droparea');
            $droparea.empty();
            $.each(walk, function () {
                $droparea.append(this.html);
            });
        }, function (error) {
            console.log("Error retrieving data for walk " + $page_title + " via ask query.");
        });
    }
}

/**
 * Handler to reset the droparea with the three default stations.
 *
 * @param ev
 */
function resetWalkClickHandler(ev) {
    console.log("in resetWalkClickHandler");
    $('.droparea').empty();
    addWalkTemplate();
}

/**
 * Custom receive handler for the droparea.
 *
 * @param ev
 * @param ui
 * @returns {boolean}
 */
function da_receive_handler(ev, ui) {
    log_event_message("da_receive", ev, ui);
    let $element = $(this).data().uiSortable.currentItem;
    let annotation_id = $element.data('annotation_id');
    let doc_url = $element.data('doc_url');
    let doc_title = $element.data('doc_title');
    let newElement = createStationContent(annotation_id, $element[0].innerText, doc_title, doc_url);
    newElement.css('background-color', $element[0].style.backgroundColor);
    $element.replaceWith(newElement);
    return true;
}

/**
 * Show clicked annotation with full text in bigger overlay.
 */
function showAnnotation() {
    let $e = $listAnnotationsFiltered.eq(indexCurrentAnnotation);
    $('.overlayTitle').text($e.data('title'));
    $('.overlayText').text($($e).children()[0].innerText);
    $('.overlayOuter').css('background-color', Annotation.prototype.catToColor[$e.data('cat_intern')]);
    $('.overlayOuter').show(delay);
}

/**
 * Click handler for cards
 *
 * @param ev
 */
function cardClickHandler(ev) {
    $listAnnotationsFiltered = $('.selectarea > .cardOuter:visible');
    indexCurrentAnnotation = $listAnnotationsFiltered.index(ev.target);
    showAnnotation();
}

/**
 * Clickhandler to switch overlay to annotation, which is the predecessor to the current one in the list.
 *
 * @param ev
 */
function previousButtonClickHandler(ev) {
    if (indexCurrentAnnotation > 0) {
        indexCurrentAnnotation--;
    }
    showAnnotation();
}

/**
 * Clickhandler to switch overlay to annoation, which is the successor to the current one in the list.
 *
 * @param ev
 */
function nextButtonClickHandler(ev) {
    if (indexCurrentAnnotation < $listAnnotationsFiltered.length - 1) {
        indexCurrentAnnotation++;
    }
    showAnnotation();
}

/**
 * Clickhandler to close the overlay
 *
 * @param ev
 */
function closeButtonClickHandler(ev) {
    $('.overlayOuter').hide(delay);
}