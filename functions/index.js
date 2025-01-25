const functions = require("firebase-functions");
const express = require("express");
const twilio = require("twilio");
const logger = require("firebase-functions/logger");
require("dotenv").config();

const app = express();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const client = twilio(accountSid, authToken);

/**
 * Sends a notification message to a given phone number.
 *
 * @param {string} number - The recipient's phone number.
 */
function sendNotification(number) {
  client.messages
      .create({
        body: "Notification Message:\n\n📢 Milk Refilled! 🥛\n\nThe milk "+
    "dispenser you notified staff about has been refilled! "+
    "Thank you for letting us know! 😊",
        messagingServiceSid: messagingServiceSid,
        to: number,
      })
      .then((message) => logger.info(`Message sent with SID: ${message.sid}`))
      .catch((error) =>
        logger.error(`Failed to send message to ${number}:`, error),
      );
}

app.use(express.json());

app.post("/send-notification", (req, res) => {
  const {numbers} = req.body;

  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res
        .status(400)
        .send("Invalid request. Provide an array of phone numbers.");
  }

  numbers.forEach(sendNotification);
  res.json({message: "Notifications sent to specified numbers."});
});

// Export the app as a Firebase Function
exports.api = functions.https.onRequest(app);
