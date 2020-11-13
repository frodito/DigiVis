function createContent() {
    if (!$('#content').length) {
        $('body').append('<div id="content"></div>');
    }
}

function setOverflowHiddenInIframe() {
    if(inIFrame() && callerSameHostname()){
        $('body').css("overflow", "hidden");
    }
}

function createLanguageForm() {
    if (!$('#languageForm').length) {
        $('body').append(
            '<form id="languageForm" name="languageForm" method="get" style="display: none">' +
            '   <input id="languageInput" name="lg" value="' + Language.ger + '">' +
            '</form>'
        );
    }
}

function backToTop() {

    $("html, body").stop().animate({scrollTop: 0}, 1000, 'swing');
}

function createNavigationBar(collapsable, page_title) {

    page_title = isEmpty(page_title) ? 'Home' : page_title;

    createContent();

    $('nav').remove();
    $('<nav id="nav" class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark my-3" style="font-size: 1.2em"></nav>').insertBefore("#content");

    $('#nav').append(
        homeButton +
        '<div id="notCollapsableBlock" class="ml-2" style="z-index: 1450">' +
        '   <div id="home" class="nav-item active pt-2"></div>' +
        '</div>'
    );

    $('#homeButton').attr("href", buildHomePageLink(selectedLanguage));

    $('#nav').append(
        '<button id="collapseToggler"' +
        '   class="navbar-toggler ' + (collapsable ? "" : "invisible") + '" ' +
        '   type="button" ' +
        '   data-toggle="collapse" ' +
        '   data-target="#menuButtons" ' +
        '   aria-controls="menuButtons" ' +
        '   aria-expanded="false" ' +
        '   aria-label="Toggle navigation">' +
        '    <span class="navbar-toggler-icon"></span>' +
        '</button>' +
        '  <div id="menuButtons" class="' + (collapsable ? "collapse navbar-collapse" : "d-none") + '">' +
        '    <ul id="menuListItems" class="navbar-nav ml-auto mt-2 mt-lg-0 helvetica">' +
        '    </ul>' +
        '  </div>' +
        '</div>'
    );


    $('#home').append('<a class="nav-link mr-3 pl-0" href="' + window.self.location.href.split('?')[0] + '"><h2 class="pageTitle">' + page_title + '</h2></a>');


    if (!isEmpty(page_title)) {
        $('#navRow').append('<div id="navTitle" class="col-10 py-2 text-center"></div>');
        $('#navTitle').append('<h1>' + page_title + '</h1>');
    }

    if (inIFrame() && callerSameHostname()) {
        $('#nav').attr("style", "margin-top: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important");
        setVisibility(false, document.getElementById("homeButton"));
        $('#collapseToggler').addClass("d-inline-block d-md-none");
    }

    if (!isLandscape) {
        $('#nav').removeClass("navbar-expand-lg");
    }
}

function createFooter(id) {

    $('footer').remove();

    $('body').append(
        '<footer id="' + id + '" class="footer" style="z-index: 2000">' +
        '<div class="container-fluid mb-2 footerContent">' +
        '<div id="footerRow" class="row d-flex justify-content-around"></div>' +
        '</div>' +
        '</footer>');

    $('#footerRow').append(
        '<div id="project-homepage" class="page-footer text-center py-1 col-12 col-sm-3 footerLink">' +
        '<a href="' + projectHyperlink + '" alt="project-homepage" class="text-white my-1 bg-transparent border-0">' + globalConstantTexts.projectLinkText + '</a>' +
        '</div>'
    );
    $('#footerRow').append(
        '<div id="evg-archive" class="page-footer text-center py-1 col-12 col-sm-3 footerLink">' +
        '<a href="' + evgArchiveHyperlink + '" alt="evg-archive" class="text-white my-1 bg-transparent border-0">' + globalConstantTexts.evgArchiveLinkText + '</a>' +
        '</div>'
    );
    $('#footerRow').append(
        '<div id="impressum" class="page-footer text-center py-1 col-12 col-sm-3 footerLink">' +
        '<a href="' + impressumHyperlink + '" alt="impressum" class="text-white my-1 bg-transparent border-0">' + impressumLinkText + '</a>' +
        '</div>'
    );
    $('#footerRow').append(
        '<div id="languageSelector" class="text-center col-12 col-sm-3">' +
        '<button id="germanButton" class="text-white my-1 bg-transparent border-0" style="cursor:pointer" onclick="switchLanguage(Language.ger)">' + Language.ger + '</button>' +
        '<span class="footerLink"> | </span>' +
        '<button id="englishButton" class="text-white my-1 bg-transparent border-0" style="cursor:pointer" onclick="switchLanguage(Language.eng)">' + Language.eng + '</button>' +
        '</div>'
    );

    hideInIFrame('#' + id);

}
