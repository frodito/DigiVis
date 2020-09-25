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
		this._topics = [];
		this._innovationtypes = [];
		this._narrativetype = [];
		this._referencetype = [];
		this.fill_topics();
		this.fill_innovationtypes();
		this.fill_narrativetype();
		this.fill_referencetype();
		this.createHTML();
	}

	fill_topics() {
		let self = this;
		this.printouts["Ist Thema"].forEach(function (obj) {
			self._topics.push(obj.fulltext);
		});
	}

	fill_innovationtypes() {
		let self = this;
		this.printouts["Ist Innovationstyp"].forEach(function (obj) {
			self._innovationtypes.push(obj.fulltext);
		});
	}

	fill_narrativetype() {
		let self = this;
		this.printouts["Narrativtyp"].forEach(function (obj) {
			self._narrativetype.push(obj.fulltext);
		});
	}

	fill_referencetype() {
		let self = this;
		this.printouts["Referenztyp"].forEach(function (obj) {
			self._referencetype.push(obj.fulltext);
		});
	}

	fill_header(header) {
		let self = this;
		switch (this.cat_intern) {
			case 'argumentation2':
			case 'argumentationfremd':
				self.topics.forEach(function (topic) {
					header.append($('<p class="headerElement">' + topic + '</p>'));
				});
				break;
			case 'narrativ2':
				header.append($('<p class="headerElement">' + self.narrativetype + '</p>'));
				break;
			case 'innovationsdiskurs2':
				self.innovationtypes.forEach(function (innovationtype) {
					header.append($('<p class="headerElement">' + innovationtype + '</p>'));
				});
				break;
			case 'wissenschaftlichereferenz2':
				header.append($('<p class="headerElement">' + self.referencetype + '</p>'));
				break;
			default:
			// do nothing
		}
		return header;
	}

	createHTML() {
		if (this.type === "annotationlist") {
			this._html = this.createHtmlAnnotationlist();
		} else if (this.type === "walkcreator") {
			this._html = this.createHtmlWalkcreator();
		}
	}

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

	get topics() { return this._topics; }

	get innovationtypes() { return this._innovationtypes; }

	get narrativetype() { return this._narrativetype; }

	get referencetype() { return this._referencetype; }

	get element() { return this._html; }

	get doc_title() { return this._doc_title; }

	get doc_url() { return this._doc_url; }

	get cat_intern() { return this._cat_intern; }

	get selected() { return this._selected; }

	get metadata() { return this._metadata; }

	get category() { return this._category; }

	get html() { return this._html; }
}

Annotation.prototype.catToColor = {
	"argumentation2": "#6d9bff",
	"innovationsdiskurs2": "#FF00FF",
	"narrativ2": "#00FF00",
	"wissenschaftlichereferenz2": "#ffffb5",
	"beispiel3": "#8A2BE2",
	"praemisse3": "#FFA500",
	"schlussfolgerung3": "#00FFFF",
	"argumentationfremd": "#D2691E",
	"antwortglasersfeld": "#FFCFBF"
};

Annotation.prototype.mappingNameToKey = {};
Annotation.prototype.mappingKeyToName = {};

Annotation.prototype.createMappings = function (mappingData) {
	console.log("creating mappings");
	Object.keys(mappingData).forEach(function (lv2Cat) {
		Annotation.prototype.mappingNameToKey[lv2Cat] = {};
		let lv2Key = replaceUmlaute(lv2Cat.toLowerCase());
		mappingData[lv2Cat].forEach(function (lv3Cat, lv3Index) {
			let lv3Key = lv2Key + '-' + replaceUmlaute(lv3Cat.toLowerCase());
			Annotation.prototype.mappingNameToKey[lv2Cat][lv3Cat] = lv3Key;
			Annotation.prototype.mappingKeyToName[lv3Key] = lv2Cat + '-' + lv3Cat;
		});
	});
	console.log("mappingNameToKey", Annotation.prototype.mappingNameToKey);
	console.log("mappingKeyToName", Annotation.prototype.mappingKeyToName);
};