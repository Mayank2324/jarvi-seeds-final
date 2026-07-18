// ==========================================
// Jarvi Seeds Admin Dashboard v2
// ==========================================

let allOrders = [];

const API =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : window.location.origin;

// ------------------------------
// Login Check
// ------------------------------

if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "admin.html";
}

const ADMIN_KEY = localStorage.getItem("adminKey");

// ------------------------------
// Load Orders
// ------------------------------

async function loadOrders() {

    try {

        const monthValue =
            document.getElementById("monthPicker").value;

        let url =
            `${API}/api/admin/orders?key=${ADMIN_KEY}`;

        if (monthValue) {

            const [year, month] = monthValue.split("-");

            url += `&month=${Number(month)}&year=${year}`;

        }

        const response = await fetch(url);

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        allOrders = data.orders;

        updateCards(allOrders);

        renderTable(allOrders);

    }

    catch(err){

        console.log(err);

    }

}
// ------------------------------
// Dashboard Cards
// ------------------------------

function updateCards(orders){

    document.getElementById("totalOrders").innerHTML=orders.length;

    let red=0;
    let red1=0;
    let redPlus=0;
    let white=0;

    orders.forEach(order=>{

        red+=order.varieties.jarviRed;
        red1+=order.varieties.jarviRed1;
        redPlus+=order.varieties.jarviRedPlus;
        white+=order.varieties.jarviWhiteHoney;

    });

    document.getElementById("redTotal").innerHTML=red;

    document.getElementById("red1Total").innerHTML=red1;

    document.getElementById("redPlusTotal").innerHTML=redPlus;

    document.getElementById("whiteTotal").innerHTML=white;

}

// ------------------------------
// Render Table
// ------------------------------

function renderTable(orders){

    const table=document.getElementById("ordersTable");

    table.innerHTML="";

    orders.forEach(order=>{

        let seeds="";

        if(order.varieties.jarviRed>0)
            seeds+=`🌱 Jarvi Red : ${order.varieties.jarviRed}<br>`;

        if(order.varieties.jarviRed1>0)
            seeds+=`🌱 Jarvi Red 1 : ${order.varieties.jarviRed1}<br>`;

        if(order.varieties.jarviRedPlus>0)
            seeds+=`🌱 Jarvi Red Plus : ${order.varieties.jarviRedPlus}<br>`;

        if(order.varieties.jarviWhiteHoney>0)
            seeds+=`🌱 White Honey : ${order.varieties.jarviWhiteHoney}`;

        table.innerHTML+=`

        <tr>

            <td>${order.uniqueId}</td>

            <td>${order.farmerName}</td>

            <td>${order.mobile}</td>

            <td class="seed-list">

                ${seeds}

            </td>

            <td>${order.village}</td>

            <td>${order.deliveryDate}</td>

            <td>

                <button

                class="deleteBtn"

                onclick="deleteOrder('${order._id}')">

                Delete

                </button>

            </td>

        </tr>

        `;

    });

}
// ------------------------------
// Search Orders
// ------------------------------

function searchOrders() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const filtered = allOrders.filter(order => {

        return (

    		(order.uniqueId || "").toLowerCase().includes(keyword) ||

    		(order.farmerName || "").toLowerCase().includes(keyword) ||

 		(order.mobile || "").toLowerCase().includes(keyword) ||

    		(order.village || "").toLowerCase().includes(keyword)

	);

    });

    updateCards(filtered);

    renderTable(filtered);

}

// ------------------------------
// Delete Order
// ------------------------------

async function deleteOrder(id){

    if(!confirm("Delete this order?"))
        return;

    try{

        const response = await fetch(

            `${API}/api/admin/orders/${id}?key=${ADMIN_KEY}`,

            {

                method:"DELETE"

            }

        );

        const data = await response.json();

        alert(data.message);

        loadOrders();

    }

    catch(err){

        console.log(err);

        alert("Unable to delete order.");

    }

}

// ------------------------------
// Download PDF
// ------------------------------

function downloadPDF(){

    const month =
        document.getElementById("monthPicker").value;

    if(month===""){

        window.open(
            `${API}/api/admin/report/pdf`,
            "_blank"
        );

        return;

    }

    const arr = month.split("-");

    window.open(

        `${API}/api/admin/report/pdf?month=${arr[1]}&year=${arr[0]}`,

        "_blank"

    );

}

// ------------------------------
// Download Excel
// ------------------------------

function downloadExcel() {

    const month = document.getElementById("monthPicker").value;

    if (!month) {
        alert("Please select a month.");
        return;
    }

    const [year, m] = month.split("-");

    window.open(

        `${API}/api/admin/export/excel?month=${Number(m)}&year=${year}`,

        "_blank"

    );

}
// ------------------------------
// Logout
// ------------------------------

function logout(){

    localStorage.removeItem("adminLoggedIn");

    localStorage.removeItem("adminKey");

    window.location.href="admin.html";

}

// ------------------------------
// Initialize Dashboard
// ------------------------------
window.onload = () => {

    const today = new Date();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const year = today.getFullYear();

    document.getElementById("monthPicker").value = `${year}-${month}`;

    document
        .getElementById("monthPicker")
        .addEventListener("change", loadOrders);

    loadOrders();

};
