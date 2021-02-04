/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

/**
 * @class Class represents our view on annotation, created with Semantic Text Annotator, for the purpose of using it in
 * visualizations. Here the annotations are display in form of cards, displaying the text of the annotations and using
 * the colors assigned in Semantic Text Annotator as color coding.
 */
class Annotation {

	constructor(query_result, type = "annotationlist") {
		this._type = type;
		this._selected = false;
		this._fulltext = query_result.fulltext;
		this._doc_title = extractTitle(query_result.fulltext);
		this._doc_url = extractUrl(query_result.fullurl);
		this._printouts = query_result.printouts;
		this._metadata = JSON.parse(translateBrackets(this.printouts.AnnotationMetadata[0]));
		this._category = this._metadata.category;
		this._id = this._metadata.id;
		this._cat_intern = replaceUmlaute(this.category.toLowerCase());
		this._LEVEL2CATEGORY1ATTRIBUTE1 = [];
		this._LEVEL2CATEGORY2ATTRIBUTE1 = [];
		this._LEVEL2CATEGORY3ATTRIBUTE1 = [];
		this._LEVEL2CATEGORY4ATTRIBUTE1 = [];
		this.fill_LEVEL2CATEGORY1ATTRIBUTE1();
		this.fill_LEVEL2CATEGORY2ATTRIBUTE1();
		this.fill_LEVEL2CATEGORY3ATTRIBUTE1();
		this.fill_LEVEL2CATEGORY4ATTRIBUTE1();
		this.createHTML();
	}

	/**
	 * Populate array for LEVEL2CATEGORY1ATTRIBUTE1
	 */
	fill_LEVEL2CATEGORY1ATTRIBUTE1() {
		let self = this;
		this.printouts["LEVEL2CATEGORY1ATTRIBUTE1"].forEach(function (obj) {
			self._LEVEL2CATEGORY1ATTRIBUTE1.push(obj.fulltext);
		});
	}

	/**
	 * Populate array for LEVEL2CATEGORY2ATTRIBUTE1
	 */
	fill_LEVEL2CATEGORY2ATTRIBUTE1() {
		let self = this;
		this.printouts["LEVEL2CATEGORY2ATTRIBUTE1"].forEach(function (obj) {
			self._LEVEL2CATEGORY2ATTRIBUTE1.push(obj.fulltext);
		});
	}

	/**
	 * Populate array for LEVEL2CATEGORY3ATTRIBUTE1
	 */
	fill_LEVEL2CATEGORY3ATTRIBUTE1() {
		let self = this;
		this.printouts["LEVEL2CATEGORY3ATTRIBUTE1"].forEach(function (obj) {
			self._LEVEL2CATEGORY3ATTRIBUTE1.push(obj.fulltext);
		});
	}

	/**
	 * Populate array for LEVEL2CATEGORY4ATTRIBUTE1
	 */
	fill_LEVEL2CATEGORY4ATTRIBUTE1() {
		let self = this;
		this.printouts["LEVEL2CATEGORY4ATTRIBUTE1"].forEach(function (obj) {
			self._LEVEL2CATEGORY4ATTRIBUTE1.push(obj.fulltext);
		});
	}

	/**
	 * Create the header in the cards according to category of the annotation.
	 *
	 * @param header
	 * @returns {*}
	 */
	fill_header(header) {

		/**
		 * An attribute in annotations can be a list, exemplary here for ATTRIBUTE1 and ATTRIBUTE3
		 */

		let self = this;
		switch (this.cat_intern) {
			case 'LEVEL2CATEGORY1':
			case 'LEVEL2CONNECTED':
				self.LEVEL2CATEGORY1ATTRIBUTE1.forEach(function (LEVEL2CATEGORY1ATTRIBUTE1) {
					header.append($('<p class="headerElement">' + LEVEL2CATEGORY1ATTRIBUTE1 + '</p>'));
				});
				break;
			case 'LEVEL2CATEGORY2':
				header.append($('<p class="headerElement">' + self.LEVEL2CATEGORY2ATTRIBUTE1 + '</p>'));
				break;
			case 'LEVEL2CATEGORY3':
				self.LEVEL2CATEGORY3ATTRIBUTE1.forEach(function (LEVEL2CATEGORY3ATTRIBUTE1) {
					header.append($('<p class="headerElement">' + LEVEL2CATEGORY3ATTRIBUTE1 + '</p>'));
				});
				break;
			case 'LEVEL2CATEGORY4':
				header.append($('<p class="headerElement">' + self.LEVEL2CATEGORY4ATTRIBUTE1 + '</p>'));
				break;
			default:
			// do nothing when other categories occur
		}
		return header;
	}

