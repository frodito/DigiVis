// source from https://www.mediawiki.org/wiki/Manual:Enabling_autocomplete_in_a_form
/**
 * Functions for autocomplete of titles and sites
 * Mainly from from http://jqueryui.com/autocomplete/
 * and resources/mediawiki/mediawiki.searchSuggest.js
 */
(function () {
    'use strict';
    mw.digiVis = mw.digiVis || {};

    console.log("bla in ext.digiVis.file-autocomplete.js");

    mw.digiVis.enableTitleComplete = function ($selector) {
        var group = $($selector).find('input');
        group.autocomplete({
            source: function (request, response) {
                var api = new mw.Api();
                api.get({
                    action: 'opensearch',
                    search: request.term,
                    suggest: '',
                    namespace: 6,
                    profile: 'fuzzy',
                    limit: 500,
                }).done(function (data) {
                    response(data[1]);
                });
            }
        });
    };
}());