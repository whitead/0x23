!function(e,o,n,d,r){var t="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i="function"==typeof t.parcelRequirea706&&t.parcelRequirea706,l=i.cache||{},a="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function c(o,n){if(!l[o]){if(!e[o]){var d="function"==typeof t.parcelRequirea706&&t.parcelRequirea706;if(!n&&d)return d(o,!0);if(i)return i(o,!0);if(a&&"string"==typeof o)return a(o);var r=new Error("Cannot find module '"+o+"'");throw r.code="MODULE_NOT_FOUND",r}f.resolve=function(n){var d=e[o][1][n];return null!=d?d:n},f.cache={};var u=l[o]=new c.Module(o);e[o][0].call(u.exports,f,u,u.exports,this)}return l[o].exports;function f(e){var o=f.resolve(e);return!1===o?{}:c(o)}}c.isParcelRequire=!0,c.Module=function(e){this.id=e,this.bundle=c,this.exports={}},c.modules=e,c.cache=l,c.parent=i,c.register=function(o,n){e[o]=[function(e,o){o.exports=n},{}]},Object.defineProperty(c,"root",{get:function(){return t.parcelRequirea706}}),t.parcelRequirea706=c;for(var u=0;u<o.length;u++)c(o[u]);var f=c(n);"object"==typeof exports&&"undefined"!=typeof module?module.exports=f:"function"==typeof define&&define.amd&&define((function(){return f}))}({e2GVl:[function(e,o,n){importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js");const d={decoder:e=>null,encoder:e=>null,pyodideLoaded:"loading",selfiesLoaded:"loading"};onmessage=e=>{const o=e.data,n=o[0],r=o[1];let t="";"loading-status"===n?t={pyodide:d.pyodideLoaded,selfies:d.selfiesLoaded}:"encoder"===n?t=d.encoder(o[2]):"decoder"===n&&(t=d.decoder(o[2])),postMessage([n,r,t])},loadPyodide().then((e=>{d.pyodideLoaded="loaded",e.loadPackage("micropip").then((()=>{e.runPythonAsync("\n            import micropip\n            await micropip.install('selfies==2')\n            from selfies import encoder, decoder\n        ",(e=>{d.pyodideLoaded="failed",d.selfiesLoaded="failed"})).then((()=>{d.selfiesLoaded="loaded";const o=e.globals.get("decoder");d.decoder=e=>{try{return o(e)}catch(e){return console.log(e),null}};const n=e.globals.get("encoder");d.encoder=e=>{try{return n(e)}catch(e){return console.log(e),null}}}))}),(e=>{d.selfiesLoaded="failed"}))}))},{}]},["e2GVl"],"e2GVl");
//# sourceMappingURL=selfies_worker.257d27b9.js.map