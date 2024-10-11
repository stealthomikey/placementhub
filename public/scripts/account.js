/*
  Created by Michael Piercey 2206222 -- finalised 11/12/23
*/
function showAccountContent(page) {
  // This hides all containers
  document.querySelectorAll('.account-container').forEach(element => {
      // By setting display to none, the container does not appear
      element.style.display = 'none';
  });

  // This then uses input to show the selected container
  const selectedContainer = document.getElementById(`container-${page}`);
  if (selectedContainer) {
      // Sets display to block instead of none
      selectedContainer.style.display = 'block';
  }
}

// Check if the query parameter 'showReviews' is present
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('showReviews')) {
  // Call the showAccountContent function with 'Reviews' as parameter
  showAccountContent('Reviews');
}
if (urlParams.has('showWatchlist')) {
  // Call the showAccountContent function with 'Reviews' as parameter
  showAccountContent('Watchlist');
}



// change review function accepts the number of movie to change
function changeReview(num) {
  console.log("change review called");
  // hides the your review container and shows the editing container
  document.getElementById('review-extra-' + num).style.display = 'none';
  document.getElementById('review-change-' + num).style.display = 'flex';
}

// save review function saves the new review and goes back to the your review container
function saveReview(num) {
  console.log("save review called");
  // gets the new review from text box
  var newText = document.getElementById('change-review-textbox-' +num).value;
  // sets the new review to the text from textbox
  document.getElementById('review-text-' + num).innerHTML = newText;
  // hides the edit review and shows the your review container
  document.getElementById('review-extra-' + num).style.display = 'flex';
  document.getElementById('review-change-' + num).style.display = 'none';
}

// view where to watch
function viewWatchlistOptions(num) {
    console.log("watchlist called");
    // hides the users watchlist movie description to show the where to watch 
    document.getElementById('watchlist-extra-' + num).style.display = 'none';
    document.getElementById('watchlist-view-' + num).style.display = 'flex';
  }

// back to watchlist description
  function watchlistBack(num) {
    console.log("back from watchlist called");
    // hides where to watch and shows the description
    document.getElementById('watchlist-extra-' + num).style.display = 'flex';
    document.getElementById('watchlist-view-' + num).style.display = 'none';
  }


  
  // Function to fetch watchlist movie IDs
  function fetchWatchlistMovieIds() {
    fetch('/getWatchlistMovieIds')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the response data
            console.log(data.watchlistMovieIds);

            // After fetching movie IDs, build movie cards for each movie
            data.watchlistMovieIds.forEach(movieId => {
                getWatchlistFromTMDB(movieId);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to get movie details from TMDB
function getWatchlistFromTMDB(movieId) {
    console.log(movieId);
    var apiKey = "7e6dd248e2a77acc70a843ea3a92a687"; // Replace with your TMDB API key
    var url = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + apiKey;
    console.log("movie searched for " + movieId)

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsondata => {
            console.log(jsondata);
            // Build movie card with the retrieved data
            buildMovieCard(jsondata);
        })
        .catch(error => console.error('Error:', error));
}

// Function to build movie card HTML
function buildMovieCard(movieInfo) {
  // Extracting movie information
  var title = movieInfo.original_title;
  var moviePoster = movieInfo.poster_path;
  var movieDescription = movieInfo.overview;
  var releaseDate = movieInfo.release_date.split('-')[0];
  var id = movieInfo.id;

  // Constructing the HTML string for movie card
  var htmlString =
  '<div class="watchlist-movie-card">'+
  '<div class="watchlist-movie-details" id="watchlist-movie-details">'+
    '<h2>' + title + '</h2>' +
    '<img src="https://image.tmdb.org/t/p/original/' + moviePoster + '" alt="Movie Poster">' +
    '<p>Year: ' + releaseDate + '</p>' +
  '</div>' +

  '<div class="watchlist-extra" id="watchlist-extra-1" style="background-image: url(\'https://image.tmdb.org/t/p/original/' + moviePoster + '\'); display: flex;">' +
    '<h3>description</h3>' +
    '<p>' + movieDescription + '</p>' +
    "<form id='watchlistForm' action='/removeWatchlist' method='POST'>" +
    "<input type='hidden' name='movieId' value='" + id + "'>" +
    "<button class='button-watchlist' type='submit'>remove from Watchlist</button>" +
    "</form>"+
  '</div>' +

'</div>';

  // Inserting the HTML into the watchlist movie card container
  $('.watchlist-movie-card-container').append(htmlString);
}
// Call fetchWatchlistMovieIds() when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    fetchWatchlistMovieIds();
    console.log("fetch watchlist called")
});



