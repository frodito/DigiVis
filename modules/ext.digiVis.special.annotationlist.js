/**
 * Displays the filterable and searchable overview over all annotations.
 */

/**
 * Adds necessary HTMl elements to the page
 */
(function () {
	'use strict';
	let $tableContainer = $('<table class="tableContainer"></table>');
	let $headerRow = $('<tr></tr>');
	let $thAnnotations = $('<th>Annotations<input type="text" placeholder="Search.." name="search" id="filter_annotation"></th>');
	let $thSearch = $('<th>Search/Filter</th>');
	$headerRow.append($thAnnotations, $thSearch);
	let $dataRow = $('<tr></tr>');
	let $select = $('<td><div class="selectarea"></div></td>');
	let $filter = $('<td></td>');
	let $filterWrapper = $('<div class="filterWrapper"></div>');
	let $hierarchyWrapper = $('<div class="hierarchyWrapper"></div>');
	let $treeview = $('<ul class="treeview"></ul>');
	$hierarchyWrapper.append($treeview);
	$filterWrapper.append($hierarchyWrapper);
	$filter.append($filterWrapper);
	$dataRow.append($select, $filter);
	$tableContainer.append($headerRow, $dataRow);
	$('.digivis-annotationlist').append($tableContainer);

	$('#filter_annotation')
		.keyup(handleFreetextFilter);
}());

const delay = 600;
const url = 'http://' + location.hostname + '/mediawiki/api.php';
const params = 'action=ask&format=json';
const origin = '&origin=*';
let timeout = 0;

// ASK-query to get all annotations
// before HTML-encoding: [[Annotation of::+]][[~Text:*]]|?AnnotationComment|?AnnotationMetadata|?Category|?ATTRIBUTE1|?ATTRIBUTE2|?ATTRIBUTE3|?ATTRIBUTE4|limit=100
const query = '&query=%5B%5BAnnotation%20of%3A%3A%2B%5D%5D%5B%5B~Text%3A*%5D%5D%7C%3FAnnotationComment%7C%3FAnnotationMetadata%7C%3FCategory%7C%3FATTRIBUTE1%7C%3FATTRIBUTE2%7C%3FATTRIBUTE3%7C%3FATTRIBUTE4%7Climit%3D100';

const query_plain = '[[Annotation of::+]][[~Text:*]]|?AnnotationComment|?AnnotationMetadata|?Category|?ATTRIBUTE1|?ATTRIBUTE2|?ATTRIBUTE3|?ATTRIBUTE4';

let annotationMap = new Map();
let offset = 0;
let run = true;
let counter = 0;
let mappingData = [];

/**
 * Retrieve all annotations through MediaWiki API and fill into array.
 * Also creates the mapping for building the hierarchy.
 */
(async function () {
	while (run) {
		let apiCall = new mw.Api();
		await apiCall.get({
			action: "ask",
			query: (query_plain + '|offset=' + offset)
		}).then(function (ret) {
			$.each(ret.query.results, function () {
				// console.log(this);
				let annotation = new Annotation(this, "annotationlist");
				fillMappingData(annotation);
				annotationMap.set(annotation.id, annotation);
			});
			offset = ret.hasOwnProperty('query-continue-offset') ? ret['query-continue-offset'] : false;
			run = offset !== false;
		}, function (error) {
			run = false;
			console.log("Error retrieving annotations via ask query.");
		});
	}
	Object.keys(mappingData).forEach(function (lv2Cat) {
		mappingData[lv2Cat] = Array.from(mappingData[lv2Cat]).sort();
	});
	Annotation.prototype.createMappings(mappingData);
	createCheckboxHierarchy();
	$('input[type="checkbox"]').change(checkboxChanged);
	annotationMap.forEach(function (annotation, annotationId) {
		$('.selectarea').append(annotation.html);
		$('#footer-' + annotation.id).click(inputElementClickHandlerSelectCopy);
	});
})();

/**
 * Copies the identifier to the MediaWiki annotation when clicking on the footer into copy-buffer.
 * Convenience functionality to create direct links between annotations.
 *
 * @param event
 */
function inputElementClickHandlerSelectCopy(event) {
	let element = event.target;
	element.select();
	document.execCommand("copy");
}

