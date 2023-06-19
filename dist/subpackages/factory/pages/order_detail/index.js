"use strict";require("../../sub-vendors.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[5580],{97095:function(e,t,n){var i=n(32180),r=n(57543),s=n(77886),a=n(33661),c=n(12742),o=n(22700),u=n(95333),l=n(14175),d=n(3701),p=n(66058),h=n(92954),_=n.n(h),f=n(67294),m=n(71515),x=n(55106),Z=n(94184),w=n.n(Z),v=n(49181),I=n(6420),k=n(63056),b=n(48839),g="index-module__container___VCr1n",j="index-module__wrapper___LOWGX",V="index-module__order_item___nqH6h",C="index-module__order_item__top___fu5ws",N="index-module__order_item__img___UXrlX",P="index-module__row___FRPet",y="index-module__row__size___HD7Bt",S="index-module__button___BUoDx",B=n(85893);function L(e){return e.reduce((function(e,t){var n=e.find((function(e){return e.spuId===t.spuId}));return n?n.skus.push((0,p.Z)({},t)):e.push((0,p.Z)((0,p.Z)({},t),{},{skus:[(0,p.Z)({},t)]})),e}),[])}var D=function(e){(0,u.Z)(n,e);var t=(0,l.Z)(n);function n(){var e;(0,a.Z)(this,n);for(var i=arguments.length,c=new Array(i),u=0;u<i;u++)c[u]=arguments[u];return e=t.call.apply(t,[this].concat(c)),(0,d.Z)((0,o.Z)(e),"state",{data:[],isInputVisible:!1,printNo:""}),(0,d.Z)((0,o.Z)(e),"fetchData",(0,s.Z)((0,r.Z)().mark((function t(){var n,i,s,a,c,o;return(0,r.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return i=(0,I.JU)(null===(n=_().getCurrentInstance)||void 0===n?void 0:n.call(_())),s=i.mpErpId,a=i.billId,_().showLoading({title:"加载中..."}),t.prev=2,t.next=5,(0,x.Ek)({mpErpId:s,jsonParam:{billId:a}});case 5:c=t.sent,o=c.data,e.setState({data:L(o.rows)}),t.next=12;break;case 10:t.prev=10,t.t0=t.catch(2);case 12:_().hideLoading();case 13:case"end":return t.stop()}}),t,null,[[2,10]])})))),(0,d.Z)((0,o.Z)(e),"hideInput",(function(){e.setState({isInputVisible:!1})})),(0,d.Z)((0,o.Z)(e),"onPrintClick",(function(){e.setState({isInputVisible:!0})})),(0,d.Z)((0,o.Z)(e),"setPrintCode",function(){var t=(0,s.Z)((0,r.Z)().mark((function t(n){return(0,r.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,(0,x.WY)(n);case 3:k.Z.showToast("设置成功"),e.fetchPrintCode(),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),e.setState({isInputVisible:!0});case 10:case"end":return t.stop()}}),t,null,[[0,7]])})));return function(e){return t.apply(this,arguments)}}()),(0,d.Z)((0,o.Z)(e),"fetchPrintCode",(0,s.Z)((0,r.Z)().mark((function t(){var n,i;return(0,r.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,(0,x.uB)();case 2:n=t.sent,i=n.data,e.setState({printNo:i.printNo});case 5:case"end":return t.stop()}}),t)})))),(0,d.Z)((0,o.Z)(e),"onPrint",(0,s.Z)((0,r.Z)().mark((function t(){var n,i,s,a;return(0,r.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return i=(0,I.JU)(null===(n=_().getCurrentInstance)||void 0===n?void 0:n.call(_())),s=i.mpErpId,a=i.billId,_().showLoading(),t.prev=2,t.next=5,(0,x.j3)({mpErpId:s,billId:a});case 5:_().hideLoading(),k.Z.showToast("打印任务创建成功"),t.next=13;break;case 9:t.prev=9,t.t0=t.catch(2),_().hideLoading(),(t.t0.message.includes("打印机标识有误，请重新填写")||t.t0.message.includes("请先设置打印机配置"))&&e.setState({isInputVisible:!0});case 13:case"end":return t.stop()}}),t,null,[[2,9]])})))),e}return(0,c.Z)(n,[{key:"componentDidMount",value:function(){this.fetchData(),this.fetchPrintCode()}},{key:"render",value:function(){var e=this.state,t=e.data,n=e.isInputVisible,i=e.printNo;return(0,B.jsxs)(m.View,{className:g,children:[(0,B.jsx)(m.View,{className:j,children:t.map((function(e){return(0,B.jsxs)(m.View,{className:V,children:[(0,B.jsxs)(m.View,{className:C,children:[(0,B.jsx)(m.Image,{className:N,src:e.fileUrl}),(0,B.jsxs)(m.View,{children:[(0,B.jsx)(m.View,{style:{fontSize:"28rpx",marginBottom:"8rpx"},children:e.spuCode}),(0,B.jsx)(m.View,{style:{fontSize:"24rpx",color:"#999"},children:e.spuName})]})]}),(0,B.jsx)(m.View,{children:e.skus&&e.skus.map((function(e){return(0,B.jsxs)(m.View,{className:w()("jcsb aic",P),children:[(0,B.jsx)(m.View,{className:"flex1",children:e.colorName}),(0,B.jsx)(m.View,{className:y,children:e.sizeName}),(0,B.jsx)(m.View,{className:"flex1 jcfe",children:"".concat(e.num,"件")})]},e.mainId)}))})]},e.spuId)}))}),(0,B.jsx)(m.View,{className:S,children:(0,B.jsx)(v.Z,{labels:["设置打印机编号","打印条码"],onLeftButtonClick:this.onPrintClick,onRightButtonClick:this.onPrint})}),(0,B.jsx)(b.Z,{visible:n,title:"请输入打印机编号",onRequestClose:this.hideInput,onConfirm:this.setPrintCode,defaultInput:i})]})}}]),n}(f.PureComponent);Page((0,i.createPageConfig)(D,"subpackages/factory/pages/order_detail/index",{root:{cn:[]}},{navigationBarTitleText:"订单明细"}||{}))}},function(e){e.O(0,[8017,2107,1216,8592],(function(){return t=97095,e(e.s=t);var t}));e.O()}]);