const axios = require("axios");

/**
 * ==========================================
 * Send WhatsApp Template Message
 * ==========================================
 */
async function sendWhatsApp(number, messageId, variables) {

    try {

        const response = await axios.get(
            "https://www.fast2sms.com/dev/whatsapp",
            {
                params: {

                    authorization: process.env.FAST2SMS_API_KEY,

                    phone_number_id: process.env.PHONE_NUMBER_ID,

                    message_id: messageId,

                    numbers: number,

                    variables_values: variables.join("|")

                }
            }
        );

        console.log("========== WHATSAPP ==========");
        console.log(response.data);
        console.log("==============================");

        return response.data.success === true;

    } catch (err) {

        console.log(
            "WhatsApp Error:",
            err.response?.data || err.message
        );

        return false;

    }

}

/**
 * ==========================================
 * OWNER NOTIFICATION
 * Template:
 * new_order_notification
 * ==========================================
 */
async function sendOwnerNotification(order) {

    if (!process.env.OWNER_MOBILE) {

        console.log("OWNER_MOBILE Missing");

        return false;

    }

    const variables = [

        order.uniqueId,

        order.farmerName,

        order.mobile,

        order.village,

        order.deliveryDate

    ];

    const sent = await sendWhatsApp(

        process.env.OWNER_MOBILE,

        process.env.OWNER_TEMPLATE_ID,

        variables

    );

    if (sent)
        console.log("✅ Owner WhatsApp Sent");

    return sent;

}

/**
 * ==========================================
 * CUSTOMER NOTIFICATION
 * Template:
 * order_confirmation
 * ==========================================
 */
async function sendCustomerNotification(order) {

    const variables = [

        order.farmerName,

        order.uniqueId,

        order.deliveryDate

    ];

    const sent = await sendWhatsApp(

        order.mobile,

        process.env.CUSTOMER_TEMPLATE_ID,

        variables

    );

    if (sent)
        console.log("✅ Customer WhatsApp Sent");

    return sent;

}

module.exports = {

    sendOwnerNotification,

    sendCustomerNotification

};
