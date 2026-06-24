import{g as de,E as pe,n as fe,s as me,b as h,d as U,o as v,_ as b,j as t,V as l,p as he,H as ve,f as be,q as z,i as ge,S as xe,v as we,w as ye,e as Ee,x as Ce,X as je,y as Se,z as Be,A as Fe,B as y,D as m,F as ke,G as K,J as Q,r as T,K as _e,M as Ne,N as Pe,O as Te,P as Ae,Q as De,U as Z,W as A}from"./vendors.cd61e287.js";import{c as H,P as He,B as S,C as Oe,a as ze,b as D,d as Re,e as Le,t as V,T as Ie}from"./common.b3b475c5.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function r(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=r(a);fetch(a.href,o)}})();var Me=`
/* H5 端隐藏 TabBar 空图标（只隐藏没有 src 的图标） */
.weui-tabbar__icon:not([src]),
.weui-tabbar__icon[src=''] {
  display: none !important;
}

.weui-tabbar__item:has(.weui-tabbar__icon:not([src])) .weui-tabbar__label,
.weui-tabbar__item:has(.weui-tabbar__icon[src='']) .weui-tabbar__label {
  margin-top: 0 !important;
}

/* Vite 错误覆盖层无法选择文本的问题 */
vite-error-overlay {
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: text !important;
}

vite-error-overlay::part(window) {
  max-width: 90vw;
  padding: 10px;
}

.taro_page {
  overflow: auto;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* H5 导航栏页面自动添加顶部间距 */
body.h5-navbar-visible .taro_page {
  padding-top: 44px;
}

body.h5-navbar-visible .toaster[data-position^="top"] {
  top: 44px !important;
}

/* Sheet 组件在 H5 导航栏下的位置修正 */
body.h5-navbar-visible .sheet-content:not([data-side="bottom"]) {
    top: 44px !important;
}

/*
 * H5 端 rem 适配：与小程序 rpx 缩放一致
 * 375px 屏幕：1rem = 16px，小程序 32rpx = 16px
 */
html {
    font-size: 4vw !important;
}

/* H5 端组件默认样式修复 */
taro-view-core {
    display: block;
}

taro-text-core {
    display: inline;
}

taro-input-core {
    display: block;
    width: 100%;
}

taro-input-core input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
}

taro-input-core.taro-otp-hidden-input input {
    color: transparent;
    caret-color: transparent;
    -webkit-text-fill-color: transparent;
}

/* 全局按钮样式重置 */
taro-button-core,
button {
    margin: 0 !important;
    padding: 0 !important;
    line-height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
}

taro-button-core::after,
button::after {
    border: none;
}

