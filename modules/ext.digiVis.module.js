(function () {
	console.log('hurray, in ext.digiVis.module.js');

	$('#digiVis-filename').empty();
	var btn_NER = new OO.ui.ButtonWidget({
		label: 'Run DigiVisNERAPI on text',
		id: 'btn_NER',
		submit: false
	});

	var tf_rawtext = new OO.ui.MultilineTextInputWidget({
		placeholder: 'Paste your text here.',
		id: 'ext-digivis-rawtext',
		rows: 15
	});

	btn_NER.on('click', executeNER);

	var afl_NER = new OO.ui.ActionFieldLayout(tf_rawtext, btn_NER, {
		align: 'top'
	});
	$('#digiVis-rawtext').append(afl_NER.$element);
}());

function executeNER(evt) {

	var text = $('#ext-digivis-rawtext').find('textarea').val();
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