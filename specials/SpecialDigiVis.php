<?php

/**
 * digiVis SpecialPage for DigiVis extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialDigiVis extends SpecialPage {
	public function __construct() {
		parent::__construct('digiVis');
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute($sub) {
		$out = $this->getOutput();
		$out->addModules('ext.digiVis.special');
		$out->addModuleStyles('ext.digiVis.special');

		$out->enableOOUI();

		$out->setPageTitle($this->msg('special-digiVis-title'));
		$out->addWikiMsg('special-digiVis-intro');

		$btnNer = new OOUI\ButtonWidget([
			'infusable' => true,
			'id' => 'btnRunNER',
			'label' => 'Run NER on all Annotations of Category Argumentationen2'
		]);
		$out->addHTML($btnNer);
	}

	protected function getGroupName() {
		return 'DigiVis';
	}


}
