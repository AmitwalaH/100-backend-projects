
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on("send_message", (data) => {
      io.to(data.room).emit("receive_message", data);
      console.log(
        `Message from ${data.user} in room ${data.room}: ${data.message}`,
      );
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
};
