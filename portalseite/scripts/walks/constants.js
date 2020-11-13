//const jsonFilePath = "json/input.json";
var json = null;
var stations;

const constantTextsGerman = Object.freeze({
    header: "Spaziergänge",
    title: "Titel",
    conclusion: "Konklusion",
    unselectedWalk: "-- Bitte wählen Sie einen Spaziergang aus --",
    selectStation: "Station wählen",
});

const constantTextsEnglish = Object.freeze({
    header: "Walks",
    title: "Title",
    conclusion: "Conclusion",
    unselectedWalk: "-- Please choose a Walk --",
    selectStation: "Select Walk",
});

var constantTexts = constantTextsGerman;

const pageTitle = constantTexts.header;

const walk = 'walk';
const walkTitle = 'walkTitle';
const station = 'station';
const siteParameters = [walk, walkTitle, station];

const arrowLeft = "<i class='fas fa-arrow-left'></i>";
const arrowRight = "<i class='fas fa-arrow-right'></i>";
const walkIcon = "<i class='fas fa-walking'></i>";

const paramWalk = "walk";
const paramWalkTitle = "walkTitle";
const paramStation = "station";
