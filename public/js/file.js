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

export { fileSender, file2base64 }