
const fetchSubstitutions = (
    db,
    callback,
) => {
    db.query(
        `select * from uni.substitution`, callback
    )
}

const insertClassroom = (
    db,
    body,
    callback,
) => {
    db.query(
        `insert into uni.classroom (name, building, address, capacity, type, pc_count, projector, always_locked, weekly_availability, hourly_availability) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [body.name, body.address, body.building, body.capacity, body.type, body.pc_coount, body.projector, body.always_locked, body.weekly_availability.join(','), body.hourly_availability.join(',')], callback
    )
}

exports.insertClassroom = insertClassroom;

const fetchProfessors = (
    db,
    callback,
) => {
    db.query(
        `select * from uni.user where approved = 1 and professor = 1`, callback
    )
}

exports.fetchProfessors = fetchProfessors;

const insertLecture = (
    db,
    body,
    callback,
) => {
    db.query(
        `insert into uni.lecture (name, code, type, semester, lecture_hours, department) values (?,?,?,?,?,?)`, [body.name, body.code, body.type, body.semester, body.lecture_hours, body.department], (err, res) => {
            if(err){
                callback(err, null);
                return;
            }
            const lecture_id = res.insertId;
            const values = body.professors.map(uid => `(${lecture_id}, ${uid})`).join(',');
            db.query(
                `insert into uni.lectureprofessors (lid, uid) values ${values}`, callback
            )
        }
    )
}

exports.insertLecture = insertLecture;