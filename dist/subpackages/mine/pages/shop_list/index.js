"use strict";require("../../sub-vendors.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[1107],{47322:function(e,n,o){var l=o(32180),t=o(33661),s=o(12742),_=o(22700),i=o(95333),c=o(14175),a=o(3701),r=o(92954),d=o.n(r),p=o(67294),h=o(71515),u=o(75508),m=o(49181),f=o(48882),x={shop_cell:"shop_cell-module__shop_cell___yf2Y1",shop_cell__logo:"shop_cell-module__shop_cell__logo___nnUvo",shop_cell__content:"shop_cell-module__shop_cell__content___g5jQ0",shop_cell__content__title:"shop_cell-module__shop_cell__content__title____0TBg",shop_cell__content__address:"shop_cell-module__shop_cell__content__address___wrSvk",shop_cell__btn:"shop_cell-module__shop_cell__btn___SvBf9",shop_cell__btn__icon:"shop_cell-module__shop_cell__btn__icon___EIIO3"},g=o(85893);function v(e){var n=e.data,o=e.buttonText,l=e.buttonIcon,t=e.onBtnClick,s=e.onCellClick;var _="string"==typeof o,i=void 0!==l;return(0,g.jsxs)(h.View,{className:x.shop_cell,onClick:function(){s(n)},children:[(0,g.jsx)(h.Image,{className:x.shop_cell__logo,src:n.logoUrl||f}),(0,g.jsxs)(h.View,{className:x.shop_cell__content,children:[(0,g.jsx)(h.View,{className:x.shop_cell__content__title,children:n.shopName}),(0,g.jsx)(h.Text,{className:x.shop_cell__content__address,children:n.addr})]}),_&&(0,g.jsxs)(h.View,{className:x.shop_cell__btn,onClick:function(e){e.preventDefault(),t(n)},children:[i&&(0,g.jsx)(h.Image,{src:l,className:x.shop_cell__btn__icon}),(0,g.jsx)(h.Text,{className:x.shop_cell__btn__text,children:o})]})]},n.shopid)}v.defaultProps={onBtnClick:function(){},onCellClick:function(){}};var C=o(65941),k=o(6420),B=o(89728),j=o(91629),b=o(27863),w="index-module__container___BMPqL",N="index-module__shop_list___RafXI",Z="index-module__shop_list_wrapper___bisXv",I="index-module__button___DEYZ2",T="index-module__no_data_container___N80W_",P="index-module__no_data___ECHmn",V=o(32180).document,y=function(e){return e.BindPhone="0",e.Mine="1",e.Cloud="2",e}(y||{}),S=function(e){(0,i.Z)(o,e);var n=(0,c.Z)(o);function o(e){var l,s;(0,t.Z)(this,o),s=n.call(this,e),(0,a.Z)((0,_.Z)(s),"onBtnClick",(function(){var e=s.props.sessionId,n="?menuBtn=1&subscribe=1&sessionId=".concat(e);j.Z.switchTab({url:"/pages/statement/index"+n})})),(0,a.Z)((0,_.Z)(s),"onShopBtnClick",(function(e){s.state.from===y.Cloud?(s.props.dispatch({type:"cloudBill/init",payload:{mpErpId:e.id}}),d().navigateBack()):s.props.dispatch({type:"shop/unfollow",payload:e})})),(0,a.Z)((0,_.Z)(s),"onShopItemClick",(function(e){})),(0,a.Z)((0,_.Z)(s),"getShopList",(function(){var e=s.props.shopList,n=s.state.from;return e.filter((function(e){return n===y.Cloud?e.cloudBillFlag>b.PC.close:e.id}))}));var i=(0,k.JU)(null===(l=d().getCurrentInstance)||void 0===l?void 0:l.call(d())).from,c=void 0===i?y.Mine:i;return s.state={from:c},s}return(0,s.Z)(o,[{key:"componentDidMount",value:function(){this.state.from===y.BindPhone&&(V.title="绑定成功"),this.state.from===y.Cloud&&d().setNavigationBarTitle({title:"选择店铺"})}},{key:"render",value:function(){var e=this,n=this.getShopList(),o=this.state.from,l=o===y.Cloud?"进入店铺":"取消关注";return(0,g.jsx)(h.View,{className:w,children:n.length>0?(0,g.jsxs)(h.View,{className:w,children:[(0,g.jsx)(h.View,{className:N,style:{paddingBottom:o===y.BindPhone?(0,r.pxTransform)(160):0},children:(0,g.jsx)(h.View,{className:Z,children:n.map((function(n){return(0,g.jsx)(v,{data:n,buttonText:l,onBtnClick:e.onShopBtnClick},n.id)}))})}),o===y.BindPhone&&(0,g.jsx)(h.View,{className:I,children:(0,g.jsx)(m.Z,{label:(0,C.t)("checkAllTickets"),size:"large",onButtonClick:this.onBtnClick})})]}):(0,g.jsxs)(h.View,{className:T,children:[(0,g.jsx)(h.Image,{src:B,className:P}),(0,g.jsx)(h.Text,{children:"暂无店铺信息，请联系商家"})]})})}}]),o}(p.PureComponent),L=(0,u.$j)((function(e){var n=e.shop,o=e.user;return{shopList:n.list,sessionId:o.sessionId}}))(S);Page((0,l.createPageConfig)(L,"subpackages/mine/pages/shop_list/index",{root:{cn:[]}},{navigationBarTitleText:"拿货店铺"}||{}))}},function(e){e.O(0,[2107,1216,8592],(function(){return n=47322,e(e.s=n);var n}));e.O()}]);