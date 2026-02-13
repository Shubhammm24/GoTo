const Parcel = require("../models/Parcel");
const Driver = require("../models/Driver");

/**
 * @desc   Create a parcel delivery request
 * @route  POST /api/parcels
 * @access Protected (Customer)
 */
exports.createParcel = async (req, res, next) => {
    try {
        const {
            pickupLocation,
            dropoffLocation,
            parcelDetails,
            vehicleTypeRequired,
            scheduledPickupTime
        } = req.body;

        // Validation
        if (!pickupLocation || !dropoffLocation || !parcelDetails) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Calculate pricing (simplified - should use Google Maps for actual distance)
        const estimatedDistance = 10; // TODO: Calculate using Google Maps API
        const baseFare = vehicleTypeRequired === "car" ? 50 : 30;
        const distanceFare = estimatedDistance * (vehicleTypeRequired === "car" ? 12 : 7);
        const weightCharge = parcelDetails.weight > 5 ? (parcelDetails.weight - 5) * 10 : 0;
        const totalAmount = baseFare + distanceFare + weightCharge;

        const parcel = await Parcel.create({
            senderId: req.user.id,
            pickupLocation,
            dropoffLocation,
            parcelDetails,
            vehicleTypeRequired: vehicleTypeRequired || "bike",
            scheduledPickupTime,
            estimatedDistance,
            pricing: {
                baseFare,
                distanceFare,
                weightCharge,
                totalAmount
            }
        });

        res.status(201).json({
            message: "Parcel delivery request created successfully",
            parcel
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Get user's parcels
 * @route  GET /api/parcels/user/me
 * @access Protected (Customer)
 */
exports.getMyParcels = async (req, res, next) => {
    try {
        const parcels = await Parcel.find({ senderId: req.user.id })
            .populate("driverId")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: parcels.length,
            parcels
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Get parcel by ID
 * @route  GET /api/parcels/:id
 * @access Protected
 */
exports.getParcelById = async (req, res, next) => {
    try {
        const parcel = await Parcel.findById(req.params.id)
            .populate("senderId", "name email phone")
            .populate("receiverId", "name phone")
            .populate("driverId");

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        // Authorization check
        if (
            req.user.role !== "admin" &&
            parcel.senderId._id.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(parcel);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Assign driver to parcel
 * @route  POST /api/parcels/:id/assign-driver
 * @access Protected (Admin)
 */
exports.assignDriver = async (req, res, next) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        // Find nearest available driver
        const driver = await Driver.findOne({
            isOnDuty: true,
            isActive: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: parcel.pickupLocation.coordinates
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        });

        if (!driver) {
            return res.status(404).json({ message: "No available drivers nearby" });
        }

        parcel.driverId = driver._id;
        parcel.status = "driver_assigned";
        await parcel.save();

        res.json({
            message: "Driver assigned successfully",
            parcel,
            driver
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Confirm parcel pickup
 * @route  PATCH /api/parcels/:id/pickup
 * @access Protected (Driver)
 */
exports.confirmPickup = async (req, res, next) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (parcel.status !== "driver_assigned") {
            return res.status(400).json({
                message: "Parcel must be in driver_assigned status"
            });
        }

        parcel.status = "picked_up";
        parcel.actualPickupTime = new Date();
        await parcel.save();

        res.json({
            message: "Parcel pickup confirmed",
            parcel
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Confirm parcel delivery
 * @route  PATCH /api/parcels/:id/deliver
 * @access Protected (Driver)
 */
exports.confirmDelivery = async (req, res, next) => {
    try {
        const { deliveryProof } = req.body;
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        if (parcel.status !== "picked_up" && parcel.status !== "in_transit") {
            return res.status(400).json({
                message: "Parcel must be picked up before delivery"
            });
        }

        parcel.status = "delivered";
        parcel.actualDeliveryTime = new Date();
        parcel.paymentStatus = "completed";
        if (deliveryProof) {
            parcel.deliveryProof = deliveryProof;
        }
        await parcel.save();

        res.json({
            message: "Parcel delivered successfully",
            parcel
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc   Cancel parcel delivery
 * @route  PATCH /api/parcels/:id/cancel
 * @access Protected (Customer/Admin)
 */
exports.cancelParcel = async (req, res, next) => {
    try {
        const parcel = await Parcel.findById(req.params.id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }

        // Only sender can cancel
        if (parcel.senderId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check if can be cancelled
        if (["delivered", "cancelled"].includes(parcel.status)) {
            return res.status(400).json({
                message: `Cannot cancel parcel with status: ${parcel.status}`
            });
        }

        parcel.status = "cancelled";
        await parcel.save();

        res.json({
            message: "Parcel delivery cancelled",
            parcel
        });
    } catch (error) {
        next(error);
    }
};
