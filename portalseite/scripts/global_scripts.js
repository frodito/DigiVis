/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

function getJsonFileAsObject(jsonFilePath) {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': jsonFilePath,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
}

function cloneObject(original) {
    return Object.assign(Object.create(Object.getPrototypeOf(original)), original);
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] == parameterName) result = decodeURIComponent(tmp[1]);
        });

    return result;
}

function setLanguage() {
    var language = findGetParameter(paramLanguage);

    createLanguageForm();

    if (isEmpty(language)) {
        submitForm("languageForm");
    } else {
        switch (language) {
            case Language.ger:
                constantTexts = constantTextsGerman;
                globalConstantTexts = globalGer;
                break;
            case Language.eng:
                constantTexts = constantTextsEnglish;
                globalConstantTexts = globalEng;
                break;
            default:
                throw new Error("Invalid Language!");
        }
        selectedLanguage = language;
    }
}

var getParams = function (url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

function switchLanguage(language) {
    //if function "writeSessionStorage" exists
    if (typeof writeSessionStorage == 'function') {
        writeSessionStorage();
    }

    var parameters = getParams(window.location);

    if (!isEmpty(parameters)) {
        Object.getOwnPropertyNames(parameters).forEach(function (key) {
            if (key != paramLanguage) {
                $("#languageForm").append('<input name="' + key + '" value="' + parameters[key] + '">');
            }
        });
    }
    /*if(!isEmpty(parameters)){
        var parameterList = getParameterList(parameters);
        for (let i = 1; i < parameterList.length; i++) {
            $("#languageForm").append('<input name="' + parameterList[i].key + '" value="' + parameterList[i].value + '">');
        }
    }*/
    switch (language) {
        case Language.ger:
            getById("languageInput").value = Language.ger;
            submitForm("languageForm");
            break;
        case Language.eng:
            getById("languageInput").value = Language.eng;
            submitForm("languageForm");
            break;
        default:
            throw new Error("Invalid Language!");
    }
}

function buildHomePageLink(language) {
    if (isEmpty(language)) {
        return homepageLink + languageParameter + Language.ger;
    } else {
        return homepageLink + languageParameter + language;
    }
}


function redirectToHomePage() {
    location.href = buildHomePageLink(selectedLanguage);
}

function emptyGetParameters(siteParameters) {
    for (var i in siteParameters) {
        if (findGetParameter(siteParameters[i]) == null) {
            return true;
        }
    }
    return false;
}

function setDisplay(boolean) {
    var display = boolean ? "block" : "none !important";
    for (var i = 1; i < arguments.length; i++) {
        arguments[i].setAttribute("style", "display: " + display);
    }
}

function setVisibility(boolean) {
    var display = boolean ? "visible" : "hidden";
    for (var i = 1; i < arguments.length; i++) {
        arguments[i].setAttribute("style", "visibility: " + display);
    }
}

function getParamForURL(key, value) {
    return "&" + key + "=" + value;
}

function submitForm(formId) {
    document.forms[formId].submit();
}

function isEmpty(element) {
    return element == null || element == "" || element == undefined;
}


function getRandomValue(min, max) {
    return Math.floor(Math.random() * max) + min;
}


function reset() {
    var iframe = getById("top-frame");
    if (window.history.length == 0) {
        window.location.reload();
    }
}

function hideInIFrame(...selectors) {
    if (inIFrame() && callerSameHostname()) {
        selectors.forEach(function (selector) {
            $(selector).hide();
        });
    }
}

function inIFrame() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function callerSameHostname() {
    try {
        return window.location.hostname === window.top.location.hostname;
    } catch (e) {
        return true;
    }
}

function getParameterList(parameters) {
    $parameterList = [];
    if (!isEmpty(parameters)) {
        for (let i = 0; i < parameters.length; i++) {
            $param = findGetParameter(parameters[i]);
            $paramObj = null;
            if (!isEmpty($param)) {
                $paramObj = {key: parameters[i], value: $param};
                $parameterList.push($paramObj);
            }
        }
        return $parameterList;
    }
    return null;
}

function getById(id) {
    return document.getElementById(id);
}

function hidePopups() {
    $('.popup').hide();
}

function setIframeHeightToContentHeight(id) {
    var iframe = getById(id);
    iframe.onload = function () {
        setTimeout(function () {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
            $('#content').css("min-height", (iframe.contentWindow.document.body.scrollHeight + 150) + 'px')
        }, 3000);
    }

}

function checkCompatibility() {

    class TestClass {
        constructor(test) {
        }
    }


    if (TestClass === undefined) {
        this.window.location.href = "incompatible.html";
        throw new Error("Unfortunately your browser is incompatible");
    }

}
