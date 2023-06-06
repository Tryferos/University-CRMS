const db = require('../app').db;

const fetchUser = (
    db,
    email,
    password,
    callback,
) => {
    db.query(
        `select * from uni.user where email = ? and password = ?`, [email, password], callback
    )
}

exports.fetchUser = fetchUser;

const insertUser = (
    db,
    body,
    callback,
) => {
    const isProfessor = body.professor=='true' ? 1 : 0;
    const isUserAdmin = body.user_admin=='true' ? 1 : 0;
    const isReserveAdmin = body.reserve_admin=='true' ? 1 : 0;
    const professorRole = isProfessor==1 ? body.professor_role : null;

    db.query(
        `insert into uni.user (email, password, first_name, last_name, professor, user_admin, reserve_admin, professor_role, department) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [body.email, body.password, body.first_name, body.last_name, isProfessor, isUserAdmin, isReserveAdmin, professorRole, body.department], callback
    )
}

exports.insertUser = insertUser;