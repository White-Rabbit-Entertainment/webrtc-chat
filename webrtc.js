const io = require('socket.io')();
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

//async function makecall() {
//    const peerconnection = new rtcpeerconnection(configuration);
//    signalingchannel.addeventlistener('message', async message => {
//        if (message.answer) {
//            const remotedesc = new rtcsessiondescription(message.answer);
//            await peerconnection.setremotedescription(remotedesc);
//        }
//    });
//    const offer = await peerconnection.createoffer();
//    await peerconnection.setlocaldescription(offer);
//    signalingchannel.send({'offer': offer});
//}
//
//signalingchannel.addeventlistener('message', async message => {
//    if (message.offer) {
//        const peerconnection = new rtcpeerconnection(configuration);
//        peerconnection.setremotedescription(new rtcsessiondescription(message.offer));
//        const answer = await peerconnection.createanswer();
//        await peerconnection.setlocaldescription(answer);
//        signalingchannel.send({'answer': answer});
//    }
//})
//
//// Listen for local ICE candidates on the local RTCPeerConnection
//peerConnection.addEventListener('icecandidate', event => {
//    if (event.candidate) {
//        signalingChannel.send({'new-ice-candidate': event.candidate});
//    }
//});
//
//// Listen for remote ICE candidates and add them to the local RTCPeerConnection
//signalingChannel.addEventListener('message', async message => {
//    if (message.iceCandidate) {
//        try {
//            await peerConnection.addIceCandidate(message.iceCandidate);
//        } catch (e) {
//            console.error('Error adding received ice candidate', e);
//        }
//    }
//});
playVideoFromCamera();

async function makeCall() {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration);
    signalingChannel.addEventListener('message', async message => {
        if (message.answer) {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingChannel.send({'offer': offer});
}

const URL = "http://localhost:3000";
const socket = io(URL, { autoConnect: false });
socket.onAny((event, ...args) => {
  console.log(event, args);
});
