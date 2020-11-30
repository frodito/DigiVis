<?php

/**
 * DigiVis extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license MIT
 */
class DigiVisHooks {

	/**
	 * Array holding mapping annotation-category to css-selector for
	 * corresponding color
	 *
	 * @var array
	 */
	private static $categories_lookup = array(
		"LEVEL2CATEGORY1" => "annotator-hl-blue",
		"LEVEL2CATEGORY2" => "annotator-hl-magenta",
		"LEVEL2CATEGORY3" => "annotator-hl-lime",
		"LEVEL2CATEGORY4" => "annotator-hl-yellow",
		"LEVEL3CATEGORY1" => "annotator-hl-blueviolet",
		"LEVEL3CATEGORY2" => "annotator-hl-orange",
		"LEVEL3CATEGORY3" => "annotator-hl-cyan",
        "LEVEL2CONNECTED" => "annotator-hl-chocolate",
        "LEVEL2CONNECTEDANSWER" => "annotator-hl-red"
	);

	public static function onCanonicalNamespaces(array &$namespaces) {
		global $wgNamespacesWithSubpages;

		if (!defined('NS_WALK')) {
			define('NS_WALK', 2500);
			define('NS_WALK_TALK', 2501);
		}
		$namespaces[NS_WALK] = 'Walk';
		$namespaces[NS_WALK_TALK] = 'WalkTalk';

		if (!defined('NS_NER')) {
			define('NS_NER', 2502);
			define('NS_NER_TALK', 2503);
		}
		$namespaces[NS_NER] = 'NamedEntities';
		$namespaces[NS_NER_TALK] = 'NamedEntitiesTalk';

		if (!defined('NS_VIABLORY_DESCRIPTION')) {
		    define('NS_VIABLORY_DESCRIPTION', 2504);
		    define('NS_VIABLORY_DESCRIPTION_TALK', 2505);
        }
        $namespaces[NS_VIABLORY_DESCRIPTION] = 'ViabloryDescription';
        $namespaces[NS_VIABLORY_DESCRIPTION_TALK] = 'ViabloryDescriptionTalk';

		if (!defined('NS_VIS_COMMENT')) {
			define('NS_VIS_COMMENT', 2506);
			define('NS_VIS_COMMENT_TALK', 2507);
		}
		$namespaces[NS_VIS_COMMENT] = 'VisualizationComment';
		$namespaces[NS_VIS_COMMENT_TALK] = 'VisualizationCommentTalk';

		$wgNamespacesWithSubpages[NS_WALK] = true;
		$wgNamespacesWithSubpages[NS_NER] = true;
		$wgNamespacesWithSubpages[NS_VIABLORY_DESCRIPTION] = true;
		$wgNamespacesWithSubpages[NS_VIS_COMMENT] = true;
		return true;
	}

	public static function afterInit() {
		global $smwgNamespacesWithSemanticLinks;
		if (!defined('NS_WALK')) {
			define('NS_WALK', 2500);
		}
		$smwgNamespacesWithSemanticLinks[NS_WALK] = true;

		if (!defined('NS_NER')) {
			define('NS_NER', 2502);
		}
		$smwgNamespacesWithSemanticLinks[NS_NER] = true;

		if (!defined('NS_VIS_COMMENT')) {
			define('NS_VIS_COMMENT', 2506);
		}
		$smwgNamespacesWithSemanticLinks[NS_VIS_COMMENT] = true;

        if (!defined('NS_VIABLORY_DESCRIPTION')) {
            define('NS_VIABLORY_DESCRIPTION', 2504);
        }
        $smwgNamespacesWithSemanticLinks[NS_VIABLORY_DESCRIPTION] = true;

            // Enable PageForms Namespace for SemanticLinks
		$smwgNamespacesWithSemanticLinks[PF_NS_FORM] = true;
		return true;
	}


	/**
	 * Load resource modules
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool
	 */
	public static function onBeforePageDisplay(OutputPage &$out, Skin &$skin) {
		// always load module ext.digiVis
		$out->addModules('ext.digiVis');
		return true;
	}

