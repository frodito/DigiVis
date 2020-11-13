function setTopLevelVisible() {

    setTimeout(function () {
        if ($('.hovered').length == 0) {
            d3.selectAll('.topmenu')
                .transition()
                .duration(500)
                .style("display", "block")
                .style("opacity", "1");

            d3.select("#subtitle").select("textPath").text("");
        }
    }, 1)
}

function handleMouseOverPieLevel0(d, i) {
    d3.select(this)
        .classed("hovered", true);
}

function handleMouseOutPieLevel0(d, i) {
    d3.select(this)
        .classed("hovered", false);

    setTopLevelVisible();
}

function handleMouseOverPieLevel1(d, i) {

    d3.selectAll('.level1')
        .style("display", "block")
        .transition()
        .duration(500)
        .style("opacity", "1");

    d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", "0")
        .transition()
        .duration(500)
        .style("display", "none");

    d3.select("#subtitle").select("textPath").text(d.data.label);

}

function handleMouseOutPieLevel1(d, i) {

    d3.select('.hovered')
        .classed("hovered", false);
    setTopLevelVisible();
}

function handleMouseOverPieLevel2(d, i) {

    d3.selectAll('this, #option_2_' + i)
        .transition()
        .duration(250)
        .attr("transform", "scale(1.06)");

    d3.selectAll('this, #option_2_' + i)
        .classed("hovered", true);

    d3.select('#option_2_' + i).select("path")
        .transition()
        .duration(250)
        .style("fill", colorScheme02Hover[i]);

    //show detail Text
    d3.select("#subtitle").select("textPath").text(d.data.detail);

}

function handleMouseOutPieLevel2(d, i) {


    d3.selectAll('this, #option_2_' + i)
        .transition()
        .duration(500)
        .attr("transform", "scale(1)");

    d3.select('#option_2_' + i).select("path")
        .transition()
        .duration(250)
        .style("fill", colorScheme02[i]);

    currentArcColor = null;

    //hide detail Text
    d3.select("#subtitle").select("textPath").text("");

    d3.selectAll('this, #option_2_' + i)
        .classed("hovered", false);

    setTopLevelVisible();
}

function clickImageGallery() {
    imageCounter = imageCounter < (numImages - 1) ? ++imageCounter : 0;
    const imagePath = evgPortraitFolder + galleryImageName + imageCounter + imageExtension;
    if($('#thumbnailImage').length){
        d3.select("#thumbnailImage")
            .attr("xlink:href", imagePath);
    } else if ($('#imageGallery').length){
        $('#galleryImage').attr("src", imagePath);
    }
}

function handleMouseClick(d) {

    var pieChart = clone('#pieChart');
    //$('#quotationTextDiv').remove();
    d3.select("#pieChart").style("display", "none");
    pieChart.select("#clickText").remove();
    pieChart.select("#weblinks").remove();
    pieChart.select("#title").remove();
    pieChart.select("#impressumAndLanguageLink").remove();
    pieChart.select("#detail_right").remove();
    pieChart.select("#detail_left").remove();
    pieChart.select("#subtitle").remove();
    pieChart.select("#quotationCircle").remove();

    var numberOfMenuLevels = Object.keys(Levels).length;
    for (var j = 0; j < numberOfMenuLevels; j++) {
        var chart = pieChart.select("#chart_" + j);
        chart.selectAll('path')
            .transition()
            .duration(1000)
            .attr("transform", "scale(0)");
    }

    var numberOfBackArcs = 6;
    var delay = 300;
    for (var i = 0; i < numberOfBackArcs; i++) {
        var back = pieChart.select('#backChart' + i);
        back.selectAll('path')
            .transition()
            .duration(1000)
            .delay(delay)
            .attr("transform", "scale(0)");
        delay += 100;
    }


    pieChart.selectAll("text")
        .transition()
        .delay(700)
        .attr("transform", "scale(0)")
        .remove();

    pieChart.transition()
        .delay(2000)
        .remove();

    //document.getElementById("frame").setAttribute("src", d.data.hyperlink);

    var id = d3.select(this).attr("id").split("_")[2];
    var language = findGetParameter("lg");

    setTimeout(function () {
        window.location.href = "portal_evg_sub.html?lg=" + language + "&page=" + id;
    }, 2000);

    /*d3.select('#subPage')
        .transition()
        .delay(1000)
        .style("display", "block")
        .transition()
        .duration(500)
        .style("opacity", "1");

    d3.select("#nav")
        .transition()
        .duration(200)
        .delay(1000)
        .attr("style", "display: flex");

    d3.select("#nav")
        .transition()
        .duration(200)
        .delay(1200)
        .style("opacity", "1");*/
}
