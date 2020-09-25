<?php

// TODO: read plain text of page and build HTML by hand (headers, paragraphs, spans for annotations)

class DigiVisDataExportAPI extends ApiBase
{

    private $texts = [];
    private $annotations_index = [];
    private $debug = false;
    private $test_id = 2460;
    private $dir = '';

    protected function getAllowedParams()
    {
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

    public function execute()
    {

        $result = [];
        $result_json = [];
        $result_csv = [];
        $filename_csv = '';
        $header = '';
        $params = $this->extractRequestParams();
        $form = $params['form'][0];
        $content = $params['content'][0];

        $this->dir = 'tmp/' . date('Y-m-d H-i-s') . '/';
        if ($form === 'text') {
            if (!is_dir($this->dir)) {
                mkdir($this->dir);
            }
        }

        list($result_json, $result_csv, $this->texts) = $this->getMetadata();
        if ($content === 'metadata' || $content === 'all') {
            $filename_csv = $this->dir . 'metadata_extract.csv';
            $header = "page_id,title,author,location,publication_date,publication_media,length\r\n";
            if ($form === 'text') {
                $this->writeCSV($filename_csv, $result_csv, $header);
            }
            array_push($result, array(
                'metadata' => $result_json
            ));
        }
        if ($content === 'annotations' || $content === 'all') {
            list($result_json, $result_csv) = $this->getAnnotationsV2();
            $filename_csv = $this->dir . 'annotation_extract.csv';
            $header = "page_id,annotation_id,category,quote,offsetBegin,offsetEnd,comment,topics,innovation_type,reference_type,narrative_type,persons,orgs,locs,relationen_argumentation_fremd,relationen_antwort_glasersfeld\r\n";
            if ($form === 'text') {
                $this->writeCSV($filename_csv, $result_csv, $header);
            }
            array_push($result, array(
                'annotations' => $result_json
            ));
        }

        $this->constructHTML($result_json);

        if ($form === 'text') {
            foreach ($this->texts as $page_id => $text_object) {
                if (!is_file($this->dir . $page_id . '.txt')) {
                    file_put_contents($this->dir . $page_id . '.txt', $text_object['text']);
                }
            }
        }

        $this->getResult()->addValue(null, $this->getModuleName(), $result);
    }

    private function constructHTML($result_json)
    {

        foreach ($this->texts as $page_id => $text_object) {
            $text_prefix = '<div class="mw-parser-output">';
            $text_suffix = '</div>';

            $title = $text_object['title'];
            $text = $this->getTextToPage('Text:' . $title);
            list($text, $references) = $this->replaceRefTagsWithNumberedSquaresV2($text);
            $text = $this->replaceWikiHeaderWithHTMLHeaders($text);
            $text = $this->removeBTags($text);
            $text = $this->removeBlockquote($text);
            $text = $this->removeBrTags($text);

            // process annotations by priority
            for ($i = 0; $i < 5; $i++) {
                foreach ($this->annotations_index[$page_id][$i] as $annotation_id => $annotation) {
                    $quote = $annotation[0]['quote'];
                    $category = $annotation[0]['category'];
                    $text = $this->wrapWithDiv($text, $quote, $annotation_id, $category);
                }
            }

            $text = $this->translateNotes($text);
//            $text = $this->constructParagraphs($text);
            if (count($references) > 0) {
                $text = $this->reconstructRefTags($text, $references);
            }
            $text = $this->translateFile($text);
            $text = $this->removePoemTag($text);
            $text = $text_prefix . $text . $text_suffix;
            $text = $this->removeReferenceTag($text);
//            $text = $this->removeEmptyParagraphs($text);
            $text = $this->removeBrTags($text);
            $text = $this->removePAroundH($text);
            if (!is_file($this->dir . $page_id . '.html')) {
                file_put_contents($this->dir . $page_id . '.html', $text);
            }
        }
    }

    private function translateFile($text)
    {
        $url_prefix = "https://dbis-digivis.uibk.ac.at/mediawiki/index.php?title=Special:Redirect/file/";
        $pattern_file = '/\[\[([^\[]*)\]\]/';
        //        $pattern_file_structure = '/\[\[File:(.*)(\|)+center\|([01234556789]*)(.*)\]\]/';
        // instead of center sometimes there is thumb and for some the rest after center is missing
        $pattern_file_structure = '/\[\[File:(.*)(\|)+(center|thumb)\|*([01234556789]*)(.*)\]\]/';
        preg_match_all($pattern_file, $text, $matches, PREG_OFFSET_CAPTURE);
        foreach ($matches[0] as $key => $match) {
            preg_match_all($pattern_file_structure, $match[0], $matches_structure, PREG_OFFSET_CAPTURE);
            $search = $matches_structure[0][0][0];
            $filename = str_replace("|", "", $matches_structure[1][0][0]);
            $filename = str_replace(" ", "_", $filename);
            $imagesize = getimagesize($url_prefix . $filename);
            $image_ratio = $imagesize[0] / $imagesize[1];
            $width = $matches_structure[3][0][0];
            if (!ctype_digit($width)) {
                $width = 400;
            }
            $height = ceil($width / $image_ratio);
//            $unit = $matches_structure[4][0][0];
//            $replace = '<div style="text-align: center"><img src="' . $url_prefix . $filename . '" width="' . $width . '"></div>';
            $replace = '<div style="text-align: center"><img src="' . $url_prefix . $filename . '" width="' . $width . '" height="' . $height . '" alt="image"></div>';
            $text = str_replace($search, $replace, $text);
        }
        return $text;
    }

    private function reconstructRefTags($text, $references)
    {
        $reference_list = '<div class="mw-references-wrap mw-references-columns"><ol class="references">';
        foreach ($references as $key => $reference) {
            $ref_tag = '<sup id="cite_ref-' . $key . '" class="reference">'
                . '<a href="#cite_note-' . $key . '">'
                . '[' . $key . ']'
                . '</a></sup>';

            $list_item = '<li id="cite_note-' . $key . '">'
                . '<span class="mw-cite-backlink">'
                . '<a href="#cite_ref-' . $key . '">' . '&#8593;</a>'
                . $reference
                . '</a></span>'
                . '<span class="reference-text">' . $reference . '</span></li>';

            $text = str_replace("[" . $key . "]", $ref_tag, $text);
            $reference_list .= $list_item;
        }
        $reference_list .= '</ol></div>';
        return $text . $reference_list;
    }

    private function wrapWithDiv($text, $quote, $annotation_id, $category)
    {

        $startPos = strpos($text, $quote);
        if ($startPos !== false) {   // full quote found in $text
            $endPos = $startPos + strlen($quote);
            $substr = $quote;
        } else {
            $prefix_length = $this->calculatePrefixLength($text, $quote);
            $suffix_length = $this->calculateSuffixLength($text, $quote);
            if ($prefix_length && $suffix_length) {
                $quote_prefix = substr($quote, 0, $prefix_length);
                $quote_suffix = substr($quote, strlen($quote) - $suffix_length, $suffix_length);
                $startPos = strpos($text, $quote_prefix);
                $endPos = strpos($text, $quote_suffix);
                $substr = substr($text, $startPos, $endPos - $startPos + $suffix_length);
            }
        }
        $replacement = '<div id="' . $annotation_id . '" class="' . $category . ' annotation">' . $substr . '</div>';
        $text = str_replace($substr, $replacement, $text);
        return $text;
    }

    private function calculatePrefixLength($text, $quote)
    {
        $prefix_length = 40;
        $occurences = 0;
        for ($i = 0; $prefix_length > 0 || $i > 10; $i++) {
            //        while ($prefix_length > 0) {
            $occurences = substr_count($text, substr($quote, 0, $prefix_length));
            if ($occurences > 1) {
                $prefix_length += 5;
            } elseif ($occurences === 1) {    // prefix found, exit loop
                break;
            } else {    // prefix not found, try with shorter prefix
                $prefix_length -= 5;
            }
        }
        if ($prefix_length === 0) {
            return false;
        }
        return $prefix_length;
    }

    private function calculateSuffixLength($text, $quote)
    {
        $suffix_length = 40;
        $occurences = 0;
        for ($i = 0; $suffix_length > 0 || $i > 10; $i++) {
            //        while ($suffix_length > 0) {
            $occurences = substr_count($text, substr($quote, strlen($quote) - $suffix_length));
            if ($occurences > 1) {
                $suffix_length += 5;
            } elseif ($occurences === 1) {    // prefix found, exit loop
                break;
            } else {    // prefix not found, try with shorter prefix
                $suffix_length -= 5;
            }
        }
        if ($suffix_length === 0) {
            return false;
        }
        return $suffix_length;
    }

    private function wrapWithSpan($text, $quote, $annotation_id, $category)
    {
        $prefix_length = 30;
        $quote_prefix = substr($quote, 0, $prefix_length);
        $quote_suffix = substr($quote, strlen($quote) - $prefix_length, $prefix_length);
        $startPos = strpos($text, $quote_prefix);
        $endPos = strpos($text, $quote_suffix);
        $substr = substr($text, $startPos, $endPos - $startPos + $prefix_length);
        $replacement = '<span id="' . $annotation_id . '" class="' . $category . '">' . $substr . '</span>';
        $text = str_replace($substr, $replacement, $text);
        return $text;
    }

    private function calculateOffsetsText()
    {
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
    }

    function deleteFiles()
    {
        $folder = 'tmp';
        $files = glob($folder . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }

    function writeCSV($filename, $result, $header)
    {
        $fp = fopen($filename, 'w');
        fputs($fp, $header);
        foreach ($result as $elem) {
            fputcsv($fp, $elem);
        }
        fclose($fp);
    }

    function submitAskQuery($query)
    {
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

    function getMetadata()
    {

        $result_json = [];
        $texts = [];
        $query = "[[Category:DigiVisDocumentPages]]|?Title|?Author|?Location|?Published Date|?Published Media";
        $metadata = $this->submitAskQuery($query);
        ksort($metadata, SORT_STRING);

        foreach ($metadata as $element) {
            $title = $element['printouts']['Title'][0]['fulltext'];
            $text_title = 'Text:' . $title;
            $author = $element['printouts']['Author'][0]['fulltext'];
            $location = $element['printouts']['Location'][0]['fulltext'];
            $pub_date = $element['printouts']['Published Date'][0]['fulltext'];
            $pub_media = $element['printouts']['Published Media'][0]['fulltext'];
            $page_id = $this->getPageIdFromPage($text_title);
            $html = $this->getHTMLToPage($text_title);
            $text = html_entity_decode(strip_tags($this->replaceRefTagsWithNumberedSquares($html)));
            $text = str_replace("\n", " ", $text);
            $text = preg_replace("/\s+/", " ", $text);
            $text_length = strlen($text);
            if ($this->debug && $page_id !== $this->test_id) {
                continue;
            }
            array_push($result_json, array(
                'id' => $page_id,
                'title' => $title,
                'author' => $author,
                'location' => $location,
                'published_date' => $pub_date,
                'published_media' => $pub_media,
                'text_length' => $text_length
            ));
            $texts[$page_id] = array(
                'title' => $title,
                'text' => $text,
                'html' => $html
            );
        }
        // no special treatment for CSV needed in the case of metadata, returning both times the json
        return array($result_json, $result_json, $texts);
    }

    function getNamedEntitiesSingleAnnotation($name)
    {

        $result = [];
        $result['persons'] = array();
        $result['orgs'] = array();
        $result['locs'] = array();

        // [[-Has subobject::NamedEntities:Annotation:Abstraction, Re-Presentation, and Reflection: An Interpretation of Experience and of Piaget’s Approach/Oluafsqlrw]]|?Has person|?Has org|?Has norp|?Has loc|?Has gpe|mainlabel=Pagetitle
        $searchTitle = 'NamedEntities:' . $name;
        $query = "[[-Has subobject::$searchTitle]]|?Has person|?Has org|?Has loc|mainlabel=Pagetitle";
        $named_entities = $this->submitAskQuery($query);

        foreach ($named_entities as $key => $entities) {
            preg_match_all('/(?<=NamedEntities:Annotation:)(.*\/)(.*)(?=#NER)/', $key, $matches);
            $id = $matches[2][0];
            $title = str_replace("NamedEntities:Annotation:", "", $key);
            $title = str_replace('/' . $id . "#NER", "", $title);

            foreach ($entities['printouts']['Has person'] as $index => $person) {
                array_push($result['persons'], $person);
            }
            foreach ($entities['printouts']['Has org'] as $index => $org) {
                array_push($result['orgs'], $person);
            }
            foreach ($entities['printouts']['Has loc'] as $index => $loc) {
                array_push($result['locs'], $loc);
            }
        }
        return $result;
    }

    function getRelations($pagetitle)
    {
        $result = "";
        $query = '[[-Has subobject::' . $pagetitle . ']]|mainlabel=-|?Thema|?Bezug|?Relation';
        $relations = $this->submitAskQuery($query);
        $counter = 0;
        foreach ($relations as $index => $relation) {
            if (sizeof($relation['printouts']['Thema']) !== 0 && array_key_exists('fulltext', $relation['printouts']['Thema'][0])) {
                $thema = $relation['printouts']['Thema'][0]['fulltext'];
            } else {
                $thema = "";
            }
            if (sizeof($relation['printouts']['Bezug']) !== 0 && array_key_exists('fulltext', $relation['printouts']['Bezug'][0])) {
                $bezug = $relation['printouts']['Bezug'][0]['fulltext'];
                $pos_slash = strpos($bezug, "/", 30);
                $page_title = substr($bezug, 0, $pos_slash);
                $page_title = str_replace("Annotation:Text:", "", $page_title);
                $page_id = $this->getPageIdFromPage($page_title);
                $annotation_id = substr($bezug, $pos_slash);
                $bezug = $page_id . "/" . $annotation_id;
            } else {
                $bezug = "";
            }
            if (sizeof($relation['printouts']['Relation']) !== 0 && array_key_exists('fulltext', $relation['printouts']['Relation'][0])) {
                $relationtype = $relation['printouts']['Relation'][0]['fulltext'];
            } else {
                $relationtype = "";
            }
            $result .= $thema . "|" . $bezug . "|" . $relationtype;
            if ($counter < sizeof($relations) - 1) {
                $result .= ";";
            }
            $counter++;
        }
        return $result;
    }

    function getPageIdFromPage($page_title)
    {
        $page_id = "error";
        if ($page_title === "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis?") {
            $page_title = "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis";
        }

        $title = Title::makeTitle(0, $page_title);
        if (!is_null($title)) {
            $article = new Article($title);
            if (!is_null($article)) {
                $page = $article->getPage();
                if (!is_null($page)) {
                    $revision = $page->getRevision();
                    if (!is_null($revision)) {
                        $page_id = $revision->getRevisionRecord()->getPageId();
                    } else {
                        $iwanttosetabreakpointhere = true;
                    }
                } else {
                    $iwanttosetabreakpointhere = true;
                }
            } else {
                $iwanttosetabreakpointhere = true;
            }
        } else {
            $iwanttosetabreakpointhere = true;
        }
        return $page_id;
    }

    function getAnnotationsV2()
    {

        $result_json = [];
        $result_csv = [];
        $previous_title = '';

        foreach ($this->texts as $page_id => $text_object) {

            $title = $text_object['title'];
            $text = $text_object['text'];
            $html = $text_object['html'];

            $query = '[[Annotation of::+]][[~Text:'
                . $title
                . '*||~Annotationen:'
                . $title
                . '*]]|?AnnotationComment|?AnnotationMetadata|?Category|?ist Thema|?ist Innovationstyp|?Referenztyp|?Narrativtyp';

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

                $annotation = $element['printouts'];
                $metadata = json_decode(self::translateBrackets($annotation['AnnotationMetadata'][0]));

                $quote = str_replace("\n", " ", $metadata->quote);
                $quote = preg_replace("/\s+/", " ", $quote);

                list($offset_start_text, $offset_end_text) = $this->calculateAnnotationOffsetV2($text, $quote);
                //                list($offset_start_html, $offset_end_html) = $this->calculateAnnotationOffsetV2($html, $quote);

                $namedEntities = [];
                if ($metadata->category === 'Argumentation2') {
                    $namedEntities = $this->getNamedEntitiesSingleAnnotation($element['fulltext']);
                }

                $argumentationFremdRelationen = "";
                if ($metadata->category === 'ArgumentationFremd') {
                    $argumentationFremdRelationen = $this->getRelations($element['fulltext']);
                }

                $antwortGlasersfeldRelationen = "";
                if ($metadata->category === 'AntwortGlasersfeld') {
                    $antwortGlasersfeldRelationen = $this->getRelations($element['fulltext']);
                }

                array_push($result_csv, array(
                    'page_id' => $page_id,
                    'annotation_id' => $metadata->id,
                    'category' => $metadata->category,
                    'quote' => $metadata->quote,
                    'offsetBegin' => $offset_start_text,
                    'offsetEnd' => $offset_end_text,
                    //                    'offsetBeginHTML' => $offset_start_html,
                    //                    'offsetEndHTML' => $offset_end_html,
                    'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                    'topics' => $this->getFulltextArrayAsString($annotation['Ist Thema'], ";") ?: "",
                    'innovation_type ' => $this->getFulltextArrayAsString($annotation['Ist Innovationstyp'], ";") ?: "",
                    'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
                    'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : "",
                    'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsString($namedEntities['persons'], ";") : "",
                    'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsString($namedEntities['orgs'], ";") : "",
                    'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsString($namedEntities['locs'], ";") : "",
                    //				'norps' => isset($namedEntities['norp']) ? $this->getFulltextArrayAsString($namedEntities['norp'], ";") : "",
                    //				'gpes' => isset($namedEntities['gpe']) ? $this->getFulltextArrayAsString($namedEntities['gpe'], ";") : "",
                    'relationen_argumentation_fremd' => $argumentationFremdRelationen,
                    'relationen_antwort_glasersfeld' => $antwortGlasersfeldRelationen
                ));

                array_push($result_json, array(
                    'page_id' => $page_id,
                    'annotation_id' => $metadata->id,
                    'category' => $metadata->category,
                    'quote' => $metadata->quote,
                    'offsetBegin' => $offset_start_text,
                    'offsetEnd' => $offset_end_text,
                    //                    'offsetBeginHTML' => $offset_start_html,
                    //                    'offsetEndHTML' => $offset_end_html,
                    'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                    'topics' => $this->getFulltextArrayAsArray($annotation['Ist Thema']) ?: [],
                    'innovation_type ' => $this->getFulltextArrayAsArray($annotation['Ist Innovationstyp']) ?: [],
                    'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
                    'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : "",
                    'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsArray($namedEntities['persons']) : [],
                    'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsArray($namedEntities['orgs']) : [],
                    'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsArray($namedEntities['locs']) : [],
                    //				'norps' => isset($namedEntities['norp']) ? $this->getFulltextArrayAsArray($namedEntities['norp']) : [],
                    //				'gpes' => isset($namedEntities['gpe']) ? $this->getFulltextArrayAsArray($namedEntities['gpe']) : [],
                    'relationen_argumentation_fremd' => $argumentationFremdRelationen,
                    'relationen_antwort_glasersfeld' => $antwortGlasersfeldRelationen
                ));


                $priority = $this->checkPriority($metadata->category);
                if (!isset($this->annotations_index[$page_id])) {
                    $this->annotations_index[$page_id] = [];
                }
                if (!isset($this->annotations_index[$page_id][$priority])) {
                    $this->annotations_index[$page_id][$priority] = [];
                }
                if (!isset($this->annotations_index[$page_id][$priority][$metadata->id])) {
                    $this->annotations_index[$page_id][$priority][$metadata->id] = [];
                }
                array_push($this->annotations_index[$page_id][$priority][$metadata->id], array(
                    'quote' => $metadata->quote,
                    'category' => $metadata->category
                ));
            }
        }
        return array($result_json, $result_csv);
    }

    private function checkPriority($category)
    {
        switch ($category) {
            case "Argumentation2":
                return 0;
                break;
            case "Narrativ2":
            case "Innovationsdiskurs2":
            case "AntwortGlasersfeld":
            case "ArgumentationFremd":
                return 1;
                break;
            case "Prämisse3":
                return 2;
                break;
            case "WissenschaftlicheReferenz2":
                return 3;
                break;
            default:
                return 4;
        }
    }

    function getAnnotations($dir)
    {

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
            //			$debug_title = 'Why I Consider Myself a Cybernetician';
            //			$debug_title = 'Josef Mitterer – Der Radikale Konstruktivismus: „What difference does it make“';
            $debug_title = 'Die Radikal-Konstruktivistische Wissenstheorie';
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
                $pagetext = $this->getTextToPageForOffset($current_title);
                if (is_null($pagetext)) {
                    continue;
                }
            }
            $page_id = $this->getPageIdFromPage($current_title);

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

            $namedEntities = [];
            if ($metadata->category === 'Argumentation2') {
                $namedEntities = $this->getNamedEntitiesSingleAnnotation($element['fulltext']);
            }

            $argumentationFremdRelationen = "";
            if ($metadata->category === 'ArgumentationFremd') {
                $argumentationFremdRelationen = $this->getRelations($element['fulltext']);
            }

            $antwortGlasersfeldRelationen = "";
            if ($metadata->category === 'AntwortGlasersfeld') {
                $antwortGlasersfeldRelationen = $this->getRelations($element['fulltext']);
            }

            array_push($result_csv, array(
                'page_id' => $page_id,
                'annotation_id' => $metadata->id,
                'category' => $metadata->category,
                'quote' => $metadata->quote,
                'offsetBegin' => $start,
                'offsetEnd' => $end,
                'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                'topics' => $this->getFulltextArrayAsString($annotation['Ist Thema'], ";") ?: "",
                'innovation_type ' => $this->getFulltextArrayAsString($annotation['Ist Innovationstyp'], ";") ?: "",
                'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
                'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : "",
                'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsString($namedEntities['persons'], ";") : "",
                'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsString($namedEntities['orgs'], ";") : "",
                'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsString($namedEntities['locs'], ";") : "",
                //				'norps' => isset($namedEntities['norp']) ? $this->getFulltextArrayAsString($namedEntities['norp'], ";") : "",
                //				'gpes' => isset($namedEntities['gpe']) ? $this->getFulltextArrayAsString($namedEntities['gpe'], ";") : "",
                'relationen_argumentation_fremd' => $argumentationFremdRelationen,
                'relationen_antwort_glasersfeld' => $antwortGlasersfeldRelationen
            ));

            array_push($result_json, array(
                'page_id' => $page_id,
                'annotation_id' => $metadata->id,
                'category' => $metadata->category,
                'quote' => $metadata->quote,
                'offsetBegin' => $start,
                'offsetEnd' => $end,
                'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                'topics' => $this->getFulltextArrayAsArray($annotation['Ist Thema']) ?: [],
                'innovation_type ' => $this->getFulltextArrayAsArray($annotation['Ist Innovationstyp']) ?: [],
                'reference_type' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['Referenztyp'][0]['fulltext'] : "",
                'narrative_type' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['Narrativtyp'][0]['fulltext'] : "",
                'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsArray($namedEntities['persons']) : [],
                'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsArray($namedEntities['orgs']) : [],
                'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsArray($namedEntities['locs']) : [],
                //				'norps' => isset($namedEntities['norp']) ? $this->getFulltextArrayAsArray($namedEntities['norp']) : [],
                //				'gpes' => isset($namedEntities['gpe']) ? $this->getFulltextArrayAsArray($namedEntities['gpe']) : [],
                'relationen_argumentation_fremd' => $argumentationFremdRelationen,
                'relationen_antwort_glasersfeld' => $antwortGlasersfeldRelationen
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
    function removeDuplicatesFromAnnotations($annotations)
    {
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

    function calculateAnnotationOffsetV2($text, $quote)
    {

        $start_pos_in_text = false;
        $end_pos_in_text = false;

        $start_pos_in_text = strpos($text, $quote);

        // full quote not found in text, try again with a prefix and a suffix
        if ($start_pos_in_text === false) {
            $length = strlen($quote) >= 100 ? 50 : 25;
            $prefix = substr($quote, 0, $length);
            $suffix = substr($quote, strlen($quote) - $length);
            $start_pos_in_text = strpos($text, $prefix);
            $end_pos_in_text = strpos($text, $suffix, $start_pos_in_text) + strlen($suffix);
        } else {
            $end_pos_in_text = $start_pos_in_text + strlen($quote);
        }

        $start_pos_in_text = $start_pos_in_text ?: "error";
        $end_pos_in_text = $end_pos_in_text ?: "error";
        if (is_numeric($start_pos_in_text) && is_numeric($end_pos_in_text)) {
            if ($start_pos_in_text > $end_pos_in_text) {
                $start_pos_in_text = $start_pos_in_text . ' AFTER END';
                $end_pos_in_text = $end_pos_in_text . ' BEFORE START';
            }
        }
        return array($start_pos_in_text, $end_pos_in_text);
    }

    function calculateAnnotationOffset($text, $quote)
    {

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
    function str_putcsv($input, $delimiter = ',', $enclosure = '"')
    {
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

    private function enquoteForCSV($text)
    {
        return '"' . $text . '"';
    }

    private function commaSeparate()
    {
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

    private function getFulltextArrayAsString($array, $separator)
    {
        $result = "";
        foreach ($array as $key => $elem) {
            $result .= $elem['fulltext'];
            if ($key !== count($array)) {
                $result .= $separator;
            }
        }
        return $result;
    }

    private function getFulltextArrayAsArray($array)
    {
        $result = [];
        foreach ($array as $elem) {
            array_push($result, $elem['fulltext']);
        }
        return $result;
    }

    private function translateBrackets($text)
    {
        $text = str_replace("^", "{", $text);
        $text = str_replace("°", "}", $text);
        $text = str_replace("Ӷ", "[", $text);
        $text = str_replace("Ӻ", "]", $text);
        $text = str_replace("&#160;", " ", $text);
        return $text;
    }

    private function getHTMLToPage($page_title)
    {
        $req_params = new FauxRequest(
            array(
                'action' => 'parse',
                'format' => 'json',
                'page' => $page_title,
                'prop' => 'text',
                'disablelimitreport' => '1',
                'disableeditsection' => '1',
                'disabletoc' => '1'
            )
        );
        $api = new ApiMain($req_params);
        $api->execute();
        $data = $api->getResult()->getResultData();
        return $data['parse']['text'];
    }

    /**
     * @param $page_title
     * @param $dir
     * @return string
     */
    private function getTextToPage($page_title)
    {
        try {
            if ($page_title === "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis?") {
                $page_title = "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis";
            }
            $title = Title::makeTitle(0, $page_title);
            $article = new Article($title);
            $page = $article->getPage();
            $revision = $page->getRevision();
            $content = $revision->getContent();
            $pagetext = ContentHandler::getContentText($content);
            return $pagetext;
        } catch (MWException $e) {
            $this->logMessage($page_title, $e->getMessage(), $e->getCode());
        }
        return '';
    }

    /**
     * @param $current_title
     * @param $dir
     * @return string
     */
    private function getTextToPageForOffset($current_title)
    {
        try {
            if ($current_title === "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis?") {
                $current_title = "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis";
            }
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
            return $processed_text;
        } catch (MWException $e) {
            $this->logMessage($current_title, $e->getMessage(), $e->getCode());
        }
        return null;
    }

    private function savePageText($title, $dir)
    {
        try {
            if ($title === "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis?") {
                $title = "Michael Flacke – Radikal-Konstruktivistische Wissenstheorie oder sozialkonstruktivistische Praxis";
            }
            $title = Title::makeTitle(0, $title);
            $article = new Article($title);
            $page = $article->getPage();
            $revision = $page->getRevision();
            if (is_null($revision)) {
                return null;
            }
            $pageId = $revision->getRevisionRecord()->getPageId();
            $content = $revision->getContent();
            $pagetext = ContentHandler::getContentText($content);

            $pageId = $revision->getRevisionRecord()->getPageId();
            $content = $revision->getContent();
            $pagetext = ContentHandler::getContentText($content);
            $processed_text = $this->textPostProcessing($pagetext);
            $tmp_title = str_replace("Annotationen:", "Text:", $title);
            $tmp_title = str_replace("Text:", "", $tmp_title);
            $tmp_title = str_replace("/", "_", $tmp_title);

            if (!is_file($dir . $pageId . '.txt')) {
                file_put_contents($this->dir . $pageId . '.txt', $processed_text);
            }
        } catch (MWException $e) {
            $this->logMessage($current_title, $e->getMessage(), $e->getCode());
        }
    }

    private function textPostProcessing($text)
    {
        $text = $this->replaceRefTagsWithNumberedSquares($text);
        $text = $this->replaceWikiHeaderWithHTMLHeaders($text);
        $text = $this->translateNotes($text);
        $text = $this->removePoemTag($text);
        return $text;
    }

    private function replaceRefTagsWithNumberedSquaresV2($text)
    {
        $tmp_text = $text;
        $references = [];
        $pattern_ref = '/\<ref\>([^<]*)\<\/ref\>/';
        preg_match_all($pattern_ref, $text, $matches, PREG_OFFSET_CAPTURE);

        foreach ($matches[0] as $key => $ref) {
            $tmp_text = str_replace($ref[0], '[' . ($key + 1) . ']', $tmp_text);
            //			$tmp_text .= "\n" . ($key + 1) . '. ' . $matches[1][$key][0];
            //			$tmp_text .= "<br>" . ($key + 1) . '. ' . $matches[1][$key][0];
            $references[$key + 1] = $matches[1][$key][0];
        }
        return array($tmp_text, $references);
    }

    private function replaceRefTagsWithNumberedSquares($text)
    {
        $tmp_text = $text;
        $pattern_ref = '/\<ref\>([^<]*)\<\/ref\>/';
        preg_match_all($pattern_ref, $text, $matches, PREG_OFFSET_CAPTURE);

        foreach ($matches[0] as $key => $ref) {
            $tmp_text = str_replace($ref[0], '[' . ($key + 1) . ']', $tmp_text);
            //			$tmp_text .= "\n" . ($key + 1) . '. ' . $matches[1][$key][0];
            $tmp_text .= "<br>" . ($key + 1) . '. ' . $matches[1][$key][0];
        }
        return $tmp_text;
    }

    private function replaceWikiHeaderWithHTMLHeaders($text)
    {
        $pattern_h4 = '/====(.*)====/';
        $pattern_h3 = '/===(.*)===/';
        $pattern_h2 = '/==(.*)==/';
        $pattern_h1 = '/=(.*)=/';

        preg_match_all($pattern_h4, $text, $matches_h4, PREG_OFFSET_CAPTURE);
        $text = $this->translateHeader($matches_h4, $text, "<h4>", "</h4>");

        preg_match_all($pattern_h3, $text, $matches_h3, PREG_OFFSET_CAPTURE);
        $text = $this->translateHeader($matches_h3, $text, "<h3>", "</h3>");


        preg_match_all($pattern_h2, $text, $matches_h2, PREG_OFFSET_CAPTURE);
        $text = $this->translateHeader($matches_h2, $text, "<h2>", "</h2>");

        preg_match_all($pattern_h1, $text, $matches_h1, PREG_OFFSET_CAPTURE);
        $text = $this->translateHeader($matches_h1, $text, "<h1>", "</h1>");

        return $text;
    }

    private function translateHeader($matches, $text, $open, $close)
    {
        $tmp_text = $text;
        for ($i = 0; $i < sizeof($matches[0]); $i++) {
            $needle = $matches[0][$i][0];
            // $replace_with = $open . substr($matches[1][$i][0], 0, sizeof($matches[1][$i][0]) - 2) . $close;
            $replace_with = $open . substr($matches[1][$i][0], 0, strlen($matches[1][$i][0]) - 1) . $close;
            $tmp_text = str_replace($needle, $replace_with, $tmp_text);
        }
        return $tmp_text;
    }

    private function translateNotes($text)
    {
        $pattern_notes = '/#(.*)\n*/';
        preg_match_all($pattern_notes, $text, $matches, PREG_OFFSET_CAPTURE);
        $tmp_text = $text;
        //		for ($i = 0; $i <= sizeof($matches[0]); $i++) {
        $j = 1;
        for ($i = 0; $i < sizeof($matches[0]); $i++) {
            $replace_with = "";
            // start ordered-list at first element
            if ($j === 1) {
                $replace_with = '<ol>';
            }

            // check if current and next match are consecutive in text and create list-item
            if (isset($matches[0][$i + 1]) &&
                $matches[0][$i][1] + strlen($matches[0][$i][0]) === $matches[0][$i + 1][1]) {
                $replace_with .= '<li>' . $matches[1][$i][0] . '</li>';
                $j++;
            }

            // check if current and next are not consecutive in text or if it is the last match
            if (isset($matches[0][$i + 1]) &&
                $matches[0][$i][1] + strlen($matches[0][$i][0]) !== $matches[0][$i + 1][1] ||
                ($i + 1) === count($matches[0])) {
                $replace_with .= '<li>' . $matches[1][$i][0] . '</li></ol>';
                $j = 1;
            }
            $needle = $matches[0][$i][0];
            //            $replace_with = ($i + 1) . "." . $matches[1][$i][0] . "<br>";
            $tmp_text = str_replace($needle, $replace_with, $tmp_text);
        }
        return $tmp_text;
    }

    private function removePoemTag($text)
    {
//        $pattern_poem = '/\<poem\>([^<]*)\<\/poem\>/';
//        preg_match_all($pattern_poem, $text, $matches, PREG_OFFSET_CAPTURE);
//        $tmp_text = $text;
//        //		for ($i = 0; $i <= sizeof($matches[0]); $i++) {
//        for ($i = 0; $i < sizeof($matches[0]); $i++) {
//            $needle = $matches[0][$i][0];
//            $replace_with = $matches[1][$i][0];
//            $tmp_text = str_replace($needle, $replace_with, $tmp_text);
//        }
        $text = str_replace('<poem>', "", $text);
        return str_replace('</poem>', "", $text);
    }

    private function removeReferenceTag($text)
    {
        return preg_replace('/\<references \/\>/', "", $text);
    }

    private function constructParagraphs($text)
    {
        return "<p>" . preg_replace("/\n\n+/", "</p><p>", $text) . "</p>";
    }

    private function removeEmptyParagraphs($text)
    {
        return preg_replace('/<p><\/p>( |)/', "", $text);
    }

    private function removeBrTags($text)
    {
        return str_replace('<br>', "", $text);
    }

    private function removeBTags($text)
    {
        $text = str_replace('<b>', "", $text);
        return str_replace('</b>', "", $text);

    }

    private function removePAroundH($text)
    {
        $text = str_replace('<p><h', "<h", $text);
        $text = str_replace('</h1></p>', "</h1>", $text);
        $text = str_replace('</h2></p>', "</h2>", $text);
        $text = str_replace('</h3></p>', "</h3>", $text);
        return str_replace('</h4></p>', "</h4>", $text);
    }

    private function removeBlockquote($text)
    {
        $text = str_replace('<blockquote>', "", $text);
        return str_replace('</blockquote>', "", $text);
    }
}