	/**
	 * Register any render callbacks with the parser
	 *
	 * @param Parser $parser
	 * @throws MWException
	 */
	public static function onParserFirstCallInit(Parser $parser) {
		// function hook for magic word "layer3annotate"
		$parser->setFunctionHook('layer2annotate', [self::class, 'constructLayer2ForAnnotation']);

		// function hook for magic word "layer3display"
		$parser->setFunctionHook('layer3display', [self::class, 'constructLayer3ForDisplay']);
	}

	/**
	 * Preprocess page-content to show text with annotations-highlights
	 *
	 * @param Parser $parser
	 * @param string $pagetitle
	 * @return array
	 * @throws MWException
	 */
	public static function constructLayer2ForDisplay(Parser $parser, $pagetitle = '') {

		$title = Title::makeTitle(0, $pagetitle);
		$article = new Article($title);
		$page = $article->getPage();
		$revision = $page->getRevision();
		$content = $revision->getContent();
		$text = ContentHandler::getContentText($content);

		$output = self::addAnnotationsToPage($pagetitle, $text);

		$parser = new Parser();
		$parseroutput = $parser->parse($output, $title, new ParserOptions());
		$output = $parseroutput->getText();

		return array(
			0 => $output,
			'nowiki' => false,
			'noparase' => false,
			'isHTML' => true
		);
	}

	/**
	 * Create page-content showing only annotations to add annotations of third layer
	 *
	 * @param Parser $parser
	 * @param string $pagetitle
	 * @return array
	 * @throws MWException
	 */
	public static function constructLayer2ForAnnotation(Parser $parser, $pagetitle = '') {
		$output = '';
		$pattern_xpath = '/p\[(\d+)\]/';
		$annotations_array = array();

		$pagetitle_layer2 = str_replace("Annotationen:", "Text:", $pagetitle);

		$annotations = self::getAnnotations($pagetitle_layer2);
		foreach ($annotations as $annotation) {

			// dig out metadata from annotation
			$metadata_json = json_decode(self::translateBrackets($annotation["printouts"]["#"][0]), true);
			$category = $metadata_json['category'];
			$quote = $metadata_json['quote'];
			$start_xpath = $metadata_json['ranges'][0]['start'];
			$start_pos = $metadata_json['ranges'][0]['startOffset'];
			$end_pos = $metadata_json['ranges'][0]['endOffset'];

			$index_paragraph = -1;
			if (preg_match_all($pattern_xpath, $start_xpath, $p)) {
				if (count($p) == 2) {
					$index_paragraph = $p[1][0];
				}
			}

			// store calculated values for further processing, use index + start-offset for sorting
			$annotations_array[$category . " " . $index_paragraph . " " . $start_pos . " " . $end_pos] = array(
				'category' => self::umlauteumwandeln(strtolower($metadata_json['category'])),
				'span_title' => $category,
				'quote' => $quote
			);

		} // foreach annotation

		if (count($annotations_array) > 0) {
			// sort by 'start-offset end-offset', e.g. '3 147 314' < '4 345 613' < '5 345 613'
			ksort($annotations_array, SORT_NATURAL);

			foreach ($annotations_array as $annotation) {
				$output = $output
					. '<div class="box-layer2 ' . self::$categories_lookup[$annotation['category']] . '">'
					. '<span class="box-layer2-title">' . $annotation['span_title'] . '</span><br>'
					. $annotation['quote']
					. '</div>';
			}

			$parser = new Parser();
			$title = Title::makeTitle(0, $pagetitle);
			$parseroutput = $parser->parse($output, $title, new ParserOptions());
			$output = $parseroutput->getText();
		}
		return array(
			0 => $output,
			'nowiki' => false,
			'noparase' => false,
			'isHTML' => true
		);

	}


