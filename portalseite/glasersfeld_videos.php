/*
authors:  Caroline Haller
Manfred Moosleitner
*/

<?php

if (isset($_POST['tablename'])) {
	$result = array(
		"video_meta" => getVideoMeta(),
		"indices" => getVideoTopic()
	);
	echo json_encode($result);
}

function getVideoMeta() {
	$result = [];
	$csv_videos_meta = array_map('str_getcsv', file("src/videos.csv"));
	foreach ($csv_videos_meta as $row_index => $row_content) {
		if ($row_index === 0) {
			continue;
		}
		$video = $row_content[0];
		$url = $row_content[1];
		$result[$video] = $url;
	}
	ksort($result);
	return $result;
}

function getVideoTopic() {
	$csv_video_topic = array_map('str_getcsv', file("src/glasersfeld_videos.csv"));
	$video_topic = [];
	$topic_video = [];
	foreach ($csv_video_topic as $row_index => $row_content) {
		// skip header row
		if ($row_index === 0) {
			continue;
		}

		$video = $row_content[0];
		$topics = explode("/", $row_content[1]);
		$start = $row_content[2];
		$end = $row_content[3];
		$summary = $row_content[4];

		// build video to topic index
		if (!array_key_exists($video, $video_topic)) {
			$video_topic[$video] = [];
		}
		foreach ($topics as $key => $topic) {
			if (!array_key_exists($topic, $video_topic[$video])) {
				$video_topic[$video][$topic] = [];
			}
			$entry = array_push($video_topic[$video][$topic], array("start" => $start, "end" => $end, "summary" => $summary));
		}

		// build topic to video index
		foreach ($topics as $key => $topic) {
			if (!array_key_exists($topic, $topic_video)) {
				$topic_video[$topic] = [];
			}
			if (!array_key_exists($video, $topic_video[$topic])) {
				$topic_video[$topic][$video] = [];
			}
			array_push($topic_video[$topic][$video], array("start" => $start, "end" => $end, "summary" => $summary));
		}
	}
	ksort($video_topic);
	ksort($topic_video);
	return array(
		"video_topic" => $video_topic,
		"topic_video" => $topic_video
	);
}
