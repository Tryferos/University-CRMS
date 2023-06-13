const professor = document.getElementById('professor');

professor.addEventListener('change', (ev) => {
    console.log(ev.target.checked)
    if(ev.target.checked==true){
        return showRoles();
    }
    hideRoles();
});

function hideRoles(){
    document.getElementById('fields-list').removeChild(document.getElementById('professor-roles'));
}

window.addEventListener('load', (ev) => {
    let error = new URL(window.location.href).searchParams.get('error_code');
    if(!error) return;
    document.querySelectorAll("#basic-lbl-email").forEach((el) => {
        el.innerHTML = el.innerHTML +=` <span id='error-msg'>${error_codes[error].replaceAll('_', ' ')}</span>`;
    });
}
);

function showRoles(){
    const professorRoles = document.createElement('div');
    professorRoles.setAttribute('id', 'professor-roles');
    const label = document.createElement('label');
    label.setAttribute('for', 'professor_role');
    label.setAttribute('id', 'basic-lbl');
    label.innerHTML =  `Είδος Διδάσκοντα<span aria-label="required">*</span>`;
    const select = document.createElement('select');
    select.setAttribute('id', 'professor_role');
    select.setAttribute('class', 'dropdown');
    select.setAttribute('name', 'professor_role');
    select.setAttribute('required', 'true');
    
    const roles = ['ΔΕΠ', 'ΕΔΙΠ', 'ΕΤΕΠ']

    professorRoles.appendChild(label);
    professorRoles.appendChild(select);
    roles.forEach(role => {
        const option = document.createElement('option');
        option.setAttribute('value', role);
        option.innerHTML = role;
        select.appendChild(option);
    })
    document.getElementById('fields-list').appendChild(professorRoles);

}