	/**
	 * Create page-content showing only annotations
	 * @param Parser $parser
	 * @param string $pagetitle
	 * @return array
	 * @throws MWException
	 */
	public static function constructLayer3ForDisplay(Parser $parser, $pagetitle = '') {

		$output = '';
		$annotations_array = array();

		$annotations = self::getAnnotations($pagetitle);
		foreach ($annotations as $annotation) {

			// dig out metadata from annotation
			$metadata_json = json_decode(self::translateBrackets($annotation["printouts"]["#"][0]), true);
			$category = $metadata_json['category'];
			$quote = $metadata_json['quote'];
			$start_pos = $metadata_json['ranges'][0]['startOffset'];
			$end_pos = $metadata_json['ranges'][0]['endOffset'];

			// store calculated values for further processing, use index + start-offset for sorting
			$annotations_array[$start_pos . " " . $end_pos] = array(
				'category' => self::umlauteumwandeln(strtolower($metadata_json['category'])),
				'span_title' => $category,
				'quote' => $quote
			);

		} // foreach annotation

		if (count($annotations_array) > 0) {
			// sort by 'start-offset end-offset', e.g. '0 147' < '314 549' < '314 654'
			ksort($annotations_array, SORT_NATURAL);

			foreach ($annotations_array as $annotation) {
				$output = $output
					. '<div class="box-layer2 ' . self::$categories_lookup[$annotation['category']] . '">'
					. '<span class="box-layer2-title">' . $annotation['span_title'] . '</span><br>'
					. $annotation['quote']
					. '</div>';
			}

			$parser = new Parser();
			$title = Title::makeTitle(0, $pagetitle);
			$parseroutput = $parser->parse($output, $title, new ParserOptions());
			$output = $parseroutput->getText();
		}
		return array(
			0 => $output,
			'nowiki' => false,
			'noparase' => false,
			'isHTML' => true
		);
	}

	/**
	 * Adds annotation-hightlights to the text of the given page
	 *
	 * @param $pagetitle string
	 * @param $text string
	 * @return string        text-content with added highlights
	 * @throws MWException
	 */
	public static function addAnnotationsToPage($pagetitle, $text) {

		$text_modified = "";

		$annotations_offsets = self::calculateAnnotationOffsets($pagetitle, $text);

		// sort by 'start-offset end-offset', e.g. '0 147' < '314 549' < '314 654'
		ksort($annotations_offsets, SORT_NATURAL);
		$annotations_offsets_keys = array_keys($annotations_offsets);

		$prev_end = 0;
		$double_processing = false;

		for ($i = 0; $i < count($annotations_offsets_keys); $i++) {

			// previous annotation overlapped with current => already processed
			if ($double_processing === true) {
				$double_processing = false;
				continue;
			}

			$offset = $annotations_offsets[$annotations_offsets_keys[$i]];

			// get next annotation to check if current and next overlap in any way
			if (array_key_exists($i + 1, $annotations_offsets_keys)) {
				$next_offset = $annotations_offsets[$annotations_offsets_keys[$i + 1]];
			} else {    // last annotation
				$next_offset = null;
			}

			// special cases:
			if ($offset['start'] === 0 ||                  // text starts with first annotation
				$offset['end'] === strlen($text) ||        // text ends with last annotation
				$offset['start'] === ($prev_end + 1)) {    // annotation follows directly after previous annotation

				$text_modified = self::concatAnnotationFromPositions($text, $text_modified, $offset);

				// A contains B, A equals B
			} else if ($offset['start'] <= $next_offset['start'] &&
				$offset['end'] >= $next_offset['end'] &&
				$next_offset !== null) {

				// insert A into text
				$text_modified = self::append2Annotations($text, $text_modified, $offset, $next_offset);

				// remember that next offset is already processed to skip next iteration
				$double_processing = true;


				// TODO: handling of the following 3, not yet supported cases
				// A overlaps B
			} else if ($offset['start'] < $next_offset['start'] &&
				$offset['end'] > $next_offset['start'] &&
				$offset['end'] <= $next_offset['end'] &&
				$next_offset !== null) {
				echo "A overlaps B<br>";

				// A equals B
			} else if ($offset['start'] === $next_offset['start'] &&
				$offset['end'] === $next_offset['end'] &&
				$next_offset !== null) {
				echo "A equals B<br>";

				// A starts with B
			} else if ($offset['start'] === $next_offset['start'] &&
				$offset['end'] < $next_offset['end'] &&
				$next_offset !== null) {
				echo "A starts with B<br>";

				// normal case: text between previous and current annotation, followed by current annotation
			} else {

				// text before first annotation
				if ($prev_end === 0) {
					$text_modified .= substr($text, 0, $offset['start']);

					// normal text
				} else {
					$text_modified .= substr($text, $prev_end, ($offset['start'] - $prev_end));
				}

				// annotation
				$text_modified = self::concatAnnotationFromPositions($text, $text_modified, $offset);
				if ($offset === end($annotations_offsets) && $offset['end'] !== strlen($text)) {
					$text_modified .= substr($text, $offset['end']);
				}
			}
			$prev_end = $offset['end'];
		} // foreach offset

		return $text_modified;
	}

