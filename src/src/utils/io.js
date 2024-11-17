const { Server } = require("socket.io");

const io = new Server();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

module.exports = io;
