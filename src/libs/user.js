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