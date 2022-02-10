const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
const cors = require('koa2-cors')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')

var vals = require('./vals')
var sourcesGC = require('./tools').sourcesGC

// error handler
onerror(app, {redirect: '/error.html'})

// middlewares
app.use(bodyparser({enableTypes:['json', 'form', 'text']}))
app.use(cors())     // 跨域
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
router.use('/api', require('./routes/api'))
router.use('', require('./routes/index'))
app.use(router.routes())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

// start GC
sourcesGC(vals.sources, vals.SET.gcInterTime)

// listen
app.listen(4000,()=>{
	console.log('server started at port 4000....')
})