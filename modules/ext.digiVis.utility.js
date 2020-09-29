/**
 * File contains utility methods.
 */

/**
 * Extract and return base page name of given pagename.
 *
 * @param title
 * @returns {string}
 */

function extractTitle(title) {
    let needle = '';
    if (title.includes('Annotationen:')) {
        needle = 'Annotationen:';
    } else if (title.includes('Text:')) {
        needle = 'Text:';
    } else {
        // should not happen
    }
    let pos_start = title.indexOf(needle);
    let pos_end = title.indexOf("/");
    return title.substring(pos_start + needle.length, pos_end);
}

/**
 * Extracts the URL and creates link to overview page.
 *
 * @param url
 * @returns {string}
 */
function extractUrl(url) {
    let pos_anno = url.indexOf("Annotation:");
    let pos_text = url.indexOf("Text:");
    let pos_anno2 = url.indexOf("Annotationen:");
    let pos_last_slash = url.lastIndexOf("/");
    let url_head = url.substring(0, pos_anno);
    let doc_title = '';
    if (pos_text !== -1) {
        doc_title = url.substring(pos_text + 5, pos_last_slash);
    } else if (pos_anno2 !== -1) {
        doc_title = url.substring(pos_anno2 + 13, pos_last_slash);
    } else {
        console.log("extractUrl error while processing url:", url);
    }
    return url_head + doc_title;
}

/**
 * Translate bracket-symbols used by Semantic Text Annotator into curly and square brackets.
 *
 * @param text
 * @returns {*}
 */
function translateBrackets(text) {
    text = text.replace(/\^/g, "{");
    text = text.replace(/°/g, "}");
    text = text.replace(/Ӷ/g, "[");
    text = text.replace(/Ӻ/g, "]");
    text = text.replace(/&#160;/g, " ");
    return text;
}

/**
 * Replace german umlauts to 2-character representation
 *
 * @param string
 * @returns {*}
 */
function replaceUmlaute(string) {
    string = string.replace(/\u00e4/g, "ae");
    string = string.replace(/\u00fc/g, "ue");
    string = string.replace(/\u00f6/g, "oe");
    return string;
}

/**
 * Helper method to search for values in array holding hierarchical information, where parents are in the array as
 * single entry and children are in the array as PARENTNAME-CHILDNAME.
 *
 * @param haystack
 * @param parentname
 * @param needles
 * @returns {boolean}
 */
function in_array(haystack, parentname, needles) {
    let found = false;
    needles.forEach(function (needle) {
        if (haystack.includes(replaceUmlaute((parentname + '-' + needle).toLowerCase()))) {
            found = true;
        }
    });
    return found;
}

/**
 * Check if given key is the last entry in the given array.
 * @param array
 * @param key
 * @returns {boolean}
 */
function lastElement(array, key) {
    return (Object.is(array.length - 1, key));
}

/**
 * Build hierarchy of checkboxes for the filtering mechanism from the information from the mapping.
 */
function createCheckboxHierarchy() {
    let $root = $('<li></li>');
    let $checkboxAll = assembleCheckboxWithLabel('all', 'all', 'Alle');
    let $childrenAll = $('<ul></ul>');
    Object.keys(mappingData).sort().forEach(function (lv2Cat) {
        let $newLevel = lastElement(mappingData[lv2Cat], lv2Cat) ? $('<li class="last"></li>') : $('<li></li>');
        let lv2key = replaceUmlaute(lv2Cat.toLowerCase());
        $newLevel
            .css('background', Annotation.prototype.catToColor[lv2key])
			.css('border', '1px solid black')
            .css('border-radius', '7px');

        // use white font color for categories with darker colors to make them readable
        if (lv2key === 'LEVEL3CATEGORY1' || lv2key === 'LEVEL2CATEGORY3') {
            $newLevel.css('color', 'white');
        }
        $newLevel.append(assembleCheckboxWithLabel(lv2key, lv2key, lv2Cat));
        let $containerChildren = $('<ul></ul>');
        mappingData[lv2Cat].forEach(function (lv3Cat, lv3Index) {
            let lv3key = Annotation.prototype.mappingNameToKey[lv2Cat][lv3Cat];
            let $child = lastElement(mappingData[lv2Cat], lv3Cat) ? $('<li class="last"></li>') : $('<li></li>');
            $child.append(assembleCheckboxWithLabel(lv3key, lv3key, lv3Cat));
            $containerChildren.append($child);
        });
        $newLevel.append($containerChildren);
        $childrenAll.append($newLevel);
    });
    $root.append($checkboxAll, $childrenAll);
    $('.treeview').append($root);
}

/**
 * Helper method to construct the single checkbox elements in the hierarchy.
 * @param name
 * @param id
 * @param labelText
 * @returns {jQuery|HTMLElement}
 */
function assembleCheckboxWithLabel(name, id, labelText) {
    return $('<input class="checkbox" type="checkbox" name="' + name + '" id="' + id + '" checked><label for="' + id + '" class="custom-checked">' + labelText + '</label>');
}

/**
 * Add data from the annotation to the mappingData container.
 *
 * @param annotation
 */
function fillMappingData(annotation) {
    if (!(annotation.category in mappingData)) {
        mappingData[annotation.category] = new Set();
    }
    annotation.ATTRIBUTE1.forEach(function (attr1) {
        mappingData[annotation.category].add(attr1);
    });
    annotation.ATTRIBUTE2.forEach(function (attr2) {
        mappingData[annotation.category].add(attr2)
    });
    annotation.ATTRIBUTE3.forEach(function (attr3) {
        mappingData[annotation.category].add(attr3);
    });
    annotation.ATTRIBUTE4.forEach(function (attr4) {
        mappingData[annotation.category].add(attr4);
    });
}

/**
 * Functionality adding freetext filter.
 * Uses a timeout such that the filtering is only done after 1 second no change happened.
 */
function handleFreetextFilter() {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        console.log("applying filter");
        let input = document.getElementById('filter_annotation');
        let filter = input.value.toLowerCase();
        if (filter.length > 0) {
            $('.cardOuter').each(function (key, element) {
                let text = $(element).children('.cardInner')[0].innerHTML.toLowerCase();
                if (text.includes(filter) && $(element).is(':visible')) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            });
        } else {
            applyCheckboxSelection();
        }
    }, 1000);
}