taro-textarea-core > textarea,
.taro-textarea,
textarea.taro-textarea {
    resize: none !important;
}
`,We=`
/* PC 宽屏适配 - 基础布局 */
@media (min-width: 769px) {
  html {
    font-size: 15px !important;
  }

  body {
    background-color: #f3f4f6 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    min-height: 100vh !important;
  }
}
`,Ue=`
/* PC 宽屏适配 - 手机框样式（有 TabBar 页面） */
@media (min-width: 769px) {
  .taro-tabbar__container {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    transform: translateX(0) !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .taro-tabbar__panel {
    height: 100% !important;
    overflow: auto !important;
  }
}

/* PC 宽屏适配 - Toast 定位到手机框范围内 */
@media (min-width: 769px) {
  body .toaster {
    left: 50% !important;
    right: auto !important;
    width: 375px !important;
    max-width: 375px !important;
    transform: translateX(-50%) !important;
    box-sizing: border-box !important;
  }
}

/* PC 宽屏适配 - 手机框样式（无 TabBar 页面，通过 JS 添加 no-tabbar 类） */
@media (min-width: 769px) {
  body.no-tabbar #app {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
    transform: translateX(0) !important;
  }

  body.no-tabbar #app .taro_router {
    height: 100% !important;
    overflow: auto !important;
  }
}
`;function Ve(){var i=document.createElement("style");i.innerHTML=Me+We+Ue,document.head.appendChild(i)}function $e(){var i=function(){var n=!!document.querySelector(".taro-tabbar__container");document.body.classList.toggle("no-tabbar",!n)};i();var e=new MutationObserver(i);e.observe(document.body,{childList:!0,subtree:!0})}function qe(){Ve(),$e()}function Xe(){var i=de();if(i===pe.WEAPP)try{var e=fe(),r=e.miniProgram.envVersion;console.log("[Debug] envVersion:",r),r!=="release"&&me({enableDebug:!0})}catch(n){console.error("[Debug] 开启调试模式失败:",n)}}var Ye={visible:!1,title:"",bgColor:"#ffffff",textStyle:"black",navStyle:"default",transparent:"none",leftIcon:"none"},Ge=function(){var e,r=z();return(r==null||(e=r.config)===null||e===void 0?void 0:e.window)||{}},Je=function(){var e,r,n=(e=z())===null||e===void 0||(e=e.config)===null||e===void 0?void 0:e.tabBar;return new Set((n==null||(r=n.list)===null||r===void 0?void 0:r.map(function(a){return a.pagePath}))||[])},$=function(){var e,r=z();return(r==null||(e=r.config)===null||e===void 0||(e=e.pages)===null||e===void 0?void 0:e[0])||"pages/index/index"},F=function(e){return e.replace(/^\//,"")},Ke=function(e,r,n,a){if(!e)return"none";var o=F(e),s=F(a),f=o===s,u=r.has(o)||r.has("/".concat(o)),d=n>1;return u||f?"none":d?"back":"home"},Qe=function(){var e=h.useState(Ye),r=U(e,2),n=r[0],a=r[1],o=h.useState(0),s=U(o,2),f=s[0],u=s[1],d=h.useCallback(function(){var c=v.getCurrentPages();if(c.length===0){a(function(ce){return b(b({},ce),{},{visible:!1})});return}var p=c[c.length-1],I=(p==null?void 0:p.route)||"";if(I){var g=(p==null?void 0:p.config)||{},x=Ge(),C=Je(),se=$(),j=F(I),M=F(se),le=j===M,ue=C.has(j)||C.has("/".concat(j)),W=C.size<=1&&c.length<=1&&(le||ue);a({visible:!W,title:document.title||g.navigationBarTitleText||x.navigationBarTitleText||"",bgColor:g.navigationBarBackgroundColor||x.navigationBarBackgroundColor||"#ffffff",textStyle:g.navigationBarTextStyle||x.navigationBarTextStyle||"black",navStyle:g.navigationStyle||x.navigationStyle||"default",transparent:g.transparentTitle||x.transparentTitle||"none",leftIcon:W?"none":Ke(j,C,c.length,M)})}},[]);v.useDidShow(function(){d()}),v.usePageScroll(function(c){var p=c.scrollTop;n.transparent==="auto"&&u(Math.min(p/100,1))}),h.useEffect(function(){var c=null,p=new MutationObserver(function(){c&&clearTimeout(c),c=setTimeout(function(){d()},50)});return p.observe(document.head,{subtree:!0,childList:!0,characterData:!0}),d(),function(){p.disconnect(),c&&clearTimeout(c)}},[d]);var P=n.visible&&n.navStyle!=="custom";if(h.useEffect(function(){P?document.body.classList.add("h5-navbar-visible"):document.body.classList.remove("h5-navbar-visible")},[P]),!P)return t.jsx(t.Fragment,{});var L=n.textStyle==="white"?"#fff":"#333",te=n.textStyle==="white"?"text-white":"text-gray-800",ae=function(){return n.transparent==="always"?{backgroundColor:"transparent"}:n.transparent==="auto"?{backgroundColor:n.bgColor,opacity:f}:{backgroundColor:n.bgColor}},oe=function(){return v.navigateBack()},ie=function(){var p=$();v.reLaunch({url:"/".concat(p)})};return t.jsxs(t.Fragment,{children:[t.jsxs(l,{className:"fixed top-0 left-0 right-0 h-11 flex items-center justify-center z-1000",style:ae(),children:[n.leftIcon==="back"&&t.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:oe,children:t.jsx(he,{size:24,color:L})}),n.leftIcon==="home"&&t.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:ie,children:t.jsx(ve,{size:22,color:L})}),t.jsx(be,{className:"text-base font-medium max-w-3/5 truncate ".concat(te),children:n.title})]}),t.jsx(l,{className:"h-11 shrink-0"})]})},Ze=function(e){var r=e.children;return t.jsxs(t.Fragment,{children:[t.jsx(Qe,{}),r]})},er=["className","children","orientation"],ee=h.forwardRef(function(i,e){var r=i.className,n=i.children,a=i.orientation,o=a===void 0?"vertical":a,s=ge(i,er),f=o==="horizontal"||o==="both",u=o==="vertical"||o==="both";return t.jsx(xe,b(b({ref:e,className:H("relative",r),scrollY:u,scrollX:f,style:{overflowX:f?"auto":"hidden",overflowY:u?"auto":"hidden"}},s),{},{children:n}))});ee.displayName="ScrollArea";var rr={error:null,report:"",source:"",visible:!1,open:!1,timestamp:""},q="hsl(360, 100%, 45%)",X=!1,k=rr,O=new Set,nr=function(){O.forEach(function(e){return e()})},tr=function(e){return O.add(e),function(){return O.delete(e)}},Y=function(){return k},re=function(e){k=e,nr()},ar=function(){var i=y(m().m(function e(r){var n,a,o,s,f;return m().w(function(u){for(;;)switch(u.p=u.n){case 0:if(typeof window!="undefined"){u.n=1;break}return u.a(2,!1);case 1:if(u.p=1,!((n=navigator.clipboard)!==null&&n!==void 0&&n.writeText)){u.n=3;break}return u.n=2,navigator.clipboard.writeText(r);case 2:return u.a(2,!0);case 3:u.n=5;break;case 4:u.p=4,s=u.v,console.warn("[H5ErrorBoundary] Clipboard API copy failed:",s);case 5:return u.p=5,a=document.createElement("textarea"),a.value=r,a.setAttribute("readonly","true"),a.style.position="fixed",a.style.opacity="0",document.body.appendChild(a),a.select(),o=document.execCommand("copy"),document.body.removeChild(a),u.a(2,o);case 6:return u.p=6,f=u.v,console.warn("[H5ErrorBoundary] Fallback copy failed:",f),u.a(2,!1)}},e,null,[[5,6],[1,4]])}));return function(r){return i.apply(this,arguments)}}(),or=function(e){if(e instanceof Error)return e;if(typeof e=="string")return new Error(e);try{return new Error(JSON.stringify(e))}catch(r){return new Error(String(e))}},ir=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=["[H5 Runtime Error]","Time: ".concat(new Date().toISOString()),r.source?"Source: ".concat(r.source):"","Name: ".concat(e.name),"Message: ".concat(e.message),e.stack?`Stack:
`.concat(e.stack):"",r.componentStack?`Component Stack:
`.concat(r.componentStack):"",typeof navigator!="undefined"?"User Agent: ".concat(navigator.userAgent):""].filter(Boolean);return n.join(`

