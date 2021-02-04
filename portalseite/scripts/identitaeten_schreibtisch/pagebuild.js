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
    createNavigationBar(false, constantTexts.title);
    createFooter("identity-desktop");

    hideOverlay();


    $('#replayButton').html(constantTexts.replay);

    $('#hoverables').append(
        '<div class="position-absolute discover-text" style="width: 20%; right: 5%; bottom: 5%">' +
        constantTexts.discoverImage +
        '</div>'
    );

    createHoverable('glas', hoverableImagePath + 'glas.png', quotations.glass, 'arrowTopRight');
    createHoverable('blumen', hoverableImagePath + 'blumen.png', quotations.flowers, 'arrowTopCenter');
    createHoverable('brief', hoverableImagePath + 'brief.png', quotations.letter, 'arrowLeftCenter');
    createHoverable('rahmen', hoverableImagePath + 'rahmen.png', quotations.frame, 'arrowTopCenter');
    createHoverable('uhr', hoverableImagePath + 'uhr.png', quotations.clock, 'arrowTopCenter');
    createHoverable('stift', hoverableImagePath + 'stift.png', quotations.pen, 'arrowTopRight');

    if (inIFrame()) {
        $('#nav').remove();
        $('body').addClass("no-background")
        /*var content = $('#content').contents();
        $('body').html(content);*/
    }
}

function createHoverable(id, imageSource, content, arrowClass){
    $('#hoverables').append(
        '   <img id="' + id + '" class="position-absolute" ' +
        '       onmouseover="showText(\'' + id + 'Text\')"' +
        '       onmouseout="hideText(\'' + id + 'Text\')"' +
        '       src="'+imageSource+'">' +
        '   <div id="'+id+'Text" class="'+id+'Text hoverableText text-justify p-2 hidden zitatText '+arrowClass+' " >' +
        '       <i>' + content + '</i>' +
        '   </div>'
    );
}
