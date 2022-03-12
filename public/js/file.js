// 读文件
function file2base64(file){
    return new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.readAsDataURL(file,'utf8')
        reader.onload = function(){
            resolve(this.result)
        }
    })
}

async function fileSender(sendMethod, file, blockSize=32*8*1024) {
    var fileDataURL = await file2base64(file)
    var num = Math.ceil(fileDataURL.length / blockSize)
    for (var segment=1;segment<=num;segment++) {
        var nextSize = Math.min(segment*blockSize, fileDataURL.length)
        var fileData = fileDataURL.substring((segment-1)*blockSize, nextSize)
        // var a = await file2base64(fileData)
        await sendMethod(JSON.stringify({
            "fileName": file.name,
            "segment": segment,
            "nums": num,
            "fileData": fileData
        }),segment/num*100)
    }
}

// 分片
function silceFile(file, segment, blockSize) {
    // var blockNum = Math.ceil(file.size / blockSize)
    var nextSize = Math.min(segment*blockSize, file.size)
    var fileData = file.slice((segment-1)*blockSize, nextSize)
    return fileData
}
// 校验

export { fileSender, file2base64}


// -----

function file2Buf(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = function(){
            resolve(this.result)
        }
    })
}
/*
先告诉对方文件基本信息，然后连着发送
不能并行
sendMethod 必须按顺序发送，同时支持string与ArrayBuffer
*/
async function arrBufSender(sendMethod, file, blockSize=32*8*1024) {
    var arrBuf = await file2ArrBuf(file)
    console.log(arrBuf)
    var segments = Math.ceil(arrBuf.byteLength / blockSize)
    await sendMethod(JSON.stringify({
        "fileName": file.name,
        "segments": segments,
        "totalLength": arrBuf.byteLength
    }))
    for (var i=1;i<=segments;i++) {
        var nextSize = Math.min(i*blockSize, arrBuf.byteLength)
        var arrBufData = arrBuf.slice((i-1)*blockSize, nextSize)
        sendMethod(arrBufData)
    }
}
function combineBuf(arrBufs,totalLength) {
    var result = new Uint8Array(totalLength)
    var offset = 0
    for (var i of arrBufs) {
        var view = new Uint8Array(i)
        result.set(view, offset)
        offset += view.length
    }
    return result.buffer
}
function getNewUrl(buf, mime) {
    return URL.createObjectURL(new Blob([buf], {type: mime}))
}

export { file2Buf, arrBufSender, combineBuf, getNewUrl }