	/**
	 * Create the HTML for the application, depending if it is used in the annotation-list or the walk-creator
	 */
	createHTML() {
		if (this.type === "annotationlist") {
			this._html = this.createHtmlAnnotationlist();
		} else if (this.type === "walkcreator") {
			this._html = this.createHtmlWalkcreator();
		}
	}

	/**
	 * Create the HTML code for the annotation-list
	 *
	 * @returns {jQuery|HTMLElement}
	 */
	createHtmlAnnotationlist() {
		let text = this.metadata.quote;
		let $headerCard = $('<div class="cardHeader"></div>');
		let $innerCard = $('<p class="cardInner" id="inner-' + this.metadata.id + '"></p>').text(text);
		let $outerCard = $('<div class="cardOuter" id="' + this.metadata.id + '"></div>');
		let $footerCard = $('<input type="text" class="cardFooter" id="footer-' + this.metadata.id + '" value="' + this.fulltext + '" readonly="readonly">');
		$outerCard.data('title', this.doc_title);
		$outerCard.data('doc_url', this.doc_url);
		$outerCard.data('id', this.metadata.id);
		$outerCard.css({backgroundColor: this.catToColor[this.cat_intern]});
		$outerCard.append(this.fill_header($headerCard));
		$outerCard.append($innerCard);
		$outerCard.append($footerCard);
		return $outerCard;
	}

	/**
	 * Create the HTML for the walk-creator
	 *
	 * @returns {jQuery|HTMLElement}
	 */
	createHtmlWalkcreator() {
		let text = this.metadata.quote;
		let $innerCard = $('<p class="cardInner"></p>').text(text);
		// let $outerCard = $('<div class="cardOuter" id="' + this.metadata.id + '" onclick="cardClickHandler(this)"></div>');
		let $outerCard = $('<div class="cardOuter" id="' + this.metadata.id + '"></div>');
		$outerCard.data('title', this.doc_title);
		$outerCard.data('doc_url', this.doc_url);
		$outerCard.data('id', this.metadata.id);
		$outerCard.css({backgroundColor: this.catToColor[this.cat_intern]});
		$outerCard.append($innerCard);
		return $outerCard;
	}

	get type() { return this._type; }

	get fulltext() { return this._fulltext; }

	get id() { return this._id; }

	get printouts() { return this._printouts; }

	get LEVEL2CATEGORY1ATTRIBUTE1() { return this._LEVEL2CATEGORY1ATTRIBUTE1; }

	get LEVEL2CATEGORY2ATTRIBUTE1() { return this._LEVEL2CATEGORY2ATTRIBUTE1; }

	get LEVEL2CATEGORY3ATTRIBUTE1() { return this._LEVEL2CATEGORY3ATTRIBUTE1; }

	get LEVEL2CATEGORY4ATTRIBUTE1() { return this._LEVEL2CATEGORY4ATTRIBUTE1; }

	get element() { return this._html; }

	get doc_title() { return this._doc_title; }

	get doc_url() { return this._doc_url; }

	get cat_intern() { return this._cat_intern; }

	get selected() { return this._selected; }

	get metadata() { return this._metadata; }

	get category() { return this._category; }

	get html() { return this._html; }
}

/**
 * Mapping of category to color to be used for the cards.
 * Categories are the ones used in the configuration of the Semantic Text Annotator, possibly
 * matching also the colors.
 */
Annotation.prototype.catToColor = {
	"LEVEL2CATEGORY1": "#6d9bff",
	"LEVEL2CATEGORY2": "#FF00FF",
	"LEVEL2CATEGORY3": "#00FF00",
	"LEVEL2CATEGORY4": "#ffffb5",
	"LEVEL3CATEGORY1": "#8A2BE2",
	"LEVEL3CATEGORY2": "#FFA500",
	"LEVEL3CATEGORY3": "#00FFFF",
	"LEVEL2CONNECTED": "#D2691E",
	"LEVEL2CONNECTEDANSWER": "#FFCFBF"
};

Annotation.prototype.mappingNameToKey = {};
Annotation.prototype.mappingKeyToName = {};

/**
 * Creating mapping with actual names of the categories and key-ified representations of the category
 *
 * @param mappingData
 */
Annotation.prototype.createMappings = function (mappingData) {
	Object.keys(mappingData).forEach(function (lv2Cat) {
		Annotation.prototype.mappingNameToKey[lv2Cat] = {};
		let lv2Key = replaceUmlaute(lv2Cat.toLowerCase());
		mappingData[lv2Cat].forEach(function (lv3Cat, lv3Index) {
			let lv3Key = lv2Key + '-' + replaceUmlaute(lv3Cat.toLowerCase());
			Annotation.prototype.mappingNameToKey[lv2Cat][lv3Cat] = lv3Key;
			Annotation.prototype.mappingKeyToName[lv3Key] = lv2Cat + '-' + lv3Cat;
		});
	});
};