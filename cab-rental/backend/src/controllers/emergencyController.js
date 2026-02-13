const EmergencyContact = require("../models/EmergencyContact");
const SOSAlert = require("../models/SOSAlert");
const User = require("../models/User");
const Booking = require("../models/Booking");

/**
 * @desc   Add emergency contact
 * @route  POST /api/emergency/contacts
 * @access Protected
 */
exports.addEmergencyContact = async (req, res, next) => {
    try {
        const { name, phone, relationship, priority } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                message: "Name and phone are required"
            });
        }

        const contact = await EmergencyContact.create({
            userId: req.user.id,
            name,
            phone,
            relationship,
            priority: priority || 1
        });

        // Add to user's emergency contacts list
        await User.findByIdAndUpdate(req.user.id, {
            $push: { "safetySettings.emergencyContacts": contact._id }
        });

        res.status(201).json({
            success: true,
            contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Get user's emergency contacts
 * @route  GET /api/emergency/contacts
 * @access Protected
 */
exports.getEmergencyContacts = async (req, res, next) => {
    try {
        const contacts = await EmergencyContact.find({
            userId: req.user.id,
            isActive: true
        }).sort({ priority: 1 });

        res.json({
            success: true,
            count: contacts.length,
            contacts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Update emergency contact
 * @route  PUT /api/emergency/contacts/:id
 * @access Protected
 */
exports.updateEmergencyContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, relationship, priority, isActive } = req.body;

        const contact = await EmergencyContact.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        if (name) contact.name = name;
        if (phone) contact.phone = phone;
        if (relationship) contact.relationship = relationship;
        if (priority) contact.priority = priority;
        if (isActive !== undefined) contact.isActive = isActive;

        await contact.save();

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Delete emergency contact
 * @route  DELETE /api/emergency/contacts/:id
 * @access Protected
 */
exports.deleteEmergencyContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        const contact = await EmergencyContact.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        // Remove from user's list
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { "safetySettings.emergencyContacts": id }
        });

        res.json({
            success: true,
            message: "Emergency contact deleted"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Trigger SOS alert
 * @route  POST /api/emergency/sos
 * @access Protected
 */
exports.triggerSOS = async (req, res, next) => {
    try {
        const { bookingId, location, alertType } = req.body;

        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({
                message: "Valid location coordinates required"
            });
        }

        if (!alertType || !["police", "emergency_contact", "platform_support"].includes(alertType)) {
            return res.status(400).json({
                message: "Valid alert type required"
            });
        }

        // Get user info
        const user = await User.findById(req.user.id)
            .populate("safetySettings.emergencyContacts");

        // Create SOS alert
        const sosAlert = await SOSAlert.create({
            userId: req.user.id,
            bookingId: bookingId || null,
            location: {
                type: "Point",
                coordinates: location.coordinates,
                address: location.address || ""
            },
            alertType,
            status: "active"
        });

        // If bookingId provided, update booking
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                "safetyStatus.sosActivated": true,
                "safetyStatus.sosTimestamp": new Date()
            });
        }

        // Handle alert based on type
        if (alertType === "emergency_contact" && user.safetySettings.emergencyContacts.length > 0) {
            await notifyEmergencyContacts(user, location, sosAlert._id);

            await Booking.findByIdAndUpdate(bookingId, {
                "safetyStatus.emergencyContactsNotified": true
            });
        }

        if (alertType === "police") {
            // In production, integrate with local emergency services API
            // For now, log the alert
            console.log("[SOS] Police alert triggered:", {
                userId: req.user.id,
                location: location.coordinates,
                sosAlertId: sosAlert._id
            });

            // TODO: Integrate with emergency services API
            // await contactPolice(location, user, sosAlert._id);
        }

        // Emit Socket.io event for real-time dashboard updates
        const io = req.app.get("io");
        if (io) {
            io.emit("sos-alert", {
                alertId: sosAlert._id,
                userId: req.user.id,
                location,
                alertType
            });
        }

        res.status(201).json({
            success: true,
            message: "SOS alert activated",
            alert: sosAlert
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Share live location with emergency contacts
 * @route  POST /api/emergency/share-location/:bookingId
 * @access Protected
 */
exports.shareLiveLocation = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { location } = req.body;

        if (!location || !location.coordinates) {
            return res.status(400).json({
                message: "Location coordinates required"
            });
        }

        const user = await User.findById(req.user.id)
            .populate("safetySettings.emergencyContacts");

        if (!user.safetySettings.shareLocationAfterRide) {
            return res.status(403).json({
                message: "Location sharing not enabled. Please enable it in safety settings."
            });
        }

        // Update booking
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                "safetyStatus.locationSharingActive": true
            });
        }

        // Send location to all active emergency contacts
        const activeContacts = user.safetySettings.emergencyContacts.filter(c => c.isActive);

        if (activeContacts.length === 0) {
            return res.status(400).json({
                message: "No active emergency contacts found"
            });
        }

        for (const contact of activeContacts) {
            await sendLocationNotification(contact, location, user.name);
        }

        res.json({
            success: true,
            message: `Location shared with ${activeContacts.length} emergency contact(s)`,
            sharedWith: activeContacts.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Get SOS alerts (Admin only)
 * @route  GET /api/emergency/sos-alerts
 * @access Protected (Admin)
 */
exports.getSOSAlerts = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const alerts = await SOSAlert.find(query)
            .populate("userId", "name phone email")
            .populate("bookingId")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await SOSAlert.countDocuments(query);

        res.json({
            success: true,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total,
            alerts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Resolve SOS alert (Admin)
 * @route  PATCH /api/emergency/sos-alerts/:id/resolve
 * @access Protected (Admin)
 */
exports.resolveSOSAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const alert = await SOSAlert.findByIdAndUpdate(
            id,
            {
                status: status || "resolved",
                resolvedAt: new Date(),
                notes
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: "SOS alert not found" });
        }

        res.json({
            success: true,
            alert
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Update safety settings
 * @route  PATCH /api/emergency/settings
 * @access Protected
 */
exports.updateSafetySettings = async (req, res, next) => {
    try {
        const { enableEmergencySharing, shareLocationAfterRide, sosEnabled } = req.body;

        const updateData = {};
        if (enableEmergencySharing !== undefined) {
            updateData["safetySettings.enableEmergencySharing"] = enableEmergencySharing;
        }
        if (shareLocationAfterRide !== undefined) {
            updateData["safetySettings.shareLocationAfterRide"] = shareLocationAfterRide;
        }
        if (sosEnabled !== undefined) {
            updateData["safetySettings.sosEnabled"] = sosEnabled;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select("safetySettings");

        res.json({
            success: true,
            safetySettings: user.safetySettings
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions

async function notifyEmergencyContacts(user, location, sosAlertId) {
    // In production, integrate with SMS/Email service
    // For now, just log
    console.log("[Emergency] Notifying contacts for user:", user.name);
    console.log("[Emergency] Location:", location.coordinates);
    console.log("[Emergency] SOS Alert ID:", sosAlertId);

    // TODO: Implement actual notification
    // - Send SMS with location link
    // - Send push notification
    // - Send email
}

async function sendLocationNotification(contact, location, userName) {
    // In production, send actual SMS/notification
    console.log(`[Location Share] Sending to ${contact.name} (${contact.phone})`);
    console.log(`[Location Share] ${userName} is at: ${location.coordinates}`);

    // TODO: Integrate with SMS service like Twilio
    // await twilioClient.messages.create({
    //   body: `${userName} is sharing their location: https://maps.google.com/?q=${location.coordinates[1]},${location.coordinates[0]}`,
    //   to: contact.phone,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
}

module.exports = exports;
