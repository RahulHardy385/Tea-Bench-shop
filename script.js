// Global variables
let credits = [];
const salesCategories = {
    milkTea: {
        title: 'Milk Tea',
        items: [
            { id: 'dum-tea-regular', name: 'Dum Tea - Regular', price: 12 },
            { id: 'dum-tea-large', name: 'Dum Tea - Large', price: 15 },
            { id: 'Instant-Coffee', name: 'Instant Coffee', price: 15 },
            { id: 'Filter-Coffee', name: 'Filter Coffee', price: 15 },
            { id: 'Ginger-Tea', name: 'Ginger Tea', price: 15 },
            { id: 'Cardamon-Tea', name: 'Cardamon Tea', price: 15 },
            { id: 'Masala-Tea', name: 'Masala Tea', price: 20 },
            { id: 'Kashmiri-Tea', name: 'Kashmiri Tea', price: 20 },
            { id: 'Paan-Tea', name: 'Paan Tea', price: 20 },
            { id: 'Rose-Tea', name: 'Rose Tea', price: 20 },
            { id: 'Lavendar-Tea', name: 'Lavendar Tea', price: 20 }
        ]
    },
    lemonTea: {
        title: 'Lemon Tea',
        items: [
            { id: 'Lemon-Tea', name: 'Lemon Tea', price: 20 },
            { id: 'Lemon-Masala-Tea', name: 'Lemon Masala Tea', price: 20 },
            { id: 'Lemon-Ginger-Tea', name: 'Lemon Ginger Tea', price: 20 },
            { id: 'Lemon-Mint-Tea', name: 'Lemon Mint Tea', price: 20 },
            { id: 'Lemon-Pepper-Tea', name: 'Lemon Pepper Tea', price: 20 }
        ]
    },
    milkSpecial: {
        title: 'Milk Special',
        items: [
            { id: 'Badam-Milk', name: 'Badam Milk', price: 20 },
            { id: 'Boost', name: 'Boost', price: 20 },
            { id: 'Horlicks', name: 'Horlicks', price: 20 }
        ]
    },
    cooler: {
        title: 'Cooler',
        items: [
            { id: 'Grapes', name: 'Grapes', price: 25 },
            { id: 'Litchi', name: 'Litchi', price: 25 }
        ]
    },
    snacks: {
        title: 'Snacks',
        items: [
            { id: 'Biscuits', name: 'Biscuits', price: 3 },
            { id: 'rs6-snacks', name: '6rs-snacks', price: 6 },
            { id: 'Samosa', name: 'Samosa', price: 15 },
            { id: 'Veg-Puff', name: 'Veg Puff', price: 20 },
            { id: 'Egg-Puff', name: 'Egg Puff', price: 30 }
        ]
    }
};

// Get all sales items in a flat array when needed
const salesItems = Object.values(salesCategories).reduce((acc, category) => {
    return [...acc, ...category.items];
}, []);

const expenseItems = [
    { id: 'expense-milk', name: 'Milk Cost' },
    { id: 'expense-sugar', name: 'Sugar Cost' },
    { id: 'expense-cups', name: 'Cups/Glasses Cost' },
    { id: 'expense-coffee', name: 'Coffee powder' },
    { id: 'expense-samosa', name: 'Samosa' },
    { id: 'expense-puff', name: 'Puffs' },
    { id: 'expense-juice', name: 'Juice' },
    { id: 'expense-gas', name: 'Gas' },
    { id: 'expense-other', name: 'Other expenses' }
];

// Add new global variable for daily sales
let dailySales = {};

// Global variables for tracking daily totals
let dailyTotalsByCategory = {
    milkTea: 0,
    lemonTea: 0,
    milkSpecial: 0,
    cooler: 0,
    snacks: 0
};

let grandTotalForDay = 0;

// Add new global variable for daily expense totals
let dailyExpenseTotals = {};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeSections();
    generateSalesItems();
    generateExpenseItems();
    addEventListeners();
    initializeDailyExpenseTotals();
    loadCreditsFromStorage();
    updateDashboard();

    // Check if we need to reset for a new day
    checkAndResetDaily();
});

