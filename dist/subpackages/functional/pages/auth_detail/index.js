"use strict";require("../../sub-vendors.js");require("../../sub-common/1710899bab9cfb6491e9c985cd531f02.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[3158],{40058:function(m,e,n){var i=n(32180),a=n(33661),t=n(12742),Z=n(22700),s=n(95333),l=n(14175),o=n(3701),c=n(92954),u=n.n(c),r=n(67294),d=n(71515),p=n(78518),_=n(13109),A=n(63056),h="index-module__page___Coz46",f="index-module__top_container___BSjcR",g="index-module__op___m3eIQ",x="index-module__op__item___aI_gM",q="index-module__op__item__icon___vf3jy",C=n(18316),v=n(65712),b=n(19806),w=n(52131),k=n(85893);function J(m){var e=m.title,n=m.onConfirm,i=m.onCancel,a=m.onRequestClose,t=m.visible,Z=m.defaultInput,s=m.rules,l=(0,r.useState)(Z||""),o=(0,v.Z)(l,2),c=o[0],p=o[1];return(0,r.useEffect)((function(){p(Z||"")}),[Z]),t?(0,k.jsx)(b.Z,{onRequestClose:a,visible:t,direction:w.n.Center,containerClass:"bg_trans",children:(0,k.jsxs)(d.View,{className:"input_modal",children:[(0,k.jsx)(d.View,{className:"input_modal__title",children:e}),(0,k.jsx)(d.View,{className:"input_modal__input",children:(0,k.jsx)(d.View,{className:"input_modal__input__input",children:(0,k.jsx)(d.Input,{style:{position:"relative",zIndex:1},focus:!0,onInput:function(m){p(m.detail.value)},value:c})})}),(0,k.jsxs)(d.View,{className:"input_modal__btns",children:[(0,k.jsx)(d.View,{className:"input_modal__btns__btn input_modal__btns__btn--left",onClick:function(){a(),i&&i()},children:"取消"}),(0,k.jsx)(d.View,{className:"input_modal__btns__btn input_modal__btns__btn--right",onClick:function(){(function(m){if(Array.isArray(s))for(var e=0;e<s.length;e++){var n=s[e],i=n.maxLength,a=void 0===i?Number.MAX_SAFE_INTEGER:i,t=n.minLength,Z=void 0===t?0:t,l=n.msg,o=n.rule;if(m.length>a||m.length<Z||o&&!o.test(m))return u().showToast({title:l,icon:"none",duration:1200}),!1}return!0})(c)&&(a(),n&&n(c))},children:"确定"})]})]})}):null}var j=function(m){(0,s.Z)(n,m);var e=(0,l.Z)(n);function n(){var m;(0,a.Z)(this,n);for(var i=arguments.length,t=new Array(i),s=0;s<i;s++)t[s]=arguments[s];return m=e.call.apply(e,[this].concat(t)),(0,o.Z)((0,Z.Z)(m),"state",{isRenameModalVisible:!1,data:{}}),(0,o.Z)((0,Z.Z)(m),"inputRules",[{maxLength:15,msg:"最多输入15个字"}]),(0,o.Z)((0,Z.Z)(m),"fetchData",(function(){var e,n=(null===(e=u().getCurrentInstance)||void 0===e?void 0:e.call(u())).params;(0,_.Lk)(n.id).then((function(e){var n=e.data;m.setState({data:n})}))})),(0,o.Z)((0,Z.Z)(m),"onEditClick",(function(){m.setState({isRenameModalVisible:!0})})),(0,o.Z)((0,Z.Z)(m),"closeInputModal",(function(){m.setState({isRenameModalVisible:!1})})),(0,o.Z)((0,Z.Z)(m),"onInputConfirm",(function(e){var n=m.state.data;(0,_.Hp)({id:n.id,nickName:e}).then((function(){A.Z.showToast("修改备注成功"),m.fetchData()}))})),(0,o.Z)((0,Z.Z)(m),"onUnBindClick",(function(){A.Z.showAlertWithCancel("是否确认取消该用户授权","提示",(function(){(0,_.Si)(m.state.data.id).then((function(){u().navigateBack()}))}))})),m}return(0,t.Z)(n,[{key:"UNSAFE_componentWillMount",value:function(){this.fetchData()}},{key:"render",value:function(){var m=this.state,e=m.isRenameModalVisible,n=m.data;return(0,k.jsxs)(d.View,{className:h,children:[(0,k.jsxs)(d.View,{className:f,children:[(0,k.jsx)(C.Z,{data:n}),(0,k.jsxs)(d.View,{className:g,children:[(0,k.jsxs)(d.View,{className:x,onClick:this.onUnBindClick,children:[(0,k.jsx)(d.Image,{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABX1BMVEUAAAAAAAD///+AgICqqqqAgIC/v7+ZmZmqqqqZmZmVlZWSkpKZmZmPj4+Xl5eZmZmTk5OdnZ2Xl5eZmZmcnJyXl5eYmJibm5uZmZmZmZmbm5uWlpaYmJicnJybm5uYmJiampqYmJiXl5ebm5uZmZmampqYmJibm5uampqYmJiZmZmampqZmZmZmZmZmZmZmZmYmJiampqZmZmampqZmZmYmJiZmZmampqZmZmampqYmJiampqZmZmampqZmZmYmJiampqZmZmYmJiampqZmZmZmZmampqZmZmampqZmZmampqZmZmYmJiampqampqampqampqampqZmZmZmZmampqZmZmZmZmZmZmampqYmJiZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmampqZmZmZmZmZmZmZmZmZmZmYmJiZmZmZmZmZmZmZmZmampqZmZlDJLeVAAAAdHRSTlMAAQECAwQEBQkKDA4PEBYZGhobHh8gJSktMjM9Pj5AQ0RFTE9QU1RUWFlaW2ZnaXB0dHV5enx9gYKNkJCWmpufn6Okpqiqq6yxsrO5ur/ExcfJzM7P0NHZ2d3d3+Hi6Onq6+zt8fLz9PT19vf4+vv7/P3+/kSQXg8AAAHfSURBVEjH7ZXZVxMxFIdTCwWhglqhWGURK4ooneDKoqhFsSgooFiloMNWa5nCkO//Pz6UlsFk2hyOj+Qp957fN5nc3EWI83XGFU1/dN0Pt6OW8vbxPADkx9st5F3PXYD1dQD3WVcTefJlGWBxOHJheBGg/CLZQD6w4AOVbKpqprIVwF8YMKtbR1cAdiYTJ77E5A7Aymirrk8XADZk/LQ7LjcACmkNKAKrY236l9rGVoGi5oe9wbC7De6BAdgMj8bmfwZi2qYxkPMy1U3Gy9kAMQ8lhRBCghezOSGjUFIICSpjdwdHgZSgHNsoOQqCeiPgsS1OEQG92MbTAJeDSN2YAJiom5EDXA1Yg57aXoJSIGt2D6xpwGsYCegdJ0CMwBsNeACvTsLqCOGoelhn4aEGdPvsXqo9nHN88+rDxXfxr+gJ9h6emlPjCeQMGXlDUbxmSr5EEW6acvgtfDZV3CeYNyb95Z8w16J1wSz8uhpSiR7MX/ynDb6Dyq2wwrp3CF/7gp6+L3B4P7wU7/yG/Uf132p5vA+lu41a5fU8sHzcHZPLwLdUk9Y95cMfGRUiKsvgTzVv4P0/gKXe3iXge7/NfOiYOYJSCY5mOixHylABoDBkP7M6p7e2pjvPZ/eZ1192RJ3hM1BjVQAAAABJRU5ErkJggg==",className:q}),(0,k.jsx)(d.Text,{children:"取消授权"})]}),(0,k.jsxs)(d.View,{className:x,onClick:this.onEditClick,children:[(0,k.jsx)(d.Image,{src:p,className:q}),(0,k.jsx)(d.Text,{children:"修改备注"})]})]})]}),e&&(0,k.jsx)(J,{visible:e,title:"修改备注",onRequestClose:this.closeInputModal,defaultInput:n.nickName,onConfirm:this.onInputConfirm,rules:this.inputRules})]})}}]),n}(r.PureComponent);Page((0,i.createPageConfig)(j,"subpackages/functional/pages/auth_detail/index",{root:{cn:[]}},{navigationBarTitleText:"授权管理"}||{}))}},function(m){m.O(0,[9860,3894,2107,1216,8592],(function(){return e=40058,m(m.s=e);var e}));m.O()}]);