// Constants
module.exports = {
  ROLES: {
    CUSTOMER: "customer",
    DRIVER: "driver",
    VEHICLE_OWNER: "vehicle_owner",
    ADMIN: "admin"
  },

  BOOKING_STATUS: {
    REQUESTED: "requested",
    CONFIRMED: "confirmed",
    DRIVER_ASSIGNED: "driver_assigned",
    PICKUP_PENDING: "pickup_pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
  },

  PAYMENT_STATUS: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded"
  },

  VEHICLE_TYPES: ["car", "bike", "scooter"],

  RENTAL_TYPES: ["self-drive", "driver-operated", "both"]
};