// UI Initialization
function initializeSections() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.add('hidden-section'));
    document.getElementById('sales-section').classList.remove('hidden-section');
}

function generateSalesItems() {
    const salesGrid = document.querySelector('#sales-section .item-grid');
    if (!salesGrid) return;
    
    salesGrid.innerHTML = '';
    
    // Create sections for each category
    Object.entries(salesCategories).forEach(([categoryKey, category]) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'sales-category-section';
        
        // Add category title with icon
        const titleDiv = document.createElement('div');
        titleDiv.className = 'category-title';
        const icon = getCategoryIcon(categoryKey);
        titleDiv.innerHTML = `<h2><i class="${icon}"></i>${category.title}</h2>`;
        sectionDiv.appendChild(titleDiv);
        
        // Add items grid for this category
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'category-items-grid';
        
        category.items.forEach(item => {
            const itemElement = createSalesItem(item);
            itemsGrid.appendChild(itemElement);
        });
        
        sectionDiv.appendChild(itemsGrid);
        salesGrid.appendChild(sectionDiv);
    });
}

function generateExpenseItems() {
    const expenseGrid = document.querySelector('#expense-section .item-grid');
    if (!expenseGrid) return;
    
    expenseGrid.innerHTML = '';
    expenseItems.forEach(item => {
        const itemElement = createExpenseItem(item);
        expenseGrid.appendChild(itemElement);
    });
}

function createSalesItem(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.id = item.id;
    div.innerHTML = `
        <h3>${item.name}</h3>
        <div class="controls">
            <button onclick="changeQty('${item.id}', -1)" class="btn-minus">
                <i class="fas fa-minus"></i>
            </button>
            <input type="number" id="qty-${item.id}" value="0" readonly>
            <button onclick="changeQty('${item.id}', 1)" class="btn-plus">
                <i class="fas fa-plus"></i>
            </button>
            <input type="number" id="price-${item.id}" value="${item.price}" class="price-input" 
                   oninput="updateItemTotal('${item.id}'); updateGrandTotal();">
            <span class="total" id="total-${item.id}">₹0</span>
        </div>
    `;
    return div;
}

function createExpenseItem(item) {
    const div = document.createElement('div');
    div.className = 'item expense-item';
    div.id = item.id;
    div.innerHTML = `
        <h3>${item.name}</h3>
        <div class="controls">
            ₹ <input type="number" id="cost-${item.id}" value="0" step="0.01" min="0" oninput="updateTotalExpenses()">
        </div>
    `;
    return div;
}

// Event Listeners
function addEventListeners() {
    // Menu toggle
    const menuButton = document.getElementById('menu-button');
    const mainMenu = document.getElementById('main-menu');
    
    if (menuButton && mainMenu) {
        menuButton.addEventListener('click', () => {
            mainMenu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuButton.contains(e.target) && !mainMenu.contains(e.target)) {
                mainMenu.classList.remove('show');
            }
        });
    }
}

// Show Section
async function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden-section');
        sectionToShow.classList.add('active-section');
    }

    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.classList.remove('show');
    }

    // Update dashboard based on active section
    await updateDashboardForSection(sectionId);
}

