/**
 * perf
 *
 * @file index.js
 * @author guyunlong
 */

import {isObjectValueEqual} from './utils';
import Ajax from './ajax.js';

const _performance = window.performance
    || window.webkitPerformance
    || window.mozPerformance

const _MutationObserver = window.MutationObserver 
    || window.WebKitMutationObserver 
    || window.MozMutationObserver;

class Perf {
    constructor() {
        // 性能统计结果
        this.result = {
            type: 1, // 1为页面级数据上报，2为ajax请求数据上报
            isFirstPage: true,
            currentPage: location.href,
            prePagePerf: {},
            prePage: '',
            hashPagePerf: {
                domTimes: []
            },
            firstPagePerf: {}, // 首页性能
            preResourceList: [], // 保存上一次上报资源列表
            resourceList: [], // 本次上报资源列表
            isLastReq: false,
            ajaxMsg: {},
            loadNum: 0,
            ajaxNum: 0,
            errorNum: 0
        }

        // 配置信息
        this.option = {
            // 上报地址
            address: 'http://localhost/api',

            // 脚本延迟上报时间
            outtime: 2000,

            // 不想监控的请求
            filterUrls: []
        }
    }

    /**
     * 配置上传地址等信息
     *
     * @param {obj} opt 配置信息
     */
    config(opt) {
        this.option = Object.assign(this.option, opt);

        return this;
    }

    /**
     * 安装性能监控
     */
    install() {
        if (_performance) {
            window.addEventListener('load', () => {
                // 重写Ajax，拦截请求
                this.rewriteXhr();
                
                // 计算性能
                this.computePerf();

                // 注册dom观察器
                this.registerDomObserver();
            });

            window.addEventListener('hashchange', e => {
                // 地址变化后初始化一些信息，另外会触发dom监听器
                this.result = {
                    ...this.result,
                    type: 1, // 切换地址后为页面级上报
                    prePage: e.oldURL,
                    currentPage: e.newURL,
                    isFirstPage: false,
                    firstPagePerf: {},
                    resourceList: [],
                    hashPagePerf: {
                        domBeginTime: _performance.now(), // 近似当作dom解析时间点，后续优化
                        domTimes: [] // 保存dom变化的时间点
                    }
                }
            });
        }

        return this;
    }

    rewriteXhr() {
        // Ajax插件和perf类没有实现完全解耦，之后优化
        Ajax.install.apply(this);
    }

    computePerf() {
        // 当ajax请求全部处理完之后，计算页面及资源性能
        if (!this.result.isLastReq) {
            return;
        };        

        // 统计页面性能
        this.computePagePerf();

        // 统计资源以及请求性能
        this.computeResourcePerf();

        // 上报数据
        this.send();
    }

    send() {
        const opt = this.option;
        const {
            isFirstPage,
            firstPagePerf,
            hashPagePerf,
            resourceList,
            prePage,
            currentPage,
            type
        } = this.result;

        const params = {
            time: new Date().getTime(),
            type,
            isFirstPage,
            firstPagePerf,
            resourceList,
            prePage,
            currentPage,
            hashPagePerf: {
                domTime: hashPagePerf.domTimes[hashPagePerf.domTimes.length -1]
            }
        };
        
        if (window.fetch) {
            fetch(opt.address, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                type: 'report-data',
                body: JSON.stringify(params)
            });
        }

        // 上报数据后，清除数据
        this.clear();
    }

    /**
     * 注册dom监听器
     */
    registerDomObserver() {
        if (_MutationObserver) {
            let target = document.getElementsByTagName('body')[0]
            let self = this;

            // body后代节点发生变化触发，会触发多次
            this.observer = new _MutationObserver((mutations,observe) => {
                // 首页使用performance统计，hash页使用MutationObserver统计
                if (!self.result.isFirstPage) {
                    let domTime = _performance.now() - self.result.hashPagePerf.domBeginTime;

                    // 监听器会被触发多次，将时间存在数组里，最后一个近似为dom解析时间
                    self.result.hashPagePerf.domTimes.push(domTime);
                }
            });

            // 监控body子节点、后代节点以及属性
            this.observer.observe(target, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

    /**
     * 统计页面性能
     */
    computePagePerf() {
        let t = _performance.timing;

        // 当页面性能发生变化时再统计上报
        if (isObjectValueEqual(t, this.result.prePagePerf)) {
            return;
        }

        // 保存页面性能数据
        this.result.prePagePerf = t;

        let firstPagePerf = {
            // DOM加载完成，用户可操作的时间节点
            domReadyTime: t.domContentLoadedEventEnd - t.navigationStart,
        
            // 页面加载完成的时间
            loadPage : t.loadEventEnd - t.navigationStart,
        
            // 读取页面第一个字节的时间
            ttfb: t.responseStart - t.navigationStart,
        
            //页面解析dom耗时
            domready: t.domComplete - t.domInteractive,
        
            // 重定向的时间
            redirect: t.redirectEnd - t.redirectStart,
        
            // DNS 查询时间
            lookupDomain: t.domainLookupEnd - t.domainLookupStart,
        
            // request请求耗时
            request: t.responseEnd - t.requestStart,
        
            // 执行 onload 回调函数的时间
            loadEvent: t.loadEventEnd - t.loadEventStart,
        
            // DNS 缓存时间
            appcache: t.domainLookupStart - t.fetchStart,
        
            // 卸载页面的时间
            unloadEvent: t.unloadEventEnd - t.unloadEventStart,
        
            // TCP 建立连接完成握手的时间
            connect: t.connectEnd - t.connectStart,
        
            // 准备新页面时间耗时
            readyStart: t.fetchStart - t.navigationStart,
        
            // 请求完毕至DOM加载
            initDomTreeTime: t.domInteractive - t.responseEnd,
        
            // 白屏时间
            whitePage: t.responseStart - t.navigationStart
        };

        this.result.firstPagePerf = firstPagePerf;
    }

    /**
     * 统计资源和请求性能
     */
    computeResourcePerf() {
        let resource = _performance.getEntriesByType('resource');

        // 只上报当前页面资源数据
        let resourceFilter = resource.slice(this.result.preResourceList.length);

        // 保存之前的资源数据
        this.result.preResourceList = resource;
    
        resourceFilter.forEach(item => {
            // 如果资源在过滤列表中，不上报
            let isIgnore = this.option.filterUrls.some(url => item.name.indexOf(url) > -1);
            if (!isIgnore) {
                let json = {
                    name: item.name,
                    method: 'GET',
                    type: item.initiatorType,
                    duration: item.duration.toFixed(2) || 0,
                    decodedBodySize: item.decodedBodySize || 0,
                    nextHopProtocol: item.nextHopProtocol,
                };

                // 如果是ajax请求，添加ajax信息
                let url = item.name.match(/(\S+)\/\/([^\/]+)(\S+)/)[3] || '';
                if (this.result.ajaxMsg[url]) {
                    let ajaxMsg = this.result.ajaxMsg[url];
                    json = {
                        ...json,
                        method: ajaxMsg.method,
                        decodedBodySize: ajaxMsg.decodedBodySize
                    };
                }
                     
                this.result.resourceList.push(json);
            }
        });
    }

    /**
     * 每次上报数据后，重置部分数据
     */
    clear() {
        this.result = {
            ...this.result,
            loadNum: 0,
            ajaxNum: 0,
            errorNum: 0,
            isLastReq: false,
            resourceList: [],
            type: 2 // 第一次上报是页面级上报，之后如果没有切换地址，为ajax上报
        };
    }
}

export default new Perf();
