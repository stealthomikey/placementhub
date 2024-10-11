// Import required modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const multer = require('multer');

const app = express();
const PORT = 8080; // Change port to the desired port number

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'example' }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Connect to MongoDB
const MongoClient = require('mongodb-legacy').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
const dbname = 'profiles';

let db;

// Connect to MongoDB and start server
async function connectDB() {
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbname);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

connectDB();

// Routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'img', 'cinemind_small_logo.png')));

// Route to render the index.ejs page
app.get('/', (req, res) => {
  // Render index page with user data if logged in, otherwise render with null user
  res.render('pages/index', { user: req.session.loggedin ? req.session.user : null, req: req });
});

// Route to render the error.ejs page
app.get('/error', function(req, res) {
    // Render index page with user data if logged in, otherwise render with null user
    res.render('pages/error', { user: req.session.loggedin ? req.session.user : null, req: req });
});


// Route to render the myaccount.ejs page
app.get('/myaccount', (req, res) => {
    // Redirect to login if not logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true');
        return;
    }
    // Render myaccount page with user data and watchlist
    res.render('pages/myaccount', { user: req.session.user});
});

app.get('/groups', (req, res) => {
    // Redirect to login if not logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true');
        return;
    }

    // Retrieve the username of the logged-in user
    const loggedInUser = req.session.user.login.username;

    // Find the user document using the username
    db.collection('people').findOne({ "login.username": loggedInUser }, (err, user) => {
        if (err) {
            console.error('Error retrieving user document:', err);
            res.status(500).send('Error retrieving user document');
            return;
        }

        // Access the user's groups array from the user document
        const userGroups = user.groups || []; // Default to an empty array if user has no groups

        // Find all groups that the user is a part of
        db.collection('groups').find({ groupCode: { $in: userGroups } }).toArray((err, groups) => {
            if (err) {
                console.error('Error retrieving groups:', err);
                res.status(500).send('Error retrieving groups');
                return;
            }

            // Render the groups page with user data and group details
            res.render('pages/groups', { user: req.session.user, userGroups: groups });
        });
    });
});




// Route to handle login form submission
app.post('/dologin', (req, res) => {
    const uname = req.body.username;
    const pword = req.body.password;

    db.collection('people').findOne({ "login.username": uname }, (err, result) => {
        if (err) throw err;

        if (!result) {
            res.redirect('/?notloggedin=true');
            return;
        }

        if (result.login.password == pword) {
            req.session.loggedin = true;
            req.session.currentuser = uname;
            req.session.userId = result._id; // Set userId in session
            req.session.user = result; // Store user data in session
            
            // Retrieve watchlist data for the user and store it in the session
            db.collection('people').findOne({ _id: result._id }, { watchlist: 1 }, (err, watchlistResult) => {
                if (err) throw err;
                req.session.user.watchlist = watchlistResult.watchlist;
                res.redirect('/myaccount'); // Redirect to myaccount if login successful
            });
        } else {
            res.redirect('/?notloggedin=true');
        }
    });
});

// Route to handle adding a new user
app.post('/adduser', (req, res) => {
    const defaultProfilePic = 'img/user1.jpg';
    const datatostore = {
        "name": {
            "first": req.body.first
        },
        "email": req.body.email,
        "login": {
            "username": req.body.username,
            "password": req.body.password
        },
        "picture": { // Nested structure for profile picture
            "thumbnail": defaultProfilePic // Using default picture if no thumbnail provided
        },
        "watchlist": { // Adding watchlist field
            "movieIds": ["105", "165"] // Initial movie IDs to add upon signup
        }
    };

    db.collection('people').insertOne(datatostore, (err, result) => {
        if (err) {
            console.error('Error saving to database:', err);
            res.status(500).send('Error saving to database');
            return;
        }
        console.log('User saved to database');
        // Set userId in session after user creation
        req.session.userId = result.insertedId;
        res.redirect('/myaccount'); // Redirect if signup successful
    });
});


