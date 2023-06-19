"use strict";require("../../sub-vendors.js");require("../../sub-common/a892c3adf072850ba48f151a38b91f33.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[659],{57054:function(e,t,i){var s=i(32180),a=i(57543),n=i(77886),l=i(33661),c=i(12742),r=i(22700),o=i(95333),_=i(14175),d=i(3701),m=i(92954),u=i.n(m),h=i(67294),x=i(75508),p=i(71515),f=i(14067),N=i(42266),w=i(6420),j=i(96005),g=(i(75202),i(85893)),k=function(e){(0,o.Z)(i,e);var t=(0,_.Z)(i);function i(){var e;(0,l.Z)(this,i);for(var s=arguments.length,c=new Array(s),o=0;o<s;o++)c[o]=arguments[o];return e=t.call.apply(t,[this].concat(c)),(0,d.Z)((0,r.Z)(e),"state",{isAlert:!1,isRefused:!1}),(0,d.Z)((0,r.Z)(e),"onNodataActionClick",(function(t){var i,s=t.currentTarget.dataset.type,a=(0,w.JU)(null===(i=u().getCurrentInstance)||void 0===i?void 0:i.call(u())).mpUserId,n=2;"through"===s?n=3:e.setState({isRefused:!0,isAlert:!1}),u().showLoading({title:"请稍等..."}),(0,f.oR)({mpErpId:e.props.mpErpId,mpUserId:a,auditFlag:n}).then((function(t){u().hideLoading(),"through"===s&&e.props.dispatch({type:"goodsManage/selectShopLinkUsers"}).then((function(){var t=e.props.myClientList.find((function(e){return e.mpUserId===Number(a)}));u().redirectTo({url:"/subpackages/cloud_bill/pages/my_client_detail/index?mpUserId=".concat(t&&t.mpUserId,"&viewDate=").concat(t&&t.viewDate,"&listType=1")})})),e.fetchList()})).catch((function(e){u().hideLoading()})),"refused"===s&&e.setState({isRefused:!0})})),(0,d.Z)((0,r.Z)(e),"onCloseClick",(function(){e.setState({isAlert:!1})})),(0,d.Z)((0,r.Z)(e),"onRefusedClick",(function(){e.setState({isAlert:!0})})),(0,d.Z)((0,r.Z)(e),"fetchList",(0,n.Z)((0,a.Z)().mark((function t(){var i;return(0,a.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return i=e.props.mpErpId,u().showLoading({title:"请稍等..."}),t.next=4,e.props.dispatch({type:"goodsManage/selectShopWaitAuditUsers",payload:{pageNo:1,jsonParam:{mpErpId:i}}});case 4:e.props.dispatch({type:"goodsManage/getShopViewData"}),u().hideLoading();case 6:case"end":return t.stop()}}),t)})))),(0,d.Z)((0,r.Z)(e),"renderNodataAlertView",(function(){return(0,g.jsx)(p.View,{className:"alert_view_mask",children:(0,g.jsxs)(p.View,{className:"alert_view_mask__content",children:[(0,g.jsx)(p.View,{className:"alert_view_mask__content___title",children:"选择操作"}),(0,g.jsx)(p.View,{className:"alert_view_mask__content___label",children:"是否允许该客户访问您的云单"}),(0,g.jsxs)(p.View,{className:"alert_view_mask__content___action",children:[(0,g.jsx)(p.View,{className:"alert_view_mask__content___action___item access_denied",onClick:e.onNodataActionClick,"data-type":"refused",children:"拒绝访问"}),(0,g.jsx)(p.View,{className:"alert_view_mask__content___action___item allow_access",onClick:e.onNodataActionClick,"data-type":"through",children:"允许访问"})]}),(0,g.jsx)(p.Image,{src:N,className:"close_icon",onClick:e.onCloseClick})]})})})),(0,d.Z)((0,r.Z)(e),"renderNodataActionView",(function(){var t,i=Number((0,w.JU)(null===(t=u().getCurrentInstance)||void 0===t?void 0:t.call(u())).auditFlag);return(0,g.jsxs)(p.Block,{children:[1===i&&(0,g.jsxs)(p.Block,{children:[(0,g.jsx)(p.View,{className:"nodata_client__item___right___y",onClick:e.onNodataActionClick,"data-type":"through",children:"通过"}),(0,g.jsx)(p.View,{className:"nodata_client__item___right___n",onClick:e.onNodataActionClick,"data-type":"refused",children:"拒绝"})]}),2===i&&(0,g.jsx)(p.View,{className:"nodata_client__item___right___ned",onClick:e.onRefusedClick,children:"已拒绝"})]})})),e}return(0,c.Z)(i,[{key:"componentDidMount",value:function(){var e,t=(0,w.JU)(null===(e=u().getCurrentInstance)||void 0===e?void 0:e.call(u())).auditFlag;2===Number(t)&&this.setState({isRefused:!0})}},{key:"render",value:function(){var e,t=(0,w.JU)(null===(e=u().getCurrentInstance)||void 0===e?void 0:e.call(u())),i=t.logo,s=t.nickName,a=this.state,n=a.isAlert,l=a.isRefused;return(0,g.jsxs)(p.View,{className:"my_client_detail",children:[(0,g.jsxs)(p.View,{className:"user_information",children:[(0,g.jsxs)(p.View,{className:"my_client_item",children:[(0,g.jsxs)(p.View,{className:"my_client_item__left",children:[(0,g.jsx)(p.Image,{src:i||j,className:"head_image"}),(0,g.jsx)(p.View,{className:"my_client_item__left__info",children:s})]}),l&&(0,g.jsx)(p.View,{className:"my_client_item__right",onClick:this.onRefusedClick,children:"已拒绝访问"})]}),(0,g.jsxs)(p.View,{className:"user_information_items",children:[(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"浏览云单/次"})]}),(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"浏览商品/次"})]}),(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"下单数/次"})]}),(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"购买次数/次"})]}),(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"购买频率/月"})]}),(0,g.jsxs)(p.View,{className:"user_information_items_item",children:[(0,g.jsx)(p.Text,{children:"0"}),(0,g.jsx)(p.Text,{className:"fontColorSmall",children:"客单价/元"})]})]})]}),!l&&(0,g.jsxs)(p.View,{className:"nodata_client__item",children:[(0,g.jsxs)(p.View,{className:"nodata_client__item___left",children:[(0,g.jsx)(p.Image,{className:"user_logo",src:i,mode:"aspectFill"}),(0,g.jsxs)(p.View,{className:"user_info",children:[(0,g.jsx)(p.Text,{className:"user_info__name",children:s}),(0,g.jsx)(p.Text,{className:"user_info__time",children:"正在申请访问您的云单"})]})]}),(0,g.jsx)(p.View,{className:"nodata_client__item___right",children:this.renderNodataActionView()})]}),n&&this.renderNodataAlertView()]})}}]),i}(h.PureComponent),C=(0,x.$j)((function(e){var t=e.goodsManage;return{mpErpId:t.mpErpId,myClientList:t.myClientList}}))(k);Page((0,s.createPageConfig)(C,"subpackages/cloud_bill/pages/my_client_detail_nodata/index",{root:{cn:[]}},{navigationBarTitleText:"客户详情"}||{}))}},function(e){e.O(0,[666,1772,5771,2107,1216,8592],(function(){return t=57054,e(e.s=t);var t}));e.O()}]);