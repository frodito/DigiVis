/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

// function populateViabloryImages(player) {
//     $('#content').append('<div class="viabloryImages" id="viabloryImages"></div>');
//     let $container = $('#viabloryImages');
//     if (Object.keys(viabloryImages).length === 0) {
//         loadViabloryImages();
//     }
//
//     addTableWithImages($container, player);
//     if (player === 1) {
//         $container.append(`<button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="submitDescriptions(1, Movement.forward)">${constantTexts.sendImageDescriptionsStudent1}</button>`);
//     } else if (player === 2) {
//         $container.append(`<button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="submitDescriptions(2, Movement.forward)">${constantTexts.sendImageDescriptionsStudent2}</button>`);
//     } else {
//         // todo: error-handling
//     }
// }

// function populateViabloryImagesTabs() {
//     $('#content').append('<div class="nav-center"><ul class="nav nav-pills nav-justified" id="describeImagesTabs"></ul></div>');
//     $('#content').append(`<div class="tab-content" id="describeImagesContent"></div>`);
//     if (Object.keys(viabloryImages).length === 0) {
//         loadViabloryImages();
//     }
//
//     // fresh and new game
//     if (Object.keys(viabloryImageDescriptionsNew).length === 0 || viabloryImageDescriptionsNew[player] === undefined) {
//         for (let i = amountImages * (player - 1), j = 1; i < amountImages * player; i++, j++) {
//             // tab navigation element
//             let elementClass = j === 1 ? "nav-link active" : "nav-link"
//             let $tabLi = $(`<li class="${elementClass}" id="imageTab"></li>`);
//             let $tabAHref = $(`<a href="#image${j}" data-toggle="tab">${constantTexts.image} ${j}</a>`);
//             $tabLi.append($tabAHref);
//             $('#describeImagesTabs').append($tabLi);
//
//             // tab content
//             elementClass = j === 1 ? 'tab-pane fade show active' : 'tab-pane fade';
//             let pageName = viabloryImageKeysShuffled[i];
//             let image = viabloryImages[pageName];
//             let $tabPane = $(`<div class="${elementClass}" id="image${j}"></div>`);
//             let $img = $(`<img class="describingImagesImage" src="${image.imageUrl}" id="${pageName}-image" alt="${pageName}"/>`);
//             let $descriptionContainer = $('<div class="describingImagesDescriptionContainer"></div>');
//             let $descriptionPrefix = $(`<h3 class="descriptionPrefix">${constantTexts.describePicturePrefix}</h3>`);
//             let $description = $(`<textarea class="describingImagesDescription" type="text" id="${pageName}" rows=5 placeholder="${constantTexts.describePicturePlaceholder} ${pageName}"></textarea>`);
//             let $descrptionSuffix = $(`<h3 class="descriptionSuffix">${constantTexts.describePictureSuffix}</h3>`);
//             $descriptionContainer.append($descriptionPrefix, $description, $descrptionSuffix)
//             $tabPane.append($img, $descriptionContainer);
//             $('#describeImagesContent').append($tabPane);
//         }
//     } else {
//         let j = 1;
//         for (let pageName of Object.keys(viabloryImageDescriptionsNew[player])) {
//             // tab navigation element
//             let elementClass = j === 1 ? "nav-link active" : "nav-link"
//             let $tabLi = $(`<li class="${elementClass}" id="imageTab"></li>`);
//             let $tabAHref = $(`<a href="#image${j}" data-toggle="tab">${constantTexts.image} ${j}</a>`);
//             $tabLi.append($tabAHref);
//             $('#describeImagesTabs').append($tabLi);
//
//             // tab content
//             elementClass = j === 1 ? 'tab-pane fade show active' : 'tab-pane fade';
//             let imageUrl = viabloryImageDescriptionsNew[player][pageName].imageUrl;
//             let description = viabloryImageDescriptionsNew[player][pageName].description;
//             let $tabPane = $(`<div class="${elementClass}" id="image${j}"></div>`);
//             let $img = $(`<img class="describingImagesImage" src="${imageUrl}" id="${pageName}-image" alt="${pageName}"/>`);
//             let $description = $(`<textarea class="describingImagesDescription" type="text" id="${pageName}" rows=5 placeholder="${constantTexts.describePicturePlaceholder} ${pageName}">${description}</textarea>`);
//             $tabPane.append($img, $description)
//             $('#describeImagesContent').append($tabPane);
//             j++;
//         }
//     }
//     if (player === 1) {
//         $('#content').append(`<button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="submitDescriptions(1, Movement.forward)">${constantTexts.sendImageDescriptionsStudent1}</button>`);
//     } else if (player === 2) {
//         $('#content').append(`<button id="generateSessionNameButton" class="main-button defaultGradientButton" onclick="submitDescriptions(2, Movement.forward)">${constantTexts.sendImageDescriptionsStudent2}</button>`);
//     } else {
//         // todo: error-handling
//     }
// }

