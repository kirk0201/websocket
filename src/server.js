const express = require("express");
const app = express();
const http = require("http");
const port = 4000;

const WebSocket = require("ws");
const SocketIO = require("socket.io");
const io = SocketIO();

console.log("Hello");
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

// 아래 Http, ws를 합치는 작업으로 인해 localhost의 동일한 포트에서 ws, http 프로토콜 모두 처리 가능
// 여기서 Http서버가 필요한 이유는 views, static files, home, redirection 처리를 원하기 때문
const handleListen = () => console.log(`Listening on http://localhost:${port}`);

// createServer를 하기 위해서는 requestListner 경로가 필요하다
const server = http.createServer(app);

// const server를 통해 http서버에 접속한 뒤 new WebSocket.Server({ server })에
// server를 넣어 http, webSocket을 합친다.
// 합치지 않고 ws만 사용하려면 인자로 서버를 넣지 않으면 된다.
const wsServer = SocketIO(server);

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countUser = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "누군가";
  socket.onAny((e) => {
    console.log(`Socket Event : ${e}`);
  });
  socket.on("enter_room", (chat_data, showRoom) => {
    const { roomName } = chat_data;
    showRoom();
    socket.join(roomName);
    // console.log("socket.rooms", socket.rooms);
    socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // console.log(socket.rooms);

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countUser(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // socket.on("enter_room2", (roomName) => {
  //   socket.join(roomName);
  //   console.log("socket.rooms", socket.rooms);
  // });
});
/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  console.log("브라우저와 연결되었습니다. ✔");
  sockets.push(socket);
  socket["nickname"] = "누군가";
  // 메세지를 보내는 메소드는 wss가 아닌 socket에 존재하는 메소드이다
  //   console.log(socket);

  // 서버에 연결하면 아래 배열에 connection을 담는다

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }

    // const data = msg.toString();
    // const parseData = JSON.parse(data);
    // console.log(parseData);
    // sockets.forEach((sck) => sck.send(data));
    // socket.send(msg.toString("utf8"));
    // console.log("메세지를 받았습니다 : ", parseData);
  });
  socket.on("close", () => {
    console.log("브라우저와 연결이 끊겼습니다. ❌");
  });
});
*/

server.listen(4000, handleListen);
