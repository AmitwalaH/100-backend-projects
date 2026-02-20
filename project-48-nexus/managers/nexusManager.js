const initializeNexus = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Nexus] New Connection: ${socket.id}`);

    // ROOM COORDINATION
    socket.on("join-room", (roomName) => {
      socket.join(roomName);
      console.log(`[Nexus] Socket ${socket.id} joined room: ${roomName}`);

      // Notify others in the room that someone joined
      socket.to(roomName).emit("notification", {
        message: `User ${socket.id} has entered the coordinates.`,
        timestamp: new Date().getTime(),
      });
    });

    // DATA BROADCASTING
    //'io.to(room).emit' sends to EVERYONE in that room.
    socket.on("send-data", (payload) => {
      const { room, data } = payload;

      console.log(`[Nexus] Data relay in ${room} from ${socket.id}`);

      // Broadcast the message to the specific room
      io.to(room).emit("room-update", {
        sender: socket.id,
        content: data,
        timestamp: new Date().getTime(),
      });
    });
    socket.on("ping-nexus", () => {
      socket.emit("pong-nexus", { serverTime: new Date().getTime() });
    });

    //DISCONNECTION CLEANUP
    socket.on("disconnect", (reason) => {
      console.log(
        `[Nexus] User Disconnected: ${socket.id} | Reason: ${reason}`,
      );
    });
  });
};

module.exports = { initializeNexus };
