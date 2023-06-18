window.addEventListener('load', async(ev) => {
    const data = await fetchFromServer('fetch-reservations-all');
    populateReservationsTable(data);
    document.getElementById('reservation-count').innerText = data.length;
    const classrooms = await fetchFromServer('admin/reservations/fetch-classrooms');
    populateClassrooms(classrooms);
    document.getElementById('classroom-count').innerText = classrooms.length;
});

function populateClassrooms(data){
    const table = document.getElementById('classrooms-table');
    table.innerHTML = `
        <tr>
            <th>Όνομα αίθουσας</th>
            <th>Διεύθυνση αίθουσας</th>
            <th>Κτήριο</th>
            <th>Χωρητικότητα</th>
            <th>Προτζέκτορας</th>
            <th>Κλειδωμένη</th>
            <th>Τύπος</th>
        <tr>`;
    for(let i=0; i<data.length; i++){
        const row = document.createElement('tr');
        row.setAttribute('data-id', data[i].id);
        row.setAttribute('id', 'classroom-row')
        row.addEventListener('click', handleClick);
        row.innerHTML = `
            <td data-days='${data[i].weekly_availability}'
            data-hours='${data[i].hourly_availability}'>
            ${data[i].name}</td>
            <td>${data[i].address}</td>
            <td>${data[i].building}</td>
            <td>${data[i].capacity} άτομα</td>
            <td>${data[i].projector==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${data[i].locked==1 ? 'Ναι' : 'Όχι'}</td>
            <td data-status='${data[i].type}'>${data[i].type}</td>
            `;
        table.appendChild(row);
    }

    const weeklyFrom = document.getElementById('weekly-from');
    const weeklyTo = document.getElementById('weekly-to');

    days.forEach((day, i) => {
        const li = document.createElement('option');
        li.setAttribute('value', i);
        li.innerText = day;
        weeklyFrom.appendChild(li);
        weeklyTo.appendChild(li.cloneNode(true));
    })

    const hourlyFrom = document.getElementById('hourly-from');
    const hourlyTo = document.getElementById('hourly-to');

    for(let i=6; i<23; i++){
        const li = document.createElement('option');
        li.setAttribute('value', i);
        li.innerText = `${i<10 ? '0' : ''}${i}:00`;
        hourlyFrom.appendChild(li);
        hourlyTo.appendChild(li.cloneNode(true));
    }

}

function handleCapacityChange(ev){
    const from = document.getElementById('capacity-from');
    const to = document.getElementById('capacity-to');
    from.setAttribute('max', to.value);
    to.setAttribute('min', from.value);
    const rows = document.querySelectorAll('tr#classroom-row');
    rows.forEach((row,i) => {
        const capacity = row.children[3].innerText.split(' ')[0];
        if(parseInt(capacity)<=parseInt(to.value) && parseInt(capacity)>=parseInt(from.value)){
            row.style.display = 'table-row';
        }else{
            row.style.display = 'none';
        }
    });
}

function handleHourlyFrom(ev){
    const val = parseInt(ev.target.value);
    const hourlyTo = document.getElementById('hourly-to');
    if(parseInt(hourlyTo.value)<val){
        hourlyTo.value = val;
    }
    for(let i=0; i<hourlyTo.children.length; i++){
        if((i+6)<val){
            hourlyTo.children[i].disabled = 'true';
        }else{
            hourlyTo.children[i].disabled = '';
        }
    }
    filterHours()
}

function handleHourlyTo(ev){
    filterHours()
}

function filterHours(){
    const hourlyFrom = document.getElementById('hourly-from');
    const hourlyTo = document.getElementById('hourly-to');
    const rows = document.querySelectorAll('tr#classroom-row');
    rows.forEach((row,i) => {
        const values = row.children[0].getAttribute('data-hours').split(',');
        if(parseInt(values[0]) >= parseInt(hourlyFrom.value) && 
            parseInt(values[values.length-1]) <= parseInt(hourlyTo.value)){
            row.style.display = 'table-row';
        }else{
            row.style.display = 'none';
        }
    });
}

function handleWeeklyFrom(ev){
    const val = ev.target.value;
    const weeklyTo = document.getElementById('weekly-to');
    if(weeklyTo.value<val){
        weeklyTo.value = val;
    }
    for(let i=0; i<weeklyTo.children.length; i++){
        if(i<val){
            weeklyTo.children[i].disabled = 'true';
        }else{
            weeklyTo.children[i].disabled = '';
        }
    }
    filterDays()
}
function handleWeeklyTo(ev){
    filterDays()
}

