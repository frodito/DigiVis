<?php

/**
 * digiVis SpecialPage for DigiVis extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialDigiVisAnnotationList extends SpecialPage {
	public function __construct() {
		parent::__construct('annotationListDigiVis');
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute($sub) {
		$out = $this->getOutput();
		$out->addModules('ext.digiVis.special.annotationlist');
		$out->addModuleStyles('ext.digiVis.special.annotationlist');

		$out->enableOOUI();

		$out->setPageTitle($this->msg('special-digiVis-annotationlist-title'));

		$out->addHTML('<div class="digivis-annotationlist"></div>');

	}

	protected function getGroupName() {
		return 'DigiVis';
	}
}
