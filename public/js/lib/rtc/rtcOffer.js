/*
 * create an offer to create a room or channel
 * and post off ice to server
 * and listen for ans ice
 */

import ajax from "./ajax.js"

const offTimeout = 10
const iceGathTimeout = 40
const baseUrl = '/api/'

/**
 * 一个RTC对应多个DataChannel
 */

async function getRTCOffer(room) {
    var rtcPC = new RTCPeerConnection({
        iceServers:[{urls:"stun:stun.gmx.net"}]
    })
    rtcPC.baseDC = rtcPC.createDataChannel("base", {negotiated: true, id: 0})
    rtcPC.createOffer({"iceRestart": true})
    .then(e=>rtcPC.setLocalDescription(e))
    await creOff(room)
    await postOffIce(room, rtcPC)
    waitAns(room, rtcPC)
    return rtcPC
}

async function creOff(room) {
    await ajax.get(baseUrl+"cre/"+room)
    .catch(e=>console.log(e))
}

async function postOffIce(room, rtcPC) {
    // post ice
    var e = await waitting(() => {
        return (rtcPC.iceGatheringState == "complete")
    }, iceGathTimeout)
    if (e) {
        ajax.post(baseUrl+"off/"+room, rtcPC.localDescription)
        .catch(e=>console.log(e))
    } else {
        console.log('Post Ice Error')
    }
}

function waitAns(room, rtcPC) {
    // long connect wait for ans
    var flag = false
    var asking = false
    var ans = setInterval(async ()=>{
        if (asking == true) {return}
        asking = true
        await ajax.get(baseUrl+"ans/"+room)
        .catch(e=>console.log(e))
        .then(e=>{
            if (e.code == 1){
                console.log(e)
                rtcPC.setRemoteDescription(e.mess)
                clearInterval(ans)
                // connectTimeout(rtcPC)
                flag = true
            }
        })
        asking = false
    },100)
    return waitting(() => {
        return (flag)
    })
}

function connectTimeout(rtcPC) {
    setTimeout(()=>{
        if (rtcPC.iceConnectionState!="connected"){
            alert("连接失败")
        }
    }, offTimeout*1000)
}

async function waitting(f, outtime) {
    return new Promise(function(resolve, reject) {
        var t = new Date()
        var it = setInterval(function() {
            if (f()) {
                clearInterval(it)
                resolve(true)
            }
            if ((Date.now() - t)/1000 > outtime) {
                clearInterval(it)
                resolve(false)
            }
        }, 100)
    })
}

export {getRTCOffer}