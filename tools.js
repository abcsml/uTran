function sourcesGC(sources, gcTime) {
    setInterval(function(){
        for(room in sources) {
            if (sources[room]['alive'] == 1) {
                sources[room]['alive'] = 0
            } else {
                delete sources[room]
                console.log(`[debug] del ${room}`)
            }
        }
    }, gcTime*1000)
}
async function delaySec(time) {
	return new Promise(function(resolve, reject) {
		setTimeout(function(){
			resolve()
		}, time)
	})
}
async function waitting(f, outtime) {
    return new Promise(function(resolve, reject) {
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
function getIpAddress() {
    const os = require('os');
    var ifaces=os.networkInterfaces()
    for (var dev in ifaces) {
        let iface = ifaces[dev]
        for (let i = 0; i < iface.length; i++) {
            let {family, address, internal} = iface[i]
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                return address
            }
        }
    }
}
module.exports = {
    sourcesGC,
    delaySec,
    waitting,
    getIpAddress
}
