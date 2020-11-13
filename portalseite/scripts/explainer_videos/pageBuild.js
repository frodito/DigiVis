(function () {
    buildPage();
})();

function buildPage() {

    checkCompatibility();

    setLanguage();
    addOverview();
    addOverlay();
    var pageTitle = constantTexts.title;
    createNavigationBar(false, pageTitle);
    $('#collapseToggler').removeClass("d-md-none");
    createFooter("explainer-videos");

    //setOverflowHiddenInIframe();
}

function addOverview() {
    $container = $('<div id="content" class="container mb-5"></div>');

    let rows = [];
    for (var i = 0; i < Object.keys(constantTexts.links).length / 2; i++) {
        $row = $('<div id="row_' + i + '" class="row d-flex justify-content-around p-1"></div>');
        $container.append($row);
        rows.push($row);
    }

    let counter = 0;

    for (let key of Object.keys(constantTexts.links)) {
        constantTexts.links[key].id = counter++;
        $col = $('<div class="col-lg-5 p-1"></div>')
        $card = $(
            '<div id="' + constantTexts.links[key].name + '" ' +
            '   class="card mh-50 mw-50 text-white bg-dark shadow-sm" ' +
            '   style="cursor: pointer;">' +
            '</div>'
        )
        ;
        if (constantTexts.links[key].type === 'video') {
            $card.click(function () {
                $('#videoContent').append(
                    '<div id="videoContainer" class="col-12 col-lg-8 mx-auto">' +
                    '   <video controls="" style="max-height: 75vh; max-width: 100%">' +
                    '       <source src="' + constantTexts.links[key].file + '" type="video/webm">' +
                    '       Sorry, your browser doesn\'t support embedded videos.' +
                    '   </video>' +
                    '</div>'
                );
                $('#' + videoPopup).show();
                $('#' + videoPopup).css("height", $('body').prop("scrollHeight"))
            });
        } else {
            $card.click(function () {
                backToTop();
                $('#videoContent').append(
                    '<iframe id="identity-frame" ' +
                    '       allowtransparency="true" ' +
                    '       class="w-100 noborder" src="' + constantTexts.links[key].file + languageParameter + selectedLanguage + '">' +
                    '</iframe>'
                );
                $('#videoContent').append(document.getElementById("identity-frame").contentWindow.document.getElementById("content"));
                $('#' + videoPopup).show();
                setIframeHeightToContentHeight('identity-frame');
                $('#' + videoPopup).css("height", $('body').prop("scrollHeight"));
            });
        }
        $card_body = $('<div class="card-body"></div>');
        $img = $('<img src="' + constantTexts.links[key].thumbnail + '" class="img-fluid">')
        $text = $('<p class="card-text pt-3 pl-3 pr-3" id="${key}">' + constantTexts.links[key].text + '</p>');
        $card_body.append($img, $text);
        $card.append($card_body);
        $col.append($card);

        let id = "";
        if (constantTexts.links[key].id % 2 == 0) {
            id += constantTexts.links[key].id / 2;
        } else {
            id += (constantTexts.links[key].id - 1) / 2;
        }

        rows[id].append($col);
    }

    $('body').append($container);
}

function addOverlay() {

    $('body').append('<div id="' + videoPopup + '" class="popup"></div>');
    /*$('#' + videoPopup).append('<div id="' + videoPopup + 'Content" class="popup-content row"></div>');*/
    $('#' + videoPopup).append('<div class="row ml-0 mt-2"><span class="ml-auto close" onclick="closeOverlay()"><i class="fas fa-times"></i></span></div>');
    $('#' + videoPopup).append('<div id="videoContent" class="sub-content p-4"></div>');

}

function closeOverlay() {
    $('#videoContent').empty();
    hidePopups();
}
