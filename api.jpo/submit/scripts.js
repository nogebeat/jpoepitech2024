// <!-- A NE PAS TOUCHER -->

document.getElementById('submit-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const loginData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/submit', {
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
        messageDiv.innerText = 'An error occurred. Please try again later. or Contact the Administrator ';
        messageDiv.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    function fetchLeaderboard() {
        fetch('/leaderboard')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('#leaderboard-table tbody');
                tableBody.innerHTML = '';

                data.sort((a, b) => b.points - a.points);

                if (data.length > 0) {
                    const firstPlace = data[0];
                    document.getElementById('first-name').textContent = firstPlace.group_name;
                    document.getElementById('first-score').textContent = firstPlace.points.toLocaleString();
                }

                data.forEach((user, index) => {
                    const row = document.createElement('tr');
                    const rankCell = document.createElement('td');
                    const groupNameCell = document.createElement('td');
                    const pointsCell = document.createElement('td');

                    rankCell.textContent = index + 1;
                    groupNameCell.textContent = user.group_name;
                    pointsCell.textContent = user.points;

                    row.appendChild(rankCell);
                    row.appendChild(groupNameCell);
                    row.appendChild(pointsCell);
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching leaderboard data:', error);
            });
    }

    fetchLeaderboard();
});
// <!-- A NE PAS TOUCHER -->
