/*
连接前端和后端
*/

import ajax from "./lib/rtc/ajax.js"
import { getRTCOffer } from "./lib/rtc/rtcOffer.js"
import { getRTCAnswer } from "./lib/rtc/rtcAnswer.js"
import chat from "./chat.js"
import { sendMess, getMess, sendFile, getFile } from "./lib/tran.js"
import debug from "./debug.js"

var pathName = document.location.pathname
var room = pathName.substring(1)

if (room == "") {
    room = "chat"
}

var a = await ajax.get('/api/get/'+room)
if (a.code == 0) {
    var rtc = await getRTCOffer(room)
} else {
    var rtc = await getRTCAnswer(room)
}

function conectTimeout(time) {
    setTimeout(()=>{
        if (rtc.iceConnectionState!="connected"&&rtc.iceConnectionState!="completed"){
            rtc.close()
            // alert("连接失败")
            setTimeout(()=>{
                chat.sendInfo("连接失败")
            },100)
        }
    }, time*1000)
}

function testConnect() {
    if (rtc.iceConnectionState == "checking") {
        chat.sendInfo("正在连接")
        conectTimeout(5)
    } else if (rtc.iceConnectionState == "closed") {
        chat.sendInfo("对方断开连接")
    } else if (rtc.iceConnectionState == "disconnected") {
        chat.sendInfo("对方断开连接")
    }
}
// 先测试一下
testConnect()
rtc.oniceconnectionstatechange = e => {
    testConnect()
}

// rtc.onconnectionstatechange = e => {
//     if (rtc.connectionState == "failed") {
//         chat.sendInfo("连接失败")
//         rtc.close()
//     } else if (rtc.connectionState == "connecting") {
//         chat.sendInfo("正在连接")
//     }
// }

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
        fileDCId = Math.max(fileDCId, m.data.fileDCId)
        if (m.data.fileType.includes('image')) {
            var url = await getFile(rtc,m.data,()=>{})
            chat.addImg(m.data.fileName,url)
        } else {
            var fileId = fileNum
            fileNum += 1
            chat.addFile(m.data.fileName,fileId)
            var url = await getFile(rtc,m.data,v=>{
                document.getElementById("pro"+fileId).value=v
            })
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
        fileDCId += 1
        console.log(files[i].type)
        if (files[i].type.includes('image')) {
            await chat.showImg(files[i])
            sendFile(rtc,fileDCId,files[i],()=>{})
        } else {
            var fileId = fileNum
            fileNum += 1
            await chat.showFile(files[i],fileId)
            await sendFile(rtc,fileDCId,files[i],v=>{
                document.getElementById("pro"+fileId).value=v
            })
        }
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

var setting = document.getElementById("setting")
setting.ondblclick = e => {
    debug(rtc,10)
}
