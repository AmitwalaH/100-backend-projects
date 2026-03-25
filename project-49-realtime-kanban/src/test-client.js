const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const BOARD_ID = "65sd16sdf";

socket.on("connect", () => {
    console.log("Connected as:", socket.id);

    socket.emit("joinBoard", BOARD_ID);
});


socket.on("userCount", (count) => {
    console.log(`Live Users on Board: ${count}`);
});

socket.on("taskMoved", (updatedTask) => {
    console.log("🚀 SOMEONE MOVED A TASK:", updatedTask.title, "is now", updatedTask.status);
});

socket.on("error", (err) => console.error("Socket Error:", err));