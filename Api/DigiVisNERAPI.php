<?php

use ApiBase;
use MediaWiki\MediaWikiServices;

class DigiVisNERAPI extends ApiBase {

	/**
	 * @see ApiBase::execute
	 */
	public function execute() {
		// use extension config to get username and password for bot to create pages
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig('DigiVis');
		$user = $config->get('DigiVisNERUser');
		$password = $config->get('DigiVisNERPassword');
		$this->loginNERBot($user, $password);

		// create template if it does not exist
		if (!$this->checkPageExists("Template:NamedEntitiesPage")) {
			$this->createPage("Template:NamedEntitiesPage", "<noinclude>\nThis is the \"NamedEntitiesPage\" template.\nIt should be called in the following format:\n<pre>\n{{NamedEntitiesPage}}\n</pre>\nEdit the page to see the template text.\n</noinclude><includeonly>{{#ask: [[-Has subobject::{{FULLPAGENAME}}]]\n |?Has org\n |?Has date\n |?Has person\n |?Has gpe\n |?Has money\n |?Has cardinal\n |?Has norp\n |?Has percent\n |?Has work_of_art\n |?Has loc\n |?Has time\n |?Has quantity\n |?Has fac\n |?Has event\n |?Has product\n |?Has ordinal\n |?Has law\n |?Has language\n |mainlabel=-\n |format=broadtable|headers=plain|class=sortable wikitable smwtable\n}}\n[[Category:NamedEntitiesPages]]\n</includeonly>\n");
		}

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
		$data = $api->getResult()->getResultData();
		$status = $data['login'];
		if ($status['result'] !== "Success") {
			// TODO: handle failed login
			$error = true;
		}
	}

	/**
	 * Adding required parameter 'rawtext'
	 * @return array
	 */
	protected function getAllowedParams() {
//		return [
//			'rawtext' => [
//				ApiBase::PARAM_TYPE => 'string',
//				ApiBase::PARAM_REQUIRED => true,
//			],
//		];
		return [];
	}

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

	private function analyzeText() {
		// path to temporarily store text in file
		$path = getcwd() . "/extensions/DigiVis/scripts/";
		exec("/usr/bin/python3 " . $path . "DigiVisNER.py", $ret);
		return $ret[0];
	}

	private function getAnnotations() {
		$query = '[[Annotation of::+]][[Category:Argumentationen2]]|?Category|?AnnotationMetadata';
		return $this->submitAskQuery($query);
	}

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

	private function translateBrackets($text) {
		$text = str_replace("^", "{", $text);
		$text = str_replace("°", "}", $text);
		$text = str_replace("Ӷ", "[", $text);
		$text = str_replace("Ӻ", "]", $text);
		$text = str_replace("&#160;", " ", $text);
		return $text;
	}
}