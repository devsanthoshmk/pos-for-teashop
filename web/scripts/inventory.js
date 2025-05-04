
// Initialize inventory data
const inventoryData = [
    { name: "Tea", availability: "yes", price: 15 },
    { name: "Puffs", availability: 24, price: 20 },
    { name: "Coffee", availability: "yes", price: 20 },
    { name: "Special Tea", availability: "limited", price: 25 },
    { name: "Black Tea", availability: "yes", price: 20 },
    { name: "Milk", availability: "yes", price: 15 },
    { name: "Samosa", availability: 10, price: 20 }
];

// Update date and time
function inventupdateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
}

// Render inventory table
function renderInventory() {
    // Clear existing rows
    inventoryList.innerHTML = '';
    
    // Add rows for each inventory item
    inventoryData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Name cell
        const nameCell = document.createElement('td');
        const nameEditable = document.createElement('div');
        nameEditable.className = 'editable';
        nameEditable.contentEditable = true;
        nameEditable.textContent = item.name;
        nameEditable.dataset.index = index;
        nameEditable.dataset.field = 'name';
        nameEditable.addEventListener('blur', updateInventoryItem);
        nameCell.appendChild(nameEditable);
        
        // Availability cell
        const availabilityCell = document.createElement('td');
        const availabilityEditable = document.createElement('div');
        availabilityEditable.className = 'editable';
        availabilityEditable.contentEditable = true;
        availabilityEditable.textContent = item.availability;
        availabilityEditable.dataset.index = index;
        availabilityEditable.dataset.field = 'availability';
        availabilityEditable.addEventListener('blur', updateInventoryItem);
        availabilityCell.appendChild(availabilityEditable);
        
        // Price cell
        const priceCell = document.createElement('td');
        const priceEditable = document.createElement('div');
        priceEditable.className = 'editable';
        priceEditable.contentEditable = true;
        priceEditable.textContent = item.price;
        priceEditable.dataset.index = index;
        priceEditable.dataset.field = 'price';
        priceEditable.addEventListener('blur', updateInventoryItem);
        priceCell.appendChild(priceEditable);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions-cell';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', deleteInventoryItem);
        
        actionsCell.appendChild(deleteBtn);
        
        // Append cells to row
        row.appendChild(nameCell);
        row.appendChild(availabilityCell);
        row.appendChild(priceCell);
        row.appendChild(actionsCell);
        
        // Append row to table
        inventoryList.appendChild(row);
    });
}

// Update inventory item when edited
function updateInventoryItem(event) {
    const index = parseInt(event.target.dataset.index);
    const field = event.target.dataset.field;
    const value = event.target.textContent.trim();
    
    // Update the data
    inventoryData[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    
    // Log the change
    console.log(`Updated item: ${inventoryData[index].name}, ${field}: ${value}`);
}

// Delete inventory item
function deleteInventoryItem(event) {
    const index = parseInt(event.target.dataset.index);
    
    // Log the deletion
    console.log(`Deleted item: ${inventoryData[index].name}`);
    
    // Remove from array
    inventoryData.splice(index, 1);
    
    // Re-render the table
    renderInventory();
}

// Add new inventory item
function addInventoryItem() {
    // Add new blank item
    inventoryData.push({
        name: "New Item",
        availability: "yes",
        price: 0
    });
    
    // Log the addition
    console.log("Added new row to inventory");
    
    // Re-render the table
    renderInventory();
    
    // Scroll to bottom to see new item
    inventoryList.parentElement.scrollTop = inventoryList.parentElement.scrollHeight;
}


let inventoryList;
let addItemBtn;
let dateTimeElement;


function globals_inventory(){
    console.log(items);
     // DOM elements
    inventoryList = document.getElementById('inventoryList');
    addItemBtn = document.getElementById('addItemBtn');
    dateTimeElement = document.getElementById('date-time');

    // Event listeners
    addItemBtn.addEventListener('click', addInventoryItem);


    // Initialize date/time
    inventupdateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute


    // Initial render
    renderInventory();

}