function filterDays(){
    const weeklyFrom = document.getElementById('weekly-from');
    const weeklyTo = document.getElementById('weekly-to');
    const rows = document.querySelectorAll('tr#classroom-row');
    rows.forEach((row,i) => {
        const values = row.children[0].getAttribute('data-days').split(',');
        if(values[0] >= weeklyFrom.value && values[values.length-1] <= weeklyTo.value){
            row.style.display = 'table-row';
        }else{
            row.style.display = 'none';
        }
    });
}

async function populateReservationsTable(data){
    const self = await fetchFromServer(`fetch-self`)
    const table = document.getElementById('reservations-table');
    table.innerHTML = `
        <tr>
            <th>Όνομα μαθήματος</th>
            <th>Όνομα αίθουσας</th>
            <th>Διεύθυνση αίθουσας</th>
            <th>Κτήριο</th>
            <th>Εξάμηνο</th>
            <th>Ημέρα μαθήματος</th>
            <th>Ώρα μαθήματος</th>
            <th>Διάρκεια διάλεξης</th>
            <th>Ώρες μαθήματος</th>
            <th>Τύπος μαθήματος</th>
        <tr>
            `;
    for(let i=0; i<data.length; i++){
        const row = document.createElement('tr');
        if(!self.error && self[0].reserve_admin==1){
            row.addEventListener('click', handleClickReservation);
        }
        row.setAttribute('id', 'reservation-row')
        row.setAttribute('data-id', data[i].lid);
        row.innerHTML = `
            <td data-start_date='${data[i].start_date}' 
            data-end_date='${data[i].end_date}' data-day='${data[i].day}'
            data-hour='${data[i].hour}' data-duration='${data[i].duration_minutes}'>${data[i].lecture_name}</td>
            <td>${data[i].classroom_name}</td>
            <td>${data[i].address}</td>
            <td>${data[i].building}</td>
            <td>${data[i].semester}ο</td>
            <td>${formatDays(data[i].day)}</td>
            <td>${formatHour(data[i].hour)}</td>
            <td>${minutesToHours(data[i].duration_minutes)} ω. / ${data[i].duration_minutes} λ.</td>
            <td>${data[i].lecture_hours} ώρες/Εβδομάδα</td>
            <td data-status='${data[i].type}'>${data[i].type}</td>
            `;
        table.appendChild(row);
    }
            
}
function handleClickReservation(ev){
    const id = ev.currentTarget.getAttribute('data-id');
    location.href = `/admin/reservations/lecture/${id}`;
}
function handleClick(ev){
    const id = ev.currentTarget.getAttribute('data-id');
    location.href = `/classroom/${id}`;

}

function handleChange(ev){
    btns = document.querySelectorAll(`#${ev.target.id}.btn2`);
    btns.forEach(btn => {
        if(ev.target.value==btn.value){
            btn.setAttribute('selected', 'true');
        }
        if(btn.getAttribute('selected')=='true' && ev.target.value!=btn.value){
            btn.setAttribute('selected', 'false');
        }
    });
    if(ev.target.id=='reservation'){
        handleFilter('reservation','Εργαστήρια', 'Θεωρία', 9);
        return;
    }
    if(ev.target.id=='classroom'){
        handleFilter('classroom','Εργαστήριο', 'Διδασκαλία', 6);
    }
}

window.addEventListener('load', async () => {
    const dates = document.querySelectorAll('input[type="datetime-local"]');
    dates.forEach(date => {
        if(date.id=='date-to'){
            date.setAttribute('min', millisToDateTimeLocal(Date.now()));
        }else{
            date.setAttribute('max', millisToDateTimeLocal(Date.now()));
        }
    });
});


function handleDateFrom(ev){
    const newValue = ev.target.valueAsNumber;
    const dateTo = document.getElementById('date-to');
    const maxValue = dateTo.valueAsNumber;
    dateTo.setAttribute('min', millisToDateTimeLocal(newValue));
    filterTable(newValue, maxValue);
}
function handleDateTo(ev){
    const newValue = ev.target.valueAsNumber;
    const dateFrom = document.getElementById('date-from');
    const minValue = dateFrom.valueAsNumber;
    dateFrom.setAttribute('max', millisToDateTimeLocal(newValue));
    filterTable(parseInt(minValue), parseInt(newValue));
}

function filterTable(fromFilter, toFilter){
    const rows = document.querySelectorAll('tr#reservation-row');
    rows.forEach((row,i) => {
        const fromValue = parseInt(row.children[0].getAttribute('data-start_date'));
        const toValue = parseInt(row.children[0].getAttribute('data-end_date'));

        if(fromValue>=fromFilter && toValue<=toFilter){
            row.style.display = 'table-row';
        }else{
            row.style.display = 'none';
        }
    });
}