`)},G=function(e){k.visible&&re(b(b({},k),{},{open:e}))},R=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if(typeof window!="undefined"){var n=or(e),a=ir(n,r),o=new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});re({error:n,report:a,source:r.source||"runtime",timestamp:o,visible:!0,open:!1}),console.error("[H5ErrorOverlay] Showing error overlay:",n,r)}},sr=function(e){var r=e.error||new Error(e.message||"Unknown H5 runtime error");R(r,{source:"window.error"})},lr=function(e){R(e.reason,{source:"window.unhandledrejection"})},ur=function(){typeof window=="undefined"||X||(X=!0,window.addEventListener("error",sr),window.addEventListener("unhandledrejection",lr))},cr=function(){var e,r,n=h.useSyncExternalStore(tr,Y,Y);if(!n.visible)return null;var a=((e=n.error)===null||e===void 0?void 0:e.name)||"Error";return t.jsx(He,{children:t.jsxs(l,{className:"pointer-events-none fixed inset-0 z-[2147483646]",children:[t.jsx(l,{className:"pointer-events-auto fixed bottom-5 left-5",children:t.jsx(S,{variant:"outline",size:"icon",className:H("h-11 w-11 rounded-full shadow-md transition-transform"),style:{backgroundColor:"hsl(359, 100%, 97%)",borderColor:"hsl(359, 100%, 94%)",color:q},onClick:function(){return G(!n.open)},children:t.jsx(Ee,{size:22,color:q})})}),n.open&&t.jsx(l,{className:"pointer-events-none fixed inset-0 bg-white bg-opacity-15 supports-[backdrop-filter]:backdrop-blur-md",children:t.jsx(l,{className:"absolute inset-0 flex items-center justify-center px-4 py-4",children:t.jsx(l,{className:"w-full max-w-md",style:{width:"min(calc(100vw - 32px), var(--h5-phone-width, 390px))",height:"min(calc(100vh - 32px), 900px)"},children:t.jsx(Oe,{className:H("pointer-events-auto h-full rounded-2xl border border-border bg-background text-foreground shadow-2xl"),children:t.jsxs(l,{className:"relative flex h-full flex-col",children:[t.jsxs(ze,{className:"gap-2 p-4 pb-2",children:[t.jsxs(l,{className:"flex items-start justify-between gap-3",children:[t.jsxs(l,{className:"flex flex-wrap items-center gap-2",children:[t.jsx(D,{variant:"destructive",className:"border-none bg-red-500 px-3 py-1 text-xs font-medium text-white",children:"Runtime Error"}),t.jsx(D,{variant:"outline",className:"px-3 py-1 text-xs",children:n.source})]}),t.jsxs(l,{className:"flex shrink-0 items-center gap-1",children:[t.jsx(S,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return window.location.reload()},children:t.jsx(Ce,{size:15,color:"inherit"})}),t.jsx(S,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return G(!1)},children:t.jsx(je,{size:17,color:"inherit"})})]})]}),t.jsxs(l,{className:"flex items-center justify-between gap-3",children:[t.jsx(Re,{className:"text-left text-lg",children:a}),t.jsxs(S,{variant:"outline",size:"sm",className:"shrink-0 rounded-lg",onClick:function(){var o=y(m().m(function f(){var u;return m().w(function(d){for(;;)switch(d.n){case 0:return d.n=1,ar(n.report);case 1:if(u=d.v,!u){d.n=2;break}return V.success("已复制错误信息",{description:"可发送给 Agent 进行自动修复",position:"top-center"}),d.a(2);case 2:V.warning("复制失败",{description:"请直接选中文本后手动复制。",position:"top-center"});case 3:return d.a(2)}},f)}));function s(){return o.apply(this,arguments)}return s}(),children:[t.jsx(Se,{size:15,color:"inherit"}),t.jsx(l,{children:"复制错误"})]})]})]}),t.jsx(Le,{className:"min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2",children:t.jsxs(l,{className:"flex h-full min-h-0 flex-col gap-2",children:[t.jsxs(l,{className:"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border px-3 py-2 text-sm",children:[t.jsxs(l,{className:"flex items-center gap-2",children:[t.jsx(l,{className:"text-muted-foreground",children:"Error"}),t.jsx(l,{className:"font-medium text-foreground",children:((r=n.error)===null||r===void 0?void 0:r.name)||"Error"})]}),t.jsx(l,{className:"h-4 w-px bg-border"}),t.jsxs(l,{className:"flex items-center gap-2",children:[t.jsx(l,{className:"text-muted-foreground",children:"Source"}),t.jsx(l,{className:"font-medium text-foreground",children:n.source})]})]}),t.jsxs(l,{className:"min-h-0 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-black text-white",children:[t.jsxs(l,{className:"flex items-center justify-between border-b border-white border-opacity-10 px-3 py-3",children:[t.jsx(l,{className:"text-xs font-medium uppercase tracking-wide text-zinc-400",children:"Full Report"}),t.jsx(D,{variant:"outline",className:"border-zinc-700 bg-transparent px-2 py-1 text-xs text-zinc-400",children:n.timestamp})]}),t.jsx(ee,{className:"min-h-0 flex-1 w-full",orientation:"both",children:t.jsx(l,{className:"inline-block min-w-full whitespace-pre px-3 py-3 pb-8 font-mono text-xs leading-6 text-zinc-200",children:n.report})})]})]})})]})})})})})]})})},dr=function(i){function e(){var r;Be(this,e);for(var n=arguments.length,a=new Array(n),o=0;o<n;o++)a[o]=arguments[o];return r=Fe(this,e,[].concat(a)),r.state={error:null},r}return we(e,i),ye(e,[{key:"componentDidUpdate",value:function(n){this.state.error&&n.children!==this.props.children&&this.setState({error:null})}},{key:"componentDidCatch",value:function(n,a){R(n,{source:"React Error Boundary",componentStack:a.componentStack||""})}},{key:"render",value:function(){return t.jsxs(t.Fragment,{children:[t.jsx(cr,{}),this.state.error?null:this.props.children]})}}],[{key:"getDerivedStateFromError",value:function(n){return{error:n}}}])}(h.Component),pr=function(e){var r=e.children;return t.jsx(dr,{children:r})},fr=function(e){var r=e.children;return ur(),v.useLaunch(function(){Xe(),qe()}),t.jsx(pr,{children:t.jsx(Ze,{children:r})})},mr=function(e){var r=e.children;return t.jsxs(ke,{defaultColor:"#000",defaultSize:24,children:[t.jsx(fr,{children:r}),t.jsx(Ie,{})]})},E=K.__taroAppConfig={router:{mode:"hash"},pages:["pages/index/index","pages/diagnosis/index","pages/training/index"],window:{navigationBarTitleText:"语文智能辅导",navigationBarBackgroundColor:"#2563eb",navigationBarTextStyle:"white"},tabBar:{color:"#6b7280",selectedColor:"#2563eb",backgroundColor:"#ffffff",borderStyle:"black",list:[{pagePath:"pages/index/index",text:"智能辅导",iconPath:"./assets/tabbar/book-open.png",selectedIconPath:"./assets/tabbar/book-open-active.png"},{pagePath:"pages/diagnosis/index",text:"薄弱诊断",iconPath:"./assets/tabbar/check-square.png",selectedIconPath:"./assets/tabbar/check-square-active.png"},{pagePath:"pages/training/index",text:"专项训练",iconPath:"./assets/tabbar/dumbbell.png",selectedIconPath:"./assets/tabbar/dumbbell-active.png"}]}},_=[],N=[];_[0]="/static/images/book-open.png";N[0]="/static/images/book-open-active.png";_[1]="/static/images/check-square.png";N[1]="/static/images/check-square-active.png";_[2]="/static/images/dumbbell.png";N[2]="/static/images/dumbbell-active.png";var J=E.tabBar.list;for(var w=0;w<J.length;w++){var B=J[w];B.iconPath&&(B.iconPath=_[w]),B.selectedIconPath&&(B.selectedIconPath=N[w])}E.routes=[Object.assign({path:"pages/index/index",load:function(){var i=y(m().m(function r(n,a){var o;return m().w(function(s){for(;;)switch(s.n){case 0:return s.n=1,A(()=>import("./index.4d8a5f99.js"),["./index.4d8a5f99.js","./vendors.cd61e287.js","../css/vendors.8886af03.css","./common.b3b475c5.js"],import.meta.url);case 1:return o=s.v,s.a(2,[o,n,a])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"智能辅导",navigationBarBackgroundColor:"#2563eb",navigationBarTextStyle:"white"}),Object.assign({path:"pages/diagnosis/index",load:function(){var i=y(m().m(function r(n,a){var o;return m().w(function(s){for(;;)switch(s.n){case 0:return s.n=1,A(()=>import("./index.133d6278.js"),["./index.133d6278.js","./vendors.cd61e287.js","../css/vendors.8886af03.css","./common.b3b475c5.js"],import.meta.url);case 1:return o=s.v,s.a(2,[o,n,a])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"薄弱诊断",navigationBarBackgroundColor:"#2563eb",navigationBarTextStyle:"white"}),Object.assign({path:"pages/training/index",load:function(){var i=y(m().m(function r(n,a){var o;return m().w(function(s){for(;;)switch(s.n){case 0:return s.n=1,A(()=>import("./index.60d699b1.js"),["./index.60d699b1.js","./vendors.cd61e287.js","../css/vendors.8886af03.css","./common.b3b475c5.js"],import.meta.url);case 1:return o=s.v,s.a(2,[o,n,a])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"专项训练",navigationBarBackgroundColor:"#2563eb",navigationBarTextStyle:"white"})];Object.assign(Q,{findDOMNode:T.findDOMNode,render:T.render,unstable_batchedUpdates:T.unstable_batchedUpdates});_e();var hr=Ne(mr,Z,Q,E),ne=Pe({window:K});Te(E,ne);Ae(ne,hr,E,Z);De({designWidth:750,deviceRatio:{375:2,640:1.17,750:1,828:.905},baseFontSize:20,unitPrecision:void 0,targetUnit:void 0});
