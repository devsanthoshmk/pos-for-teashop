//checking wheather is string is number or not
function isNumber(str) {
    return !isNaN(str) && str.trim() !== '';
  }

//showing availability dynamically using js
function availability(ele){
  const avail=ele.querySelector('h3 span');
  avail.innerHTML=isNumber(items[ele.dataset.itemid-1].availability) ? `(${items[ele.dataset.itemid-1].availability})` : "";
  // console.log(isNumber(items[ele.dataset.itemid-1].availability),items[ele.dataset.itemid-1].availability);
}

// for adding to sales
function getDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return [`${day}-${month}-${year}`,`${hours}:${minutes}`];
}




function addItem(ele){
  const itemid=ele.dataset.itemid
  const billit= document.getElementById('billing')
  const item=items[itemid-1];
  qty[itemid] = (qty[itemid] || 0)+1;

  const itemtot=qty[itemid]*item.price

  const data=`<tr id="blling-${itemid}">
                  <td>${item.name}</td>
                  <td>${qty[itemid]}</td>
                  <td>${item.price}</td>
                  <td>${itemtot}</td>
                  <td class="print-hide"><button class="delete-btn" data-id="blling-2" data-itemid="${itemid}" onclick="removeItem(this)">×</button></td>
              </tr>`;
  tot+=itemtot;

  if (isFirst) {
    billit.innerHTML=data
    isFirst=false;
  }else{
    if(qty[itemid]>1){
    document.getElementById(`blling-${itemid}`).remove();
    }
    billit.innerHTML+=data;
  }

  // reducing the availability of an item which can be...
  if (item["availability"]!=="yes" && item["availability"]!=="no"){
    item["availability"]=item["availability"]-1+"";
    if (item["availability"]+0>0){
      availability(ele);
    } else{
      ele.classList.add("menu-item-disabled")
      ele.classList.remove("menu-item")
    }
  }

  // updating total
  taxamt=6.5
  subtotal.textContent=`₹${tot.toFixed(2)}`;
  tax.textContent=`₹${taxamt.toFixed(2)}`;
  total.textContent=`₹${(tot+taxamt).toFixed(2)}`;

  // disabling the item if it is out of stock
  if (item["availability"]===0){
    document.getElementById(`blling-${itemid}`).style.display='none';
  }

  // console.log(getDateTime());
  const [date,time] = getDateTime();
      // subtotal,tax,grandtotal
  let done;
  sale.forEach((sal)=>{
    if (sal.item==item.name){
     sal.quantity+=1;
     sal.total+=itemtot;
     done=true;
    }
  })
  if (!done){
    sale.push({"item":item.name,"quantity":qty[itemid],"price":item.price,"total":itemtot,"subtotal":tot.toFixed(2),"tax":taxamt.toFixed(2),"grandtotal":(tot+taxamt).toFixed(2)});
    // console.log(sale)
  }
  console.log(sale)


}

function removeItem(ele){
  const itemid=ele.dataset.itemid;
  const item=items[itemid-1];
  qty[itemid]-=1;
  const itemtot=qty[itemid]*item.price;

  const data=`<tr id="blling-${itemid}">
                  <td>${item.name}</td>
                  <td>${qty[itemid]}</td>
                  <td>${item.price}</td>
                  <td>${itemtot}</td>
                  <td class="print-hide"><button class="delete-btn" data-id="blling-2" data-itemid="${itemid}" onclick="removeItem(this)">×</button></td>
              </tr>`;

  tot-=item.price;


  subtotal.textContent=`₹${tot.toFixed(2)}`;
  tax.textContent=`₹${taxamt.toFixed(2)}`;
  total.textContent=`₹${(tot+taxamt).toFixed(2)}`;

  let noneed;
  for (let i = sale.length - 1; i >= 0; i--) {
    const sal = sale[i];
    if (sal.item === item.name) {
      sal.quantity -= 1;
      sal.total -= itemtot;
      if (sal.quantity === 0) {
        sale.splice(i, 1); // safely remove item
        noneed=true;
        break
      }
    }
  }
  console.log(sale);
  if(noneed!==true){
    ele.parentElement.parentElement.innerHTML = data;
  } else if (sale.length===0){
    isFirst=true;
    ele.parentElement.parentElement.innerHTML= `<tr>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                  </tr>`;
  }else {
    ele.parentElement.parentElement.remove();
  }
}


