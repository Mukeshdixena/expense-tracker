async function signup() {
    let username = document.getElementById('username').value;
    let currEmail = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    if (!username || !currEmail || !password) {
        alert('All fields are required!');
        return;
    }

    try {
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getUser`);

        const emailExists = response.data.some(({ email }) => email === currEmail);

        if (emailExists) {
            alert('This email already exists. Please sign in.');
            return;
        }

        await axios.post(`${CONFIG.API_BASE_URL}/api/postUser`, { username, email: currEmail, password });
        // alert('Signup successful!');
        window.location.href = '../index.html';

    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred. Please try again later.');
    }
}
