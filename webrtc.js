const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const constraints = {
    'video': true,
    'audio': true
}

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        console.log('Got MediaStream:', stream);
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

async function playVideoFromCamera() {
    try {
        const constraints = {'video': true, 'audio': true};
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('video#localVideo');
        videoElement.srcObject = stream;
    } catch(error) {
        console.error('Error opening video camera.', error);
    }
}

playVideoFromCamera();

const URL = "http://127.0.0.1:3000";
const socket = io(URL, { autoConnect: true });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

console.log("Connect")

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});

// socket.emit("create or join", "hello")
var peerConnection = null;
async function makeCall() {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    peerConnection = new RTCPeerConnection(configuration);
    socket.on('message', async message => {
        if (message.answer) {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("message", {'offer': offer});
}

console.log("Hello")
makeCall();

socket.on('message', async message => {
    if (message.offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("message", {'answer': answer});
        
        // Listen for local ICE candidates on the local RTCPeerConnection
        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                socket.send("message", {'new-ice-candidate': event.candidate});
            }
        });
        
        // Listen for remote ICE candidates and add them to the local RTCPeerConnection
        socket.on('message', async message => {
            if (message.iceCandidate) {
                try {
                    await peerConnection.addIceCandidate(message.iceCandidate);
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

    }
})

