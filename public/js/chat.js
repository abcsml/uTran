/*
提供界面服务

文件默认用Blob
*/
import { file2Buf, getNewUrl } from "./file.js"

var Words = document.getElementById("words")

function messBox(mess, name, who="atalk") {
    return `
    <div class="${who}"><span>${name}${mess}</span></div>`
}
function imgBox(imgName, url, who="atalk") {
    return `
    <div class="${who}"><span>
        <img src="${url}" style="max-width:300px; max-height:300px;"/>
    </span></div>`
}
function fileBox(fileName, urlId, progressId, who="atalk") {
    return `
    <div class="${who}"><span>
        <img alt="file" width=30 height=40 src="assets/file-earmark-arrow-down.svg"/>
        <div class="file_box">
            <a float=right>${fileName.substring(0,8)}</a>
            <div>
                <progress id="${progressId}" value="0" max="100"></progress>
            </div>
        </div>
        <a id="${urlId}" download="${fileName}"></a>
    </span></div>`
}

export default {
    showMess(mess, name) {
        Words.innerHTML += messBox(mess,name,"btalk")
    },
    addMess(mess, name) {
        Words.innerHTML += messBox(mess,name)
    },
    async showImg(img) {
        var url = getNewUrl(await file2Buf(img),img.type)
        Words.innerHTML += imgBox(img.name,url,"btalk")
    },
    addImg(imgName, url) {
        Words.innerHTML += imgBox(imgName,url)
    },
    async showFile(file, fileId) {
        var url = getNewUrl(await file2Buf(file),file.type)
        Words.innerHTML += fileBox(file.name,"url"+fileId,"pro"+fileId,"btalk")
        var pro = document.getElementById("pro"+fileId)
        var herf = document.getElementById("url"+fileId)
        pro.value = 100
        herf.setAttribute("herf",url)
    },
    addFile(fileName, fileId) {
        Words.innerHTML += fileBox(fileName,"url"+fileId,"pro"+fileId)
    },
    sendInfo(message) {
        var h2 = document.getElementById("info")
        h2.textContent = message
    },
    scrollToBottom() {
        var a = document.getElementById("bottom_anchor")
        // var distance = 20+a.offsetTop-document.documentElement.scrollTop
        var distance = a.offsetTop
        window.scrollTo({top:distance,behavior:'smooth'})
    }
}
