function handleBack(ev){
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = '/admin/reservations';
}

window.addEventListener('load', (ev) => {
    let error = new URL(window.location.href).searchParams.get('error_code');
    if(!error) return;
    document.querySelectorAll("#basic-lbl").forEach((el) => {
        el.innerHTML = el.innerHTML +=` <span id='error-msg'>${error_codes[error].replaceAll('_', ' ')}</span>`;
    });
}
);

window.addEventListener('load', async function(){
    populateDays();
    populateHours();
    const classrooms = await fetchFromServer('admin/reservations/fetch-classrooms');
    const lectures = await fetchFromServer('admin/reservations/fetch-lectures');
    const id = parseInt(location.href.split('/').pop());
    populateClassrooms(classrooms);
    populateLectures(lectures);
    if(parseInt(id)){
        populateForm((await fetchFromServer(`fetch-reservation/${id}`))[0]);
    }
});

function populateForm(data){
    console.log(data)
    const lid = document.getElementById('lid');
    const cid = document.getElementById('cid');
    const day = document.getElementById('day');
    const hour = document.getElementById('hour');
    const duration = document.getElementById('duration_minutes');
    const start_date = document.getElementById('start_date');
    const end_date = document.getElementById('end_date');
    lid.value = data.lid;
    cid.value = data.cid;
    const item = cid.querySelector(`option[value="${data.cid}"]`)
    populateClassroomDetails(item.dataset);
    day.value = data.day;
    hour.value = data.hour;
    duration.value = data.duration_minutes;
    start_date.value = millisToDateReverse(data.start_date);
    end_date.value = millisToDateReverse(data.end_date);
    document.getElementById('form-values').appendChild(createHiddenInput('id', data.id));
}

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
    populateHours(dataset.hourly_availability);
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
        ${dataset.hourly_availability.split(',').map(hour => formatHour(hour)).join(',')}</p>` : ''}
    `;
}

function populateLectures(lectures){
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

function populateHours(data){
    const hour = document.getElementById('hour');
    while(hour.firstChild){hour.removeChild(hour.firstChild);}
    if(data==null || data=="null") return;
    const hours = data.split(',')
    for(let i=0; i<hours.length; i++){
        const option = document.createElement('option');
        option.value = hours[i];
        option.innerText = hours[i] > 9 ? `${hours[i]}:00` : `0${hours[i]}:00`;
        hour.appendChild(option);
    }
}