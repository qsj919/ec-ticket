"use strict";require("../../sub-vendors.js");require("../../sub-common/a87b92e095a7a3a37184fd2216bb681f.js");require("../../sub-common/35858c9f2eb671972e5ec0f041d20387.js");require("../../sub-common/1f505238abe2b1c7c14e699592ea7d48.js");require("../../sub-common/c2fe4c6613167eaa1512aa77c00c9382.js");require("../../sub-common/861e33dafec022bf997aff274f67586f.js");require("../../sub-common/32701b3a7b81e965e3a050e700357a5e.js");require("../../sub-common/742ac754f557039d3273f8d60f5a5847.js");require("../../sub-common/249be7c7006b48094919b56adb4aba14.js");require("../../sub-common/41bc791002ccb883588608535cfaa19d.js");require("../../sub-common/3b49a37c81608f9c8c9ef2be9a77422b.js");require("../../sub-common/2938fc46f1d50f345ab2fdb53f98a447.js");require("../../sub-common/5e41b573b152245ea09c9d7c689ed47f.js");require("../../sub-common/43cb21268d0ce3e56eea88a3b184c752.js");require("../../sub-common/f6e4c11c9f23b31ad94656f5adef3beb.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[5448],{70999:function(e,t,i){var s=i(32180),o=i(33661),a=i(12742),n=i(95333),c=i(14175),l=i(92954),r=i.n(l),_=i(67294),d=i(6420),p=i(18453),h=i(66058),u=i(22700),m=i(3701),x=i(71515),k=i(59132),g=i(89728),f=i(17561),S=i(49970),Z=i(75508),v=i(80170),w=i(27863),N=i(30134),C=i(23493),L=i.n(C),y=i(91629),I=i(76449),b=i(63056),T=i(2021),V=i(35314),j=i(24962),D=i(29748),O=i(30968),B=i(62930),M=i(94184),F=i.n(M),P=i(86356),A=i(68272),U=i(85893),K=function(e){(0,n.Z)(i,e);var t=(0,c.Z)(i);function i(){var e;(0,o.Z)(this,i);for(var s=arguments.length,a=new Array(s),n=0;n<s;n++)a[n]=arguments[n];return e=t.call.apply(t,[this].concat(a)),(0,m.Z)((0,u.Z)(e),"onTicketClick",(function(){var t=e.props,i=t.onItemClick,s=t.item;i&&i(s)})),e}return(0,a.Z)(i,[{key:"render",value:function(){var e,t=this.props,i=t.item,s=t.index,o=t.scrollIndex,a=t.shopName,n=i.imgUrls?i.imgUrls.split(",").slice(0,4):[],c="string"==typeof i.logisNo&&""!==i.logisNo;i.diffDeliverNum&&0!==Number(i.diffDeliverNum)&&"(欠".concat(i.diffDeliverNum,")");return"0"===i.sendFlagVal?e="未发货":"1"===i.sendFlagVal?e="部分发":"2"===i.sendFlagVal&&(e="已发货"),(0,U.jsx)(x.View,{onClick:this.onTicketClick,className:F()("ticket_item_container","ticket_item_container--transform",{"ticket_item_container--perspective":o-s>-8&&o-s<1||s<6}),style:{top:(0,l.pxTransform)(this.props.top),height:(0,l.pxTransform)(n.length>0?270:230)},children:(0,U.jsx)(x.View,{className:F()("ticket_cell_container"),children:(0,U.jsxs)(x.View,{className:"ticket_cell",children:["8"===i.orderSource&&(0,U.jsxs)(x.View,{className:"ticket_cell__cloud",children:[(0,U.jsx)(x.View,{className:F()("ticket_cell__cloud__label",(0,m.Z)({},"ticket_cell__cloud__label--send",Number(i.sendFlagVal)>0)),children:"云单"}),(0,U.jsx)(x.View,{className:F()("ticket_cell__cloud__status",(0,m.Z)({},"ticket_cell__cloud__status--send",Number(i.sendFlagVal)>0)),children:e})]}),(0,U.jsx)(x.View,{className:"ticket__shop_avatar",children:(0,U.jsx)(x.Image,{className:"ticket__shop_avatar--img",src:P})}),(0,U.jsx)(x.View,{className:"ticket__custom",children:"客户：".concat(i.dwname)}),(0,U.jsxs)(x.View,{className:"ticket__basic_info",children:[(0,U.jsxs)(x.View,{children:[(0,U.jsxs)(x.View,{className:"ticket__row",children:[(0,U.jsx)(x.Text,{className:"ticket__row__text ticket__row__text--left",children:a}),(0,U.jsx)(x.View,{className:"ticket__row__divider"}),(0,U.jsx)(x.Text,{className:"ticket__row__text",children:"NO.".concat(i.billno)})]}),(0,U.jsxs)(x.View,{className:"ticket__row ticket__row--second",children:[(0,U.jsx)(x.Text,{className:"ticket__row__text ticket__row__text--left",children:i.prodate}),(0,U.jsx)(x.Text,{className:"ticket__row__text",children:"".concat(i.totalnum,"件/¥").concat(i.totalmoney)})]})]}),(0,U.jsxs)(x.View,{className:"ticket__row_last",children:[(0,U.jsx)(x.View,{className:"ticket__row__images",children:n.map((function(e,t){return(0,U.jsx)(x.Image,{src:e,className:"goods_image",style:{left:(0,l.pxTransform)(36*t)}},e)}))}),c&&(0,U.jsx)(x.Image,{className:"ticket__row__express",src:A})]})]})]})})},i.billno)}}]),i}(_.PureComponent);(0,m.Z)(K,"defaultProps",{item:{details:{sub:[]}}});var J={ticketWrapper:"index-module__ticketWrapper___YbOmZ",tips:"index-module__tips___CUO9X",tipsIcon:"index-module__tipsIcon___miy9u",showTips:"index-module__showTips___pzXEt",modal:"index-module__modal___RoWU9",closeIcon:"index-module__closeIcon___sG7s8",tipsImg:"index-module__tipsImg___l6wWy",img:"index-module__img___pQbqu",tabList:"index-module__tabList___sHGFU",top:"index-module__top___jwTK7",returnBtn:"index-module__returnBtn___LqcQq",topDateSel:"index-module__topDateSel___eNGlA",calendarIcon:"index-module__calendarIcon___hgNdh",checkStatistic:"index-module__checkStatistic___zY9f_",nonCheckStatistic:"index-module__nonCheckStatistic___UUSFU",ticketBatch:"index-module__ticketBatch___cNe2J",ticketClient:"index-module__ticketClient___a6ekB",eTicketBody:"index-module__eTicketBody___uUEum",shopList:"index-module__shopList___pMaPh",shopList__search:"index-module__shopList__search___JgTOi",shopList__search__icon:"index-module__shopList__search__icon___sVibW",shopList__search__input:"index-module__shopList__search__input___JE0lk",shopList__search__cancel:"index-module__shopList__search__cancel___zzg7S",hideShopList:"index-module__hideShopList___NrJaD",hideArrowImg:"index-module__hideArrowImg___zCB85",ticketList:"index-module__ticketList___MOeaB",search:"index-module__search___PrY78",searchLeft:"index-module__searchLeft___QbGtS",searchRight:"index-module__searchRight___MDIZF",count:"index-module__count___mdHnl",micro_mall:"index-module__micro_mall___DJBz5",cloud_bill_btn:"index-module__cloud_bill_btn___XHAbJ",telLeft:"index-module__telLeft___QPGXf",telRight:"index-module__telRight___LHLH7",scrollView:"index-module__scrollView___bc2ok",ticketItem:"index-module__ticketItem___wjR8w",ticketTop:"index-module__ticketTop___s0ory",ticketDate:"index-module__ticketDate___D28uo",batch:"index-module__batch___fN_YE",ticketMiddle:"index-module__ticketMiddle___uBHdk",ticketMoney:"index-module__ticketMoney___EoCs6",ticketNumber:"index-module__ticketNumber___hMKNK",ticketDetail:"index-module__ticketDetail___wDdjI",money:"index-module__money___5uNQz",number:"index-module__number___HLa2q",detailButton:"index-module__detailButton___bnUKO",ticketBottom:"index-module__ticketBottom___ECASZ",ticketClerk:"index-module__ticketClerk___iYrtV",client:"index-module__client___jriiF",clerk:"index-module__clerk___GGxFe",noData:"index-module__noData___J6tM8",invite_cloud:"index-module__invite_cloud___vB4em",invite_cloud__buttons:"index-module__invite_cloud__buttons___CKBBu",invite_cloud__img:"index-module__invite_cloud__img___BRSMI",invite_cloud__text:"index-module__invite_cloud__text___p7jCh",invite_cloud__btn:"index-module__invite_cloud__btn___GtYbN",invite_cloud__go_replenish:"index-module__invite_cloud__go_replenish___XdYVh",noDataPage:"index-module__noDataPage___eOr6O",center:"index-module__center___cocJ7",login_btn:"index-module__login_btn___rVR7P"},W=[{title:"拿货单"},{title:"订货单"}],G=function(e){(0,n.Z)(i,e);var t=(0,c.Z)(i);function i(e){var s,a;(0,o.Z)(this,i),a=t.call(this,e),(0,m.Z)((0,u.Z)(a),"config",{navigationBarTitleText:"电子小票"}),(0,m.Z)((0,u.Z)(a),"scale",1),(0,m.Z)((0,u.Z)(a),"scrollTopValues",[]),(0,m.Z)((0,u.Z)(a),"initListData",(function(){var e=a.props,t=e.shopList,i=e.shopId;a.state.params;if(t.length>0){for(var s=0,o=0;o<t.length;o++){var n=t[o];if(String(n.shopid)===String(i)){s=o;break}}a.setState({checkShopIndex:s}),a.onShopNameClick(t[s],s)}})),(0,m.Z)((0,u.Z)(a),"getListData",(function(e){var t=a.props.sessionId;e=(0,h.Z)((0,h.Z)({},e),{},{sessionId:t}),3===a.props.ticketType&&(e=(0,h.Z)((0,h.Z)({},e),{},{orderSource:"8"})),e.sn&&e.epid&&(0,D.g9)(e).then((function(t){r().hideLoading(),0===e.pageOffset?a.setState({ticketList:t.data.dataList,pageOffset:e.pageOffset,count:t.data.count,statistics:t.data.sumrow}):a.setState((function(i){return{ticketList:[].concat((0,p.Z)(i.ticketList),(0,p.Z)(t.data.dataList)),pageOffset:e.pageOffset,count:t.data.count,statistics:t.data.sumrow}}))})).catch((function(e){r().hideLoading(),a.setState({count:"0",ticketList:[]}),console.log("err :",e)}))})),(0,m.Z)((0,u.Z)(a),"onTipsClick",(function(){var e=a.props,t=e.shopList,i=e.subscribe,s="normal";t.length>0&&"1"!==i?s="phone":0===t.length&&"0"===i&&(s="public"),v.Z.track(j.ZP.showWxQrCodeInHome,{type:s})})),(0,m.Z)((0,u.Z)(a),"hideFollowGuide",(function(){})),(0,m.Z)((0,u.Z)(a),"onTabListClick",(function(e,t){var i=a.state,s=i.params,o=i.start,n=i.end,c=i.searchValue,l=a.props.sessionId;r().createSelectorQuery().in(r().getCurrentInstance().page).select("#tab-list-cover").boundingClientRect((function(i){var r=i.width/W.length,_=a.createAnimation(e,r),d=(0,h.Z)((0,h.Z)({},s),{},{sessionId:l,prodate1:o,prodate2:n,pageOffset:0,type:e+1,styleName:c});a.setState({listCurrent:e,listAnimation:_,pageOffset:0,type:e+1+"",ticketList:[]},(function(){t||a.getListData(d)}))})).exec()})),(0,m.Z)((0,u.Z)(a),"onMicroMallClick",(function(){var e=a.state.activeShop;v.Z.track(j.ZP.navigateToMicroMall,{source:"list",tenantid:String(e.mallTenantId)}),r().navigateToMiniProgram({appId:e.mallWxApppId,path:"pages/index/index?page=shop&tenantId=".concat(e.mallTenantId)})})),(0,m.Z)((0,u.Z)(a),"onCloudOrderClick",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w.yK.all,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"list",i=a.state.activeShop;if(i&&i.id){var s=i.id;a.props.dispatch({type:"cloudBill/init",payload:{mpErpId:s,cloudType:e,cloudSource:w.o0.TICKET_LIST}}),v.Z.track(j.ZP.enterCloudBillClick,{source:t,cloud_type:e}),y.Z.navigateTo({url:"/subpackages/cloud_bill/pages/all_goods/index?type=".concat(e)})}})),(0,m.Z)((0,u.Z)(a),"onNotiCloudOrderClick",(function(){var e=a.state.activeShop;if(e&&e.id){var t=e.id;b.Z.showToast("该商家未开通该服务，已为您提醒ta开通",2e3),v.Z.track(j.ZP.inviteOpenCloudClick,{erpid:String(t)}),(0,I.o2)({mpErpId:t})}})),(0,m.Z)((0,u.Z)(a),"createAnimation",(function(e,t){var i=e*t;return r().createAnimation({duration:450,timingFunction:"ease-out",transformOrigin:"0 0"}).translateX(i).step().export()})),(0,m.Z)((0,u.Z)(a),"onScrollToUpper",(function(){var e=a.state,t=e.params,i=e.pageOffset,s=e.start,o=e.end,n=e.searchValue,c=e.type;if(0!==i){var l=(0,h.Z)((0,h.Z)({},t),{},{prodate1:s,prodate2:o,pageOffset:0,styleName:n,type:c});a.getListData(l),a.setState({pageOffset:0})}})),(0,m.Z)((0,u.Z)(a),"onScrollToLower",(function(){var e=a.state,t=e.params,i=e.pageOffset,s=e.start,o=e.end,n=e.searchValue,c=e.type,l=e.count,r=i+20;if(!(r>Number(l))){var _=(0,h.Z)((0,h.Z)({},t),{},{prodate1:s,prodate2:o,pageOffset:r,styleName:n,type:c});a.getListData(_),a.setState({pageOffset:r})}})),(0,m.Z)((0,u.Z)(a),"onScroll",(function(e){for(var t=e.target,i=a.state.scrollIndex,s=0,o=0;o<a.scrollTopValues.length-1;o++){var n=a.scrollTopValues[o]*a.scale,c=a.scrollTopValues[o+1]*a.scale;if(t.scrollTop>n&&t.scrollTop<c||t.scrollTop>c&&o===a.scrollTopValues.length-2){s=o;break}}s!==i&&a.setState({scrollIndex:s})})),(0,m.Z)((0,u.Z)(a),"onCheckDetailClick",(function(e){var t=a.state,i=t.params,s=t.type,o=a.props.sessionId,n="pk=".concat(e.billid,"&sn=").concat(e.sn,"&epid=").concat(e.epid,"&sessionId=").concat(o,"&shopId=").concat(i.shopid,"&type=").concat(s);y.Z.navigateTo({url:"/pages/eTicketDetail/landscapeModel?".concat(n)})})),(0,m.Z)((0,u.Z)(a),"onShopNameClick",(function(e,t){var i=a.state,s=i.params,o=i.start,n=i.end,c=i.searchValue,l=i.type,_={epid:e.epid,sn:e.sn,shopid:e.shopid,pageOffset:0,prodate1:o,prodate2:n,styleName:c,type:l};a.setState({activeShop:e,checkShopIndex:t,ticketList:[],params:{menuBtn:s.menuBtn,subscribe:s.subscribe,shopName:e.shopName,sessionId:s.sessionId,shopid:e.shopid,epid:e.epid,pk:s.pk,sn:e.sn},shopSearchMode:!1}),r().showLoading({mask:!0,title:""}),a.getListData(_)})),(0,m.Z)((0,u.Z)(a),"onDateSelectorClick",(function(){a.setState({showDateModal:!0})})),(0,m.Z)((0,u.Z)(a),"onDateSelCancel",(function(){a.setState({showDateModal:!1})})),(0,m.Z)((0,u.Z)(a),"onConfimDateClick",(function(e,t){var i=a.state,s=i.params,o=i.searchValue,n=i.type,c="".concat(e," 至 ").concat(t),l=(0,h.Z)((0,h.Z)({},s),{},{prodate1:e,prodate2:t,pageOffset:0,styleName:o,type:n});a.getListData(l),a.setState({date:c,start:e,end:t,showDateModal:!1})})),(0,m.Z)((0,u.Z)(a),"onSearchChange",(function(e){a.setState({searchValue:e})})),(0,m.Z)((0,u.Z)(a),"onSearchClick",(function(){v.Z.track(j.ZP.ticketListSearch);var e=a.state,t=e.params,i=e.start,s=e.end,o=e.searchValue,n=e.type,c=(0,h.Z)((0,h.Z)({},t),{},{prodate1:i,prodate2:s,pageOffset:0,styleName:o,type:n});a.getListData(c),a.setState({pageOffset:0})})),(0,m.Z)((0,u.Z)(a),"onHideArrowClick",(function(){a.setState((function(e){return{showShopList:!e.showShopList}}))})),(0,m.Z)((0,u.Z)(a),"onDateTabClick",(function(e,t,i,s){v.Z.track(j.ZP.listDateTabClick,{days:t.value});var o=a.state,n=o.params,c=o.searchValue,l=o.type,r="".concat(i," 至 ").concat(s),_=(0,h.Z)((0,h.Z)({},n),{},{prodate1:i,prodate2:s,pageOffset:0,styleName:c,type:l});a.getListData(_),a.setState({date:r,start:i,end:s,showDateModal:!1})})),(0,m.Z)((0,u.Z)(a),"onShopSearchFocus",(function(){a.setState({shopSearchMode:!0})})),(0,m.Z)((0,u.Z)(a),"onCancelShopSearch",(function(){a.setState({shopSearchMode:!1,shopSearchKey:""})})),(0,m.Z)((0,u.Z)(a),"onShopSearchInput",L()((function(e){a.setState({shopSearchKey:e.detail.value})}),200)),(0,m.Z)((0,u.Z)(a),"getFilteredShopList",(function(){var e=a.props.shopList,t=a.state.shopSearchKey;return e.filter((function(e){return!t||e.shopName.includes(t)}))}));var n=(0,d.JU)(null===(s=r().getCurrentInstance)||void 0===s?void 0:s.call(r()));return a.state={showNoData:!1,date:"",start:"",end:"",showDateModal:!1,searchValue:"",listCurrent:0,listAnimation:null,checkShopIndex:0,ticketList:[],pageOffset:0,params:{menuBtn:n.menuBtn,shopName:n.shopName,sessionId:n.sessionId,subscribe:n.subscribe,shopid:n.shopId,epid:n.epid,pk:n.pk,sn:n.sn},count:"0",type:(3===e.ticketType?2:e.ticketType)||n.type||"1",scrollIndex:0,showShopList:!0,statistics:{balanceTotal:"",modelClass:"",scoreTotal:"",totalmoney:"",totalnum:""},activeShop:{},shopSearchKey:"",shopSearchMode:!1},a}return(0,a.Z)(i,[{key:"UNSAFE_componentWillMount",value:function(){this.state.params,this.props.sessionId;var e=(0,d.GB)(),t=(0,d.GB)(new Date(e.replace(/-/g,"/")).getTime()-1296e6);this.setState({date:t+" 至 "+e,start:t,end:e})}},{key:"componentDidMount",value:function(){var e=r().getSystemInfoSync().windowWidth;this.scale=e/750,V.Z.log("didmount;session=".concat(this.props.sessionId,";loaded=").concat(this.props.shopListLoaded)),this.props.sessionId&&this.props.shopListLoaded&&this.initListData()}},{key:"componentDidUpdate",value:function(e){e.shopListLoaded!==this.props.shopListLoaded&&(V.Z.log("update"),this.initListData())}},{key:"componentDidShow",value:function(){var e=this.state,t=e.activeShop,i=e.checkShopIndex,s=this.props.sessionId,o=this.getFilteredShopList(),a=o[i];a&&t.id!==a.id&&s&&(this.setState({checkShopIndex:0}),this.onShopNameClick(o[0],0))}},{key:"render",value:function(){var e=this,t=this.state,i=t.showNoData,s=t.checkShopIndex,o=(t.showDateModal,t.date,t.start,t.end,t.type,t.searchValue),a=t.ticketList,n=t.count,c=t.params,l=t.showShopList,r=t.listCurrent,_=(t.listAnimation,t.statistics,t.activeShop),d=t.shopSearchMode,p=this.props,h=(p.subscribe,p.shopList,p.ticketType),u=this.getFilteredShopList(),m=20,Z=!0,v=3===h&&(_.cloudBillFlag===w.PC.never||_.cloudBillFlag===w.PC.expire)&&1===_.saasType;return(0,U.jsxs)(x.View,{style:{height:"100%"},children:[!i&&(0,U.jsxs)(x.View,{className:J.ticketWrapper,id:"ticket-wrapper",children:[(0,U.jsx)(x.View,{className:J.top,children:(0,U.jsx)(N.Z,{onTabClick:this.onDateTabClick,onDateConfirm:this.onConfimDateClick})}),(0,U.jsxs)(x.View,{className:J.eTicketBody,children:[(0,U.jsxs)(x.View,{className:J.shopList,style:d?{width:"100%"}:l?{}:{width:0},children:[(0,U.jsxs)(x.View,{className:J.shopList__search,children:[(0,U.jsx)(x.Image,{src:f,className:J.shopList__search__icon}),(0,U.jsx)(x.Input,{className:J.shopList__search__input,value:this.state.shopSearchKey,onFocus:this.onShopSearchFocus,onInput:this.onShopSearchInput,placeholder:"搜索"}),d&&(0,U.jsx)(x.Text,{className:J.shopList__search__cancel,onClick:this.onCancelShopSearch,children:"取消"})]}),(0,U.jsx)(x.ScrollView,{scrollY:!0,scrollWithAnimation:!0,className:J.shopScrollView,children:u.map((function(t,i){return(0,U.jsx)(O.Z,{index:i,shopItem:t,checkShopIndex:d?-1:s,onShopNameClick:e.onShopNameClick,activeColor:0===r?"#F2503D":"#FF9933"},i)}))})]}),!d&&(0,U.jsx)(x.View,{className:J.hideShopList,onClick:this.onHideArrowClick,style:l?{}:{left:0},children:(0,U.jsx)(x.Image,{src:S,className:J.hideArrowImg,style:l?{}:{transform:"rotateY(180deg)"}})}),(0,U.jsxs)(x.View,{className:J.ticketList,style:{display:d?"none":"block"},children:[(0,U.jsxs)(x.View,{className:J.search,children:[(0,U.jsxs)(x.View,{className:J.searchLeft,children:[(0,U.jsx)(x.Image,{src:f,className:J.img}),(0,U.jsx)(k.AtInput,{name:"",title:"",clear:!0,className:"flex1 bg",border:!1,placeholder:"请输入款号/名称",value:o,onChange:this.onSearchChange,onConfirm:this.onSearchClick})]}),(0,U.jsx)(x.View,{onClick:this.onSearchClick,className:J.searchRight,children:"搜索"})]}),(0,U.jsxs)(x.View,{className:J.count,children:[(0,U.jsxs)(x.View,{children:["共",n,"条单据"]}),_.cloudBillFlag===w.PC.open?(0,U.jsx)(x.Image,{src:B,onClick:function(){return e.onCloudOrderClick()},className:J.cloud_bill_btn}):!v&&(_.cloudBillFlag===w.PC.never||_.cloudBillFlag===w.PC.expire)&&1===_.saasType&&(0,U.jsx)(x.View,{className:J.micro_mall,onClick:function(){return e.onCloudOrderClick(w.yK.replenishment)},children:"去补货"})]}),a.length>0?(0,U.jsx)(x.ScrollView,{className:J.scrollView,scrollY:!0,scrollWithAnimation:!0,onScrollToUpper:this.onScrollToUpper,onScrollToLower:this.onScrollToLower,onScroll:this.onScroll,style:l?{}:{width:"100%"},children:a.map((function(t,i){var s=i>0?m+178+(Z?50:0):m;return m=s,e.scrollTopValues[i]=m,Z="string"==typeof t.imgUrls&&""!==t.imgUrls,(0,U.jsx)(K,{item:t,index:i,scrollIndex:e.state.scrollIndex,shopName:c.shopName,onItemClick:e.onCheckDetailClick,top:s},t.billno)}))}):(0,U.jsx)(x.View,{children:v?(0,U.jsxs)(x.View,{className:J.invite_cloud,children:[(0,U.jsx)(x.Image,{src:T.Z.empty.eticket_invite_cloud,className:J.invite_cloud__img}),(0,U.jsx)(x.Text,{className:J.invite_cloud__text,children:"商家暂未开通在线下单"}),(0,U.jsx)(x.View,{className:J.invite_cloud__btn,onClick:this.onNotiCloudOrderClick,children:"邀请开通"}),(0,U.jsx)(x.View,{className:J.invite_cloud__go_replenish,onClick:function(){return e.onCloudOrderClick(w.yK.replenishment,"tab")},children:"前往补货"})]}):(0,U.jsx)(x.View,{className:J.noData,children:"暂无数据"})})]})]})]}),i&&(0,U.jsxs)(x.View,{className:J.noDataPage,children:[(0,U.jsx)(x.Image,{src:g,className:J.img}),(0,U.jsx)(x.View,{children:"暂无数据"})]})]})}}]),i}(_.Component),E=(0,Z.$j)((function(e){var t=e.user,i=e.shop;return{sessionId:t.sessionId,shopList:i.list,shopListLoaded:i.shopListLoaded,subscribe:t.subscribe,phone:t.phone}}))(G),H=function(e){(0,n.Z)(i,e);var t=(0,c.Z)(i);function i(){var e,s;(0,o.Z)(this,i),s=t.call(this);var a=(0,d.JU)(null===(e=r().getCurrentInstance)||void 0===e?void 0:e.call(r())).shopId;return s.state={shopId:a},s}return(0,a.Z)(i,[{key:"render",value:function(){return(0,U.jsx)(E,{ticketType:3,shopId:this.state.shopId})}}]),i}(_.PureComponent);Page((0,s.createPageConfig)(H,"subpackages/cloud_bill/pages/bill/index",{root:{cn:[]}},{navigationBarTitleText:"云单小票"}||{}))}},function(e){e.O(0,[7840,8510,7383,3382,3629,3647,5599,6679,4436,4121,9617,3247,2446,520,6339,8915,5365,264,2107,1216,8592],(function(){return t=70999,e(e.s=t);var t}));e.O()}]);