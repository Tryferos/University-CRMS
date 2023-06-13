
window.addEventListener('load', async function(){
    const data = await fetchFromServer('admin/reservations/fetch-classrooms');
    const reservations = await fetchFromServer('fetch-reservations');
    populateReservations(reservations);
    populateClassrooms(data);
});

function populateReservations(data){
    const reservations = document.getElementById('rid');
    for(let i=0; i<data.length; i++){
        const option = document.createElement('option');
        option.value = data[i].id;
        option.innerText = `${data[i].lecture_name}, ${formatDays(data[i].day)} ${formatHour(data[i].hour)}`;
        option.dataset.type = data[i].type;
        option.dataset.semester = data[i].semester;
        option.dataset.lecture_hours = data[i].lecture_hours;
        option.dataset.department = data[i].department;
        option.dataset.lecture_name = data[i].lecture_name;
        option.dataset.classroom_name = data[i].classroom_name;
        option.dataset.hour = data[i].hour;
        option.dataset.day = data[i].day;
        option.dataset.start_date = data[i].start_date;
        option.dataset.end_date = data[i].end_date;
        option.dataset.duration_minutes = data[i].duration_minutes;
        option.dataset.building = data[i].building;
        option.dataset.address = data[i].address;
        if(i==0){
            populateReservationsDetails(option.dataset);
            populateInitialReserationDate(option.dataset)
        }
        reservations.appendChild(option);
    }
};

function populateClassrooms(data){
    const classroom = document.getElementById('cid');
    for(let i=0; i<data.length; i++){
        const option = document.createElement('option');
        option.value = data[i].id;
        option.innerText = `${data[i].name} ${data[i].building}, ${data[i].address}`;
        option.dataset.building = data[i].building;
        option.dataset.address = data[i].address;
        option.dataset.capacity = data[i].capacity;
        option.dataset.type = data[i].type;
        option.dataset.pc_count = data[i].pc_count;
        option.dataset.projector = data[i].projector;
        option.dataset.always_locked = data[i].always_locked;
        option.dataset.weekly_availability = data[i].weekly_availability;
        option.dataset.hourly_availability = data[i].hourly_availability;
        option.dataset.name = data[i].name;
        if(i==0){
            populateClassroomDetails(option.dataset);
        }
        classroom.appendChild(option);
    }
}

function handleReservationChange(ev){
    const dataset = ev.target.options[ev.target.selectedIndex].dataset;
    populateReservationsDetails(dataset);
    populateInitialReserationDate(dataset);
}

function populateInitialReserationDate(dataset){
    const select = document.getElementById('initial_reservation_date');
    while(select.firstChild){select.removeChild(select.firstChild);}
    const start_date = parseInt(dataset.start_date);
    const end_date = parseInt(dataset.end_date);
    const d = new Date(start_date);
    const formatted_date = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const day = new Date(formatted_date).getDay();
    let offset;
    if(day > dataset.day){
        offset = 7 - (day - dataset.day);
    }else if(day < dataset.day){
        offset = dataset.day - day;
    }else{
        offset = 0;
    }
    offset *= 86400000;

    for(let i=start_date+offset; i<=end_date; i+=(86400000*7)){
        const option = document.createElement('option');
        option.value = i;
        option.innerText = millisToDate(i);
        if(i < Date.now()){
            option.disabled = true;
        }
        select.appendChild(option);
    }
}

function populateReservationsDetails(dataset){
    document.getElementById('details-r').style.display = 'flex';
    const details = document.getElementById('reservation-details');
    details.innerHTML = `
        <p><b>Όνομα μαθήματος:</b> ${dataset.lecture_name}</p>
        <p><b>Όνομα αίθουσας:</b> ${dataset.classroom_name}</p>
        <p><b>Τύπος:</b> ${dataset.type}</p>
        <p><b>Εξάμηνο:</b> ${dataset.semester}</p>
        <p><b>Ώρες Μαθήματος:</b> ${dataset.lecture_hours}</p>
        <p><b>Ημέρα:</b> ${formatDays(dataset.day)}</p>
        <p><b>Ώρα:</b> ${formatHour(dataset.hour)}</p>
        <p><b>Ημερομηνία Έναρξης:</b> ${millisToDate(parseInt(dataset.start_date))}</p>
        <p><b>Ημερομηνία Λήξης:</b> ${millisToDate(parseInt(dataset.end_date))}</p>
    `;
};

function handleClassroomChange(ev){
    const dataset = ev.target.options[ev.target.selectedIndex].dataset;
    populateClassroomDetails(dataset);
}

function populateClassroomDetails(dataset){
    document.getElementById('details-c').style.display = 'flex';
    const details = document.getElementById('classroom-details');
    populateHourly(dataset.hourly_availability);
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

function populateHourly(data){
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

function handleBack(event){
    event.preventDefault();
    event.stopPropagation();
    window.location.href = '/professor/professor';
}