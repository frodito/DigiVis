<?php

class DigiVisDataExport extends ApiBase {

	protected function getAllowedParams() {
		return [
			// A parameter accepting multiple values from a list
			'format' => [
				// The default set of values
				ApiBase::PARAM_DFLT => 'json',
				// All possible values
				ApiBase::PARAM_TYPE => ['json'],
				// Indicate that multiple values are accepted
				ApiBase::PARAM_ISMULTI => true,
				// Use standard "per value" documentation messages
				ApiBase::PARAM_HELP_MSG_PER_VALUE => [],
			],
			'form' => [
				// The default set of values
				ApiBase::PARAM_DFLT => 'text',
				// All possible values
				ApiBase::PARAM_TYPE => ['json', 'text'],
				// Indicate that multiple values are accepted
				ApiBase::PARAM_ISMULTI => true,
				// Use standard "per value" documentation messages
				ApiBase::PARAM_HELP_MSG_PER_VALUE => [],
			],
			'content' => [
				// The default set of values
				ApiBase::PARAM_DFLT => 'all',
				// All possible values
				ApiBase::PARAM_TYPE => ['annotations', 'metadata', 'all'],
				// Indicate that multiple values are accepted
				ApiBase::PARAM_ISMULTI => true,
				// Use standard "per value" documentation messages
				ApiBase::PARAM_HELP_MSG_PER_VALUE => [],
			]
		];
	}

	public function execute() {

		$dir = 'tmp/' . date('Y-m-d H-i-s') . '/';
		if (!is_dir($dir)) {
			mkdir($dir);
		}

		$result = [];
		$result_json = [];
		$result_csv = [];
		$filename_csv = '';
		$header = '';
		$params = $this->extractRequestParams();
		$form = $params['form'][0];
		$content = $params['content'][0];

		if ($content === 'metadata' || $content === 'all') {
			list($result_json, $result_csv) = $this->getMetadata($dir);
			$filename_csv = $dir . 'metadata_extract.csv';
			$header = "title,author,location,publication date,publication media,length\r\n";
			if ($form === 'text') {
				$this->writeCSV($filename_csv, $result_csv, $header);
			}
			array_push($result, array(
				'metadata' => $result_json
			));
		}
		if ($content === 'annotations' || $content === 'all') {
			list($result_json, $result_csv) = $this->getAnnotations($dir);
			$filename_csv = $dir . 'annotation_extract.csv';
			$header = "title,id,category,quote,offsetBegin,offsetEnd,comment,topics,innovation_type,reference_type,narrative_type\r\n";
			if ($form === 'text') {
				$this->writeCSV($filename_csv, $result_csv, $header);
			}
			array_push($result, array(
				'annotations' => $result_json
			));
		}
		$this->getResult()->addValue(null, $this->getModuleName(), $result);
	}

	function deleteFiles() {
		$folder = 'tmp';
		$files = glob($folder . '/*');
		foreach ($files as $file) {
			if (is_file($file)) {
				unlink($file);
			}
		}
	}

	function writeCSV($filename, $result, $header) {
		$fp = fopen($filename, 'w');
		fputs($fp, $header);
		foreach ($result as $elem) {
			fputcsv($fp, $elem);
		}
		fclose($fp);
	}

	function submitAskQuery($query) {
		$result = [];
		$continue = true;
		$offset = 0;
		for ($i = 0; $continue; $i++) {
			$req_params = new FauxRequest(
				array(
					'action' => 'ask',
					'format' => 'json',
					'query' => $query . '|offset=' . $offset
				)
			);
			$api = new ApiMain($req_params);
			$api->execute();
			$data = $api->getResult()->getResultData();
			$result = array_merge($result, $data['query']['results']);
			$offset = array_key_exists("query-continue-offset", $data) ? $data['query-continue-offset'] : false;
			$continue = $offset === false ? false : true;
		}
		return $result;
	}

	function getMetadata($dir) {
		$result_json = [];
		$query = "[[Category:DigiVisDocumentPages]]" .
			"|?Title|?Author|?Location|?Published Date|?Published Media";
		$metadata = $this->submitAskQuery($query);
		ksort($metadata, SORT_STRING);

		foreach ($metadata as $element) {
			$title = $element['printouts']['Title'][0]['fulltext'];
			$author = $element['printouts']['Author'][0]['fulltext'];
			$location = $element['printouts']['Location'][0]['fulltext'];
			$pub_date = $element['printouts']['Published Date'][0]['fulltext'];
			$pub_media = $element['printouts']['Published Media'][0]['fulltext'];

			array_push($result_json, array(
				'title' => $title,
				'author' => $author,
				'location' => $location,
				'published_date' => $pub_date,
				'published_media' => $pub_media,
				'text_length' => strlen($this->getTextToPage('Text:' . $title, $dir))
			));
		}
		// no special treatment for CSV needed in the case of metadata, returning both times the json
		return array($result_json, $result_json);
	}

