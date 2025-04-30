// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdAMZh-CdHySouCgk2NW29NQWavUT3v0w",
    authDomain: "tea-bench-shop.firebaseapp.com",
    projectId: "tea-bench-shop",
    storageBucket: "tea-bench-shop.firebasestorage.app",
    messagingSenderId: "621097147787",
    appId: "1:621097147787:web:9f48c18b5244916c08e38e",
    measurementId: "G-NYZYTBSHL3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore collections
const db = firebase.firestore();
window.salesCollection = db.collection('sales');
window.expensesCollection = db.collection('expenses');
window.creditsCollection = db.collection('credits');

// Define sales categories
window.salesCategories = {
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

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
    } else {
        // Initialize date range picker after jQuery is loaded
        $(document).ready(() => {
            initializeDateRangePicker();
            // Set initial date range to last 7 days
            setDateRange('week');
        });
    }
});

// Initialize date range picker
function initializeDateRangePicker() {
    $('#dateRange').daterangepicker({
        startDate: moment().subtract(7, 'days'),
        endDate: moment(),
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, function(start, end) {
        fetchDataForDateRange(start.toDate(), end.toDate());
    });
}

// Set date range based on period
function setDateRange(period) {
    const end = moment();
    let start;

    switch(period) {
        case 'week':
            start = moment().subtract(6, 'days');
            break;
        case 'month':
            start = moment().subtract(29, 'days');
            break;
        case 'year':
            start = moment().subtract(1, 'year');
            break;
    }

    const picker = $('#dateRange').data('daterangepicker');
    if (picker) {
        picker.setStartDate(start);
        picker.setEndDate(end);
        fetchDataForDateRange(start.toDate(), end.toDate());
    }
}

// Fetch data from Firebase for the selected date range
async function fetchDataForDateRange(startDate, endDate) {
    try {
        const [salesData, expensesData, creditsData] = await Promise.all([
            fetchSalesData(startDate, endDate),
            fetchExpensesData(startDate, endDate),
            fetchCreditsData()
        ]);

        updateSummaryCards(salesData, expensesData, creditsData);
        updateTopItemsTable(salesData);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading dashboard data. Please try again.');
    }
}

// Fetch sales data from Firebase
async function fetchSalesData(startDate, endDate) {
    const snapshot = await window.salesCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Fetch expenses data from Firebase
async function fetchExpensesData(startDate, endDate) {
    const snapshot = await window.expensesCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Fetch credits data from Firebase
async function fetchCreditsData() {
    const snapshot = await window.creditsCollection
        .where('status', '==', 'pending')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Update summary cards with fetched data
function updateSummaryCards(salesData, expensesData, creditsData) {
    // Calculate totals
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.totalAmount, 0);
    const totalCredits = creditsData.reduce((sum, credit) => sum + credit.amount, 0);
    const netProfit = totalSales - totalExpenses;

    // Update DOM
    document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('totalCredits').textContent = `₹${totalCredits.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `₹${netProfit.toFixed(2)}`;
    
    // Update trends
    document.getElementById('creditsTrend').textContent = `${creditsData.length} pending payments`;
}

// Update top items table
function updateTopItemsTable(salesData) {
    const items = calculateTopItems(salesData);
    const tbody = document.getElementById('topItemsTable').getElementsByTagName('tbody')[0];
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>₹${item.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Helper functions
function calculateTopItems(salesData) {
    const itemsMap = {};
    
    salesData.forEach(sale => {
        sale.items.forEach(item => {
            if (!itemsMap[item.id]) {
                itemsMap[item.id] = {
                    name: item.name,
                    category: getCategoryForItem(item.id),
                    quantity: 0,
                    revenue: 0
                };
            }
            itemsMap[item.id].quantity += item.quantity;
            itemsMap[item.id].revenue += item.total;
        });
    });
    
    return Object.values(itemsMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
}

function getCategoryForItem(itemId) {
    for (const [category, data] of Object.entries(window.salesCategories)) {
        if (data.items.some(item => item.id === itemId)) {
            return data.title;
        }
    }
    return 'Other';
}

// Export to PDF
async function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Tea Shop Report', 15, 15);
        
        // Add date range
        const picker = $('#dateRange').data('daterangepicker');
        doc.setFontSize(12);
        doc.text(`Period: ${picker.startDate.format('MMMM D, YYYY')} - ${picker.endDate.format('MMMM D, YYYY')}`, 15, 25);
        
        // Add summary section
        doc.setFontSize(16);
        doc.text('Summary', 15, 35);
        
        const summaryData = [
            ['Total Sales', document.getElementById('totalSales').textContent],
            ['Total Expenses', document.getElementById('totalExpenses').textContent],
            ['Total Credits', document.getElementById('totalCredits').textContent],
            ['Net Profit', document.getElementById('netProfit').textContent]
        ];
        
        doc.autoTable({
            startY: 40,
            head: [['Metric', 'Amount']],
            body: summaryData,
            theme: 'grid'
        });
        
        // Add top items section
        doc.setFontSize(16);
        doc.text('Top Selling Items', 15, doc.lastAutoTable.finalY + 15);
        
        const topItemsTable = document.getElementById('topItemsTable');
        const topItemsData = Array.from(topItemsTable.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.cells).map(cell => cell.textContent);
        });
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Item Name', 'Category', 'Quantity Sold', 'Revenue']],
            body: topItemsData,
            theme: 'grid'
        });
        
        // Save the PDF
        doc.save(`tea-shop-report-${moment().format('YYYY-MM-DD')}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Export to CSV
function exportToCSV() {
    try {
        // Prepare summary data
        const summaryData = [
            ['Summary Section'],
            ['Metric', 'Amount'],
            ['Total Sales', document.getElementById('totalSales').textContent],
            ['Total Expenses', document.getElementById('totalExpenses').textContent],
            ['Total Credits', document.getElementById('totalCredits').textContent],
            ['Net Profit', document.getElementById('netProfit').textContent],
            [],  // Empty row for separation
            ['Top Selling Items'],
            ['Item Name', 'Category', 'Quantity Sold', 'Revenue']
        ];
        
        // Add top items data
        const topItemsTable = document.getElementById('topItemsTable');
        const topItemsData = Array.from(topItemsTable.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.cells).map(cell => cell.textContent);
        });
        
        // Combine all data
        const csvData = [...summaryData, ...topItemsData]
            .map(row => row.join(','))
            .join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, `tea-shop-report-${moment().format('YYYY-MM-DD')}.csv`);
        } else {
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `tea-shop-report-${moment().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Error generating CSV:', error);
        alert('Error generating CSV. Please try again.');
    }
} 