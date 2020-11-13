(function () {
    buildPage();
})();

function buildPage() {

    checkCompatibility();

    setLanguage();
    addBodyClick();
    addContent();
    $('#descriptionContent').append(constantTexts.description);
    var pageTitle = constantTexts.title;
    createNavigationBar(false, pageTitle);
    $('#collapseToggler').removeClass("d-md-none");

    setOverflowHiddenInIframe();
    createFooter("footer-lectures");

    if (isMobileHighResolution) {
        $('#div_video').removeClass("col-lg-5");
        $('#div_description').removeClass("col-lg-5");
        $('#div_wordcloud').removeClass("col-lg-5");
        $('#div_selectarea').removeClass("col-lg-5");

        $('.filler').each(function () {
            $(this).removeClass("d-lg-block");
        })
    }
}

function addBodyClick() {
    $('body').click(function (ev) {
        if (ev.target.className === "container" || ev.target.className === "ul_top") {
            highlight_fixed = false;
            reset_highlights(ev);
            reset_shadows(ev);
        }
    });
}

function addContent() {

    jQuery.ajax({
        type: "POST",
        url: "glasersfeld_videos.php",
        dataType: "json",
        data: {
            tablename: "all_tables"
        },
        success: function (data, textstatus) {
            let video_meta = data['video_meta'];
            let video_topic = data['indices']['video_topic'];
            let keys_videos = Object.keys(video_topic);
            let histogram = {};
            processData(keys_videos, video_topic, video_meta, histogram);

            $video_div = $('#div_video');
            $video = $('<video id="video" class="align-self-center mw-100" controls>Your browser does not support the video tag.</video>')
            $video_div.append($video);

            construct_wordcloud(histogram);
            loadInitVideo(video_meta[Object.keys(video_meta)[0]]);
        }
    });
    $('#p_description').append(constantTexts.description[selectedLanguage]);
}

function loadInitVideo(url) {
    $video = $("#video");
    $video.attr("src", url);
    $video[0].load();
    // $video[0].play();
    $video[0].currentTime = 0;
}

function loadVideo(ev, url, time) {
    
    backToTop();

    let h = (+time[0]);
    let m = (+time[1]);
    let s = (+time[2])
    let in_seconds = h * 3600 + m * 60 + s;

    if (!isNaN(in_seconds)) {
        $video = $("#video");
        $video.attr("src", url);
        $video[0].load();
        $video[0].play();
        $video[0].currentTime = in_seconds;
    }

}

function construct_wordcloud(histogram) {
    let svg_location = "#div_wordcloud";
    let width = window.innerWidth / 2 - 150;
    width = !isMobileHighResolution && (window.innerWidth > 1010 || window.innerWidth > window.innerHeight) ? width : (window.innerWidth - 100);
    let height = 600;

    //let fill = d3.schemeCategory10(); //in d3 version 5.6.1
    let fill = d3.scale.category20();

    let word_entries = d3.entries(histogram);

    //let xScale = d3.scaleLinear() //in d3 version 5.6.1
    let xScale = d3.scale.linear()
        .domain([0, d3.max(word_entries, function (d) {
            return d.value;
        })
        ])
        .range([10, 100]);

    // d3.layout.cloud() only available in d3 version 3
    d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function (d) {
            return xScale(+d.value);
        })
        .text(function (d) {
            return d.key;
        })
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .font("Impact")
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select(svg_location).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return xScale(d.value) + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d, i) {
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.key;
            })
            .on("mouseover", function (d, i) {
                if (!highlight_fixed) {
                    $(this).css("font-weight", "bold");
                }
                highlight_listitems(d, i);
            })
            .on("mouseout", function (d, i) {
                if (!highlight_fixed) {
                    $(this).css("font-weight", "normal");
                }
                reset_listitems(d, i);
            })
            .on("click", function (d, i) {
                highlight_fixed = false;
                reset_listitems(d, i);
                highlight_listitems(d, i);
                $(this).css("font-weight", "bold");
                highlight_fixed = true;
            });
    }

    d3.layout.cloud().stop();
}



