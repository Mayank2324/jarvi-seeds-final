const ExcelJS = require("exceljs");
const Order = require("../models/Order");

exports.exportExcel = async (req, res) => {

    try {

        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month and Year are required."
            });
        }

        // Block future months
        const now = new Date();

        const selected = new Date(Number(year), Number(month) - 1);

        const current = new Date(now.getFullYear(), now.getMonth());

        if (selected > current) {
            return res.status(400).json({
                success: false,
                message: "Future reports cannot be downloaded."
            });
        }

        const start = new Date(year, month - 1, 1);

        const end = new Date(year, month, 1);

        const orders = await Order.find({

            createdAt: {

                $gte: start,

                $lt: end

            }

        }).sort({

            createdAt: 1

        });

        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet("Orders");

        sheet.mergeCells("A1:I1");

        sheet.getCell("A1").value = "JARVI SEEDS & NURSERY";

        sheet.getCell("A1").font = {
            bold: true,
            size: 18
        };

        sheet.getCell("A1").alignment = {
            horizontal: "center"
        };

        sheet.addRow([]);

        sheet.addRow([
            "Order ID",
            "Farmer",
            "Mobile",
            "Jarvi Red",
            "Jarvi Red 1",
            "Jarvi Red Plus",
            "White Honey",
            "Full Address",
            "Delivery Date"
        ]);

        const header = sheet.getRow(3);

        header.font = {
            bold: true
        };

        header.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        header.eachCell(cell => {

            cell.fill = {

                type: "pattern",

                pattern: "solid",

                fgColor: {
                    argb: "2E7D32"
                }

            };

            cell.font = {

                color: {

                    argb: "FFFFFF"

                },

                bold: true

            };

        });

        orders.forEach(order => {

            const address = `${order.fullAddress},
${order.village},
${order.district},
${order.state} - ${order.pinCode}`;

            sheet.addRow([

                order.uniqueId,

                order.farmerName,

                order.mobile,

                order.varieties.jarviRed,

                order.varieties.jarviRed1,

                order.varieties.jarviRedPlus,

                order.varieties.jarviWhiteHoney,

                address,

                order.deliveryDate

            ]);

        });

        sheet.columns = [

            { width: 18 },

            { width: 25 },

            { width: 18 },

            { width: 12 },

            { width: 12 },

            { width: 15 },

            { width: 15 },

            { width: 55 },

            { width: 18 }

        ];

        sheet.eachRow(row => {

            row.eachCell(cell => {

                cell.alignment = {

                    vertical: "middle",

                    horizontal: "center",

                    wrapText: true

                };

                cell.border = {

                    top: { style: "thin" },

                    left: { style: "thin" },

                    bottom: { style: "thin" },

                    right: { style: "thin" }

                };

            });

        });

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );

        res.setHeader(

            "Content-Disposition",

            `attachment; filename=JarviSeeds-${month}-${year}.xlsx`

        );

        await workbook.xlsx.write(res);

        res.end();

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Excel Export Failed"

        });

    }

};
