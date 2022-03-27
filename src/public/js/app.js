const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
const data = document.getElementById("data");

call.hidden = true;
data.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;

let roomName;
let nickName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    console.log("cameras", cameras);
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
    console.log(cameras);
  } catch (e) {
    console.log(e);
  }
}
async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceId,
      },
    },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains,
    );

    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  if (!muted) {
    muteBtn.innerText = "Unmuted";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    console.log(videoSender);
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// welcome form

const welcomeForm = welcome.querySelector("form");
const nicknameForm = welcome.querySelector("#nickname");
const dataForm = data.querySelector("form");

async function initCall() {
  // welcome.hidden = true;
  call.hidden = false;

  await getMedia();
  makeConnection();
}

function showRoom() {
  const spanRoom = document.getElementById("pannel_room");
  spanRoom.innerText = `Room : ${roomName}`;
}

function showNickname() {
  const spanNick = document.getElementById("pannel_nickname");
  spanNick.innerText = `  , Nickname : ${nickName}`;
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  roomName = input.value;
  socket.emit("join_room", roomName, showRoom);
  input.value = "";
}
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  console.log(input.value);
  nickName = input.value;
  showNickname();
  //socket.emit("nickname", nickName, showNickname);
  input.value = "";
}
// dataChannel

function showChatList(msg) {
  const ul = data.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.append(li);
}

function handleDataSubmit(event) {
  event.preventDefault();
  const input = dataForm.querySelector("input");
  myDataChannel.send(`${nickName}: ${input.value}`);
  showChatList(`You : ${input.value}`);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
dataForm.addEventListener("submit", handleDataSubmit);

function handleDataChannel(event) {
  console.log(event);
  console.log("here test", event.data);
  showChatList(event.data);
}
// socket code
socket.on("welcome", async () => {
  // data call
  data.hidden = false;

  // addMessage();

  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", handleDataChannel);
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("Send Offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  // data call
  data.hidden = false;

  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", handleDataChannel);
  });
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});
// RTC code

function makeConnection() {
  // myPeerConnection = new RTCPeerConnection();
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("send candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;

  console.log("Peer Data", data.stream);
  console.log("my Data", myStream);
}
