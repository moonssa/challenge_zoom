const socket = new WebSocket(`ws://${window.location.host}`);

const msgform = document.getElementById("msg-form");
const nickform = document.getElementById("nick-form");
const msglist = document.getElementById("msg-list");
const nickspan = document.getElementById("nick-span");
nickspan.hidden = true;
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function showMessage(msg) {
  const ul = msglist.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = `${msg}`;
  ul.append(li);
  const br = document.createElement("br");
  ul.append(br);
}
socket.addEventListener("open", () => {
  console.log("Connected from browser  ✅");
});

socket.addEventListener("message", (msg) => {
  showMessage(msg.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from the Server ❌");
});

function handleMsgSubmit(event) {
  event.preventDefault();
  const newmsg = msgform.querySelector("input");
  const newmsgValue = newmsg.value;
  socket.send(makeMessage("new_message", newmsgValue));
  newmsg.value = "";
}

function handelNicknameSubmit(event) {
  event.preventDefault();
  console.log("submit");
  const nickname = nickform.querySelector("input");
  const nicknameValue = nickname.value;

  nickspan.innerText= `nickname : ${nicknameValue}`;
  nickspan.hidden=false;
  socket.send(makeMessage("nickname", nicknameValue));
  nickname.value = "";
 
}

msgform.addEventListener("submit", handleMsgSubmit);
nickform.addEventListener("submit", handelNicknameSubmit);
