// Calculate statistics
function calculateStats(data) {
    // Group by date
    const dailySales = {};
    data.forEach(row => {
        const date = row.date;
        if (!dailySales[date]) {
            dailySales[date] = 0;
        }
        dailySales[date] += parseFloat(row.grandtotal);
    });

    // Get unique dates and sort them
    const dates = Object.keys(dailySales).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('-');
        const [dayB, monthB, yearB] = b.split('-');
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    // Daily sales array for chart
    const dailySalesArray = dates.map(date => ({
        date,
        sales: dailySales[date]
    }));

    // Product performance
    const products = {};
    data.forEach(row => {
        const item = row.item;
        const quantity = parseInt(row.quantity);
        const total = parseFloat(row.total);
        
        if (!products[item]) {
            products[item] = { quantity: 0, revenue: 0 };
        }
        
        products[item].quantity += quantity;
        products[item].revenue += total;
    });

    const productPerformance = Object.entries(products).map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    // Calculate total revenue
    const totalRevenue = productPerformance.reduce((sum, product) => sum + product.revenue, 0);
    
    // Add percentage to product performance
    productPerformance.forEach(product => {
        product.percentage = (product.revenue / totalRevenue) * 100;
    });

    return {
        dailySales: dailySalesArray,
        productPerformance
    };
}


// Color palette for charts
const colors = [
    '#5b3e29', '#8c6e5a', '#e6ccb3', '#f9f3ed', 
    '#d4a373', '#ccd5ae', '#e9edc9', '#fefae0', 
    '#b08968', '#dda15e', '#606c38', '#283618'
];

// Initialize Charts
async function load_dashboard() {
    const salesData = await eel.getSales()();
    const stats = calculateStats(salesData);

    // Sales Trend Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: stats.dailySales.map(day => day.date),
            datasets: [{
                label: 'Daily Sales (₹)',
                data: stats.dailySales.map(day => day.sales),
                backgroundColor: 'rgba(91, 62, 41, 0.2)',
                borderColor: '#5b3e29',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#5b3e29',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Sales: ₹${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });

    // Best Selling Products Chart
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    const productsChart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: stats.productPerformance.map(product => product.name),
            datasets: [{
                data: stats.productPerformance.map(product => product.revenue),
                backgroundColor: colors.slice(0, stats.productPerformance.length),
                borderWidth: 1
            }]







        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = context.dataset.data.reduce((a, b) => a + b, 0);
                            const calculatedPercentage = ((value / percentage) * 100).toFixed(1);
                            return `${label}: ₹${value} (${calculatedPercentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // Populate Product Table
    const productTableBody = document.getElementById('productTableBody');
    stats.productPerformance.forEach((product, index) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        const nameContainer = document.createElement('div');
        nameContainer.className = 'product-name';
        
        const colorDot = document.createElement('div');
        colorDot.className = 'product-color';
        colorDot.style.backgroundColor = colors[index % colors.length];
        
        nameContainer.appendChild(colorDot);
        nameContainer.appendChild(document.createTextNode(product.name));
        nameCell.appendChild(nameContainer);
        
        const quantityCell = document.createElement('td');
        quantityCell.textContent = product.quantity;
        
        const revenueCell = document.createElement('td');
        revenueCell.textContent = `₹${product.revenue.toFixed(2)}`;
        
        const percentageCell = document.createElement('td');
        
        const percentageContainer = document.createElement('div');
        percentageContainer.style.display = 'flex';
        percentageContainer.style.alignItems = 'center';
        percentageContainer.style.gap = '10px';
        
        const percentageText = document.createElement('span');
        percentageText.textContent = `${product.percentage.toFixed(1)}%`;
        percentageText.style.width = '50px';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${product.percentage}%`;
        progressFill.style.backgroundColor = colors[index % colors.length];
        
        progressBar.appendChild(progressFill);
        
        percentageContainer.appendChild(percentageText);
        percentageContainer.appendChild(progressBar);
        
        percentageCell.appendChild(percentageContainer);
        
        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(revenueCell);
        row.appendChild(percentageCell);
        
        productTableBody.appendChild(row);
    });

    // Date range filter functionality
    const dateOptions = document.querySelectorAll('.date-option');
    dateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            dateOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update chart based on selected range
            const range = this.getAttribute('data-range');
            updateChartByRange(range);
        });
    });

    function updateChartByRange(range) {
        // In a real application, this would filter data based on the range
        // For demo, we'll just update the chart title
        const chartTitle = document.querySelector('.chart-container .chart-title');
        chartTitle.textContent = `Sales Trend (${range.charAt(0).toUpperCase() + range.slice(1)})`;
        
        // Mock data transformation (in real app, would actually filter data)
        // Here we're just making visual changes to simulate functionality
        if (range === 'weekly') {
            salesChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            salesChart.data.datasets[0].data = [350, 425, 380, 450];
        } else if (range === 'monthly') {
            salesChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr'];
            salesChart.data.datasets[0].data = [1200, 1350, 1450, 1550];
        } else {
            // Reset to daily
            salesChart.data.labels = stats.dailySales.map(day => day.date);
            salesChart.data.datasets[0].data = stats.dailySales.map(day => day.sales);
        }
        
        salesChart.update();
    }

    // Export button functionality
    const exportBtn = document.querySelector('.export-btn');
    exportBtn.addEventListener('click', function() {
        // In a real application, this would generate and download a CSV file
        alert('This would download a CSV file of the product performance data in a real application.');
    });
}

// document.addEventListener('DOMContentLoaded', load_dashboard);