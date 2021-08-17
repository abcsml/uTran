// 读文件
function file2base64(){
    return new Promise(function(resolve, reject) {
        var reader = new FileReader()
        reader.readAsDataURL($('#infile')[0].files[0],'utf8')
        reader.onload = function(){
            resolve(this.result)
        }
    })
}
// 分片

// 校验