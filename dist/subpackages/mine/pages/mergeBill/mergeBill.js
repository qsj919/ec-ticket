"use strict";require("../../sub-vendors.js");require("../../sub-common/901201441b9d764a5c1f6ca8a54cc278.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[5497],{6654:function(e,a,s){var l=s(32180),i=s(66058),r=s(33661),n=s(12742),o=s(22700),t=s(95333),c=s(14175),m=s(3701),u=s(92954),d=s.n(u),_=s(67294),p=s(71515),h=s(35959),N=s.n(h),g=s(80170),w=s(6420),x=s(24962),f=s(29748),V=s(59009),j=s(65941),v="mergeBillList-module__listFormWrapper___zwOZW",B="mergeBillList-module__listFormTitle____CQad",I="mergeBillList-module__listFormRow___Gr8xV",z="mergeBillList-module__listFormSum___Htq9V",b="mergeBillList-module__code___E041q",k="mergeBillList-module__image___p8Goy",y="mergeBillList-module__imgCover___stfMz",F="mergeBillList-module__img___J_UnA",M="mergeBillList-module__name___N0LHL",Z="mergeBillList-module__num___inTHy",L="mergeBillList-module__price___aWGBD",C="mergeBillList-module__money___wAqFf",G="mergeBillList-module__color___GwLZm",A="mergeBillList-module__size___GFGnB",P=s(85893),S=function(e){(0,t.Z)(s,e);var a=(0,c.Z)(s);function s(e){return(0,r.Z)(this,s),a.call(this,e)}return(0,n.Z)(s,[{key:"render",value:function(){var e=this.props.rows,a=0;return e.forEach((function(e){a+=e.totalNum,e.sumNum=a})),(0,P.jsxs)(p.View,{className:v,children:[(0,P.jsxs)(p.View,{className:B,children:[(0,P.jsx)(p.View,{className:b,children:(0,j.t)("code")}),(0,P.jsx)(p.View,{className:k,children:(0,j.t)("image")}),(0,P.jsx)(p.View,{className:M,children:(0,j.t)("name")}),(0,P.jsx)(p.View,{className:G,children:(0,j.t)("color")}),e[0].sizeNumArr.map((function(e,a){return(0,P.jsx)(p.View,{className:A,children:e.name},a)})),(0,P.jsx)(p.View,{className:Z,children:(0,j.t)("number")}),(0,P.jsx)(p.View,{className:L,children:(0,j.t)("price")}),(0,P.jsx)(p.View,{className:C,children:(0,j.t)("money")})]}),e.map((function(e,a){return(0,P.jsxs)(p.View,{className:I,children:[(0,P.jsx)(p.View,{className:b,children:(0,P.jsx)(p.View,{children:e.code})}),(0,P.jsx)(p.View,{className:k,children:(0,P.jsx)(p.View,{className:y,children:(0,P.jsx)(p.Image,{className:F,src:e.imgUrl?e.imgUrl:V})})}),(0,P.jsx)(p.View,{className:M,children:e.name}),(0,P.jsx)(p.View,{className:G,children:e.color}),e.sizeNumArr.map((function(e,a){return(0,P.jsx)(p.View,{className:A,children:e.value},a)})),(0,P.jsx)(p.View,{className:Z,children:e.totalNum}),(0,P.jsx)(p.View,{className:L,children:e.price}),(0,P.jsx)(p.View,{className:C,children:e.totalNum*e.price})]},a)})),(0,P.jsxs)(p.View,{className:z,children:[(0,P.jsx)(p.View,{className:b,children:(0,j.t)("sum")}),(0,P.jsx)(p.View,{className:k}),(0,P.jsx)(p.View,{className:M}),(0,P.jsx)(p.View,{className:G}),e[e.length-1].sumArr.map((function(e,a){return(0,P.jsx)(p.View,{className:A,children:0===e.value?"-":e.value},a)})),(0,P.jsx)(p.View,{className:Z,children:e[e.length-1].sumNum}),(0,P.jsx)(p.View,{className:L}),(0,P.jsx)(p.View,{className:C,children:e[e.length-1].sumNum*e[e.length-1].price})]})]})}}]),s}(_.Component);(0,m.Z)(S,"defaultProps",{rows:[]});var E=S,T="mergeBill-module__landscapeWrapper___HXub0",U="mergeBill-module__ticketTop___kXNfS",D="mergeBill-module__topRight___FPjpe",R="mergeBill-module__returnBtn___xwEwN",Q="mergeBill-module__ticketBody___Nd3h4",q="mergeBill-module__baseInfo___YgT6E",O="mergeBill-module__baseInfoItem___zny3x",J="mergeBill-module__itemTitle___qlhxY",W="mergeBill-module__separateBar___z6oFT",X="mergeBill-module__leftCircle___X1lxx",H="mergeBill-module__rightCircle___Yp2q6",Y="mergeBill-module__line___gMlPZ",K="mergeBill-module__listForm___yPCob",$="mergeBill-module__moneyInfo___VVfs_",ee="mergeBill-module__moneyItem___qB9rG",ae="mergeBill-module__moneyRed___A8xnI",se="mergeBill-module__detailInfo___NnVGa",le="mergeBill-module__detail___oKPR9",ie="mergeBill-module__separateLine___kZUsC",re=function(e){(0,t.Z)(s,e);var a=(0,c.Z)(s);function s(e){var l,i;(0,r.Z)(this,s),i=a.call(this,e),(0,m.Z)((0,o.Z)(i),"onReturnClick",(function(){d().navigateBack()})),(0,m.Z)((0,o.Z)(i),"getQuery",(function(){var e=i.state.params;return"sn=".concat(e.sn,"&epid=").concat(e.epid,"&sessionId=").concat(e.sessionId,"&shopId=").concat(e.shopId,"&shopName=").concat(e.shopName)}));var n=(0,w.JU)(null===(l=d().getCurrentInstance)||void 0===l?void 0:l.call(d()));return n.shopName=decodeURIComponent(n.shopName),i.state={main:{billNo:"",ownerName:"",compName:"",proDate:"",rem:"",cash:0,lastBalance:0,lastBillBalance:0,balance:0,totalMoney:"",shopAddr:"",accountNo:"",accountName:"",accountNo2:"",accountName2:"",accountNo3:"",accountName3:"",accountNo4:"",accountName4:"",accountNo5:"",accountName5:"",accountNo6:"",accountName6:"",shopPhone:"",shareDate:"",remit:0,card:0,weiXinPay:0,aliPay:0,storedValueCost:0,debt:0,agency:0,ticketQrcode1:"",ticketQrcode2:"",ticketQrcode3:"",ticketTopic1:"",ticketTopic2:"",ticketTopic3:"",billQRCodeContent:"",bottomTips:""},dets:[],dateStart:n.dateStart,dateEnd:n.dateEnd,params:{sessionId:n.sessionId,subscribe:n.subscribe,shopName:n.shopName,shopId:n.shopId,epid:n.epid,sn:n.sn}},i}return(0,n.Z)(s,[{key:"UNSAFE_componentWillMount",value:function(){var e=this,a=this.state,s=a.params,l=a.dateStart,r=a.dateEnd,n={sn:s.sn,shopid:s.shopId,epid:s.epid,sessionId:s.sessionId,prodate1:l,prodate2:r};(0,f.XQ)(n).then((function(a){for(var s=a.data.main,l=a.data.dets,r=a.data.sizeGroups,n=[];l.length>0;){for(var o=[],t=l.length-1;t>=0;t--){var c=l[t];c.code===l[0].code&&(o.unshift(c),l.splice(t,1))}n.push(o)}var m=[];n.forEach((function(e){for(var a={code:e[0].code,name:e[0].name,imgUrl:e[0].imgUrl,price:e[0].price,tenantSpuId:e[0].tenantSpuId,repFlag:e[0].repFlag},s=0,l=0,i=0;i<e.length;i++){var r=e[i];s+=Number(r.num),l+=Number(r.groupNum),r.repFlag&&(a.repFlag=r.repFlag)}a.sumNum=s,a.sumGroup=l,m.push(a)})),s.proDate=(0,w.GB)(s.proDate),s.shareDate=(0,w.Fc)();var u=[],d=[];n.forEach((function(e){for(var a=[],s={code:e[0].code},l={},n=0;n<e.length;n++)for(var o=e[n],t=0;t<r.length;t++){var c=r[t];if(o.sizeGroupId===c.sizeGroupId){l=(0,i.Z)((0,i.Z)({},l),c.sizeMap);break}}for(;e.length>0;){var m={};try{"string"==typeof e[0].sizeNumMap&&(m=JSON.parse(e[0].sizeNumMap))}catch(e){}var _={code:e[0].code,colorId:e[0].colorId,color:e[0].color,name:e[0].name,imgUrl:e[0].imgUrl,sizeGroupId:e[0].sizeGroupId,sizeNumMap:m,repFlag:e[0].repFlag,price:e[0].price,tenantSpuId:e[0].tenantSpuId,sizeNumArr:[],sizeMap:N()(l),sumArr:[],totalNum:0},p=[];for(var h in _.sizeMap)if(_.sizeMap.hasOwnProperty(h)){for(var g=0,w=0;w<e.length;w++){var x=e[w];h==x.sizeId&&(g+=Number(x.num))}p.push({name:h,value:g})}_.sumArr=N()(p);for(var f=e.length-1;f>=0;f--)if(_.colorId===e[f].colorId){var V=_.sizeMap[e[f].sizeId];_.sizeNumMap[V]?_.sizeNumMap[V]+=Number(e[f].num):_.sizeNumMap[V]=Number(e[f].num),_.totalNum+=Number(e[f].num),1===e[f].repFlag&&(_.repFlag=e[f].repFlag),e.splice(f,1)}a.unshift(_)}var j="";a.forEach((function(e){for(var a in j+=j?" / ".concat(e.color,"-").concat(e.totalNum):"".concat(e.color,"-").concat(e.totalNum),e.sizeNumArr=[],e.sizeMap)if(e.sizeMap.hasOwnProperty(a)){var s=e.sizeMap[a],l={name:s,value:e.sizeNumMap[s]||"-"};e.sizeNumArr.push(l)}})),s.str=j,d.push(s),u.push(a)}));for(var _=0;_<m.length;_++)for(var p=m[_],h=0;h<d.length;h++){var g=d[h];if(p.code===g.code){p.numDetail=g.str;break}}e.setState({main:s,dets:u})})).catch((function(e){console.log(e)}))}},{key:"componentDidMount",value:function(){g.Z.track(x.ZP.mergeBill)}},{key:"render",value:function(){var e=this.state,a=e.main,s=e.dets,l=e.dateStart,i=e.dateEnd,r=e.params;return(0,P.jsxs)(p.View,{className:T,id:"landscape-wrapper",children:[(0,P.jsxs)(p.View,{className:U,children:[(0,P.jsx)(p.View,{children:r.shopName}),(0,P.jsx)(p.View,{className:D,children:(0,P.jsx)(p.View,{className:R,onClick:this.onReturnClick,children:"返回"})})]}),(0,P.jsxs)(p.View,{className:Q,children:[(0,P.jsx)(p.View,{className:q,children:(0,P.jsxs)(p.View,{className:O,children:[(0,P.jsx)(p.View,{className:J,children:"日期范围"}),(0,P.jsxs)(p.View,{children:[l," - ",i]})]})}),(0,P.jsxs)(p.View,{className:W,children:[(0,P.jsx)(p.View,{className:X}),(0,P.jsx)(p.View,{className:Y}),(0,P.jsx)(p.View,{className:H})]}),(0,P.jsx)(p.View,{className:K,children:s.map((function(e,a){return(0,P.jsx)(p.View,{children:(0,P.jsx)(E,{rows:e})},a)}))}),(0,P.jsx)(p.View,{className:ie}),(0,P.jsx)(p.View,{className:$,children:(0,P.jsxs)(p.View,{className:ee,children:["合计金额",(0,P.jsxs)(p.Text,{className:ae,children:[a.totalMoney,"元"]})]})}),(0,P.jsx)(p.View,{className:ie}),(0,P.jsx)(p.View,{className:se,children:(0,P.jsxs)(p.View,{children:["店铺地址",(0,P.jsx)(p.Text,{className:le,children:a.shopAddr})]})})]})]})}}]),s}(_.Component),ne=re;Page((0,l.createPageConfig)(ne,"subpackages/mine/pages/mergeBill/mergeBill",{root:{cn:[]}},{}||{}))}},function(e){e.O(0,[2242,2107,1216,8592],(function(){return a=6654,e(e.s=a);var a}));e.O()}]);