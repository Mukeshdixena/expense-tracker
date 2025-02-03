document.addEventListener("DOMContentLoaded", loadExpenses);
document.getElementById("expense-form").addEventListener("submit", addExpense);

async function addExpense(e) {
    e.preventDefault();

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (description && amount) {
        try {
            const response = await axios.post("http://localhost:3000/api/postExpense", { description, amount });
            appendExpenseToList(response.data);
            updateTotal();
            document.getElementById("expense-form").reset();
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    }
}

async function loadExpenses() {
    try {
        const response = await axios.get("http://localhost:3000/api/getExpense");
        response.data.forEach(expense => appendExpenseToList(expense));
        updateTotal();
    } catch (error) {
        console.error("Error loading expenses:", error);
    }
}

function appendExpenseToList(expense) {
    const expenseList = document.getElementById("expense-list");
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.dataset.id = expense.id;
    li.innerHTML = `
        ${expense.description}: ${expense.amount}
        <div>
            <button class="btn btn-sm btn-warning edit-expense">Edit</button>
            <button class="btn btn-sm btn-danger remove-expense">Remove</button>
        </div>
    `;
    expenseList.appendChild(li);

    li.querySelector(".edit-expense").addEventListener("click", () => editExpense(expense));
    li.querySelector(".remove-expense").addEventListener("click", () => removeExpense(expense.id));
}

async function removeExpense(id) {
    try {
        await axios.delete(`http://localhost:3000/api/deleteExpense?id=${id}`);
        document.querySelector(`[data-id='${id}']`).remove();
        updateTotal();
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}

function editExpense(expense) {
    document.getElementById("description").value = expense.description;
    document.getElementById("amount").value = expense.amount;
    removeExpense(expense.id);
}

async function updateTotal() {
    try {
        const response = await axios.get("http://localhost:3000/api/getExpense");
        const total = response.data.reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById("total-amount").textContent = `${total.toFixed(2)}`;
    } catch (error) {
        console.error("Error updating total:", error);
    }
}
