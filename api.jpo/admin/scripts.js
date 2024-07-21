document.getElementById('admin-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const loginData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const responseData = await response.json();
        const messageDiv = document.getElementById('msg');

        if (response.ok) {
            messageDiv.innerText = responseData.msg;
            messageDiv.style.color = 'green';
        } else {
            messageDiv.innerText = responseData.msg;
            messageDiv.style.color = red ;
        }
    } catch (error) {
        const messageDiv = document.getElementById('msg');
        messageDiv.innerText = responseData.msg;
        messageDiv.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    function fetchLeaderboard() {
        fetch('/adminscore')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('#leaderboard-table2 tbody');
                tableBody.innerHTML = '';


                data.forEach((user, index) => {
                    const row = document.createElement('tr');
                    const groupNameCell = document.createElement('td');
                    const pointsCell = document.createElement('td');
                    const answerCell = document.createElement('td');
                    const passwordCell = document.createElement('td');

                    groupNameCell.textContent = user.group_name;
                    pointsCell.textContent = user.points;
                    answerCell.textContent = user.answers;
                    passwordCell.textContent = user.password;

                    row.appendChild(groupNameCell);
                    row.appendChild(pointsCell);
                    row.appendChild(answerCell);
                    row.appendChild(passwordCell);
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching leaderboard data:', error);
            });
    }
    fetchLeaderboard();
});
