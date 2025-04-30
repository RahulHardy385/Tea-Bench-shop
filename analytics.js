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
const salesCollection = db.collection('sales');
const expensesCollection = db.collection('expenses');
const creditsCollection = db.collection('credits');

// Define sales categories
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

// Global chart instances
let charts = {
    salesTrend: null,
    categoryDistribution: null,
    expenseBreakdown: null,
    dailyPerformance: null
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
        const [salesData, expensesData] = await Promise.all([
            fetchSalesData(startDate, endDate),
            fetchExpensesData(startDate, endDate)
        ]);

        updateCharts(salesData, expensesData);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading analytics data. Please try again.');
    }
}

// Fetch sales data from Firebase
async function fetchSalesData(startDate, endDate) {
    const snapshot = await salesCollection
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
    const snapshot = await expensesCollection
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// Update all charts
function updateCharts(salesData, expensesData) {
    updateSalesTrendChart(salesData);
    updateCategoryDistributionChart(salesData);
    updateExpenseBreakdownChart(expensesData);
    updateDailyPerformanceChart(salesData, expensesData);
}

// Update sales trend chart
function updateSalesTrendChart(salesData) {
    const ctx = document.getElementById('salesTrendChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.salesTrend) {
        charts.salesTrend.destroy();
    }
    
    // Group sales by date
    const salesByDate = groupSalesByDate(salesData);
    
    charts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(salesByDate),
            datasets: [{
                label: 'Daily Sales',
                data: Object.values(salesByDate),
                borderColor: '#3498db',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(52, 152, 219, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `₹${value}`
                    }
                }
            }
        }
    });
}

// Update category distribution chart
function updateCategoryDistributionChart(salesData) {
    const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.categoryDistribution) {
        charts.categoryDistribution.destroy();
    }
    
    // Calculate sales by category
    const categoryTotals = calculateCategoryTotals(salesData);
    
    charts.categoryDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Update expense breakdown chart
function updateExpenseBreakdownChart(expensesData) {
    const ctx = document.getElementById('expenseBreakdownChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.expenseBreakdown) {
        charts.expenseBreakdown.destroy();
    }
    
    // Calculate expenses by category
    const expensesByCategory = calculateExpensesByCategory(expensesData);
    
    charts.expenseBreakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                label: 'Expenses',
                data: Object.values(expensesByCategory),
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `₹${value}`
                    }
                }
            }
        }
    });
}

// Update daily performance chart
function updateDailyPerformanceChart(salesData, expensesData) {
    const ctx = document.getElementById('dailyPerformanceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.dailyPerformance) {
        charts.dailyPerformance.destroy();
    }
    
    // Group data by date
    const salesByDate = groupSalesByDate(salesData);
    const expensesByDate = groupExpensesByDate(expensesData);
    const dates = [...new Set([...Object.keys(salesByDate), ...Object.keys(expensesByDate)])].sort();
    
    charts.dailyPerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Sales',
                    data: dates.map(date => salesByDate[date] || 0),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: 'Expenses',
                    data: dates.map(date => expensesByDate[date] || 0),
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `₹${value}`
                    }
                }
            }
        }
    });
}

// Helper functions
function groupSalesByDate(salesData) {
    return salesData.reduce((acc, sale) => {
        const date = new Date(sale.timestamp.toDate()).toLocaleDateString();
        acc[date] = (acc[date] || 0) + sale.totalAmount;
        return acc;
    }, {});
}

function calculateCategoryTotals(salesData) {
    return salesData.reduce((acc, sale) => {
        sale.items.forEach(item => {
            const category = getCategoryForItem(item.id);
            acc[category] = (acc[category] || 0) + item.total;
        });
        return acc;
    }, {});
}

function calculateExpensesByCategory(expensesData) {
    return expensesData.reduce((acc, expense) => {
        expense.items.forEach(item => {
            acc[item.name] = (acc[item.name] || 0) + item.cost;
        });
        return acc;
    }, {});
}

function groupExpensesByDate(expensesData) {
    return expensesData.reduce((acc, expense) => {
        const date = new Date(expense.timestamp.toDate()).toLocaleDateString();
        acc[date] = (acc[date] || 0) + expense.totalAmount;
        return acc;
    }, {});
}

function getCategoryForItem(itemId) {
    for (const [category, data] of Object.entries(salesCategories)) {
        if (data.items.some(item => item.id === itemId)) {
            return data.title;
        }
    }
    return 'Other';
} 