// function addTableWithImages(container, player) {
//
//     let $table = $('<table class="tableContainer"></table>');
//     let $headerRow = $('<tr></tr>');
//     let $headerImages = $(`<th>${constantTexts.describePictureTableHeaderImageColumn}</th>`);
//     let $headerDescriptions = $(`<th>${constantTexts.describePictureTableHeaderTextColumn}</th>`);
//     $headerRow.append($headerImages, $headerDescriptions);
//     $table.append($headerRow);
//
//     // newly started game
//     if (Object.keys(viabloryImageDescriptionsNew).length === 0 || viabloryImageDescriptionsNew[player] === undefined) {
//         for (let i = amountImages * (player - 1); i < amountImages * player; i++) {
//             let pageName = viabloryImageKeysShuffled[i];
//             let image = viabloryImages[pageName];
//             let $tableRow = $('<tr></tr>');
//             let $img = $(`<td><img class="describingImagesImage" src="${image.imageUrl}" id="${pageName}-image" alt="${pageName}"/></td>`);
//             let $description = $(`<td><h4>${constantTexts.describePicturePrefix}</h4><textarea class="describingImagesDescription" type="text" id="${pageName}" rows=5 placeholder="${constantTexts.describePicturePlaceholder} ${pageName}"></textarea><h4>${constantTexts.describePictureSuffix}</h4></td>`);
//             $tableRow.append($img, $description);
//             $table.append($tableRow);
//         }
//     } else {
//         for (let pageName of Object.keys(viabloryImageDescriptionsNew[player])) {
//             let imageUrl = viabloryImageDescriptionsNew[player][pageName].imageUrl;
//             let description = viabloryImageDescriptionsNew[player][pageName].description;
//             let $tableRow = $('<tr></tr>');
//             let $img = $(`<td><img class="describingImagesImage" src="${imageUrl}" id="${pageName}-image" alt="${pageName}"/></td>`);
//             let $description = $(`<td><textarea class="describingImagesDescription" type="text" id="${pageName}" rows=5 placeholder="${constantTexts.describePicturePlaceholder} ${pageName}">${description}</textarea></td>`);
//             $tableRow.append($img, $description);
//             $table.append($tableRow);
//         }
//     }
//     container.append($table);
// }

function submitPlayerDescriptions(player, movement) {
    let allImages = true;
    $('.describingImagesDescription').each(function (index) {
        if (allImages) {
            let value = $(this).val();
            allImages = value !== "";
            // store image descriptions
            if (value !== "") {
                let value = $(this).val();
                let id = $(this).attr("id");
                viabloryImageDescriptionsNew[id] = value;
            }
        }
    });
    if (allImages) {
        if (confirm(constantTexts.imageDescriptionsVerify)) {
            for (let imagePageName of Object.keys(viabloryImageDescriptionsNew)) {
                let description = viabloryImageDescriptionsNew[imagePageName];
                writeViabloryImageDescriptionToMediaWiki(imagePageName, description, selectedSessionName);
            }
            selectMode(Mode.play);
        }
    } else {
        alert(`${constantTexts.errorMessages.imageDescriptionMissing}`);
    }
}

// function submitDescriptions(player, movement) {
//     viabloryImageDescriptionsNew[player] = {};
//     $('.describingImagesDescription').each(function () {
//         let image = $(this).attr('id');
//         let description = $(this).value;
//         let sessionName = selectedSessionName;
//         let imageIdSelector = `${image}-image`;
//         let imageUrl = $(document.getElementById(imageIdSelector)).attr('src');
//
//         // todo: add error handling for empty descriptions
//         viabloryImageDescriptionsNew[player][image] = {
//             imageUrl: imageUrl,
//             description: description,
//             sessionName: sessionName
//         };
//         pairs[image].content = description;
//     });
//     sessionStorage.setItem('viabloryImageDescriptionsNew', JSON.stringify(viabloryImageDescriptionsNew));
//     sessionStorage.setItem('pairs', JSON.stringify(pairs));
//     if (selectedMode === Mode.student1) {
//         selectMode(Mode.student2);
//     } else if (selectedMode === Mode.student2) {
//         if (movement === Movement.forward) {
//             if (confirm(constantTexts.imageDescriptionsVerify)) {
//                 for (let player of Object.keys(viabloryImageDescriptionsNew)) {
//                     for (let imagePageName of Object.keys(viabloryImageDescriptionsNew[player])) {
//                         let description = viabloryImageDescriptionsNew[player][imagePageName].description;
//                         let sessionName = viabloryImageDescriptionsNew[player][imagePageName].sessionName;
//                         writeViabloryImageDescriptionToMediaWiki(imagePageName, description, sessionName);
//                     }
//                 }
//                 selectMode(Mode.play);
//             }
//         }
//     }
// }