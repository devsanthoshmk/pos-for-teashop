// Calculate statistics
function calculateStats(data) {
    // Group by date
    let prev_id=0; //to get only the grand tot once for an id since .csv is structured in that way
    const dailySales = {};
    data.forEach(row => {
        const date = row.date;
        if (!dailySales[date]) {
            dailySales[date] = 0;
        }
        if (prev_id !==row.id){
            dailySales[date] += parseFloat(row.grandtotal);
            prev_id=row.id;
        }
    });
    // console.log(dailySales)

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

    // console.log(dailySalesArray)

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
        product.percentage = parseFloat(((product.revenue / totalRevenue) * 100).toFixed(2));
    });
    // console.log(productPerformance)

    return {
        dailySales: dailySalesArray,
        productPerformance
    };
}

// calcWeek helper
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function Zellercongruence(dateStr) {
    let [day, month, year] =dateStr.split("-").map(x => parseInt(x, 10));
    if (month < 3) {
        month += 12;
        year -= 1;
    }
    let c = Math.floor(year / 100);
    year = year % 100;
    let h = (c / 4 - 2 * c + year + year / 4 + 13 * (month + 1) / 5 + day - 1) % 7;
    return parseInt((h + 7) % 7);
}

function addDays(dateStr, n) {
    const [day, month, year] = dateStr.split("-").map(x => parseInt(x, 10));

    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + n);

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formatted = date.toLocaleDateString('en-GB', options); 
    return formatted.replace(/\//g, "-");
}



function calcWeeks(){
    const first_date = stats.dailySales.at(0).date;
    const dayind=Zellercongruence(first_date);
    const satin=7-dayind-1;

    const weekly_sales={};
    let w=1;
    let next_date=addDays(first_date,satin);
    for (data of stats.dailySales){
        const week=`week-${w}`;
        const date=data.date;
        if (!weekly_sales[week]){
            weekly_sales[week]=0;
        }

        if(parseInt(date.split("-").reverse().join(""))<parseInt(next_date.split("-").reverse().join(""))){
            weekly_sales[week] += data.sales;

        } else{
            w+=1
            next_date=addDays(date,7);
            weekly_sales[`week-${w}`] = data.sales;
        }

    }

    return weekly_sales
}

function calcMonth(){
    const months=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
   const monthly={};

   stats.dailySales.forEach(data=>{
    const mon=months[parseInt(data.date.split("-")[1],10)-1];
    if (!monthly[mon]){
        monthly[mon]=0;
    }
    monthly[mon]+=data.sales;
   })
   // console.log(monthly)

   return monthly
}

function updateChartByRange(range) {
        const chartTitle = document.querySelector('.chart-container .chart-title');
        chartTitle.textContent = `Sales Trend (${range.charAt(0).toUpperCase() + range.slice(1)})`;
        
        // Mock data transformation (in real app, would actually filter data)
        // Here we're just making visual changes to simulate functionality
        if (range === 'weekly') {
            const weekly_sales=calcWeeks();
            console.log(weekly_sales)
            salesChart.data.labels = Object.keys(weekly_sales);
            salesChart.data.datasets[0].data = Object.values(weekly_sales);
        } else if (range === 'monthly') {
            monthly_sales=calcMonth()
            console.log(monthly_sales)
            salesChart.data.labels = Object.keys(monthly_sales);
            salesChart.data.datasets[0].data = Object.values(monthly_sales);
        } else {
            // Reset to daily
            salesChart.data.labels = stats.dailySales.map(day => day.date);
            salesChart.data.datasets[0].data = stats.dailySales.map(day => day.sales);
        }
        
        salesChart.update();
    }


