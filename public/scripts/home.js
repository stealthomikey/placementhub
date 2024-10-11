/*
    Created by Michael Piercey 2206222 -- finalised 11/12/23
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

// wait until page is ready to change
$(document).ready(function () {
    // dark mode option, when switich is turned to dark mode the styles will change 
    function toggleStyles(isDarkMode) {
        // gets the root tag from css, then depending is the dark mode is checked will change colours, first column is dark and second is light
        $(':root').get(0).style.setProperty('--main-colour', isDarkMode ? '#000' : '#df5441');
        $(':root').get(0).style.setProperty('--text-colour1', isDarkMode ? '#111' : '#e8e8e8');
        $(':root').get(0).style.setProperty('--text-colour2', isDarkMode ? '#222' : '#787878');
        $(':root').get(0).style.setProperty('--text-colour3', isDarkMode ? '#333' : '#363636');
        $(':root').get(0).style.setProperty('--background-colour1', isDarkMode ? '#fff' : '#e87f54');
        $(':root').get(0).style.setProperty('--background-colour3', isDarkMode ? '#fff' : '#f0a967');
        $(':root').get(0).style.setProperty('--background-colour2', isDarkMode ? '#fff' : '#ecc9a8');
    }

    // listener for checkbox change
    $('#darkMode').change(function () {
        toggleStyles($(this).prop('checked'));
    });

    // the page starts off in lightmode
    toggleStyles(false);


    // gets the top trending movies from the movie data base
    function getResultsFromTMDB() {
        // api key and link to trending movie json 
        var apiKey = "7e6dd248e2a77acc70a843ea3a92a687";
        var url = "https://api.themoviedb.org/3/trending/movie/week?api_key=" + apiKey;
        
        // extracts the jsondata from the results
        $.getJSON(url, function (jsondata) {
            // sends json data to display trending movies function
            getTrendingMovieDisplay(jsondata);
            // sends jsondata to display movies functions 
            displayAndCreateMovies(jsondata.results);
        });
        }
        
        // displays the trending movies for carosel
        function getTrendingMovieDisplay(jsondata) {
        // start off with an empty html string we can edit later
        var htmlstring = "";
        // loops for 3 times so the carosel will get 3 movies
        for (var i = 0; i < 3; i++) {
            // gets data from search result json data
            var title = jsondata.results[i].title;
            var movieBackdrop = jsondata.results[i].backdrop_path;
            var movieDescription = jsondata.results[i].overview;
        
            // test to make sure it gets the right data
            console.log("Title: " + title);
            console.log("Backdrop Path: " + movieBackdrop);
            console.log("Overview: " + movieDescription);
        
            // builds the html for the caroseul. in the first loop set the div to active so it will appear on page load
            htmlstring += "<div class='carousel-item" + (i === 0 ? " active" : "") + "'>" +
                // set the image background
                "<img src='https://image.tmdb.org/t/p/original/" + movieBackdrop + "' class='d-block w-100' alt='" + title + "'>" +
                "<div class='carousel-caption d-none d-md-block'>" +
                "<h5 class='movieTitle'>" + title + "</h5>" +
                "<p class='movieDescription'>" + movieDescription + "</p>" +
                "</div></div>";
        }
        
        // inserts the html into the carousel div in the html file
        $('.carousel-inner').html(htmlstring);
    }

    // dispaly the top trending movies as cards
    function displayAndCreateMovies(movies) {
            // uses empty html string to build html later
            var htmlString = "";
            // loops for 20 movies (trending movies is made of 20 movies) or loop for how many movies are in trending if there are less than 20
            for (var i = 0; i < 20 && i < movies.length; i++) {
                // get movie information from json
                var title = movies[i].title;
                var moviePoster = movies[i].poster_path;
                var movieDescription = movies[i].overview;
                var id = movies[i].id;
                // set the max description length to 250 so descriptions arent massive
                var maxDescriptionLength = 250;
                if (movieDescription.length > maxDescriptionLength) {
                    // If it is, truncate the description and add "..." to the end
                    console.log("over...")
                    // make the movie description to 250 long and add ... to the end to show theres more
                    movieDescription = movieDescription.slice(0,250);
                    movieDescription = movieDescription + "...";
                }
                // get the year of movie release
                var releaseDate = movies[i].release_date.split('-')[0]; 
            
                console.log("Title: " + title);
                console.log("Poster Path: " + moviePoster);
                console.log("Overview: " + movieDescription);
                console.log("Release Date: " + releaseDate);
            
                // builds html string for movie card
                htmlString += "<div class='movie_card'>" +
                    "<div class='movie_card-content'>" +
                    "<div class='movie_card-header'><img class='movie_card-header__image' src='https://image.tmdb.org/t/p/original/" + moviePoster + "' alt='" + title + "'/></div>" +
                    "<div class='movie_card-body'>" +
                    "<h4 class='movie_card-body__header'>" + title + "</h4>" +
                    "<p class='movie_card-body__desc'>" + movieDescription + "</p>" +
                    "</div>" +
                    "<div class='movie_card-footer'>" +
                    "<div class='movie_card-footer__date'>Year of release: " + releaseDate + "</div>" +
                    // add the movie id to the review toggle so we can use it to get the review options later
                    "<a class='review_btn' onclick='toggleReviewCard(" + i + ","+id+")'>Review</a>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    // sets the div moive card and adds the id so we can call it for each movie later
                    "<div class='movie-card movie-card-" + i + "'>" +
                    "</div>";
            }
            
            // insert the html string into the html at movie cards div
            $('.movie_cards').html(htmlString);
        }
            
            // gets the information from tmdb function
            getResultsFromTMDB();
    });


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

    // dispaly the movie review detail for a specific movie
    function displayMovieReviewDetails(moviesinfo, Rlocation) {
        // sets empty html string so we can build it later
        var htmlString = "";
        
        console.log("review has been called");

        // gets data from json
        var title = moviesinfo.original_title;
        var moviePoster = moviesinfo.poster_path;
        var movieDescription = moviesinfo.overview;
        var releaseDate = moviesinfo.release_date.split('-')[0]; 
        var id = moviesinfo.id;
    
        console.log("THISSSS IS SSS REVIEWWW Title: " + title);
        console.log("Poster Path: " + moviePoster);
        console.log("Overview: " + movieDescription);
        console.log("Release Date: " + releaseDate);
        console.log("Movie id is " + id);
    
// build html
htmlString += "<div class='movie-details'>" +
            "<h2>" + title + "</h2>" +
            "<img src='https://image.tmdb.org/t/p/original/" + moviePoster + "' alt='" + title + "'/>" +
            "<p>" + movieDescription + "</p>" +
            "<p>Year: " + releaseDate + "</p>" +
            "</div>" +
            "<div class='reviews'>" +
            "<form id='watchlistForm' action='/addwatchlist' method='POST'>" +
            "<input type='hidden' name='movieId' value='" + id + "'>" +
            "<button class='button-watchlist' type='submit'>Add to Watchlist</button>" +
            "</form>" +
            "<div class='rating-buttons'>" +
              "<form id='reviewForm' action='/addreview' method='POST'>" +
                "<input type='hidden' name='movieId' value='" + id + "'>" +
                "<h6>number review</h6>"+
                "<select name='rating'>" + 
                "<option value='1'>1</option>" +
                "<option value='2'>2</option>" +
                "<option value='3'>3</option>"+
                "<option value='4'>4</option>" +
                "<option value='5'>5</option>" +
                "</select>" +
                "<div class='review-section'>" +
                  "<label class='comments-review'>Have your say:</label>" +
                  "<textarea class='review-section-text' rows='4' name='review'></textarea>" +
                  "<button class='leave-review' type='submit'>Leave review</button>" +
                "</div>" +
              "</form>" +
            "</div>" +
          "</div>" +
          "<div class='right'>" + // Added opening div tag here
            "<div class='friends-ratings'>" +
            "<h3>Friends Ratings</h3>" +
            "<p>Rating 1: 25%</p>" +
            "<p>Rating 2: 30%</p>" +
            "<p>Rating 3: 20%</p>" +
            "<p>Rating 4: 25%</p>" +
            "</div>" +
            "<div class='similar-movies'>" +
            "<h3>Similar Movies</h3>" +
            "<img src='https://image.tmdb.org/t/p/original/" + moviePoster + "' alt='Similar " + title + " Poster'/>" +
            "</div>" +
          "</div>" + // Added closing div tag here
          "</div>";



        // insert html in the movie card dive it was called from
        $('.movie-card-' + Rlocation).append(htmlString);

            // Prevent the default form submission behavior
        $('#watchlistForm').on('submit', function(event) {
            event.preventDefault();
            // AJAX call to submit the form data
            $.ajax({
                url: $(this).attr('action'),
                type: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    console.log(response); // You can handle the response here
                },
                error: function(xhr, status, error) {
                    alert("login boy")
                    console.error(error); // Handle errors here
                }
            });
        });
    }



    // get json data from tmdb for review card
    function toggleReviewCard(location, id) {
        console.log(location);
        // create url to get data for a specific movie from id
        var apiKey = "7e6dd248e2a77acc70a843ea3a92a687";
        var url = "https://api.themoviedb.org/3/movie/"+id+"?api_key=" + apiKey;
        // hide the previous review card that was open and set the html to empty again
        $('.movie-card').hide().html('');
        // gets the data from tmdb
        $.getJSON(url, function (jsondata) {
            console.log(jsondata)
            // send data to review details
            displayMovieReviewDetails(jsondata, location);
        });
    
        // update review card html
        var reviewCard = document.querySelector('.movie-card-' + location);
        // set the html review card to flex instead of non
        reviewCard.style.display = 'flex';
    }

    // get the search results from tmdb from search bar
    function getSearchFromTMDB(movieTitle) {
        console.log(movieTitle);
        // build url to get search
        var apiKey = "7e6dd248e2a77acc70a843ea3a92a687";
        var url = "https://api.themoviedb.org/3/search/movie?query=" + movieTitle + "&api_key=" + apiKey;

        // get the json data from tmdb
        $.getJSON(url, function (jsondata) {
            console.log(jsondata);
            // send data to the results function
            displayResultsSearch(jsondata.results);
        });
    }

    // display the search results
    function displayResultsSearch(movies) {
        console.log("movies called");
        // set up the html to be used later
        var htmlString = "";
        // get the top 5 movies from search
        for (var i = 0; i < 5 && i < movies.length; i++) {
            // get the data from the json 
            console.log("review has been called");
            var title = movies[i].title;
            var moviePoster = movies[i].poster_path;
            var movieDescription = movies[i].overview;
            var movieBackdrop = movies[i].backdrop_path;
            var movieRating = movies[i].vote_average;
            var releaseDate = movies[i].release_date;
            var id = movies[i].id;

            console.log("THISSSS IS SSS REVIEWWW Title: " + title);
            console.log("Poster Path: " + moviePoster);
            console.log("Overview: " + movieDescription);
            console.log("Release Date: " + releaseDate);

            // build html string for search results card
            htmlString +=
            "<div class='results-movie-card'>" +
            "<div class='results-movie-details'>" +
                "<h2>" + title + "</h2>" +
                "<img src='https://image.tmdb.org/t/p/original/" + moviePoster + "' alt='" + title + " Poster'>" +
                "<p>" + releaseDate + "</p>" +
                "<p>" + movieRating + "</p>" +
            "</div>" +
            "<div class='results-extra' id='results-extra-"+id+"' style=\"background-image: url('https://image.tmdb.org/t/p/original/" + movieBackdrop + "'); display: block;\">" +
                "<h3>About " + title + "</h3>" +
                "<p>" + movieDescription + "</p>" +
                "<form id='watchlistForm' action='/addwatchlist' method='POST'>" +
                    "<input type='hidden' name='movieId' value='" + id + "'>" +
                    "<button class='button-watchlist' type='submit'>Add to Watchlist</button>" +
                "</form>"+
                "<button class='button-review' type='submit' onclick='addReview(" + id + ")'>Review</button>" +
            "</div>" +
            "<div class='make-review' id='make-review-" + id + "'  style=\"background-image: url('https://image.tmdb.org/t/p/original/" + movieBackdrop + "'); display: none;\">" +
                "<form id='reviewForm' action='/addreview' method='POST'>" +
                    "<input type='hidden' name='movieId' value='" + id + "'>" +
                    "<h6>number review</h6>"+
                    "<select name='rating'>" + 
                        "<option value='1'>1</option>" +
                        "<option value='2'>2</option>" +
                        "<option value='3'>3</option>"+
                        "<option value='4'>4</option>" +
                        "<option value='5'>5</option>" +
                    "</select>" +
                    "<div class='review-section'>" +
                        "<label class='comments-review'>Have your say:</label>" +
                        "<textarea class='review-section-text' rows='3' name='review'></textarea>" +
                        "<button class='leave-review' type='submit'>Leave review</button>" +
                    "</div>" +
                "</form>" +
                "<button class='back' onclick='backReview(" + id + ")'>Back</button>" +
            "</div>" +
        "</div>";
        
        
        
        }
        // insert html into search resutls container
        $('.results-movie-card-container').html(htmlString);
    }

function popup1() {
  var popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
}

function popup2() {
    var popup = document.getElementById("myPopup2");
    popup.classList.toggle("show");
  }

  function popup3() {
    var popup = document.getElementById("myPopup3");
    popup.classList.toggle("show");
  }

  
  function addReview(id) {
    console.log("addReview function called for id:", id);

    var resultsExtra = document.getElementById('results-extra-' + id);
    var makeReview = document.getElementById('make-review-' + id);

    console.log("resultsExtra:", resultsExtra);
    console.log("makeReview:", makeReview);

    if (resultsExtra && makeReview) {
        resultsExtra.style.display = 'none';
        makeReview.style.display = 'block';
    } else {
        console.log("Error: Unable to find elements with IDs 'results-extra-" + id + "' and 'make-review-" + id + "'");
    }
}

function backReview(id) {

    var resultsExtra = document.getElementById('results-extra-' + id);
    var makeReview = document.getElementById('make-review-' + id);

    console.log("resultsExtra:", resultsExtra);
    console.log("makeReview:", makeReview);

    if (resultsExtra && makeReview) {
        resultsExtra.style.display = 'block';
        makeReview.style.display = 'none';
    } else {
        console.log("Error: Unable to find elements with IDs 'results-extra-" + id + "' and 'make-review-" + id + "'");
    }
}


function displayNotSignedInAlert() {
    console.log("alert called")
    alert('You need to be logged in.');
}