	function getAnnotations($dir) {

		$result_json = [];
		$result_csv = [];
		$previous_title = '';

		/***************************************************************************************/
		/* SMW-Query to select annotations, set $debug to false to select all annotations and
		 * to true, to select only annotations to specific text (set $debug_title
		 */
		$debug = false;

		if (!$debug) {    // normal mode of operation
			$query = '[[Annotation of::+]][[~Text:*||~Annotationen:*]]' .
				'|?AnnotationComment|?AnnotationMetadata|?Category|' .
				'?ist Thema|?ist Innovationstyp|?Referenztyp|?Narrativtyp';

		} else {    // query for single document
			$debug_title = 'Why I Consider Myself a Cybernetician';
			$query = '[[Annotation of::+]]' .
				'[[~Text:' . $debug_title . '*||~Annotationen:' . $debug_title . '*]]' .
				'|?AnnotationComment|?AnnotationMetadata|?Category|' .
				'?ist Thema|?ist Innovationstyp|?Referenztyp|?Narrativtyp';
		}

		$annotations = $this->submitAskQuery($query);
		ksort($annotations, SORT_STRING);

		$count_annotations_before = count($annotations);
		$annotations = $this->removeDuplicatesFromAnnotations($annotations);
		if ($count_annotations_before !== count($annotations)) {
			// duplicates in annotations
		}

		foreach ($annotations as $element) {
			preg_match_all('/(?<=Annotation:)(.*)(?=\/.*)/', $element['fulltext'], $matches);
			$current_title = $matches[0][0];
			$current_title = str_replace("Annotationen:", "Text:", $current_title);

			if ($current_title !== $previous_title) {
				$pagetext = $this->getTextToPage($current_title, $dir);
				if (isnull($pagetext)) {
					continue;
				}
			}

			$annotation = $element['printouts'];
			$metadata = json_decode(self::translateBrackets($annotation['AnnotationMetadata'][0]));

			list($start, $end) = $this->calculateAnnotationOffset($pagetext, $metadata->quote);

			$start = $start ?: "error";
			$end = $end ?: "error";
			if (is_numeric($start) && is_numeric($end)) {
				if ($start > $end) {
					$start = $start . ' AFTER END';
					$end = $end . ' BEFORE START';
				}
			}

			array_push($result_csv, array(
				'title' => $current_title,
				'annotation_id' => $metadata->id,
				'category' => $metadata->category,
				'quote' => $metadata->quote,
				'offsetBegin' => $start,
				'offsetEnd' => $end,
				'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
				'topics' => $this->getFulltextArrayAsString($annotation['Ist Thema'], ";") ?: "",
				'innovation_type ' => $this->getFulltextArrayAsString($annotation['Ist Innovationstyp'], ";") ?: "",
				'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
				'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : ""
			));

			array_push($result_json, array(
				'title' => $current_title,
				'annotation_id' => $metadata->id,
				'category' => $metadata->category,
				'quote' => $metadata->quote,
				'offsetBegin' => $start,
				'offsetEnd' => $end,
				'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
				'topics' => $this->getFulltextArrayAsArray($annotation['Ist Thema']) ?: [],
				'innovation_type ' => $this->getFulltextArrayAsArray($annotation['Ist Innovationstyp']) ?: [],
				'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
				'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : ""
			));
//			$previous_title = $matches[0][0];
			$previous_title = $current_title;
		}

		return array($result_json, $result_csv);
	}

	/**
	 * @param $annotations
	 * @return array
	 */
	function removeDuplicatesFromAnnotations($annotations) {
		$result = [];
		$inv_index = [];

		// build inverted index with quote as key and annotations as values
		foreach ($annotations as $key_annotation => $annotation) {
			$metadata = json_decode(self::translateBrackets($annotation['printouts']['AnnotationMetadata'][0]));
			$quote = $metadata->quote;
			if (!isset($inv_index[$quote])) {
				$inv_index[$quote] = [];
			}
			array_push($inv_index[$quote], $key_annotation);
		}

		// use inverted index to identify duplicates, duplicates have 2+ annotations per quote
		foreach ($inv_index as $key_quote => $annotation_id) {
			if (count($annotation_id) === 1) {    // no duplicate, add annotation to result
				$result[$annotation_id[0]] = $annotations[$annotation_id[0]];

				// duplicate detected, check categories
			} else if (count($annotation_id) > 1) {
				$categories = [];
				// collect category of annotations
				foreach ($annotation_id as $key_annotation_id => $val_annotation_id) {
					$metadata = json_decode(self::translateBrackets($annotations[$val_annotation_id]['printouts']['AnnotationMetadata'][0]));
					if (!isset($categories[$metadata->category])) {
						$categories[$metadata->category] = [];
					}
					array_push($categories[$metadata->category], $val_annotation_id);
				}


				if (count($categories) === 2) {
					$cat1 = array_keys($categories)[0];
					$cat2 = array_keys($categories)[1];

					// combination of WissenschaftlicheReferenz2 and Prämisse3 allowed
					if (($cat1 === 'WissenschaftlicheReferenz2' && $cat2 === 'Prämisse3') ||
						($cat1 === 'Prämisse3' && $cat2 === 'WissenschaftlicheReferenz2')) {
						foreach ($categories as $category => $val_annotation_id) {
							$result[$val_annotation_id[0]] = $annotations[$val_annotation_id[0]];
						}

					} else {    // keep first annotation
						$annotation_id = reset($categories)[0];
						$result[$annotation_id] = $annotations[$annotation_id];
					}
				} else {    // keep first annotation
					$annotation_id = reset($categories)[0];
					$result[$annotation_id] = $annotations[$annotation_id];
				}
			} else {
				// should not happen
			}
		}
		return $result;
	}

