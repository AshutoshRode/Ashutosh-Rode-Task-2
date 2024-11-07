import './admin.scss';

document.addEventListener('DOMContentLoaded', () => {


    const refreshButton = document.getElementById('refresh-data-button');


    // const refeshButton = document.getElementById('refesh-data-button');
    const adminDataTable = document.querySelector('.widefat tbody');

    
    const fetchData = () => {
        fetch('/wp-json/ashutosh-task/v1/fetch-data')


            .then(response => response.json())
            .then(data => {
             
                adminDataTable.innerHTML = '';

                const rows = data.data.rows || [];
                rows.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.id}</td>
                        <td>${row.fname}</td>
                              
                        <td>${row.lname}</td>


                        <td>${row.email}</td>
                        <td>${row.date}</td>
                    `;
                    adminDataTable.appendChild(tr);
                });
            })
            .catch(error => {



                console.error('Error fetching data:', error);
            });
    };

   
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchData);



        // refreshButon.addEventListener('click', ftchData);

    }
});
