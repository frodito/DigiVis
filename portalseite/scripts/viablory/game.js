
function startGame(startNumber) {
    //submitTable("playerNameForm");
    if(validateInputPlayerNames()){
        document.getElementById("startNumberField").value = startNumber;
        document.getElementById("submitPlayerNames").reportValidity(":invalid");
        document.getElementById("submitPlayerNames").click();
    }
}


function endGame(){
    timeout = setTimeout(function () {
        showPopup(decisionPopup);
    }, waitingTime);
}


// game functions --------------------------------------------------------------------

function clickCard(cellId) {
    if (waiting || cellId == clickedField || correctPairsList.has(matchMap.get(cellId))) {
        return;
    }

    turnAroundCard(cellId);
    selectCard(cellId);
    switch (clickCoutner) {
        case 0:
            clickedField = cellId;
            clickCoutner++;
            break;
        case 1:
            var card1 = matchMap.get(clickedField);
            var card2 = matchMap.get(cellId);
            waiting = true;
            if (card1 == card2) {
                correctPairsList.set(card1, [clickedField, cellId]);
                increasePoints(turn);
                setCorrect(clickedField, cellId, turn);
            }
            timeout = setTimeout(function () {
                if(card1 != card2){
                    turnAroundCard(clickedField);
                    turnAroundCard(cellId);
                    switchPlayer();
                }
                unselectCards(clickedField, cellId);
                clickCoutner = 0;
                clickedField = -1;
                waiting = false;
            }, waitingTime);

            break;
    }
    if(correctPairsList.size == matchMap.size/2){
        endGame();
    }
}

function selectCard(cellId) {
    var cell = getCell(cellId);
    var borderColor = turn == 1 ? player1ColorStrong : player2ColorStrong;
    cell.style.border = "3px solid" + borderColor;
}

function unselectCards(...cellIds) {
    cellIds.forEach(function (cellId) {
        var cell = getCell(cellId);
        cell.style.border = "3px solid transparent";
    });
}

function turnAroundCard(cellId) {
    var cell = getCell(cellId);

    if (cell.classList.contains("hover")) {
        cell.classList.remove("hover");
    } else {
        cell.classList.toggle('hover');
    }
}

function setCorrect(cellId1, cellId2, player){
    var cell1 = getCell(cellId1);
    var cell2 = getCell(cellId2);

    backgroundColor = player == 1 ? player1ColorCorrect : player2ColorCorrect;
    

    cell1.setAttribute("style", "background-color: " + backgroundColor + " !important; " + fieldStyle);
    cell2.setAttribute("style", "background-color: " + backgroundColor + " !important; " + fieldStyle);

    unselectCards(cellId1, cellId2);
}

function increasePoints(player) {
    if(player == 1){
        pointsPlayer1++;
        getById("points1TD").innerHTML = pointsPlayer1.toString();
    }
    else if (player == 2){
        pointsPlayer2++;
        getById("points2TD").innerHTML = pointsPlayer2.toString();
    }
}

function openAllCards() {
    $('.flip-card .flip-card-inner').before(function () {
        $(this).closest('.flip-card').toggleClass('hover');
        $(this).css('transform, rotateY(180deg)');
    });
}

function switchPlayer() {
    turn = turn == 1 ? 2 : 1;
    markSelectedPlayer();
}

function markSelectedPlayer(){
    var player1 = getById("player1NameLabel");
    var player2 = getById("player2NameLabel");
    var handLeft = getById("handPointLeft");
    var handRight = getById("handPointRight");

    switch (parseInt(turn.toString())) {
        case 1:
            setVisibility(false, handRight);
            setVisibility(true, handLeft);
            player1.style.boxShadow = "0 0 15px 5px " + player1ColorStrong;
            player2.style.boxShadow = "0 0 2px white";
            break;
        case 2:
            setVisibility(true, handRight);
            setVisibility(false, handLeft);
            player1.style.boxShadow = "0 0 2px white";
            player2.style.boxShadow = "0 0 15px 5px " + player2ColorStrong;
            break;
        default:
            throw new Error("Invalid value for 'turn': " + turn);
    }
}
