const { Server } = require("socket.io");
const authSocket = require("./authSocket");
const rideSocket = require("./rideSocket");
const trackingSocket = require("./trackingSocket");
const notificationSocket = require("./notificationSocket");

module.exports = function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(authSocket);

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.user?.id);

    socket.join(socket.user.id);

    rideSocket(io, socket);
    trackingSocket(io, socket);
    notificationSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.user?.id);
    });
  });
};
