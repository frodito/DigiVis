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

function translateBrackets(text) {
    text = text.replace(/\^/g, "{");
    text = text.replace(/°/g, "}");
    text = text.replace(/Ӷ/g, "[");
    text = text.replace(/Ӻ/g, "]");
    text = text.replace(/&#160;/g, " ");
    return text;
}

function replaceUmlaute(string) {
    string = string.replace(/\u00e4/g, "ae");
    string = string.replace(/\u00fc/g, "ue");
    string = string.replace(/\u00f6/g, "oe");
    return string;
}

function in_array(haystack, parentname, needles) {
    let found = false;
    needles.forEach(function (needle) {
        if (haystack.includes(replaceUmlaute((parentname + '-' + needle).toLowerCase()))) {
            found = true;
        }
    });
    return found;
}

function lastElement(array, key) {
    return (Object.is(array.length - 1, key));
}

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
        if (lv2key === 'beispiel3' || lv2key === 'innovationsdiskurs2') {
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

function assembleCheckboxWithLabel(name, id, labelText) {
    return $('<input class="checkbox" type="checkbox" name="' + name + '" id="' + id + '" checked><label for="' + id + '" class="custom-checked">' + labelText + '</label>');
}

function fillMappingData(annotation) {
    if (!(annotation.category in mappingData)) {
        mappingData[annotation.category] = new Set();
    }
    annotation.topics.forEach(function (topic) {
        mappingData[annotation.category].add(topic);
    });
    annotation.innovationtypes.forEach(function (innovationtype) {
        mappingData[annotation.category].add(innovationtype)
    });
    annotation.narrativetype.forEach(function (narrativetype) {
        mappingData[annotation.category].add(narrativetype);
    });
    annotation.referencetype.forEach(function (referencetype) {
        mappingData[annotation.category].add(referencetype);
    });
}

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