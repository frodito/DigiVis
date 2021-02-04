/*
authors:  Caroline Haller
Manfred Moosleitner
*/

<?php

/**
 * digiVis SpecialPage for DigiVis extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialDigiVisWalkCreator extends SpecialPage {
	public function __construct() {
		parent::__construct('WalkCreatorDigiVis');
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute($sub) {
		$out = $this->getOutput();
		$out->addModules('ext.digiVis.special.walkcreator');
		$out->addModuleStyles('ext.digiVis.special.walkcreator');


		$out->enableOOUI();

		$out->setPageTitle($this->msg('special-digiVis-walkcreator-title'));

		$out->addHTML('<div class="digivis-walkcreator-container"></div>');
		$out->addHTML('<div class="overlayOuter"><h3 class="overlayTitle"></h3><p class="overlayText"></p><button class="overlayCloseButton">X</button><button class="previous_annotation">&#8678;</button><button class="next_annotation">&#8680;</button></div>');
	}

	protected function getGroupName() {
		return 'DigiVis';
	}
}
