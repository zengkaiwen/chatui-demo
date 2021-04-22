class SuperAppBridge {

    bridge = null
    registerEvents = new Map()
    _eventNames = []
    eventNum = 0

    constructor(bridge, eventNames) {
        this.bridge = bridge
        this._eventNames = eventNames.concat('registerHandlerWithCallback')
        try {
            this.bridge.registerHandler('Native2JSInteraction', (responseData, responseCallback) => {
                const { rel, data } = responseData
                let _rel = rel, _data = data
                if (~this._eventNames.indexOf(_rel)) {
                    // 兼容安卓无法转发 callback 的情况
                    if (_rel === 'registerHandlerWithCallback') {
                        _rel = _data.rel
                        _data = _data.data
                    }
                    if (this.registerEvents.has(_rel)) {
                        this.registerEvents.get(_rel).forEach((callback) => {
                            if (typeof callback === 'function') {
                                callback(_data, responseCallback)
                            }
                        })
                    }
                }
            })
        } catch (error) {
            console.error(error);
        }
    }

    appendEventNames(eventNames) {
        if (Array.isArray(eventNames)) {
            this._eventNames = this._eventNames.concat(eventNames)
        }
    }

    addBridgeListener(eventName, callback) {
        let callbacks = this.registerEvents.get(eventName) || []
        this.registerEvents.set(eventName, [ ...callbacks, callback])
    }

    removeBridgeListener(eventName, callback) {
        if (this.registerEvents.has(eventName)) {
            let callbacks = this.registerEvents.get(eventName) || []
            let callbackIndex = callbacks.indexOf(callback)
            if (~callbackIndex) {
                callbacks.splice(callbackIndex, 1)
            }
            if (callbacks.length > 0) {
                this.registerEvents.set(eventName, callbacks)
            } else {
                this.registerEvents.delete(eventName)
            }
        }
    }

    callHandler(eventName, data, withCallback) {
        try {
            if (os.isAndroid && withCallback) {
                return new Promise((resolve) => {
                    let handlerId = eventName + (+new Date()) + ('' + this.eventNum++)
                    let callback = (res) => {
                        resolve(res)
                        this.removeBridgeListener(handlerId, callback)
                    }
                    this.addBridgeListener(handlerId, callback)
                    this.bridge.callHandler('JS2NativeInteraction', {
                        rel: 'callHandlerWithCallback',
                        data: {
                            rel: eventName,
                            data: data,
                            handlerId,
                        }
                    })
                })
            }
            return new Promise((resolve) => {
                this.bridge.callHandler('JS2NativeInteraction', {
                    rel: eventName,
                    data: data
                }, (res) => {
                    resolve(res)
                })
            })
        } catch (error) {
            console.error(error);
            return false
        }
    }
}

const os = {
    isAndroid: navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1,
    isIOS: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
}

function setupWebViewJavascriptBridge(callback) {
    if (os.isIOS) {
        if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge); }
        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    } else if (os.isAndroid) {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge)
        } else {
            if (window.WVJBCallbackQueue) {
                window.WVJBCallbackQueue.push(callback)
            } else {
                window.WVJBCallbackQueue = [callback]
            }
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                if (!setupWebViewJavascriptBridge.registered) {
                    setupWebViewJavascriptBridge.registered = true
                    let cbQueue = window.WVJBCallbackQueue
                    for (let i = 0; i < cbQueue.length; i++) {
                        cbQueue[i](window.WebViewJavascriptBridge)
                    }
                }
            }, false)
        }
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    isSuperApp: () => {
        let ua = navigator.userAgent.toLocaleLowerCase();
        let hasSuperStr = !!(~ua.indexOf('superapp'))
        if (hasSuperStr) {
            return (true)
        } else {
            if (os.isIOS && (~ua.indexOf('html5plus') && ~ua.indexOf('uni-app'))) {
                return (true)
            }
        }
        return (false)
    },
    init: (eventNames, callback) => {
        setupWebViewJavascriptBridge(function(bridge) {
            if (window.superAppBridge) {
                if (typeof callback === 'function') {
                    callback(window.superAppBridge)
                    return
                }
            }
            if (bridge) {
                const superAppBridge = new SuperAppBridge(bridge, eventNames)
                window.superAppBridge = superAppBridge
                if (typeof bridge.init === 'function') {
                    bridge.init()
                }
                if (typeof callback === 'function') {
                    callback(superAppBridge)
                }
            }
        })
    }
}