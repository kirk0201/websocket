const socket = io();
// const welcome = document.getElementById("welcome");
const header = document.querySelector("header");
const h1 = header.querySelector("h1");

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.querySelector("#room");
const ul = room.querySelector("ul");
const msgForm = room.querySelector("#msg");
const nickForm = room.querySelector("#nick");
room.hidden = true;
let roomName = "";
// const welcome2 = document.querySelector("#welcome2");
// const form2 = welcome2.querySelector("form");

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  msgForm.addEventListener("submit", handleMessageSubmit);
  nickForm.addEventListener("submit", handleNickSubmit);
};

const addMessage = (message) => {
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.emit("nickname", input.value);
};

const handleSubmit = (e) => {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");

  // WebSocket은 .send()를 사용하지만 SocketIO는 .emit()을 사용
  // WebSocket은 객체를 보낼수 없고 string으로 변환하여 데이터를 보냈지만
  // SocketIO는 객체를 보낼 수 있다.
  // 첫번째 argument는 어떤이름이라도 상관없다
  // event를 emit하여 Room 기능을 사용한다

  // 첫번째 argument는 Event
  // 두번째 argument는 payload
  // 세번째 argument는 Callback함수가 들어감
  // argument로 보낼수있는 payload는 여러개도 가능하다
  // 마지막 argument에 끝날때 실행되는 function을 넣어 확인 가능
  // 마지막 argument에 전달되는 함수는 서버에서 실행되지 않고 클라이언트에서 실행된다
  // 서버에서 실행이 되면 큰 보안 문제를 야기할 수 있기 때문이다.
  socket.emit("enter_room", { roomName: input.value }, showRoom);
  roomName = input.value;
  h1.innerText = `${roomName}의 방`;
  input.value = "";
};
const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = msgForm.querySelector("input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};
// const handleSubmit2 = (e) => {
//   e.preventDefault();
//   const input = form2.querySelector("input");
//   socket.emit("enter_room2", { payload: input.value }, () => {
//     console.log("사용자가 떠났습니다");
//   });
// };
welcomeForm.addEventListener("submit", handleSubmit);
// form2.addEventListener("submit", handleSubmit2);

socket.on("welcome", (user, count) => {
  h1.innerText = `${roomName}의 방 (${count})`;

  addMessage(`${user}가 접속했습니다!`);
});

socket.on("new_message", addMessage);

socket.on("bye", (user, count) => {
  h1.innerText = `${roomName}의 방 (${count})`;

  addMessage(`${user}가 떠났습니다 BYE!`);
});

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
console.log("welcome", welcome);
