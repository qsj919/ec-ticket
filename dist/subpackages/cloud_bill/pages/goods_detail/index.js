"use strict";require("../../sub-vendors.js");require("../../sub-common/ea5651c74a764b7a53f5764aba833936.js");require("../../sub-common/60464b2b77061df0626bd7ecea16c659.js");require("../../sub-common/1f505238abe2b1c7c14e699592ea7d48.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[1264],{40463:function(e,t,o){var s=o(32180),a=o(57543),i=o(77886),n=o(33661),p=o(12742),r=o(22700),l=o(95333),d=o(14175),c=o(3701),h=o(66058),u=o(92954),g=o.n(u),m=o(67294),I=o(71515),f=o(23493),y=o.n(f),S=o(23279),Z=o.n(S),x=o(75508),v=o(35314),w=o(6420),k=o(86889),b=o(844),C=o(63056),E=o(64401),B=o(6870),_=o(91629),O=o(80170),j=o(7567),M=o(22282),T=o(27863),P=o(14067),N=o(75527),V=o(19497),D=o(31254),U=o(11688),z=o(69558),L=o(62754),H=o(12859),G=o(72026),A=(o(50489),o(63372)),J=o(64782),W=o(89327),R=o(19853),q=o(85893),F=function(e){(0,l.Z)(o,e);var t=(0,d.Z)(o);function o(e){var s,p;return(0,n.Z)(this,o),p=t.call(this,e),(0,c.Z)((0,r.Z)(p),"maxScrollOffset",500),(0,c.Z)((0,r.Z)(p),"init",(0,i.Z)((0,a.Z)().mark((function e(){var t,o,s,i,n,r,l,d,c,u,m,I,f,y;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(o=(0,w.JU)(null===(t=g().getCurrentInstance)||void 0===t?void 0:t.call(g())),s=o.spuId,i=o.mpErpId,n=o.scene,r=void 0===n?"":n,l=wx.getEnterOptionsSync(),v.Z.log("初始化==> scene: ".concat(l.scene)),!s||!i){e.next=14;break}return Number(i)!==p.props.mpErpId&&p.setState({mpErpIdChanged:!0}),p.props.dispatch({type:"cloudBill/save",payload:{mpErpId:i}}),p.props.dispatch({type:"replenishment/save",payload:{mpErpId:i}}),d={},d=T.oG.includes(l.scene)?{spuId:s,appScene:"channelLive"}:{spuId:s},p.props.dispatch({type:"cloudBill/fetchVideoPageDataByMpErpId",payload:{mpErpId:i}}),p.props.dispatch({type:"cloudBill/fetchGoodsDetail",payload:(0,h.Z)({},d)}),e.next=13,p.initShopParams(i);case 13:T.oG.includes(l.scene)&&p.props.dispatch({type:"replenishment/fetchCartGoodsList"});case 14:r&&p.props.sessionId&&(c=decodeURIComponent(r).split(","),p.props.dispatch({type:"cloudBill/save",payload:{mpErpId:c[0]}}),p.props.dispatch({type:"replenishment/save",payload:{mpErpId:c[0]}}),u={},u=T.oG.includes(l.scene)?{spuId:c[1],appScene:"channelLive"}:{spuId:c[1]},p.props.dispatch({type:"cloudBill/fetchGoodsDetail",payload:(0,h.Z)({},u)}),p.props.dispatch({type:"cloudBill/fetchVideoPageDataByMpErpId",payload:{mpErpId:c[0]}}),p.initShopParams(c[0])),p.initEnbleOperate(),(m=p.props.shopList.find((function(e){return Number(e.id)===Number(p.props.mpErpId)})))&&(I=m.sn,f=m.epid,y=m.shopid,O.Z.trackToBigData({sn:I,epid:f,shop:y,data:[{key:"enter_cloud",value:1}],tag:{page:T.G2.DETAIL}}));case 18:case"end":return e.stop()}}),e)})))),(0,c.Z)((0,r.Z)(p),"initInMomentsMode",(function(){var e,t=(0,w.JU)(null===(e=g().getCurrentInstance)||void 0===e?void 0:e.call(g())),o=t.spuId,s=t.mpErpId,a=(t.scene,wx.getEnterOptionsSync());if(v.Z.log("初始化==> scene: ".concat(a.scene)),a.scene===D.vL&&o&&s){p.setState({isInMomentsMode:!0}),p.props.dispatch({type:"cloudBill/save",payload:{mpErpId:s}}),p.props.dispatch({type:"replenishment/save",payload:{mpErpId:s}});var i={spuId:o,isIgnoreGroupNum:!0};(0,P.Nk)({mpErpId:s}).then((function(e){var t=e.data;p.setState({isOperate:"1"!==t.val}),console.log("1"===t.val,"开启访客认证··"),p.props.dispatch({type:"cloudBill/fetchGoodsDetail",payload:(0,h.Z)({},i)})}))}})),(0,c.Z)((0,r.Z)(p),"initEnbleOperate",(function(){var e;(0,P.Er)({mpErpId:(0,w.JU)(null===(e=g().getCurrentInstance)||void 0===e?void 0:e.call(g())).mpErpId||p.props.mpErpId,mpUserId:p.props.mpUserId}).then((function(e){var t=e.data;p.setState({isOperate:t.val})}))})),(0,c.Z)((0,r.Z)(p),"initShopParams",function(){var e=(0,i.Z)((0,a.Z)().mark((function e(t){return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return p.props.dispatch({type:"goodsManage/selectShopParamSpuShowInv",payload:{mpErpId:t}}),p.props.dispatch({type:"goodsManage/fetchGoodsMarketStrategy",payload:{mpErpId:t}}),e.next=4,p.props.dispatch({type:"goodsManage/selectShopParamSpuShowPrice",payload:{mpErpId:t,erpParamFirst:!1,mpUserId:p.props.mpUserId}});case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),(0,c.Z)((0,r.Z)(p),"onBackClick",(function(){g().getCurrentPages().length>1?g().navigateBack():p.props.sessionId&&g().switchTab({url:"/pages/eTicketList/index"})})),(0,c.Z)((0,r.Z)(p),"getShareInfo",(function(){var e,t=(0,w.JU)(null===(e=g().getCurrentInstance)||void 0===e?void 0:e.call(g())),o=t.mpErpId,s=t.spuId;return o&&s||(o=p.props.mpErpId,s=p.props.spuId),{mpErpId:o,spuId:s}})),(0,c.Z)((0,r.Z)(p),"onPageScroll",(function(e){var t=e.scrollTop;p.onScroll(t)})),(0,c.Z)((0,r.Z)(p),"onScroll",y()((function(e){var t;if(e>p.maxScrollOffset)return 1===p.state.stickyHeaderOpacity?void 0:p.setState({stickyHeaderOpacity:1});if(e<=10)t=.03*e;else{if(!(e<=p.maxScrollOffset))return;t=e*(.7/p.maxScrollOffset)+.3}p.setState({stickyHeaderOpacity:t})}),50)),(0,c.Z)((0,r.Z)(p),"onColorSizeVisibleChanged",(function(e){p.props.dispatch({type:"cloudBill/save",payload:{colorSizeVisible:e}})})),(0,c.Z)((0,r.Z)(p),"showColorSizeModel",(function(e){p.props.dispatch({type:"cloudBill/save",payload:{colorSizeVisible:!0}}),p.setState({selectColorSizeType:e})})),(0,c.Z)((0,r.Z)(p),"onSaveClick",(function(e){p.props.dispatch({type:"cloudBill/onColorSizeConfirm",payload:{type:e||p.state.selectColorSizeType}})})),(0,c.Z)((0,r.Z)(p),"downloadImages",Z()((function(){p.props.isImageDownloading||p.props.dispatch({type:"cloudBill/fetchImageUrls"})}),400)),(0,c.Z)((0,r.Z)(p),"gotoShop",(function(){var e=g().getCurrentPages(),t=e[e.length-2];t&&"subpackages/cloud_bill/pages/all_goods/index"===t.is&&!p.state.mpErpIdChanged?g().navigateBack():g().navigateTo({url:"/subpackages/cloud_bill/pages/all_goods/index?mpErpId=".concat(p.props.mpErpId)})})),(0,c.Z)((0,r.Z)(p),"gotoCart",(function(){p.state.isInMomentsMode?C.Z.showAlert("请前往小程序体验完成服务","","好的"):p.state.isOperate?_.Z.navigateTo({url:"/subpackages/cloud_bill/pages/replenishment/index"}):C.Z.showAlert("请等待商家审核通过","","好的")})),(0,c.Z)((0,r.Z)(p),"onLeftBtnClick",(function(){p.state.isInMomentsMode?C.Z.showToast("请前往小程序使用完整服务"):p.state.isOperate?p.showColorSizeModel("addCart"):C.Z.showAlert("请等待商家审核通过","","好的")})),(0,c.Z)((0,r.Z)(p),"onRightBtnClick",(function(){p.state.isInMomentsMode?C.Z.showToast("请前往小程序使用完整服务"):p.state.isOperate?p.showColorSizeModel("buy"):C.Z.showAlert("请等待商家审核通过","","好的")})),p.state={selectColorSizeType:"buy",enableBack:!0,stickyHeaderOpacity:0,fromShare:!1,isOperate:!1,mpErpIdChanged:!1,isInMomentsMode:(0,w.JU)(null===(s=g().getCurrentInstance)||void 0===s?void 0:s.call(g())).scene===D.vL},p.maxScrollOffset=500-e.navigationHeight-e.statusBarHeight,p}return(0,p.Z)(o,[{key:"componentDidMount",value:function(){this.props.sessionId&&this.init(),this.initInMomentsMode()}},{key:"componentDidUpdate",value:function(e){v.Z.log("didupdate，data:".concat(JSON.stringify(this.props.data))),!e.sessionId&&this.props.sessionId&&this.init()}},{key:"componentWillUnmount",value:function(){this.props.dispatch({type:"cloudBill/resetGoods"})}},{key:"onShareAppMessage",value:function(e){var t=this.props.goodsDetail,o=this.getShareInfo(),s=o.mpErpId,a=o.spuId;return{title:t.name,path:"subpackages/cloud_bill/pages/goods_detail/index?mpErpId=".concat(s,"&spuId=").concat(a),imageUrl:t.imgUrlBig}}},{key:"onShareTimeline",value:function(){var e=this.props.goodsDetail,t=this.getShareInfo(),o=t.mpErpId,s=t.spuId;return{title:e.name,path:"subpackages/cloud_bill/pages/goods_detail/index?mpErpId=".concat(o,"&spuId=").concat(s),query:"mpErpId=".concat(o,"&spuId=").concat(s),imageUrl:e.imgUrlBig}}},{key:"render",value:function(){var e=this,t=this.props,o=t.goodsDetail,s=t.navigationHeight,a=t.statusBarHeight,i=t.model,n=t.colorSizeVisible,p=t.totalNumWithoutChecked,r=(t.goodsParams,t.isSoldOut,t.showPrice),l=t.shopShowSpu,d=t.shopShowSoldOut,c=t.data,h=t.mpErpId,u=t.goodsError,m=this.state,f=(m.fromShare,m.isOperate),y=m.isInMomentsMode,S=this.props.shopList.find((function(t){return Number(t.id)===Number(e.props.mpErpId)}));i.toLowerCase().includes("iphone x"),E.Z.t._("addToCart"),E.Z.t._("buyNow");return(0,q.jsxs)(I.Block,{children:[(0,q.jsx)(b.Z,{stickyTop:!0,enableBack:this.state.enableBack,disableIphoneXPaddingBottom:!0,containerClass:"custom_goods_detail_container",onBackClick:this.onBackClick,children:u.isError?(0,q.jsx)(V.Z,{style:{height:"100vh"},emptyInfo:{image:"https://webdoc.hzecool.com/webCdn/weapp/ec-ticket/src/subpackages/cloud_bill/pages/goods_detail/a8edab9da1cf314f5ef5..png",label:u.label||"出错啦～"},needShowButton:!0,buttonLabel:1===g().getCurrentPages().length?"去看看":"返回",onButtonClick:this.onBackClick}):(0,q.jsxs)(I.View,{style:"padding-bottom: 168rpx",children:[(0,q.jsx)(I.View,{className:"sticky_header",style:{paddingTop:"".concat(a,"px"),height:"".concat(s,"px"),opacity:this.state.stickyHeaderOpacity},children:(0,q.jsx)(I.Text,{className:"title",children:E.Z.t._("goodsDetail")})}),(0,q.jsxs)(I.View,{className:"goods_detail_page",children:[(0,q.jsx)(I.ScrollView,{className:"scroll_container",scrollY:!0,scrollWithAnimation:!0,scrollTop:0,children:(0,q.jsxs)(I.View,{className:"goods_detail_container",children:[(0,q.jsxs)(I.View,{className:"image_viewer_container",children:[(0,q.jsx)(U.Z,{disableDownload:!f,medias:o.medias,onDownLoadClick:this.downloadImages}),!f&&(0,q.jsx)(I.View,{className:"blur_goods",children:y&&(0,q.jsxs)(I.View,{className:"blue_goods__moment_tip",children:[(0,q.jsx)(I.Text,{children:"商家已开启访客模式"}),(0,q.jsx)(I.View,{children:"请在底部点击“前往小程序”查看详情"})]})})]}),(0,q.jsx)(I.View,{className:"goods_info",children:(0,q.jsx)(L.Z,{shopShowSoldOut:d,shopShowSpu:l,goods:o,hidePrice:!r||!f,hideShare:S&&1===S.independentType||!f,showSizeItems:S&&S.industries})})]})}),(0,q.jsx)(I.View,{className:"bottom_container",children:(0,q.jsxs)(I.View,{className:"action_button_container",children:[(0,q.jsx)(J.Z,{customerStyle:"margin-right: 20rpx;".concat("padding-right: 10rpx"),src:G,imageStyle:"width: 54rpx; height: 54rpx;",textStyle:"font-size: ".concat(B.Z.font20WithTransformed,"; color: ").concat(k.Z.normalTextColor,"; white-space: nowrap;"),title:E.Z.t._("tab_bar_5"),maxBadge:99,onClick:this.gotoShop}),(0,q.jsx)(J.Z,{customerStyle:"margin-right: 20rpx;",src:H,imageStyle:"width: 54rpx; height: 54rpx;",textStyle:"font-size: ".concat(B.Z.font20WithTransformed,"; color: ").concat(k.Z.normalTextColor,"; white-space: nowrap;"),title:E.Z.t._("tab_bar_3"),badge:p,maxBadge:99,onClick:this.gotoCart}),!1,(0,q.jsx)(I.View,{style:{display:"flex",flex:1,width:"90%",justifyContent:"flex-end"},children:(0,q.jsx)(R.Z,{leftBtnConfig:{text:"加进货车",onClick:this.onLeftBtnClick},rightBtnConfig:{text:"立即下单",onClick:this.onRightBtnClick}})})]})})]}),(0,q.jsx)(M.Z,{})]})}),(0,q.jsx)(N.Z,{scanError:c.scanError,mpErpId:h,notStickyTop:!0}),(0,q.jsx)(I.View,{style:"z-index: 500",children:(0,q.jsx)(z.Z,{onSaveClick:this.onSaveClick,visible:n,type:this.state.selectColorSizeType},"goods_detail")}),(0,q.jsx)(W.Z,{shop:S})]})}}]),o}(m.PureComponent),X=(0,x.$j)((function(e){var t=e.cloudBill,o=e.replenishment,s=e.systemInfo,a=e.user,i=e.shop,n=e.imageDownload,p=e.goodsManage,r=i.list.find((function(e){return e.id===t.mpErpId}));return{goodsDetail:t.goodsDetail,sessionId:a.sessionId,navigationHeight:s.navigationHeight,statusBarHeight:s.statusBarHeight,model:s.model,colorSizeVisible:t.colorSizeVisible,totalNumWithoutChecked:(0,j.NU)(o.spus).totalNumWithoutChecked,goodsParams:A.Z.goodsParamsSelector(t),shopList:i.list,mpErpId:t.mpErpId,spuId:t.spuId,isImageDownloading:n.downLoadding,isSoldOut:A.Z.goodsSoldOutSelector((0,h.Z)((0,h.Z)({},p),t)),showPrice:"1"===t.shopParams.spuShowPrice,shopShowSpu:"1"===p.shopShowSpu,shopShowSoldOut:"1"===p.shopShowSoldOut,mpUserId:a.mpUserId,data:t.videoPageData,shop:r,goodsError:t.goodsError}}))(F);X.enableShareTimeline=!0,X.enableShareAppMessage=!0;Page((0,s.createPageConfig)(X,"subpackages/cloud_bill/pages/goods_detail/index",{root:{cn:[]}},{navigationBarTitleText:"",navigationStyle:"custom"}||{}))}},function(e){e.O(0,[666,1772,6690,3658,3382,2107,1216,8592],(function(){return t=40463,e(e.s=t);var t}));e.O()}]);