class Station {

    constructor(stationSMW) {
        this._stationId = stationSMW.StationId.length > 0 ? stationSMW.StationId[0] : 0;
        this._stationType = stationSMW.StationType.length > 0 ? stationSMW.StationType[0] : "";
        this._walkTitle = stationSMW.WalkTitle.length > 0 ? stationSMW.WalkTitle[0] : "";
        this._subTitle = stationSMW.SubTitle.length > 0 ? stationSMW.SubTitle[0] : "";
        this._explanationText = stationSMW.ExplanationText.length > 0 ? stationSMW.ExplanationText[0] : "";
        this._conclusionHeader = stationSMW.ConclusionHeader.length > 0 ? stationSMW.ConclusionHeader[0] : "";
        this._conclusionText = stationSMW.ConclusionText.length > 0 ? stationSMW.ConclusionText[0] : "";
        this._stationHeader = stationSMW.StationHeader.length > 0 ? stationSMW.StationHeader[0] : "";
        this._stationText = stationSMW.StationText.length > 0 ? stationSMW.StationText[0] : "";
        this._stationDocumentSourceTitle = stationSMW.StationDocumentSourceTitle.length > 0 ? stationSMW.StationDocumentSourceTitle[0] : "";
        this._stationDocumentSourceURL = stationSMW.StationDocumentSourceURL.length > 0 ? stationSMW.StationDocumentSourceURL[0] : "";
        this._stationVideoURL = stationSMW.StationVideoURL.length > 0 ? stationSMW.StationVideoURL[0] : "";
        this._stationImageURL = stationSMW.StationImageURL.length > 0 ? stationSMW.StationImageURL[0] : "";
        this._stationConclusion = stationSMW.StationConclusion.length > 0 ? stationSMW.StationConclusion[0] : "";
        this.createHTML();
    }

    createHTML() {
        switch (this._stationType) {
            case "title":
                this._$html = this.createHTMLTitle();
                break;
            case "explanation":
                this._$html = this.createHTMLExplanation();
                break;
            case "normal":
                this._$html = this.createHTMLNormal();
                break;
            case "conclusion":
                this._$html = this.createHTMLConclusion();
                break;
            case "custom":
                this._$html = this.createHTMLCustom();
                break;
            default:
                // should not happen, use some error handling
                this._$html = "<div>Unknown station-type when creating the station: " + this._stationType;
        }
    }

    createHTMLTitle() {
        let $container = $('<div class="station title static" id="title_station"></div>');
        let $title = $('<input type="text" id="walk_title" name="walk_title" value="' + this._walkTitle + '" placeholder="Title of the walk">');
        let $subtitle = $('<input type="text" id="walk_subtitle" name=""walk_subtitle value="' + this._subTitle + '" placeholder="Subtitle (optional)">');
        let $link_video = $('<input id="video_url_' + this._stationId + '" name="video_url_' + this._stationId + '" value="' + this._stationVideoURL + '" placeholder="URL to video">');
        let $link_image = $('<input id="image_url_' + this._stationId + '" name="image_url_' + this._stationId + '" value="' + this._stationImageURL + '" placeholder="URL to image">');
        let $close_button = $('<button class="station_close_button">X</button>');
        $close_button.click(function (ev) {
            console.log(this, ev);
            $(ev.target).parent().remove();
        });
        $container.append($close_button);
        $container.append($title);
        $container.append($subtitle);
        $container.append($link_video);
        $container.append($link_image);
        return $container;
    }

    createHTMLExplanation() {
        let $container = $('<div class="station explanation static" id="explanation_station"></div>');
        let $explanation = $('<textarea rows="4" type="text" id="explanation_text" name="explanation_text" placeholder="Explanation about the walk">' + this._explanationText + '</textarea>');
        let $close_button = $('<button class="station_close_button">X</button>');
        $close_button.click(function (ev) {
            console.log(this, ev);
            $(ev.target).parent().remove();
        });
        $container.append($close_button);
        $container.append($explanation);
        return $container;
    }

