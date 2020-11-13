

function buildPage() {

    checkCompatibility();

    setLanguage();
    topMenu = constantTexts.dataLevel1;
    mainMenu = constantTexts.dataLevel2;

    d3.select("svg").remove();
    $("#main").remove();
    width = window.innerWidth;
    height = window.innerHeight;
    colors = colorScheme02;
    backColorHues = backColorHues02;

    let svg = d3.select("body").append("svg")
        .attr("id", "pieChart")
        .style("position", "absolute");

    let defs = d3.select('#pieChart').append('svg:defs');

    var browserZoomLevel = Math.round(window.devicePixelRatio * 100);

    if (isLandscape) {

        if (height <= 640) {
            selectedDimensions = dimensions.landscape["360"];
            numWordsDetailText = 15;
            console.log(360)
        } else if (height <= 880) {
            selectedDimensions = dimensions.landscape["640"];
            console.log(640)
        } else if (height < 1620) {
            selectedDimensions = dimensions.landscape["880"];
            console.log(880)
        } else if (height < 2160) {
            selectedDimensions = dimensions.landscape["1620"];
            console.log(1620);
        } else {
            selectedDimensions = dimensions.landscape["2160"];
            console.log(2160);
        }
        buildLandscapeLayout();


        $('.menuLevel2, .menuLevel1, .externalLink, p, h2, h3, #sliderArrow, .glasersfeldTitle, .glasersfeldSubTitle, #clickText').each(function () {
            var size = $(this).css("font-size").replace("px", "").replace("rem", "").replace("em", "");
            $(this).attr("style", "font-size: " + (+size * selectedDimensions.fontSizeFactor) + "px !important");
        });

    } else {
        buildPortraitLayout();
    }


    var defaultFontSize = $('body').css("font-size").replace("px", "");
    if (browserZoomLevel > 100) {
        $('.menuLevel2').each(function () {
            $(this).css("font-size", defaultFontSize - ((browserZoomLevel - 100) / 200) + "px");
        });
    }
}

function buildLandscapeLayout() {

    innerRadius = selectedDimensions.innerRadius;
    outerRadius = selectedDimensions.outerRadius;

    setData();

    buildBackground();
    createImageGallery();
    createTitle();

    $('nav').remove();
    $('#navSeparator').remove();
    $('footer').remove();

    buildPieChart(Levels.level0);
    buildPieChart(Levels.level2);
    buildPieChart(Levels.level3);
    buildPieChart(Levels.level1);
    createLinks();
    buildInfoSlider();
}

function buildPortraitLayout() {

    //buildBackground();
    //createTitle();

    $('body').addClass("background-portrait");

    $('#pieChart').remove();
    $('#content').remove();

    createMenu();
    createImageGallery();
    buildInfoSlider();
    createFooter("main");
    $('footer').addClass("portrait-layout");
}

function buildSubPage() {

    checkCompatibility();

    setLanguage();
    if (!isValidPageParam()) {
        redirectToHomePage();
    }

    topMenu = constantTexts.dataLevel1;
    mainMenu = constantTexts.dataLevel2;
    selectedMenuItem = mainMenu[findGetParameter(paramPage)];

    colors = colorScheme02;
    backColorHues = backColorHues02;
    d3.select("svg").remove();

    createMenu();
    $('#content').remove();

    $('body').append(
        '<iframe id="top-frame"' +
        '        name="frameSubPage"' +
        '        src="#"' +
        '        width="100%"' +
        '        style="min-height: 85%"' +
        '        frameborder="0"></iframe>'
    );

    createFooter("main");
    setIframe();

}