// Function to fetch reviews movie IDs
function fetchReviewsMovieIds() {
  fetch('/getReviewsMovieIds')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          // Handle the response data
          console.log(data.reviewsData);
          // Update the HTML content with the reviews movie IDs

          // After fetching movie IDs, build movie cards for each movie
          data.reviewsData.forEach(review => {
              getReviewsFromTMDB(review.movieId, review.reviewText, review.reviewNumber);
          });
      })
      .catch(error => console.error('Error:', error));
}

// Function to get movie details from TMDB
function getReviewsFromTMDB(movieId, reviewText, reviewNumber) {
  console.log(movieId);
  var apiKey = "7e6dd248e2a77acc70a843ea3a92a687"; // Replace with your TMDB API key
  var url = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=" + apiKey;
  console.log("movie searched for " + movieId)

  fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(jsondata => {
          console.log(jsondata);
          // Build movie card with the retrieved data and review text
          buildReviewsMovieCard(jsondata, reviewText, reviewNumber);
      })
      .catch(error => console.error('Error:', error));
}


// Function to build movie card HTML
function buildReviewsMovieCard(movieInfo, reviewText, reviewNumber) {
  // Extracting movie information
  var title = movieInfo.original_title;
  var moviePoster = "https://image.tmdb.org/t/p/original" + movieInfo.poster_path;
  var movieBackdrop = "https://image.tmdb.org/t/p/original" + movieInfo.backdrop_path;
  var releaseDate = movieInfo.release_date.split('-')[0];
  var id = movieInfo.id;

  // Constructing the HTML string for movie card
  var htmlString = "<div class='review-movie-card'>" +
  "<div class='review-movie-details'>" +
  "<h2>" + title + "</h2>" +
  "<img src='" + moviePoster + "' alt='Movie Poster'>" +
  "<p>Year: " + releaseDate + "</p>" +
  "</div>" +

  "<div class='review-extra' id='review-extra-" + id + "' style='background-image: url(" + movieBackdrop + ");'>" +
  "<h3>You rated it " + reviewNumber + " Stars!</h3>" +
  "<p id='review-text-" + id + "'>" + reviewText + "</p>" +
  "<button class='review-change-button' onclick='changeReview(" + id + ")'>Edit</button><br>" +
  "<form action='/delete-review' method='POST'>" +
  "<input type='hidden' id='movieId' name='movieId' value='" + id + "'>" +
  "<button class='review-delete-button' type='submit'>Delete</button>" +
  "</form>" +
  "</div>" +
  "<div class='review-change' id='review-change-" + id + "' style='background-image: url(" + movieBackdrop + ");'>" +
  "<h3>Edit your review</h3>" +
  "<form action='/change-review' method='POST'>" +
  "<select name='rating'>" + 
  "<option value='1'>1</option>" +
  "<option value='2'>2</option>" +
  "<option value='3'>3</option>"+
  "<option value='4'>4</option>" +
  "<option value='5'>5</option>" +
  "</select>" +
  "<input type='text' class='change-review-textbox' id='change-review-textbox-" + id + "' name='newReview' placeholder='Enter your new review'>" +
  "<input type='hidden' id='movieId' name='movieId' value='" + id + "'>" +
  "<button class='review-change-button' type='submit'>Save</button>" +
  "</form>" +
  "</div>" +
  "</div>";


  // Inserting the HTML into the reviews movie card container
  $('.reviews-movie-card-container').append(htmlString);
}

// Call fetchWatchlistMovieIds() when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  fetchReviewsMovieIds();
  console.log("fetch review called")
});
