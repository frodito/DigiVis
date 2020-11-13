
function processOccurences(topics, histogram, video_topic, movie, url, $ul_sub) {
	// accumulate occurences of each topic and add occurrences to list
	for (let topic of topics) {
		if (!(topic in histogram)) {
			histogram[topic] = 0;
		}
		histogram[topic] += video_topic[movie][topic].length;
		for (const occurrence of video_topic[movie][topic]) {
			let $li_sub = $('<li class="li_sub"></li>');
			let $starttime_div = $('<div class="div_listitem" data-topic="' + topic + '">' + occurrence.start + '</div>');
			let time = occurrence.start.split(':');
			$starttime_div.click(function (ev) {
				setTimeout(function () {
					loadVideo(ev, url, time);
					$(ev.target).css("background", "transparent");
				}, 400);
			});
			$starttime_div.mouseover(function (ev) {
				let arg = {};
				arg[topic] = 0;
				shadows_wordcloud(ev, arg);
			});
			$starttime_div.mouseout(function (ev) {
				reset_shadows(ev);
			});

			$li_sub.append($starttime_div);
			$ul_sub.append($li_sub);
		}
	}
}

function addMouseBehaviour($movie_div, url, video_topic, movie) {
	$movie_div.click(function (ev) {
		setTimeout(function () {
			loadVideo(ev, url, "0:00:00");
		}, 400);
	});
	$movie_div.mouseover(function (ev) {
		if (!highlight_fixed) {
			highlight_wordcloud(ev, video_topic[movie]);
		}
	});
	$movie_div.mouseout(function (ev) {
		if (!highlight_fixed) {
			reset_highlights(ev);
		}
	});
}

function processData(keys_videos, video_topic, video_meta, histogram) {

	let $selectarea = $('#div_selectarea');

	// displaying videos and times as list-items in ul
	let $ul_top = $('<ul class="ul_top"></ul>');
	for (const movie of keys_videos) {
		let topics = Object.keys(video_topic[movie]);

		// add one list-item per movie to top list
		let $li = $('<li class="li_video"></li>');
		let $movie_div = $('<div class="div_listitem movie"><div class="video_title">' + movie + ' <i class="fas fa-play-circle"></i></div></div>');
		let url = video_meta[movie];
		addMouseBehaviour($movie_div, url, video_topic, movie);

		// add sublist for occurrences
		let $ul_sub = $('<ul class="ul_sub"></ul>');
		processOccurences(topics, histogram, video_topic, movie, url, $ul_sub);
		$movie_div.append($ul_sub);
		$li.append($movie_div);
		$ul_top.append($li);
	}
	$selectarea.append($ul_top);
}

function reset_highlights(ev) {
	$(ev.target).css("background", "transparent");
	$('.li_sub ').each(function (i, dom_obj) {
		$(dom_obj).css("background", "transparent");
	});
	$('g > text').each(function (i, dom_text) {
		$(dom_text).css("font-weight", "normal");
	});
}

function reset_shadows(ev) {
	$('g > text').each(function (i, dom_text) {
		$(dom_text).css("text-shadow", "none");
	});
}

function highlight_wordcloud(ev, wordlist) {
	reset_highlights(ev);
	$(ev.target).css("background", "#777777");
	$(ev.target.parent).css("background", "#777777");
	topics = Object.keys(wordlist);
	$('g > text').each(function (i, dom_text) {
		$.each(topics, function (j, topic) {
			if (topic === dom_text.textContent) {
				$(dom_text).css("font-weight", "bold");
			}
		});
	});
}

function shadows_wordcloud(ev, wordlist) {
	topics = Object.keys(wordlist);
	$('g > text').each(function (i, dom_text) {
		$.each(topics, function (j, topic) {
			if (topic === dom_text.textContent) {
				$(dom_text).css("text-shadow", "2px 2px 15px #AAAAAA");
			}
		});
	});
}

function highlight_listitems(d, i) {
	if (!highlight_fixed) {
		$('.div_listitem').each(function (i, listItem) {
			if (d.text === listItem.getAttribute("data-topic")) {
				$(listItem).css("background", "#777777");
			}
		});
	}
}

function reset_listitems(d, i) {
	if (!highlight_fixed) {
		$('.div_listitem').each(function (i, listItem) {
			$(listItem).css("background", "transparent");
		});
	}
}
