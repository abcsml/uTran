/*
连接前端和后端
*/

import ajax from "./rtc/ajax.js"
import { getRTCOffer } from "./rtc/rtcOffer.js"
import { getRTCAnswer } from "./rtc/rtcAnswer.js"
import { fileSender, file2base64 } from "./file.js"
import chat from "./chat.js"

var pathName = document.location.pathname
const room = pathName.substring(1)

var a = await ajax.get('/api/get/'+room)
if (a.code == 0) {
    var rtc = await getRTCOffer(room)
} else {
    var rtc = await getRTCAnswer(room)
}

setTimeout(()=>{
    if (rtc.iceConnectionState!="connected"){
        alert("连接失败")
        sendInfo("连接失败")
    }
}, 5*1000)

var imgCache = ''
var fileCache = ''
var fileNum = 0

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

rtc.baseDC.onopen = (e) => {
    chat.sendInfo("连接成功")
}
rtc.baseDC.onclose = (e) => {
    chat.sendInfo("对方断开连接")
}

rtc.baseDC.onmessage = (e) => {
    getMessage(e.data)
    chat.scrollToBottom()
}
rtc.picDC.onmessage = (e) => {
    getPicture(e.data)
    chat.scrollToBottom()
}
rtc.fileDC.onmessage = (e) => {
    getFile(e.data)
    chat.scrollToBottom()
}
TalkSub.onclick = () => {
    var str = "";
    if(TalkWords.value == ""){
        alert("消息不能为空");
        return;
    }
    sendMessage(TalkWords.value)
    TalkWords.value = ""
    chat.scrollToBottom()
}
TalkWords.onkeydown = (e) => {
    if (e.keyCode == 13 && TalkWords.value != ""){
        sendMessage(TalkWords.value)
        TalkWords.value = ""
        chat.scrollToBottom()
    }
}

Words.ondrop = async (e) => {
    e.preventDefault()
    var files = e.dataTransfer.files
    // files = e.dataTransfer.files
    for (var i=0;i<files.length;i++) {
        console.log(files[i].type)
        if (files[i].type.includes('image')) {
            await sendPicture(files[i])
        } else {
            await sendFile(files[i])
        }
        chat.scrollToBottom()
    }
}

async function getMessage(mess, name='对方:') {
    Words.innerHTML += chat.baseBox(mess,name,"atalk")
}
async function sendMessage(mess, name='我:') {
    Words.innerHTML += chat.baseBox(mess,name,"btalk")
    rtc.baseDC.send(mess)
}
async function getPicture(imgSegments) {
    imgSegments = JSON.parse(imgSegments)
    console.log(imgSegments)
    imgCache += imgSegments.fileData
    if (imgSegments.segment == imgSegments.nums) {
        Words.innerHTML += chat.imgBox(imgCache,"atalk")
        imgCache = ''
    }
}
async function sendPicture(img) {
    var imgBase64 = await file2base64(img)
    Words.innerHTML += chat.imgBox(imgBase64,"btalk")//.substring(22))
    fileSender((a,b)=>{rtc.picDC.send(a)},img,20*8*1024)
    // fileSender(fileDC.send,img,32*8*1024)
}
async function getFile(fileSegments) {
    fileSegments = JSON.parse(fileSegments)
    console.log(fileSegments)
    fileCache += fileSegments.fileData
    if (fileSegments.segment == 1) {
        fileNum += 1
        Words.innerHTML += chat.fileBox(fileSegments.fileName,"file"+fileNum,"atalk")
    }// else {
        var progress = 100*(fileSegments.segment/fileSegments.nums)
        document.getElementById("file"+fileNum).value = progress
    // }
}
async function sendFile(file) {
    fileNum += 1
    Words.innerHTML += chat.fileBox(file.name,"file"+fileNum,"btalk")
    var progress = document.getElementById("file"+fileNum)
    fileSender((a,b)=>{
        rtc.fileDC.send(a)
        progress.value = b
    },file,20*8*1024)
}

