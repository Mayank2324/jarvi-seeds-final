const PDFDocument = require("pdfkit-table");
const Order = require("../models/Order");

exports.downloadPDF = async (req, res) => {
  try {
    const { month, year } = req.query;

    let filter = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      filter.createdAt = {
        $gte: start,
        $lt: end,
      };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=JarviSeedsOrders.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // =============================
    // Header
    // =============================

    doc
      .fontSize(22)
      .fillColor("green")
      .text("JARVI SEEDS & NURSERY", {
        align: "center",
      });

    doc.moveDown(0.3);

    doc
      .fontSize(15)
      .fillColor("black")
      .text("Monthly Order Report", {
        align: "center",
      });

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Generated : ${new Date().toLocaleString()}`);

    if (month && year) {
      doc.text(`Month : ${month}/${year}`);
    } else {
      doc.text("Month : All");
    }

    doc.text(`Total Orders : ${orders.length}`);

    doc.moveDown();

    // =============================
    // Table
    // =============================

    const table = {
      headers: [
  "Order ID",
  "Customer",
  "Mobile",
  "Red",
  "Red1",
  "Red+",
  "White",
  "Full Address",
  "Delivery",
],

      rows: [],
    };
orders.forEach((o) => {

  const address = `${o.fullAddress}
${o.village}, ${o.district}
${o.state} - ${o.pinCode}`;

  table.rows.push([
    o.uniqueId,
    o.farmerName,
    o.mobile,
    o.varieties.jarviRed,
    o.varieties.jarviRed1,
    o.varieties.jarviRedPlus,
    o.varieties.jarviWhiteHoney,
    address,
    o.deliveryDate,
  ]);

});

    await doc.table(table, {
      width: 790,
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: (row, iCol, iRow, rectRow) => {

  doc
    .font("Helvetica")
    .fontSize(8);

},
});

    doc.end();
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Unable to generate PDF",
    });
  }
};
