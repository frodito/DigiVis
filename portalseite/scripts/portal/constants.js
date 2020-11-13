const jsonPath = "json/";

/**
// static variables not yet supported outside Google Chrome

class Level1Data {

    static counter = 0;
    constructor(label) {
        this.id = Level1Data.counter++;
        this.label = label;
    }
}
*/

class Level1Data {

    constructor(id, label) {
        this.id = id;
        this.label = label;
    }
}

class Level2Data {

    constructor(id, superItem, hyperlink, value) {
        this.id = id;
        this._label = "";
        this._detail = "";
        this.superItem = superItem;
        this.hyperlink = hyperlink;
        this.value = value;
    }

    get label() {
        return this._label;
    }

    setLabel(label) {
        this._label = label;
        return this;
    }

    get detail() {
        return this._detail;
    }

    setDetail(detail) {
        this._detail = detail;
        return this;
    }
}

var explainerVideos = new Level2Data(0, 0, "explainer_videos.html", 12.5);
var timeline = new Level2Data(1, 0, "timeline.html", 12.5).setLabel("Timeline");
var viablory = new Level2Data(2, 1, "viablory.html", 8.33).setLabel("Viablory");
var yerkish = new Level2Data(3, 1, "https://dbis-digivis.uibk.ac.at/yerkish/", 8.33).setLabel("Yerkish");
var walks = new Level2Data(4, 1, "spaziergang.html", 8.33);
var lectures = new Level2Data(5, 2, "glasersfeld_videos.html", 12.5);
var fotoStudio = new Level2Data(6, 2, "https://dbis-digivis.uibk.ac.at/fotostudio/", 12.5);
var argMapping = new Level2Data(7, 3, "https://dbis-digivis.uibk.ac.at/straenge/", 12.5).setLabel("Argumentation Mapping");
var texts = new Level2Data(8, 3, "https://dbis-digivis.uibk.ac.at/mediawiki/", 12.5);


const constantTextsGerman = Object.freeze({
    clickText: "Hier klicken!",
    biography: "Biografie",
    glasersfeldBiography:
        "<h3>Ernst von Glasersfeld (1917-2010)<br/> Begründer des Radikalen Konstruktivismus.</h3>" +
        "<p>Ernst von Glasersfeld wurde 1917 in München als österreichischer Staatsbürger geboren und kam bereits in " +
        "seiner Kindheit in Südtirol mit vielen Sprachen in Kontakt – die Faszination für Sprachen und Spracherwerb " +
        "begleiteteihn sein Leben lang. Er studierte kurzzeitig Mathematik in Zürich und Wien, verließ das zunehmend " +
        "antisemitische Österreich aber 1937 in Richtung Australien, wo er als Skilehrer arbeitete, bevor er nach " +
        "Irland auswanderte und dort – mittlerweile staatenlos – eine Landwirtschaft betrieb. </p>" +
        "<p>Nach dem Krieg kehrte er nach Südtirol zurück, arbeitete vorerst als Journalist, und begann schließlich " +
        "1959 für Silvio Ceccato am Zentrum für Kybernetik an der Universität Mailand zu forschen. Anschließend arbeitete " +
        "er in einem von der US Air Force finanzierten Projekt zu maschineller Übersetzung zunächst noch in Italien, " +
        "dann an der University of Georgia in den USA. Erst nach Ende des Projekts begann Glasersfelds akademische Karriere " +
        "im eigentlichen Sinne: Als Professor für Kognitive Psychologie arbeitete er an der University of Georgia vor " +
        "allem zu Primatensprachen (wo er die Sprache Yerkish entwickelte) und begann, seine Theorie des Radikalen " +
        "Konstruktivismus zu formulieren. Er wurde 1987 dort emeritiert und setzte sein Wirken am Scientific " +
        "Reasoning Research Institute in Amherst, Massachusetts fort. </p>" +
        "<p>Ernst von Glasersfeld blieb stets in Kontakt zu Europa bzw. dem deutschsprachigen Raum und erhielt " +
        "dort auch zahlreiche Auszeichnungen und Ehrendoktorate (so auch 2008 an der Universität Innsbruck). " +
        "Er starb 2010 in Leverett (Massachusetts) in den USA.</p>",
    dataLevel1: [
        new Level1Data(0, "Über Glasersfeld"),
        new Level1Data(1, "Lernen"),
        new Level1Data(2, "Multimedia"),
        new Level1Data(3, "Diskursive Strukturen"),
    ],
    dataLevel2: [
        explainerVideos
            .setLabel("Erklärvideos")
            .setDetail("Lernen Sie mehr!"),
        timeline
            .setDetail("Erkunden Sie EvG's Leben"),
        viablory
            .setDetail("Erleben Sie Viabilität!"),
        yerkish
            .setDetail("Sprechen Sie mit dem Affen"),
        walks
            .setLabel("Spaziergänge")
            .setDetail("Guided Walks durch Theorien"),
        lectures
            .setLabel("Glasersfeld Videos")
            .setDetail("Glasersfeld erklärt"),
        fotoStudio
            .setLabel("Foto Studio")
            .setDetail("Ein Blick ins Fotoalbum"),
        argMapping
            .setDetail("Erkunden Sie Argumente"),
        texts
            .setLabel("Textsammlung")
            .setDetail("Suchen Sie Originaltexte"),
    ]
});

