"use strict";require("../../sub-common/1953cfd0adfeaa0d6d261e56d0b37b07.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[3182],{84412:function(e,n,t){var a=t(32180),r=t(57543),l=t(77886),s=t(33661),i=t(12742),c=t(22700),u=t(95333),o=t(14175),d=t(3701),m=t(92954),p=t.n(m),_=t(67294),h=t(71515),g=t(75508),v=t(6949),x=t(6420),b="index-module__page___VtYTI",f="index-module__page__form___gMag3",Z="index-module__page__form__item___YONdX",w="index-module__page__form__item__label___wDG4S",y="index-module__page__form__item__content___Vjkvg",N="index-module__page__form__item__content__input___yVbGK",j="index-module__page__submit___sXiYQ",k=t(18453),C=t(85893),I=function(e){(0,u.Z)(t,e);var n=(0,o.Z)(t);function t(e){var a;return(0,s.Z)(this,t),a=n.call(this,e),(0,d.Z)((0,c.Z)(a),"componentDidMount",(function(){(0,v.aP)().then((function(e){var n={label:"中国",children:[]},t=[n];e.data.rows.forEach((function(e){null!=e.children?n.children.push(e):t.push(e)})),a.setState({allRegionData:t})}))})),(0,d.Z)((0,c.Z)(a),"getTown",(function(){var e=a.state.indexs,n=a.getCity().cur,t=[];return n&&n.children?(t=n.children.map((function(e){return e.label})),{cur:n.children[e[3]],labels:t}):{cur:null,labels:t}})),(0,d.Z)((0,c.Z)(a),"getCity",(function(){var e=a.state.indexs,n=a.getProvince().cur,t=[];return n&&n.children?(t=n.children.map((function(e){return e.label})),{cur:n.children[e[2]],labels:t}):{cur:null,labels:t}})),(0,d.Z)((0,c.Z)(a),"getProvince",(function(){var e=a.state.indexs,n=a.getCountry().cur,t=[];return n&&n.children?(t=n.children.map((function(e){return e.label})),{cur:n.children[e[1]],labels:t}):{cur:null,labels:t}})),(0,d.Z)((0,c.Z)(a),"getCountry",(function(){var e=a.state,n=e.allRegionData;return{cur:n[e.indexs[0]],labels:n.map((function(e){return e.label}))}})),(0,d.Z)((0,c.Z)(a),"onChange",(function(e){var n=a.state,t=n.indexs,r=n.selected,l=a.props.handleChange,s=(0,k.Z)(t);void 0!==e.detail.column?s[e.detail.column]=e.detail.value:Array.isArray(e.detail.value)&&(s=e.detail.value,l({country:a.getCountry().cur,province:a.getProvince().cur,city:a.getCity().cur,town:a.getTown().cur}),!1===r&&a.setState({selected:!0})),a.setState({indexs:s})})),a.state={indexs:[0,0,0,0],allRegionData:[],selected:!1},a}return(0,i.Z)(t,[{key:"render",value:function(){var e=this.props.className,n=this.state,t=n.indexs,a=n.selected,r=this.getCountry(),l=this.getProvince(),s=this.getCity(),i=this.getTown();return(0,C.jsx)(h.Picker,{className:e,mode:"multiSelector",value:t,range:[r.labels,l.labels,s.labels,i.labels],onColumnChange:this.onChange,onChange:this.onChange,children:(0,C.jsx)(h.View,{className:"picker",children:r.cur&&a?"海外"===r.cur.label?"海外":"".concat(r.cur.label,"/").concat(l.cur.label,"/").concat(s.cur.label,"/").concat(i.cur.label):"请选择省市区"})})}}]),t}(_.Component),T=[{keyName:"receiver_name",msg:"请输入收件人姓名"},{keyName:"tel_number",msg:"请输入收件人手机号"},{keyName:"detailed_address",msg:"请输入详细地址"}],V=function(e){(0,u.Z)(a,e);var n,t=(0,o.Z)(a);function a(){var e;(0,s.Z)(this,a);for(var n=arguments.length,i=new Array(n),u=0;u<n;u++)i[u]=arguments[u];return e=t.call.apply(t,[this].concat(i)),(0,d.Z)((0,c.Z)(e),"state",{receiver_name:"",tel_number:"",country:null,province:null,city:null,town:null,detailed_address:""}),(0,d.Z)((0,c.Z)(e),"updateReceiverName",(function(n){return e.setState({receiver_name:n.detail.value})})),(0,d.Z)((0,c.Z)(e),"updateTelNumber",(function(n){return e.setState({tel_number:n.detail.value})})),(0,d.Z)((0,c.Z)(e),"updateDetailedAddress",(function(n){return e.setState({detailed_address:n.detail.value})})),(0,d.Z)((0,c.Z)(e),"updateRegion",(function(n){var t=n.country,a=n.province,r=n.city,l=n.town;e.setState({country:t?t.label:null,province:a?a.label:null,city:r?r.label:null,town:l?l.label:null})})),(0,d.Z)((0,c.Z)(e),"submit",(0,l.Z)((0,r.Z)().mark((function n(){var t,a,l,s,i,c,u,o,d;return(0,r.Z)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(a=(0,x.JU)(null===(t=p().getCurrentInstance)||void 0===t?void 0:t.call(p())),l=a.sessionId,s=a.mpErpId,i="请选择省市区",null!==e.state.country){n.next=6;break}return n.abrupt("return",p().showToast({title:i,icon:"none"}));case 6:if("海外"===e.state.country||null!==e.state.town){n.next=8;break}return n.abrupt("return",p().showToast({title:i,icon:"none"}));case 8:c=0;case 9:if(!(c<T.length)){n.next=16;break}if(o=(u=T[c]).keyName,d=u.msg,e.state[o]){n.next=13;break}return n.abrupt("return",p().showToast({title:d,icon:"none"}));case 13:c++,n.next=9;break;case 16:return p().showLoading({title:"提交中"}),n.next=19,(0,v.w2)({mpErpId:s,sessionId:l,jsonParam:e.state});case 19:n.sent,p().hideLoading(),p().navigateTo({url:"/subpackages/live/pages/create_live/index?mpErpId=".concat(s,"&sessionId=").concat(l)});case 22:case"end":return n.stop()}}),n)})))),e}return(0,i.Z)(a,[{key:"componentDidMount",value:(n=(0,l.Z)((0,r.Z)().mark((function e(){return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:case"end":return e.stop()}}),e)}))),function(){return n.apply(this,arguments)})},{key:"render",value:function(){var e=this.state,n=e.receiver_name,t=e.tel_number,a=e.detailed_address;return(0,C.jsxs)(h.View,{className:b,children:[(0,C.jsxs)(h.View,{className:f,children:[(0,C.jsxs)(h.View,{className:Z,children:[(0,C.jsx)(h.Text,{className:w,children:"姓名"}),(0,C.jsx)(h.View,{className:y,children:(0,C.jsx)(h.Input,{placeholder:"请输入收件人姓名",className:N,value:n,onInput:this.updateReceiverName})})]}),(0,C.jsxs)(h.View,{className:Z,children:[(0,C.jsx)(h.Text,{className:w,children:"手机号"}),(0,C.jsx)(h.View,{className:y,children:(0,C.jsx)(h.Input,{placeholder:"请输入收件人手机号",className:N,value:t,onInput:this.updateTelNumber,maxLength:11})})]}),(0,C.jsxs)(h.View,{className:Z,children:[(0,C.jsx)(h.Text,{className:w,children:"省/市/区"}),(0,C.jsx)(h.View,{className:y,children:(0,C.jsx)(I,{className:N,handleChange:this.updateRegion})})]}),(0,C.jsxs)(h.View,{className:Z,children:[(0,C.jsx)(h.Text,{className:w,children:"详细地址"}),(0,C.jsx)(h.View,{className:y,children:(0,C.jsx)(h.Input,{placeholder:"请输入收件详细地址",className:N,value:a,onInput:this.updateDetailedAddress})})]})]}),(0,C.jsx)(h.Button,{className:j,onClick:this.submit,children:"提交"})]})}}]),a}(_.Component),P=(0,g.$j)((function(e){return{mpErpId:e.goodsManage.mpErpId}}))(V);Page((0,a.createPageConfig)(P,"subpackages/live/pages/perfect_address/index",{root:{cn:[]}},{}||{}))}},function(e){e.O(0,[8272,2107,1216,8592],(function(){return n=84412,e(e.s=n);var n}));e.O()}]);