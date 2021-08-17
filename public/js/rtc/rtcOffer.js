/*
 * create an offer to create a room or channel
 * and post off ice to server
 * and listen for ans ice
 */

// import { ajax } from "ajax"

/**
 * 一个RTC对应多个DataChannel
 */
// export default
class RTCOffer {
    offTimeout = 4
    iceGathTimeout = 40
    baseUrl = '/api'

    onopen = e => {console.log(`onopen: ${e}`)}
    onicecandidate = e => {console.log(`onicecandidate: ${e}`)}
    onmessage = e => {console.log(`onmessage: ${e}`)}

    constructor(room) {
        this.rtcPC = new RTCPeerConnection()
        this.room = room
        
        this.init()
        this.baseDcDebug()
    }
    async init() {
        this.baseDc = this.rtcPC.createDataChannel("base", {negotiated: true, id: 0})
        this.rtcPC.setConfiguration({
            iceServers:[{urls:"stun:stun.gmx.net"}]
        })
        this.rtcPC.createOffer({"iceRestart": true})
        .then(e=>this.rtcPC.setLocalDescription(e))

        // this.baseDc.onopen = this.onopen
        // this.baseDc.onicecandidate = this.onicecandidate
        // this.baseDc.onmessage = this.onmessage
        await this.creOff()
        await this.postOffIce()
        this.waitAns()
    }
    async creOff() {
        // create room
        axios.get(this.baseUrl+"/cre/"+this.room)
        .catch(e=>this.errHandle(e, 'Network Error'))
        .then(e=>{
            if (e.data.code != 1) {
                this.errHandle('Create Room Error', '')
            }
        })
    }
    async postOffIce() {
        // post ice
        var e = await waitting(() => {
            return (this.rtcPC.iceGatheringState == "complete")
        }, this.iceGathTimeout)
        if (e) {
            axios.post(this.baseUrl+"/off/"+this.room, this.rtcPC.localDescription)
            .catch(e=>this.errHandle(e, 'net'))
            .then(e=>{
                if (e.data.code != 1) {
                    this.errHandle('Post Ice Error', '')
                }
            })
        } else {
            this.errHandle('Post Ice Error', this.rtcPC.iceGatheringState)
        }
    }
    waitAns() {
        // long connect wait for ans
        var asking = false
        var ans = setInterval(async ()=>{
            if (asking == true) {return}
            asking = true
            await axios.get(this.baseUrl+"/ans/"+this.room)
            .catch(e=>this.errHandle(e, 'wait'))
            .then(e=>{
                if (e.data.code == 1){
                    this.rtcPC.setRemoteDescription(e.data.mess)
                    clearInterval(ans)
                    this.connectTimeout()
                }
            })
            asking = false
        },100)
    }
    connectTimeout() {
        setTimeout(()=>{
            if (this.rtcPC.iceConnectionState!="connected"){
                alert("连接失败")
            }
        }, this.offTimeout*1000)
    }
    baseDcDebug() {
        this.baseDc.onopen = this.onopen
        this.baseDc.onicecandidate = this.onicecandidate
        this.baseDc.onmessage = this.onmessage
    }
    errHandle(err, msg) {
        console.log(err)
        console.log(msg)
        throw 'rtc Error'
    }
}


/* 继承行不通



export {RTCOffer}

*/

/*

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

*/

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