	function calculateAnnotationOffset($text, $quote) {

		$pattern_newline = '/\r\n|\r|\n/';
		preg_match_all($pattern_newline, $quote, $newlines, PREG_OFFSET_CAPTURE);

		$start_pos_in_text = strpos($text, $quote);

		// quote not found in text, possible reasons are wikitext formatting, newlines, etc.
		if ($start_pos_in_text === false) {
			// search with prefix and suffix
			if (count($newlines[0])) {
				$pos_first_newline = $newlines[0][0][1];
				$pos_last_newline = count($newlines[0]) > 1 ? $newlines[0][count($newlines[0]) - 1][1] : $pos_first_newline;
				$prefix = substr($quote, 0, $pos_first_newline);
				$suffix = substr($quote, $pos_last_newline + 1);
				$start_pos_in_text = strpos($text, $prefix);
				$end_pos_in_text = strpos($text, $suffix, $start_pos_in_text) + strlen($suffix);
			} else {
				// unexpected reason on why the quote is not found in text
				// manual investigation triggered via setting both positions to false
				$start_pos_in_text = false;
				$end_pos_in_text = false;
			}
		} else {
			$end_pos_in_text = $start_pos_in_text + strlen($quote);
		}
		return array($start_pos_in_text, $end_pos_in_text);
	}

	// https://stackoverflow.com/questions/16352591/convert-php-array-to-csv-string
	function str_putcsv($input, $delimiter = ',', $enclosure = '"') {
		// Open a memory "file" for read/write...
		$fp = fopen('php://temp', 'r+');
		// ... write the $input array to the "file" using fputcsv()...
		fputcsv($fp, $input, $delimiter, $enclosure);
		// ... rewind the "file" so we can read what we just wrote...
		rewind($fp);
		// ... read the entire line into a variable...
		$data = fread($fp, 1048576);
		// ... close the "file"...
		fclose($fp);
		// ... and return the $data to the caller, with the trailing newline from fgets() removed.
		return rtrim($data, "\n");
	}

	private
	function enquoteForCSV($text) {
		return '"' . $text . '"';
	}

	private
	function commaSeparate() {
		$result = "";
		$args = func_get_args();
		foreach ($args as $key => $arg) {
			$result .= $arg;
			if ($key !== count($args)) {
				$result .= ",";
			}
		}
		$result .= "\\r\\n";
		return $result;
	}

	private
	function getFulltextArrayAsString($array, $separator) {
		$result = "";
		foreach ($array as $key => $elem) {
			$result .= $elem['fulltext'];
			if ($key !== count($array)) {
				$result .= $separator;
			}
		}
		return $result;
	}

	private
	function getFulltextArrayAsArray($array) {
		$result = [];
		foreach ($array as $elem) {
			array_push($result, $elem['fulltext']);
		}
		return $result;
	}


	private
	function translateBrackets($text) {
		$text = str_replace("^", "{", $text);
		$text = str_replace("°", "}", $text);
		$text = str_replace("Ӷ", "[", $text);
		$text = str_replace("Ӻ", "]", $text);
		$text = str_replace("&#160;", " ", $text);
		return $text;
	}

	/**
	 * @param $current_title
	 * @param $dir
	 * @return string|null
	 */
	private function getTextToPage($current_title, $dir) {
		try {
			$title = Title::makeTitle(0, $current_title);
			$article = new Article($title);
			$page = $article->getPage();
			$revision = $page->getRevision();
			if (is_null($revision)) {
				return null;
			}
			$content = $revision->getContent();
			$pagetext = ContentHandler::getContentText($content);
			$processed_text = strip_tags($this->replaceRefTagsWithNumberedSquares($pagetext));
			$tmp_title = str_replace("Annotationen:", "Text:", $current_title);
			$tmp_title = str_replace("Text:", "", $tmp_title);
			$tmp_title = str_replace("/", "_", $tmp_title);
			if (!is_file($dir . $tmp_title . '.txt')) {
				file_put_contents($dir . $tmp_title . '.txt', $processed_text);
			}

		} catch (MWException $e) {
			$this->logMessage($current_title, $e->getMessage(), $e->getCode());
		}
		return $processed_text ?? '';
	}

	private function replaceRefTagsWithNumberedSquares($text) {
		$tmp_text = $text;
		$pattern_ref = '/\<ref\>([^<]*)\<\/ref\>/';
		preg_match_all($pattern_ref, $text, $matches, PREG_OFFSET_CAPTURE);

		foreach ($matches[0] as $key => $ref) {
			$tmp_text = str_replace($ref[0], '[' . ($key + 1) . ']', $tmp_text);
			$tmp_text .= "\n" . ($key + 1) . '. ' . $matches[1][$key][0];
		}
		return $tmp_text;
	}
}
