document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const loginData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/register', {
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