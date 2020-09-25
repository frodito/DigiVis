<?php
/**
 * Created by PhpStorm.
 * User: frod
 * Date: 06/03/19
 * Time: 11:02
 */
/**
 * digiVis SpecialPage for DigiVisVis extension
 *
 * @file
 * @ingroup Extensions
 */
class SpecialDigiVisVis extends SpecialPage {
	public function __construct() {
		parent::__construct('visDigiVis');
	}

	/**
	 * Show the page to the user
	 *
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute($sub) {
		$out = $this->getOutput();
		$out->addModules('ext.digiVis.vis');
		$out->addModuleStyles('ext.digiVis.vis');

		$out->enableOOUI();

		$out->setPageTitle($this->msg('special-digiVis-vis-title'));
		$out->addHelpLink('How to become a MediaWiki hacker');
		$out->addWikiMsg('special-digiVis-vis-intro');

//		$out->addHTML('<div class="digiVis-vis" id="digiVis-vis"></div>');
//		$out->addHTML('<p><svg class="chart"></svg></p>');
//		$out->addHTML('<div class="bubblechart"></div>');
//		$out->addHTML('<div id="bubble-word" class="bubble-word"></div>');
		$out->addHTML('<div class="withAxis"></div>');

	}

	protected function getGroupName() {
		return 'DigiVis';
	}
}