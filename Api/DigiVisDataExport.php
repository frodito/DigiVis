<?php
/**
 * Class DigiVisDataExport
 * This class was written in the context of the project DigiVis and its purpose is to collect the text of specific pages
 * and annotations created with the MediaWiki extension SemanticTextAnnotator. Processing steps are applied to the
 * collected data, which can be output as JSON or CSV. Additional, an HTML version of the texts is created. The output
 * of the CSV and the text/html-files is done in a specified folder on the server running MediaWiki.
 */

class DigiVisDataExport extends ApiBase
{

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

        // create folder with current date and time
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

        // collect metadata from specified pages and store as CSV on server if specified in the API call
        if ($content === 'metadata' || $content === 'all') {
            list($result_json, $result_csv) = $this->getMetadata($dir);
            $filename_csv = $dir . 'metadata_extract.csv';

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
            list($result_json, $result_csv) = $this->getAnnotations($dir);
            $filename_csv = $dir . 'annotation_extract.csv';
            // specify which fields of the annotations are used in the CSV file,
            // e.g., $header = "title,id,category,quote,offsetBegin,offsetEnd,comment,topics,innovation_type,reference_type,narrative_type\r\n";;
            $header = "\r\n";
            if ($form === 'text') {
                $this->writeCSV($filename_csv, $result_csv, $header);
            }
            array_push($result, array(
                'annotations' => $result_json
            ));
        }
        $this->getResult()->addValue(null, $this->getModuleName(), $result);
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
     * @param $dir path to the folder when the text of the pages should be stored (pass through)
     * @return array[] contains the results
     */
    function getMetadata($dir)
    {
        $result_json = [];

        /**
         * Text of the ask query, contains a page-selection with a category, which is followed by the fields to
         * retrieve. See the documentation about ask-queries in the wiki of Semantic MediaWiki for full details on
         * how ask queries work https://www.semantic-mediawiki.org/wiki/Semantic_MediaWiki.
         */
        $query = "[[Category:PUT_YOUR_CATEGORY_HERE]]" .
            "|?ATTRIBUTE1|?ATTRIBUTE2|?ATTRIBUTE3|?ATTRIBUTE4|?ATTRIBUTE5";
        $metadata = $this->submitAskQuery($query);
        ksort($metadata, SORT_STRING);

        foreach ($metadata as $element) {
            // the path in $element depends on the datatype of the corresponding Semantic MediaWiki attribute and may
            // differ from $element['printouts']['ATTRIBUTE1'][0]['fulltext']
            $ATTRIBUTE1 = $element['printouts']['ATTRIBUTE1'][0]['fulltext'];
            $ATTRIBUTE2 = $element['printouts']['ATTRIBUTE2'][0]['fulltext'];
            $ATTRIBUTE3 = $element['printouts']['ATTRIBUTE3'][0]['fulltext'];
            $ATTRIBUTE4 = $element['printouts']['ATTRIBUTE4'][0]['fulltext'];
            $ATTRIBUTE5 = $element['printouts']['ATTRIBUTE5'][0]['fulltext'];

            array_push($result_json, array(
                'title' => $ATTRIBUTE1,
                'author' => $ATTRIBUTE2,
                'location' => $ATTRIBUTE3,
                'published_date' => $ATTRIBUTE4,
                'published_media' => $ATTRIBUTE5,

                // assume that $ATTRIBUTE1 holds the name of the corresponding MediaWiki page
                'text_length' => strlen($this->getTextToPage('Text:' . $ATTRIBUTE1, $dir))
            ));
        }
        // no special treatment for CSV needed in the case of metadata, returning both times the json
        return array($result_json, $result_json);
    }

