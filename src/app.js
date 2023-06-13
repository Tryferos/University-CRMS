const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const user = require('./libs/user');
const reservation = require('./libs/reservation');

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
    admin: {
        reservations: {
            index: path.join(__dirname, '../public/pages/admin/reservations.html'),
            classroom: path.join(__dirname, '../public/pages/admin/classroom.html'),
            reservation: path.join(__dirname, '../public/pages/admin/reservation.html'),
            lecture: path.join(__dirname, '../public/pages/admin/lecture.html'),
        },
        users: path.join(__dirname, '../public/pages/admin/users.html'),
    },
    professor: {
        professor: path.join(__dirname, '../public/pages/professor/professor.html'),
        reserve: path.join(__dirname, '../public/pages/professor/reserve.html'),
    }
}

app.use(express.json({limit: '4mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.urlencoded({limit: '4mb', extended: true}));

app.use(authMiddleware);
app.use(professorMiddleware);
app.use(adminMiddleware);

function authMiddleware(req, res, next) {
    const query = req.path;
    const excludedPaths = ['/login', '/', '/classroom', '/logout', '/register']
    if (!req.session[sessionObjectName] && !excludedPaths.includes(query)) {
        // return res.status(500).send({error: 'Not logged in'})
        res.redirect('/login?error_code=500')
        return;
    }
    next();
}  

function professorMiddleware(req, res, next){
    const path = req.path.toLowerCase();
    if(!path.startsWith('/professor')){
        return next();
    }
    user.fetchUserId(db, req.session[sessionObjectName], (err, result) => {
        const user = result[0];
        if(err || user.approved!=1 || user.professor!=1){
            res.redirect('/login?error_code=500')
            return;
        }
        next();
    });
}

function adminMiddleware(req, res, next){
    const path = req.path.toLowerCase();
    if(!path.startsWith('/admin')){
        return next();
    }
    user.fetchUserId(db, req.session[sessionObjectName], (err, result) => {
        const user = result[0];
        if(err){
            res.redirect('/login?error_code=500')
            return;
        }
        if((user.user_admin!=1 && user.reserve_admin!=1) || user.approved!=1){
            res.redirect('/login?error_code=500')
            return;
        }
        if(path.includes('/admin') && user.user_admin!=1 && user.reserve_admin!=1){
            res.redirect('/login?error_code=500')
            return;
        }
        if(path.includes('/admin/users') && user.user_admin!=1){
            res.redirect('/login?error_code=500')
            return;
        }
        if(path.includes('/admin/reservations') && user.reserve_admin!=1){
            res.redirect('/login?error_code=500')
            return;
        }
        next();
    });
}

app.get('/professor/reserve', (req, res) => {
    res.sendFile(files.professor.reserve);
});

app.get('/professor/professor', (req, res) => {
    res.sendFile(files.professor.professor);
});

app.get('/professor/lectures', (req, res) => {
    reservation.fetchLectures(db, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        const ownLectures = result.filter(lecture => lecture.professors && lecture.professors.some(prof => prof.uid==req.session[sessionObjectName]));
        res.send(ownLectures);
    });
});

app.get('/fetch-self', (req, res) => {
    user.fetchUserId(db, req.session[sessionObjectName], (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
})

app.get('/admin/users/fetch-users/:approval', (req, res) => {
    user.fetchUsers(db, req.session[sessionObjectName], req.params.approval,(err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
});

app.get('/admin/reservations/fetch-substitutions', (req, res) => {
    reservation.fetchSubstitutions(db, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });

})

app.post('/admin/reservations/update-status', (req, res) => {
    const {ids, status, reason} = req.body;
    if(!ids || !status){
        res.status(500).send({error: 'Error'})
        return;
    }
    reservation.updateStatus(db, ids, status, reason, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send({success: true});
    });
});

app.get('/admin/reservations/fetch-classrooms', (req, res) => {
    reservation.fetchClassrooms(db, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
});
app.get('/admin/reservations/fetch-lectures', (req, res) => {
    reservation.fetchLectures(db, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
});

app.get('/admin/reservations/classroom', (req, res) => {
    res.sendFile(files.admin.reservations.classroom);
});
app.post('/admin/reservations/classroom', (req, res) => {
    reservation.insertClassroom(db, req.body, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.redirect('/admin/reservations')
    });
});
app.get('/admin/reservations/lecture', (req, res) => {
    res.sendFile(files.admin.reservations.lecture);
});

app.post('/admin/reservations/lecture', (req, res) => {
    user.fetchDepartment(db, req.session[sessionObjectName],(err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        reservation.insertLecture(db, req.body, result[0].id, (err, result) => {
            if(err){
                res.status(500).send({error: 'Error'})
                return;
            }
            res.redirect('/admin/reservations')
        });
    });
});

app.get('/admin/reservations/reservation', (req, res) => {
    res.sendFile(files.admin.reservations.reservation);
});
app.post('/admin/reservations/reservation', (req, res) => {
    reservation.insertReservation(db, req.body, (err, result) => {
        if(err){
            res.redirect('/admin/reservations/reservation?error_code=504')
            return;
        }
        res.redirect('/admin/reservations')
    });
});


app.get('/admin/reservations', (req, res) => {
    res.sendFile(files.admin.reservations.index);
});
app.get('/admin/users', (req, res) => {
    res.sendFile(files.admin.users);
});

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

app.get('/fetch-department', (req, res) => {
    user.fetchDepartment(db, req.session[sessionObjectName],(err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
})

app.get('/admin/reservations/fetch-professors', (req, res) => {
    reservation.fetchProfessors(db, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send(result);
    });
})

app.post('/admin/users/delete-user', (req, res) => {
    const id = req.body.id;
    if(!id){
        res.status(500).send({error: 'Error'})
        return;
    }
    user.deleteUser(db, id, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send({success: true});
    });
})

app.post('/admin/users/application', (req, res) => {
    const {id, approval} = req.body;
    if(!id || (approval!=0 && approval!=1)){
        res.status(500).send({error: 'Error'})
        return;
    }
    user.updateUser(db, id, approval, (err, result) => {
        if(err){
            res.status(500).send({error: 'Error'})
            return;
        }
        res.send({success: true});
    });

});

app.post('/register', (req, res) => {
    const body = req.body;
    user.insertUser(db, body, (err, result) => {
        if(err){
            res.redirect('/register?error_code=506')
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