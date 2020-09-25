class Walk {

	constructor(name, ids) {
		this._name = name;
		this._ids = ids;
		this._stations = [];
		this.initWalk();
	}

	initWalk() {
		this._stations.push(this.createTitleStation());
		this._stations.push(this.createIntroStation());
		this.createStations();
		this.createConclusionStation();
	}

	createTitleStation() {

	}

	createIntroStation() {

	}

	createStations() {

	}

	createConclusionStation() {

	}

}