function buildInfoSlider() {

    if (isLandscape) {

        $('#infoSlider').remove();
        $('body').append(
            '<div id="infoSlider" class="info-slider" style="z-index: 1500;">' +
            '   <div id="infoText" ' +
            '           class="h-100 position-fixed bg-dark p-4 info-text text-left" ' +
            '           style="width: ' + sliderWidth + '%; margin-left: -' + sliderWidth + '%; direction: rtl">' +
            // '           style="width: ' + sliderWidth + '%; margin-left: -' + sliderWidth + '%; direction: ltr">' +
            '       <div class="m-xl-3">' +
            '           <h2 class="text-left">' + constantTexts.biography + '</h2>' +
            '           <div class="helvetica" style="direction: ltr">' +
            constantTexts.glasersfeldBiography +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '   <div id="infoCollapse" ' +
            '           class="h-100 position-fixed bg-dark row float-right info-collapse-bar" ' +
            '           style="left: ' + 0 + '; width: 5%">' +
            '      <div class="ml-auto align-self-center pr-2">' +
            '          <a class="btn noborder bg-transparent text-white ml-2" ' +
            '               onclick="collapseSlider()" ' +
            '               href="javascript:void(0);">' +
            '              <i id="sliderArrow" class="fas fa-angle-right"></i>' +
            '          </a>' +
            '      </div>' +
            '   </div>' +
            '</div>'
        );

        if (sessionStorage.getItem("sliderAlreadySeen") != "true") {
            setTimeout(function () {
                openSlider();
                sessionStorage.setItem("sliderAlreadySeen", "true");
            }, 500);
        }
    } else {

        $('#content').append(
            '<div class="m-2 m-sm-5 p-3 p-sm-5 rounded-borders" style="background-color: ' + backgroundDarkRGBA + '">' +
            '   <h2 class="text-left ">' +
            constantTexts.biography +
            '   </h2>' +
            '   <div class="helvetica">' +
            constantTexts.glasersfeldBiography +
            '   </div>' +
            '</div>'
        );
    }
}

function createMenu() {

    createNavigationBar(true, title);
    var styles = $('#nav').attr("style");
    $('#nav').attr("style",
        "margin-bottom: -1px !important; " +
        "padding-bottom: 0.5rem; " +
        styles);

    $('#navSeparator').remove();
    $('<div id="navSeparator" ' +
        'class="col-10 align-self-center m-auto" ' +
        'style="z-index: 1005; box-shadow: 0 1px 20px 0 #fff; top: -1px">'
    ).insertAfter('nav');


    for (var i = 0; i < topMenu.length; i++) {
        $('#menuListItems').append(
            '<li class="nav-item dropdown">' +
            '<div class="nav-link dropdown">' +
            '  <button id="topItem' + i + '"' +
            '           class="menuTopItem btn btn-secondary dropdown-toggle w-100 text-right" ' +
            '           onmouseover="itemOnMouseover(\'topItem\', ' + i + ', 1)"' +
            '           onmouseout="itemOnMouseout(\'topItem\', ' + i + ', 1)"' +
            '           style="padding: 0.7em; background-color: ' + colorScheme02Top[i] + '"' +
            '           type="button" id="dropdownMenuButton' + i + '" ' +
            '           data-toggle="dropdown" ' +
            '           aria-haspopup="true" ' +
            '           aria-expanded="false">' +
            topMenu[i].label +
            '  </button>' +
            '  <div id="dropdown' + i + '" ' +
            '       class="dropdown-menu" ' +
            '       style="background: ' + backgroundNav + '"' +
            '       aria-labelledby="dropdownMenuButton' + i + '">'
        );
        for (var j = 0; j < mainMenu.length; j++) {
            if (topMenu[i].id === mainMenu[j].superItem) {
                $('#dropdown' + i).append(
                    '<button id="item' + j + '"' +
                    '       class="dropdown-item" ' +
                    '       onclick="changeIframe(' + j + ');"' +
                    '       onmouseover="itemOnMouseover(\'item\', ' + j + ', 2)"' +
                    '       onmouseout="itemOnMouseout(\'item\', ' + j + ', 2)"' +
                    '       style="padding: 0.7em; cursor: pointer; margin-bottom: 5px; background-color: ' + colorScheme02[j] + '">' +
                    mainMenu[j].label +
                    '</button>'
                );
                if (selectedMenuItem === mainMenu[j]) {
                    $('#topItem' + i).css("background-color", colorScheme02TopHover[i]);
                    $('#item' + j).css("background-color", colorScheme02Hover[j]);
                }
            } else if (topMenu[i].id < mainMenu[j].superItem) {
                $('#item' + (j - 1)).css("margin-bottom", 0);
                break;
            }
        }

        $('#menuListItems').append(
            '  </div>' +
            '</div>' +
            '</li>'
        );
    }


}

