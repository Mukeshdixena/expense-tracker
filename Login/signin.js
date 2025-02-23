async function signin() {
    let currEmail = document.getElementById('email').value;
    let currPassword = document.getElementById('password').value;

    if (!currEmail || !currPassword) {
        alert('Invalid input');
        return;
    }

    const response = await axios.post(`${CONFIG.API_BASE_URL}/api/signin`, {
        email: currEmail,
        password: currPassword
    });
    console.log(response);

    if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        window.location.href = '../ExpenceTracker/ExpenceTracker.html';
    } else {

        alert(response.data.message);
    }
}
