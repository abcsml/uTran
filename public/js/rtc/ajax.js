instance = axios.create()

// http request 拦截器
instance.interceptors.request.use(
    config => {
      const token = sessionStorage.getItem('token')
      if (token ) { // 判断是否存在token，如果存在的话，则每个http header都加上token
        config.headers.authorization = token  //请求头加上token
      }
      return config
    },
    err => {
      return Promise.reject(err)
    })


export const instance = instance