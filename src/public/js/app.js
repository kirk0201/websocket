const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#msg");
const nickNameForm = document.querySelector("#nick");

const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

// socket이 open되었다면 브라우저에 연결되었다고 로그 출력 가능
socket.addEventListener("open", () => {
  console.log("브라우저와 연결되었습니다. ✔");
});

socket.addEventListener("message", (msg) => {
  //   const data = JSON.parse(msg.data);
  console.log("msg", msg.data);
  //   console.log("test", data);
  const li = document.createElement("li");
  li.innerText = msg.data.toString("utf8");
  messageList.appendChild(li);
  console.log(`메세지를 받았습니다 :`, msg.data);
});

socket.addEventListener("close", () => {
  console.log("서버와 연결이 끊겼습니다. ❌");
});

// setTimeout(() => {
//     socket.send("Hello World!!!")
// }, 5000);

const handleMsgSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  //   console.log(input.value);
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = nickNameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
};
messageForm.addEventListener("submit", handleMsgSubmit);
nickNameForm.addEventListener("submit", handleNickSubmit);
