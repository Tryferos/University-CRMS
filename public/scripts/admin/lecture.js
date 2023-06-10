
function handleBack(ev){
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = '/admin/reservations';
}

window.addEventListener('load', async() => {
    const data = await fetchFromServer(
        'admin/reservations/fetch-professors'
    )
    populateProfessors(data)
});

function populateProfessors(data){
    console.log(data)
    const ul = document.querySelector('#professors');
    data.forEach(professor => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'professors';
        checkbox.value = professor.id;
        checkbox.id = professor.id;
        const label = document.createElement('label');
        label.htmlFor = professor.id;
        label.innerText = `${professor.first_name} ${professor.last_name}`;
        li.appendChild(checkbox);
        li.appendChild(label);
        ul.appendChild(li);
    });
}