    /**
     * Methods retrieves all annotations in the MediaWiki installation make with Semantic Text Annotator
     * @param $dir  path where to store result files on the server (pass through)
     * @return array[] results as JSON and as CSV
     */
    function getAnnotations($dir)
    {

        $result_json = [];
        $result_csv = [];
        $previous_title = '';

        /***************************************************************************************/
        /* SMW-Query to select annotations, set $debug to false to select all annotations and
         * to true, to select only annotations to specific text (set $debug_title.
         */
        $debug = false;

        // only the last line of the query needs to be adapted to the attributes used by your use case,
        // e.g., '?ist Thema|?ist Innovationstyp|?Referenztyp|?Narrativtyp'
        if (!$debug) {    // normal mode of operation
            $query = '[[Annotation of::+]][[~Text:*||~Annotationen:*]]' .
                '|?AnnotationComment|?AnnotationMetadata|?Category|' .
                '?ATTRIBUTE_A|?ATTRIBUTE_B|?ATTRIBUTE_C|?ATTRIBUTE_D';

        } else {    // query for single document
            $debug_title = 'Why I Consider Myself a Cybernetician';
            $query = '[[Annotation of::+]]' .
                '[[~Text:' . $debug_title . '*||~Annotationen:' . $debug_title . '*]]' .
                '|?AnnotationComment|?AnnotationMetadata|?Category|' .
                '?ATTRIBUTE_A|?ATTRIBUTE_B|?ATTRIBUTE_C|?ATTRIBUTE_D';
        }

        $annotations = $this->submitAskQuery($query);
        ksort($annotations, SORT_STRING);

        $count_annotations_before = count($annotations);
        $annotations = $this->removeDuplicatesFromAnnotations($annotations);
        if ($count_annotations_before !== count($annotations)) {
            // if there are still duplicates, put some postprocessing here
        }

        foreach ($annotations as $element) {
            // extract name of MediaWiki page of current annotation with regular expression
            preg_match_all('/(?<=Annotation:)(.*)(?=\/.*)/', $element['fulltext'], $matches);
            $current_title = $matches[0][0];

            // We assume that the page of the text pages begins with the prefix 'Text', replace done to retrieve
            // the text of the page
            $current_title = str_replace("Annotationen:", "Text:", $current_title);

            // only need to retrieve the page of the text if not already done in previous iteration
            if ($current_title !== $previous_title) {
                $pagetext = $this->getTextToPage($current_title, $dir);
                if (isnull($pagetext)) {
                    continue;
                }
            }

            $annotation = $element['printouts'];
            // Semantic Text Annotator uses different symbols for the brackets, we change them back
            // to be able to translate the annotation metadata into JSON format
            $metadata = json_decode(self::translateBrackets($annotation['AnnotationMetadata'][0]));

            // quality checks if the quote stored in the annotations by Semantic Text Annotator can be found in the
            // text of the page, prints the calculated offset and some additional text to spot errors in the extract
            list($start, $end) = $this->calculateAnnotationOffset($pagetext, $metadata->quote);
            $start = $start ?: "error";
            $end = $end ?: "error";
            if (is_numeric($start) && is_numeric($end)) {
                if ($start > $end) {
                    $start = $start . ' AFTER END';
                    $end = $end . ' BEFORE START';
                }
            }


            /**
             * For CSV format, arrays in the data are translated to a single string, where the individual values are
             * seprated by the given symbol. This is not wanted for JSON format, hence two different arrays are created
             */
            array_push($result_csv, array(
                'title' => $current_title,
                'annotation_id' => $metadata->id,
                'category' => $metadata->category,
                'quote' => $metadata->quote,
                'offsetBegin' => $start,
                'offsetEnd' => $end,
                'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                'ATTRIBUTE_A' => $this->getFulltextArrayAsString($annotation['ATTRIBUTE_A'], ";") ?: "",
                'ATTRIBUTE_B ' => $this->getFulltextArrayAsString($annotation['ATTRIBUTE_B'], ";") ?: "",
                'ATTRIBUTE_C' => isset($annotation['Referenztyp'][0]['fulltext']) ? $annotation['ATTRIBUTE_C'][0]['fulltext'] : "",
                'ATTRIBUTE_D' => isset($annotation['Narrativtyp'][0]['fulltext']) ? $annotation['ATTRIBUTE_D'][0]['fulltext'] : ""
            ));

            array_push($result_json, array(
                'title' => $current_title,
                'annotation_id' => $metadata->id,
                'category' => $metadata->category,
                'quote' => $metadata->quote,
                'offsetBegin' => $start,
                'offsetEnd' => $end,
                'comment' => isset($annotation['AnnotationComment'][0]) ? $annotation['AnnotationComment'][0] : "",
                'ATTRIBUTE_A' => $this->getFulltextArrayAsArray($annotation['ATTRIBUTE_A']) ?: [],
                'ATTRIBUTE_B ' => $this->getFulltextArrayAsArray($annotation['ATTRIBUTE_B']) ?: [],
                'ATTRIBUTE_C' => isset($annotation['ATTRIBUTE_C'][0]['fulltext']) ? $annotation['ATTRIBUTE_C'][0]['fulltext'] : "",
                'ATTRIBUTE_D' => isset($annotation['ATTRIBUTE_D'][0]['fulltext']) ? $annotation['ATTRIBUTE_D'][0]['fulltext'] : ""
            ));
            $previous_title = $current_title;
        }

        return array($result_json, $result_csv);
    }

    /**
     * Remove duplicates from the list of annotations
     *
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
            } else {
                // This case should realistically not happen
            }
        }
        return $result;
    }

    /**
     * Method to calculate the offset of the text of annotations in the corresponding text.
     * Simply only searching for the substring does not suffice, as the text stored by Semantic Text Annotator is taken
     * from the rendered page in the browser, and the text of the page is directly retrieved from MediaWiki
     * @param $text string calculate offsets in this text
     * @param $quote string the string we want the offsets to
     * @return array the start and the end position of $quote in $text
     */
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
    private
    function getFulltextArrayAsString($array, $separator)
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
    private
    function getFulltextArrayAsArray($array)
    {
        $result = [];
        foreach ($array as $elem) {
            array_push($result, $elem['fulltext']);
        }
        return $result;
    }


    /**
     * Translate the bracket-replacements used by Semantic Text Annotator to curly and square brackets
     * @param $text
     * @return string|string[]
     */
    private
    function translateBrackets($text)
    {
        $text = str_replace("^", "{", $text);
        $text = str_replace("°", "}", $text);
        $text = str_replace("Ӷ", "[", $text);
        $text = str_replace("Ӻ", "]", $text);
        $text = str_replace("&#160;", " ", $text);
        return $text;
    }

    /**
     * Retrieve the text from a MediaWiki page
     * @param $current_title string title of the MediaWiki page
     * @param $dir string the path where to save the pagetext
     * @return string|null the text of the page if found or empty string
     */
    private function getTextToPage($current_title, $dir)
    {
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

            // We assume that the page of the text pages begins with the prefix 'Text', replace done to retrieve
            // the text of the page
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

    /**
     * Replace MediaWiki style formatting of footnotes with square brackets and number to match
     * the representation in the text in the annotations saved by Semantic Text Annotator
     * @param $text
     * @return string
     */
    private function replaceRefTagsWithNumberedSquares($text)
    {
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
