const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

let roomName;

room.hidden = true;

function handleMessageSubmit(event) {
  event.preventDefault();
  input = room.querySelector("#msg input");
  const msg = input.value;
  socket.emit("new_message", msg, roomName, ()=> {
    addMessage(`You: ${msg}`);
  });
  input.value="";
}

function handleNicknameSubmit(event){
  event.preventDefault();
  input = room.querySelector("#nick input");
  socket.emit("nickname",input.value);
}
 
function showRoom() {
  welcome.hidden = true;
  room.hidden=false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName}`;

  const msgForm = room.querySelector("#msg");
  const nickForm = room.querySelector("#nick");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nickForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event){
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value="";
}

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname)=>{
  addMessage(`${nickname} joined`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname} left`);
});

socket.on("new_message",addMessage);