//logour route cause the page to Logout.
//it sets our session.loggedin to false and then redirects the user to the login
app.post('/logout', function (req, res) {
  // Set the loggedin session variable to false
  req.session.loggedin = false;
  // Destroy the session
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      // Redirect the user to the login page
      res.redirect('/');
    }
  });
});



app.post('/addwatchlist', (req, res) => {
    const movieId = req.body.movieId;

        // Check if the user is logged in
        if (!req.session.loggedin) {
            res.redirect('/?notloggedin=true'); // Redirect to login page
            return;
        }

    if (!movieId) {
        res.status(400).send('Movie ID is required.');
        return;
    }

    const watchlist = req.session.user.watchlist;
    const userEmail = req.session.user.email; 

    if (watchlist.movieIds.includes(movieId)) {
        res.status(400).send('Movie is already in the watchlist.');
        return;
    }

    watchlist.movieIds.push(movieId);

    // Update user session
    req.session.user.watchlist = watchlist;

    console.log(userEmail); // Logging user email

    // Update the database
    db.collection('people').updateOne(
        { email: userEmail },
        { $set: { watchlist: req.session.user.watchlist }}, 
        function(err, result){
            if (err) {
                console.error("error updating watchlist:", err);
                return;
            }
            console.log("Set movie id " + movieId + " to user " + userEmail);
            res.redirect('/');
        }
    );
});





// retrieve watchlist movie IDs
app.get('/getWatchlistMovieIds', (req, res) => {
    // get watchlist movie ids from the session
    const watchlistMovieIds = req.session.user.watchlist.movieIds;


    // send the movie ids as the response
    res.json({ watchlistMovieIds });
});

