
function validateInputPlayerNames(){
    var playerNameFormAlert = document.getElementById("playerNameFormAlert");
    var playerName1Alert = document.getElementById("namePlayer1Alert");
    var playerName2Alert = document.getElementById("namePlayer2Alert");

    var playerNameInput1 = document.getElementById("namePlayer1").value;
    var playerNameInput2 = document.getElementById("namePlayer2").value;

    var noErrors = true;

    if(!REGEX_PLAYER_NAMES.test(playerNameInput1) && playerNameInput1 != ""){
        showAlert(playerName1Alert);
        noErrors = false;
    } else {
        hideAlert(playerName1Alert);
    }

    if(!REGEX_PLAYER_NAMES.test(playerNameInput2) && playerNameInput2 != ""){
        showAlert(playerName2Alert)
        noErrors = false;
    } else {
        hideAlert(playerName2Alert);
    }
    if(playerNameInput1 == playerNameInput2 && (playerNameInput1 != "" || playerNameInput2 != "")){
        showAlert(playerNameFormAlert)
    } else{
        hideAlert(playerNameFormAlert);
    }
    return noErrors;
}

function showAlert(alertField){
    alertField.classList.remove("invisible");
    alertField.classList.add("visible");
}

function hideAlert(alertField){
    alertField.classList.remove("visible");
    alertField.classList.add("invisible");

}
