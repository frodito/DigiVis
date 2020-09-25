/* global console */
/* global mw */
/*jshint esversion: 6 */

$(function () {

	console.log("in ext.digiVis.layer2.js");

	let container = $('.layer2-placeholder');

	// only do if the layer2-placeholder is present
	if (container.length) {
		// let pagetitle = mw.config.get('wgPageName');
		let pagetitle = encodeURI('Text:Abstraction, Re-Presentation, and Reflection: An Interpretation of Experience and of Piaget’s Approach');
		load_parsed_page(container, pagetitle);
	}
}());

const overlapping_types = {"none": 1, "overlapping": 2, "starts": 3, "contains": 4, "equal": 5};

class Annotation {


	constructor(indexStart, indexEnd, elementStart, elementEnd, offsetStart, offsetEnd, quote, category, category_header) {
		this._indexStart = indexStart;
		this._indexEnd = indexEnd;
		this._elementStart = elementStart;
		this._elementEnd = elementEnd;
		this._offsetStart = offsetStart;
		this._offsetEnd = offsetEnd;
		this._quote = quote;
		this._category = category;
		this._category_header = category_header;
	}

	get indexStart() { return this._indexStart; }

	get indexEnd() { return this._indexEnd; }

	get elementStart() { return this._elementStart; }

	get elementEnd() { return this._elementEnd; }

	get offsetStart() { return this._offsetStart; }

	get offsetEnd() { return this._offsetEnd; }

	get quote() { return this._quote; }

	get category() { return this._category; }

	get category_header() { return this._category_header; }

	set indexStart(value) { this._indexStart = value; }

	set indexEnd(value) { this._indexEnd = value; }

	set elementStart(value) { this._elementStart = value; }

	set elementEnd(value) { this._elementEnd = value; }

	set offsetStart(value) { this._offsetStart = value; }

	set offsetEnd(value) { this._offsetEnd = value; }

	set quote(value) { this._quote = value; }

	set category(value) { this._category = value; }

	set category_header(value) { this._category_header = value; }

	startsBefore(b) {
		return (this.indexStart === b.indexStart && this.offsetStart < b.offsetStart ||
			this.indexStart < b.indexStart);
	}

	startsWith(b) {
		return (this.indexStart === b.indexStart && this.offsetStart === b.offsetStart);
	}

	endsWith(b) {
		return (this.indexEnd === b.indexEnd && this.offsetEnd === b.offsetEnd);
	}

	endsBefore(b) {
		return (this.indexEnd < b.indexStart || this.indexEnd === b.indexStart && this.offsetEnd <= b.offsetStart);
	}

	endsInside(b) {
		return ((b.indexStart < this.indexEnd && this.indexEnd < b.indexEnd) ||
			((this.indexEnd === b.indexStart && b.offsetStart < this.offsetEnd && this.offsetEnd < b.offsetEnd) ||
				(this.indexEnd === b.indexEnd && b.offsetStart < this.offsetEnd && this.offsetEnd < b.offsetEnd)));
	}

	endsAfter(b) {
		return (b.indexEnd < this.indexEnd || this.indexEnd === b.indexEnd && b.offsetEnd < this.offsetEnd);
	}

	static customArraySort(a, b) {
		if (a.indexStart < b.indexStart) {
			return -1;
		} else if (a.indexStart > b.indexStart) {
			return 1;
		} else {
			if (a.offsetStart < b.offsetStart) {
				return -1;
			} else if (a.offsetStart > b.offsetStart) {
				return 1;
			} else {
				if (a.indexEnd < b.indexEnd) {
					return -1;
				} else if (a.indexEnd > b.indexEnd) {
					return 1;
				} else {
					if (a.offsetEnd < b.offsetEnd) {
						return -1;
					} else if (a.offsetEnd > b.offsetEnd) {
						return 1;
					} else {
						return 0;
					}
				}
			}
		}
	}
}

