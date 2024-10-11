/*
    Created by Jonathan Boyd 2207435 -- finalised 10/12/23
*/


// reveals the form for creating new groups upon being clicked
     function revealForm(){
        var z = document.getElementById("formForGroups");
        var l = document.getElementById("formforGroups2")
        if (z.style.display === "block") {
            z.style.display = "none";
            l.style.display = "none";
        } else {
            z.style.display = "block";
            l.style.display = "none";
        }
    }
    //same as above but for the channels
    function revealForm2(){
        var form2 = document.getElementById("formForGroups2");
        var z = document.getElementById("formForGroups");
        if (form2.style.display === "block") {
            form2.style.display = "none";
            z.style.display = "none";
        } else {
            form2.style.display = "block";
            z.style.display = "none";
        }
    }
    
    //assings the group name to the form results
    function d1Change() {
        var strName2 = document.getElementById("gName").value;
    document.getElementById("hiddentext").innerHTML = strName2;
    }
    // reveals the new group
    function backUp(){
    var sneak = document.getElementById("hiddenGroup");
    sneak.style.display = "block";
    }
    //same as above but for the channels
    function d2Change() {
        var strName = document.getElementById("cName").value;
    document.getElementById("hiddentext2").innerHTML = strName;
    }
    //same as above but for the channels
    function back2Up(){
    var sneak = document.getElementById("hiddenGroup2");
    sneak.style.display = "block";
    }

    //functions to show the group name, group description, channel name, channel description, these show the form results
function showMessage(){
    var message = document.getElementById("gName").value;
    display_message.innerHTML= message;
}
function showMessage2(){
    var message2 = document.getElementById("desc").value;
    display_message2.innerHTML= message2;
}
function showMessage3(){
    var message3 = document.getElementById("cName").value;
    display_message3.innerHTML= message3;
}
function showMessage4(){
    var message4 = document.getElementById("cDesc").value;
    display_message4.innerHTML= message4;
}

//upon clicking the watchlist button it will hide the chat and reveal the watchlist
function activateWatchList(){
    var Click = document.getElementById("merged");
    var buttonClickChat = document.getElementById("mergedChat");
    if (Click.style.display === "none"){
        Click.style.display = "block";
        buttonClickChat.style.display = "none";
    } else {
        Click.style.display = "block";
        buttonClickChat.style.display = "none";
    }
}
//shows the chat again if the watchlist was enabled
function activateChat(){
    var Click = document.getElementById("merged");
    var buttonClickChat = document.getElementById("mergedChat");
    if (buttonClickChat.style.display === "none"){
        buttonClickChat.style.display = "block";
        Click.style.display = "none";
    } else {
        Click.style.display = "none";
        buttonClickChat.style.display = "block";
    }
}

//changes the titles for each channels in the main section
function changeText() {
var x = document.getElementById("change");
if (x.innerHTML != "Main") {
x.innerHTML = "Main";
} else {
x.innerHTML = "Main";
}
}
function changeTexts() {
var x = document.getElementById("change");
if (x.innerHTML != "Star Wars") {
x.innerHTML = "Star Wars";
} else {
x.innerHTML = "Star Wars";
}
}
function changeTextl() {
var x = document.getElementById("change");
if (x.innerHTML != "Lord of The Rings") {
x.innerHTML = "Lord of The Rings";
} else {
x.innerHTML = "Lord of The Rings";
}
}
function changeTextb() {
var x = document.getElementById("change");
if (x.innerHTML != "Back to The Future") {
x.innerHTML = "Back to The Future";
} else {
x.innerHTML = "Back to The Future";
}
}
function newChannelTitle() {
        var nTitle = document.getElementById("cName").value;
        document.getElementById("change").innerHTML = nTitle;
    
    }