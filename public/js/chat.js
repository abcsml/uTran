/*
为界面服务

baseDC : 普通消息
picDC : 图片
fileDC : 文件
*/
export default {
    baseBox(message, name, who="atalk") {
        return `<div class="${who}"><span>${name}${message}</span></div>`
    },
    imgBox(imgBase64, who="atalk") {
        return `<div class="${who}"><span>
            <img src="${imgBase64}" style="max-width:300px; max-height:300px;"/>
        </span></div>`
    },
    fileBox(fileName, progressId, who="atalk") {
        fileName = fileName.substring(0,8)
        return `<div class="${who}"><span>
        <img alt="file" width=30 height=40 src="https://icons.bootcss.com/assets/icons/file-earmark-arrow-down.svg"/>
            <div class="file_box">
                <a float=right>${fileName}</a><div><progress id="${progressId}" value="0" max="100"></progress></div>
            </div>
        </span></div>`
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

// export { baseBox, imgBox, fileBox, sendInfo }