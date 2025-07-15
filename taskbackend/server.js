const http = require("http");
const socketio = require("socket.io");
const app = require("./app");

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 1818;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
