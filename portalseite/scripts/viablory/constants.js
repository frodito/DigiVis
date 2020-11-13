const constantTextsGerman = Object.freeze({
    playerNeutral: "Spieler*in",
    player1First: "Spieler*in 1 zuerst",
    player2First: "Spieler*in 2 zuerst",
    randomPlayerFirst: "Zufällige/r Spieler*in zuerst",
    playerFormTitle: "Geben Sie Namen für beide Spieler*innen ein:",
    namePlayer1: "Name Spieler*in 1:",
    namePlayer2: "Name Spieler*in 2:",
    congratulations: "Herzlichen Glückwunsch! :)",
    won: " hat gewonnen!",
    draw: "Unentschieden",
    playAgain: "Erneut spielen",
    describeAgain: "Bilder beschreiben und erneut spielen",
    backToBoard: "Zurück zum Spielfeld",
    restart: "Sind Sie sicher, dass Sie das Spiel neu starten möchten?",
    returnToHomePage: "Sind Sie sicher, dass Sie das Spiel verlassen und zur Projektseite zurückkehren wollen?",
    instructionTitle: "Anleitung",
    instructions: "<h3>Viablory – Auf der Suche nach viablen Beschreibungen und passenden Paaren<\/h3>" +
        "<blockquote><p><cite>„Sagen wir [...] von etwas, daß es „paßt“, so bedeutet das nicht mehr und nicht weniger, " +
        "als daß es den Dienst leistet, den wir und von ihm erhofften.“</cite> (Glasersfeld 1987)<\/p><\/blockquote>" +
        "<p>In diesem Spiel geht es darum, Beschreibungen zu finden, die zu bestimmten Bildern passen.<\/p>" +
        "<p>Zunächst werden Sie gebeten, Bilder zu beschreiben. Ihre Beschreibungen sollten für ein " +
        "Memoryspiel <b>viabel<\/b> sein. Das heißt, es muss immer möglich sein, zu erkennen, ob " +
        "Beschreibung und Bild zueinander gehören. Damit das nicht zu einfach ist, haben wir die Länge " +
        "der beschreibenden Sätze begrenzt<\/p><p>Dann sollen Sie, gemeinsam oder gegen eine\/n " +
        "Mitspieler*in Paare suchen. Hier mischen wir im Spiel Ihre Beschreibungen mit Beschreibungen " +
        "aus unserem Archiv. Oft gibt es nämlich mehr als eine passende oder viable Lösung für ein Problem:" +
        "<p><cite>„Ein Schlüssel „paßt“ wenn er das Schloß aufsperrt. [..] Von den Berufseinbrechern wissen " +
        "wir nur zu gut, daß es eine Menge Schlüssel gibt, die anders geformt sind als unsere, aber " +
        "unsere Türen nichtsdestoweniger aufsperren.“</cite> (Glasersfeld 1987)<\/p><\/p>",
    instructionsModeSelect: "",
    instructionsModeInstructor: "<h3>Seite für Instruktoren</h3>" +
        "<p>In der Vorbereitung beschreiben die Spieler*innen Bilder. " +
        "Um diese Beschreibungen nachbearbeitbar zu machen, werden diese " +
        "mit einem Namen verknüpft, der hier selbst gewählt, oder durch " +
        "klick auf den Button generiert werden kann. Wenn Name im " +
        "Eingabefeld <b>viabel</b> ist, kann dieser Name durch klicken " +
        "auf \"Session erstellen\" gespeichert werden.</p>",
    instructionsModeStudent: "<h3>Wählen Sie einen Sitzungnamen</h3>" +
        "<p>Im Folgenden werden Sie einige Bilder beschreiben. Um diese " +
        "Beschreibungen nachbearbeitbar zu machen, werden diese mit " +
        "einem Namen verknüpft. Wählen oder geben Sie den Sitzungsnamen " +
        "ein und klicken Sie auf \"Sitzung auswählen\".",
    instructionsModeDescribingImages: "<h3>Bitte die Bilder abwechselnd beschreiben</h3>" +
        "<p>Durch klicken auf die Buttons können Sie zwischen den Bildern hin " +
        "und her wechseln. Wenn Sie mit der Beschreibung der Bilder zufrieden " +
        "sind, klicken Sie auf \"Beschreibungen speichern\" um zum Spiel fortzufahren.",
    errorMessages: {
        invalidInput: "Ungültige Eingabe! ",
        playerNameMustContain: "Nur Buchstaben und  Zahlen erlaubt.",
        playerNamesMustNotMatch: "Namen dürfen nicht gleich sein.",
        imageDescriptionMissing: "Bitte alle Bilder beschreiben."
    },
    instructorBtnText: "Spielleiter*innen",
    studentBtnText: "Spieler*innen",
    generateSessionNameButtonText: "Session Name generieren",
    publishSessionNameButtonText: "Session erstellen",
    publishSessionNameSuccess: "Session erfolgreich erstellt",
    publishSessionNameFail: "Fehler beim erstellen der Session",
    selectSessionNameButtonText: "Session auswählen",
    selectSessionNameDefaultOption: "Sessionname auswählen oder selbst eingeben",
    sessionNameSelectionInvalid: "Bitte einen gültigen Eintrag auswählen",
    describePicturesHeader: "Bitte die Bilder jeweils abwechselnd beschreiben",
    describePicturesHeaderStudent1: "Spieler*in 1, bitte beschreibe die Bilder",
    describePicturesHeaderStudent2: "Spieler*in 2, bitte beschreibe die Bilder",
    describePictureTableHeaderImageColumn: "Bilder",
    describePictureTableHeaderTextColumn: "Beschreibungen",
    describePicturePrefix: "Im Bild ist",
    describePictureSuffix: "zu sehen.",
    describePicturePlaceholder: "Gib hier deine Beschreibung des Bildes ein.",
    sendImageDescriptions: "Beschreibungen speichern und zum Spiel fortfahren",
    sendImageDescriptionsStudent1: "Spieler*in 1 , klicke hier um deine Beschreibungen abzuschicken.",
    sendImageDescriptionsStudent2: "Spieler*in 2 , klicke hier um deine Beschreibungen abzuschicken.",
    imageDescriptionsVerify: "Bei klicken auf [Ok] werden die Beschreibungen gespeichert und können nicht mehr geändert werden.",
    image: "Bild",
});

