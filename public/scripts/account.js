
window.addEventListener('load', async () => {
    const id = parseInt(location.href.split('/').pop());
    let self;
    if(id){
        console.log(id)
        self = await fetchFromServer('fetch-self/'+id);
    }else{
        self = await fetchFromServer('fetch-self');
    }
    populateFields(self[0]);
    let error = new URL(window.location.href).searchParams.get('error_code');
    if(!error)return;
    window.alert(error_codes[error])
    location.href = '/account';
});


function populateFields(user){
    document.getElementById('username').innerText = `${user.first_name} ${user.last_name} ${user.professor==1 ? `(${user.professor_role})` : ''}`;
    const email = document.getElementById('lbl-email');
    const firstName = document.getElementById('lbl-first_name');
    const lastName = document.getElementById('lbl-last_name');
    email.innerText = user.email;
    firstName.innerText = user.first_name;
    lastName.innerText = user.last_name;
}


function handleEdit(ev){
    const id = ev.target.getAttribute('data-id');
    ev.target.setAttribute('class', 'hidden');
    const input = document.getElementById(id);
    input.removeAttribute('class', 'hidden');
    document.getElementById('submit-'+id).classList.remove('hidden');
}

function handleSubmitClick(event){
    console.log('gamiese')
    event.preventDefault();
    event.stopPropagation();
    const id = parseInt(location.href.split('/').pop());
    console.log(id)
    const form = event.target.parentElement;
    if(!parseInt(id)){
        if(form.checkValidity()){
            form.submit();
        }
        return;
    }
    if(form.checkValidity()){
        const input = form.querySelector('input[data-type="input"]');
        console.log(`edit-self/${input.id}/${id}`)
        console.log('posting')
        postToServer(`edit-self/${input.id}/${id}`, {[input.id]: input.value}).then(res => {
            console.log(res)
            if(res.success==true){
                location.reload();
                return;
            }
            window.alert('Κάτι πήγε λάθος')
        })
    }
}