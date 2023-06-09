
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