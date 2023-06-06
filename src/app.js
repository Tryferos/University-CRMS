const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const user = require('./libs/user');

dotenv.config({path: path.join(__dirname, '../.env.local')});

const app = express()
const port = 3000;

app.use(express.static('public'));

app.use(session({
    secret: 'secret-4123e8&&%32kda36212*/423*^32',
    cookie: {
        sameSite: 'strict',
        maxAge: 86400000,
    },
    resave: false,
    saveUninitialized: true,
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

exports.db = db;

const sessionObjectName = 'userid'

const files = {
    index: path.join(__dirname, '../public/pages/index.html'),
    login: path.join(__dirname, '../public/pages/login.html'),
    register: path.join(__dirname, '../public/pages/register.html'),
}

app.use(express.json({limit: '4mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.urlencoded({limit: '4mb', extended: true}));

app.use(authMiddleware);

function authMiddleware(req, res, next) {
    const query = req.path;
    const excludedPaths = ['/login', '/', '/classroom', '/logout', '/register']
    if (!req.session[sessionObjectName] && !excludedPaths.includes(query)) {
        return res.status(500).send({error: 'Not logged in'})
    }
    next();
}  

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    user.fetchUser(db, email, password, (err, result) => {
        if(err || result.length==0){
            res.redirect('/login?error_code=500')
            return;
        }
        if(result[0].approved==0){
            res.redirect('/login?error_code=502')
            return;
        }
        if(result.length > 0){
            req.session[sessionObjectName] = result[0].id;
            res.redirect('/');
            return;
        }
        res.redirect('/login?error=Error')
    });
});

app.get('/register', (req, res) => {
    if(req.session[sessionObjectName]){
        res.redirect('/');
        return;
    }
    res.sendFile(files.register);
});

app.post('/register', (req, res) => {
    const body = req.body;
    user.insertUser(db, body, (err, result) => {
        if(err){
            res.redirect('/register?error_code=500')
            return;
        }
        res.redirect('/')
    });
});


app.get('/', (req, res) => {
    res.sendFile(files.index);
});

app.get('/logout', (req, res) => {
    req.session[sessionObjectName] = null;
    req.session.destroy(err => {
        res.redirect('/');
    })
})

app.get('/login', (req, res) => {
    if(req.session[sessionObjectName]){
        res.redirect('/classroom');
        return;
    }
    res.sendFile(files.login);
});

app.listen(port, () => {
    console.log('running in: '+`http://localhost:${port}`)
});