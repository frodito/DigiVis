/*
authors:  Caroline Haller
Manfred Moosleitner
*/

<?php
/**
 * Class represents the API functionality of running named entity recognition on the text of annotations created with
 * the MediaWiki extension Semantic Text annotator.
 * The code creates a needed Wiki template in the case it does not exist. Then it creates a temporary directory to store
 * the annotations in JSON-format on the server. When the text file is created, the code calls a python program to run
 * the NER on the annotations and retrieves the results. From the results, additional pages are created for each annotation,
 * which hold the named entities identified.
 *
 * For this functionality to fully work, a bot-user needs to be created prior by using the specialpage "Special:BotPasswords"
 * in your MediaWiki installation, see https://www.mediawiki.org/wiki/Manual:Bot_passwords for details.

 * The credentials for the bot user need to be provided via the LocalSettings.php as follows:
 *
 * $wgDigiVisNERUser = NAME_OF_YOUR_BOT_USER;
 * $wgDigiVisNERPassword = YOUR_SECRET_PASSWORT;
 */

use ApiBase;
use MediaWiki\MediaWikiServices;

class DigiVisNERAPI extends ApiBase {

	/**
     *
	 * @see ApiBase::execute
	 */
	public function execute() {
		// use extension config to get username and password for bot to create pages
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig('DigiVis');
		$user = $config->get('DigiVisNERUser');
		$password = $config->get('DigiVisNERPassword');
		$this->loginNERBot($user, $password);

		// create template for NER-pages if it does not exist
		if (!$this->checkPageExists("Template:NamedEntitiesPage")) {
			$this->createPage("Template:NamedEntitiesPage", "<noinclude>\nThis is the \"NamedEntitiesPage\" template.\nIt should be called in the following format:\n<pre>\n{{NamedEntitiesPage}}\n</pre>\nEdit the page to see the template text.\n</noinclude><includeonly>{{#ask: [[-Has subobject::{{FULLPAGENAME}}]]\n |?Has org\n |?Has date\n |?Has person\n |?Has gpe\n |?Has money\n |?Has cardinal\n |?Has norp\n |?Has percent\n |?Has work_of_art\n |?Has loc\n |?Has time\n |?Has quantity\n |?Has fac\n |?Has event\n |?Has product\n |?Has ordinal\n |?Has law\n |?Has language\n |mainlabel=-\n |format=broadtable|headers=plain|class=sortable wikitable smwtable\n}}\n[[Category:NamedEntitiesPages]]\n</includeonly>\n");
		}

		// create temporary directory to store the JSON file on the server and set needed permissions
		$filename = tempnam(getcwd() . "/extensions/DigiVis/tmp/ner/", 'tmp_');
		chmod($filename, 0744);
		$handle = fopen($filename, "w");
		$text = $this->prepareAnnotationsJSON();
		fwrite($handle, $text);
		fclose($handle);
		$results = $this->processNER($this->analyzeText());
		$this->getResult()->addValue(null, '$ret', $results);
		unlink($filename);
	}

    /**
     * Get all annotations, extract the text quote and build JSON string to write on the server.
     *
     * @return false|string returns the needed data from the annotations as JSON string
     */
    private function prepareAnnotationsJSON() {
        $annotation_quote = array();
        $annotations = $this->getAnnotations();
        foreach ($annotations as $element) {
            $annotation = $element['printouts'];
            $id = $element['fulltext'];
            $metadata = json_decode(self::translateBrackets($annotation['AnnotationMetadata'][0]));
            $annotation_quote[$id] = $metadata->quote;
        }
        return json_encode($annotation_quote);
    }

    /**
     * Build ask-query for the MediaWiki API to get all annotations that should be processed with NER.
     * ASK-Query needs to be adapted to your use case, i.e., fill in the category you used or adapt if you want to run
     * NER on annotations of more than one category.
     *
     * @return array the result of the ask-query
     */
    private function getAnnotations() {
        $query = '[[Annotation of::+]][[Category:YOUR_CATEGORY]]|?Category|?AnnotationMetadata';
        return $this->submitAskQuery($query);
    }

