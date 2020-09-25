(function () {
	var button = OO.ui.ButtonWidget.static.infuse( $( '#btnRunNER' ) );
	button.on('click', executeNER);
}());

function executeNER(evt) {
	// alert("you pressed se button");

	var text = "this is some example text for testing";
	console.log('text: ', text);

	$.ajax({
		type: "POST",
		url: mw.util.wikiScript('api'),
		data: {action: 'dvner', format: 'json', rawtext: text},
		dataType: 'text',
		success: function (json) {
			alert(json);
		}
	});
}