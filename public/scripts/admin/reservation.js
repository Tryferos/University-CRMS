function handleBack(ev){
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = '/admin/reservations';
}

window.addEventListener('load', async function(){
    populateDays();
    populateHours();
    const classrooms = await fetchFromServer('admin/reservations/fetch-classrooms');
    const lectures = await fetchFromServer('admin/reservations/fetch-lectures');
    populateClassrooms(classrooms);
    populateLectures(lectures);
});

function handleClassroomChange(ev){
    const dataset = ev.target.options[ev.target.selectedIndex].dataset;
    populateClassroomDetails(dataset);
}

function handleLectureChange(ev){
    const dataset = ev.target.options[ev.target.selectedIndex].dataset;
    populateLectureDetails(dataset);
}

function populateLectureDetails(dataset){
    document.getElementById('details-l').style.display = 'flex';
    const details = document.getElementById('lecture-details');
    details.innerHTML = `
        <p><b>Όνομα:</b> ${dataset.name}</p>
        <p><b>Κωδικός:</b> ${dataset.code}</p>
        <p><b>Εξάμηνο:</b> ${dataset.semester}</p>
        <p><b>Τμήμα:</b> ${dataset.department}</p>
        ${dataset.professors ? `<p><b>Καθηγητές:</b> ${dataset.professors.replace('\n', '<br>')}</p>` : ''}
        <p><b>Τύπος:</b> ${dataset.type}</p>
        `;
}

function populateClassroomDetails(dataset){
    document.getElementById('details-c').style.display = 'flex';
    const details = document.getElementById('classroom-details');
    details.innerHTML = `
        <p><b>Όνομα:</b> ${dataset.name}</p>
        <p><b>Κτίριο:</b> ${dataset.building}</p>
        <p><b>Διεύθυνση:</b> ${dataset.address}</p>
        <p><b>Χωρητικότητα:</b> ${dataset.capacity}</p>
        <p><b>Τύπος:</b> ${dataset.type}</p>
        ${dataset.pc_count!=='null' ? `<p><b>Αριθμός Η/Υ:</b> ${dataset.pc_count}</p>` : ''}
        <p><b>Προτζέκτορας:</b> ${dataset.projector}</p>
        <p><b>Κλειδωμένη:</b> ${dataset.always_locked}</p>
        ${dataset.weekly_availability !=='null' ? `<p><b>Εβδομαδιαία Διαθεσιμότητα:</b> 
        ${dataset.weekly_availability.split(',').map(day => formatDays(day)).join(',')}</p>` : ''}
        ${dataset.hourly_availability !=='null' ? `<p><b>Ωριαία Διαθεσιμότητα:</b> 
        ${dataset.hourly_availability.split(',').map(hour => formatHours(hour)).join(',')}</p>` : ''}
    `;
}

const days =  ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη','Παρασκευή', 'Σάββατο'];
function formatDays(day){
    return days[day];
}
function formatHours(hour){
    if(hour<10){
        return `0${hour}:00`;
    }
    return `${hour}:00`;
}

function populateLectures(lectures){
    console.log(lectures)
    if(!(lectures.length > 0)){
        return;
    }

    const select = document.getElementById('lid');
    lectures.forEach((lecture, i) => {
        const option = document.createElement('option');
        option.value = lecture.id;
        option.dataset.code = lecture.code;
        option.dataset.semester = lecture.semester;
        option.dataset.department = lecture.department;
        if(lecture.professors){
            option.dataset.professors = lecture.professors.map(
                professor => professor.first_name+", "+professor.last_name+", "+professor.professor_role).join('\n');
        }
        option.dataset.type = lecture.type;
        option.dataset.name = lecture.name;
        option.innerHTML = `${lecture.name} - ${lecture.code}`;
        if(i==0){
            populateLectureDetails(option.dataset);
        }
        select.appendChild(option);
    });
};

function populateClassrooms(classrooms){
    console.log(classrooms)
    if(!(classrooms.length > 0)){
        return;
    }

    const select = document.getElementById('cid');
    classrooms.forEach((classroom, i) => {
        const option = document.createElement('option');
        option.value = classroom.id;
        option.dataset.building = classroom.building;
        option.dataset.address = classroom.address
        option.dataset.capacity = classroom.capacity;
        option.dataset.type = classroom.type;
        option.dataset.pc_count = classroom.pc_count;
        option.dataset.projector = classroom.projector;
        option.dataset.always_locked = classroom.always_locked;
        option.dataset.weekly_availability = classroom.weekly_availability;
        option.dataset.hourly_availability = classroom.hourly_availability;
        option.dataset.name = classroom.name;
        option.innerHTML = `${classroom.name} - ${classroom.building}`;
        if(i==0){
            populateClassroomDetails(option.dataset);
        }
        select.appendChild(option);
    });
}

function populateDays(){
    const days =  ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη','Παρασκευή', 'Σάββατο'];
    const select = document.getElementById('day');
    days.forEach((day, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.innerHTML = day;
        select.appendChild(option);
    })
}

function populateHours(){
    const hours = [];
    for(let i=6; i<=22; i++){
        if(i<10){
            hours.push(`0${i}:00`);
            continue;
        }
        hours.push(`${i}:00`);
    }
    const select = document.getElementById('hour');
    hours.forEach((hour, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.innerHTML = hour;
        select.appendChild(option);
    })  
}