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

	public function walkCreatorHTML() {
		$html = <<<MULTILINESTRING
<table class="container-table" id="container-table">
	<tr>
		<th>
			<div>
				<input type="text" placeholder="Name of walk" name="walkName" id="walkname">
				<button id="btnLoadWalk">Load walk</button>
				<button id="btnSaveWalk">Save walk</button>
			</div>
		</th>
		<th>
			Annotations
			<input type="text" placeholder="Search.." name="search" id="filter_annotation">
		</th>
		<th>Search</th>
	</tr>
	<tr>
		<td class="drop-column" id="drop-column">
			Drop annotations in the field below.
			<ol class="droparea" id="droparea"></ol>
		</td>
		<td class="select-column" id="select-column">
			<div class="selectarea" id="selectarea"></div>
		</td>
		<td>
			<div class="filterWrapper">
				<div class="hierarchyWrapper">
					<ul class="treeview">
						<li>
							<input type="checkbox" name="all" id="all" checked>
							<label for="all" class="custom-checked">Alle</label>
							<ul>
								<li>
									<input type="checkbox" name="argumentation2" id="arg" checked>
									<label for="arg" class="custom-checked">Argumentationen</label>
									<ul>
										<li>
											<input type="checkbox" name="arg-1" id="arg-1" checked>
											<label for="arg-1" class="custom-checked">Anpassung</label>
										</li>
										<li>
											<input type="checkbox" name="arg-2" id="arg-2" checked>
											<label for="arg-2" class="custom-checked">Bedeutung</label>
										</li>
										<li>
											<input type="checkbox" name="arg-3" id="arg-3" checked>
											<label for="arg-3" class="custom-checked">Erfahrung</label>
										</li>
										<li>
											<input type="checkbox" name="arg-4" id="arg-4" checked>
											<label for="arg-4" class="custom-checked">Evolution</label>
										</li>
										<li>
											<input type="checkbox" name="arg-5" id="arg-5" checked>
											<label for="arg-5" class="custom-checked">Lernen</label>
										</li>
										<li>
											<input type="checkbox" name="arg-6" id="arg-6" checked>
											<label for="arg-6" class="custom-checked">Raum und Zeit</label>
										</li>
										<li>
											<input type="checkbox" name="arg-7" id="arg-7" checked>
											<label for="arg-7" class="custom-checked">Realität</label>
										</li>
										<li>
											<input type="checkbox" name="arg-8" id="arg-8" checked>
											<label for="arg-8" class="custom-checked">Sprache</label>
										</li>
										<li>
											<input type="checkbox" name="arg-9" id="arg-9" checked>
											<label for="arg-9" class="custom-checked">Viabilität</label>
										</li>
										<li>
											<input type="checkbox" name="arg-10" id="arg-10" checked>
											<label for="arg-10" class="custom-checked">Vorstellung</label>
										</li>
										<li>
											<input type="checkbox" name="arg-11" id="arg-11" checked>
											<label for="arg-11" class="custom-checked">Wahrnehmung</label>
										</li>
										<li class="last">
											<input type="checkbox" name="arg-12" id="arg-12" checked>
											<label for="arg-12" class="custom-checked">Wissen</label>
										</li>
									</ul>
								</li>
								<li>
									<input type="checkbox" name="innovationsdiskurs2" id="innovdisk" checked>
									<label for="innovdisk" class="custom-checked">Innovationsdiskurs</label>
									<ul>
										<li>
											<input type="checkbox" name="innovdisk-1" id="innovdisk-1" checked>
											<label for="innovdisk-1" class="custom-checked">Akzeptieren neuer
												Erkenntnisse</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-2" id="innovdisk-2" checked>
											<label for="innovdisk-2" class="custom-checked">Bruch mit der klasischen
												Erkenntnistheorie</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-3" id="innovdisk-3" checked>
											<label for="innovdisk-3" class="custom-checked">Eigene Lücken
												aufzeigen</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-4" id="innovdisk-4" checked>
											<label for="innovdisk-4" class="custom-checked">Infragestellen</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-5" id="innovdisk-5" checked>
											<label for="innovdisk-5" class="custom-checked">Infragestellen der
												traditionellen
												Erkenntnistheorie</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-6" id="innovdisk-6" checked>
											<label for="innovdisk-6" class="custom-checked">Irreführungen
												aufzeigen</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-7" id="innovdisk-7" checked>
											<label for="innovdisk-7" class="custom-checked">Kritik am trivialen
												Konstruktivismus</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-8" id="innovdisk-8" checked>
											<label for="innovdisk-8" class="custom-checked">Kritik an den
												Skeptikern</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-9" id="innovdisk-9" checked>
											<label for="innovdisk-9" class="custom-checked">Kritik an der traditionellen
												Erkenntnistheorie</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-10" id="innovdisk-10" checked>
											<label for="innovdisk-10" class="custom-checked">Missverständnisse
												aufzeigen</label>
										</li>
										<li>
											<input type="checkbox" name="innovdisk-11" id="innovdisk-11" checked>
											<label for="innovdisk-11" class="custom-checked">Neuen Weg aufzeigen</label>
										</li>
										<li class="last">
											<input type="checkbox" name="innovdisk-12" id="innovdisk-12" checked>
											<label for="innovdisk-12" class="custom-checked">Schockierende
												Erkenntnis</label>
										</li>
									</ul>
								</li>
								<li>
									<input type="checkbox" name="narrativ2" id="narrativ" checked>
									<label for="narrativ" class="custom-checked">Narrativ</label>
									<ul>
										<li>
											<input type="checkbox" name="narrativ-1" id="narrativ-1" checked>
											<label for="narrativ-1" class="custom-checked">Biografisch</label>
										</li>
										<li>
											<input type="checkbox" name="narrativ-2" id="narrativ-2" checked>
											<label for="narrativ-2" class="custom-checked">Situativ</label>
										</li>
										<li>
											<input type="checkbox" name="narrativ-3" id="narrativ-3" checked>
											<label for="narrativ-3" class="custom-checked">Rahmenerzählung</label>
										</li>
									</ul>
								</li>
								<li>
									<input type="checkbox" name="wissenschaftlichereferenz2" id="wissenref" checked>
									<label for="wissenref" class="custom-checked">Wissenschaftliche Referenz</label>
									<ul>
										<li>
											<input type="checkbox" name="wissenref-1" id="wissenref-1" checked>
											<label for="wissenref-1" class="custom-checked">Information</label>
										</li>
										<li>
											<input type="checkbox" name="wissenref-2" id="wissenref-2" checked>
											<label for="wissenref-2" class="custom-checked">Begriffe</label>
										</li>
										<li>
											<input type="checkbox" name="wissenref-3" id="wissenref-3" checked>
											<label for="wissenref-3" class="custom-checked">Theorie</label>
										</li>
										<li class="last">
											<input type="checkbox" name="wissenref-4" id="wissenref-4" checked>
											<label for="wissenref-4" class="custom-checked">Argumentation</label>
										</li>
									</ul>
								</li>
								<li>
									<input type="checkbox" name="praemisse3" id="prms" checked>
									<label for="prms" class="custom-checked">Prämisse</label>
								</li>
								<li>
									<input type="checkbox" name="beispiel3" id="bsp" checked>
									<label for="bsp" class="custom-checked">Beispiel</label>
								</li>
								<li class="last">
									<input type="checkbox" name="schlussfolgerung3" id="schflg" checked>
									<label for="schflg" class="custom-checked">Schlussfolgerung</label>
								</li>

							</ul>
						</li>
					</ul>
				</div>
			</div>
		</td>
	</tr>
</table>
<div class="overlayOuter">
	<h3 class="overlayTitle"></h3>
	<p class="overlayText"></p>
	<button class="overlayCloseButton">X</button>
	<ul class="overlayLinks"></ul>
</div>
MULTILINESTRING;
		return $html;
	}
}
