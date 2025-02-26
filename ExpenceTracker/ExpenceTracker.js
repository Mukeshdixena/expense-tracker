document.addEventListener("DOMContentLoaded", initApp);

(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    if (orderId) {
        await fetchPaymentStatus(orderId);
    }
})();

async function fetchPaymentStatus(orderId) {
    try {
        const response = await axios.get(`${CONFIG.API_BASE_URL}/payment/paymentStatus/${orderId}`);
        console.log(response);
        let status = response.data.data[0]?.payment_status;

        if (status === 'SUCCESS') {
            const token = localStorage.getItem('token');
            await axios.patch(`${CONFIG.API_BASE_URL}/api/postPremium`, { isPremiumMember: true }, { headers: { "Authorization": token } });
        }
    } catch (error) {
        console.error("Error fetching payment status:", error);
    }
}

let editMode = false;
let editId = null;

async function initApp() {
    await fetchData();
    await fetchDownloadList();
    await isPremiumMember();
    document.getElementById("myForm").addEventListener("submit", handleSubmit);
    document.getElementById("detailsList").addEventListener("click", handleListActions);
}

async function fetchData() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getExpense`, { headers: { "Authorization": token } });
        document.getElementById("detailsList").innerHTML = "";

        response.data.forEach(({ id, description, amount, category }) => addToList(id, description, amount, category));
        updateTotalAmount();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
async function fetchDownloadList() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getExpenseDownload`, { headers: { "Authorization": token } });
        document.getElementById("DownloadList").innerHTML = "";

        response.data.forEach(({ id, fileUrl }) => addToDownloadList(id, fileUrl));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function isPremiumMember() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getUserById`, { headers: { "Authorization": token } });

        if (response.data.isPremiumMember) {
            updatePremium();
        } else {
            console.log("Not a premium member");
        }
    } catch (error) {
        console.error("Error checking premium status:", error);
    }
}

function updatePremium() {
    document.getElementById("membershipDiv").style.display = "none";
    document.getElementById("welcomeDiv").style.display = "block";
}

function logoutUser() {
    window.location.href = "../index.html";
}

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const token = localStorage.getItem('token');

    const description = form.description.value.trim();
    const amount = parseFloat(form.amount.value.trim());
    const category = form.category.value;

    if (!description || isNaN(amount) || amount <= 0 || !category) {
        return alert("Please enter a valid description, amount, and category.");
    }

    try {
        if (editMode) {
            await axios.patch(`${CONFIG.API_BASE_URL}/api/editExpense/${editId}`,
                { description, amount, category },
                { headers: { "Authorization": token } }
            );
            editMode = false;
            editId = null;
            addToList(editId, description, amount, category);
        } else {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/api/postExpense`,
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
}
function addToDownloadList(id, fileUrl) {
    const li = document.createElement("li");
    li.dataset.id = id;

    const fileName = fileUrl.split('/').pop();

    // Create file link
    const fileLink = document.createElement("a");
    fileLink.href = fileUrl;
    fileLink.target = "_blank";
    fileLink.download = fileName;
    fileLink.textContent = fileName + "  ";

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete");
    deleteButton.addEventListener("click", () => deleteDownload(id, li));

    // Append elements
    li.appendChild(fileLink);
    li.appendChild(deleteButton);
    document.getElementById("DownloadList").appendChild(li);
}

// Separate function for handling delete action
async function deleteDownload(id, li) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${CONFIG.API_BASE_URL}/api/deleteExpenseDownload/${id}`, {
            headers: { "Authorization": token }
        });
        li.remove();
    } catch (error) {
        console.error("Error deleting download:", error);
    }
}


async function handleListActions(event) {
    const btn = event.target;
    const li = btn.closest("li");
    const id = li?.dataset.id;

    if (!id) return;

    if (btn.classList.contains("delete")) {
        await deleteInfo(id);
        li.remove();
    } else if (btn.classList.contains("edit")) {
        editItem(li);
    }
    updateTotalAmount();
}

async function deleteInfo(id) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${CONFIG.API_BASE_URL}/api/deleteExpense/${id}`, { headers: { "Authorization": token } });
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

function editItem(li) {
    const textParts = li.querySelector("span").textContent.split(" - ");
    const form = document.getElementById("myForm");

    form.description.value = textParts[0];
    form.amount.value = textParts[1].replace("₹", "");
    form.category.value = textParts[2];

    editMode = true;
    editId = li.dataset.id;
    li.remove();
}

async function updateTotalAmount() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getUserTotalAmount`, { headers: { "Authorization": token } });

        document.getElementById("totalAmountHeader").textContent = `Total Amount: ₹${response.data.totalAmount}`;
    } catch (error) {
        console.error("Error fetching total amount:", error);
    }
}

function paymentPage() {
    window.location.href = '../payment/payment.html';
}

async function showLeaderBoad() {
    document.getElementById("LeaderBoadList").innerHTML = "";
    document.getElementById("showButton").style.display = "none";

    try {
        const leaderboard = await axios.get(`${CONFIG.API_BASE_URL}/api/getLeaderBoad`);
        updateLeaderboardUI(leaderboard.data);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}
async function downloadExpence() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/getExpenseFile`, {
            headers: { "Authorization": token }
        });

        if (response.data && response.data.fileUrl) {
            window.open(response.data.fileUrl, "_blank"); // Open file in a new tab
        } else {
            console.error("File URL not found in response:", response);
        }
        await fetchDownloadList();
    } catch (error) {
        console.error("Error fetching expense file:", error);
    }
}


function updateLeaderboardUI(leaderboard) {
    const leaderboardList = document.getElementById("LeaderBoadList");
    leaderboardList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    leaderboard.forEach(entry => {
        const li = document.createElement("li");
        li.innerHTML = `<span> - ${entry.username} - ${entry.totalAmount}</span>`;

        if (entry.isPremiumMember) {
            li.style.color = "gold";
        }

        fragment.appendChild(li);
    });

    leaderboardList.appendChild(fragment);
}
