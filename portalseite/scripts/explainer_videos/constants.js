
const videoPopup = "videoPopup";
const videoBasePath = "media/explainer_videos/";

const LinkType = Object.freeze({
   video: "video",
   html: "html"
});

class Link{
    constructor(name, type, file, thumbnail) {
        this.name = name;
        this.type = type;
        this.file = file;
        this.thumbnail = thumbnail;
    }

    get text(){
        return this._text;
    }

    setText(text){
        this._text = text;
        return this;
    }
}

var evg = new Link("Ernst_von_Glasersfeld", LinkType.video, videoBasePath+"ErnstvonGlasersfeld_2020-02-19.webm", videoBasePath+"ErnstvonGlasersfeld_2020-02-19.png");
var constructivism = new Link("Constrictivism", LinkType.video, videoBasePath+"RadikalerKonstruktivismus_2020-2-19.webm", videoBasePath+"RadikalerKonstruktivismus_2020-2-19.png");
var identity = new Link("Identity", LinkType.html, "identitaetsschreibtisch.html", videoBasePath+"standbild_overlay.jpg");

const constantTextsGerman = Object.freeze({
    title: 'Erkl&auml;rvideos',
    links: {
        evg: evg.setText("Erfahre etwas &uuml;ber das Leben von Ernst von Glasersfeld"),
        const: constructivism.setText("Erfahre, was es mit dem Radikalen Konstruktivismus auf sich hat"),
        identity: identity.setText("Identit&auml;tenschreibtisch")
    }
});

const constantTextsEnglish = Object.freeze({
    title: 'Explainer Videos',
    links: {
        evg: cloneObject(evg).setText("Learn about the life of Ernst von Glasersfeld"),
        const: cloneObject(constructivism).setText("Learn what radical constructivism is about"),
        identity: cloneObject(identity).setText("Identity desk")
    }
});

var constantTexts = constantTextsGerman;



