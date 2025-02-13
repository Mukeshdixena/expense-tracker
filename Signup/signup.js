async function signup() {
    let username = document.getElementById('username').value;
    let currEmail = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    if (!username || !currEmail || !password) {
        alert('All fields are required!');
        return;
    }

    try {
        const response = await axios.get("http://localhost:3000/api/getUser");

        const emailExists = response.data.some(({ email }) => email === currEmail);

        if (emailExists) {
            alert('This email already exists. Please sign in.');
            return;
        }

        await axios.post("http://localhost:3000/api/postUser", { username, email: currEmail, password });
        alert('Signup successful!');
        window.location.href = '../Login/signin.html';

    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred. Please try again later.');
    }
}
