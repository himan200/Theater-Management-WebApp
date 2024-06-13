const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    const moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'movies.json')));
    res.render('index', { title: 'Cinemax', moviesData });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', (req, res) => {
    // Implement login authentication
    req.session.authenticated = true;
    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    if (req.session.authenticated) {
        res.render('admin', { title: 'Admin' });
    } else {
        res.redirect('/login');
    }
});

app.get('/schedule', (req, res) => {
    const moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'movies.json')));
    res.render('schedule', { title: 'Schedule', moviesData });
});

app.get('/addedSuccessfully', (req, res) => {
    res.render("addedSuccessfully");
});

app.post('/add_movie', upload.single('poster'), (req, res) => {
    const { title, show_timings, cast, description } = req.body;
    const poster = req.file.filename;
    const newMovie = {
        title,
        show_timings: show_timings, // Assuming show_timings are separated by commas
        cast: cast.split(','),
        description,
        poster
    };
    // Add new movie to JSON file
    let moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'movies.json')));
    moviesData.current_movies.push(newMovie);
    fs.writeFileSync(path.join(__dirname, 'data', 'movies.json'), JSON.stringify(moviesData));
    
    // Send response with options to add more movies or exit
    res.redirect("/addedSuccessfully");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
