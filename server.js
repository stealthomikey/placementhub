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
app.use(session({ secret: 'placementhub' }));

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
app.use(favicon(path.join(__dirname, 'public', 'img', 'thumbnail_image.png')));

// Route to render the index.ejs page
app.get('/', (req, res) => {
    res.render('pages/index', { user: req.session.loggedin ? req.session.user : null, req: req });
});

// Route to render the forumpages.ejs page
app.get('/forumpages', (req, res) => {
    res.render('pages/forumpages', { user: req.session.user });
});

app.get('/forumpost', (req, res) => {
    res.render('pages/forumpost', { user: req.session.user });
});

// Route to render the myaccount.ejs page
app.get('/myaccount', (req, res) => {
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true');
        return;
    }
    res.render('pages/myaccount', { user: req.session.user });
});

// Route to render the forum.ejs page
app.get('/forum', (req, res) => {
    res.render('pages/forum', { user: req.session.user });
});

// Route to render the accommodation.ejs page
app.get('/accommodation', (req, res) => {
    res.render('pages/accommodation', { user: req.session.user });
});

// Route to render the socials.ejs page
app.get('/socials', (req, res) => {
    res.render('pages/socials', { user: req.session.user });
});

// Route to render the createpost.ejs page
app.get('/createforumpost', (req, res) => {
    res.render('pages/createforumpost', { user: req.session.user });
});

// Valid locations for accommodation
const validLocations = ['nhs-tayside', 'nhs-shetland', 'nhs-highland', 'nhs-grampianmoray', 'nhs-grampian', 'nhs-glasgow-and-clyde', 'nhs-lanarkshire', 'nhs-borders'];
const capitalizedLocations = {
    'nhs-tayside': 'NHS-tayside',
    'nhs-shetland': 'NHS-shetland',
    'nhs-highland': 'NHS-highland',
    'nhs-grampianmoray': 'NHS-grampianmoray',
    'nhs-grampian': 'NHS-grampian',
    'nhs-glasgow-and-clyde': 'NHS-glasgow-and-clyde',
    'nhs-lanarkshire': 'NHS-lanarkshire',
    'nhs-borders': 'NHS-borders'
};

app.get('/accommodation/:location', (req, res) => {
    const location = req.params.location.toLowerCase();

    if (validLocations.includes(location)) {
        res.render(`pages/accommodation/${capitalizedLocations[location]}`, { user: req.session.user });
    } else {
        console.log("Error: Invalid location");
        res.status(404).send("Location not found");
    }
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

        if (result.login.password === pword) {
            req.session.loggedin = true;
            req.session.currentuser = uname;
            req.session.userId = result._id; // Set ObjectId in session
            req.session.stringUserId = result.userId; // Set string userId in session
            req.session.user = result; // Store user data in session
            res.redirect('/myaccount'); // Redirect to myaccount if login is successful
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
            "password": req.body.password // Storing password as is (not hashed)
        },
        "picture": { // Nested structure for profile picture
            "thumbnail": defaultProfilePic // Using default picture if no thumbnail provided
        }
    };

    db.collection('people').insertOne(datatostore, (err, result) => {
        if (err) {
            console.error('Error saving to database:', err);
            res.status(500).send('Error saving to database');
            return;
        }

        console.log('User saved to database');

        // Generate the userId as a string representation of the inserted ObjectId
        const userId = result.insertedId.toString(); // Convert ObjectId to string

        // Update the inserted document to include the userId
        db.collection('people').updateOne(
            { _id: result.insertedId },
            { $set: { userId: userId } }, // Store userId as a string
            (updateErr) => {
                if (updateErr) {
                    console.error('Error updating userId in database:', updateErr);
                    res.status(500).send('Error updating userId in database');
                    return;
                }

                // Redirect if signup is successful
                res.redirect('/myaccount');
            }
        );
    });
});

// Logout route
app.post('/logout', function (req, res) {
    req.session.loggedin = false;
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// Route to handle changing user's first name
app.post('/change-first-name', (req, res) => {
    const newFirstName = req.body.newFirstName;

    if (!newFirstName) {
        res.status(400).send('New first name is required.');
        return;
    }

    req.session.user.name.first = newFirstName;

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
            res.redirect('/myaccount');
        }
    );
});

// Route to handle changing user's username
app.post('/change-username', (req, res) => {
    const newUsername = req.body.newUsername;

    if (!newUsername) {
        res.status(400).send('New username is required.');
        return;
    }

    req.session.user.login.username = newUsername;

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
            res.redirect('/myaccount');
        }
    );
});

// Route to handle changing user's email
app.post('/change-email', (req, res) => {
    const newEmail = req.body.newEmail;

    if (!newEmail) {
        res.status(400).send('New email is required.');
        return;
    }

    req.session.user.email = newEmail;

    const userUsername = req.session.user.login.username;
    db.collection('people').updateOne(
        { "login.username": userUsername },
        { $set: { "email": newEmail } },
        (err, result) => {
            if (err) {
                console.error("Error updating user's email:", err);
                res.status(500).send('Error updating user\'s email');
                return;
            }
            console.log("User's email updated successfully");
            res.redirect('/myaccount');
        }
    );
});

// Route to handle adding a new forum post
app.post('/addpost', (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true'); // Redirect to login 
        return;
    }

    const userId = req.session.stringUserId;
    const postAnonymous = req.body.anonymousSwitch === 'on'; // Convert checkbox value to boolean
    const category = req.body.category; 
    const subcategory = req.body.subcategory;
    const postHeading = req.body.postHeading; // Get post heading from request body
    const postContent = req.body.postContent; // Get post content from request body

    // Construct the post object
    const newPost = {
        userId,
        anonymous: postAnonymous,
        category,
        subcategory,
        heading: postHeading,
        content: postContent,
        dateCreated: new Date()
    };

    // Add new post to the forum collection
    db.collection('forum').insertOne(newPost, (err, result) => {
        if (err) {
            console.error("Error adding post:", err);
            return res.status(500).send("Error adding post");
        }
        console.log("Post added:", result);
        res.redirect('/createforumpost');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Exit handler
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
