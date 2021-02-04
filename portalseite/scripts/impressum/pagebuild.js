/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

(function () {
    buildPage();
})();

function buildPage() {

    checkCompatibility();

    setLanguage();
    createMenu();
    $('#content').attr("class", "d-flex justify-content-center");
    $('#content').append(
        '<div id="impressumText" class="col-lg-8 col-sm-12 my-5 p-5">' +
        constantTexts.impressumText +
        '</div>'
    );
    createFooter("impressum");

}

function createMenu() {
    var page_title = "Impressum";
    createNavigationBar(false, page_title);
    $('#collapsableBlock').remove();
}
