import CONFIG from "../config.js"
const server = CONFIG.EXT_API_SERVER

// 拦截器
async function interceptors(response) {
  var data = await response.json()
  if (data.code == -1) {
    return Promise.reject(new Error(data.mess))
  }
  return data
}

// get和post封装
export default {
  async get(url) {
    var response = await fetch(server+url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
    return interceptors(response)
  },
  async post(url, data) {
    var response = await fetch(server+url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(data)
    })
    return interceptors(response)
  }
}
