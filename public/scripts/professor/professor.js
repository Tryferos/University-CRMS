function handleChangeLecture(event){
    
}

window.addEventListener('load', async(ev) => {
    const data = await fetchFromServer('professor/lectures');
    populateTableLectures(data);
    const count = document.getElementById('lecture-count');
    count.innerText = data.length;

    const professor = (await fetchFromServer('fetch-self'))[0];
    document.getElementById('professor-details').innerText = 
    `${professor.first_name} ${professor.last_name} (${professor.professor_role})`;
});

function populateTableLectures(data){
    console.log(data)
    const table = document.getElementById('lectures-table');
    table.innerHTML = `
        <tr>
            <th>Όνομα μαθήματος</th>
            <th>Κωδικός μαθήματος</th>
            <th>Τύπος μαθήματος</th>
            <th>Εξάμηνο</th>
            <th>Ώρες μαθήματος</th>
            <th>Τμήμα</th>
            <th>Επιπλέον καθηγητές</th>
        </tr>
        `;
    for(let i=0; i<data.length; i++){
        const row = document.createElement('tr');
        row.setAttribute('id', 'lecture-row')
        const professors = `${data[i].professors.
            map(prof => `<p title='${prof.first_name} ${prof.last_name} (${prof.professor_role})'>${prof.first_name} ${prof.last_name} (${prof.professor_role})</p>`).join('')}`;
        row.innerHTML = `
            <td title='${data[i].name}'>${data[i].name}</td>
            <td title='${data[i].code}'>${data[i].code}</td>
            <td data-status='${data[i].type}' title='${data[i].type}'>${data[i].type}</td>
            <td title='${data[i].semester}'>${data[i].semester}o</td>
            <td title='${data[i].lecture_hours}'>${data[i].lecture_hours} ώρες</td>
            <td title='${data[i].department}'>${data[i].department}</td>
            <td>${professors}</td>
        `;
        table.appendChild(row);
    }

}