function buildArc(innerR, outerR) {
    return d3.arc()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .padAngle(.2)
        .padRadius(100)
        .cornerRadius(15);
}

function buildOuterRing(id, data, arcElement) {

    var rotation = id == 1 ? 0 : id * 10;
    return d3.select("#pieChart").append("g")
        .attr("id", "backChart" + id)
        .attr("class", "back")
        .selectAll("arcBack" + id)
        .data(data)
        .enter()
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + rotation + ")")
        .attr("id", function (d, i) {
            return "back" + id + "_" + i
        })
        .attr("class", "arcBack" + id)
        .append("path")
        .style("fill", "transparent")
        .attr("stroke-width", 2)
        .attr("stroke", function (d, i) {
            var pathColor = d3.color(backColor(i, id));
            data.color = pathColor;
            return pathColor;
        })
        .attr("d", arcElement)
        .attr("id", function (d, i) {
            return "back" + id + "_" + i
        });
}

function getPathDataTitle() {
    var r = innerRadius * 0.8;
    var startX = width / 2 - r;
    return 'M' + startX + ',' + (height / 2) + ' ' + 'a' + r + ',' + r + ' 0 0, 1 ' + (2 * r) + ',0';
}

function getPathDataSubTitle() {
    var r = innerRadius * 0.8;
    var arc = d3.arc()
        .innerRadius(r)
        .outerRadius(r)
        .startAngle(1.5 * Math.PI)
        .endAngle(0.5 * Math.PI);
    return arc;
}

function buildBackground() {

    arcBack2 = buildArc(outerRadius * 1.7, outerRadius * 2.1);
    arcBack3 = buildArc(outerRadius * 2.2, outerRadius * 2.6);
    arcBack4 = buildArc(outerRadius * 2.7, outerRadius * 3.1);
    arcBack5 = buildArc(outerRadius * 3.2, outerRadius * 3.6);
    arcBack6 = buildArc(outerRadius * 3.7, outerRadius * 4.1);

    let back6 = buildOuterRing(6, d3.pie()(getArrayWithSize(40)), arcBack6);
    let back5 = buildOuterRing(5, d3.pie()(getArrayWithSize(30)), arcBack5);
    let back4 = buildOuterRing(4, d3.pie()(getArrayWithSize(24)), arcBack4);
    let back3 = buildOuterRing(3, d3.pie()(getArrayWithSize(18)), arcBack3);
    let back2 = buildOuterRing(2, d3.pie()(getArrayWithSize(12)), arcBack2);
}

