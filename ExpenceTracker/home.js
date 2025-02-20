document.addEventListener("DOMContentLoaded", initApp);

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("orderId");
console.log("Order ID:", orderId);
async function fetchPaymentStatus() {
    if (orderId) {

        const response = await axios.get(`http://localhost:3000/payment/paymentStatus/${orderId}`);
        console.log(response);
        console.log(response.data.data[0].payment_status);
        let status = response.data.data[0].payment_status
        if (status === 'SUCCESS') {
            let isPremiumMember = true;
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/postPremium`,
                { isPremiumMember },
                { headers: { "Authorization": token } }
            );
        }

    }
}
fetchPaymentStatus();



let editMode = false;
let editId = null;

async function initApp() {
    await fetchData();
    await isPremiumMember();
    document.getElementById("myForm").addEventListener("submit", handleSubmit);
    document.getElementById("detailsList").addEventListener("click", handleListActions);
}

async function fetchData() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:3000/api/getExpense", { headers: { "Authorization": token } });
        document.getElementById("detailsList").innerHTML = ""; // Clear existing list
        response.data.forEach(({ id, description, amount, category }) =>
            addToList(id, description, amount, category)
        );
        updateTotalAmount();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
async function isPremiumMember() {

    const token = localStorage.getItem('token');
    const response = await axios.get("http://localhost:3000/api/getUserById", { headers: { "Authorization": token } });
    console.log(response);
    if (response.data.isPremiumMember) {
        updatePremium();
    } else {
        console.log("not premium member")
    }

}
function updatePremium() {

    document.getElementById("membershipDiv").style.display = "none"; // Hide the button div
    document.getElementById("welcomeDiv").style.display = "block";  // Show the welcome message

}
function logoutUser() {
    // Perform logout actions (clear user data, redirect, etc.)
    // alert("You have been logged out.");
    window.location.href = "../Login/signin.html"; // Redirect to login page
}

async function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const form = event.target;
    const description = form.description.value.trim();
    const amount = parseFloat(form.amount.value.trim());
    const category = form.category.value;

    if (!description || isNaN(amount) || amount <= 0 || !category) {
        return alert("Please enter a valid description, amount, and category.");
    }

    try {
        if (editMode) {
            await axios.patch(`http://localhost:3000/api/editExpense/${editId}`,
                { description, amount, category },
                { headers: { "Authorization": token } }
            );
            editMode = false;
            editId = null;
        } else {
            const response = await axios.post("http://localhost:3000/api/postExpense",
                { description, amount, category },
                { headers: { "Authorization": token } }
            );
            addToList(response.data.id, description, amount, category);
        }

        form.reset();
        updateTotalAmount();
    } catch (error) {
        console.error("Error submitting data:", error);
    }
}

function addToList(id, description, amount, category) {
    if (document.querySelector(`li[data-id='${id}']`)) return;

    const li = document.createElement("li");
    li.dataset.id = id;
    li.innerHTML = `
        <span>${description} - ₹${amount} - ${category}</span>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>`;

    document.getElementById("detailsList").appendChild(li);
    updateTotalAmount();
}
function addToLeaderBoad(id, username, isPremiumMember) {

    const li = document.createElement("li");
    li.innerHTML = `
        <span> - ${username} - </span>`;
    if (isPremiumMember) {
        // li.style.backgroundColor = "silver"; // Example: gold background for premium members
        // li.style.fontWeight = "bold";  // Example: bold font for premium members
        li.style.color = "gold"; // Adjust text color for better contrast
    }
    document.getElementById("LeaderBoadList").appendChild(li);
    updateTotalAmount();
}

async function handleListActions(event) {
    const btn = event.target;
    const li = btn.closest("li");
    const id = li?.dataset.id;

    if (!id) return;

    if (btn.classList.contains("delete")) {
        await deleteInfo(id);
        li.remove();
        updateTotalAmount();
    } else if (btn.classList.contains("edit")) {
        editItem(li);
    }
}

async function deleteInfo(id) {
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://localhost:3000/api/deleteExpense/${id}`, { headers: { "Authorization": token } });
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

function editItem(li) {
    const textParts = li.querySelector("span").textContent.split(" - ");
    const form = document.getElementById("myForm");

    form.description.value = textParts[0];
    form.amount.value = textParts[1].replace("₹", ""); // Remove ₹ symbol
    form.category.value = textParts[2];

    editMode = true;
    editId = li.dataset.id;
}

function updateTotalAmount() {
    let total = 0;
    document.querySelectorAll("#detailsList li").forEach(li => {
        const amountText = li.querySelector("span").textContent.split(" - ")[1];
        const amount = parseFloat(amountText.replace("₹", "").trim());
        if (!isNaN(amount)) total += amount;
    });
    document.getElementById("totalAmountHeader").textContent = `Total Amount: ₹${total}`;
}

function paymentPage() {
    window.location.href = '../payment/index.html';
}


async function showLeaderBoad() {
    const response = await axios.get("http://localhost:3000/api/getUser");
    console.log(response)
    response.data.forEach(({ id, username, isPremiumMember }) =>
        addToLeaderBoad(id, username, isPremiumMember)
    );
}