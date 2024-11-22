// Import required modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const multer = require('multer');
const { ObjectId } = require('mongodb');


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

// Route to render the forumpages.ejs page
app.get('/forumpages', (req, res) => {
    // Render index page with user data if logged in, otherwise render with null user
    res.render('pages/forumpages', { user: req.session.user});
  });

  app.get('/forumpost', (req, res) => {
    // Render index page with user data if logged in, otherwise render with null user
    res.render('pages/forumpost', { user: req.session.user});
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

app.get('/forum', async (req, res) => {
    try {
        // Fetch all forum posts from the database
        const forumPosts = await db.collection('forum').find({}).toArray();

        // Organize posts into categories and subcategories
        const categories = {};

        forumPosts.forEach(post => {
            const { category, subcategory } = post;

            // Initialize category if it doesn't exist
            if (!categories[category]) {
                categories[category] = {};
            }

            // Initialize subcategory if it doesn't exist
            if (!categories[category][subcategory]) {
                categories[category][subcategory] = [];
            }

            // Add the post to the subcategory list
            categories[category][subcategory].push(post);
        });

        // Render the forum page with the categories object
        res.render('pages/forum', {
            user: req.session.user,
            categories: categories
        });

    } catch (err) {
        console.error('Error fetching forum posts:', err);
        res.status(500).send('Error fetching forum posts');
    }
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

// Route to render the createpost.ejs page
app.get('/createforumpost', (req, res) => {
    // Render create forum post page with user data
    res.render('pages/createforumpost', { user: req.session.user});
});

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

// Route to handle user registration
app.post('/adduser', async (req, res) => {
    try {
        const { first, username, email, password, school, course } = req.body;

        // Check if all required fields are provided
        if (!first || !username || !email || !password || !school || !course) {
            return res.status(400).send('All fields are required');
        }

        // Create a new user object
        const newUser = {
            name: {
                first: first,
                username: username
            },
            email: email,
            login: {
                username: username,
                password: password // In production, you should hash the password before saving it
            },
            school: school,
            course: course,
            picture: {
                thumbnail: 'img/default_user.png' // Assign a default picture initially
            }
        };

        // Insert the new user into the 'people' collection
        const result = await db.collection('people').insertOne(newUser);

        // Set the session and redirect to the home page
        req.session.loggedin = true;
        req.session.user = {
            id: result.insertedId,
            name: `${first}`,
            email: email,
            course: course
        };

        res.redirect('/');

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
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

// Multer configuration for profile picture
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img'); // Destination folder for profile pictures
    },
    filename: function (req, file, cb) {
        if (req.session && req.session.user && req.session.user.login && req.session.user.login.username) {
            const username = req.session.user.login.username;
            const fileExtension = path.extname(file.originalname);
            const filename = `${username}${fileExtension}`;
            cb(null, filename); 
        } else {
            cb(new Error('Username not found in session'), null);
        }
    }
});

// Multer configuration for post images
const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/postimg'); // Destination folder for post images
    },
    filename: function (req, file, cb) {
        const userId = req.session.stringUserId;
        const dateCreated = Date.now(); // Use current timestamp for uniqueness
        const fileExtension = path.extname(file.originalname);
        const filename = `${userId}${dateCreated}${fileExtension}`; // Name format: useriddatecreated
        cb(null, filename);
    }
});

// Initialize multer with the defined storage for profile picture and post images
const uploadProfile = multer({ storage: profileStorage });
const uploadPostImage = multer({ storage: postStorage });

// Route to handle profile picture upload
app.post('/upload', uploadProfile.single('photo'), async (req, res) => {
    // Check if file is present in the request
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Update the user's profile picture path in MongoDB
    if (req.session && req.session.user && req.session.user.login && req.session.user.login.username) {
        const username = req.session.user.login.username;
        const email = req.session.user.email;
        const newImageName = "img/" + username + path.extname(req.file.originalname); // Construct the new image path
        try {
            const result = await db.collection('people').updateOne(
                { email: email },
                { $set: { "picture.thumbnail": newImageName } }
            );

            if (result.modifiedCount === 1) {
                req.session.user.picture.thumbnail = newImageName; // Update session user object
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

// Route to handle adding a post with an optional image upload
app.post('/addpost', uploadPostImage.single('postImage'), (req, res) => {
    // Check if the user is logged in
    if (!req.session.loggedin) {
        return res.redirect('/?notloggedin=true'); // Redirect to login
    }

    const userId = req.session.stringUserId;
    const postAnonymous = req.body.anonymousSwitch === 'on'; // Convert checkbox value to boolean

    // Determine the category and subcategory
    const category = req.body.category === 'other' ? req.body.customCategory : req.body.category; 
    const subcategory = req.body.subcategory === 'other' ? req.body.customSubcategory : req.body.subcategory;

    const postHeading = req.body.postHeading; 
    const postContent = req.body.postContent; 

    // Prepare to save the image name if it exists
    let postImageName = req.file ? req.file.filename : null;

    // Construct the post object
    const newPost = {
        userId,
        anonymous: postAnonymous,
        category: category || 'Unspecified', 
        subcategory: subcategory || 'Unspecified', 
        heading: postHeading,
        content: postContent,
        dateCreated: new Date(),
        image: postImageName 
    };

    // Add new post to the forum collection
    db.collection('forum').insertOne(newPost, (err, result) => {
        if (err) {
            console.error("Error adding post:", err);
            return res.status(500).send("Error adding post");
        }

        // Add the forumId to the newPost object after insertion
        const forumId = result.insertedId.toString(); // Convert ObjectId to string
        newPost.forumId = forumId; // Assign the forumId to the newPost object

        
        // Update the inserted document to include the userId
        db.collection('forum').updateOne(
            { _id: result.insertedId },
            { $set: { forumId: forumId } }, // Store userId as a string
            (updateErr) => {
                if (updateErr) {
                    console.error('Error updating userId in database:', updateErr);
                    res.status(500).send('Error updating userId in database');
                    return;
                }

                console.log("Post added:", newPost);
                console.log("New forum post ID:", forumId); // Log the forumId if needed
        
                res.redirect('/createforumpost');
        });
            }
        );
    });

    app.get('/:category/:subcategory?', async (req, res) => {
        try {
            const { category, subcategory } = req.params;
    
            // Normalize the category and subcategory values to ensure consistency
            const normalizedCategory = category.replace(/-/g, ' ').toLowerCase();
            const normalizedSubcategory = subcategory ? subcategory.replace(/-/g, ' ').toLowerCase() : null;
    
            // Log incoming parameters
            console.log('Category:', normalizedCategory);
            console.log('Subcategory:', normalizedSubcategory);
    
            const query = {
                category: new RegExp(`^${normalizedCategory}$`, 'i') // Case-insensitive match for category
            };
    
            if (normalizedSubcategory) {
                query.subcategory = new RegExp(`^${normalizedSubcategory}$`, 'i'); // Case-insensitive match for subcategory
            }
    
            // Log the query to verify
            console.log('Query:', query);
    
            // Fetch all posts that match the given category and subcategory (if provided)
            const posts = await db.collection('forum').find(query).toArray();
    
            // Log the fetched posts to check if posts are retrieved
            console.log('Fetched Posts:', posts);
    
            // Get user details for each post, handling cases where userId might be null
            const filledPosts = await Promise.all(posts.map(async (post) => {
                if (post.userId) {
                    try {
                        const userId = new ObjectId(post.userId);
                        const user = await db.collection('people').findOne({ _id: userId });
    
                        if (user) {
                            console.log(`User found for userId ${post.userId}:`, user);
    
                            // Check if the user.course exists and log it
                            console.log(`User course for userId ${post.userId}:`, user.course);
    
                            return {
                                ...post,
                                userName: user.name.first,
                                userCourse: user.course, // No default value for userCourse
                                userPhoto: user.picture.thumbnail, // No fallback, use the user's picture
                                postDate: post.dateCreated.toDateString(),
                                title: post.heading,
                                upVotes: post.upVotes || 0,
                                downVotes: post.downVotes || 0,
                                comments: post.comments || 0
                            };
                        } else {
                            console.log(`User not found for userId: ${post.userId}`);
                        }
                    } catch (err) {
                        console.error(`Error converting userId: ${post.userId} to ObjectId`, err);
                    }
                }
    
                // If userId is null or user not found, use default values
                return {
                    ...post,
                    userName: 'Anonymous',
                    userCourse: '', // No course if user not found
                    postDate: post.dateCreated.toDateString(),
                    title: post.heading,
                    upVotes: post.upVotes || 0,
                    downVotes: post.downVotes || 0,
                    comments: post.comments || 0
                };
            }));
    
            // Log the filled posts data
            console.log('Filled Posts Data:', filledPosts);
    
            // Render the forumpost page with the fetched posts
            res.render('pages/forumpost', {
                user: req.session.user,
                posts: filledPosts,
                category: category,
                subcategory: subcategory || null
            });
    
        } catch (err) {
            console.error('Error fetching forum posts:', err);
            res.status(500).send('Error fetching forum posts');
        }
    });
    