
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
            <th>Ημερομηνία αναπλήρωσης</th>
            <th>Ώρα αναπλήρωσης</th>
            <th>Διάρκεια αναπλήρωσης</th>
            <th>Κατάσταση αίτησης</th>
            <th>Επιλογή αίτησης</th>
        </tr>
    `;
    for(let i=0; i<data.length; i++){
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data[i].lecture_name}</td>
            <td>${data[i].code}</td>
            <td>${data[i].classroom_name}</td>
            <td>${data[i].address}</td>
            <td>${data[i].building}</td>
            <td>${msToDate(data[i].creation_date)}</td>
            <td>${millisToDate(data[i].substitution_date)}</td>
            <td>${formatHour(data[i].hour)}</td>
            <td>${minutesToHours(data[i].duration_minutes)} ω. / ${data[i].duration_minutes} λ.</td>
            <td data-status='${data[i].status}'>${data[i].status}</td>
            <td><input onchange="handleCheckChange(event)" id='${data[i].id}' type='checkbox'></td>
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
    const btns = document.querySelectorAll('input[type="button"]');
    btns.forEach(btn => {
        if(ev.target.value==btn.value){
            btn.setAttribute('selected', 'true');
        }
        if(btn.getAttribute('selected')=='true' && ev.target.value!=btn.value){
            btn.setAttribute('selected', 'false');
        }
    });
    handleFilter();
}

function handleFilter(){
    const btns = document.querySelectorAll('input[type="button"]');
    const rows = document.querySelectorAll('tr');
    btns.forEach(btn => {
        if(btn.getAttribute('selected')=='true'){
            rows.forEach((row,i) => {
                if(i==0) return;
                const status = row.children[9].getAttribute('data-status');
                const value = btn.value;
                if(value=='Όλες'){
                    row.style.display = 'table-row';
                }else if(value=='Απαντημένες'){
                    if(status=='Εκκρεμούσα'){
                        row.style.display = 'none';
                    }else{
                        row.style.display = 'table-row';
                    }
                }else{
                    if(status=='Εκκρεμούσα'){
                        row.style.display = 'table-row';
                    }else{
                        row.style.display = 'none';
                    }
                }
            });
        }
    });

}





