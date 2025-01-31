const twilio = require("twilio");
const {logger} = require("firebase-functions/v2");
require("dotenv").config();

const { onCall } = require("firebase-functions/v2/https");



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const client = twilio(accountSid, authToken);




exports.sendNotification = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
    consumeAppCheckToken: true  // Consume the token after verification.
  },
  (request) => {
    client.messages
    .create({
      body: "Notification Message:\n\n📢 Milk Refilled! 🥛\n\nThe milk "+
  "dispenser you notified staff about has been refilled! "+
  "Thank you for letting us know! 😊",
      messagingServiceSid: messagingServiceSid,
      to: request.data.number,
    })
    .then((message) => logger.info(`Message sent with SID: ${message.sid}`))
    .catch((error) =>{
      logger.error(`Failed to send message to ${request.data.number}:`, error);
      return {message: "Invalid request. Provide an array of phone numbers"};
   } );
    return {message: "Notifications sent to specified numbers."};
  }
);