"use strict";require("../../sub-common/1953cfd0adfeaa0d6d261e56d0b37b07.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[3103],{15860:function(A,e,a){var s=a(32180),n=a(33661),i=a(12742),t=a(22700),c=a(95333),l=a(14175),r=a(3701),B=a(67294),g=a(71515),o=a(75508),E=a(27863),p=a(6949),C=a(85893),w=function(A){(0,c.Z)(a,A);var e=(0,l.Z)(a);function a(){var A;(0,n.Z)(this,a);for(var s=arguments.length,i=new Array(s),c=0;c<s;c++)i[c]=arguments[c];return A=e.call.apply(e,[this].concat(i)),(0,r.Z)((0,t.Z)(A),"state",{status:3}),(0,r.Z)((0,t.Z)(A),"init",(function(){var e=A.props.mpErpId;(0,p.fM)({mpErpId:e}).then((function(e){var a=e.data;A.setState({status:a.sceneGroupList[0].status})}))})),A}return(0,i.Z)(a,[{key:"componentDidMount",value:function(){this.init()}},{key:"render",value:function(){var A=this.state.status;return(0,C.jsxs)(g.View,{className:"live_index_wrapper",children:[(0,C.jsxs)(g.View,{className:"live_index_wrapper__status aic jcsb",children:[(0,C.jsx)(g.Text,{className:"live_index_wrapper__status__label",children:"视频号接口状态"}),A===E.zZ.SUCCESS&&(0,C.jsxs)(g.View,{className:"aic",children:[(0,C.jsx)(g.View,{className:"round_view"}),(0,C.jsx)(g.Text,{className:"status_label",children:"正常"})]})]}),(0,C.jsxs)(g.View,{className:"live_index_wrapper__manage aic",children:[(0,C.jsx)(g.Image,{className:"live_index_icon",src:"data:image/png;base64,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"}),(0,C.jsxs)(g.View,{className:"col jcc",children:[(0,C.jsx)(g.Text,{className:"live_index_wrapper__manage__title",children:"直播商品管理"}),(0,C.jsx)(g.Text,{className:"live_index_wrapper__manage__label",children:"发布商品到视频号"})]})]}),(0,C.jsxs)(g.View,{className:"live_index_wrapper__manage aic",children:[(0,C.jsx)(g.Image,{className:"live_index_icon",src:"data:image/png;base64,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"}),(0,C.jsxs)(g.View,{className:"col jcc",children:[(0,C.jsx)(g.Text,{className:"live_index_wrapper__manage__title",children:"直播推广"}),(0,C.jsx)(g.Text,{className:"live_index_wrapper__manage__label",children:"推广你的带货直播"})]})]})]})}}]),a}(B.Component),u=(0,o.$j)((function(A){return{mpErpId:A.goodsManage.mpErpId}}))(w);Page((0,s.createPageConfig)(u,"subpackages/live/pages/live_index/index",{root:{cn:[]}},{navigationBarTitleText:"视频号带货",navigationBarBackgroundColor:"#F7F7F7"}||{}))}},function(A){A.O(0,[8272,2107,1216,8592],(function(){return e=15860,A(A.s=e);var e}));A.O()}]);