# fe-monitor-perf
前端性能监控采集sdk

# 安装
### npm安装
```
$ npm install fe-monitor-perf
```

### CDN

```
<script src="https://cdn.jsdelivr.net/npm/fe-monitor-perf@(version)/lib/perf.js"></script>
<!-- 例如 -->
<script src="https://cdn.jsdelivr.net/npm/fe-monitor-perf@1.0.0-rc.1/lib/perf.js"></script>
```

# 使用方式
```js
import Perf from 'perf';

Perf.install({
    url: 'http://some.com/api',
    delay: 1000,
    ignoreUrls: ['/api/...'],
    random: 1 
});
```

# 配置参数
参数名 | 描述 |  类型 
-|-|-
url | 上报地址 | string |
delay | 上报延迟时间 | int |
ignoreUrls | 不想监控的静态资源或者请求 | array |
random | 抽样上报（0-1） | float |


# 上报数据格式

```json
    {
        "type": 1,
        "time": 1566527694723,
        "isFirstPage": false,
        "currentPage": "http://0.0.0.0:8889/#/process/list",
        "prePage": "http://localhost.bcetest.baidu.com:8889/demo",
        "firstPagePerf": {
            "appcache": 0,
            "connect": 0,
            "userReady": 166,
            "domReady": 548,
            "initDomTree": 154,
            "loadEvent": 0,
            "loadPage": 714,
            "lookupDomain": 0,
            "readyStart": 4,
            "redirect": 0,
            "request": 5,
            "ttfb": 9,
            "unloadEvent": 0,
            "whitePage": 109
        },
        "hashPagePerf": {
            "domTime": 225.9900000062771
        },
        "resourceList": [
            {
                "decodedBodySize": 6376,
                "duration": "14.87",
                "method": "GET",
                "name": "https://bce.bdstatic.com/console/dist/img/process.svg",
                "nextHopProtocol": "h2",
                "type": "css"
            },
            {
                "decodedBodySize": 4402,
                "duration": "5.06",
                "method": "GET",
                "name": "http://0.0.0.0:8889/api/process/list?pageNo=1&pageSize=10",
                "nextHopProtocol": "http/1.1",
                "type": "xmlhttprequest"
            }
        ]
    }
```
# 上报参数说明
参数名 | 描述 |  类型 
-|-|-
id | 上报id | string |
type | 上报类型，1为页面级上报，2为ajax上报 | int |
time | 时间戳 | string |
isFirstPage | 是否为首页 | bool |
currentPage | 当前页面 | string |
prePage | 前一个页面 | string |
firstPagePerf | 首页性能 | object |
   --appcache | DNS缓存时间 | int |
--connect | TCP建立连接完成握手的时间 | int |
--userReady | 用户可操作的时间节点 | int |
--domReady | 页面解析dom耗时 | int |
--initDomTree | 请求完毕至DOM加载 | int |
--loadEvent | 执行 onload 回调函数的时间 | int |
--loadPage | 页面加载完成的时间 | int |
--lookupDomain | DNS查询时间 | int |
--readyStart | 准备新页面时间耗时 | int |
--redirect | 重定向的时间 | int |
--request | request请求耗时 | int |
--ttfb | 读取页面第一个字节的时间 | int |
--unloadEvent | 卸载页面的时间 | int |
--whitePage | 白屏时间 | int |
hashPagePerf | 路由页的性能 | object |
--domTime | dom解析时间 | string |
resourceList | 资源以及ajax请求性能 | array |
--decodedBodySize | 响应数据长度 | int |
--duration | 耗时 | int |
--method | 请求方法GET/POST | string |
--name | 资源链接 | string |
--nextHopProtocol | 网络协议 | string |
--type | 资源类型（img/css/xmlhttprequest...) | string |
