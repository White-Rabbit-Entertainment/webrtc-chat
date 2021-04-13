const constraints = {
    'video': true,
    'audio': true
}
var localStream = setUpLocalStream();

// Set up callButton
var callButton = document.getElementById("call-button");
callButton.addEventListener("click", makeOffer)

// Socket server setup
const URL = "http://127.0.0.1:3000";
const socket = io(URL, { autoConnect: true });
// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });
socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});


// Setup peer connection
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection = new RTCPeerConnection(configuration);

peerConnection.ontrack = () => remoteStream.addTrack(event.track, remoteStream)
peerConnection.onnegotiationneeded = (event) => console.log("Negotiation needed!");
peerConnection.onicecandidate = (event) => {
    console.log("icecandidate happened")
    if (event.candidate) {
        console.log("icecandidate really happened")
        socket.emit("message", {"iceCandidate": event.candidate});
    }
};
peerConnection.onconnectionstatechanged = (event) => {
    // If peerConnection becomes connected
    if (peerConnection.connectionState === 'connected') {
        // Peers connected!
        console.log("CONNECTED!!!!!!")
    }
};


// Set up remote stream
const remoteStream = new MediaStream();
const remoteVideo = document.querySelector('#remoteVideo');
remoteVideo.srcObject = remoteStream;

async function setUpLocalStream() {
    try {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('Got MediaStream:', stream);
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('video#localVideo');
        videoElement.srcObject = localStream;
        localStream.getTracks().forEach(track => {
            console.log("Sending track")
            console.log(track)
            peerConnection.addTrack(track, localStream);
        });
        return localStream
    } catch(error) {
        console.error('Error opening video camera.', error);
    }
}

async function makeOffer() {
    console.log("making call")
    socket.on('message', async message => {
        if (message.answer) {
            console.log("Got answer")
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    });
    const offer = await peerConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
    await peerConnection.setLocalDescription(offer);
    socket.emit("message", {'offer': offer});
}

// Listen out for any offer
socket.on('message', async message => {
    if (message.offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("message", {'answer': answer});
    }
    
    // Listen for local ICE candidates on the local RTCPeerConnection
    if (message.iceCandidate) {
        try {
            await peerConnection.addIceCandidate(message.iceCandidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
})