const constantTextsEnglish = Object.freeze({
    playerNeutral: "Player",
    player1First: "Player 1 first",
    player2First: "Player 2 first",
    randomPlayerFirst: "Random Player first",
    playerFormTitle: "Enter player names:",
    namePlayer1: "Name player 1:",
    namePlayer2: "Name player 2:",
    congratulations: "Congratulations! :)",
    won: " won!",
    draw: "It's a draw",
    playAgain: "Play again",
    describeAgain: "Describe images anew and play again",
    backToBoard: "Back to board",
    restart: "Are you sure you want to restart the game?",
    returnToHomePage: "Are you sure you want to leave this page and return to project homepage?",
    instructionTitle: "Instructions",
    instructions: "<h3>Viablory – searching for viable descriptions and fitting pairs<\/h3>" +
        "<blockquote><p><cite>„If we say of something that ‘fits’, this means simply that it provides the service that we " +
        "hoped for it to provide.“<\/cite> (Glasersfeld 1987)<\/p><\/blockquote>" +
        "<p>In this game, the aim is to find descriptions that fit certain images. You will first be asked to describe " +
        "the images.<\/p>" +
        "<p> These descriptions should be <b>viable</b> for a game of Pairs, meaning that it must be possible to determine " +
        "whether an image and a description belong together. To make this a bit more difficult, there isa limit on the " +
        "length of the descriptions.Once the images have been described, you have to find the pairs – alone or against " +
        "an opponent. We will mix your descriptions with some descriptions from our archive, as there is often more than " +
        "one fitting or viable solution to a problem:" +
        "<p><cite>„A key ‘fits’ when it unlocks the lock. [...] We know only too well from professionalburglars that there " +
        "are a lot of keys that are shaped differently than ours, but thatare nevertheless able to unlock " +
        "our doors.“</cite> (Glasersfeld 1987)<\/p><\/p>",
    instructionsModeSelect: "",
    instructionsModeInstructor: "<h3>Instructorpage</h3>" +
        "<p>In the preparation the players describe pictures. To make these " +
        "descriptions editable, they are linked to a name, which can be " +
        "chosen here or generated by clicking on the button. If name is " +
        "<b>viable</b> in the input field, save the sessionname by clicking " +
        "on \"Create session\".",
    instructionsModeStudent: "<h3>Select a session</h3>" +
        "<p>In the following you will describe pictures. To make these " +
        "descriptions editable, they are linked to a name. Select or enter " +
        "the sessionname and click on \"Select session\".",
    errorMessages: {
        invalidInput: "Invalid Input! ",
        playerNameMustContain: "Only letters and numbers are allowed.",
        playerNamesMustNotMatch: "Player names must be different.",
        imageDescriptionMissing: "Please provide descriptions for all images."
    },
    instructorBtnText: "Game Managers",
    studentBtnText: "Players",
    generateSessionNameButtonText: "Generate name for the session",
    publishSessionNameButtonText: "Create session",
    publishSessionNameSuccess: "Session successfully created",
    publishSessionNameFail: "Error when creating the session",
    selectSessionNameButtonText: "Select session",
    selectSessionNameDefaultOption: "Choose or enter one a session name",
    sessionNameSelectionInvalid: "Please choose a valid option",
    describePicturesHeader: "Please take turns to alternately describe the pictures below",
    describePicturesHeaderStudent1: "Player 1, describe the pictures here",
    describePicturesHeaderStudent2: "Player 2, describe the pictures here",
    describePictureTableHeaderImageColumn: "Images",
    describePictureTableHeaderTextColumn: "Descriptions",
    describePicturePrefix: "In the image you see",
    describePictureSuffix: ".",
    describePicturePlaceholder: "Enter your description of the image here.",
    sendImageDescriptions: "Save descriptions and continue to the game",
    sendImageDescriptionsStudent1: "Player 1, click here to submit your descriptions",
    sendImageDescriptionsStudent2: "Player 2, click here to submit your descriptions",
    imageDescriptionsVerify: "Descriptions will be saved and cannot be changed when clicking on [Ok].",
    image: "Image",
});


