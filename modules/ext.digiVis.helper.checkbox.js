// tree-view with checkboxes: https://codepen.io/fsbdev/pen/nILhu

function checkboxChanged() {
	let $this = $(this),
		checked = $this.prop("checked"),
		container = $this.parent(),
		siblings = container.siblings();

	container.find('input[type="checkbox"]')
		.prop({
			indeterminate: false,
			checked: checked
		})
		.siblings('label')
		.removeClass('custom-checked custom-unchecked custom-indeterminate')
		.addClass(checked ? 'custom-checked' : 'custom-unchecked');

	checkSiblings(container, checked);
	applyCheckboxSelection($this);
	handleFreetextFilter()
}

function applyCheckboxSelection() {
	let allCheckbox = $('#all')[0];
	let listChecked = [];

	if (allCheckbox.checked) {
		annotationMap.forEach(function (annotation, index) {
			annotation.element.show();
		});
	} else if (!allCheckbox.checked && !allCheckbox.indeterminate) {
		annotationMap.forEach(function (annotation, index) {
			annotation.element.hide();
		});
	} else {
		$('input:checked').each(function (index, checkbox) {
			listChecked.push(checkbox.name);
		});
		annotationMap.forEach(function (annotation) {
				let id = annotation._metadata.id;
				if (annotation.topics.length !== 0 && in_array(listChecked, annotation.cat_intern, annotation.topics) ||
					annotation.innovationtypes.length !== 0 && in_array(listChecked, annotation.cat_intern, annotation.innovationtypes) ||
					annotation.narrativetype.length !== 0 && in_array(listChecked, annotation.cat_intern, annotation.narrativetype) ||
					annotation.referencetype.length !== 0 && in_array(listChecked, annotation.cat_intern, annotation.referencetype)) {
					annotation.element.show();
				} else {
					annotation.element.hide();
				}
			}
		);
	}
}

function checkSiblings($el, checked) {
	let parent = $el.parent().parent(),
		all = true,
		indeterminate = false;

	$el.siblings().each(function () {
		return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
	});

	if (all && checked) {
		parent.children('input[type="checkbox"]')
			.prop({
				indeterminate: false,
				checked: checked
			})
			.siblings('label')
			.removeClass('custom-checked custom-unchecked custom-indeterminate')
			.addClass(checked ? 'custom-checked' : 'custom-unchecked');

		checkSiblings(parent, checked);
	} else if (all && !checked) {
		indeterminate = parent.find('input[type="checkbox"]:checked').length > 0;

		parent.children('input[type="checkbox"]')
			.prop("checked", checked)
			.prop("indeterminate", indeterminate)
			.siblings('label')
			.removeClass('custom-checked custom-unchecked custom-indeterminate')
			.addClass(indeterminate ? 'custom-indeterminate' : (checked ? 'custom-checked' : 'custom-unchecked'));

		checkSiblings(parent, checked);
	} else {
		$el.parents("li").children('input[type="checkbox"]')
			.prop({
				indeterminate: true,
				checked: false
			})
			.siblings('label')
			.removeClass('custom-checked custom-unchecked custom-indeterminate')
			.addClass('custom-indeterminate');
	}
}