app.post('/removeWatchlist', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login page
        return;
    }

    const movieIdToRemove = req.body.movieId;
    const userEmail = req.session.user.email; 

    // Check if movieId is provided
    if (!movieIdToRemove) {
        res.status(400).json({ error: "Movie ID is required." });
        return;
    }

    try {
        // Update the user document to remove the movieId from the watchlist
        const result = await db.collection('people').updateOne(
            { email: userEmail },
            { $pull: { 'watchlist.movieIds': movieIdToRemove } }
        );

        if (result.modifiedCount === 1) {
            // Update user session
            const index = req.session.user.watchlist.movieIds.indexOf(movieIdToRemove);
            if (index !== -1) {
                req.session.user.watchlist.movieIds.splice(index, 1);
            }
            console.log(`Movie with ID ${movieIdToRemove} removed from watchlist.`);
            res.redirect('/myaccount?showWatchlist=true');
        } else {
            res.status(404).json({ error: `Movie with ID ${movieIdToRemove} is not in the watchlist.` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/addreview', (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login 
        return;
    }

    const movieId = req.body.movieId;
    const movieReview = req.body.review; // Modified variable name
    const movieReviewNumber = req.body.rating; // Modified variable name

    if (!movieId) {
        res.status(400).send('Movie ID is required.');
        return;
    }

    const userEmail = req.session.user.email; 

    // Check if the user session contains reviews data, if not, initialize it as an empty array
    const reviews = req.session.user.reviews || [];

    // Assuming reviews is an array of objects
    reviews.push({ movieId, review: movieReview, rating: movieReviewNumber });

    // Update user session
    req.session.user.reviews = reviews;

    // Update the database
    db.collection('people').updateOne(
        { email: userEmail },
        { $set: { reviews: req.session.user.reviews }}, // Fixed typo: changed 'watchlist' to 'reviews'
        function(err, result){
            if (err) {
                console.error("Error updating reviews:", err);
                console.log(result)
                return;
            }
            console.log("Set review of movie id " + movieId + " to user " + userEmail);
            console.log(result)
            res.redirect('/');
        }
    );
});


app.get('/getReviewsMovieIds', (req, res) => {
    // Check if the user has any reviews
    if (!req.session.user.reviews || req.session.user.reviews.length === 0) {
        return res.status(404).json({ message: 'User has no reviews.' });
    }

    // Extract movie IDs and review texts from the session
    const reviewsData = req.session.user.reviews.map(review => ({
        movieId: review.movieId,
        reviewText: review.review,
        reviewNumber: review.rating
    }));

    // Send the movie IDs and review texts as the response
    res.json({ reviewsData });
});



// Route to handle changing user's first name
app.post('/change-first-name', (req, res) => {
    const newFirstName = req.body.newFirstName;

    // Check if new first name is provided
    if (!newFirstName) {
        res.status(400).send('New first name is required.');
        return;
    }

    // Update the user's first name in the session
    req.session.user.name.first = newFirstName;

    // Update the user's first name in the database
    const userEmail = req.session.user.email;
    db.collection('people').updateOne(
        { email: userEmail },
        { $set: { "name.first": newFirstName } },
        (err, result) => {
            if (err) {
                console.error("Error updating user's first name:", err);
                res.status(500).send('Error updating user\'s first name');
                return;
            }
            console.log("User's first name updated successfully");
            res.redirect('/myaccount'); // Redirect to the account page
        }
    );
});

// Route to handle changing user's first name
app.post('/change-username', (req, res) => {
    const newUsername = req.body.newUsername;

    // Check if new first name is provided
    if (!newUsername) {
        res.status(400).send('New first name is required.');
        return;
    }

    // Update the user's first name in the session
    req.session.user.login.username = newUsername;

    // Update the user's first name in the database
    const userEmail = req.session.user.email;
    db.collection('people').updateOne(
        { email: userEmail },
        { $set: { "login.username": newUsername } },
        (err, result) => {
            if (err) {
                console.error("Error updating user's username:", err);
                res.status(500).send('Error updating user\'s username');
                return;
            }
            console.log("User's username updated successfully");
            res.redirect('/myaccount'); // Redirect to the account page
        }
    );
});

// Route to handle changing user's email
app.post('/change-email', (req, res) => {
    const newEmail = req.body.newEmail;

    // Check if new email is provided
    if (!newEmail) {
        res.status(400).send('New first name is required.');
        return;
    }

    // Update the user's first name in the session
    req.session.user.email = newEmail;

    // Update the user's first name in the database
    const userUsername = req.session.user.login.username;
    db.collection('people').updateOne(
        { username: userUsername },
        { $set: { "email": newEmail } },
        (err, result) => {
            if (err) {
                console.error("Error updating user's first name:", err);
                res.status(500).send('Error updating user\'s first name');
                return;
            }
            console.log("User's first name updated successfully");
            res.redirect('/myaccount'); // Redirect to the account page
        }
    );
});

// Route to handle changing user's first name
app.post('/change-password', (req, res) => {
    const newPassword = req.body.newPassword;
    const newPassword2 = req.body.newPassword2;

    // Check if new first name is provided
    if (!newPassword) {
        res.status(400).send('New password is required.');
        return;
    }

        // Check if new first name is provided
    if (newPassword != newPassword2) {
        res.status(400).send('Passwords dont match.');
        return;
    }

    // Update the user's first name in the session
    req.session.user.login.password = newPassword;

    // Update the user's first name in the database
    const userEmail = req.session.user.email;
    db.collection('people').updateOne(
        { email: userEmail },
        { $set: { "login.password": newPassword } },
        (err, result) => {
            if (err) {
                console.error("Error updating user's password:", err);
                res.status(500).send('Error updating user\'s password');
                return;
            }
            console.log("User's password updated successfully");
            res.redirect('/myaccount'); // Redirect to the account page
        }
    );
});

// Route to handle changing user's movie review
app.post('/change-review', (req, res) => {
    const newReview = req.body.newReview;
    const newNumReview = req.body.rating;
    const movieId = req.body.movieId;

    // Check if new review is provided
    if (!newReview) {
        return res.status(400).send('New review is required.');
    }

    // Check if movie ID is provided
    if (!movieId) {
        return res.status(400).send('Movie ID is required.');
    }

    // Find the index of the review with the specified movie ID
    const reviewIndex = req.session.user.reviews.findIndex(review => review.movieId === movieId);

    // Check if the review exists
    if (reviewIndex === -1) {
        return res.status(404).send('Review not found for the specified movie ID.');
    }

    // Update the review text for the specified movie ID
    req.session.user.reviews[reviewIndex].review = newReview;
    req.session.user.reviews[reviewIndex].rating = newNumReview; // Update the rating

    // Update the review text in the database
    const userEmail = req.session.user.email;
    db.collection('people').updateOne(
        { email: userEmail, "reviews.movieId": movieId }, // Update the review with matching movieId
        { $set: { "reviews.$.review": newReview, "reviews.$.rating": newNumReview } }, 
        (err, result) => {
            if (err) {
                console.error("Error updating user's review:", err);
                return res.status(500).send('Error updating user\'s review');
            }
            console.log("User's review updated successfully");
            res.redirect('/myaccount?showReviews=true');
        }
    );
});


app.post('/delete-review', async (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login page
        return;
    }

    const movieIdToRemove = req.body.movieId;
    const userEmail = req.session.user.email; 

    // Check if movieId is provided
    if (!movieIdToRemove) {
        res.status(400).json({ error: "Movie ID is required." });
        return;
    }

    try {
        // Update the user document to remove the review for the specified movieId
        const result = await db.collection('people').updateOne(
            { email: userEmail },
            { $pull: { 'reviews': { movieId: movieIdToRemove } } }
        );

        if (result.modifiedCount === 1) {
            // Update user session
            const user = req.session.user;
            const index = user.reviews.findIndex(review => review.movieId === movieIdToRemove);
            if (index !== -1) {
                user.reviews.splice(index, 1);
            }
            console.log(`Review for movie with ID ${movieIdToRemove} removed.`);
            res.redirect('/myaccount'); // Redirect to the account page
        } else {
            res.status(404).json({ error: `Review for movie with ID ${movieIdToRemove} not found.` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/img'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      // Check if username is available in the session
      if (req.session && req.session.user && req.session.user.login && req.session.user.login.username) {
        const username = req.session.user.login.username;
        const fileExtension = path.extname(file.originalname); // Get the file extension
        const filename = `${username}${fileExtension}`; // Set the filename with username and original file extension
        cb(null, filename); 
      } else {
        cb(new Error('Username not found in session'), null);
      }
    }
  });

// Initialize multer with the defined storage
const upload = multer({
    storage: storage,
    // Overwrite existing files with the same name
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
});

// Route to handle file upload
app.post('/upload', upload.single('photo'), async (req, res) => {
    // Check if file is present in the request
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Update the user's profile picture path in MongoDB
    if (req.session && req.session.user && req.session.user.login && req.session.user.login.username) {
        const username = req.session.user.login.username;
        const email = req.session.user.email;
        const newImageName = "img/" + username + path.extname(req.file.originalname); // Construct the new image path
        // Update the user's profile picture path in MongoDB
        try {
            // Update the user's profile picture path in MongoDB
            const result = await db.collection('people').updateOne(
                { email: email },
                { $set: { "picture.thumbnail": newImageName } }
            );
        
            if (result.modifiedCount === 1) {
                // Update the profile picture path in the session user object
                req.session.user.picture.thumbnail = newImageName;
                res.redirect('/myaccount');
            } else {
                console.error("Failed to update profile picture path in MongoDB");
                res.redirect('/myaccount');
            }
        } catch (error) {
            console.error("Error updating profile picture path in MongoDB:", error);
            res.redirect('/myaccount');
        }
    } else {
        return res.status(500).send('Failed to update profile picture');
    }
});


const generateGroupCode = () => {
    // Generate a random 6-digit group code
    return Math.floor(100000 + Math.random() * 900000);
};

// Route to handle adding a new group
app.post('/addGroup', (req, res) => {
    // Get the group name from the form
    const groupName = req.body.groupName;

    // Generate a random 6-digit group code
    const groupCode = generateGroupCode();

    // Get the logged-in user's username from the session
    const loggedInUser = req.session.user.login.username;

    // Construct the initial group data
    const datatostore = {
        "groupName": groupName,
        "groupCode": groupCode,
        "groupMembers": [loggedInUser], // Add the logged-in user to the group members
        "groupWatchlist": [],
        "groupChats": [
          {
            "sender": "Server",
            "message": `New group "${groupName}" created!`,
            "timestamp": new Date()
          },
        ]
    };

    // Insert the group data into the 'groups' collection
    db.collection('groups').insertOne(datatostore, (err, result) => {
        if (err) {
            console.error('Error saving to database:', err);
            res.status(500).send('Error saving to database');
            return;
        }
        console.log('Group saved to database');

        // Update the user's document to add the group code
        db.collection('people').updateOne(
            { "login.username": loggedInUser },
            { $push: { "groups": groupCode } },
            (err, result) => {
                if (err) {
                    console.error('Error updating user document:', err);
                    res.status(500).send('Error updating user document');
                    return;
                }
                console.log(`Group code ${groupCode} added to user ${loggedInUser}`);
                res.redirect('/groups'); // Redirect if group creation and user update are successful
            }
        );
    });
});

// Route to handle joining a group
app.post('/joinGroup', (req, res) => {
    // Get the group code from the form
    const groupCode = parseInt(req.body.groupCode); // Assuming groupCode is a number

    // Get the logged-in user's username from the session
    const loggedInUser = req.session.user.login.username;

    // Find the group with the provided group code
    db.collection('groups').findOne({ groupCode: groupCode }, (err, group) => {
        if (err) {
            console.error('Error finding group:', err);
            res.status(500).send('Error finding group');
            return;
        }

        if (!group) {
            res.status(404).send('Group not found');
            return;
        }

        // Add the logged-in user to the group members
        db.collection('groups').updateOne(
            { groupCode: groupCode },
            { $push: { groupMembers: loggedInUser } },
            (err, result) => {
                if (err) {
                    console.error('Error updating group members:', err);
                    res.status(500).send('Error updating group members');
                    return;
                }

                // Update the user's document to add the group code
                db.collection('people').updateOne(
                    { "login.username": loggedInUser },
                    { $addToSet: { "groups": groupCode } }, // Ensure no duplicates
                    (err, result) => {
                        if (err) {
                            console.error('Error updating user document:', err);
                            res.status(500).send('Error updating user document');
                            return;
                        }
                        console.log(`User ${loggedInUser} joined group ${group.groupName}`);
                        res.redirect('/groups'); // Redirect if successful
                    }
                );
            }
        );
    });
});


// Retrieve the group codes a user is a part of
app.get('/getUserGroupCodes', (req, res) => {
    // Get the logged-in user's username from the session
    const loggedInUser = req.session.user.login.username;

    // Find the user document using the username
    db.collection('people').findOne({ "login.username": loggedInUser }, (err, user) => {
        if (err) {
            console.error('Error retrieving user document:', err);
            res.status(500).send('Error retrieving user document');
            return;
        }

        // Access the user's groups array from the user document
        const userGroups = user.groups;
        
        // Send the user's group codes as the response
        res.render('groups', { userGroups }); // Assuming 'groups' is your EJS template file
    });
});


app.post('/addgroupwatchlist', (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login 
        return;
    }

    const movieId = req.body.movieId;
    const watchDate = req.body.watchDate;
    const watchTime = req.body.watchTime;
    const groupCode = parseInt(req.body.groupCode);

    // checks group exists
    if (isNaN(groupCode)) {
        res.status(400).send('Invalid group code.');
        return;
    }
    // Ensure required fields are provided
    if (!movieId || !watchDate || !watchTime || !groupCode) {
        res.status(400).send('Movie ID, watch date, watch time, and group code are required.');
        return;
    }

    console.log("Looking for group with code:", groupCode); // Log the group code

    // Find the group in the database
    db.collection('groups').findOne({ groupCode: groupCode }, (err, group) => {
        if (err) {
            console.error("Error finding group:", err);
            return res.status(500).send('Error finding group.');
        }

        if (!group) {
            console.log("Group not found for code:", groupCode);
            return res.status(404).send('Group not found.');
        }

        // Check if the user is a member of the group
        const loggedInUser = req.session.user.login.username;
        if (!group.groupMembers.includes(loggedInUser)) {
            return res.status(403).send('You are not a member of this group.');
        }

        // Update group's watchlist
        db.collection('groups').updateOne(
            { groupCode: groupCode },
            { $push: { groupWatchlist: { movieId: movieId, watchDate: watchDate, watchTime: watchTime } } },
            function(err, result) {
                if (err) {
                    console.error("Error updating watchlist:", err);
                    return res.status(500).send('Error updating watchlist.');
                }
                console.log("Added movie ID " + movieId + " to group watchlist.");
                res.redirect('/groups');
            }
        );
    });
});


// Route to handle GET request for fetching group watchlist data
app.get('/getGroupWatchlist', async (req, res) => {
    const groupCode = req.query.groupCode;

    try {
        const client = await MongoClient.connect(url);

        const db = client.db('profiles'); 

        // Find the group by groupCode
        const groupsCollection = db.collection('groups');
        const group = await groupsCollection.findOne({ groupCode: parseInt(groupCode) });

        if (group) {
            // If group found, send back the group watchlist data
            res.json({ groupWatchlist: group.groupWatchlist });
        } else {
            // If group not found, send 404 error
            res.status(404).json({ error: 'Group watchlist not found' });
        }

        // Close the connection
        await client.close();
    } catch (error) {
        // If an error occurs, send 500 error
        console.error('Error fetching group watchlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle sending messages
app.post('/send-message', (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login page if not logged in
        return;
    }

    // Retrieve message and group code from the form submission
    const message = req.body.message;
    const groupCode = req.body.groupCode;

    // Retrieve the username of the user who sent the message from their logged-in username
    const loggedInUsername = req.session.user.login.username;

    // Check if the message and group code are provided
    if (!message || !groupCode) {
        res.status(400).send('Message and group code are required.');
        return;
    }

    // Construct the message object
    const newMessage = {
        sender: loggedInUsername,
        message: message,
        timestamp: new Date()
    };

    // Update the messages collection in MongoDB with the new message
    db.collection('messages').updateOne(
        { groupCode: groupCode },
        { $push: { messages: newMessage } },
        { upsert: true }, // Create a new document if groupCode doesn't exist
        (err, result) => {
            if (err) {
                console.error('Error saving message to database:', err);
                res.status(500).send('Error saving message to database');
                return;
            }
            console.log('Message saved to database');
            res.redirect('groups?showGroup='+groupCode+''); 
        }
    );
});

// Route to handle fetching messages
app.get('/getMessages', (req, res) => {
    // Get the group code from the query parameters
    const groupCode = req.query.groupCode;

    // Check if the group code is provided
    if (!groupCode) {
        res.status(400).send('Group code is required.');
        return;
    }

    // Query the MongoDB collection for messages with the provided group code
    db.collection('messages').findOne({ groupCode: groupCode }, (err, result) => {
        if (err) {
            console.error('Error fetching messages from database:', err);
            res.status(500).send('Error fetching messages from database');
            return;
        }

        // Check if messages are found for the group code
        if (!result) {
            res.status(404).send('Messages not found for the provided group code.');
            return;
        }

        // Log the fetched messages

        // Send the messages as a JSON response
        res.json({ messages: result.messages });
    });
});
