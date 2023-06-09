const dotenv = require('dotenv');
const path = require('path');
dotenv.config({path: path.join(__dirname, '../../.env.local')});

const fetchSubstitutions = (
    db,
    callback,
) => {
    db.query(
        `select s.id, s.creation_date, s.status, s.hour, s.duration_minutes, s.substitution_date, c.building, c.name as classroom_name, c.address, s.initial_reservation_date, 
        l.name as lecture_name, l.code 
        from ${process.env.DB_NAME}.substitution s, ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.departments d  where s.cid=c.id and s.rid=r.id and l.id=r.lid and d.id=l.department`, callback
    )
}

exports.fetchSubstitutions = fetchSubstitutions;

const insertClassroom = (
    db,
    body,
    callback,
) => {
    if(body.id){
        db.query(
            `update ${process.env.DB_NAME}.classroom set name=?, building=?, address=?, capacity=?, type=?, pc_count=?, projector=?, always_locked=?, weekly_availability=?, hourly_availability=? where id=?`, 
            [body.name, body.building, body.address, body.capacity, body.type, body.pc_coount, body.projector, body.always_locked, body.weekly_availability.join(','), body.hourly_availability.join(','), body.id], callback
        )
        return;
    }
    db.query(
        `insert into ${process.env.DB_NAME}.classroom (name, building, address, capacity, type, pc_count, projector, always_locked, weekly_availability, hourly_availability) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [body.name, body.building, body.address, body.capacity, body.type, body.pc_coount, body.projector, body.always_locked, body.weekly_availability.join(','), body.hourly_availability.join(',')], callback
    )
}

exports.insertClassroom = insertClassroom;

const fetchClassroom = (
    db,
    id,
    callback,
) => {
    db.query(
        `select * from ${process.env.DB_NAME}.classroom where id=${id}`, callback
    )
}

exports.fetchClassroom = fetchClassroom;

const fetchProfessors = (
    db,
    callback,
) => {
    db.query(
        `select * from ${process.env.DB_NAME}.user where approved = 1 and professor = 1`, callback
    )
}

exports.fetchProfessors = fetchProfessors;

const insertLecture = (
    db,
    body,
    department,
    callback,
) => {
    if(body.id){
        db.query(
            `update ${process.env.DB_NAME}.lecture set name=?, code=?, type=?, semester=?, lecture_hours=?, department=? where id=?`, 
            [body.name, body.code, body.type, body.semester, body.lecture_hours, department, body.id], (err, res) => {
                let values = [];
                try{
                    values = body.professors.map(uid => `(${body.id}, ${uid})`).join(',');
                }catch(error){
                    if(!body.professors){
                        callback(null, res);
                        return;
                    }
                    values = `(${body.id}, ${body.professors})`;
                }
                db.promise().query(`delete from ${process.env.DB_NAME}.lectureprofessors where lid=${body.id}`).then(res => {
                    db.query(
                        `insert into ${process.env.DB_NAME}.lectureprofessors (lid, uid) values ${values}`, callback
                    )
                    });
            }
        )
        return;
    }
    db.query(
        `insert into ${process.env.DB_NAME}.lecture (name, code, type, semester, lecture_hours, department) values (?,?,?,?,?,?)`, [body.name, body.code, body.type, body.semester, body.lecture_hours, department], (err, res) => {
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
                `insert into ${process.env.DB_NAME}.lectureprofessors (lid, uid) values ${values}`, callback
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
        `select * from ${process.env.DB_NAME}.classroom`, callback
    )
}

exports.fetchClassrooms = fetchClassrooms;

const fetchLecture = (
    db,
    id,
    department,
    callback
) => {
    db.query(
        `select * from ${process.env.DB_NAME}.lecture where id=${id} and department=${department}`, (err, res) => {
            if(err){
                callback(err, null);
                return;
            }
            db.query(
                `select * from ${process.env.DB_NAME}.lectureprofessors lp, ${process.env.DB_NAME}.user s where lid=${res[0].id} and s.id=lp.uid`, (err, result) => {
                    if(err){
                        callback(err, null);
                        return;
                    }
                    callback(null, {...res[0], professors: result.map(professor => professor.uid)})
                }
            )
        }
    )
}

exports.fetchLecture = fetchLecture;

const fetchLectures = (
    db,
    id,
    callback,
) => {
    db.query(
        `select u.first_name,u.last_name,u.professor_role,u.id as uid,l.id, l.code, l.name, l.type, l.semester, l.lecture_hours,d.title as department from ${process.env.DB_NAME}.lecture l, 
        ${process.env.DB_NAME}.departments d, ${process.env.DB_NAME}.lectureprofessors lp, ${process.env.DB_NAME}.user u where d.id=l.department and l.id=lp.lid and u.id=lp.uid and l.department=${id}`,(err, res) => {
            if(err){
                callback(err, null);
                return;
            }
            if(res==null || res.length==0){
                db.query(
                    `select l.id, l.code, l.name, l.type, l.semester, l.lecture_hours,d.title as department from ${process.env.DB_NAME}.lecture l, 
                    ${process.env.DB_NAME}.departments d where l.department=${id} and d.id=l.department`, callback
                )
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
                `select l.id, l.code, l.name, l.type, l.semester, l.lecture_hours,d.title as department from ${process.env.DB_NAME}.lecture l, 
                ${process.env.DB_NAME}.departments d where l.department=${id} and d.id=l.department and l.id not in (${ids});`, (err, result) => {
                    if(err){
                        callback(err, null);
                        return;
                    }
                    callback(null, [...filteredRes, ...result]);
                });
        });
}

async function getLectureProfessors(
    db,
    id,
    callback,
){
await db.promise().query(`select u.first_name,u.last_name,u.id,u.professor_role from ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.user u, ${process.env.DB_NAME}.lectureprofessors lp where l.id=lp.lid and u.id=lp.uid and l.id=${id}`).then((data) => {
    callback(null, res)
}).catch(err => callback(err, null));
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
    if(body.id){
        db.query(
            `update ${process.env.DB_NAME}.reservation set lid=?, cid=?, day=?, hour=?, duration_minutes=?, start_date=?, end_date=?, creation_date=? where id=?`, 
            [body.lid, body.cid, body.day, body.hour, body.duration_minutes, start_date, end_date, creation_date, body.id], callback
        )
        return;
    }
    db.query(
        `insert into ${process.env.DB_NAME}.reservation (lid, cid, day, hour, duration_minutes, start_date, end_date, creation_date) 
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
        `update ${process.env.DB_NAME}.substitution set status=?, reason=? where id in (?)`, [status, reason, ids.join(',')], callback
    )
}

