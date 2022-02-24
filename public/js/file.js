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
    var num = Math.ceil(file.size / blockSize)
    for (var i=1;i<=num;i++) {
        var nextSize = Math.min(segment*blockSize, file.size)
        var fileData = file.slice((segment-1)*blockSize, nextSize)
        await sendMethod(JSON.stringify({
            "fileName": file.name,
            "segment": i,
            "nums": num,
            "fileData": await file2base64(fileData)
        }))
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

export {fileSender}