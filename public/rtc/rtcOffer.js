/*
 * create an offer to create a room or channel
 * and post off ice to server
 * and listen for ans ice
 */

import { ajax } from "ajax"

class RTCOffer extends RTCPeerConnection {
    offTimeout = 4
    iceGathTimeout = 40
    baseUrl = '/api'

    constructor(room, name) {
        super()
        this.dc = this.createDataChannel(name)
        this.room = room
        this.setConfiguration({
            iceServers:[{urls:"stun:stun.gmx.net"}]
        })
        var e = await this.createOffer({"iceRestart": true})
        await this.setLocalDescription(e)
    }
    async sendOff() {
        dcDebug()
        await offInit()
        postOff()
        waitAns()
    }
    async creOff() {
        // create room
        axios.get(this.baseUrl+"/cre/"+this.room)
        .catch(e=>this.errHandle(e, ''))
        .then(e=>{
            if (e.data.code != 1) {
                this.errHandle('Create Room Error', '')
            }
        })
    }
    async postOffIce() {
        // post ice
        var e = await waitting(() => {
            return (lc.iceGatheringState == "complete")
        }, iceGathTimeout)
        if (e) {
            axios.post(this.baseUrl+"/off/"+this.room, lc.localDescription)
            .catch(e=>this.errHandle(e, ''))
            .then(e=>{
                if (e.data.code != 1) {
                    this.errHandle('Post Ice Error', '')
                }
            })
        } else {
            this.errHandle()
        }
    }
    waitAns() {
        // long connect wait for ans
        var asking = false
        var ans = setInterval(async function(){
            if (asking == true) {return}
            asking = true
            var e = await axios.get('http://abcs.ml:9999/off/'+room)
            if (e.data.code){
                await lc.setRemoteDescription(e.data.mess)
                console.log(e.data.mess)
                clearInterval(ans)

                setTimeout(()=>{
                    if (lc.iceConnectionState!="connected"){
                        alert("连接失败")
                    }
                }, this.offTimeout*1000)

            }
            asking = false
        },100)
    }
    dcDebug() {
        this.dc.onmessage = e => {
            console.log(`onmessage: ${e}`)
        }
        this.dc.onopen = e => {
            console.log(`onopen: ${e}`)
        }
        this.dc.onicecandidate = e => {
            console.log(`onicecandidate: ${e}`)
        }
    }
    errHandle(err, msg) {
        console.log(err.message)
        console.error(msg)
    }
    ajax()
}




// const getinterval = 1
const conntimeout = 4

const lc = new RTCPeerConnection()
const dc = lc.createDataChannel("webrtc")
dc.onmessage = e => {
    $("#mess").append($("<h3>").text('对方: '+e.data))
    roll()
    console.log("got it :" + e.data)
}
dc.onopen = e => {
    $("#info").text('对方接收成功, 开始聊天')
    console.log("connect!!!")
}
lc.onicecandidate = e => {
    // if (lc.iceGatheringState=="complete"){
    //     axios.post("http://abcs.ml:9999/off/"+room,lc.localDescription)
    // }
    // // $("#my_icecandidate").text(JSON.stringify(lc.localDescription))
    // console.log("ice" + JSON.stringify(lc.localDescription))
    // console.log(`c: ${lc.iceConnectionState}, G: ${lc.iceGatheringState}`)
}

//     lc.setRemoteDescription(JSON.parse($("#other_icecandidate")))
$(document).ready(function(){
    init()
    
    $("#input").click(function(){
        let data = $("#content").val()
        $("#mess").append($("<h3>").text('我: '+data))
        roll()
        dc.send(data)
        $("#content").val("")
    })
    $("#content").bind("keyup",function(event) {
        if (event.keyCode == "13") {
            $("#input").click()
        }
    })
})

async function init(){
    var restartConfig = {iceServers:[{urls:"stun:stun.gmx.net"}]}
    await lc.setConfiguration(restartConfig)
    var o = await lc.createOffer({"iceRestart": true})
    await lc.setLocalDescription(o)
    console.log("set sucess")
    // var result = await axios.get('http://abcs.ml:9999/off/'+room)
    // var result = await axios.post("http://abcs.ml:9999/off/"+room,lc.localDescription)

    var asking = false
    var ans = setInterval(async function(){
        if (asking == true) {return}
        asking = true
        var result = await axios.get('http://abcs.ml:9999/off/'+room)
        rec = result
        if (result.data.code){
            await lc.setRemoteDescription(result.data.mess)
            console.log(result.data.mess)
            clearInterval(ans)

            setTimeout(()=>{
                if (lc.iceConnectionState!="connected"){
                    alert("连接失败")
                }
            },conntimeout*1000)

        }
        asking = false
    },100)
    // o = await sendOffer()
    // console.log(`send off ${o}`)
    var result = await waitting(function() {
        return (lc.iceGatheringState=="complete")
    }, 1*60)
    // console.log("waitting com")
    if (result) {
        axios.post("http://abcs.ml:9999/off/"+room,lc.localDescription)
    } else {alert("error")}
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

