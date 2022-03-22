import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = (e) =>
  console.log(`✅  Listening on http://localhost:3000  `);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  sockets.push(socket);
  socket.on("close", () => console.log("Disconnected from the Browser  ❌"));
  socket.on("message", (msg) => {
    const parsedMsg = JSON.parse(msg);
    console.log(parsedMsg);

    switch (parsedMsg.type) {
      case "new_message":
        sockets.forEach((eachSocket) =>
          eachSocket.send(`${socket.nickname} : ${parsedMsg.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = parsedMsg.payload;
        break;
    }
  });
});
// Put all your backend code here.

server.listen(3000, handleListen);