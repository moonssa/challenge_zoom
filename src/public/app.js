const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const change = document.getElementById("change");
const display = document.getElementById("display");
const room = document.getElementById("room");
//const nickForm = room.querySelector("#nick");

let roomName;
let nickName;

room.hidden = true;
change.hidden = true;
display.hidden = true;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  console.log("current roomName", roomName);
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#nick input");
  nickName = input.value;
  socket.emit("nickname", nickName, showRoom);
  input.value = "";
}

function showRoom(r, n) {
  // welcome.hidden = true;
  change.hidden = false;
  display.hidden = false;
  room.hidden = false;

  const spanRoom = display.querySelector("#display-room");
  spanRoom.innerText = `Room : ${r} `;

  const spanNickname = display.querySelector("#display-nickname");
  spanNickname.innerText = ` , nickname: ${n}`;

  const msgForm = room.querySelector("form");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const inputRoom = welcomeForm.querySelector("#create-room");
  const inputNickname = welcomeForm.querySelector("#create-nickname");

  roomName = inputRoom.value;
  nickName = inputNickname.value;
  socket.emit("enter_room", roomName, nickName, showRoom);
  inputRoom.value = "";
  inputNickname.value = "";
}

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");

  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);
// welcomeForm.addEventListener("submit", handleRoomSubmit);
//nickForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (nickname) => {
  addMessage(`${nickname} joined`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname} left`);
});

socket.on("new_message", addMessage);

// const socket = io();

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");

// let roomName;

// room.hidden = true;

// function handleMessageSubmit(event) {
//   event.preventDefault();
//   input = room.querySelector("#msg input");
//   const msg = input.value;
//   socket.emit("new_message", msg, roomName, ()=> {
//     addMessage(`You: ${msg}`);
//   });
//   input.value="";
// }

// function handleNicknameSubmit(event){
//   event.preventDefault();
//   input = room.querySelector("#nick input");
//   socket.emit("nickname",input.value);
// }

// function showRoom() {
//   welcome.hidden = true;
//   room.hidden=false;
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room : ${roomName}`;

//   const msgForm = room.querySelector("#msg");
//   const nickForm = room.querySelector("#nick");
//   msgForm.addEventListener("submit", handleMessageSubmit);
//   nickForm.addEventListener("submit", handleNicknameSubmit);
// }

// function handleRoomSubmit(event){
//   event.preventDefault();
//   const input = form.querySelector("input");
//   socket.emit("enter_room", input.value, showRoom);
//   roomName = input.value;
//   input.value="";
// }

// function addMessage(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.append(li);
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (nickname)=>{
//   addMessage(`${nickname} joined`);
// });

// socket.on("bye", (nickname) => {
//   addMessage(`${nickname} left`);
// });

// socket.on("new_message",addMessage);
