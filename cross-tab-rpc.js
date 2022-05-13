/*
author: evlon
date:2022/5/2
require: jquery
*/
function CrossTabRpc(tabName) {

    this.tabName = tabName;

    let funName = 0;
    let scope = {};
    let onHandle = {};
    function getNextCallbackName(resove) {
        let retfunc = "cb_" + (funName++);
        scope[retfunc] = resove;

        return retfunc;
    }

    // 接收来自 [#yulinrpc]iframe的tab消息
    window.addEventListener('message', async (e) => {
        let { data, source, origin } = e;
        if (!data)
            return;
        try {

            let dataJson = JSON.parse(JSON.parse(data));
            if (dataJson.type == 'req' && dataJson.to == this.tabName) {
                try {
                    let callData = dataJson.data;
                    let handle = onHandle[callData.method];
                    if (handle) {
                        let ret = await handle.apply(null, callData.args);
                        if (ret) {
                            let respResult = ret;
                            let respData = { fromOrigin: location.origin, type: 'resp', from: this.tabName, to: dataJson.from, data: respResult, fn: dataJson.fn };
                            document.querySelector('#yulinrpc').contentWindow.postMessage(JSON.stringify(respData), "*");
                        }
                    }
                    else {
                        console.warn('ignore req:', callData.method, ' args:', callData.args);
                    }
                }
                catch (e) { }
            }
            else if (dataJson.type == 'resp' && dataJson.to == this.tabName) {
                try {
                    // var rdata = JSON.parse(ev.data);
                    let fn = scope[dataJson.fn];
                    if (fn) {
                        delete scope[dataJson.fn];
                        fn(dataJson.data);                        
                    }
                    else {
                        console.warn('resp waring, receive resp but not found req context.', dataJson);
                    }

                }
                catch (e) { }
            }
        } catch (e) {
            console.error(e,'data:',data);
        }
    });


    this.call = async function (method, args, targetTab, timeout) {
        let promise = new Promise((resove, reject) => {
            let data = { method: method, args: args }
            let timeoutId = setTimeout(() => reject('timeout'), timeout || 20000);
            let newResove = (data)=>{clearTimeout(timeoutId);resove(data);};
            var callData = { fromOrigin: location.origin, type: 'req', from: this.tabName, to: targetTab, data: data, fn: getNextCallbackName(newResove) };
            document.querySelector('#yulinrpc').contentWindow.postMessage(JSON.stringify(callData), "*");
            
        })
        return promise;
    };

    this.on = (method, fn) => {
        onHandle[method] = fn;
    }



}

$('body').append(` <iframe id="yulinrpc" src="https://evlon.github.io/cross-tab-rpc/bridge.html" style="width:0px;height:0px;display:hidden"></iframe>`);
