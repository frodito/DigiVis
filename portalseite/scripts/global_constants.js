/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */
const Language = Object.freeze({
    eng: "en",
    ger: "de"
});

const globalGer = Object.freeze({
    projectLinkText: "Projekt DigiVis",
    evgArchiveLinkText: "Ernst von Glasersfeld Archiv",
    evgArchiveLinkTextShort: "EvG Archiv",
    backToArchive: "Zurück zum Glasersfeld Archiv",

});

const globalEng = Object.freeze({
    projectLinkText: "Project DigiVis",
    evgArchiveLinkText: globalGer.evgArchiveLinkText,
    evgArchiveLinkTextShort: globalGer.evgArchiveLinkTextShort,
    backToArchive: "Back to Glasersfeld Archive",
});

var selectedLanguage;
var globalConstantTexts = globalGer;

const paramLanguage = "lg";


//hyperlinks
const homepageLinkFull = 'https://dbis-digivis.uibk.ac.at/portal/portal_evg.html';
const homepageLink = 'portal_evg.html';
const languageParameter = '?lg=';
const impressumHyperlink = 'impressum.html';
const projectHyperlink = 'https://dbis-digivis.uibk.ac.at/mediawiki/index.php/Project_Digivis';
const evgArchiveHyperlink = 'https://www.evg-archive.net/';
const homeIcon = '<img id="logo" style="width: 50px; cursor: pointer" src="media/logo.svg">';
const homeButton =
    '<a id="homeButton" ' +
    '   alt="homeButton" ' +
    '   class="navbar-brand bg-transparent noborder" href="' + homepageLinkFull + '"> ' +
    homeIcon +
    '</a>';


//special texts
const title = "Ernst von Glasersfeld";
const impressumLinkText = "Impressum";


const backgroundDark = '#00151e';
const backgroundNav = '#343a40';

// ratio ------------------------------------------------------------------
let width = window.innerWidth;
let height = window.innerHeight;

const isLandscape = width > height;
const isMobileHighResolution = !isLandscape && width > 812;

// keyboard events --------------------------------------------------------

const KEYCODE_ESC = 27;
const KEYCODE_ENTER = 13;
const KEYCODE_CTRL = 17;
const KEYCODE_PLUS = 43;