const constantTextsEnglish = Object.freeze({
    clickText: "Click here!",
    biography: "Biography",
    glasersfeldBiography:
        "<h3>Ernst von Glasersfeld (1917-2010), founder of radical constructivism</h3>" +
        "<p>Ernst von Glasersfeld was born in Munich in 1917 as an Austrian citizen. " +
        "During his childhood in South Tyrol, he came into contact with many languages – " +
        "this fascination for languages and language acquisition would accompany him throughout " +
        "his life. He studied mathematics for a short while in Zurich and Vienna, but left the " +
        "increasingly anti-Semitic Austria in 1937 for Australia, where he worked as a ski instructor " +
        "before emigrating to Ireland, where he – currently stateless – worked on a farm. </p>" +
        "<p>After the war, he returned to South Tyrol, worked as a journalist for the time being, and " +
        "began working for Silvio Ceccato at the Center for Cybernetics at the University of Milan " +
        "in 1959. He then worked on a project on machine translation financed by the US Air Force, " +
        "first in Italy and then at the University of Georgia in the US. It was only after the end " +
        "of the project that Glasersfeld's academic career in the true sense of the word began: As " +
        "Professor of Cognitive Psychology at the University of Georgia, he worked primarily on " +
        "primate languages (developing the language Yerkish) and began to formulate his theory " +
        "of Radical Constructivism. He retired from this position in 1987 and continued his work " +
        "at the Scientific Reasoning Research Institute in Amherst, Massachusetts. </p>" +
        "<p>Ernst von Glasersfeld remained in constant contact with Europe and the German-speaking world, where " +
        "he received numerous awards and honorary doctorates (including one at the University of " +
        "Innsbruck in 2008). He died in 2010 in Leverett (Massachusetts, US).</p>",
    dataLevel1: [
        new Level1Data(0, "About Glasersfeld"),
        new Level1Data(1, "Learning"),
        new Level1Data(2, "Multimedia"),
        new Level1Data(3, "Discursive Structures"),
    ],
    dataLevel2: [

        cloneObject(explainerVideos)
            .setLabel("Explainer Videos")
            .setDetail("Dive into EvG’s theories!"),
        cloneObject(timeline)
            .setDetail("Explore EvG's life"),
        cloneObject(viablory)
            .setDetail("Experience viability"),
        cloneObject(yerkish)
            .setDetail("Talk with the monkey"),
        cloneObject(walks)
            .setLabel("Walks")
            .setDetail("Create your own exhibitions"),
        cloneObject(lectures)
            .setLabel("Glasersfeld Lectures")
            .setDetail("Search by themes"),
        cloneObject(fotoStudio)
            .setLabel("Photo Studio")
            .setDetail("Discover EvG’s life"),
        cloneObject(argMapping)
            .setDetail("Browse EvG’s argumentations"),
        cloneObject(texts)
            .setLabel("Text Collection")
            .setDetail("Search original texts"),
    ]
});

var constantTexts = constantTextsGerman;

var paramPage = "page";

var projectLinkText = globalGer.projectLinkText;
var backToArchiveLinkText = globalGer.backToArchive;


// pie chart ------------------------------------------------------------------

class Dimension{

    static Landscape(innerRadius, outerRadius, imageSizeFactor, circleTextOffset, offsetLink, dyLink, fontSizeFactor) {
        var dimension = new Dimension();
        dimension.innerRadius = innerRadius;
        dimension.outerRadius = outerRadius;
        dimension.imageSizeFactor = imageSizeFactor;
        dimension.circleTextOffset = circleTextOffset;
        dimension.offsetLink = offsetLink;
        dimension.dyLink = dyLink;
        dimension.fontSizeFactor = fontSizeFactor;
        return dimension;
    }

    static Portrait(fontSizeFactor) {
        var dimension = new Dimension();
        dimension.fontSizeFactor = fontSizeFactor;
        return dimension;
    }
}

