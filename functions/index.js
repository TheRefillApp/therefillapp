const twilio = require("twilio");
const { logger } = require("firebase-functions/v2");
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const moment = require("moment-timezone");
const axios = require("axios").default;
const { defineInt, defineString } = require('firebase-functions/params');
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp();
}



require("dotenv").config();

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
// Ensure credentials exist before initializing Twilio client
if (!accountSid || !authToken || !messagingServiceSid) {
  logger.error("Missing Twilio credentials in environment variables.");
  throw new Error("Twilio credentials are not properly configured.");
}

async function getDiningHours(date) {
  const options = {
    method: "GET",
    url: "https://now.dining.cornell.edu/api/1.0/dining/eateries.json",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  };

  try {
    const response = await axios.request(options);
    const formattedResponse = response.data.data.eateries.find(
      (item) => item.id === 43
    )?.operatingHours || [];
    const todaySchedule = formattedResponse.find((item) => item.date === date);

    if (!todaySchedule || !todaySchedule.events) return null;

    let events = todaySchedule.events.map((event) => ({
      startTimestamp: event.startTimestamp,
      endTimestamp: event.endTimestamp,
    }));

    events.sort((a, b) => a.startTimestamp - b.startTimestamp);

    // Merge back-to-back events
    let mergedTimes = [];
    for (let event of events) {
      if (mergedTimes.length === 0) {
        mergedTimes.push(event);
      } else {
        let last = mergedTimes[mergedTimes.length - 1];
        if (last.endTimestamp === event.startTimestamp) {
          last.endTimestamp = event.endTimestamp;
        } else {
          mergedTimes.push(event);
        }
      }
    }

    return mergedTimes.map((event) => ({
      startTime: moment.unix(event.startTimestamp).tz("America/New_York").format("HH:mm"),
      endTime: moment.unix(event.endTimestamp - 1800).tz("America/New_York").format("HH:mm"),
    }));
  } catch (error) {
    logger.error("Error fetching dining hours:", error);
    return null;
  }
}

exports.updateDiningSchedule = onSchedule("every 24 hours", async () => {
  const database = admin.database();
  const tomorrow = moment().tz("America/New_York").add(1, "days").format("YYYY-MM-DD");
  let diningTimes = await getDiningHours(tomorrow);

  if (!diningTimes || diningTimes.length === 0) {
    logger.warn("⚠️ WARNING: No dining hours found for", tomorrow, "- Using default times.");
    diningTimes = [
      { startTime: "07:00", endTime: "15:30" },
      { startTime: "17:00", endTime: "20:00" }
    ];
  }

  const scheduleRef = database.ref("schedule");
  const dateRef = scheduleRef.child(tomorrow);

  try {
    const snapshot = await dateRef.once("value");
    if (snapshot.exists()) {
      logger.warn("⚠️ WARNING: Schedule already exists for", tomorrow, "- Skipping update.");
      return null;
    }
    
    await dateRef.set({ times: diningTimes });
    logger.info("✅ SUCCESS: Updated schedule for", tomorrow);
  } catch (error) {
    logger.error("🚨 CRITICAL ERROR: Error updating Firebase schedule:", error);
  }

  return null;
});



exports.dynamicRequestLocking = onSchedule("every 1 minutes", async () => {
  const database = admin.database();
  try {
    const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(now);
    const currentDate = estDate.toISOString().split("T")[0];
    const currentHour = estDate.getHours().toString().padStart(2, "0");
    const currentMinute = estDate.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    const scheduleRef = database.ref(`schedule/${currentDate}/times`);
    const snapshot = await scheduleRef.get();

    if (!snapshot.exists()) {
      logger.info("No schedule found for today in database.");
      return;
    }

    let lockTriggered = false;
    let unlockTriggered = false;

    snapshot.forEach(async (childSnapshot) => {
      const { startTime, endTime } = childSnapshot.val();
      
      if (currentTime === startTime) {
        unlockTriggered = true;
        await database.ref("requests-locked").set(false);
        logger.info(`Requests unlocked at scheduled time: ${currentTime}`);
      } else if (currentTime === endTime) {
        lockTriggered = true;
        await database.ref("requests-locked").set(true);

        const itemsRef = database.ref("items");
        const itemsSnapshot = await itemsRef.get();
        
        if (!itemsSnapshot.exists()) {
          logger.warn("No items found in database.");
          return;
        }

        const updates = {};
        itemsSnapshot.forEach((childSnapshot) => {
          const itemId = childSnapshot.key;
          const itemData = childSnapshot.val() || {};
          
          updates[`items/${itemId}`] = {
            ...itemData,
            status: "Filled",
            requests: 0,
            timeAgo: "N/A",
            phones: [],
          };
        });
        
        await database.ref().update(updates);
        logger.info(`Requests locked and status reset at scheduled time: ${currentTime}`);

        await scheduleRef.child(childSnapshot.key).remove();
        logger.info(`Removed processed schedule time: ${startTime} - ${endTime}`);
      }
    });
  } catch (error) {
    logger.error("Error in scheduled request locking:", error);
  }
});


exports.sendNotification = onCall(
  {
    enforceAppCheck: true, // Ensures App Check validation
  },
  async (request) => {
    logger.info("Loaded Environment Variable: ", accountSid);

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
        sendAt: new Date(Date.now() + 310000).toISOString(),
        messagingServiceSid: messagingServiceSid,
        to: phoneNumber,
        scheduleType: 'fixed'
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
      await itemRef.update({ status: "Filled", requests: 0, timeAgo: "N/A", phones: [] });

      //logger.info(`Item ${itemId} successfully updated by user ${uid}`);
      return { success: true, message: "Item status updated successfully." };

    } catch (error) {
      //logger.error(`Failed to update item ${itemId}:`, error);
      return { error: "Failed to update item status. Please try again." };
    }
  }
);

exports.handleSubmit = onCall(
  {
    enforceAppCheck: true, // Ensures App Check validation
  },
  async (request) => {
    const database = admin.database();

    // Ensure user is authenticated
   

    const { phoneNumber, station } = request.data;
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;

    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      logger.error("Invalid phone number format:", phoneNumber);
      return { error: "Invalid phone number format." };
    }

    if (!station) {
      logger.error("Invalid request: Missing station.");
      return { error: "Invalid request. Missing station name." };
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

      // Update phone numbers
      const currentPhones = matchingItem.phones || {};
      const newPhones = {
        ...currentPhones,
        [Object.keys(currentPhones).length]: phoneNumber,
      };

      await database.ref(`items/${matchingKey}`).update({ phones: newPhones });

      logger.info(`Phone number added successfully for station ${station}`);
      return { success: true, message: "Phone number added successfully." };

    } catch (error) {
      logger.error("Error processing handleSubmit:", error);
      return { error: "Failed to update phone number. Please try again." };
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

