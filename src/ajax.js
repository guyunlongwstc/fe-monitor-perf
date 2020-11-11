/**
 * 重写Ajax请求
 *
 * @file ajax.js
 * @author guyunlong(guyunlong@baidu.com)
 */


/**
 * 重写Ajax
 *
 * @param {obj} proxy 重写函数对象
 */
function _Ajax(proxy) {
    // 保存真正的XMLHttpRequest对象
    window._ahrealxhr = window._ahrealxhr || window.XMLHttpRequest;

    // 覆盖全局XMLHttpRequest，代理对象
    window.XMLHttpRequest = function () {

        //创建真正的XMLHttpRequest实例
        this.xhr = new window._ahrealxhr;
        for (let attr in this.xhr) {
            let type = "";
            try {
                type = typeof this.xhr[attr];
            } catch (e) { }
            if (type === "function") {

                // 代理方法(open、send...)
                this[attr] = hookfun(attr);
            } else {

                // 代理属性(onreadystatechange...)
                Object.defineProperty(this, attr, {
                    get: getFactory(attr),
                    set: setFactory(attr)
                });
            }
        }
    }

    /**
     * xhr对象属性getter
     *
     * @param {string} attr 重写属性
     */
    function getFactory(attr) {

        return function () {
            // 如果没有重写，重写属性
            let v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
            let attrGetterHook = (proxy[attr] || {})["getter"];

            return attrGetterHook && attrGetterHook(v, this) || v;
        }
    }

    /**
     * xhr对象属性setter
     *
     * @param {string} attr setter属性
     */
    function setFactory(attr) {
        return function (v) {
            let xhr = this.xhr;
            let self = this;
            let hook = proxy[attr];
            if (typeof hook === "function") {
                xhr[attr] = function () {
                    proxy[attr](self) || v.apply(xhr, arguments);
                }
            } else {
                let attrSetterHook = (hook || {})["setter"];
                v = attrSetterHook && attrSetterHook(v, self) || v;
                try {
                    xhr[attr] = v;
                } catch (e) {
                    this[attr + "_"] = v;
                }
            }
        }
    }

    function hookfun(fun) {
        return function () {
            let args = [].slice.call(arguments);

            // 如果fun拦截函数存在，则先调用拦截函数
            if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
                return;
            }

            // 调用真正的xhr方法
            return this.xhr[fun].apply(this.xhr, args);
        }
    }

    return window._ahrealxhr;
}

const Ajax = {
    install: function() {
        let self = this;
        _Ajax({
            onreadystatechange: function (xhr) {
                if (xhr.readyState === 4) {
                    // 不想监控的请求不上报
                    let isIgnore = self.option.filterUrls.some(url => xhr.responseURL.indexOf(url) > -1);
                    if (isIgnore) {
                        return;
                    }

                    // 统计ajax信息
                    let url = xhr.responseURL && xhr.responseURL.match(/(\S+)\/\/([^\/]+)(\S+)/)[3] || '';
                    if (self.result.ajaxMsg[url]) {
                        self.result.ajaxMsg[url]['decodedBodySize'] = xhr.responseText.length;
                    }
                    
                    // 两次响应间隔超过2s近似认为最后一个请求
                    clearTimeout(self.timer)
                    self.timer = setTimeout(() => {
                        self.result.isLastReq = true;
                        self.computePerf();
                    }, self.option.outtime);

                    self.result.loadNum += 1;
                }
            },

            onerror: function (xhr) {
                self.result.errorNum += 1;
                self.computePerf();
            },

            open: function (args, xhr) {
                // 统计xhr请求数量
                self.result.ajaxNum += 1;

                // 统计ajax请求信息
                self.result.ajaxMsg[args[1]] = {
                    method: args[0],
                    url: args[1]
                }
            }
        })
    }
};

export default Ajax;