	public static function translateBrackets($text) {
		$text = str_replace("^", "{", $text);
		$text = str_replace("°", "}", $text);
		$text = str_replace("Ӷ", "[", $text);
		$text = str_replace("Ӻ", "]", $text);
		$text = str_replace("&#160;", " ", $text);
		return $text;
	}

	/**
	 * Retrieve annotations to given pagetitle via API
	 * @param $pagetitle string
	 * @return mixed
	 * @throws MWException
	 */
	public static function getAnnotations($pagetitle) {

		$query = '[[Annotation of::' . $pagetitle . ']]|?=#|?AnnotationMetadata=#';
		$params = new FauxRequest(
			array(
				'action' => 'ask',
				'format' => 'json',
				'query' => $query,
				'aplimit' => 500
			)
		);
		$api = new ApiMain($params);
		$api->execute();
		$data = $api->getResult()->getResultData();
		return $data["query"]["results"];
	}

	/**
	 * Conditionally register the unit testing module for the ext.digiVis module
	 * only if that module is loaded
	 *
	 * @param array $testModules The array of registered test modules
	 * @param ResourceLoader $resourceLoader The reference to the resource loader
	 * @return true
	 */
	public static function onResourceLoaderTestModules(array &$testModules, ResourceLoader &$resourceLoader) {
		$testModules['qunit']['ext.digiVis.tests'] = [
			'scripts' => [
				'tests/DigiVis.test.js'
			],
			'dependencies' => [
				'ext.digiVis'
			],
			'localBasePath' => __DIR__,
			'remoteExtPath' => 'DigiVis',
		];
		return true;
	}

	/**
	 * Add <div>-element for annotations with text from $text to $text_modifed
	 * @param $text    string text source
	 * @param $text_modified string text target
	 * @param $offset array with informations about positions
	 * @return string text_modified concatenated with <div>-element for annotation
	 */
	public static function concatAnnotationFromPositions($text, $text_modified, $offset) {
		$text_modified = $text_modified
			. '<div class="box-layer2 ' . self::$categories_lookup[$offset['category']] . '">'
			. '<span class="box-layer2-title">' . $offset['span_title'] . '</span><br>'
			. substr($text, $offset['start'], ($offset['end'] - $offset['start']))
			. '</div>';
		return $text_modified;
	}

	/**
	 * Add 2 annotations that have some kind of overlapping, such that no un-annotated text
	 * is between then 2 annotations.
	 *
	 * @param $text
	 * @param $text_modified
	 * @param $offset1
	 * @param $offset2
	 * @return mixed
	 */
	public static function append2Annotations($text, $text_modified, $offset1, $offset2) {
		$a = $offset1['start'] <= $offset2['start'] ? $offset1 : $offset2;
		$b = $offset1['start'] <= $offset2['start'] ? $offset2 : $offset1;

		$outer_div =
			'<div class="box-layer2 ' . self::$categories_lookup[$a['category']] . '">'
			. '<span class="box-layer2-title">' . $a['span_title'] . '</span><br>'
			. substr($text, $a['start'], ($a['end'] - $a['start']))
			. '</div>';

		$inner_div =
			'<div class="box-layer2 ' . self::$categories_lookup[$b['category']] . '">'
			. '<span class="box-layer2-title">' . $b['span_title'] . '</span><br>'
			. substr($text, $b['start'], ($b['end'] - $b['start']))
			. '</div>';

		$text_inner_div = substr($text, $b['start'], ($b['end'] - $b['start']));
		$outer_div = str_replace($text_inner_div, $inner_div, $outer_div);

		return $text_modified . $outer_div;
	}


// http://codecaveme.de/blog/php-umlaute-umwandeln-oe-ae-ue-in-oe-ae-ue-scriptfunktion/
	private static function umlauteumwandeln($str) {
		$tempstr = Array("ä" => "ae", "ö" => "oe", "ü" => "ue");
		return strtr($str, $tempstr);
	}

