/*
 * create an answer for a offer
 * and post ans ice to server
 */


// export 
class RTCAnswer {
    offTimeout = 4
    iceGathTimeout = 40
    baseUrl = '/api'

    onopen = e => {console.log(`onopen: ${e}`)}
    onicecandidate = e => {console.log(`onicecandidate: ${e}`)}
    onmessage = e => {console.log(`onmessage: ${e}`)}

    constructor(room) {
        this.rtcPC = new RTCPeerConnection()
        this.baseDc = this.rtcPC.createDataChannel("base", {negotiated: true, id: 0})
        this.room = room
        
        this.init()
        this.baseDcDebug()
    }
    async init() {
        this.rtcPC.setConfiguration({
            iceServers:[{urls:"stun:stun.gmx.net"}]
        })
        await this.waitOff()
        await this.postAnsIce()
        this.connectTimeout()
    }
    async waitOff() {
        // long connect wait for Offer
        var asking = false
        var ans = setInterval(async ()=>{
        if (asking == true) {return}
        asking = true
        axios.get(this.baseUrl+"/off/"+this.room)
        .catch(e=>this.errHandle(e, 'waitOff'))
        .then(e=>{
            if (e.data.code == 1){
                this.rtcPC.setRemoteDescription(e.data.mess)
                this.rtcPC.createAnswer({"iceRestart": true})
                .then(e=>this.rtcPC.setLocalDescription(e))
                clearInterval(ans)
            }
        })
        asking = false
    },100)
    }
    async postAnsIce() {
        // post ice
        var e = await waitting(() => {
            return (this.rtcPC.iceGatheringState == "complete")
        }, this.iceGathTimeout)
        if (e) {
            axios.post(this.baseUrl+"/ans/"+this.room, this.rtcPC.localDescription)
            .catch(e=>this.errHandle(e, 'postAnsIce'))
            .then(e=>{
                if (e.data.code != 1) {
                    this.errHandle('Post Ice Error', '')
                }
            })
        } else {
            this.errHandle('postIceError', '')
        }
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
        console.error(msg)
        throw 'rtc Error'
    }
    createDc()
}



/*

var pathName = document.location.pathname
const room = pathName.substr(1)

// const getinterval = 1
const conntimeout = 4

const rc = new RTCPeerConnection()
rc.onicecandidate = e => {
    // $("#my_icecandidate").text(JSON.stringify(rc.localDescription))
    // if (rc.iceGatheringState=="complete"){
    //     axios.post("http://abcs.ml:9999/ans/"+room,rc.localDescription)
    //     setTimeout(()=>{
    //         if (rc.iceConnectionState!="connected"){
    //             alert("连接失败")
    //         }
    //     },conntimeout*1000)
    // }
    // console.log("ice" + JSON.stringify(rc.localDescription))
    // console.log(`c: ${rc.iceConnectionState}, G: ${rc.iceGatheringState}`)
}
rc.ondatachannel = e => {
    rc.dc = e.channel
    rc.dc.onmessage = e => {
        rec = e
        $("#mess").append($("<h3>").text('对方: '+e.data))
        roll()
        console.log("data:"+e.data)
    }
    rc.dc.onopen = e => {
        $("#info").text('对方接收成功, 开始聊天')
        console.log("connect!!")
    }
}

// console.log("over")

$(document).ready(function(){
    init()

    $("#input").click(function(){
        let data = $("#content").val()
        $("#mess").append($("<h3>").text('我: '+data))
        roll()
        rc.dc.send(data)
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
    await rc.setConfiguration(restartConfig)
    // var result = await axios.get('http://abcs.ml:9999/ans/'+room)
    // if (result.data.code == -1) {
    //     alert("房间不存在")
    //     return
    // }

    var asking = false
    var ans = setInterval(async function(){
        if (asking == true) {return}
        asking = true
        var result = await axios.get('http://abcs.ml:9999/ans/'+room)
        console.log(result)
        if (result.data.code){
            await rc.setRemoteDescription(result.data.mess)
            var o = await rc.createAnswer({"iceRestart": true})
            console.log("createAnswer")
            await rc.setLocalDescription(o)
            // var result = await axios.post("http://abcs.ml:9999/ans/"+room,rc.localDescription)
            if (result.data.code == -1) {alert("无法建立连接")}
            clearInterval(ans)
        }
        asking = false
    },100)

    var result = await waitting(function() {
        return (rc.iceGatheringState=="complete")
    }, 1*60)
    // console.log("waitting com")
    if (result) {
        axios.post("http://abcs.ml:9999/ans/"+room,rc.localDescription)
        setTimeout(()=>{
            if (rc.iceConnectionState!="connected"){
                alert("连接失败")
            }
        },conntimeout*1000)
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

function roll(){
    $("html, body").animate({
        scrollTop: $('html, body').get(0).scrollHeight
    }, 100);
}


*/