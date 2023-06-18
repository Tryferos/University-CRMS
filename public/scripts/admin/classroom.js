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

window.addEventListener('load', async function(){
    populateWeeklyDays();
    populateHourly();
    const id = parseInt(location.href.split('/').pop());
    if(!parseInt(id))return;
    const data = await fetchFromServer(`fetch-classroom/${id}`)
    console.log(data.classroom)
    populateForm(data.classroom)
});

function populateForm(data){
    const name = document.getElementById('name');
    const type = document.getElementById('type');
    const pcCount = document.getElementById('pc-count');
    const address = document.getElementById('address');
    const building = document.getElementById('building');
    const alwaysLocked = document.getElementById('always_locked');
    const projector = document.getElementById('projector');
    const capacity = document.getElementById('capacity');
    capacity.value = data.capacity;
    alwaysLocked.value = data.always_locked;
    projector.value = data.projector;
    name.value = data.name;
    type.value = data.type;
    address.value = data.address;
    building.value = data.building;
    if(data.type=='Διδασκαλία'){
        hidePcCount();
    }else{
        showPcCount();
        pcCount.value = data.pc_count;
    }
    data.hourly_availability.split(',').forEach(hour => {
        const input = document.getElementById(hour);
        input.checked = true;
    });
    data.weekly_availability.split(',').forEach(day => {
        const input = document.getElementById(day);
        input.checked = true;
    });
    document.getElementById('form-values').appendChild(
        createHiddenInput('id', data.id)
        );
}


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