function buildPieChart(level) {

    let data = level.data;
    let numberOptions = data.length;
    let arcs, arc, svg, g;

    let isInvisible = isEmpty(level.color);

    arcs = d3.pie()
        .sort(null)
        .value(function (d) {
            if (!isEmpty(d.value)) {
                return d.value;
            }
            return 10;
        })(data);

    var inner = selectedDimensions.innerRadius * level.innerRadiusFactor;
    var outer = selectedDimensions.outerRadius * level.outerRadiusFactor;
    arc = buildArc(inner, outer);

    svg = d3.select("svg");

    svg = d3.select("body").select("#pieChart")
        .append("g")
        .attr("id", "chart_" + level.id)
        .attr("class", "menu")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    g = svg.selectAll("arc")
        .data(arcs)
        .enter()
        .append("g")
        .attr("class", "level" + level.id + " arc" + (level.id == Levels.level1.id ? " topmenu" : ""))
        .style("cursor", "pointer")
        .attr("id", function (d, i) {
            return "option_" + level.id + "_" + i
        })
        .on("click", level.clickEvent)
        .on("mouseover", level.mouseoverEvent)
        .on("touchstart", level.mouseoverEvent)
        .on("mouseout", level.mouseoutEvent);


    let menu = g.append("path")
        .style("fill", function (d, i) {
            return isInvisible ? 'transparent' : level.color[i]
        })
        .attr("d", arc)
        .attr("id", function (d, i) {
            return "option_" + i
        });

    if (!isInvisible) {
        let menuText = g.append("text")
            .filter(function (d) {
                return !(d.data.label.toString().includes(" "))
            })
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .text(function (d) {
                return d.data.label;
            })
            .attr("class", "menuText menuLevel" + level.id);


        let menuTextMultiline = g.append("text")
            .filter(function (d) {
                return d.data.label.toString().includes(" ")
            })
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("class", "menuText menuLevel" + level.id)
            .append("tspan")
            .attr("x", '5')
            .attr("y", '0')
            .text(function (d) {
                return d.data.label.toString().split(" ")[0]
            })
            .append("tspan")
            .attr("x", '5')
            .attr("y", '25')
            .text(function (d) {
                return d.data.label.toString().split(" ")[1]
            });

    }
}

function createImageGallery() {
    if (isLandscape) {

        let svg = d3.select("svg");
        let defs = d3.select("defs");

        var imageSize = innerRadius * selectedDimensions.imageSizeFactor;
        var centerImageFactor = innerRadius * selectedDimensions.imageSizeFactor / 2;

        imageSize = imageSize > width ? width * 0.7 :
            imageSize > height ? height * 0.7 : imageSize;
        centerImageFactor = imageSize / 2;

        defs.append("pattern")
            .attr("id", "glasersFeldArchivImage")
            .attr('patternUnits', 'objectBoundingBox')
            .attr("width", 1)
            .attr("height", 1)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .append("image")
            .attr("id", "thumbnailImage")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", imageSize)
            .attr("height", imageSize)
            //photo must be quadratic
            .attr("preserveAspectRatio", "xMidYMin")
            .attr("xlink:href", titleImagePath);


        let circleImage = d3.select("body").select("#pieChart")
            .append("circle")
            .attr("r", centerImageFactor)
            .attr("id", "circle")
            .style("cursor", "pointer")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .style("fill", "white")
            .style("fill", "url(#glasersFeldArchivImage)");

        circleImage.on("click", clickImageGallery);

    } else {
        var size = width * 0.65;

        $('#imageGallery').remove();

        $('#content').append(
            '<div id="imageGallery" class="d-flex align-items-center justify-content-center row ml-0"' +
            '       style="margin-top: 90px;" >' +
            '       <div class="rounded-circle bg-dark" ' +
            '           onclick="clickImageGallery()"' +
            '           style="width: ' + size + 'px; height: ' + size + 'px; max-width: 400px; max-height: 400px">' +
            '           <img id="galleryImage" src="' + titleImagePath + '" class="rounded-circle w-100">' +
            '       </div>' +
            '       <div id="clickText" class="col-12 text-center" ' +
            '           onclick="clickImageGallery()"' +
            '           style="cursor: pointer; margin-top: -100px">' +
            constantTexts.clickText +
            '       </div>' +
            '</div>'
        );
    }
}

