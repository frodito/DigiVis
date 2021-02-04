/*
authors:  Caroline Haller
Manfred Moosleitner
*/
<?php

/**
 * DigiVis SpecialPage providing a convenient overview over all annotations. The text of the Annotations can be searched
 * through and filtered by categories.
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

		// container to add the overview
		$out->addHTML('<div class="digivis-annotationlist"></div>');

	}

	protected function getGroupName() {
		return 'DigiVis';
	}
}
