import SuperAppBridge from './superAppBridge'

const eventNames = [
    'onLoad',
    'onShow',
    'onHide',
    'onLogin',
    'onLogout',
    'onShare',
    'onScrollTo',
    'onPageBack',
    'MESSAGE_RECEIVED', // 收到新消息
    'MESSAGE_WITHDRAW', // 撤回消息
    'CUSTOMSRV_ONLINE', // 客服上线
    'CUSTOMSRV_OFFLINE', // 客服下线
    'CUSTOMSRV_QUEUENUM', // 当前排队数
    'CUSTOMSRV_FINISH', // 客服结束当前会话
    'RECORD_START', // 录音开始
    'RECORD_CHANGE', // 录音改变
    'RECORD_COMPLETE', // 录音完成
    'RECORD_CANCEL', // 取消录音
    'RECORD_FAIL', // 录音失败
    'KEYBOARD_HEIGHT_CHANGE', // 键盘高度变化
]

const methods = [
    'showLoading',
    'hideLoading',
    'toast',
    'alert',
    'modal',
    'actionSheet',
    'onWebReady',
    'navigateURL',
    'navigateTo',
    'navigateBack',
    'previewImage',
    'saveImageToPhotosAlbum',
    'encryptParam',     // 参数需要预先编码 encodeURIComponent(JSON.stringify(param))
    'getUserInfo',
    'tokenInvalid',
    'login',
    'uniApi',
    'emit',
    'statistics',
    'setStatusBarStyle',
    'chooseImage',
    'setWebviewBounces',
    'sendQimoMsg', // 发送消息
    'getChatLists', // 获取消息列表
    'startAudioRecord', // 开始录音
    'stopAudioRecord', // 结束录音
    'cancelAudioRecord', // 取消录音
    'chooseVideo',
    'uploadImage',
    'resetAllUnRead', // 将未读消息设置成已读
    'hideKeyboard',
    'requestMicrophonePermission',
]

function bridgeMethodsBindToXgimi (bridge) {
    window.xgimi = window.xgimi || {}
    for (let i = 0; i < methods.length; i++) {
        const methodName = methods[i]
        window.xgimi[methodName] = (_data) => bridge.callHandler(methodName, _data, true)
    }
    window.xgimi.addBridgeListener = (_data, callback) => bridge.addBridgeListener(_data, callback)
    window.xgimi.removeBridgeListener = (_data, callback) => bridge.removeBridgeListener(_data, callback)
}

export default {
    init(callback) {
        SuperAppBridge.init(eventNames, () => {
            bridgeMethodsBindToXgimi(window.superAppBridge)
            if (typeof callback === 'function') {
                callback(window.xgimi)
            }
        })
    }
    // data () {
    //     return {
    //         scrollThreshold: 0,
    //     }
    // },
    // beforeCreate () {
    //     this.__isBridgeReady = false
    //     this.__compBridgeReadyCalled = false

    //     SuperAppBridge.init(eventNames, () => {
    //         this.__isBridgeReady = true
    //         if (this.bridgeReady) {
    //             bridgeMethodsBindToXgimi(window.superAppBridge)
    //             this.bridgeReady(window.superAppBridge)
    //             this._bridgeReady(window.superAppBridge)
    //             this.__compBridgeReadyCalled = true
    //         }
    //     })
    // },
    // created () {
    //     if (this.__isBridgeReady && !this.__compBridgeReadyCalled) {
    //         bridgeMethodsBindToXgimi(window.superAppBridge)
    //         this.bridgeReady(window.superAppBridge)
    //         this._bridgeReady(window.superAppBridge)
    //         this.__compBridgeReadyCalled = true
    //     }
    // },
    // methods: {
    //     _bridgeReady (bridge) {
    //         this.bridgeReadyMixin && this.bridgeReadyMixin(bridge)
    //         window.superAppBridge.addBridgeListener('onLogin', data => {
    //             this.onLogin && this.onLogin(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onLogout', data => {
    //             this.onLogout && this.onLogout(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onLoad', data => {
    //             this.onLoad && this.onLoad(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onShow', data => {
    //             this.onShow && this.onShow(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onHide', data => {
    //             this.onHide && this.onHide(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onShare', data => {
    //             this.onShare && this.onShare(data)
    //         })
    //         window.superAppBridge.addBridgeListener('onScrollTo', data => {
    //             this.onScrollTo && this.onScrollTo(data)
    //         })

    //         window.addEventListener('scroll', () => {
    //             const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
    //             if (this.onScroll) {
    //                 this.onScroll(scrollTop)
    //             }

    //             if (this.onScrollToBottom) {
    //                 const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
    //                 const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
                    
    //                 if (scrollHeight > clientHeight && scrollTop + clientHeight >= (scrollHeight - this.scrollThreshold)) {
    //                     this.onScrollToBottom()
    //                 }
    //             }
    //         })
    //     },
    // }
}