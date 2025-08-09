
let transactions = [];
let nextId = 1;

const elements = {
    form: document.getElementById('transaction-form'),
    transactionsList: document.getElementById('transactions-list'),
    balance: document.getElementById('balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),

    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    type: document.getElementById('type'),
    category: document.getElementById('category')
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('💰 Finance Tracker Initialized!');
    loadTransactions();
    setupEventListeners();
    updateDisplay();
});


function setupEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
}



function handleFormSubmit(e) {
    e.preventDefault();
    const formData = getFormData();

    if (!validateFormData(formData)) {
        alert('Please fill in all fields with valid data!');
        return;
    }
    const transaction = createTransaction(formData);
    transactions.push(transaction);
    updateDisplay();
    saveTransactions();
    clearForm();
    showSuccessMessage(`${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} of $${transaction.amount.toFixed(2)} added successfully!`);
}


function getFormData() {
    return {
        description: elements.description.value.trim(),
        amount: parseFloat(elements.amount.value),
        type: elements.type.value,
        category: elements.category.value
    };
}


function validateFormData(data) {
    return (
        data.description.length > 0 &&
        !isNaN(data.amount) &&
        data.amount > 0 &&
        data.type &&
        data.category
    );
}


function createTransaction(formData) {
    return {
        id: nextId++,
        description: formData.description,
        amount: formData.amount,
        type: formData.type,
        category: formData.category,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),
        timestamp: Date.now()
    };
}


function updateDisplay() {
    updateDashboard();
    displayTransactions();
}

function updateDashboard() {
    const totals = calculateTotals();

    elements.totalIncome.textContent = `$${totals.income.toFixed(2)}`;
    elements.totalExpenses.textContent = `$${totals.expenses.toFixed(2)}`;
    elements.balance.textContent = `$${totals.balance.toFixed(2)}`;

    elements.balance.style.color = totals.balance >= 0 ? '#4CAF50' : '#f44336';
}

function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income,
        expenses,
        balance: income - expenses
    };
}

function displayTransactions() {
    const container = elements.transactionsList;
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-transactions">No transactions yet. Add your first one above! 👆</p>';
        return;
    }
    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    const transactionsHTML = sortedTransactions
        .map(transaction => createTransactionHTML(transaction))
        .join('');

    container.innerHTML = transactionsHTML;
}

function createTransactionHTML(transaction) {
    const categoryEmojis = {
        salary: '💼',
        freelance: '💻',
        food: '🍕',
        transport: '🚗',
        entertainment: '🎬',
        utilities: '💡',
        shopping: '🛍️',
        education: '📚',
        other: '📦'
    };

    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-details">
                <h4>${transaction.description}</h4>
                <div class="transaction-meta">
                    <span>${categoryEmojis[transaction.category] || '📦'} ${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</span>
                    <span>📅 ${transaction.date}</span>
                </div>
            </div>
            <div class="transaction-actions">
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </span>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    transactions = transactions.filter(t => t.id !== id);
    updateDisplay();
    saveTransactions();

    showSuccessMessage('Transaction deleted successfully!');
}


function clearForm() {
    elements.form.reset();
    elements.description.focus();
}

function showSuccessMessage(message) {

    console.log('✅', message);
}

function saveTransactions() {
    try {
        localStorage.setItem('financeTrackerTransactions', JSON.stringify(transactions));
        localStorage.setItem('financeTrackerNextId', nextId.toString());
        console.log('💾 Transactions saved to local storage');
    } catch (error) {
        console.error('Error saving transactions:', error);
    }
}

function loadTransactions() {
    try {
        const savedTransactions = localStorage.getItem('financeTrackerTransactions');
        const savedNextId = localStorage.getItem('financeTrackerNextId');

        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            console.log(`📁 Loaded ${transactions.length} transactions from storage`);
        }

        if (savedNextId) {
            nextId = parseInt(savedNextId);
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactions = [];
        nextId = 1;
    }
}


function exportToCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export!');
        return;
    }

    const headers = 'Date,Description,Category,Type,Amount\n';
    const csvContent = transactions.map(t =>
        `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`
    ).join('\n');

    const csv = headers + csvContent;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}


function getSpendingByCategory() {
    const categoryTotals = {};

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

    return categoryTotals;
}

function addSampleData() {
    const sampleTransactions = [
        { description: 'Salary Payment', amount: 3000, type: 'income', category: 'salary' },
        { description: 'Grocery Shopping', amount: 150, type: 'expense', category: 'food' },
        { description: 'Gas Bill', amount: 80, type: 'expense', category: 'utilities' },
        { description: 'Freelance Project', amount: 500, type: 'income', category: 'freelance' },
        { description: 'Movie Night', amount: 25, type: 'expense', category: 'entertainment' }
    ];

    sampleTransactions.forEach(data => {
        const transaction = createTransaction(data);
        transactions.push(transaction);
    });

    updateDisplay();
    saveTransactions();
    console.log('📊 Sample data added!');
}

window.financeTracker = {
    addSampleData,
    exportToCSV,
    getSpendingByCategory,
    transactions: () => transactions
};