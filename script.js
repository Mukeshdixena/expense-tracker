document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    await fetchData();
    document.getElementById("myForm").addEventListener("submit", handleSubmit);
    document.getElementById("detailsList").addEventListener("click", handleListActions);
}

async function fetchData() {
    try {
        const response = await axios.get("http://localhost:3000/api/getExpense");
        console.log(response);
        response.data.forEach(({ id, description, amount }) => addToList(id, description, amount));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const description = form.description.value.trim();
    const amount = form.amount.value.trim();


    if (!description || !amount) return alert("Please fill in all fields.");

    try {
        const response = await axios.post("http://localhost:3000/api/postExpense", { description, amount });
        addToList(response.data.id, description, amount);
        form.reset();
    } catch (error) {
        console.error("Error posting data:", error);
    }
}

function addToList(id, description, amount) {
    if (document.querySelector(`li[data-id='${id}']`)) return;

    const li = document.createElement("li");
    li.dataset.id = id;
    li.innerHTML = `
        <span>${id} - ${description} - ${amount}</span>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>`;

    document.getElementById("detailsList").appendChild(li);
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
}

async function deleteInfo(id) {
    try {
        await axios.delete(`http://localhost:3000/api/deleteExpense/${id}`);
    } catch (error) {
        console.error("Error deleting item:", error);
    }
}

function editItem(li) {
    const [id, description, amount] = li.querySelector("span").textContent.split(" - ");
    const form = document.getElementById("myForm");

    form.description.value = description;
    form.amount.value = amount;
    li.remove();
}
