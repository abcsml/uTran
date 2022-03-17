const router = require('koa-router')()
const fs = require("fs")

// const tools = require('../tools')
var sources = require('../vals').sources
const SET = require('../vals').SET

router.get(SET.blockRoom, async (ctx, next) => {
	ctx.set("Content-Type", "text/html;charset=utf-8")
	ctx.body = '<h1>not allow<h1>'
})

router.get(['/:room'], async (ctx, next) => {
	ctx.set("Content-Type", "text/html;charset=utf-8")
	var room = ctx.params.room
	if (room in sources) {		// answer
		var htmlContent = fs.readFileSync("public/chat.html")
		ctx.body = htmlContent;
	} else {								// offer
		var htmlContent = fs.readFileSync("public/chat.html")
		ctx.body = htmlContent
	}
})

router.get('/', async (ctx, next) => {
	ctx.set("Content-Type", "text/html;charset=utf-8")
	ctx.body = fs.readFileSync("public/chat.html")
})

module.exports = router.routes()
