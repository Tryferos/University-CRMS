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

const fetchUserId = (
    db, 
    id,
    callback,
) => {
    db.query(
        `select * from uni.user where id = ?`, [id], callback
    )
}

exports.fetchUserId = fetchUserId;

const fetchUsers = (
    db,
    adminId,
    approved,
    callback,
) => {
    db.query(
        `
        select s2.id,s2.professor_role, s2.first_name, s2.last_name, s2.email, s2.professor, s2.user_admin, s2.reserve_admin,s2.date,d.title as department from uni.user s1, uni.user s2, uni.departments d where s1.id<>s2.id and s1.department = s2.department and s1.id = ? and s1.department = d.id and s2.approved = ?;`, [adminId, approved], callback
    )
}

exports.fetchUsers = fetchUsers;

const insertUser = (
    db,
    body,
    callback,
) => {
    const isProfessor = body.professor=='true' ? 1 : 0;
    const isUserAdmin = body.user_admin=='true' ? 1 : 0;
    const isReserveAdmin = body.reserve_admin=='true' ? 1 : 0;
    const professorRole = isProfessor==1 ? body.professor_role : null;

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    db.query(
        `insert into uni.user (email, password, first_name, last_name, professor, user_admin, reserve_admin, professor_role, department, date) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [body.email, body.password, body.first_name, body.last_name, isProfessor, isUserAdmin, isReserveAdmin, professorRole, body.department, formattedDate], callback
    )
}

exports.insertUser = insertUser;

const updateUser = (
    db,
    id,
    approval,
    callback,
) => {
    if(approval!=1){
        db.query(
            `delete from uni.user where id = ? and approved = 0`, [id], callback
        )
        return;
    }
    db.query(
        `update uni.user set approved = ? where id = ?`, [approval, id], callback
    )
}

exports.updateUser = updateUser;

const deleteUser = (
    db,
    id,
    callback,
) => {
    db.query(
        `delete from uni.user where id = ?`, [id], callback
    )
}

exports.deleteUser = deleteUser;

const fetchDepartment = (
    db,
    id,
    callback,
) => {
    db.query(
        `select d.title as department from uni.user s, uni.departments d where s.id = ? and s.department = d.id`, [id], callback
    )
}

exports.fetchDepartment = fetchDepartment;