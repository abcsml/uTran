/*
连接前端和后端
*/

import ajax from "./rtc/ajax.js"
import { getRTCOffer } from "./rtc/rtcOffer.js"
import { getRTCAnswer } from "./rtc/rtcAnswer.js"
import { fileSender, file2base64 } from "./file.js"
import { baseBox, imgBox, fileBox } from "./chat.js"

var pathName = document.location.pathname
const room = pathName.substring(1)

var a = await ajax.get('/api/get/'+room)
if (a.code == 0) {
    var rtc = await getRTCOffer(room)
} else {
    var rtc = await getRTCAnswer(room)
}

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

rtc.baseDC.onmessage = (e) => {
    getMessage(e.data)
}
rtc.picDC.onmessage = (e) => {
    getPicture(e.data)
}
rtc.fileDC.onmessage = (e) => {
    getFile(e.data)
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
    console.log("drop")
    // console.log(e.dataTransfer.files[0].slice(0,100))
    var files = e.dataTransfer.files
    // files = e.dataTransfer.files
    for (var i=0;i<files.length;i++) {
        if (files[i].type.includes('image')) {
            await sendPicture(files[i])
        }
        await sendFile(files[i])
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
async function getPicture(imgSegments) {
    imgSegments = JSON.parse(imgSegments)
    console.log(imgSegments)
    if (imgSegments.segment < imgSegments.nums) {
        imgCache += imgSegments.fileData
    } else {
        imgCache += imgSegments.fileData
        Words.innerHTML += imgBox(imgCache)
        imgCache = ''
    }
}
async function sendPicture(img) {
    var imgBase64 = await file2base64(img)
    Words.innerHTML += imgBox(imgBase64)//.substring(22))
    fileSender((e)=>{rtc.picDC.send(e)},img,20*8*1024)
    // fileSender(fileDC.send,img,32*8*1024)
}
async function getFile(fileSegments) {
    fileSegments = JSON.parse(fileSegments)
    console.log(fileSegments)
    fileCache += fileSegments.fileData
    if (fileSegments.segment == 1) {
        fileNum += 1
        Words.innerHTML += fileBox(fileSegments.fileName,"file"+fileNum)
    }// else {
        var progress = 100*(fileSegments.segment/fileSegments.nums)
        document.getElementById("file"+fileNum).value = progress
    // }
}
async function sendFile(file) {
    fileNum += 1
    Words.innerHTML += fileBox(file.name,"file"+fileNum)
    var progress = document.getElementById("file"+fileNum)
    fileSender((a,b)=>{
        rtc.fileDC.send(a)
        progress.value = b
    },file,20*8*1024)
}