    /**
     * Helper function to run a Semantic MediaWiki ask-query against the MediaWiki API. Handles the situation if more
     * annotations are created in MediaWiki than can be retrieved in one query execution.
     *
     * @param string $query the text of the ask-query
     * @return array the results of the ask-query from the MediaWiki API
     */
    private function submitAskQuery($query) {
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

    /**
     * Calls the python program, which runs the named entity recognition on the text of the annotations via system call.
     *
     * @return mixed the NER result from the python program as JSON string
     */
    private function analyzeText() {
        // path to temporarily store text in file
        $path = getcwd() . "/extensions/DigiVis/scripts/";
        exec("/usr/bin/python3 " . $path . "DigiVisNER.py", $ret);
        return $ret[0];
    }

    /**
     * Takes in the result from the NER as JSON string and processes the results by creating a MediaWiki page for the
     * named entities with the help of Semantic MediaWiki subobjects.
     *
     * @param string $json_string the result of the NER as JSON string
     * @return array the results to display to the user executing the API call
     */
    private function processNER($json_string) {
		$results = array();
		$json = json_decode($json_string, true);
		foreach ($json as $annotation_id => $named_entities) {
			// create page with subobjects,
			$sep = ";";
			$page_name = "NamedEntities:" . $annotation_id;
			$page_content = "{{#subobject:NER\n";
			foreach ($named_entities as $label => $entities) {
				$label = strtolower($label);
				$page_content .= " |Has $label=";
				foreach ($entities as $key => $entity) {
					$page_content .= ($key === end($entities) ? $entity : $entity . $sep);
				}
				$page_content .= "|+sep=;\n";
			}
			$page_content .= "}}\n";
			$page_content .= "{{NamedEntitiesPage}}";

			if ($this->checkPageExists($page_name)) {
				$result = $this->appendPage($page_name, $page_content);
			} else {
				$result = $this->createPage($page_name, $page_content);
			}
			array_push($results, $result);
		}
		return $results;
	}

    /**
     * Helper method to check if a MediaWiki page with a specific name already exists.
     *
     * @param string $title the name of the MediaWiki page to look up
     * @return bool true if the page exists, false if the page does not exist
     */
	private function checkPageExists($title) {
		$req_params = array(
			'action' => 'query',
			'titles' => $title,
			'format' => 'json'
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req);
		$api->execute();
		$pageid = array_keys($api->getResult()->getResultData()['query']['pages'])[0];
		return ($pageid === -1 ? false : true);
	}

    /**
     * Helper method to create a new page in MediaWiki with the given name and text.
     *
     * @param string $title the name of the new MediaWiki page
     * @param string $text the content of the new MediaWiki page
     * @return mixed returns the results of the MediaWiki API
     */
	private function createPage($title, $text) {
		$editToken = $this->getEditToken();
		$req_params = array(
			'action' => 'edit',
			'title' => $title,
			'text' => $text,
			'token' => $editToken,
			'format' => 'json'
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req, true);
		$api->execute();
		return $api->getResult()->getResultData();
	}

    /**
     * Helper method to append text to an already existing MediaWiki page.
     *
     * @param string $title the name of the existing MediaWiki page
     * @param string $text the content to be appended to the MediaWiki page
     * @return mixed returns the result of the MediaWiki API
     */
	private function appendPage($title, $text) {
		$editToken = $this->getEditToken();
		$req_params = array(
			'action' => 'edit',
			'title' => $title,
			'appendtext' => $text,
			'token' => $editToken,
			'format' => 'json'
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req, true);
		$api->execute();
		return $api->getResult()->getResultData();
	}

    /**
     * Helper method to get a token from the MediaWiki API. Needed for creating and editing MediaWiki pages via the API.
     *
     * @return mixed the result of the API call
     */
	private function getEditToken() {
		$req_params = array(
			'action' => 'query',
			'meta' => 'tokens',
			'type' => 'csrf',
			'format' => 'json'
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req);
		$api->execute();
		return $api->getResult()->getResultData()['query']['tokens']['csrftoken'];
	}

    /**
     * Helper method to get a login-token from the MediaWiki API.
     *
     * @return mixed the result of the API call
     */
	private function getLoginTokenNERBot() {
		$req_params = array(
			'action' => 'query',
			'format' => 'json',
			'meta' => 'tokens',
			'type' => 'login'
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req, true);
		$api->execute();
		$loginToken = $api->getResult()->getResultData()['query']['tokens']['logintoken'];
		$cookie = $api->getRequest()->getAllHeaders()['COOKIE'];
		return $loginToken;
	}

    /**
     * Helper method to login the MediaWiki bot user used to create and edit the pages.
     *
     * @param string $user the name of the bot-user, stored in LocalSetting.php
     * @param string $password the password of the bot-user, stored in LocalSettings.php
     */
	private function loginNERBot($user, $password) {
		$login_token = $this->getLoginTokenNERBot();
		$req_params = array(
			'action' => 'login',
			'format' => 'json',
			'lgname' => $user,
			'lgpassword' => $password,
			'lgtoken' => $login_token
		);
		$req = new DerivativeRequest($this->getRequest(), $req_params, true);
		$api = new ApiMain($req);
		$api->execute();
		$api->execute();
		$data = $api->getResult()->getResultData();
		$status = $data['login'];
		if ($status['result'] !== "Success") {
			// TODO: handle failed login
			$error = true;
		}
	}

    /**
     * Helper method to translate bracket symbols used by Semantic Text annotator to curly and square brackets.
     *
     * @param string $text the text which needs the replacement
     * @return string|string[] the text with the replaced brackets
     */
	private function translateBrackets($text) {
		$text = str_replace("^", "{", $text);
		$text = str_replace("°", "}", $text);
		$text = str_replace("Ӷ", "[", $text);
		$text = str_replace("Ӻ", "]", $text);
		$text = str_replace("&#160;", " ", $text);
		return $text;
	}
}