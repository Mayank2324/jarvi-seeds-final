const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const FILE_PATH = path.join(__dirname, "..", "data", "orders.xlsx");
const SHEET_NAME = "Orders";

const HEADERS = [
  "Unique ID",
  "Farmer Name",
  "Jarvi Red (qty)",
  "Jarvi Red 1 (qty)",
  "Jarvi Red Plus (qty)",
  "Jarvi White Honey (qty)",
  "Mobile Number",
  "Full Address",
  "State",
  "Village",
  "District",
  "PIN Code",
  "Location of Farm",
  "Expecting Delivery Date",
  "Order Date/Time"
];

function orderToRow(order) {
  return [
    order.uniqueId,
    order.farmerName,
    order.varieties.jarviRed || 0,
    order.varieties.jarviRed1 || 0,
    order.varieties.jarviRedPlus || 0,
    order.varieties.jarviWhiteHoney || 0,
    order.mobile,
    order.fullAddress,
    order.state,
    order.village,
    order.district,
    order.pinCode,
    order.farmLocation || "",
    order.deliveryDate,
    new Date(order.createdAt || Date.now()).toLocaleString("en-IN")
  ];
}

// Appends one order as a new row. Creates the workbook/headers if the file
// doesn't exist yet.
function appendOrderToExcel(order) {
  let workbook;
  let worksheet;

  if (fs.existsSync(FILE_PATH)) {
    workbook = XLSX.readFile(FILE_PATH);
    worksheet = workbook.Sheets[SHEET_NAME];
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([HEADERS]);
    XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  }

  const existingRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  existingRows.push(orderToRow(order));

  const newWorksheet = XLSX.utils.aoa_to_sheet(existingRows);
  workbook.Sheets[SHEET_NAME] = newWorksheet;

  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  XLSX.writeFile(workbook, FILE_PATH);
}

module.exports = { appendOrderToExcel, FILE_PATH };
