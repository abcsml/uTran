var sources = {}

const SET = {
  // deadLine:10,       // min
  gcInterTime: 21,      // 回收器回收间隔
  baseDelayTime: 0.5,   // 延迟响应时间
  longConTime: 10,      // 等待函数默认等待时间
  blockRoom: [
    '/favicon.ico',
    '/cre',
    '/off',
    '/ans'
  ]
}

module.exports = {
  sources,
  SET
}