// Update Dashboard for Section
async function updateDashboardForSection(sectionId) {
    const dashboardContent = document.querySelector('.dashboard-item');
    if (!dashboardContent) return;

    let dashboardHTML = '';
    
    switch(sectionId) {
        case 'sales-section':
            const salesData = await fetchTodaysSalesData();
            dashboardHTML = `
                <h3>Today's Sales</h3>
                <div class="amount">₹${salesData.totalSales.toFixed(2)}</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
                <div class="category-totals">
                    ${Object.entries(salesCategories).map(([categoryKey, category]) => {
                        if (salesData.categoryTotals[categoryKey] > 0) {
                            const icon = getCategoryIcon(categoryKey);
                            return `
                                <div class="category-total">
                                    <span class="category-name">
                                        <i class="${icon}"></i> ${category.title}
                                    </span>
                                    <span class="category-amount">₹${salesData.categoryTotals[categoryKey].toFixed(2)}</span>
                                </div>`;
                        }
                        return '';
                    }).join('')}
                </div>`;
            break;

        case 'expense-section':
            const expenseData = await fetchTodaysExpenses();
            dashboardHTML = `
                <h3>Today's Expenses</h3>
                <div class="amount">₹${expenseData.totalExpenses.toFixed(2)}</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
                <div class="category-totals">
                    ${expenseItems.map(item => {
                        const cost = expenseData.expenseTotals[item.id] || 0;
                        if (cost > 0) {
                            return `
                                <div class="category-total">
                                    <span class="category-name">${item.name}</span>
                                    <span class="category-amount">₹${cost.toFixed(2)}</span>
                                </div>`;
                        }
                        return '';
                    }).join('')}
                </div>`;
            break;

        case 'credit-section':
            const creditData = await fetchPendingCredits();
            dashboardHTML = `
                <h3>Pending Credits</h3>
                <div class="amount">₹${creditData.totalCredits.toFixed(2)}</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
                <div class="category-totals">
                    ${creditData.creditEntries.map(credit => `
                        <div class="category-total">
                            <span class="category-name">${credit.customerName}</span>
                            <span class="category-amount">₹${credit.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>`;
            break;

        default:
            // Show total pending credits in dashboard by default
            const totalPendingCredit = credits.reduce((sum, credit) => sum + credit.amount, 0);
            dashboardHTML = `
                <h3>Pending Credits</h3>
                <div class="amount">₹${totalPendingCredit.toFixed(2)}</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
                <div class="category-totals">
                    ${credits.map(credit => `
                        <div class="category-total">
                            <span class="category-name">${credit.customer}</span>
                            <span class="category-amount">₹${credit.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>`;
    }
    
    dashboardContent.innerHTML = dashboardHTML;
}

// Change Quantity
function changeQty(itemId, change) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    if (!qtyInput) return;
    
    let qty = parseInt(qtyInput.value) + change;
    qty = Math.max(0, qty);
    qtyInput.value = qty;

    updateItemTotal(itemId);
    updateGrandTotal();
}

// Update Item Total
function updateItemTotal(itemId) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    const priceInput = document.getElementById(`price-${itemId}`);
    const totalSpan = document.getElementById(`total-${itemId}`);

    if (qtyInput && priceInput && totalSpan) {
        const qty = parseInt(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = qty * price;
        totalSpan.innerText = `Total: ₹${total.toFixed(2)}`;
    }
}

// Update Grand Total
function updateGrandTotal() {
    let total = 0;
    document.querySelectorAll('#sales-section .item').forEach(item => {
        if (item.id) {
            const qtyInput = document.getElementById(`qty-${item.id}`);
            const priceInput = document.getElementById(`price-${item.id}`);

            if (qtyInput && priceInput) {
                const qty = parseInt(qtyInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                total += qty * price;
            }
        }
    });

    const grandTotal = document.getElementById('grand-total');
    if (grandTotal) {
        grandTotal.innerText = total.toFixed(2);
    }
}

// Update Total Expenses
function updateTotalExpenses() {
    let total = 0;
    document.querySelectorAll('#expense-section input[type="number"]').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    const totalExpenses = document.getElementById('total-expenses');
    if (totalExpenses) {
        totalExpenses.innerText = total.toFixed(2);
    }
}

// Helper function to get category icons
function getCategoryIcon(categoryKey) {
    const icons = {
        milkTea: 'fas fa-mug-hot',
        lemonTea: 'fas fa-lemon',
        milkSpecial: 'fas fa-glass-milk',
        cooler: 'fas fa-glass-water',
        snacks: 'fas fa-cookie'
    };
    return icons[categoryKey] || 'fas fa-coffee';
}

// // Import Firebase functions and collections
// import { 
//     salesCollection, 
//     expensesCollection, 
//     creditsCollection,
//     addDoc 
// } from './firebase-config.js';
// import { serverTimestamp } from 'firebase/firestore';

// Firebase Data Submission
async function submitData() {
    try {
        // Get all sales data
        const salesData = prepareSalesData();
        
        // Add timestamp and user ID
        const salesEntry = {
            ...salesData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: firebase.auth().currentUser.uid
        };

        // Store in Firebase
        await window.salesCollection.add(salesEntry);

                // Update daily totals
        Object.entries(salesCategories).forEach(([categoryKey, category]) => {
            const categoryTotal = category.items.reduce((total, item) => {
            const qtyInput = document.getElementById(`qty-${item.id}`);
            const priceInput = document.getElementById(`price-${item.id}`);
            const qty = parseInt(qtyInput?.value) || 0;
            const price = parseFloat(priceInput?.value) || 0;
            return total + (qty * price);
            }, 0);
                    
            dailyTotalsByCategory[categoryKey] += categoryTotal;
            });
        
        grandTotalForDay = Object.values(dailyTotalsByCategory).reduce((a, b) => a + b, 0);
        updateDashboardWithTotals();
        // Show success message
        alert('Sales data submitted successfully!');
        
        // Reset the form
        resetAll();
    } catch (error) {
        console.error('Error submitting sales:', error);
        alert('Error submitting sales data. Please try again.');
    }
}

async function submitExpenses() {
    try {
        // Get all expense data
        const expenseData = prepareExpenseData();
        
        // Add timestamp and user ID
        const expenseEntry = {
            ...expenseData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: firebase.auth().currentUser.uid
        };

        // Store in Firebase
        await window.expensesCollection.add(expenseEntry);

        // Show success message
        alert('Expenses submitted successfully!');
        
        // Reset the form
        resetExpenses();
    } catch (error) {
        console.error('Error submitting expenses:', error);
        alert('Error submitting expenses. Please try again.');
    }
}

async function addCreditEntry(event) {
    event.preventDefault();
    
    try {
        const customerName = document.getElementById('credit-customer-select').value;
        const amount = parseFloat(document.getElementById('credit-amount').value);
        const notes = document.getElementById('credit-notes').value;

        if (!customerName || customerName === '-- Select Customer --' || isNaN(amount) || amount <= 0) {
            alert('Please select a customer and enter a valid amount.');
            return;
        }

        // Create credit entry object
        const creditEntry = {
            customerName,
            amount,
            notes,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: firebase.auth().currentUser?.uid || 'anonymous'
        };

        // Store in Firebase
        await window.creditsCollection.add(creditEntry);

        // Reset form
        document.getElementById('credit-form').reset();

        // Refresh the credit list
        await renderCreditList();
        
        // Update the dashboard
        await updateDashboardForSection('credit-section');

        // Show success message
        alert('Credit entry added successfully!');
    } catch (error) {
        console.error('Error adding credit entry:', error);
        alert('Error adding credit entry. Please try again.');
    }
}

// Modify renderCreditList function
async function renderCreditList() {
    const listElement = document.getElementById('credit-list');
    if (!listElement) return;
    
    // Fetch latest credits from Firebase
    const creditData = await fetchPendingCredits();
    
    listElement.innerHTML = '';

    if (creditData.creditEntries.length === 0) {
        listElement.innerHTML = '<li class="credit-list-item">No credits pending.</li>';
        return;
    }

    // Group credits by customer name
    const groupedCredits = {};
    creditData.creditEntries.forEach(credit => {
        if (!groupedCredits[credit.customerName]) {
            groupedCredits[credit.customerName] = {
                total: 0,
                entries: []
            };
        }
        groupedCredits[credit.customerName].total += credit.amount;
        groupedCredits[credit.customerName].entries.push(credit);
    });

    // Render grouped credits
    Object.entries(groupedCredits).forEach(([customerName, data]) => {
        const listItem = document.createElement('li');
        listItem.className = 'credit-list-item';
        
        listItem.innerHTML = `
            <div class="credit-info">
                <strong>${customerName}</strong>
                <span class="amount">₹${data.total.toFixed(2)}</span>
                <div class="credit-entries">
                    ${data.entries.map(credit => `
                        <div class="credit-entry" data-credit-id="${credit.id}">
                            <small>${new Date(credit.timestamp?.toDate()).toLocaleString()}</small>
                            <span class="entry-amount">₹${credit.amount.toFixed(2)}</span>
                            ${credit.notes ? `<p class="notes">${credit.notes}</p>` : ''}
                            <div class="actions">
                                <button class="btn btn-success" onclick="markAsPaid('${credit.id}')">
                                    <i class="fas fa-check"></i> Mark as Paid
                                </button>
                                <button class="btn btn-danger" onclick="deleteCredit('${credit.id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        listElement.appendChild(listItem);
    });

    // Update total in the dashboard card
    const totalCreditElement = document.querySelector('.dashboard-item .amount');
    if (totalCreditElement) {
        totalCreditElement.textContent = `₹${creditData.totalCredits.toFixed(2)}`;
    }
}

// Add new functions for credit management
async function markAsPaid(creditId) {
    try {
        await window.creditsCollection.doc(creditId).update({
            status: 'paid',
            paidDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Refresh the credit list
        await renderCreditList();
        // Update the dashboard
        await updateDashboardForSection('credit-section');
        
        alert('Credit marked as paid successfully!');
    } catch (error) {
        console.error('Error marking credit as paid:', error);
        alert('Error updating credit status. Please try again.');
    }
}

async function deleteCredit(creditId) {
    if (!confirm('Are you sure you want to delete this credit entry?')) {
        return;
    }

    try {
        await window.creditsCollection.doc(creditId).delete();
        
        // Refresh the credit list
        await renderCreditList();
        // Update the dashboard
        await updateDashboardForSection('credit-section');
        
        alert('Credit entry deleted successfully!');
    } catch (error) {
        console.error('Error deleting credit:', error);
        alert('Error deleting credit entry. Please try again.');
    }
}

// New function to update dashboard with accumulated totals
function updateDashboardWithTotals() {
    const dashboardContent = document.querySelector('.dashboard-item');
    if (!dashboardContent) return;

    let dashboardHTML = `
        <h3>Today's Sales</h3>
        <div class="amount">${grandTotalForDay.toFixed(2)}</div>
        <div class="date">${new Date().toLocaleDateString()}</div>
        <div class="category-totals">
    `;
    
    Object.entries(salesCategories).forEach(([categoryKey, category]) => {
        if (dailyTotalsByCategory[categoryKey] > 0) {
            const icon = getCategoryIcon(categoryKey);
            dashboardHTML += `
                <div class="category-total">
                    <span class="category-name">
                        <i class="${icon}"></i> ${category.title}
                    </span>
                    <span class="category-amount">₹${dailyTotalsByCategory[categoryKey].toFixed(2)}</span>
                </div>`;
        }
    });
    
    dashboardHTML += `</div>`;
    dashboardContent.innerHTML = dashboardHTML;
}

// Initialize daily expense totals
function initializeDailyExpenseTotals() {
    expenseItems.forEach(item => {
        dailyExpenseTotals[item.id] = 0;
    });
}

// Modified Reset Daily Totals function
function resetDailyTotals() {
    // Reset sales totals
    dailyTotalsByCategory = {
        milkTea: 0,
        lemonTea: 0,
        milkSpecial: 0,
        cooler: 0,
        snacks: 0
    };
    grandTotalForDay = 0;
    
    // Reset expense totals
    initializeDailyExpenseTotals();
    
    // Update dashboard
    updateDashboardForSection('sales-section');

    // Log the reset (optional)
    console.log('Daily totals reset at:', new Date().toLocaleString());
}

// Add these new functions
function checkAndResetDaily() {
    const lastResetDate = localStorage.getItem('lastResetDate');
    const today = new Date().toLocaleDateString();

    if (lastResetDate !== today) {
        resetDailyTotals();
        localStorage.setItem('lastResetDate', today);
    }

    // Check again at midnight
    scheduleNextReset();
}

function scheduleNextReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow - now;
    setTimeout(() => {
        resetDailyTotals();
        localStorage.setItem('lastResetDate', new Date().toLocaleDateString());
        scheduleNextReset(); // Schedule the next reset
    }, timeUntilMidnight);
}

// Add these new functions for credit storage
function loadCreditsFromStorage() {
    const storedCredits = localStorage.getItem('teaShopCredits');
    if (storedCredits) {
        credits = JSON.parse(storedCredits);
        renderCreditList();
        updateCreditTotal();
    }
}

function saveCreditsToStorage() {
    localStorage.setItem('teaShopCredits', JSON.stringify(credits));
}

// Export Data Function
async function exportData(period) {
    try {
        const startDate = getStartDate(period);
        const endDate = new Date();

        // Fetch data from Firebase
        const [salesData, expensesData, creditsData] = await Promise.all([
            getSalesData(startDate, endDate),
            getExpensesData(startDate, endDate),
            getCreditsData(startDate, endDate)
        ]);

        // Generate CSV content
        const csvContent = generateCSVContent(salesData, expensesData, creditsData, period);
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `tea-shop-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error generating report. Please try again.');
    }
}

// Helper function to get start date based on period
function getStartDate(period) {
    const now = new Date();
    if (period === 'weekly') {
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        return startDate;
    } else if (period === 'monthly') {
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        return startDate;
    }
    return now;
}

// Fetch data from Firebase
async function getSalesData(startDate, endDate) {
    const snapshot = await salesCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}

async function getExpensesData(startDate, endDate) {
    const snapshot = await expensesCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}

async function getCreditsData(startDate, endDate) {
    const snapshot = await creditsCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();
    return snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
}

// Generate CSV Content
function generateCSVContent(salesData, expensesData, creditsData, period) {
    let csv = 'Report Type,Date Range\n';
    const endDate = new Date().toLocaleDateString();
    const startDate = getStartDate(period).toLocaleDateString();
    csv += `${period},${startDate} to ${endDate}\n\n`;

    // Sales Summary
    csv += 'SALES SUMMARY\n';
    csv += 'Date,Category,Items,Total\n';
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            csv += `${new Date(sale.timestamp).toLocaleDateString()},${item.name},${item.quantity},${item.total}\n`;
        });
    });

    // Expenses Summary
    csv += '\nEXPENSES SUMMARY\n';
    csv += 'Date,Category,Amount\n';
    expensesData.forEach(expense => {
        expense.items.forEach(item => {
            csv += `${new Date(expense.timestamp).toLocaleDateString()},${item.name},${item.cost}\n`;
        });
    });

    // Credits Summary
    csv += '\nCREDITS SUMMARY\n';
    csv += 'Date,Customer,Amount,Notes\n';
    creditsData.forEach(credit => {
        csv += `${new Date(credit.timestamp).toLocaleDateString()},${credit.customer},${credit.amount},${credit.notes}\n`;
    });

    // Totals
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const totalCredits = creditsData.reduce((sum, credit) => sum + credit.amount, 0);

    csv += '\nSUMMARY\n';
    csv += `Total Sales,₹${totalSales.toFixed(2)}\n`;
    csv += `Total Expenses,₹${totalExpenses.toFixed(2)}\n`;
    csv += `Total Credits,₹${totalCredits.toFixed(2)}\n`;
    csv += `Net Profit,₹${(totalSales - totalExpenses).toFixed(2)}\n`;

    return csv;
}

// Prepare Sales Data for Submission
function prepareSalesData() {
    const items = [];
    let totalAmount = 0;

    Object.values(salesCategories).forEach(category => {
        category.items.forEach(item => {
            const qtyInput = document.getElementById(`qty-${item.id}`);
            const priceInput = document.getElementById(`price-${item.id}`);
            
            if (qtyInput && priceInput) {
                const quantity = parseInt(qtyInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                
                if (quantity > 0) {
                    const total = quantity * price;
                    items.push({
                        id: item.id,
                        name: item.name,
                        quantity: quantity,
                        price: price,
                        total: total
                    });
                    totalAmount += total;
                }
            }
        });
    });

    return {
        items: items,
        totalAmount: totalAmount,
        date: new Date().toISOString()
    };
}

// Prepare Expense Data for Submission
function prepareExpenseData() {
    const items = [];
    let totalAmount = 0;

    expenseItems.forEach(item => {
        const costInput = document.getElementById(`cost-${item.id}`);
        
        if (costInput) {
            const cost = parseFloat(costInput.value) || 0;
            
            if (cost > 0) {
                items.push({
                    id: item.id,
                    name: item.name,
                    cost: cost
                });
                totalAmount += cost;
            }
        }
    });

    return {
        items: items,
        totalAmount: totalAmount,
        date: new Date().toISOString()
    };
}

// Reset All Sales
function resetAll() {
    // Reset all quantity inputs
    Object.values(salesCategories).forEach(category => {
        category.items.forEach(item => {
            const qtyInput = document.getElementById(`qty-${item.id}`);
            if (qtyInput) {
                qtyInput.value = '0';
            }
        });
    });

    // Reset grand total
    const grandTotal = document.getElementById('grand-total');
    if (grandTotal) {
        grandTotal.innerText = '0.00';
    }

    // Update all item totals
    Object.values(salesCategories).forEach(category => {
        category.items.forEach(item => {
            updateItemTotal(item.id);
        });
    });

    // Update grand total
    updateGrandTotal();
}

// Reset Expenses
function resetExpenses() {
    // Reset all expense inputs
    expenseItems.forEach(item => {
        const costInput = document.getElementById(`cost-${item.id}`);
        if (costInput) {
            costInput.value = '0';
        }
    });

    // Reset total expenses
    const totalExpenses = document.getElementById('total-expenses');
    if (totalExpenses) {
        totalExpenses.innerText = '0.00';
    }

    // Update total expenses
    updateTotalExpenses();
}

// Add these new functions for dashboard updates
async function fetchTodaysSalesData() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const snapshot = await window.salesCollection
            .where('timestamp', '>=', today)
            .get();

        let totalSales = 0;
        const categoryTotals = {
            milkTea: 0,
            lemonTea: 0,
            milkSpecial: 0,
            cooler: 0,
            snacks: 0
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            data.items.forEach(item => {
                totalSales += item.total;
                // Categorize the item
                Object.entries(salesCategories).forEach(([category, categoryData]) => {
                    if (categoryData.items.some(catItem => catItem.id === item.id)) {
                        categoryTotals[category] += item.total;
                    }
                });
            });
        });

        return { totalSales, categoryTotals };
    } catch (error) {
        console.error('Error fetching sales data:', error);
        return { totalSales: 0, categoryTotals: {} };
    }
}

async function fetchTodaysExpenses() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const snapshot = await window.expensesCollection
            .where('timestamp', '>=', today)
            .get();

        let totalExpenses = 0;
        const expenseTotals = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            data.items.forEach(item => {
                totalExpenses += item.cost;
                expenseTotals[item.id] = (expenseTotals[item.id] || 0) + item.cost;
            });
        });

        return { totalExpenses, expenseTotals };
    } catch (error) {
        console.error('Error fetching expense data:', error);
        return { totalExpenses: 0, expenseTotals: {} };
    }
}

async function fetchPendingCredits() {
    try {
        const snapshot = await window.creditsCollection
            .where('status', '==', 'pending')
            .get();

        let totalCredits = 0;
        const creditEntries = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            totalCredits += data.amount;
            creditEntries.push({
                id: doc.id,
                ...data
            });
        });

        return { totalCredits, creditEntries };
    } catch (error) {
        console.error('Error fetching credit data:', error);
        return { totalCredits: 0, creditEntries: [] };
    }
} 