function createTitle() {
    let svg = d3.select("svg");
    let defs = d3.select("defs");

    //Title
    defs.append('path')
        .attr("d", getPathDataTitle())
        .attr("id", 'circlePath');

    svg.append('text')
        .attr("id", "title")
        .attr("dy", -selectedDimensions.circleTextOffset + 20)
        .append('textPath')
        .attr("class", "glasersfeldTitle")
        .attr("startOffset", '50%')
        .attr('xlink:href', '#circlePath')
        .text(title);

    //Subtitle
    defs.append('path')
        .attr("d", getPathDataSubTitle())
        .attr("id", 'circlePathSubTitle')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append('text')
        .attr("id", "subtitle")
        .attr("dy", selectedDimensions.circleTextOffset)
        .append('textPath')
        .attr("class", "glasersfeldSubTitle")
        .attr("startOffset", '25%')
        .attr('xlink:href', '#circlePathSubTitle');

    svg.append('text')
        .attr("id", "clickText")
        .attr("dy", selectedDimensions.circleTextOffset - 60)
        .style("cursor", "pointer")
        .on("click", clickImageGallery)
        .append('textPath')
        .attr("class", "clickText")
        .attr("startOffset", '25%')
        .attr('xlink:href', '#circlePathSubTitle')
        .text(constantTexts.clickText);

}

function createLinks() {

    arcBack1 = buildArc(outerRadius * 1.2, outerRadius * 1.6);

    var back1Pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        })(getBack1Array());
    let back1 = buildOuterRing(1, back1Pie, arcBack1);


    let svg = d3.select("svg");
    let defs = d3.select("defs");

    //Project and Archive links
    defs.append('path')
        .attr("d", getPathOfElement("#back1_5"))
        .attr("id", 'weblinksPath')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var weblinks = svg.append("g")
        .attr("id", "weblinks");

    var projectText = weblinks.append('text')
        .attr("id", "projectText")
        .attr("dy", selectedDimensions.dyLink - 5)
        .append("a")
        .attr('xlink:href', projectHyperlink)
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink - 8.5 + '%')
        .attr('xlink:href', '#weblinksPath')
        .text(globalConstantTexts.projectLinkText);

    var archive = weblinks.append('text')
        .attr("id", "archiveLink")
        .attr("dy", selectedDimensions.dyLink + 40)
        .append("a")
        .attr('xlink:href', evgArchiveHyperlink)
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink - 7.5 + '%')
        .attr('xlink:href', '#weblinksPath')
        .text(globalConstantTexts.evgArchiveLinkTextShort);

    //Impressum and Language
    defs.append('path')
        .attr("d", getPathOfElement("#back1_3"))
        .attr("id", 'impressumAndLanguagePath')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var impressumAndLanguage = svg.append("g")
        .attr("id", "impressumAndLanguageLink");

    var impressum = impressumAndLanguage.append('text')
        .attr("id", "impressumText")
        .attr("dy", selectedDimensions.dyLink - 5)
        .append("a")
        .attr('xlink:href', impressumHyperlink + languageParameter + selectedLanguage)
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink - 5 + '%')
        .attr('xlink:href', '#impressumAndLanguagePath')
        .text(impressumLinkText);

    let de = impressumAndLanguage.append("text")
        .attr("id", "linkDE")
        .attr("dy", selectedDimensions.dyLink + 40)
        .style("cursor", "pointer")
        .on("click", function () {
            switchLanguage(Language.ger);
        })
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink - 4.5 + '%')
        .attr('xlink:href', '#impressumAndLanguagePath')
        .text(Language.ger);
    impressumAndLanguage.append("text")
        .attr("id", "gap")
        .attr("dy", selectedDimensions.dyLink + 40)
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink + '%')
        .attr('xlink:href', '#impressumAndLanguagePath')
        .text(" | ");
    let en = impressumAndLanguage.append("text")
        .attr("id", "linkEN")
        .attr("dy", selectedDimensions.dyLink + 40)
        .style("cursor", "pointer")
        .on("click", function () {
            switchLanguage(Language.eng);
        })
        .append('textPath')
        .attr("class", "externalLink")
        .attr("startOffset", selectedDimensions.offsetLink + 3.5 + '%')
        .attr('xlink:href', '#impressumAndLanguagePath')
        .text(Language.eng);

}


