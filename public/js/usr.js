/*
连接前端和后端
*/

import ajax from "./rtc/ajax.js"
import { getRTCOffer } from "./rtc/rtcOffer.js"
import { getRTCAnswer } from "./rtc/rtcAnswer.js"
import chat from "./chat.js"
import { sendMess, getMess, sendFile, getFile } from "./tran.js"

var pathName = document.location.pathname
const room = pathName.substring(1)

var a = await ajax.get('/api/get/'+room)
if (a.code == 0) {
    var rtc = await getRTCOffer(room)
} else {
    var rtc = await getRTCAnswer(room)
}

// setTimeout(()=>{
//     if (rtc.iceConnectionState!="connected"){
//         alert("连接失败")
//         sendInfo("连接失败")
//     }
// }, 5*1000)

var fileNum = 0
var fileDCId = 1;

/*
baseDC : 协议
picDC : 图片
fileDC : 文件
*/

rtc.baseDC.onopen = (e) => {
    chat.sendInfo("连接成功")
}
rtc.baseDC.onclose = (e) => {
    chat.sendInfo("对方断开连接")
}
rtc.baseDC.onerror = (e) => {
    chat.sendInfo("error")
    console.log(e)
}

rtc.baseDC.onmessage = async (e) => {
    var m = JSON.parse(e.data)
    console.log(m)
    if (m.type == "mess") {
        chat.addMess(m.data,"")
    } else if (m.type == "file") {
        if (m.data.fileType.includes('image')) {
            var url = await getFile(rtc,m.data,{})
            chat.addImg(m.data.fileName,url)
        } else {
            var fileId = fileNum
            fileNum += 1
            chat.addFile(m.data.fileName,fileId)
            var pro = document.getElementById("pro"+fileId)
            var url = await getFile(rtc,m.data,pro)
            var href = document.getElementById("url"+fileId)
            href.setAttribute("href",url)
        }
    }
    chat.scrollToBottom()
}

var TalkSub = document.getElementById("talksub")
TalkSub.onclick = () => {
    var str = "";
    if(TalkWords.value == ""){
        alert("消息不能为空");
        return;
    }
    sendMess(rtc.baseDC,TalkWords.value)
    chat.showMess(TalkWords.value,"")
    TalkWords.value = ""
    chat.scrollToBottom()
}

var TalkWords = document.getElementById("talkwords")
TalkWords.onkeydown = (e) => {
    if (e.keyCode == 13 && TalkWords.value != ""){
        sendMess(rtc.baseDC,TalkWords.value)
        chat.showMess(TalkWords.value,"")
        TalkWords.value = ""
        chat.scrollToBottom()
    }
}

var Words = document.getElementById("words")
async function handleFile(files) {
    for (var i=0;i<files.length;i++) {
        console.log(files[i].type)
        if (files[i].type.includes('image')) {
            await chat.showImg(files[i])
            await sendFile(rtc,fileDCId,files[i],{})
        } else {
            await chat.showFile(files[i],fileNum)
            var pro = document.getElementById("pro"+fileNum)
            await sendFile(rtc,fileDCId,files[i],pro)
            fileNum += 1
        }
        fileDCId += 1
        chat.scrollToBottom()
    }
}
Words.ondrop = async (e) => {
    e.preventDefault()
    var files = e.dataTransfer.files
    handleFile(files)
}
var seed_file = document.getElementById("seed_file")
seed_file.onchange = async (e) => {
    var files = seed_file.files
    handleFile(files)
}