exports.updateStatus = updateStatus;

const fetchReservations = (
    db,
    id,
    callback,
) => {
    db.query(
        `select r.start_date,r.end_date,r.day,r.hour,r.id,
        r.duration_minutes,c.name as classroom_name,c.building,c.address,d.title,l.name as lecture_name,l.code,l.type,l.semester,l.lecture_hours from 
        ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.departments d
        where l.id=r.lid and l.department=${id} and c.id=r.cid and d.id=l.department`, callback
    )
}

exports.fetchReservations = fetchReservations;

const fetchReservationsAll = (
    db,
    callback,
) => {
    db.query(
        `select r.start_date,r.end_date,r.day,r.hour,r.id,u.first_name,u.last_name,u.id as uid,r.id as rid,r.lid as lid,
        r.duration_minutes,c.name as classroom_name,c.building,c.address,d.title,d.id as department_id,l.name as lecture_name,l.code,l.type,l.semester,l.lecture_hours from 
        ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.departments d, ${process.env.DB_NAME}.user u, ${process.env.DB_NAME}.lectureprofessors lp 
        where l.id=r.lid and c.id=r.cid and d.id=l.department and l.id=lp.lid and u.id=lp.uid`,async (err, res) => {
            if(err){
                callback(err, null);
                return;
            }
            if(res==null || res.length==0){
                db.query(
                    `select r.start_date,r.end_date,r.day,r.hour,r.id,r.duration_minutes,c.name as classroom_name,c.building,c.address,d.title,l.name as lecture_name,l.code,l.type,l.semester,l.lecture_hours from
                    ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.departments d 
                    where l.id=r.lid and c.id=r.cid and d.id=l.department`, callback
                )
                return;
            }
            const ids = res.map(lecture => lecture.id).join(',');
            const lectureIds = res.map(reservation => reservation.lid)
            const professors = new Map();
            for(let i=0; i<lectureIds.length; i++){
                const lectureId = lectureIds[i];
                await db.promise().query(`select u.first_name,u.last_name,u.id,u.professor_role from ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.user u, ${process.env.DB_NAME}.lectureprofessors lp where l.id=lp.lid and u.id=lp.uid and l.id=${lectureId}`).
                then((data) => {
                    professors.set(lectureId, data[0]);
                });
            }
            const newRes = res.map(lecture => {
                return {
                    lid: lecture.lid,
                    building: lecture.building,
                    address: lecture.address,
                    code: lecture.code, department: lecture.title, id: lecture.id,lid:lecture.lid, 
                    deprtment_id: lecture.department_id,
                    lecture_hours: lecture.lecture_hours, lecture_name: lecture.lecture_name, 
                    semester: lecture.semester, type: lecture.type,
                    start_date: lecture.start_date, end_date: lecture.end_date,
                    day: lecture.day, hour: lecture.hour, duration_minutes: lecture.duration_minutes,
                    classroom_name: lecture.classroom_name,
                    professors: professors.get(lecture.lid)
                }
            });
            const filteredRes = [];
            newRes.forEach(lecture => {
                if(!filteredRes.find(l => l.lid==lecture.lid)){
                    filteredRes.push(lecture);
                }else{
                    filteredRes.find(l => l.lid==lecture.lid).professors = [...new Set(filteredRes.find(l => l.lid==lecture.lid).professors)];
                }
            });
            db.query(
                `select r.start_date,r.end_date,r.day,r.hour,r.id as rid,
                r.duration_minutes,c.name as classroom_name,c.building,c.address,d.title,l.name as lecture_name,l.code,l.type,l.semester,l.lecture_hours from
                ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.departments d 
                where l.id=r.lid and c.id=r.cid and d.id=l.department and r.id not in (${ids})`, (err, result) => {
                    if(err){
                        callback(err, null);
                        return;
                    }
                    callback(null, filteredRes.concat(result));
                }

            )
        }
    )
}


