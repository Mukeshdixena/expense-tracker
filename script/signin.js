async function signin() {
    let currEmail = document.getElementById('email').value;
    let currPassword = document.getElementById('password').value;

    if (!currEmail || !currPassword) {
        alert('Invalid input');
        return;
    }

    const response = await axios.post("http://localhost:3000/api/signin", {
        email: currEmail,
        password: currPassword
    });
    alert(response.data.message);

    if (response.data.success) {
        window.location.href = 'home.html';
    }
}
