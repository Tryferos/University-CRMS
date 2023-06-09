window.addEventListener('load', async(ev) => {
    fetchFromServer('admin/fetch-users/1').then(async(data) => {
        await populateUsersTable(data);
    });
    fetchFromServer('admin/fetch-users/0').then(async(data) => {
        await populateApplicationsTable(data);
    });
    const department = document.getElementById('department');
    department.innerText = (await fetchFromServer('fetch-department'))[0].department;
});

async function populateUsersTable(users){
    const table = document.getElementById('users-table');
    table.innerHTML = '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <th>Email</th>
        <th>Όνομα</th>
        <th>Επίθετο</th>
        <th>Τμήμα</th>
        <th>Διδάσκων</th>
        <th>Διαχειριστής χρηστών</th>
        <th>Διαχειριστής Κρατήσεων</th>
        <th>Ρόλος Διδάσκωντα</th>
        <th>Διαγραφή</th>
        <th>Επεξεργασία</th>
        <th>Εισαγωγή</th>
    `;
    table.appendChild(tr);
    users.forEach((user) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title='${user.email}'>${user.email}</td>
            <td title='${user.first_name}'>${user.first_name}</td>
            <td title='${user.last_name}'>${user.last_name}</td>
            <td title='${user.department}'>${user.department}</td>
            <td>${user.professor==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.user_admin==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.reserve_admin==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.professor==1 ? user.professor_role : '-'}</td>
            <td><button class="btn" onclick="deleteUser(${user.id})">Διαγραφή</button></td>
            <td><button class="btn" onclick="editUser(${user.id})">Επεξεργασία</button></td>
            <td>${msToDate(Date.parse(user.date))}</td>
        `;
        table.appendChild(tr);
    });
    const count = document.getElementById('signed-count');
    count.innerText = users.length;
}
async function populateApplicationsTable(users){
    console.log(users)
    const table = document.getElementById('applications-table');
    table.innerHTML = '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <th>Email</th>
        <th>Όνομα</th>
        <th>Επίθετο</th>
        <th>Τμήμα</th>
        <th>Διδάσκων</th>
        <th>Διαχειριστής χρηστών</th>
        <th>Διαχειριστής Κρατήσεων</th>
        <th>Ρόλος Διδάσκωντα</th>
        <th>Αποδοχή</th>
        <th>Απόρριψη</th>
        <th>Δημιουργία</th>
    `; 
    table.appendChild(tr);
    users.forEach((user) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td title='${user.email}'>${user.email}</td>
        <td title='${user.first_name}'>${user.first_name}</td>
        <td title='${user.last_name}'>${user.last_name}</td>
        <td title='${user.department}'>${user.department}</td>
            <td>${user.professor==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.user_admin==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.reserve_admin==1 ? 'Ναι' : 'Όχι'}</td>
            <td>${user.professor==1 ? user.professor_role : '-'}</td>
            <td><button class="btn" onclick="updateApplication(${user.id}, ${1})">Αποδοχή</button></td>
            <td><button class="btn" onclick="updateApplication(${user.id}, ${0})">Απόρριψη</button></td>
            <td>${msToDate(Date.parse(user.date))}</td>
        `;
        table.appendChild(tr);
    });
    const count = document.getElementById('application-count');
    count.innerText = users.length;
}

function deleteUser(id){
    const confirm = window.confirm('Είσαι σίγουρος πως θέλεις να διαγράψεις τον χρήστη?')
    if(!confirm) return;
    postToServer(`admin/delete-user`, {id: id}).then((data) => {
        if(data.success){
            window.alert('Η αποδοχή ήταν επιτυχής');
            window.location.reload();
            return;
        }
        window.alert('Η αποδοχή απέτυχε');
    });
}

function updateApplication(id, approval){
    const confirm = window.confirm('Είσαι σίγουρος πως θέλεις να απορρίψεις την αίτηση?')
    if(!confirm) return;
    postToServer(`admin/application`, {id: id, approval: approval}).then((data) => {
        if(data.success){
            window.alert('Η αποδοχή ήταν επιτυχής');
            window.location.reload();
            return;
        }
        window.alert('Η αποδοχή απέτυχε');
    }).catch((err) => {
        window.alert('Η αποδοχή απέτυχε');
    });;
}
