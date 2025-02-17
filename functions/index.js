const twilio = require("twilio");
const { logger } = require("firebase-functions/v2");
const { onCall } = require("firebase-functions/v2/https");
const { defineInt, defineString } = require('firebase-functions/params');
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp();
}



require("dotenv").config();

// Load Twilio credentials from environment variables
const accountSid = defineString("TWILIO_ACCOUNT_SID");
const authToken = defineString("TWILIO_AUTH_TOKEN");
const messagingServiceSid = defineString("TWILIO_MESSAGING_SERVICE_SID");

// Ensure credentials exist before initializing Twilio client
if (!accountSid || !authToken || !messagingServiceSid) {
  logger.error("Missing Twilio credentials in environment variables.");
  throw new Error("Twilio credentials are not properly configured.");
}


exports.sendNotification = onCall(
  {
    enforceAppCheck: true, // Ensures App Check validation
  },
  async (request) => {
    const client = twilio(accountSid, authToken);

    // Validate input
    const phoneNumber = request.data.number;
    if (!phoneNumber || typeof phoneNumber !== "string") {
      logger.error("Invalid phone number provided:", phoneNumber);
      return { error: "Invalid request. Provide a valid phone number." };
    }

    try {
      const message = await client.messages.create({
        body:
          "Notification Message:\n\n📢 Milk Refilled! 🥛\n\n" +
          "The milk dispenser you notified staff about has been refilled! " +
          "Thank you for letting us know! 😊",
        messagingServiceSid: messagingServiceSid,
        to: phoneNumber,
      });

      logger.info(`Message sent successfully with SID: ${message.sid}`);
      return { success: true, message: "Notification sent successfully." };

    } catch (error) {
      logger.error(`Failed to send message to ${phoneNumber}:`, error);
      return { error: "Failed to send notification. Please try again." };
    }
  }
);

exports.confirmStatusChange = onCall(
  {
    enforceAppCheck: true, // Ensures App Check validation
  },
  async (request) => {
    const database = admin.database();

    const itemId = request.data.itemId;
    if (!itemId) {
      logger.error("Invalid request: Missing itemId.");
      return { error: "Invalid request. Missing itemId." };
    }

    try {
      const itemRef = database.ref(`items/${itemId}`);
      
      // Update the item in RTDB
      await itemRef.update({ status: "Filled", requests: 0, timeAgo: "N/A" });

      //logger.info(`Item ${itemId} successfully updated by user ${uid}`);
      return { success: true, message: "Item status updated successfully." };

    } catch (error) {
      //logger.error(`Failed to update item ${itemId}:`, error);
      return { error: "Failed to update item status. Please try again." };
    }
  }
);

exports.handleConfirmClick = onCall(
  {
    enforceAppCheck: true, // Ensures App Check validation
  },
  async (request) => {
    const database = admin.database();

   
    const station = request.data.station;
    if (!station) {
      logger.error("Invalid request: Missing station parameter.");
      return { error: "Invalid request. Missing station parameter." };
    }

    try {
      const itemsRef = database.ref("items");
      const snapshot = await itemsRef.get();

      if (!snapshot.exists()) {
        return { error: "No items found in database." };
      }

      const data = snapshot.val();
      let matchingKey = null;
      let matchingItem = null;

      // Find the item matching the station name
      for (const [key, item] of Object.entries(data)) {
        if (item.itemName === station) {
          matchingKey = key;
          matchingItem = item;
          break;
        }
      }

      if (!matchingKey || !matchingItem) {
        return { error: `No matching item found for station: ${station}` };
      }

      // Determine update based on timeAgo
      const updates = {
        status: "Refill",
        requests: (matchingItem.requests || 0) + 1,
      };
      if (matchingItem.timeAgo === "N/A") {
        updates.timeAgo = new Date().toISOString();
      }

      await database.ref(`items/${matchingKey}`).update(updates);

      logger.info(`Item ${matchingKey} updated successfully for station ${station}`);
      return { success: true, message: "Item status updated successfully." };

    } catch (error) {
      logger.error("Error processing handleConfirmClick:", error);
      return { error: "Failed to update item. Please try again." };
    }
  }
);