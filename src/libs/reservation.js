
const fetchSubstitutions = (
    db,
    callback,
) => {
    db.query(
        `select s.id, s.creation_date, s.status, s.hour, s.duration_minutes, s.substitution_date, c.building, c.name as classroom_name, c.address, 
        l.name as lecture_name, l.code 
        from uni.substitution s, uni.reservation r, uni.classroom c, uni.lecture l, uni.departments d  where s.cid=c.id and s.rid=r.id and l.id=r.lid and d.id=l.department`, callback
    )
}

exports.fetchSubstitutions = fetchSubstitutions;

const insertClassroom = (
    db,
    body,
    callback,
) => {
    db.query(
        `insert into uni.classroom (name, building, address, capacity, type, pc_count, projector, always_locked, weekly_availability, hourly_availability) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [body.name, body.building, body.address, body.capacity, body.type, body.pc_coount, body.projector, body.always_locked, body.weekly_availability.join(','), body.hourly_availability.join(',')], callback
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
    department,
    callback,
) => {
    db.query(
        `insert into uni.lecture (name, code, type, semester, lecture_hours, department) values (?,?,?,?,?,?)`, [body.name, body.code, body.type, body.semester, body.lecture_hours, department], (err, res) => {
            if(err){
                callback(err, null);
                return;
            }
            const lecture_id = res.insertId;
            let values = [];
            try{
                values = body.professors.map(uid => `(${lecture_id}, ${uid})`).join(',');
            }catch(error){
                if(!body.professors){
                    callback(null, res);
                    return;
                }
                values = `(${lecture_id}, ${body.professors})`;
            }
            db.query(
                `insert into uni.lectureprofessors (lid, uid) values ${values}`, callback
            )
        }
    )
}

exports.insertLecture = insertLecture;

const fetchClassrooms = (
    db,
    callback,
) => {
    db.query(
        `select * from uni.classroom`, callback
    )
}

exports.fetchClassrooms = fetchClassrooms;

const fetchLectures = (
    db,
    callback,
) => {
    db.query(
        `select u.first_name,u.last_name,u.professor_role,u.id as uid,l.id, l.code, l.name, l.type, l.semester, l.lecture_hours,d.title as department from uni.lecture l, 
        uni.departments d, uni.lectureprofessors lp, uni.user u where d.id=l.department and l.id=lp.lid and u.id=lp.uid`, (err, res) => {
            if(err || res.length==0){
                callback(err, null);
                return;
            }
            const ids = res.map(lecture => lecture.id).join(',');
            const newRes = res.map(lecture => {
                return {
                    code: lecture.code, department: lecture.department, id: lecture.id, lecture_hours: lecture.lecture_hours, name: lecture.name, semester: lecture.semester, type: lecture.type,
                    professors: res.filter(l => l.id==lecture.id).map(l => 
                        ({first_name: l.first_name, last_name: l.last_name, professor_role: l.professor_role, uid: l.uid}))
                }
            });
            const filteredRes = [];
            newRes.forEach(lecture => {
                if(!filteredRes.find(l => l.id==lecture.id)){
                    filteredRes.push(lecture);
                }
            });
            db.query(
                `select l.id, l.code, l.name, l.type, l.semester, l.lecture_hours,d.title as department from uni.lecture l, 
                uni.departments d where d.id=l.department and l.id not in (${ids});`, (err, result) => {
                    if(err){
                        callback(err, null);
                        return;
                    }
                    callback(null, [...filteredRes, ...result]);
                });
        });
}

exports.fetchLectures = fetchLectures;

const insertReservation = (
    db,
    body,
    callback,
) => {
    const creation_date = new Date().getTime();
    const start_date = new Date(body.start_date).getTime();
    const end_date = new Date(body.end_date).getTime();
    db.query(
        `insert into uni.reservation (lid, cid, day, hour, duration_minutes, start_date, end_date, creation_date) 
        values (?,?,?,?,?,?,?,?)`, 
        [body.lid, body.cid, body.day, body.hour, body.duration_minutes, start_date, end_date, creation_date], callback
    )
};

exports.insertReservation = insertReservation;

const updateStatus = (
    db,
    ids,
    status,
    reason,
    callback,
) => {
    db.query(
        `update uni.substitution set status=?, reason=? where id in (?)`, [status, reason, ids.join(',')], callback
    )
}

exports.updateStatus = updateStatus;

