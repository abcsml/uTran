/*
提供界面服务

文件默认用Blob
*/
import { file2Buf, getNewUrl } from "./file.js"

var Words = document.getElementById("words")
var Anchor = document.getElementById("bottom_anchor")

function messBox(mess, name, who="atalk") {
    var div = document.createElement("div")
    div.setAttribute("class",who)
    div.innerHTML += `<span>${name}${mess}</span>`
    return div
}
function imgBox(imgName, url, who="atalk") {
    var div = document.createElement("div")
    div.setAttribute("class",who)
    div.innerHTML += `<span>
        <img src="${url}" style="max-width:300px; max-height:300px;"/>
    </span>`
    return div
}
function fileBox(fileName, urlId, progressId, who="atalk") {
    var div = document.createElement("div")
    div.setAttribute("class",who)
    div.innerHTML += `
    <span class="filed" title="点击下载文件" onclick="document.getElementById('${urlId}').click()">
        <img alt="file" width=30 height=40 src="assets/file-earmark-arrow-down.svg"/>
        <div class="file_box">
            <a float=right>${fileName.substring(0,8)}</a>
            <div>
                <progress id="${progressId}" value="0" max="100"></progress>
            </div>
        </div>
        <a id="${urlId}" download="${fileName}"></a>
    </span>`
    return div
}

export default {
    showMess(mess, name) {
        Words.insertBefore(messBox(mess,name,"btalk"),Anchor)
    },
    addMess(mess, name) {
        Words.insertBefore(messBox(mess,name),Anchor)
    },
    async showImg(img) {
        var url = getNewUrl(await file2Buf(img),img.type)
        Words.insertBefore(imgBox(img.name,url,"btalk"),Anchor)
    },
    addImg(imgName, url) {
        Words.insertBefore(imgBox(imgName,url),Anchor)
    },
    async showFile(file, fileId) {
        var url = getNewUrl(await file2Buf(file),file.type)
        Words.insertBefore(fileBox(file.name,"url"+fileId,"pro"+fileId,"btalk"),Anchor)
        var pro = document.getElementById("pro"+fileId)
        var herf = document.getElementById("url"+fileId)
        // pro.value = 100
        herf.setAttribute("href",url)
    },
    addFile(fileName, fileId) {
        Words.insertBefore(fileBox(fileName,"url"+fileId,"pro"+fileId),Anchor)
    },
    sendInfo(message) {
        var h2 = document.getElementById("info")
        h2.textContent = message
    },
    scrollToBottom() {
        setTimeout(()=>{
            Anchor.scrollIntoView({behavior:"smooth"})
        },5)
    }
}
