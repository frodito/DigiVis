const delay = 600;
const url = 'http://' + location.hostname + '/mediawiki/api.php';
const params = 'action=ask&format=json';
const origin = '&origin=*';
const query = '&query=%5B%5BAnnotation%20of%3A%3A%2B%5D%5D%5B%5B~Text%3A*%7C%7C~Annotationen%3A*%5D%5D%7C%3FAnnotationComment%7C%3FAnnotationMetadata%7C%3FCategory%7C%3Fist%20Thema%7C%3Fist%20Innovationstyp%7C%3FReferenztyp%7C%3FNarrativtyp%7Climit%3D1000';
const query_plain = '[[Annotation of::+]][[~Text:*||~Annotationen:*]]|?AnnotationComment|?AnnotationMetadata|?Category|?ist Thema|?ist Innovationstyp|?Referenztyp|?Narrativtyp';

let annotationMap = new Map();
let offset = 0;
let run = true;
let counter = 0;
let timeout = 0;
// let $walkname = "";
let mappingData = [];
let cmcontinue = "";
let $listAnnotationsFiltered = [];
let indexCurrentAnnotation = 0;


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
    // $('#btnLoadWalk').click(loadWalkButtonClickHandler);

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
        activate: da_activate_handler,
        beforeStop: da_beforeStop_handler,
        change: da_change_handler,
        create: da_create_handler,
        deactivate: da_deactivate_handler,
        out: da_out_handler,
        over: da_over_handler,
        receive: da_receive_handler,
        remove: da_remove_handler,
        sort: da_sort_handler,
        start: da_start_handler,
        stop: da_stop_handler,
        update: da_update_handler,
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

// load annotations and populate the selectarea
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
            connectToSortable: ".droparea",
            create: a_create_handler,
            drag: a_drag_handler,
            start: a_start_handler,
            stop: a_stop_handler
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

function addWalkTemplate() {
    let $droparea = $('.droparea');
    let $title_slide = createTitleSlideEmpty();
    let $explanation_slide = createExplanationSlideEmpty();
    let $conclusion_slide = createConclusionSlideEmpty();

    $droparea.append($title_slide);
    $droparea.append($explanation_slide);
    $droparea.append($conclusion_slide);
}

function createStation($content) {
    // let $station = $('<div class="station"></div>');
    let $close_button = $('<button class="station_close_button">X</button>');
    $close_button.click(function (ev) {
        $(ev.target).parent().remove();
    });
    // $content.append($close_button);
    $content.prepend($close_button);
    return $content;
}

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

function createExplanationSlideEmpty() {
    let $container = $('<div class="station explanation static" id="explanation_station"></div>\'');
    let $explanation = $('<textarea rows="4" type="text" id="explanation_text" name="explanation_text" placeholder="Explanation about the walk"></textarea>');
    $container.append($explanation);
    return createStation($container);
}

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
 * Construct the HTML when dragging an annotation to the droparea
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

function addCustomStationButtonClickHandler(ev) {
    $newStation = createStationCustom();
    $('.droparea').prepend($newStation);
}

function saveWalkButtonClickHandler(ev) {
    let $walkname = 'Walk:' + $('#walkNameInput')[0].value;
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
                // loop over all entries in droparea and create string for SMW
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
        console.log("Error when checking if page", $walkname, "exists.");
    });
}

function getEditToken() {
    return token;
}

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


function loadWalkButtonClickHandler() {
    console.log("in loadWalkClickHandler");
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

function resetWalkClickHandler(ev) {
    console.log("in resetWalkClickHandler");
    $('.droparea').empty();
    addWalkTemplate();
}

function a_create_handler(ev, ui) {
    log_event_message("a_create", ev, ui);
}

function a_drag_handler(ev, ui) {
    log_event_message("a_drag", ev, ui);
}

function a_start_handler(ev, ui) {
    log_event_message("a_start", ev, ui);
}

function a_stop_handler(ev, ui) {
    log_event_message("a_stop", ev, ui);
}

function da_activate_handler(ev, ui) {
    log_event_message("da_activate", ev, ui);
}

function da_beforeStop_handler(ev, ui) {
    log_event_message("da_beforeStop", ev, ui);
}

function da_change_handler(ev, ui) {
    log_event_message("da_change", ev, ui);
}

function da_create_handler(ev, ui) {
    log_event_message("da_create", ev, ui);
}

function da_deactivate_handler(ev, ui) {
    log_event_message("da_deactivate", ev, ui);
}


function da_out_handler(ev, ui) {
    log_event_message("da_out", ev, ui);
}

function da_over_handler(ev, ui) {
    log_event_message("da_over", ev, ui);
}

function da_receive_handler(ev, ui) {
    log_event_message("da_receive", ev, ui);
    let $element = $(this).data().uiSortable.currentItem;
    let annotation_id = $element.data('annotation_id');
    let doc_url = $element.data('doc_url');
    let doc_title = $element.data('doc_title');
    let cat_intern = $element.data('cat_intern');
    let fulltext = $element.data('fulltext');
    let station = $('<div class="station" id="station-' + annotation_id + '"></div>');
    let station_card = $('<div class="station_card"></div>');
    let newElement = createStationContent(annotation_id, $element[0].innerText, doc_title, doc_url);
    newElement.css('background-color', $element[0].style.backgroundColor);
    $element.replaceWith(newElement);
    return true;
}

function da_remove_handler(ev, ui) {
    log_event_message("da_remove", ev, ui);
}

function da_sort_handler(ev, ui) {
    log_event_message("da_sort", ev, ui);
}

function da_start_handler(ev, ui) {
    log_event_message("da_start", ev, ui);
}

function da_stop_handler(ev, ui) {
    log_event_message("da_stop", ev, ui);
}

function da_update_handler(ev, ui) {
    log_event_message("da_update_handler", ev, ui);
}

function log_event_message(text, ev, ui) {
    // console.log(text, ev, ui);
    // console.log(text);
}

function showAnnotation() {
    let $e = $listAnnotationsFiltered.eq(indexCurrentAnnotation);
    $('.overlayTitle').text($e.data('title'));
    $('.overlayText').text($($e).children()[0].innerText);
    $('.overlayOuter').css('background-color', Annotation.prototype.catToColor[$e.data('cat_intern')]);
    $('.overlayOuter').show(delay);
}

function cardClickHandler(ev) {
    $listAnnotationsFiltered = $('.selectarea > .cardOuter:visible');
    indexCurrentAnnotation = $listAnnotationsFiltered.index(ev.target);
    showAnnotation();
}

function previousButtonClickHandler(ev) {
    if (indexCurrentAnnotation > 0) {
        indexCurrentAnnotation--;
    }
    showAnnotation();
}

function nextButtonClickHandler(ev) {
    if (indexCurrentAnnotation < $listAnnotationsFiltered.length - 1) {
        indexCurrentAnnotation++;
    }
    showAnnotation();
}

function closeButtonClickHandler(ev) {
    $('.overlayOuter').hide(delay);
}