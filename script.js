document.addEventListener("DOMContentLoaded", loadExpenses);
document.getElementById("expense-form").addEventListener("submit", addExpense);

function addExpense(e) {
    e.preventDefault();

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    if (description && amount) {
        const expense = { id: Date.now(), description, amount };
        expenses.push(expense);
        localStorage.setItem("expenses", JSON.stringify(expenses));
        appendExpenseToList(expense);
        updateTotal();
        document.getElementById("expense-form").reset();
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

    li.querySelector(".edit-expense").addEventListener("click", () => editExpense(expense.id));
    li.querySelector(".remove-expense").addEventListener("click", () => removeExpense(expense.id));
}

function saveExpense(expense) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.forEach(expense => appendExpenseToList(expense));
    updateTotal();
}

function updateTotal() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("total-amount").textContent = `${total.toFixed(2)}`;
}

function removeExpense(id) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    document.querySelector(`[data-id='${id}']`).remove();
    updateTotal();
}

function editExpense(id) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const expense = expenses.find(expense => expense.id === id);

    if (expense) {
        document.getElementById("description").value = expense.description;
        document.getElementById("amount").value = expense.amount;

        removeExpense(id); 
    }
}
