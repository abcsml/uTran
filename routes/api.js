const router = require('koa-router')()
const tools = require('../tools')

var sources = require('../vals').sources
const SET = require('../vals').SET

// 查询房间是否存在
router.get('/get/:room', async (ctx, next) => {
	var room = ctx.params.room
	if (room in sources) {
		ctx.body = {code:1, mess:'room exist'}
	} else {
		ctx.body = {code:0, mess:'room not exist'}
	}
})

// 创建房间
router.get('/cre/:room', async (ctx, next) => {
	var room = ctx.params.room
	if (!(room in sources)) {
		sources[room]={'alive':1}
		console.log(`[debug] online: ${Object.keys(sources)}`)
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
		sources[room]['alive'] = 0		// 准备清除房间
		setTimeout(()=>{
			delete sources[room]
			console.debug(`[debug] del ${room}`)
		},5*1000)
		// console.debug(`[debug] del ${room}`)
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
	if (result) {
		ctx.body = {code:1, mess:sources[room]['off']}
	} else {
		// renew
		sources[room]['alive'] = 1
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
		ctx.body = {code:-1, mess:'room in use'}
	} else {
		sources[room][meth] = ctx.request.body;
		console.log(`[debug] ${room} ${meth} ans is:`)
		console.log(sources[room][meth])
		ctx.body = {code:1, mess:'succ'}
	}
})

module.exports = router.routes()