	/**
	 * @param $pagetitle
	 * @param $text
	 * @return array
	 * @throws MWException
	 */
	public static function calculateAnnotationOffsets($pagetitle, $text) {

		$annotations_offsets = array();

		$pattern_footnote = '/\[\d+\]/';
		$pattern_tag_open = '/\<(\w+)\>/';
		$pattern_tag_close = '/\<\/(\w+)\>/';
		$pattern_newline = '/\r\n|\r|\n/';

		// iterate over annotations of the page referring to $pagetitle
		$annotations = self::getAnnotations($pagetitle);
		foreach ($annotations as $annotation) {

			// dig out metadata from annotation
			$metadata_json = json_decode(self::translateBrackets($annotation["printouts"]["#"][0]), true);
			$category = $metadata_json['category'];
			$quote = $metadata_json['quote'];

			if (!preg_match_all($pattern_newline, $quote, $newlines, PREG_OFFSET_CAPTURE)) {
				// no newlines in quote
				$bla = 'blubb';
			}

			/**
			 * Search for footnotes in quote, as this needs special treatment, because
			 * semantic-text-annotator stores footnotes as text, e.g. [4], and the footnote
			 * in pagetext is <ref>something</ref>
			 */
			if (preg_match_all($pattern_footnote, $quote, $footnotes, PREG_OFFSET_CAPTURE)) {
				if (count($footnotes[0]) > 1) { // multiple footnotes

					$first_footnote = $footnotes[0][0];
					$last_footnote = $footnotes[0][count($footnotes[0]) - 1];

					$suffix = substr($quote, $last_footnote[1] + strlen($last_footnote[0]));
					$pos_suffix = false;

					// first footnote, calculate start-position of block in $text
					$pos_prefix = strpos($text, substr($quote, 0, $first_footnote[1]));
					$start_pos_in_text = $pos_prefix ? $pos_prefix : -1;

					// ends with normal text, search end via suffix + length of suffix
					if (strlen($suffix) > 0) {
						$pos_suffix = strpos($text, $suffix);
						$end_pos_in_text = $pos_suffix ? $pos_suffix + strlen($suffix) : -1;

						// ends with footnote, use position of previous footnote as offset
					} else {
						if (count($footnotes[0]) == 2) {
							$prev_end = $first_footnote[1] + strlen($first_footnote[0]);
						} else {
							$prev_end = $footnotes[0][count($footnotes) - 2][1] + strlen($footnotes[0][count($footnotes) - 2][0]);
						}
						$pos_prefix = strpos($text, substr($quote, $prev_end, $last_footnote[1] - $prev_end));
						if ($pos_prefix === false) {
							$pos_prefix = strpos($text, substr($quote, $prev_end, ($last_footnote[1] - $prev_end) * 0.2));
							if ($pos_prefix === false && count($newlines[0]) > 0) {
								$pos_prefix = strpos($text, substr($quote, $newlines[0][count($newlines) - 1][1] + 1, $last_footnote[1] - $newlines[0][count($newlines) - 1][1] - 1));
							}

						}
						$end_pos_in_text = strpos($text, '</ref>', $pos_prefix) + 6;
					}

					if ($pos_suffix === false) {
						// search newlines, and use text from last newline to end of quote for searching
						if (count($newlines[0]) > 0) {
							$pos_first_newline = $newlines[0][0][1];
							$pos_last_newline = count($newlines[0]) > 1 ? $newlines[0][count($newlines[0]) - 1][1] : false;
						}
						$end_pos_in_text = strpos($text, '</ref>', $pos_prefix) + 6;
					}

				} else { // only a single footnote, use prefix and suffix to calculate positions

					$pos_prefix = strpos($text, substr($quote, 0, $footnotes[0][0][1]));

					if ($pos_prefix === false) {
						$pos_first_newline = $newlines[0][0][1];
						$pos_prefix = strpos($text, substr($quote, 0, $pos_first_newline - 1));
					}

					$suffix = substr($quote, $footnotes[0][0][1] + strlen($footnotes[0][0][0]));
					$pos_suffix = strlen($suffix) === 0 ? strpos($text, '</ref>', $pos_prefix) + 6 : strpos($text, $suffix);

					// full suffix not found in $text, try again with shorter tail of the quote
					if ($pos_suffix === false) {
						// search again with last 20% of text
						$len_suffix = strlen($suffix);
						if ($len_suffix >= 75) { // suffix long enough, use 20% of tail
							$tmp_pos_suffix = intval(0.8 * $len_suffix);
						} else if ($len_suffix < 15) { // suffix very/too short
							$tmp_pos_suffix = $len_suffix;
						} else {
							$tmp_pos_suffix = 15;
						}
						$suffix = substr($quote, $footnotes[0][0][1] + strlen($footnotes[0][0][0]) + $tmp_pos_suffix);
						$pos_suffix = strlen($suffix) === 0 ? false : strpos($text, $suffix);
					}
					$start_pos_in_text = $pos_prefix;
					$end_pos_in_text = $pos_suffix + strlen($suffix);
				}

				// no footnote in quote, search with full quote in $text
			} else {
				$start_pos_in_text = strpos($text, $quote);
				$end_pos_in_text = $start_pos_in_text + strlen($quote);

				// quote not found in text, possible reasons are wikitext formatting and
				// its different storage of semantic text annotator
				if ($start_pos_in_text === false) {
					// search for first newline in quote
					if (count($newlines[0])) {
						$pos_first_newline = $newlines[0][0][1];
						$pos_last_newline = count($newlines[0]) > 1 ? $newlines[0][count($newlines[0]) - 1][1] : false;
					}
					$prefix = substr($quote, 0, $pos_first_newline);
					$suffix = substr($quote, $pos_last_newline + 1);
					$start_pos_in_text = strpos($text, $prefix);
					$end_pos_in_text = strpos($text, $suffix);
				}
			}

			// if current interval includes mediawiki formatting tags,
			// e.g. <blockquote></blockquote>, <poem></poem>, etc.,
			// check if both opening and closing tags are included and act accordingly
			$balanced = true;
			$substring = substr($text, $start_pos_in_text, $end_pos_in_text - $start_pos_in_text);
			$balanced = self::checkTagsBalanced($substring);


			if (!$balanced) {
			    echo 'Error on processing annotation ';
			}

			// store calculated values for further processing, use index + start-offset for sorting
			$annotations_offsets[$start_pos_in_text . " " . $end_pos_in_text] = array(
				'start' => $start_pos_in_text,
				'end' => $end_pos_in_text,
				'category' => self::umlauteumwandeln(strtolower($metadata_json['category'])),
				'span_title' => $category,
				'quote' => $quote
			);
		} // foreach annotation end
		return $annotations_offsets;
	}

