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

function millisToDate(millis){
    const date = new Date(millis);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
}

function msToDate(ms){
    const date = new Date(ms);
    const month = (date.getMonth()+1) <= 10 ? `0${date.getMonth()+1}` : date.getMonth()+1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${date.getFullYear()}-${month}-${day} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
