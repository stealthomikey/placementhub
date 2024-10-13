/*
    Created by Michael Piercey
*/


// Function to parse query parameters from URL
function parseQueryString() {
    var queryString = window.location.search;
    var params = new URLSearchParams(queryString);
    return params;
}

// Function to show account content based on group code
function showNotLoggedIn() {
    document.getElementById("notLoggedInAlert").style.display = "block";
}

// Check if the query parameter 'showGroup' is present
var queryParams = parseQueryString();
if (queryParams.has('notloggedin')) {
    showNotLoggedIn();
}



    // toggle to show login instead of signup
    function toggleToLogin() {
        // get the signup and login div
        var signupForm = document.querySelector('.signup__container');
        var loginForm = document.querySelector('.login__container');

        // change the signup div to none so it doesnt show and change login to block so it does
        signupForm.style.display = 'none';
        login__container.style.display = 'flex';
    }

    // toggle to show signup instead of login
    function toggleToSignup() {
        // gets the signup and login div
        var signupForm = document.querySelector('.signup__container');
        var loginForm = document.querySelector('.login__container');

        // sets the sign up div to block so it appears and set the login div to none so it doesnt appear
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    }

function displayNotSignedInAlert() {
    console.log("alert called")
    alert('You need to be logged in.');
}