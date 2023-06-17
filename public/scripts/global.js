const error_codes = {
    500: 'Λάθος κωδικός πρόσβασης ή email',
    502: 'Η αίτηση εγγραφής σας δεν έχει εγκριθεί ακόμα',
    504: 'Υπάρχει είδη κράτηση στο ίδιο χρονικό διάστημα και αίθουσα',
    506: 'Το email χρησιμοποιείται ήδη',
}

async function fetchFromServer(path){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState==4 && this.status==200){
                res(JSON.parse(this.responseText))
            }
        }
        xhttp.open("GET", `http://${location.hostname+":"+location.port}/${path}`, true);
        xhttp.send();
    });
}

async function postToServer(path, data){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState==4 && this.status==200){
                res(JSON.parse(this.responseText))
            }
        }
        xhttp.open("POST", `http://${location.hostname+":"+location.port}/${path}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(data));
    });
}

function minutesToHours(minutes){
    return minutes/60;
}

function formatHour(hour){
    return hour < 10 ? `0${hour}:00` : `${hour}:00`;
}

function formatHourAndMinutes(minutes){
    const hours = Math.floor(minutes/60);
    const minutes2 = minutes%60;
    return `${hours}:${minutes2 < 10 ? `0${minutes2}` : minutes2}`;
}

function millisToDate(millis){
    const date = new Date(millis);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
}

function millisToDateReverse(millis){
    const date = new Date(millis);
    const month = (date.getMonth()+1) <= 10 ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${date.getFullYear()}-${month}-${day}`
}

function msToDate(ms){
    const date = new Date(ms);
    const month = (date.getMonth()+1) <= 10 ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`
}


const days =  ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη','Παρασκευή', 'Σάββατο'];
function formatDays(day){
    return days[day];
}

function millisToDateTimeLocal(millis){
    const date = new Date(millis);
    const month = (date.getMonth()+1) <= 10 ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}`
}

window.addEventListener('load', async () => {
    const dates = document.querySelectorAll('input[type="date"');
    dates.forEach(date => {
        date.setAttribute('min', millisToDateReverse(Date.now()));
    });
});

function handleFilter(id, value2, status1, rowNumber){
    const btns = document.querySelectorAll(`#${id}.btn2`);
    const rows = document.querySelectorAll(`tr#${id}-row`);
    btns.forEach(btn => {
        if(btn.getAttribute('selected')=='true'){
            rows.forEach((row,i) => {
                const status = row.children[rowNumber].getAttribute('data-status');
                const value = btn.value;
                if(value=='Όλες'){
                    row.style.display = 'table-row';
                }else if(value==value2){
                    if(status==status1){
                        row.style.display = 'none';
                    }else{
                        row.style.display = 'table-row';
                    }
                }else{
                    if(status==status1){
                        row.style.display = 'table-row';
                    }else{
                        row.style.display = 'none';
                    }
                }
            });
        }
    });

}

window.addEventListener('load', async () => {
    const rel = document.createElement('link');
    rel.setAttribute('rel', 'icon');
    rel.setAttribute('type', 'image/png');
    rel.setAttribute('href', '../images/aegean-logo.png');
    document.head.appendChild(rel);
    const self = await fetchFromServer('fetch-self');
    let user;
    if(!self.error && self.length!=0){
        user = `${self[0].first_name} ${self[0].last_name} ${self[0].professor==1 ? `(${self[0].professor_role})` : ''}`
    }else{
        user = `Επισκέπτης`
    }
    const nav = document.createElement('nav');
    const items = [];
        fetchFromServer('roles').then(roles => {
            items.push('<li><a href="/">Αρχική</a></li>');
            items.push('<li><a href="/account">Λογαριασμός</a></li>')
            if(roles.professor){
                items.push('<li><a href="/professor/professor">Διδάσκων</a></li>');
            }
            if(roles.reserve_admin){
                items.push('<li><a href="/admin/reservations">Κρατήσεις</a></li>');
            }
            if(roles.user_admin){
                items.push('<li><a href="/admin/users">Χρήστες</a></li>');
            }
            if(items.length==1){
                items.push('<li><a href="/login">Συνδέσου</a></li>');
            }
            else{
                items.push('<li data-aside="true" class="discriminator"></li>');
                items.push('<li><a href="/logout">Αποσύνδεση</a></li>');
            }
            nav.querySelector('.dropdown-navbar').innerHTML = items.join('');
        })
    nav.setAttribute('class', 'navbar-navbar')
    nav.innerHTML = `
        <img src="../images/aegean-logo.png"/>
        <p class="name">${user}</p>
        <div class="menu-navbar">
        <img src="../images/menu.png"/>
            <aside></aside>
            <ul class="dropdown-navbar">
            </ul>
            </div>
            `
    document.body.appendChild(nav);
});