const dimensions = Object.freeze({
    landscape: {
        sliderWidth: 25,
        360: Dimension.Landscape(110, 240, 1.5, 40, 70, 35, 0.7),
        640: Dimension.Landscape(130, 290, 1.7, 50, 70, 56, 0.9),
        880: Dimension.Landscape(160, 360, 1.7, 60, 71, 60, 1),
        1620: Dimension.Landscape(280, 580, 1.8, 70, 69, 110, 1.4),
        2160: Dimension.Landscape(350, 680, 1.8, 90, 72, 110, 1.5),
    },
    portrait: {
        sliderWidth: 60,
        menuFontSizeFactor: 2.5,
    }
})

var selectedDimensions;
let sliderWidth = isLandscape ? dimensions.landscape.sliderWidth : dimensions.portrait.sliderWidth;

let innerRadius, outerRadius;

/*
const circleTextOffset = 40;
const circleTitleOffset = 50;

const offsetLink = 70;
const offsetLanguage = 68.5;
const dyLink = 65;
const dyLanguage = 105;*/

let numWordsDetailText = 19;

const frameName = "frameSubPage";

//detailText
let detailTextLeft = 'noneL';
let detailTextRight = 'noneR';
const right = "right";
const left = "left";

//outer rings
let arcBack1, arcBack2, arcBack3, arcBack4, arcBack5, arcBack6;

// colors ----------------------------------------------------------------------

const colorScheme02 = [
    'rgba(242, 13, 13, 0.2)',
    'rgba(242, 119, 13, 0.2)',
    'rgba(242, 225, 13, 0.2)',
    'rgba(192,242,13,0.2)',
    'rgba(48, 242, 13, 0.2)',
    'rgba(13, 242, 189, 0.2)',
    'rgba(13,63,242,0.2)',
    'rgba(154, 13, 242, 0.2)',
    'rgba(242, 13, 225, 0.2)',
];

const colorScheme02Top = [
    'rgba(179,18,29,0.4)',
    'rgba(204,201,0,0.4)',
    'rgba(32,163,25,0.4)',
    'rgba(20,118,153,0.4)'
];

const colorScheme02TopHover = [
    '#b3121d',
    '#ccc900',
    '#20a319',
    '#147699'
];

const colorScheme02Hover = [
    '#b3121d',
    '#d95a16',
    '#cc8f14',
    '#aacc14',
    '#2d991f',
    '#0f9999',
    '#1262b3',
    '#451280',
    '#7e15b3',
];

const backColorHues02 = {
    backColorHue1: 280,
    saturation: '35%',
    brightnessScale: 20
};

var colors = [];
let fontColor, backColorHues;
const backgroundDarkRGBA = "rgba(0,21,30,0.8)";

// image gallery -------------------------------------------------------------------
var imageCounter = 0;
var numImages = 8;
const galleryImageName = "glasersfeld_";
const mediaPhotoFolder = "media/";
const evgPortraitFolder = mediaPhotoFolder + "evg_portraits/";
const imageExtension = ".jpg";
const titleImagePath = evgPortraitFolder + galleryImageName + "0" + imageExtension;


// menu levels ---------------------------------------------------------------------
var topMenu = constantTexts.dataLevel1;
var mainMenu = constantTexts.dataLevel2;
var selectedMenuItem;

class Level{

    constructor(id, clickEvent, mouseoverEvent, mouseoutEvent, innerRadiusFactor, outerRadiusFactor, color) {
        this.id = id;
        this.clickEvent = clickEvent;
        this.mouseoverEvent = mouseoverEvent;
        this.mouseoutEvent = mouseoutEvent;
        this.innerRadiusFactor = innerRadiusFactor;
        this.outerRadiusFactor = outerRadiusFactor;
        this.color = color;
        this._data = [];
    }

    get data(){
        return this._data;
    }

    setData(data){
        this._data = data;
        return this;
    }

    get innerRadius(){
        return this._innerRadius;
    }

    setInnerRadius(innerRadius){
        this._innerRadius = innerRadius;
        return this;
    }

    get outerRadius(){
        return this._outerRadius;
    }

    setOuterRadius(outerRadius){
        this._outerRadius = outerRadius;
        return this;
    }

}

const Levels = Object.freeze({
    level0: new Level(0, null, handleMouseOverPieLevel0, handleMouseOutPieLevel0, 1.35, 1.06, null),
    level1: new Level(1, handleMouseOverPieLevel1, handleMouseOverPieLevel1, setTopLevelVisible, 1.35, 1.06, colorScheme02TopHover),
    level2: new Level(2, null, null, null, 1.41, 1.02, colorScheme02),
    level3: new Level(3, handleMouseClick, handleMouseOverPieLevel2, handleMouseOutPieLevel2, 1.41, 1.02, null),
});
