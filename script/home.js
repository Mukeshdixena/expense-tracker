document.addEventListener("DOMContentLoaded", initApp);

let editMode = false;
let editId = null;

async function initApp() {
    await fetchData();
    document.getElementById("myForm").addEventListener("submit", handleSubmit);
    document.getElementById("detailsList").addEventListener("click", handleListActions);
}

async function fetchData() {
    try {
        const response = await axios.get("http://localhost:3000/api/getExpense");
        document.getElementById("detailsList").innerHTML = ""; // Clear existing list
        response.data.forEach(({ id, description, amount, category }) =>
            addToList(id, description, amount, category)
        );
        updateTotalAmount();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const description = form.description.value.trim();
    const amount = parseFloat(form.amount.value.trim());
    const category = form.category.value;

    if (!description || isNaN(amount) || amount <= 0 || !category) {
        return alert("Please enter a valid description, amount, and category.");
    }

    try {
        if (editMode) {
            await axios.put(`http://localhost:3000/api/editExpense/${editId}`, { description, amount, category });
            addToList(editId, description, amount, category);
            editMode = false;
            editId = null;
        } else {
            const response = await axios.post("http://localhost:3000/api/postExpense", { description, amount, category });
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
        <span>${id} - ${description} - ₹${amount} - ${category}</span>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>`;

    document.getElementById("detailsList").appendChild(li);
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
    try {
        await axios.delete(`http://localhost:3000/api/deleteExpense/${id}`);
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

function editItem(li) {
    const [id, description, amount, category] = li.querySelector("span").textContent.split(" - ");
    const form = document.getElementById("myForm");

    form.description.value = description;
    form.amount.value = amount.replace("₹", ""); // Remove ₹ symbol
    form.category.value = category;
    editMode = true;
    editId = id;
    li.remove();
    updateTotalAmount();
}

function updateTotalAmount() {
    let total = 0;
    document.querySelectorAll("#detailsList li").forEach(li => {
        const amountText = li.querySelector("span").textContent.split(" - ")[2];
        const amount = parseFloat(amountText.replace("₹", "").trim());
        if (!isNaN(amount)) total += amount;
    });
    document.getElementById("totalAmountHeader").textContent = `Total Amount: ₹${total}`;
}
