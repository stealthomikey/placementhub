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
  // Render index page with user data if logged in, otherwise render with null user
  res.render('pages/index', { user: req.session.loggedin ? req.session.user : null, req: req });
});

// Route to render the myaccount.ejs page
app.get('/myaccount', (req, res) => {
    // Redirect to login if not logged in
    if (!req.session.loggedin) {
        res.redirect('/?notloggedin=true');
        return;
    }
    // Render myaccount page with user data
    res.render('pages/myaccount', { user: req.session.user});
});

// Route to render the forum.ejs page
app.get('/forum', (req, res) => {
    // Render forum page with user data
    res.render('pages/forum', { user: req.session.user});
});

// Route to render the accommodation.ejs page
app.get('/accommodation', (req, res) => {
    // Render accommodation page with user data
    res.render('pages/accommodation', { user: req.session.user});
});

// Route to render the socials.ejs page
app.get('/socials', (req, res) => {
    // Render socials page with user data
    res.render('pages/socials', { user: req.session.user});
});

const validLocations = ['nhs-tayside', 'nhs-shetland', 'nhs-highland', 'nhs-grampianmoray', 'nhs-grampian', 'nhs-glasgow-and-clyde', 'NHS-lanarkshire'];
const capitalizedLocations = {
    'nhs-tayside': 'NHS-tayside',
    'nhs-shetland': 'NHS-shetland',
    'nhs-highland': 'NHS-highland',
    'nhs-grampianmoray': 'NHS-grampianmoray',
    'nhs-grampian': 'NHS-grampian',
    'nhs-glasgow-and-clyde': 'NHS-glasgow-and-clyde',
    'nhs-lanarkshire': 'NHS-lanarkshire'
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

        if (result.login.password == pword) {
            req.session.loggedin = true;
            req.session.currentuser = uname;
            req.session.userId = result._id; // Set userId in session
            req.session.user = result; // Store user data in session
            res.redirect('/myaccount'); // Redirect to myaccount if login successful

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


//logout route cause the page to Logout.
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