    createHTMLConclusion() {
        let $container = $('<div class="station conclusion static" id="conclusion_station"></div>');
        let $header = $('<input id="conclusion_header" name="conclusion_header" value="' + this._conclusionHeader + '" placeholder="Header for the conclusion of the walk.">');
        let $conclusion = $('<textarea rows="4" id="conclusion_text" name="conclusion_text" placeholder="Conclusion of the walk.">' + this._conclusionText + '</textarea>');
        let $link_video = $('<input id="video_url_' + this._stationId + '" name="video_url_' + this._stationId + '" value="' + this._stationVideoURL + '" placeholder="URL to video">');
        let $link_image = $('<input id="image_url_' + this._stationId + '" name="image_url_' + this._stationId + '" value="' + this._stationImageURL + '" placeholder="URL to image">');
        let $close_button = $('<button class="station_close_button">X</button>');
        $close_button.click(function (ev) {
            console.log(this, ev);
            $(ev.target).parent().remove();
        });
        $container.append($close_button);
        $container.append($header);
        $container.append($conclusion);
        $container.append($link_video);
        $container.append($link_image);
        return $container;
    }

    createHTMLNormal() {
        let $container = $('<div class="station custom" id="station_' + this._stationId + '"></div>');
        let $header = $('<input id="header_' + this._stationId + '" name="header_' + this._stationId + '" value="' + this._stationHeader + '">');
        let $quote = $('<div class="station_quote" id="quote_' + this._stationId + '">' + this._stationText + '</div>');
        let $link_video = $('<input id="video_url_' + this._stationId + '" name="video_url_' + this._stationId + '" value="' + this._stationVideoURL + '" placeholder="URL to video">');
        let $link_image = $('<input id="image_url_' + this._stationId + '" name="image_url_' + this._stationId + '" value="' + this._stationImageURL + '" placeholder="URL to image">');
        let $source = $('<div class="document_source"><a href="' + this._stationDocumentSourceURL + '" target="_blank">' + this._stationDocumentSourceTitle + '</a> </div>');
        let $conclusion = $('<textarea rows="4"  id="conclusion_' + this._stationId + '" name="station_conclusion_' + this._stationId + '" placeholder="Conclusion of the station.">' + this._stationConclusion + '</textarea>');
        let $close_button = $('<button class="station_close_button">X</button>');
        $close_button.click(function (ev) {
            console.log(this, ev);
            $(ev.target).parent().remove();
        });
        $container.append($close_button);
        $container.append($header);
        $container.append($quote);
        $container.append($link_video);
        $container.append($link_image);
        $container.append($source);
        $container.append($conclusion);
        return $container;
    }

    createHTMLCustom() {
        let $container = $('<div class="station custom" id="station_' + this._stationId + '"></div>');
        let $header = $('<input id="header_' + this._stationId + '" name="header_' + this._stationId + '" value="' + this._stationHeader + '">');
        let $quote = $('<textarea rows="4" class="station_quote" id="quote_' + this._stationId + '">' + this._stationText + '</textarea>');
        let $link_video = $('<input id="video_url_' + this._stationId + '" name="video_url_' + this._stationId + '" value="' + this._stationVideoURL + '" placeholder="URL to video">');
        let $link_image = $('<input id="image_url_' + this._stationId + '" name="image_url_' + this._stationId + '" value="' + this._stationImageURL + '" placeholder="URL to image">');
        // let $source = $('<div class="document_source"><a href="' + this._stationDocumentSourceURL + '" target="_blank">' + this._stationDocumentSourceTitle + '</a> </div>');
        let $conclusion = $('<textarea rows="4"  id="conclusion_' + this._stationId + '" name="station_conclusion_' + this._stationId + '" placeholder="Conclusion of the station.">' + this._stationConclusion + '</textarea>');
        let $close_button = $('<button class="station_close_button">X</button>');
        $close_button.click(function (ev) {
            console.log(this, ev);
            $(ev.target).parent().remove();
        });
        $container.append($close_button);
        $container.append($header);
        $container.append($quote);
        $container.append($link_video);
        $container.append($link_image);
        // $container.append($source);
        $container.append($conclusion);
        return $container;
    }

    get html() { return this._$html; }

    get stationId() {
        return this._stationId;
    }

    get stationType() {
        return this._stationType;
    }

    get walkTitle() {
        return this._walkTitle;
    }

    get subTitle() {
        return this._subTitle;
    }

    get explanationText() {
        return this._explanationText;
    }

    get conclusionHeader() {
        return this._conclusionHeader;
    }

    get conclusionText() {
        return this._conclusionText;
    }

    get stationHeader() {
        return this._stationHeader;
    }

    get stationText() {
        return this._stationText;
    }

    get stationDocumentSourceTitle() {
        return this._stationDocumentSourceTitle;
    }

    get stationDocumentSourceURL() {
        return this._stationDocumentSourceURL;
    }

    get stationVideoURL() {
        return this._stationVideoURL;
    }

    get stationImageURL() {
        return this._stationImageURL;
    }

    get stationConclusion() {
        return this._stationConclusion;
    }
}