function load_parsed_page(container, pagetitle) {

	// console.log(pagetitle);

	const query = "/api.php?action=parse&format=json&page=" + pagetitle;
	const url = mw.config.get('wgScriptPath') + query;
	$.ajax({
		url: url,
		dataType: 'json',
		success: function (json) {
			let pagecontent = json.parse.text['*'];
			container.append(pagecontent);

			// construct same DOM-hierarchy as semantic text annotator for using xpath
			// remove placeholder and 2nd mw-parser-output
			let content = $('.mw-parser-output .layer2-placeholder .mw-parser-output').contents();
			$('.mw-parser-output .layer2-placeholder').replaceWith(content);

			$('.mw-body').wrapInner('<div class="annotator-wrapper"></div>');
			$('.annotator-wrapper').prepend('<div id="mw-notification-area" class="mw-notification-area mw-notification-area-layout" style="display: none;"></div>');

			load_annotations(container, pagetitle, pagecontent);
		}
	});
}

function load_annotations(container, pagetitle, pagecontent) {

	const query = "/api.php?action=ask&format=json&query=%5B%5BAnnotation%20of%3A%3A" + pagetitle + "%5D%5D%7C%3F%3D%23%7C%3FAnnotationMetadata%3D%23";
	// console.log(query);
	const url = mw.config.get('wgScriptPath') + query;
	$.ajax({
		url: url,
		dataType: 'json'
	}).done(function (json) {

		const lookup = {
			"argumentation2": "annotator-hl-blue",
			"innovationsdiskurs2": "annotator-hl-magenta",
			"narrativ2": "annotator-hl-lime",
			"wissenschaftlichereferenz2": "annotator-hl-yellow",
			"beispiel3": "annotator-hl-blueviolet",
			"praemisse3": "annotator-hl-orange",
			"schlussfolgerung3": "annotator-hl-cyan"
		};

		let root = $('.annotator-wrapper')[0];
		// console.log(root);
		let annotations = [];
		let xpath_prefix_start = [], xpath_prefix_end = [];

		// needed to find the order of the nodes in dom
		let selector_index = $(".annotator-wrapper > div:eq(2) > div:eq(3) > div:eq(0) > *");

		Object.keys(json.query.results).forEach(function (prop) {
			let metadatajson = fromEscapedToJson(json.query.results[prop].printouts['#'][0]);
			let category_header = metadatajson.category;
			let category = replaceUmlaute(category_header.toLowerCase());
			let start = metadatajson.ranges[0].start;
			let end = metadatajson.ranges[0].end;
			let offsetStart = metadatajson.ranges[0].startOffset;
			let offsetEnd = metadatajson.ranges[0].endOffset;
			let quote = metadatajson.quote;
			let selector_start = convertXpath2Selector(start, xpath_prefix_start);
			let selector_end = convertXpath2Selector(end, xpath_prefix_end);
			let elementStart = $(selector_start[0]);
			let elementStartIndex = $(selector_start[1]);
			let elementEnd = $(selector_end[0]);
			let elementEndIndex = $(selector_end[1]);

			let indexStart = selector_index.index(elementStartIndex);
			let indexEnd = selector_index.index(elementEndIndex);

			annotations.push(new Annotation(indexStart, indexEnd, elementStart, elementEnd, offsetStart, offsetEnd, quote, category, category_header));
		});

		annotations.sort(Annotation.customArraySort);

		let overlaps = checkOverlapping(annotations);

		for (let i = annotations.length - 1; i >= 0; i--) {
			let annotation = annotations[i];
			// console.log(annotation.indexStart, annotation.offsetStart, annotation.indexEnd, annotation.offsetEnd);
			let box = document.createElement("div");
			box.setAttribute('class', 'box-layer2 ' + lookup[annotation.category]);
			let range = document.createRange();

			try {


				console.log(annotation.elementEnd);
				// check in which child node the end is, adjust if necessary
				let children = [...annotation.elementEnd[0].childNodes],
					startNode = annotation.elementStart[0].firstChild,
					endNode = annotation.elementEnd[0].firstChild;

				children.forEach(function (child) {
					console.log(child);
					let tail = annotation.quote.substring(-10);
					let index = child.innerText.indexOf(tail);
					if (index === -1) {
						annotation.offsetEnd -= child.innerText.length;
					} else {
						endNode = child;
					}
				});


				range.setStart(startNode, annotation.offsetStart);
				range.setEnd(endNode, annotation.offsetEnd);

				if (annotation.indexStart === annotation.indexEnd) {
					range.surroundContents(box);
				} else {
					box.appendChild(range.extractContents());
					range.insertNode(box);
				}

				box.prepend(document.createElement("br"));
				let boxTitle = document.createElement("span");
				boxTitle.setAttribute('class', 'box-layer2-title');
				boxTitle.appendChild(document.createTextNode(annotation.category_header));
				box.prepend(boxTitle);
			} catch (e) {
				console.log(e.message, annotation);
			}
		}
	});
}