var constantTexts = constantTextsGerman;

const pageTitle = "Viablory";

const paramPlayer1 = 'p1';
const paramPlayer2 = 'p2';
const paramMode = 'mode';
const paramStartNumber = 's';
const siteParameters = [paramPlayer1, paramPlayer2, paramMode, paramStartNumber];

const Mode = Object.freeze({
    instructor: "instructor",
    selectSession: "selectSession",
    // student1: "student1",
    // student2: "student2",
    describing: "describing",
    start: "start",
    play: "play"
})
var selectedMode;

const Movement = Object.freeze({
    forward: "forward",
    backward: "backward"
})

// main ----------------------------------------------------------

const reloadButton = "<i class='fas fa-redo'></i>";
const helpSymbol = "<i class='fas fa-question'></i>";
const backButton = "<i class='fas fa-arrow-left'></i>";

const footer = document.querySelector("footer");

// const jsonFilePath = "json/input.json";
// const json = getJsonFileAsObject(jsonFilePath);
// const pairs = json.pairs;
var pairs = {};

const maxNumFields = 20;
var columns = 5;
var rows = maxNumFields / columns;

if(window.innerWidth < window.innerHeight){
    var tmp = columns;
    columns = rows;
    rows = tmp;
}

var numFields;

var selectedPairs = [];
// var pairListForRandom = copyArray(selectedPairs);
const heightFactor = inIFrame() && callerSameHostname() ? 78 : 58;
const imageMaxWidth = (width - 30) / columns - 21;
const imageMaxHeight = (height - 70) / rows - heightFactor;

const fieldStyle = "width: " + (imageMaxWidth) + "px; min-height: " + (imageMaxHeight) + "px;";

var player1Name;
var player2Name;

var pointsPlayer1 = 0;
var pointsPlayer2 = 0;

var matchMap = new Map();

var amountImages = 2;
var currentViablorySessions = [];
var selectedSessionName = "";
var viabloryDescriptionPagenamePrefix = "ViabloryDescription:";
var viabloryImages;
var viabloryImageKeysShuffled = [];
var viabloryImageDescriptionsNew = {};

const urlAPIBase = 'https://dbis-digivis.uibk.ac.at/mediawiki/api.php';
const origin = '&origin=*';     // needed for CORS

// colors --------------------------------------------------------

const reddishStrong = [
    '#7e15b3',
    '#b3121d',
    '#d95a16',
    '#cc8f14',
];

const blueishStrong = [
    '#2d991f',
    '#0f9999',
    '#1262b3',
    '#451280',
];

const reddishSoft = [
    'rgba(250,123,221,0.6)',
    'rgba(242,110,115,0.6)',
    'rgba(242,165,104,0.6)',
    'rgba(242,241,157,0.6)',
];

const blueishSoft = [
    'rgba(164, 240, 150, 0.6)',
    'rgba(160, 240, 221, 0.6)',
    'rgba(122,136,240,0.6)',
    'rgba(213, 163, 240, 0.6)',
];

const colorIndex = getRandomValue(0, 3);

const player1ColorStrong = reddishStrong[colorIndex];
const player2ColorStrong = blueishStrong[colorIndex];

const player1ColorSoft = reddishSoft[colorIndex];
const player2ColorSoft = blueishSoft[colorIndex];

const player1ColorCorrect = reddishSoft[colorIndex];
const player2ColorCorrect = blueishSoft[colorIndex];

//popup  --------------------------------------------------------

const detailPopup = "detailPopupWindow";
const decisionPopup = "decisionPopupWindow";
const helpPopup = "helpPopupWindow";


//game --------------------------------------------------------

var correctPairsList = new Map();
var clickCoutner = 0;
var clickedField = null;

var turn = 0;
var waiting = false;
var waitingTime = 2000;
var timeout;



// regex ---------------------------------------------------------------

const REGEX_PLAYER_NAMES = new RegExp("^[ÄäÖöÜüßA-Za-z0-9_]+$");