exports.fetchReservationsAll = fetchReservationsAll;

const insertSubstitution = (
    db,
    body,
    callback,
) => {
    const creation_date = new Date().getTime();
    const sub_date = new Date(body.substitution_date).getTime();
    db.query(
        `insert into ${process.env.DB_NAME}.substitution (rid, cid, hour, duration_minutes, substitution_date, 
            creation_date, initial_reservation_date) 
            values (?,?,?,?,?,?,?)`, 
            [body.rid, body.cid, body.hour, body.duration_minutes, `${sub_date}`, 
                `${creation_date}`, body.initial_reservation_date], callback
    )
};

exports.insertSubstitution = insertSubstitution;

const fetchClassroomReservations = (
    db,
    id,
    callback,
) => {
    db.query(
        `select r.start_date, r.end_date, r.day,r.hour,r.duration_minutes,l.code,l.name,l.type,
        l.semester,l.lecture_hours,d.title as department from ${process.env.DB_NAME}.classroom c, ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.lecture l, ${process.env.DB_NAME}.departments d 
        where c.id = ${id} and c.id = r.cid and r.lid=l.id and d.id=l.department`, callback
    )
}

exports.fetchClassroomReservations = fetchClassroomReservations;

const deleteClassroom = (
    db,
    id,
    callback,
) => {
    db.query(
        `delete from ${process.env.DB_NAME}.classroom where id=${id}`, callback
    )
}

exports.deleteClassroom = deleteClassroom;

const fetchReservation = (
    db,
    id,
    department,
    callback
) => {
    db.query(
        `select r.start_date,r.end_date,r.day,r.hour,r.id,r.duration_minutes, r.lid, r.cid from 
        ${process.env.DB_NAME}.reservation r, ${process.env.DB_NAME}.departments d, ${process.env.DB_NAME}.lecture l
        where l.id=r.lid and l.department=${department} and d.id=l.department and r.id=${id}`, callback
    )
    
}

exports.fetchReservation = fetchReservation;