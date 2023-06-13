
window.addEventListener('load', async(ev) => {
    const data = await fetchFromServer('admin/reservations/fetch-substitutions');
    populateTable(data);
    const count = document.getElementById('application-count');
    count.innerText = data.length;
});

function populateTable(data){
    const table = document.getElementById('substitutions-table');
    table.innerHTML = `
        <tr>
            <th>Όνομα μαθήματος</th>
            <th>Κωδικός μαθήματος</th>
            <th>Όνομα αίθουσας</th>
            <th>Διεύθυνση αίθουσας</th>
            <th>Κτήριο</th>
            <th>Δημιουργία αίτησης</th>
            <th>Ημερομηνία προς αναπλήρωση</th>
            <th>Ημερομηνία αναπλήρωσης</th>
            <th>Ώρα αναπλήρωσης</th>
            <th>Διάρκεια αναπλήρωσης</th>
            <th>Κατάσταση αίτησης</th>
            ${location.pathname=='/admin/reservations' ? '<th>Επιλογή αίτησης</th>' : ''}
        </tr>
    `;
    for(let i=0; i<data.length; i++){
        const row = document.createElement('tr');
        row.setAttribute('id', 'application-row')
        row.innerHTML = `
            <td>${data[i].lecture_name}</td>
            <td>${data[i].code}</td>
            <td>${data[i].classroom_name}</td>
            <td>${data[i].address}</td>
            <td>${data[i].building}</td>
            <td>${msToDate(data[i].creation_date)}</td>
            <td>${millisToDate(data[i].initial_reservation_date)}</td>
            <td>${millisToDate(data[i].substitution_date)}</td>
            <td>${formatHour(data[i].hour)}</td>
            <td>${minutesToHours(data[i].duration_minutes)} ω. / ${data[i].duration_minutes} λ.</td>
            <td data-status='${data[i].status}'>${data[i].status}</td>
            ${location.pathname=='/admin/reservations' ? `<td><input onchange="handleCheckChange(event)" id='${data[i].id}' type="checkbox"></td>` : ''}
        `;
        table.appendChild(row);
    }
}

function handleStatusSubmit(ev){
    ev.stopPropagation();
    ev.preventDefault();
    const select = document.getElementById('new-status');
    const reason = document.getElementById('reason');
    const elements = document.querySelectorAll('input[type="checkbox"]:checked')
    let ids = []
    elements.forEach(el => {
        ids.push(el.id)
    });
    const data = {
        ids: ids,
        status: select.value,
        reason: reason.value
    };
    postToServer('admin/reservations/update-status', data).then(
        res => {
            if(res.success==true){
                alert('Η κατάσταση των αιτήσεων ενημερώθηκε επιτυχώς');
                window.location.reload();
            }else{
                alert('Η κατάσταση των αιτήσεων δεν ενημερώθηκε');
            }
        }
    )
}

function handleStatusChange(ev){
    if(ev.target.value=="Μη Εγκεκριμένη"){
        const div = document.getElementById('reason-wrapper');
        div.style.display = 'flex';
        const reason = document.getElementById('reason');
        reason.removeAttribute('disabled');
        reason.setAttribute('required', 'true');
    }else{
        const div = document.getElementById('reason-wrapper');
        div.style.display = 'none';
        const reason = document.getElementById('reason');
        reason.setAttribute('required', 'false');
        reason.setAttribute('disabled', 'disabled');
    }
}

function handleCheckChange(ev){
    const form = document.getElementById('submit-form');
    const checked = document.querySelectorAll('input[type="checkbox"]:checked');
    if(checked.length>0){
        form.style.display = 'flex';
        return;
    }
    form.style.display = 'none';
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
    if(ev.target.id=='application'){
        handleFilter('application','Απαντημένες', 'Εκκρεμούσα', 10);
        return;
    }
    if(ev.target.id=='lecture'){
        handleFilter('lecture','Εργαστήρια', 'Θεωρία', 2);
    }
}