// for date and time
function updateDateTime(ele) {
      const now = new Date();

      // Options for date
      const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      // e.g. "01 May 2025"
      const formattedDate = now
        .toLocaleDateString('en-GB', dateOptions)
        .replace(',', '');

      // Options for time
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      // e.g. "12:39 AM"
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

      ele.innerHTML = `<div><span>Date: ${formattedDate}</span><span> | </span><span>Time: ${formattedTime}</span></div>`;

      // Schedule next update right at the top of the next second
      const secLeft = 60 -  now.getSeconds();
      const msleft = secLeft * 1000 - now.getMilliseconds();
      setTimeout(() => updateDateTime(ele), msleft);
    }

//print handling
function printHandle(){
  if (tot > 1) {
        window.print();
        //changing clear confirm overlay to clear after print
          cancelbtn.textContent='Bill Print Failed!';
          clearbtn.textContent='Bill Printed Successfully';
          //show clear confirm overlay
          document.getElementById('clearConfirmModal').style.display = 'flex';

          cancelbtn.addEventListener('click',hideconf);
          
          clearbtn.addEventListener('click', handleSuccess);
      

          
      } else {
        alert('Please add items to PRINT BILL');
      }        
}
  function handleSuccess(){
    console.log(sale)
    const subtotal = sale.at(-1).subtotal
    const tax = sale.at(-1).tax
    const grandtotal = sale.at(-1).total
    sale.forEach((sal)=>{
      sal.id=parseInt(sales.at(-1).id,10)+1
      const [ date, time ] = getDateTime();
      sal.date = date;
      sal.time = time;
      // subtotal,tax,grandtotal
      sal.subtotal=subtotal;
      sal.tax=tax;
      sal.grandtotal=grandtotal;
    });

    // sending items to python to update inventory and sales
    eel.setInventory(items)();
    eel.addSales(sale);
    //hide clear confirm overlay
    confirmClear();
          
    console.log(sales);
  }

// clear confirm function utilities

  //hide clear confirm overlay
  function hideconf(bol){
      document.getElementById('clearConfirmModal').style.display = 'none';
      cancelbtn.removeEventListener('click',hideconf);
      clearbtn.removeEventListener('click',confirmClear);
  }
  //handling clear bill
  function confirmClear(bol){

      document.getElementById('billing').innerHTML=`<tr>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                      <td>-</td>
                                                  </tr>`;
      subtotal.textContent=`₹0.00`;
      tax.textContent=`₹0.00`;
      total.textContent=`₹0.00`;
      qty={};
      isFirst=true;
      tot=0;
      sale=[];
      salesid+=1;
      hideconf();
      
  }

// clear btn function
function clearbill(fromprnt=false){

  //show clear confirm overlay
  document.getElementById('clearConfirmModal').style.display = 'flex';

  cancelbtn.addEventListener('click',hideconf);
  
  clearbtn.addEventListener('click', confirmClear);
  if (fromprnt===true){

  }
}


  // MAIN FUNC CALLED AS ROOT
  let items;
  let sale = [];
  let qty = {};
  let isFirst = true;
  let tot = 0;

  // Elements for summary
  let summary;
  let subtotal;
  let tax;
  let total;

  // Clear confirmation buttons
  let cancelbtn;
  let clearbtn;

  let sales; 
  let salesid;

  let first=true;

  let taxamt;

  async function globals_pos() {
      console.time("avil");

      if (first===true){
        items = await eel.getInventory()();
        sales = await eel.getSales()();
        first=false;
      }
      salesid=sales.at(-1).id;
      console.log(sales.at(-1).id);
      // console.log(items);

      // showing availability
      document.querySelectorAll('.menu-item').forEach((ele) => availability(ele));

      // initialize summary elements
      summary = document.getElementById('bill-summary');
      subtotal = summary.querySelector('#subtotal');
      tax = summary.querySelector('#tax');
      total = summary.querySelector('#total');

      // adding functionality to menu items
      document.querySelectorAll('.menu-item').forEach((ele) => ele.addEventListener('click', () => addItem(ele)));

      // for date and time
      updateDateTime(document.getElementById('date-time'));

      // handling print
      document.getElementById('print').addEventListener('click', printHandle);

      // clear confirm function utilities
      cancelbtn = document.getElementById('cancelClear');
      clearbtn = document.getElementById('confirmClear');
      document.getElementById('clear').addEventListener('click', clearbill);
            console.timeEnd("avil");

  }

// globals_pos(); //test calling this helps in csr