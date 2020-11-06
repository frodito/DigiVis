<?php
/**
 * Class DigiVisDataExport
 * This class was written in the context of the project DigiVis and its purpose is to collect the text of specific pages
 * and annotations created with the MediaWiki extension SemanticTextAnnotator. Processing steps are applied to the
 * collected data, which can be output as JSON or CSV. Additional, an HTML version of the texts is created. The output
 * of the CSV and the text/html-files is done in a specified folder on the server running MediaWiki.
 */

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

    /**
     * Method called by MediaWiki-API if corresponding action is used
     */
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

        // create folder with current date and time
        $this->dir = 'tmp/' . date('Y-m-d H-i-s') . '/';
        if ($form === 'text') {
            if (!is_dir($this->dir)) {
                mkdir($this->dir);
            }
        }

        // collect metadata from specified pages and store as CSV on server if specified in the API call
        list($result_json, $result_csv, $this->texts) = $this->getMetadata();
        if ($content === 'metadata' || $content === 'all') {
            $filename_csv = $this->dir . 'metadata_extract.csv';

            // specify which fields of the meta are used in the CSV file,
            // e.g., $header = "title,author,location,publication date,publication media,length\r\n";
            $header = "\r\n";

            if ($form === 'text') {
                $this->writeCSV($filename_csv, $result_csv, $header);
            }
            array_push($result, array(
                'metadata' => $result_json
            ));
        }

        // process annotations
        if ($content === 'annotations' || $content === 'all') {
            list($result_json, $result_csv) = $this->getAnnotations();
            $filename_csv = $this->dir . 'annotation_extract.csv';
            $header = "page_id,annotation_id,category,quote,offsetBegin,offsetEnd,comment,METADATA_ATTRIBUTE1,METADATA_ATTRIBUTE2,METADATA_ATTRIBUTE3,METADATA_ATTRIBUTE4,persons,orgs,locs\r\n";
            if ($form === 'text') {
                $this->writeCSV($filename_csv, $result_csv, $header);
            }
            array_push($result, array(
                'annotations' => $result_json
            ));
        }

        // create HTML representation of the texts containing the annotations as DIV-elements to be used
        // in the visualization
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

    /**
     * Create the HTML representation for the text pages, including the annotations
     * as DIV elements.
     * Here the used wiki-formatting, like <ref></ref> for footnotes and such is translated
     * to HTML representations.
     *
     * @param array $result_json the results from previous methods containing the annotations
     */
    private function constructHTML($result_json)
    {

        foreach ($this->texts as $page_id => $text_object) {
            $text_prefix = '<div class="mw-parser-output">';
            $text_suffix = '</div>';

            $title = $text_object['title'];
            $text = $this->getTextToPage('Text:' . $title);
            list($text, $references) = $this->replaceRefTagsWithNumberedSquaresInPlainText($text);
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
            if (count($references) > 0) {
                $text = $this->reconstructRefTags($text, $references);
            }
            $text = $this->translateFile($text);
            $text = $this->removePoemTag($text);
            $text = $text_prefix . $text . $text_suffix;
            $text = $this->removeReferenceTag($text);
            $text = $this->removeBrTags($text);
            $text = $this->removePAroundH($text);
            if (!is_file($this->dir . $page_id . '.html')) {
                file_put_contents($this->dir . $page_id . '.html', $text);
            }
        }
    }

    /**
     * Method to get static urls to images included in the texts, and replace the wiki-format style
     * includion of images to standard HTML-style.
     *
     * Dependent on how images are included in your texts, the patterns may need to be adapted.
     *
     * @param string $text
     * @return string|string[]
     */
    private function translateFile($text)
    {
        // put the URL to your MediaWiki installation's specialpage to convert the filename to a static URL
        $url_prefix = "https://<YOUR-DOMAIN>/<YOUR-WEB-PATH-TO-MEDIAWIKI>/index.php?title=Special:Redirect/file/";
        $pattern_file = '/\[\[([^\[]*)\]\]/';

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
            $replace = '<div style="text-align: center"><img src="' . $url_prefix . $filename . '" width="' . $width . '" height="' . $height . '" alt="image"></div>';
            $text = str_replace($search, $replace, $text);
        }
        return $text;
    }

    /**
     * Put the collected references, prior translated in the text to [number], in the form of a list
     * at the bottom of the page, to look like in MediaWiki.
     *
     * @param string $text the pagetext
     * @param array $references list of references in the text
     * @return string the pagetext with the references as ordered list appended
     */
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

    /**
     * Wrap the annotated text passages inside divs, using the category of the annotation
     * as HTML class attribute for further styling of the HTML representations of the texts.
     *
     * @param string $text the pagetext
     * @param string $quote the text passage
     * @param string $annotation_id the id of the annotation
     * @param string $category the category of the annotation
     * @return string|string[] pagetext with the text passages wrapped in DIVs
     */
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

    /**
     * Calculate a suitable prefix of the annotation-quote in the text for the case the full text of the quote
     * cannot be found inside the text, due to newlines, etc.
     *
     * Needed for calculating the offsets.
     *
     * @param string $text the pagetext
     * @param string $quote the text of the annotation quote
     * @return false|int the length of the suffix as integer or false
     */
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

    /**
     * Calculate a suitable suffix of the annotation-quote in the text for the case the full text of the quote
     * cannot be found inside the text, due to newlines, etc.
     *
     * Needed for calculating the offsets.
     *
     * @param string $text the pagetext
     * @param string $quote the text of the annotation-quote
     * @return false|int the length of the suffix as integer or false
     */
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

    /**
     * Create CSV file with specified filename
     * @param $filename the name of the resulting file
     * @param $result the datarows of the CSV
     * @param $header the header row of the CSV
     */
    function writeCSV($filename, $result, $header)
    {
        $fp = fopen($filename, 'w');
        fputs($fp, $header);
        foreach ($result as $elem) {
            fputcsv($fp, $elem);
        }
        fclose($fp);
    }

    /**
     * Helper function to submit a Semantic MediaWiki ask-query via MediaWiki-API
     *
     * If the query result has more rows than permitted by the current API limits, the query is submitted
     * repeatedly with offset, until all rows are retrieved.
     *
     * @param $query string of the ask query
     * @return array the result of the query as returned by the MediaWiki-API
     */
    function submitAskQuery($query)
    {
        $result = [];
        $continue = true;
        $offset = 0;

        // repeat the query if query-result has more rows than permitted by current API limits by using offset
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

    /**
     * Helper function to retrieve the metadata of specified pages, where the metadata is stored in Semantic MediaWiki
     * via MediaWiki templates included at the pages. The specification of the pages is done with the help of a
     * MediaWiki category.
     *
     * @param string $dir path to the folder when the text of the pages should be stored (pass through)
     * @return array[] contains the results
     */
    function getMetadata()
    {
        /**
         * Text of the ask query, contains a page-selection with a category, which is followed by the fields to
         * retrieve. See the documentation about ask-queries in the wiki of Semantic MediaWiki for full details on
         * how ask queries work https://www.semantic-mediawiki.org/wiki/Semantic_MediaWiki.
         */
        $result_json = [];
        $texts = [];
        $query = "[[Category:PUT_YOUR_CATEGORY_HERE]]" .
            "|?METADATA_ATTRIBUTE1|?METADATA_ATTRIBUTE2|?METADATA_ATTRIBUTE3|?METADATA_ATTRIBUTE4|?METADATA_ATTRIBUTE5";
        $metadata = $this->submitAskQuery($query);
        ksort($metadata, SORT_STRING);

        foreach ($metadata as $element) {
            // the path in $element depends on the datatype of the corresponding Semantic MediaWiki attribute and may
            // differ from $element['printouts']['METADATA_ATTRIBUTE1'][0]['fulltext']

            // assume that $METADATA_ATTRIBUTE1 contains the name of the corresponding page
            $METADATA_ATTRIBUTE1 = $element['printouts']['METADATA_ATTRIBUTE1'][0]['fulltext'];
            $text_title = 'Text:' . $METADATA_ATTRIBUTE1;

            $METADATA_ATTRIBUTE2 = $element['printouts']['METADATA_ATTRIBUTE2'][0]['fulltext'];
            $METADATA_ATTRIBUTE3 = $element['printouts']['METADATA_ATTRIBUTE3'][0]['fulltext'];
            $METADATA_ATTRIBUTE4 = $element['printouts']['METADATA_ATTRIBUTE4'][0]['fulltext'];
            $METADATA_ATTRIBUTE5 = $element['printouts']['METADATA_ATTRIBUTE5'][0]['fulltext'];

            $page_id = $this->getPageIdFromPage($text_title);
            $html = $this->getHTMLToPage($text_title);
            $text = html_entity_decode(strip_tags($this->replaceRefTagsWithNumberedSquaresInHTML($html)));
            $text = str_replace("\n", " ", $text);
            $text = preg_replace("/\s+/", " ", $text);
            $text_length = strlen($text);
            if ($this->debug && $page_id !== $this->test_id) {
                continue;
            }
            array_push($result_json, array(
                'id' => $page_id,
                'METADATA_ATTRIBUTE1' => $METADATA_ATTRIBUTE1,
                'METADATA_ATTRIBUTE2' => $METADATA_ATTRIBUTE2,
                'METADATA_ATTRIBUTE3' => $METADATA_ATTRIBUTE3,
                'METADATA_ATTRIBUTE4' => $METADATA_ATTRIBUTE4,
                'METADATA_ATTRIBUTE5' => $METADATA_ATTRIBUTE5,
                'text_length' => $text_length
            ));
            $texts[$page_id] = array(
                'METADATA_ATTRIBUTE1' => $METADATA_ATTRIBUTE1,
                'text' => $text,
                'html' => $html
            );
        }
        // no special treatment for CSV needed in the case of metadata, returning both times the json
        return array($result_json, $result_json, $texts);
    }

    /**
     * Retrieve the named entities of a single annotation, which are stored on individual pages using
     * Semantic MediaWiki subobjects. The NER-Pages are supposed to be in the namepsace'NamedEntities',
     * with the pagename of the annotation appended to it,
     * e.g., NamedEntities:Annotation:ORIGINALTEXTPAGENAME/RANDOM_ANNOTATION_ID
     *
     *
     * @param string $name name/id of the annotation
     * @return array all entities of that annotation as array
     */
    function getNamedEntitiesSingleAnnotation($name)
    {

        $result = [];
        $result['persons'] = array();
        $result['orgs'] = array();
        $result['locs'] = array();

        // the labels for the entities possible needs to be adapted to your needs
        $searchTitle = 'NamedEntities:' . $name;
        $query = "[[-Has subobject::$searchTitle]]|?Has person|?Has org|?Has loc|mainlabel=Pagetitle";
        $named_entities = $this->submitAskQuery($query);

        foreach ($named_entities as $key => $entities) {
            preg_match_all('/(?<=NamedEntities:Annotation:)(.*\/)(.*)(?=#NER)/', $key, $matches);
            $id = $matches[2][0];
            $title = str_replace("NamedEntities:Annotation:", "", $key);
            $title = str_replace('/' . $id . "#NER", "", $title);

            // "Has person", "Has org", and "Has loc" are the attribute names we used
            // for our use case. Please adapt to your needs.
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


    /**
     * Get the MediaWiki internal ID of a page.
     *
     * @param string $page_title the name of a MediaWiki page
     * @return string the pageid as string
     */
    function getPageIdFromPage($page_title)
    {
        $page_id = "error";
        $title = Title::makeTitle(0, $page_title);
        if (!is_null($title)) {
            $article = new Article($title);
            if (!is_null($article)) {
                $page = $article->getPage();
                if (!is_null($page)) {
                    $revision = $page->getRevision();
                    if (!is_null($revision)) {
                        $page_id = $revision->getRevisionRecord()->getPageId();
                    }
                }
            }
        }
        return $page_id;
    }

    /**
     * Methods retrieves all annotations in the MediaWiki installation make with Semantic Text Annotator
     *
     * @param $dir  path where to store result files on the server (pass through)
     * @return array[] results as JSON and as CSV
     */
    function getAnnotations()
    {

        $result_json = [];
        $result_csv = [];
        $previous_title = '';

        foreach ($this->texts as $page_id => $text_object) {

            $title = $text_object['title'];
            $text = $text_object['text'];
            $html = $text_object['html'];

            /***************************************************************************************/
            /* SMW-Query to retrieve all annotations with metadata and all custom attributes
             */
            $query = '[[Annotation of::+]][[~Text:{$title}*||~Annotationen:{$title}*]]'
                .'|?AnnotationComment|?AnnotationMetadata|?Category'
                .'?LEVEL2CATEGORY1ATTRIBUTE1|?LEVEL2CATEGORY2ATTRIBUTE1|?LEVEL2CATEGORY3ATTRIBUTE1|?LEVEL2CATEGORY4ATTRIBUTE1';

            $annotations = $this->submitAskQuery($query);
            ksort($annotations, SORT_STRING);

            $annotations = $this->removeDuplicatesFromAnnotations($annotations);

            foreach ($annotations as $element) {
                preg_match_all('/(?<=Annotation:)(.*)(?=\/.*)/', $element['fulltext'], $matches);
                $current_title = $matches[0][0];
                // We assume that the page of the text pages begins with the prefix 'Text',
                // but shares the name basename, replace done to retrieve the text of the page
                $current_title = str_replace("Annotationen:", "Text:", $current_title);

                $annotation = $element['printouts'];
                $metadata = json_decode(self::translateBrackets($annotation['AnnotationMetadata'][0]));

                $quote = str_replace("\n", " ", $metadata->quote);
                $quote = preg_replace("/\s+/", " ", $quote);

                list($offset_start_text, $offset_end_text) = $this->calculateAnnotationOffset($text, $quote);

                $namedEntities = [];
                if ($metadata->category === 'LEVEL2CATEGORY1') {
                    $namedEntities = $this->getNamedEntitiesSingleAnnotation($element['fulltext']);
                }

                /**
                 * For CSV format, arrays in the data are translated to a single string, where the individual values are
                 * seprated by the given symbol. This is not wanted for JSON format, hence two different arrays are created
                 */
                array_push($result_csv, array(
                    'page_id' => $page_id,
                    'annotation_id' => $metadata->id,
                    'category' => $metadata->category,
                    'quote' => $metadata->quote,
                    'offsetBegin' => $offset_start_text,
                    'offsetEnd' => $offset_end_text,
                    'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                    'LEVEL2CATEGORY1ATTRIBUTE1' => $this->getFulltextArrayAsString($annotation['LEVEL2CATEGORY1ATTRIBUTE1'], ";") ?: "",
                    'LEVEL2CATEGORY2ATTRIBUTE1 ' => $this->getFulltextArrayAsString($annotation['LEVEL2CATEGORY2ATTRIBUTE1'], ";") ?: "",
                    'LEVEL2CATEGORY3ATTRIBUTE1' => isset($annotation['ATTRIBUTE3'][0]['fulltext']) ? $annotation['LEVEL2CATEGORY3ATTRIBUTE1'][0]['fulltext'] : "",
                    'LEVEL2CATEGORY4ATTRIBUTE1' => isset($annotation['ATTRIBUTE4'][0]['fulltext']) ? $annotation['LEVEL2CATEGORY4ATTRIBUTE1'][0]['fulltext'] : "",
                    'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsString($namedEntities['persons'], ";") : "",
                    'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsString($namedEntities['orgs'], ";") : "",
                    'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsString($namedEntities['locs'], ";") : ""
                ));

                array_push($result_json, array(
                    'page_id' => $page_id,
                    'annotation_id' => $metadata->id,
                    'category' => $metadata->category,
                    'quote' => $metadata->quote,
                    'offsetBegin' => $offset_start_text,
                    'offsetEnd' => $offset_end_text,
                    'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                    'LEVEL2CATEGORY1ATTRIBUTE1' => $this->getFulltextArrayAsArray($annotation['LEVEL2CATEGORY1ATTRIBUTE1']) ?: [],
                    'LEVEL2CATEGORY2ATTRIBUTE1 ' => $this->getFulltextArrayAsArray($annotation['LEVEL2CATEGORY2ATTRIBUTE1']) ?: [],
                    'LEVEL2CATEGORY3ATTRIBUTE1' => isset($annotation['ATTRIBUTE3'][0]['fulltext']) ? $annotation['LEVEL2CATEGORY3ATTRIBUTE1'][0]['fulltext'] : "",
                    'LEVEL2CATEGORY4ATTRIBUTE1' => isset($annotation['ATTRIBUTE4'][0]['fulltext']) ? $annotation['LEVEL2CATEGORY4ATTRIBUTE1'][0]['fulltext'] : "",
                    'persons' => isset($namedEntities['persons']) ? $this->getFulltextArrayAsArray($namedEntities['persons']) : [],
                    'orgs' => isset($namedEntities['orgs']) ? $this->getFulltextArrayAsArray($namedEntities['orgs']) : [],
                    'locs' => isset($namedEntities['locs']) ? $this->getFulltextArrayAsArray($namedEntities['locs']) : []
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

    /**
     * Determine priority based on the given category.
     *
     * This is used when building the HTML representation of the textpages,
     * to guarantee that nested annotations are always processed in the same order.
     *
     * 0 = highest priority
     *
     * @param string $category the category
     * @return int the priority if the
     */
    private function checkPriority($category)
    {
        switch ($category) {
            case "LEVEL 2 CATEGORY 1":
                return 0;
                break;
            case "LEVEL 2 CATEGORY 2":
            case "LEVEL 2 CATEGORY 3":
            case "LEVEL 2 CATEGORY 4":
            case "LEVEL 2 CATEGORY 5":
                return 1;
                break;
            case "LEVEL 3 CATEGORY 1":
                return 2;
                break;
            case "LEVEL 3 CATEGORY 2":
                return 3;
                break;
            default:
                return 4;
        }
    }

    /**
     * Rempove duplicates from the list of annotations by checking the actual quoted text
     * of the annotations. Allows to differ between allowed and unallowed duplicates.
     *
     * @param array $annotations the list of annotations
     * @return array the list without duplicates
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

                    // combination of CATEGORY1 and CATEGORY2 allowed
                    if (($cat1 === 'CATEGORY1' && $cat2 === 'CATEGORY2') ||
                        ($cat1 === 'CATEGORY2' && $cat2 === 'CATEGORY1')) {
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
            }
        }
        return $result;
    }

    /**
     * Method to calculate the offset of the text of annotations in the corresponding text.
     *
     * @param $text string calculate offsets in this text
     * @param $quote string the string we want the offsets to
     * @return array the start and the end position of $quote in $text
     */
    function calculateAnnotationOffset($text, $quote)
    {

        $start_pos_in_text = false;
        $end_pos_in_text = false;

        $start_pos_in_text = strpos($text, $quote);

        // full quote not found in text, try again with a prefix and a suffix
        if ($start_pos_in_text === false) {
            // if text long enough, use 50 characters, else use 25
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


    /**
     * Methods to construct CSV files with PHP, taken from https://stackoverflow.com/questions/16352591/convert-php-array-to-csv-string
     * @param $input
     * @param string $delimiter
     * @param string $enclosure
     * @return string
     */
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

    /**
     * Translate FulltextArray as found in results of ASK-queries to a separated string
     * @param array $array the FulltextArray
     * @param string $separator the seperator for the resulting string
     * @return string $separator separated string representation of the the FulltextArray
     */
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

    /**
     * Translate FulltextArray as found in results of ASK-queries to a PHP array
     * @param array $array the FulltextArray
     * @return array FulltextArray as PHP array
     */
    private function getFulltextArrayAsArray($array)
    {
        $result = [];
        foreach ($array as $elem) {
            array_push($result, $elem['fulltext']);
        }
        return $result;
    }

    /**
     * Translate the bracket-replacements used by Semantic Text Annotator to curly and square brackets
     *
     * @param $text
     * @return string|string[]
     */
    private function translateBrackets($text)
    {
        $text = str_replace("^", "{", $text);
        $text = str_replace("°", "}", $text);
        $text = str_replace("Ӷ", "[", $text);
        $text = str_replace("Ӻ", "]", $text);
        $text = str_replace("&#160;", " ", $text);
        return $text;
    }

    /**
     * Get HTML representation of a MediaWiki page to a given page title.
     *
     * @param string $page_title the title of the MediaWiki page
     * @return mixed the HTML code of the page
     */
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
     * Retrieve the plain text of a MediaWiki page
     *
     * @param string $page_title the title of the MediaWiki page
     * @return string the content of the page as plain text (including wiki formatting, etc.)
     */
    private function getTextToPage($page_title)
    {
        try {
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
     * Replace MediaWiki stylel formatting of footnotes with Square brackets and number to match the reprsentation
     * in the text in the annotations saved by Semantic Text Annotator. Save references to append list of footnotes.
     *
     * @param string $text the text of the MediaWiki page
     * @return array the text with the replacements and a list of all references for later use
     */
    private function replaceRefTagsWithNumberedSquaresInPlainText($text)
    {
        $tmp_text = $text;
        $references = [];
        $pattern_ref = '/\<ref\>([^<]*)\<\/ref\>/';
        preg_match_all($pattern_ref, $text, $matches, PREG_OFFSET_CAPTURE);

        foreach ($matches[0] as $key => $ref) {
            $tmp_text = str_replace($ref[0], '[' . ($key + 1) . ']', $tmp_text);
            $references[$key + 1] = $matches[1][$key][0];
        }
        return array($tmp_text, $references);
    }

    /**
     * Replace MediaWiki style formatting of footnotes with square brackets and number to match
     * the representation in the text in the annotations saved by Semantic Text Annotator.
     *
     * @param $text
     * @return string
     */
    private function replaceRefTagsWithNumberedSquaresInHTML($text)
    {
        $tmp_text = $text;
        $pattern_ref = '/\<ref\>([^<]*)\<\/ref\>/';
        preg_match_all($pattern_ref, $text, $matches, PREG_OFFSET_CAPTURE);

        foreach ($matches[0] as $key => $ref) {
            $tmp_text = str_replace($ref[0], '[' . ($key + 1) . ']', $tmp_text);
            $tmp_text .= "<br>" . ($key + 1) . '. ' . $matches[1][$key][0];
        }
        return $tmp_text;
    }

    /**
     * Translate wiki style formatted text headers into HTML h1 to h4 tags.
     *
     * @param string $text the text of the MediaWiki page
     * @return string|string[] the text with the headers replaced
     */
    private function replaceWikiHeaderWithHTMLHeaders($text)
    {
        // wiki style text headers
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

    /**
     * Helper method to change wiki style text headers in the text
     *
     * @param array $matches list of occurrences of the corresponding header
     * @param string $text the text of the MediaWiki page
     * @param string $open the opening HTML-tag to use
     * @param string $close the closing HTML-tag to use
     * @return string|string[] the text with the text headers replaced
     */
    private function translateHeader($matches, $text, $open, $close)
    {
        $tmp_text = $text;
        for ($i = 0; $i < sizeof($matches[0]); $i++) {
            $needle = $matches[0][$i][0];
            $replace_with = $open . substr($matches[1][$i][0], 0, strlen($matches[1][$i][0]) - 1) . $close;
            $tmp_text = str_replace($needle, $replace_with, $tmp_text);
        }
        return $tmp_text;
    }

    /**
     * Translate wiki style formatted notes in the text of a MediaWiki page and translate into an HTML list.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text with the tranlates wiki style notes
     */
    private function translateNotes($text)
    {
        $pattern_notes = '/#(.*)\n*/';
        preg_match_all($pattern_notes, $text, $matches, PREG_OFFSET_CAPTURE);
        $tmp_text = $text;
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
            $tmp_text = str_replace($needle, $replace_with, $tmp_text);
        }
        return $tmp_text;
    }


    /**
     * Helper method to remove wiki style poem-tags in the text of a MediaWiki page.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text without poem-tags
     */
    private function removePoemTag($text)
    {
        $text = str_replace('<poem>', "", $text);
        return str_replace('</poem>', "", $text);
    }

    /**
     * Helper method to remove the wiki style references-tag from the text of a MediaWiki page.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[]|null the text of a Mediawiki page without the references-tag
     */
    private function removeReferenceTag($text)
    {
        return preg_replace('/\<references \/\>/', "", $text);
    }

    /**
     * Helper method to remove BR-tags from the text of a MediaWiki page.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text of a MediaWiki page without the BR-tags
     */
    private function removeBrTags($text)
    {
        return str_replace('<br>', "", $text);
    }

    /**
     * Helper method to remove B-tags from the text of a MediaWiki page
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text of a MediaWiki page without B-tags
     */
    private function removeBTags($text)
    {
        $text = str_replace('<b>', "", $text);
        return str_replace('</b>', "", $text);
    }

    /**
     * Helper method to remove P-tags, that are around text header tags in the text of a MediaWiki page.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text of a MediaWiki page without P-tags wrapped around text header tags
     */
    private function removePAroundH($text)
    {
        $text = str_replace('<p><h', "<h", $text);
        $text = str_replace('</h1></p>', "</h1>", $text);
        $text = str_replace('</h2></p>', "</h2>", $text);
        $text = str_replace('</h3></p>', "</h3>", $text);
        return str_replace('</h4></p>', "</h4>", $text);
    }

    /**
     * Helper method to remove block-quote tags in the text of a MediaWiki text.
     *
     * @param string $text the text of a MediaWiki page
     * @return string|string[] the text of a MediaWiki page without blockquote tags
     */
        private function removeBlockquote($text)
    {
        $text = str_replace('<blockquote>', "", $text);
        return str_replace('</blockquote>', "", $text);
    }
}
