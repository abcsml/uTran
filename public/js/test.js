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

var testDC = rtc.baseDC
testDC.onopen = e => {
    console.log(e)
    testDC.send("hello")
}
testDC.onicecandidate = e => {console.log(e)}
testDC.onmessage = e => {console.log(e)}



export {testDC}