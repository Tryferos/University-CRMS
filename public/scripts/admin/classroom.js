function handleTypeChange(ev){
    const value = ev.target.value;
    if(value=='Εργαστήριο' || value!='Διδασκαλία'){
        showPcCount();
        return;
    }
    hidePcCount();
}

const pcCountId = 'pc-count';

function showPcCount(){
    const pcCount = document.getElementById(pcCountId);
    pcCount.style.display = 'flex';
}

function hidePcCount(){
    const pcCount = document.getElementById(pcCountId);
    pcCount.style.display = 'none';
}

window.addEventListener('load', function(){
    populateWeeklyDays();
    populateHourly();
});

function handleBack(ev){
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = '/admin/reservations';
}

function populateHourly(){
    const ul = document.getElementById('hourly_availability');
    for(let i=6; i<23; i++){
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'hourly_availability';
        input.value = i;
        input.id = i;
        const label = document.createElement('label');
        label.htmlFor = i;
        label.innerText = i > 9 ? `${i}:00` : `0${i}:00`;
        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    }
}

function populateWeeklyDays(){
    const ul = document.getElementById('weekly_availability');
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη','Παρασκευή', 'Σάββατο'];
    days.forEach((day, i) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'weekly_availability';
        input.value = i;
        input.id = i;
        const label = document.createElement('label');
        label.htmlFor = i;
        label.innerText = day;
        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    });
}