function updateStates(){
    // ---------- your raw data ----------
    const dailyData = stats.dailySales;

    const weeklyData = calcWeeks();

    const monthlyData = calcMonth();

    const lastYearTotal = 0; // replace with your actual last-year total

     // ─── helpers ────────────────────────────────────────────────────────
    const sum      = arr => arr.reduce((a, b) => a + b, 0);
    const avg      = arr => arr.length ? sum(arr) / arr.length : 0;
    const pctChange= (cur, prev) => prev === 0 ? 0 : (cur - prev) / prev * 100;
    const fmtINR   = val => new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);

    // ─── 1. DAILY AVERAGE & % vs. previous week ─────────────────────────
    const dailySales   = dailyData.map(d => d.sales);
    const dailyAvg     = avg(dailySales);
    const last7        = dailySales.slice(-7);
    const prev7        = dailySales.slice(-14, -7);
    const prev7Avg     = avg(prev7.length ? prev7 : last7);
    const dailyPct     = pctChange(dailyAvg, prev7Avg);

    // ─── 2. WEEKLY AVERAGE & % vs. previous month-of-weeks ───────────────
    const weekVals     = Object.values(weeklyData);
    const weeklyAvg    = avg(weekVals);
    const prevWeeks    = weekVals.slice(0, -1);
    const prevWeeksAvg = avg(prevWeeks);
    const weeklyPct    = pctChange(weeklyAvg, prevWeeksAvg);

    // ─── 3. MONTHLY AVERAGE & % vs. previous quarter ────────────────────
    const monthVals      = Object.values(monthlyData);
    const monthlyAvg     = avg(monthVals);
    const qVals          = monthVals.slice(Math.max(0, monthVals.length-4), monthVals.length-1);
    const prevQuarterAvg = avg(qVals);
    const monthlyPct     = pctChange(monthlyAvg, prevQuarterAvg);

    // ─── 4. TOTAL SALES & % vs. last year ────────────────────────────────
    const totalSales     = sum(dailySales);
    const totalPct       = pctChange(totalSales, lastYearTotal);

    // ─── inject into DOM ─────────────────────────────────────────────────
    const setStat = (idVal, idPct, value, pct) => {
      document.getElementById(idVal).textContent = fmtINR(value);
      const pctEl = document.getElementById(idPct);
      pctEl.textContent = `${pct.toFixed(1)}% from last ${{
        daily: 'week',
        weekly: 'month',
        monthly: 'quarter',
        total: 'year'
      }[idVal.replace('avg','')]}`;
      // toggle trend arrow
      const trendDiv = pctEl.closest('.stat-trend');
      trendDiv.classList.toggle('trend-up', pct >= 0);
      trendDiv.classList.toggle('trend-down', pct < 0);
    };

    setStat('dailyavg','dailyper',   dailyAvg,   dailyPct);
    setStat('weeklyavg','weeklyper', weeklyAvg,  weeklyPct);
    setStat('monthlyavg','monthlyper',monthlyAvg, monthlyPct);
    setStat('totalavg','totper',     totalSales, totalPct);


}


// Color palette for charts
const colors = [
    '#5b3e29', '#8c6e5a', '#e6ccb3', '#f9f3ed', 
    '#d4a373', '#ccd5ae', '#e9edc9', '#fefae0', 
    '#b08968', '#dda15e', '#606c38', '#283618'
];


let salesData,salesCtx,salesChart,productsCtx,productsChart,stats;


// Initialize Charts
async function load_dashboard() {
    salesData = Object.values(sales);  //reusing sales data from pos.js
    console.log(Object.values(salesData)); 
    stats = calculateStats(salesData);

    // Sales Trend Chart
    salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
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
    productsCtx = document.getElementById('productsChart').getContext('2d');
    productsChart = new Chart(productsCtx, {
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

    

    // Export button functionality
    const exportBtn = document.querySelector('.export-btn');
    exportBtn.addEventListener('click', function() {
        // In a real application, this would generate and download a CSV file
        alert('This would download a CSV file of the product performance data in a real application.');
    });
}

// document.addEventListener('DOMContentLoaded', load_dashboard);