const router = require('koa-router')()
const tools = require('../tools')

var sources = require('../vals').sources
const SET = require('../vals').SET

// 创建房间
router.get('/cre/:room', async (ctx, next) => {
	var room = ctx.params.room
	if (!(room in sources)) {
		sources[room]={'alive':1}
		console.debug(`[debug] online: ${Object.keys(sources)}`)
		ctx.body = {code:1, mess:'create room'}
	} else {
		ctx.body = {code:-1, mess:'room has been here'}
	}
})

router.get('/ans/:room', async (ctx, next) => {
	var room = ctx.params.room
	if (!(room in sources)) {
		ctx.body = {code:-1, mess:'room not exit'}
		return
	}
	var result = await tools.waitting(()=>{
		return (room in sources && 'ans' in sources[room])
	}, SET.longConTime)
	if (result) {
		ctx.body = {code:1, mess:sources[room]['ans']}
		delete sources[room]		// 清除房间
		console.debug(`[debug] del ${room}`)
	} else {
		// renew
		sources[room]['alive'] = 1
		await tools.delaySec(SET.baseDelayTime)		// 鸽一会
		ctx.body = {code:0, mess:'no ans'}
	}
})

router.get('/off/:room', async (ctx, next) => {
	var room = ctx.params.room
	if (!(room in sources)) {
		ctx.body = {code:-1, mess:'room not exit'}
		return
	}
	var result = await tools.waitting(()=>{
		return (room in sources && 'off' in sources[room])
	}, SET.longConTime)
	if (result == 1) {
		ctx.body = {code:1, mess:sources[room]['off']}
	} else {
		await tools.delaySec(SET.baseDelayTime)
		ctx.body = {code:0, mess:'no off'}
	}
})

// 上传ice
router.post('/:meth/:room', async (ctx, next) => {
	var room = ctx.params.room
	var meth = ctx.params.meth
	if (meth != 'off' && meth != 'ans') {
		ctx.body = {code:-1, mess:'not found'}
		return
	}
	if (!(room in sources)) {
		ctx.body = {code:-1, mess:'room not exit'}
		return
	}
	if (meth in sources[room]) {
		ctx.body = {code:0, mess:'room in use'}
	} else {
		sources[room][meth] = ctx.request.body;
		console.log(`[debug] ${room} ${meth} ans is:${sources[room][meth]}`)
		ctx.body = {code:1, mess:'succ'}
	}
})

module.exports = router.routes()