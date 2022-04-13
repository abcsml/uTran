/*
 * create an answer for a offer
 * and post ans ice to server
 */

import ajax from "./ajax.js"

const offTimeout = 10
const iceGathTimeout = 40
const baseUrl = '/api/'

async function getRTCAnswer(room) {
    var rtcPC = new RTCPeerConnection({
        iceServers:[{urls:"stun:stun.gmx.net"}]
    })
    rtcPC.baseDC = rtcPC.createDataChannel("base", {negotiated: true, id: 0})
    rtcPC.createOffer({"iceRestart": true})
    .then(e=>rtcPC.setLocalDescription(e))
    await waitOff(room, rtcPC)
    await postAnsIce(room, rtcPC)
    return rtcPC
}

async function waitOff(room, rtcPC) {
    // long connect wait for Offer
    var flag = false
    var asking = false
    var ans = setInterval(async ()=>{
        if (asking == true) {return}
        asking = true
        await ajax.get(baseUrl+"off/"+room)
        .catch(e=>console.log(e))
        .then(e=>{
            if (e.code == 1){
                rtcPC.setRemoteDescription(e.mess)
                rtcPC.createAnswer({"iceRestart": true})
                .then(e=>rtcPC.setLocalDescription(e))
                clearInterval(ans)
                flag = true
            }
        })
        asking = false
    },100)
    return waitting(() => {
        return (flag)
    })
}

async function postAnsIce(room, rtcPC) {
    // post ice
    var e = await waitting(() => {
        return (rtcPC.iceGatheringState == "complete")
    }, iceGathTimeout)
    if (e) {
        ajax.post(baseUrl+"ans/"+room, rtcPC.localDescription)
        .catch(e=>console.log(e))
    } else {
        console.log('Post Ice Error')
    }
    // connectTimeout(rtcPC)
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

export {getRTCAnswer}

// function roll(){
//     $("html, body").animate({
//         scrollTop: $('html, body').get(0).scrollHeight
//     }, 100);
// }


