const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

// Dummy driver email domain — used to identify dummy/test drivers
const DUMMY_DOMAIN = "@dummydriver.goto.test";

module.exports = (io, socket) => {

  // ─── Active ride request timeouts (bookingId → timerId) ────
  const rideTimeouts = new Map();

  /**
   * Helper — pick a random dummy driver who:
   *   • preferably matches the requested vehicleType (falls back to any)
   *   • is on-duty, approved, active
   *   • does NOT have an active ride (driver_assigned / in_progress)
   */
  async function pickAvailableDummyDriver(vehicleType) {
    // All on-duty, approved dummy drivers
    const candidates = await Driver.find({
      isOnDuty: true,
      isActive: true,
      isApproved: true,
    }).populate("userId", "name phone email");

    // Filter to dummy-only AND not busy
    const available = [];
    for (const d of candidates) {
      const email = d.userId?.email || "";
      if (!email.endsWith(DUMMY_DOMAIN)) continue; // only dummies

      // Check if this driver already has an active ride
      const activeRide = await Booking.findOne({
        driverId: d._id,
        status: { $in: ["driver_assigned", "in_progress"] },
      });
      if (!activeRide) available.push(d);
    }

    console.log(`[RideSocket] Dummy drivers: ${candidates.length} total, ${available.length} available (vehicleType: ${vehicleType})`);

    if (available.length === 0) return null;

    // Prefer matching vehicleType, fall back to any
    const matching = vehicleType
      ? available.filter(d => d.vehicleDetails?.vehicleType === vehicleType)
      : available;
    const pool = matching.length > 0 ? matching : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Helper — snap a dummy driver's location near the pickup so they
   * appear "nearby" to the customer.
   */
  async function snapDriverNearPickup(driver, pickupCoords) {
    if (!pickupCoords || pickupCoords.length < 2) return;
    // Random offset within ~1-2 km
    const offsetLng = (Math.random() - 0.5) * 0.02;
    const offsetLat = (Math.random() - 0.5) * 0.02;
    await Driver.findByIdAndUpdate(driver._id, {
      currentLocation: {
        type: "Point",
        coordinates: [
          pickupCoords[0] + offsetLng,
          pickupCoords[1] + offsetLat,
        ],
      },
    });
  }

  // 🚕 Customer requests a ride → broadcast to all on-duty drivers
  socket.on("ride:request", async (bookingId) => {
    try {
      const booking = await Booking.findById(bookingId)
        .populate("customerId", "name phone");
      if (!booking || booking.status !== "requested") return;

      // Find all on-duty, active, approved drivers (matching vehicle type)
      const driverQuery = {
        isOnDuty: true,
        isActive: true,
        isApproved: true
      };
      if (booking.vehicleType) {
        driverQuery["vehicleDetails.vehicleType"] = booking.vehicleType;
      }

      let drivers = [];

      // Try geo query first if pickup coordinates exist
      const coords = booking.pickupLocation?.coordinates;
      if (coords && coords.length === 2 && coords[0] !== 0 && coords[1] !== 0) {
        try {
          drivers = await Driver.find({
            ...driverQuery,
            currentLocation: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: coords // [lng, lat]
                },
                $maxDistance: 10000 // 10km radius
              }
            }
          })
            .populate("userId", "name phone email")
            .limit(10);
        } catch {
          drivers = [];
        }
      }

      // Fallback: plain query if geo returned nothing
      if (drivers.length === 0) {
        drivers = await Driver.find(driverQuery)
          .populate("userId", "name phone email")
          .limit(10);
      }

      if (drivers.length === 0) {
        // No drivers available at all
        io.to(booking.customerId._id?.toString() || booking.customerId.toString())
          .emit("ride:no_drivers", { bookingId, message: "No drivers available nearby" });
        return;
      }

      // Broadcast ride to all matched drivers
      const rideInfo = {
        bookingId: booking._id,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        vehicleType: booking.vehicleType,
        totalAmount: booking.totalAmount,
        estimatedDistance: booking.estimatedDistance,
        estimatedDuration: booking.estimatedDuration,
        customerName: booking.customerId?.name || "Customer",
      };

      drivers.forEach(driver => {
        const driverUserId = driver.userId?._id?.toString() || driver.userId?.toString();
        io.to(driverUserId).emit("ride:incoming", rideInfo);
      });

      // Emit driver count to customer so they know drivers were notified
      const customerId = booking.customerId._id?.toString() || booking.customerId.toString();
      console.log(`[RideSocket] ride:request ${bookingId} | ${drivers.length} drivers found | customer: ${customerId} | vehicleType: ${booking.vehicleType}`);
      io.to(customerId).emit("ride:searching", {
        bookingId,
        driversNotified: drivers.length
      });

      // ─── Dummy auto-accept after 5 s ──────────────────────
      // If no real driver accepts within 5 seconds, a random
      // dummy driver automatically picks up the ride.
      setTimeout(async () => {
        try {
          const freshBooking = await Booking.findById(bookingId);
          if (!freshBooking || freshBooking.status !== "requested") {
            console.log(`[RideSocket] Auto-accept: ride ${bookingId} already taken/cancelled`);
            return;
          }

          const dummy = await pickAvailableDummyDriver(booking.vehicleType);
          if (!dummy) {
            console.log(`[RideSocket] Auto-accept: no dummy driver available for vehicleType=${booking.vehicleType}`);
            return;
          }

          // Snap dummy near pickup
          await snapDriverNearPickup(dummy, coords);

          // Atomic accept
          const updated = await Booking.findOneAndUpdate(
            { _id: bookingId, status: "requested" },
            { driverId: dummy._id, status: "driver_assigned" },
            { new: true }
          ).populate("customerId", "name phone");

          if (!updated) return; // race: someone else got it

          // Mark dummy off-duty
          await Driver.findByIdAndUpdate(dummy._id, { isOnDuty: false });

          // Clear the 60s timeout
          const tid = rideTimeouts.get(bookingId);
          if (tid) { clearTimeout(tid); rideTimeouts.delete(bookingId); }

          // Notify customer
          const driverInfo = {
            driverId: dummy._id,
            name: dummy.userId?.name || "Driver",
            phone: dummy.userId?.phone || "",
            rating: dummy.rating || 4.5,
            completedRides: dummy.completedRides || 0,
            vehicleDetails: dummy.vehicleDetails || {},
          };
          io.to(customerId).emit("ride:accepted", { bookingId, booking: updated, driver: driverInfo });
          console.log(`[RideSocket] ✅ Dummy driver "${dummy.userId?.name}" auto-accepted ride ${bookingId}`);
        } catch (e) {
          console.error("[RideSocket] dummy auto-accept error:", e);
        }
      }, 5000);

      // Set 60s timeout — if nobody (incl. dummy) accepts, notify customer
      const timeoutId = setTimeout(async () => {
        const freshBooking = await Booking.findById(bookingId);
        if (freshBooking && freshBooking.status === "requested") {
          io.to(customerId).emit("ride:no_drivers", {
            bookingId,
            message: "No drivers accepted your ride. Please try again."
          });
          await Booking.findByIdAndUpdate(bookingId, { status: "pending" });
        }
        rideTimeouts.delete(bookingId);
      }, 60000);

      rideTimeouts.set(bookingId, timeoutId);

    } catch (err) {
      console.error("ride:request error:", err);
    }
  });

  // ✅ Driver accepts ride — atomic first-come-first-serve
  socket.on("ride:accept", async ({ bookingId }) => {
    try {
      const driverUserId = socket.user?.id;
      if (!driverUserId) return;

      // Find the driver record for this user
      const driver = await Driver.findOne({ userId: driverUserId })
        .populate("userId", "name phone");
      if (!driver) return;

      // ─── Busy-driver check ──────────────────────────────
      // A driver who already has an active ride cannot accept another
      const activeRide = await Booking.findOne({
        driverId: driver._id,
        status: { $in: ["driver_assigned", "in_progress"] },
      });
      if (activeRide) {
        socket.emit("ride:busy", {
          bookingId,
          message: "You already have an active ride. Complete it first.",
          activeBookingId: activeRide._id,
        });
        return;
      }

      // Atomic: only assign if still "requested" (first-come-first-serve)
      const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, status: "requested" },
        {
          driverId: driver._id,
          status: "driver_assigned"
        },
        { new: true }
      ).populate("customerId", "name phone");

      if (!booking) {
        // Ride already taken by another driver
        socket.emit("ride:already_taken", { bookingId });
        return;
      }

      // Mark driver as off-duty (they're on a ride now)
      await Driver.findByIdAndUpdate(driver._id, { isOnDuty: false });

      // Clear the timeout
      const timeoutId = rideTimeouts.get(bookingId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        rideTimeouts.delete(bookingId);
      }

      // Build driver info for the customer
      const driverInfo = {
        driverId: driver._id,
        name: driver.userId?.name || "Driver",
        phone: driver.userId?.phone || "",
        rating: driver.rating || 0,
        completedRides: driver.completedRides || 0,
        vehicleDetails: driver.vehicleDetails || {},
      };

      // Notify the CUSTOMER that a driver accepted
      const customerId = booking.customerId._id?.toString() || booking.customerId.toString();
      io.to(customerId).emit("ride:accepted", {
        bookingId,
        booking,
        driver: driverInfo
      });

      // Confirm to the DRIVER who accepted
      socket.emit("ride:confirmed", {
        bookingId,
        booking,
        message: "You got the ride!"
      });

    } catch (err) {
      console.error("ride:accept error:", err);
    }
  });

  // ❌ Driver rejects / ignores ride
  socket.on("ride:reject", ({ bookingId }) => {
    // Just acknowledge — no action needed, other drivers can still accept
    socket.emit("ride:rejected", { bookingId });
  });

  // ▶ Ride started
  socket.on("ride:start", async (bookingId) => {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: "in_progress", actualStartTime: new Date() },
        { new: true }
      );
      if (!booking) return;

      io.to(booking.customerId.toString())
        .emit("ride:started", booking);
    } catch (err) {
      console.error("ride:start error:", err);
    }
  });

  // ⏹ Ride ended — driver goes back on-duty automatically
  socket.on("ride:end", async (bookingId) => {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: "completed", actualEndTime: new Date() },
        { new: true }
      );
      if (!booking) return;

      // Re-enable driver so they can receive new rides
      if (booking.driverId) {
        await Driver.findByIdAndUpdate(booking.driverId, { isOnDuty: true });
      }

      io.to(booking.customerId.toString())
        .emit("ride:completed", booking);
    } catch (err) {
      console.error("ride:end error:", err);
    }
  });

  // 🧹 Clean up timeouts on disconnect
  socket.on("disconnect", () => {
    // Timeouts are per-booking not per-socket, so they persist
  });
};
