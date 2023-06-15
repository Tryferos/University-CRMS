window.addEventListener('load', async(ev) => {
    const data = await fetchFromServer('fetch-classroom/'+window.location.href.split('/').pop());
    populateClassroom(data.classroom);
    populateReservations(data.reservations)
});

function populateClassroom(data){
    const name = document.getElementById('classroom-name');
    name.innerText = data.name;

    const ul = document.getElementById('details');
    const li = document.createElement('li');
    li.innerHTML= `<img src='../images/people.png'></img><p>${data.capacity}</p>`
    ul.appendChild(li);
    const li2 = document.createElement('li');
    li2.innerHTML= `<img src='../images/location.png'></img><p>${data.address}</p>`
    ul.appendChild(li2);
    const li3 = document.createElement('li');
    li3.innerHTML= `<img src='../images/computer.png'></img><p>${data.pc_count}</p>`
    data.pc_count !== null && ul.appendChild(li3);
    const li4 = document.createElement('li');
    li4.innerHTML= `<img src='../images/building.png'></img><p>${data.building}</p>`
    ul.appendChild(li4);
    const li5 = document.createElement('li');
    li5.innerHTML= `<p>${data.type}</p>`
    ul.appendChild(li5);
    const li6 = document.createElement('li');
    li6.innerHTML= `<p>Προτζέκτορας</p>`+(data.projector===1 ? svgYes() : svgNo());
    ul.appendChild(li6);
    const li7 = document.createElement('li');
    li7.innerHTML= `<p>Κλειδώνει πάντα</p>`+(data.always_locked===1 ? svgYes() : svgNo());
    ul.appendChild(li7);

    populateSchedule(data);
}

function svgYes(){
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', '#139e41');
    svg.innerHTML = '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>'
    return svg.outerHTML;
}

function svgNo(){
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', '#d63031');
    svg.innerHTML = '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>'
    return svg.outerHTML;
}

function populateSchedule(data){
    const schedule = document.getElementById('schedule');
    data.weekly_availability.split(',').forEach(day => {
        const li = document.createElement('li');
        li.innerHTML = `<img src='../images/date.png'/><p>${formatDays(day)}</p>`;
        schedule.appendChild(li);
    })
    data.hourly_availability.split(',').forEach(hour => {
        const li = document.createElement('li');
        li.innerHTML = `<img src='../images/clock.png'/><p>${formatHour(hour)}</p>`;
        schedule.appendChild(li);
    });
}

function populateReservations(data){
    const count = document.getElementById('reservations-count');
    count.innerText = `${Math.min(4,data.length)}/${data.length}`;

    data = data.map(reservation => {
        const start_date = parseInt(reservation.start_date);
        const end_date = parseInt(reservation.end_date);
        const d = new Date(start_date);
        const formatted_date = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        const day = new Date(formatted_date).getDay();
        let offset;
        if(day > reservation.day){
            offset = 7 - (day - reservation.day);
        }else if(day < reservation.day){
            offset = reservation.day - day;
        }else{
            offset = 0;
        }
        offset *= 86400000;

        const lectures = [];
        let filledNextLecture = false;
        const nextLecture = {};
    
        for(let i=start_date+offset; i<=end_date; i+=(86400000*7)){
            const lecture = {ms: i, date: millisToDate(i), passed: i < Date.now()};
            if(!filledNextLecture){
                if(i > Date.now()){
                    nextLecture.ms = i;
                    nextLecture.date = millisToDate(i);
                    filledNextLecture = true;
                }
            }
            lectures.push(lecture);
        }
        return {...reservation, lectures: lectures, nextLecture: nextLecture}
    })


    const ul = document.getElementById('reservations-list');
    data.sort((a,b) => a.nextLecture.ms-b.nextLecture.ms).slice(0,4).forEach(reservation => {
        const li = document.createElement('li');
        li.innerHTML = `
        <div>
            <div class='header'><p id='name'><img src='../images/course.png'/>${reservation.name}</p><p id='code'>κωδικός: ${reservation.code}</p></div>
            <div class='bottom'>
                <div>
                    <p><img src='../images/semester.png'/>${reservation.semester}ο εξάμηνο // ${reservation.type}</p>
                    <p><img src='../images/clock.png'/>${formatDays(reservation.day)} - ${reservation.nextLecture.date} @ ${formatHour(reservation.hour)}-${formatHourAndMinutes((reservation.hour*60)+reservation.duration_minutes)}
                    </p>
                </div>
                <p>${millisToDate(reservation.start_date)} - ${millisToDate(reservation.end_date)}<img src='../images/date.png'/></p> 
            </div>   
        </div>
        `;
        ul.appendChild(li);
    });

}

function handleEdit(event){

}

function handleDelete(event){
    const confirm = window.confirm('Είσαι σίγουρος πως θέλεις να διαγράψεις την αίθουσα;');
    if(!confirm) return;
}