
function handleBack(ev){
    ev.preventDefault();
    ev.stopPropagation();
    window.location.href = '/admin/reservations';
}

window.addEventListener('load', async() => {
    const error = new URL(window.location.href).searchParams.get('error_code');
    if(error){
        window.alert(error_codes[error])
        const id = parseInt(window.location.href.split('/').pop());
        if(parseInt(id)){
            location.href = '/admin/reservations/lecture/'+id;
        }else{
            location.href = '/admin/reservations/lecture';
        }
    }
    const data = await fetchFromServer(
        'admin/reservations/fetch-professors'
    )
    const department = await fetchFromServer(
        'fetch-department'
    )
    populateDepartment(department[0]);
    populateProfessors(data)
    const id = parseInt(location.href.split('/').pop());
    if(!parseInt(id))return;
    const reservation = await fetchFromServer('fetch-lecture/'+id);
    populateForm(reservation);
});

function populateForm(data){
    console.log(data)
    const title = document.getElementById('name');
    title.setAttribute('readonly', true);
    const department = document.getElementById('department');
    department.setAttribute('readonly', true);
    const code = document.getElementById('code');
    code.setAttribute('readonly', true);
    const type = document.getElementById('type');
    type.setAttribute('readonly', true);
    const semester = document.getElementById('semester');
    semester.setAttribute('readonly', true);
    const lecture_hours = document.getElementById('lecture_hours');
    lecture_hours.setAttribute('readonly', true);
    lecture_hours.value = data.lecture_hours;
    semester.value = data.semester;
    type.value = data.type;
    title.value = data.name;
    department.value = data.department;
    code.value = data.code;
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = data.professors.includes(parseInt(input.id));
    });
    document.getElementById('form-values').appendChild(
        createHiddenInput('id', data.id)
        );
}

function populateDepartment(department){
    const select = document.getElementById('department');
    const option = document.createElement('option');
    option.value = department.id;
    option.name = department.id;
    option.innerHTML = department.department;
    select.appendChild(option);
};

function populateProfessors(data){
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