	public static function checkTagsBalanced($text) {

		$stack = array();
		$balanced = false;

		$num_tags = preg_match_all('/\<(\/?\w+)\>/', $text, $tags, PREG_OFFSET_CAPTURE);
		if ($num_tags > 0) {
			$otag = false;
			$ctag = false;

			// pushdown automata
			foreach ($tags[0] as $key => $tag) {
				if (count($stack) === 0) {
					$stack[] = $tag;
				} else {
					$tos = $stack[count($stack) - 1];
					preg_match('/\/?\w+/', $tos[0], $tag_name_stack);
					$pos_tos = strpos($tag_name_stack, '/');
					$otag_tos = $pos_tos ? false : true;

					preg_match('/\/?\w+/', $tag[0], $tag_name_current);
					$pos_current = strpos($tag_name_current, '/');
					$otag_current = $pos_current ? false : true;
					if ($otag_current && $otag_tos) {
						$stack[] = $tag;
					} else if ($otag_current && !$otag_tos) {
						$stack[] = $tag;
					} else if (!$otag_current && $otag_tos) {
						// current tag closes tag on stack
						if (substr($tag_name_current, 1) === $tag_name_stack) {
							array_pop($stack);
						} else {
							$stack[] = $tag;
						}
					}
				}
			}

		}

	}
}
