exports.emitToUser = (io, userId, event, data) => {
  io.to(userId.toString()).emit(event, data);
};

exports.emitToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};
