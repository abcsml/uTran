/*
输入程序运行环境与一些参数
*/

import chat from "./chat.js"

const propertys = [
    "canTrickleIceCandidates",
    "defaultIceServers",
    "iceConnectionState",
    "iceGatheringState",
    "peerIdentity",
    "sctp",
    "signalingState",
    "peerIdentity"
]

const events = [
    "connectionstatechange",
    "datachannel",
    "icecandidate",
    "icecandidateerror",
    "iceconnectionstatechange",
    "icegatheringstatechange",
    "negotiationneeded",
    "signalingstatechange"
]

function log(rtc,type) {
    chat.addMess(rtc[type],type+":")
}

function event(rtc,type) {
    rtc.addEventListener(type, e => {
        // log(rtc,type)
        if (e.type == "connectionstatechange") {
            console.log(rtc.connectionState);
        }
        console.log(e.type)
    })
}

export default async function debug(rtc, time) {
    setTimeout(()=>{
        for (var i in propertys) {
            log(rtc,propertys[i])
        }
        for (var i in events) {
            event(rtc,events[i])
        }
    },time)
}
