# crosstabrpc
发布一个网页的API，实现另一个网页（可以不同域名，但是必须同一个浏览器）访问。

## Client 网页
let rpc = new CrossTabRpc("client");
let alive = await rpc.call("alive",[],'qcc',500);
let info = await rpc.call('query',[name],'qcc',5000);


## Server 网页
```

let rpc = new CrossTabRpc("qcc");
let qcc = new QccService();

rpc.on('alive', async ()=>{
    return true;
});
rpc.on('query', async (name) => {
    console.log('query ', name);
    $('#logger').append('<p>查询企业:<strong>' + name + '</strong>...</p>');

    let info = await qcc.queryInfo(name);

    let tableInfo = `<p>` + Object.keys(info).map(v=>`<span style="padding-left:20px;"><strong>` + v + `</strong>：` + info[v] + `</span>`).join('') + `</p>`
    $('#logger').append(tableInfo);
    $('#logger p:last').get(0).scrollIntoViewIfNeeded();

    return info;
})

```
