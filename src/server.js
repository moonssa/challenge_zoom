import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = (e) =>
  console.log(`✅  Listening on http://localhost:3000  `);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`socket event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    console.log(socket.rooms);
    socket.to(roomName).emit("welcome", socket.nickname); // broadcast
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
  });

  socket.on("new_message", (msg,room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) =>{
    socket["nickname"] = nickname;
  });
});

httpServer.listen(3000, handleListen);
