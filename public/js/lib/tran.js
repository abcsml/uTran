/*
主管传输，baseDC是基础，假设所有通道连接正常，不会中断
通过dc传输，open表示开始传输，close表示传输完成
*/

import { file2Buf, combineBuf, getNewUrl } from "./file.js"
import CONFIG from "../config.js"

const segSize = CONFIG.TRAN_SEG_SIZE
const tranSegTimeout = CONFIG.TRAN_SEG_TIMEOUT

function sendMess(baseDC, mess) {
    baseDC.send(JSON.stringify({
        "type": "mess",
        "data": mess
    }))
}
function getMess(mess) {
    return JSON.parse(mess).data
}


// 通知对方要通过fileDCId发送文件
function sendFileAbs(baseDC, fileDCId, file) {
    var segNums = Math.ceil(file.size / segSize)
    baseDC.send(JSON.stringify({
        "type": "file",
        "data":{
            "fileName": file.name,
            "fileSize": file.size,
            "fileType": file.type,
            "segNums": segNums,
            "fileDCId": fileDCId
        }
    }))
}

// 分段发送文件二进制，必须保证顺序
async function sendFileByBuf(fileDC, file, profun) {
    var buf = await file2Buf(file)
    var segNums = Math.ceil(file.size / segSize)
    for (var i=1;i<=segNums;i++) {
        profun(100*(i / segNums))
        await waitting(()=>{
            return fileDC.bufferedAmount < 1000000
        },60*5)
        var nextSize = Math.min(i*segSize, buf.byteLength)
        var bufData = buf.slice((i-1)*segSize, nextSize)
        fileDC.send(bufData)
        // console.log(fileDC.bufferedAmount)
    }
}

// 通过fileDC发送，对方返回OK再close
async function sendFile(rtc, fileDCId, file, profun) {
    var segNums = Math.ceil(file.size / segSize)
    var fileDC = rtc.createDataChannel("file",{
        negotiated: true,
        id: fileDCId
    })
    sendFileAbs(rtc.baseDC,fileDCId,file)
    fileDC.onopen = (e) => {
        sendFileByBuf(fileDC, file, profun)
    }
    return new Promise(function(resolve, reject) {
        fileDC.onmessage = (e) => {
            if (e.data == "OK") {
                fileDC.close()
                console.log("send success")
                resolve(true)
            }
        }
        setTimeout(() => {      // 说明网络过慢
            fileDC.close()
            resolve(false)
        }, segNums*tranSegTimeout)
    })
}

// 从特定DC获取file，返回blob链接，progress
async function getFile(rtc, fileAbs, profun) {
    var fileDC = rtc.createDataChannel("file",{
        negotiated: true,
        id: fileAbs.fileDCId
    })
    var count = 0
    var bufs = []
    return new Promise(function(resolve, reject) {
        fileDC.onmessage = (e) => {
            bufs.push(e.data)
            count += 1
            profun(100*(count / fileAbs.segNums))
            if (count == fileAbs.segNums) {
                fileDC.send("OK")
                var buf = combineBuf(bufs,fileAbs.fileSize)
                resolve(getNewUrl(buf,fileAbs.type))
            }
        }
        fileDC.onclose = (e) => {
            resolve(false)
        }
    })
}

export { sendMess, getMess, sendFile, getFile }

async function waitting(f, outtime) {
    return new Promise(function(resolve, reject) {
        if (f()) {
            resolve(true)
            return
        }
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