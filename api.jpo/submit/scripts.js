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
        messageDiv.innerText = responseData.msg;
        messageDiv.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour récupérer les résultats du leaderboard
    function fetchLeaderboard() {
        fetch('/leaderboard')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('#leaderboard-table tbody');
                tableBody.innerHTML = ''; // Vider le tableau avant d'ajouter les nouvelles données

                // Trier les données par points en ordre décroissant
                data.sort((a, b) => b.points - a.points);

                data.forEach((user, index) => {
                    const row = document.createElement('tr');
                    const rankCell = document.createElement('td');
                    const groupNameCell = document.createElement('td');
                    const pointsCell = document.createElement('td');

                    rankCell.textContent = index + 1; // Rang
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

    // Appeler la fonction pour récupérer et afficher les résultats du leaderboard
    fetchLeaderboard();
});
