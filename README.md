# Hunter 前端异常捕获

## 使用方法

```
html:
window.__hunter = 'project_id'; //项目id
const error_report = new hunter({
    url: 'http://192.168.19.201:9001/api/error.gif', //上报地址
    delay: 1000, //上报延迟时间 ms 默认值: 3000
    localKey: 'hunter', //localstorage中的key  默认值：'hunter'
    except: ['/^Script error\.?/'], //忽略错误类型 默认值: [ /^Script error\.?/, /^Javascript error: Script error\.? on line 0/ ]
    repeat: 1, //重复次数 (超过该次数不上报) 默认值: 1
    validTime: 7 //localstorage过期时间 天 默认值： 7
});

```