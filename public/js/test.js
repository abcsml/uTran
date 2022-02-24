import ajax from "./rtc/ajax.js"
import { getRTCOffer } from "./rtc/rtcOffer.js"
import { getRTCAnswer } from "./rtc/rtcAnswer.js"

// const room = 'test'
var a = await ajax.get('/api/get/test')
if (a.code == 0) {
    var rtc = await getRTCOffer('test')
} else {
    var rtc = await getRTCAnswer('test')
}

setTimeout(()=>{
    console.log(rtc)
},1000)

var testDC = rtc.baseDC
testDC.onopen = e => {
    console.log(e)
    testDC.send("hello")
}
testDC.onicecandidate = e => {console.log(e)}
testDC.onmessage = e => {console.log(e)}

setTimeout(()=>{
    testDC.send("..........")
},1000)

export {testDC}

var Words = document.getElementById("words");
var Who = document.getElementById("who");
var TalkWords = document.getElementById("talkwords");
var TalkSub = document.getElementById("talksub");


TalkSub.onclick = function(){
    var str = "";
    if(TalkWords.value == ""){
            
        alert("消息不能为空");
        return;
    }
    if(Who.value == 1){
        
        str = '<div class="atalk"><span>对方:' + TalkWords.value +'</span></div>';
    }
    else{
        str = '<div class="btalk"><span>我:' + TalkWords.value +'</span></div>' ;
    }
    Words.innerHTML = Words.innerHTML + str;

    testDC.send(TalkWords.value)               
}
TalkWords.onkeydown = function(e){
    if (e.keyCode == 13){
        testDC.send("go")
    }
}

testDC.onmessage = (e)=>{
    var str = '<div class="atalk"><span>对方:' + e.data +'</span></div>'
    Words.innerHTML = Words.innerHTML + str;
}
