import ajax from "./rtc/ajax.js"
import { getRTCOffer } from "./rtc/rtcOffer.js"
import { getRTCAnswer } from "./rtc/rtcAnswer.js"
import { fileSender } from "./file.js"

var pathName = document.location.pathname
const room = pathName.substring(1)

var a = await ajax.get('/api/get/'+room)
if (a.code == 0) {
    var rtc = await getRTCOffer(room)
} else {
    var rtc = await getRTCAnswer(room)
}

var Words = document.getElementById("words")
var Who = document.getElementById("who")
var TalkWords = document.getElementById("talkwords")
var TalkSub = document.getElementById("talksub")

/*
baseDC : 普通消息
picDC : 图片
fileDC : 文件
*/
rtc.picDC = rtc.createDataChannel("Picture", {negotiated: true, id: 1})
rtc.fileDC = rtc.createDataChannel("File", {negotiated: true, id: 2})

rtc.baseDC.onmessage = (e) => {
    getMessage(e.data)
}
TalkSub.onclick = () => {
    var str = "";
    if(TalkWords.value == ""){
        alert("消息不能为空");
        return;
    }
    sendMessage(TalkWords.value)
}
TalkWords.onkeydown = (e) => {
    if (e.keyCode == 13 && TalkWords.value != ""){
        sendMessage(TalkWords.value)
    }
}

Words.ondrop = async (e) => {
    e.preventDefault()
    // console.log("drop")
    // console.log(e.dataTransfer.files[0].slice(0,100))
    var files = e.dataTransfer.files
    files = e.dataTransfer.files
    for (var i=0;i<files.length;i++) {
        if (files[i].type.includes('image')) {
            await sendPicture(files[i])
        }
        await sendFile(file[i])
    }
}

async function getMessage(mess, name='对方:') {
    var str = `<div class="atalk"><span>${name}${mess}</span></div>`
    Words.innerHTML = Words.innerHTML + str
}
async function sendMessage(mess, name='我:') {
    var str = `<div class="btalk"><span>${name}${mess}</span></div>`
    Words.innerHTML = Words.innerHTML + str
    rtc.baseDC.send(mess)
}
async function getPicture() {

}
async function sendPicture(img) {
    fileSender(sendMessage,img,32*8*1024)
    // fileSender(fileDC.send,img,32*8*1024)
}
async function getFile() {

}
async function sendFile() {

}