function checkOverlapping(annotations) {
	let overlaps = new Array(annotations.length);
	for (let i = 0; i < annotations.length; i++) {
		overlaps[i] = new Array(annotations.length);
		overlaps[i].fill(0);
	}

	for (let i = 0; i < annotations.length; i++) {
		for (let j = i; j < annotations.length; j++) {
			// console.log(i, j);
			let a = annotations[i];
			let b = annotations[j];

			// overlapping: A starts before B and A ends inside B
			if (a.startsBefore(b) && a.endsInside(b)) {
				overlaps[i][j] = overlapping_types.overlapping;
				overlaps[j][i] = overlapping_types.overlapping;

				// starts: A starts with B and A ends inside B
			} else if (a.startsWith(b) && a.endsInside(b)) {
				overlaps[i][j] = overlapping_types.starts;
				overlaps[j][i] = overlapping_types.starts;

				// contains: A starts before B  or A starts with B and A ends after B
			} else if ((a.startsBefore(b) || a.startsWith(b)) && a.endsAfter(b)) {
				overlaps[i][j] = overlapping_types.contains;
				overlaps[j][i] = overlapping_types.contains;

				// equal: A starts with B and A ends with B
			} else if (a.startsWith(b) && a.endsWith(b)) {
				overlaps[i][j] = overlapping_types.equal;
				overlaps[j][i] = overlapping_types.equal;

				// no overlapping
			} else if (a.endsBefore(b)) {
				overlaps[i][j] = overlapping_types.none;
				overlaps[j][i] = overlapping_types.none;
			} else {
				console.log("error in check_Overlapping", a, b);
			}
		}
	}
	console.log("end checkOverlapping", overlaps);
	return overlaps;
}

function convertXpath2Selector(xpath, prefix) {

	// 						  /div[3]	  /div[4]	  /div[1]	  /p[11]
	// $(".annotator-wrapper > div:eq(2) > div:eq(3) > div:eq(0) > p:eq(10)")

	let selector = '.annotator-wrapper';
	let selector_index = '';
	let split = xpath.match(/\w+/g);
	for (let i = 0, j = 0; i < split.length; i++) {
		if (i % 2 === 0) {
			selector += " " + split[i] + ':eq(';
			if (typeof prefix[j] === 'undefined') {
				prefix[j] = new Set();
			}
			prefix[j++].add(split[i]);

		} else {
			selector += parseInt(split[i]) - 1 + ')';
			if (i === 7) {
				selector_index = selector;
			}
			if (i < split.length - 1) {
				selector += ' > ';
			}
		}
	}
	return [selector, selector_index];
}


function fromEscapedToJson(string) {
	string = replaceAll(string, 'Ӷ', '[');
	string = replaceAll(string, 'Ӻ', ']');
	string = replaceAll(string, '^', '{');
	string = replaceAll(string, '°', '}');
	return JSON.parse(string);
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceUmlaute(string) {
	string = string.replace(/\u00e4/g, "ae");
	string = string.replace(/\u00fc/g, "ue");
	string = string.replace(/\u00f6/g, "oe");
	return string;
}