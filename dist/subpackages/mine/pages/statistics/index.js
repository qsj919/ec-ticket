"use strict";require("../../sub-vendors.js");require("../../sub-common/a87b92e095a7a3a37184fd2216bb681f.js");require("../../sub-common/35858c9f2eb671972e5ec0f041d20387.js");require("../../sub-common/c2fe4c6613167eaa1512aa77c00c9382.js");require("../../sub-common/861e33dafec022bf997aff274f67586f.js");require("../../sub-common/32701b3a7b81e965e3a050e700357a5e.js");require("../../sub-common/742ac754f557039d3273f8d60f5a5847.js");require("../../sub-common/249be7c7006b48094919b56adb4aba14.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[1870],{11579:function(e,t,i){var s=i(32180),a=i(18453),n=i(33661),o=i(12742),l=i(22700),c=i(95333),d=i(14175),r=i(3701),m=i(67294),u=i(92954),A=i.n(u),h=i(71515),p=i(59009),_=i(65941),x=i(80170),g=i(29748),N=i(24962),w=i(6420),k=i(37927),j=i(68212),C=i(30968),V="index-module__statisticsWrapper___MMgGP",f="index-module__top___zUSkm",I="index-module__returnBtn___lMQvc",D="index-module__topDateSel___YGMXT",b="index-module__calendarIcon___L6cAf",S="index-module__body___M3P2W",B="index-module__shopScrollView___gk_K7",Q="index-module__bodyRight___XQ1cm",v="index-module__numStatistics___joYqg",Z="index-module__aggregateAnmtmt___Larkn",U="index-module__numBot___uXLav",Y="index-module__numbers___OCjuE",O="index-module__goodsList____WyEw",T="index-module__listBody___eLUJ0",R="index-module__listTitle___l8ofb",M="index-module__itemTitle___ChsZG",W="index-module__itemGoodsTitle___eJEjz",X="index-module__listCover___Ikx_W",y="index-module__listItem___xpuiI",E="index-module__itemIndex___h01Yg",L="index-module__indexImg___sdiBX",K="index-module__goodsDetail___g__7N",J="index-module__imgCover___WdSv_",G="index-module__imgUrl___ymkfB",P="index-module__itemName___sSpen",z="index-module__itemCode___zsQ6q",F="index-module__itemNum____fPlu",q="index-module__noData___eusmc",H="index-module__chart___XGWW3",$=i(46937),ee=i(85893),te=[{title:""},{title:""},{title:""},{title:""}],ie=function(e){(0,c.Z)(i,e);var t=(0,d.Z)(i);function i(e){var s,a;(0,n.Z)(this,i),a=t.call(this,e),(0,r.Z)((0,l.Z)(a),"getDataList",(function(e){var t=a.state.listCurrent;(0,g.jc)(e).then((function(e){var i=e.data.sumrow;if(Number(i.backNum)<0&&(i.backNum=i.backNum.split("-")[1]),0===t)a.setState({sumrow:i,listData:e.data.dataList.filter((function(e){return e.saleNum>0})),chartData:[]});else{var s=e.data.dataList.filter((function(e){return e.saleNum>=0})).reduce((function(e,t){return e.push({name:t.name,value:t.saleNum,label:{formatter:"{d}%"}}),e}),[]);a.setState({sumrow:i,chartData:s,listData:[]})}})).catch((function(e){console.log(e)}))})),(0,r.Z)((0,l.Z)(a),"onDateSelectorClick",(function(){a.setState({showDateModal:!0})})),(0,r.Z)((0,l.Z)(a),"onDateSelCancel",(function(){a.setState({showDateModal:!1})})),(0,r.Z)((0,l.Z)(a),"onConfimDateClick",(function(e){var t=a.state,i=t.listCurrent,s=t.params,n="".concat(e.prodate1," 至 ").concat(e.prodate2),o={sn:s.sn,epid:s.epid,shopid:s.shopId,prodate1:e.prodate1,prodate2:e.prodate2,charttype:i+1,pageOffset:0};a.getDataList(o),a.setState({date:n,start:e.prodate1,end:e.prodate2,showDateModal:!1})})),(0,r.Z)((0,l.Z)(a),"onReturnBtnClick",(function(){A().navigateBack()})),(0,r.Z)((0,l.Z)(a),"onShopNameClick",(function(e,t){var i=a.state,s=i.listCurrent,n=i.params,o=i.start,l=i.end,c={sn:e.sn,epid:e.epid,shopid:e.shopid,prodate1:o,prodate2:l,charttype:s+1,pageOffset:0};a.setState({checkShopIndex:t,params:{menuBtn:n.menuBtn,subscribe:n.subscribe,shopName:e.shopName,shopId:e.shopid,epid:e.epid,pk:n.pk,sn:e.sn}}),a.getDataList(c)})),(0,r.Z)((0,l.Z)(a),"onTabListClick",(function(e){var t=a.state,i=t.start,s=t.end,n=t.params;A().createSelectorQuery().in(A().getCurrentInstance().page).select("#goods-list").boundingClientRect((function(t){var o=(t.width-30)/te.length,l=a.createAnimation(e,o),c={sn:n.sn,epid:n.epid,shopid:n.shopId,prodate1:i,prodate2:s,charttype:e+1,pageOffset:0};a.setState({listCurrent:e,listAnimation:l},(function(){a.getDataList(c)}))})).exec()})),(0,r.Z)((0,l.Z)(a),"createAnimation",(function(e,t){var i=e*t;return A().createAnimation({duration:450,timingFunction:"ease-out",transformOrigin:"0 0"}).translateX(i).step().export()}));var o=(0,w.JU)(null===(s=A().getCurrentInstance)||void 0===s?void 0:s.call(A()));return o.shopName=decodeURIComponent(o.shopName),a.state={date:"",start:"",end:"",showDateModal:!1,listCurrent:0,listAnimation:null,listData:[],chartData:[],shopList:[],checkShopIndex:0,params:{menuBtn:o.menuBtn,pk:o.pk,shopName:o.shopName,shopId:o.shopId,subscribe:o.subscribe,epid:o.epid,sn:o.sn},sumrow:{totalSum:"",saleNum:"",codeNum:"",backNum:""}},a}return(0,o.Z)(i,[{key:"UNSAFE_componentWillMount",value:function(){var e=this.state.params;te=[{title:(0,_.t)("goodsRank")},{title:(0,_.t)("classProp")},{title:(0,_.t)("colorProp")},{title:(0,_.t)("sizeProp")}];var t=(0,w.GB)(),i=(0,w.GB)(new Date(t.replace(/-/g,"/")).getTime()-2592e6);this.setState({date:i+" 至 "+t,start:i,end:t});var s={sn:e.sn,epid:e.epid,shopid:e.shopId,prodate1:i,prodate2:t,charttype:1,pageOffset:0};this.getDataList(s)}},{key:"componentDidMount",value:function(){var e=this;x.Z.track(N.ZP.statistics);var t=this.state.params;(0,g.IU)().then((function(i){for(var s=[].concat((0,a.Z)(i.data.cloudBillOpenList||[]),(0,a.Z)(i.data.cloudBillCloseList||[])),n=0,o=0;o<s.length;o++){if(s[o].shopid==t.shopId){n=o;break}}e.setState({shopList:s,checkShopIndex:n,params:{menuBtn:t.menuBtn,subscribe:t.subscribe,pk:t.pk,shopName:s[n].shopName,shopId:s[n].shopid,epid:s[n].epid,sn:s[n].sn}})})).catch((function(e){return console.log(e)}))}},{key:"render",value:function(){var e=this,t=this.state,i=t.date,s=t.start,a=t.end,n=t.showDateModal,o=t.listCurrent,l=t.listAnimation,c=t.listData,d=t.chartData,r=t.shopList,m=t.checkShopIndex,u=t.sumrow;return(0,ee.jsxs)(h.View,{className:V,id:"statistics-wrapper",children:[n&&(0,ee.jsx)(j.Z,{onDateSelCancel:this.onDateSelCancel,onConfimDateClick:this.onConfimDateClick,dateStart:s,dateEnd:a}),(0,ee.jsxs)(h.View,{className:f,children:[(0,ee.jsxs)(h.View,{className:I,children:[(0,ee.jsx)(h.View,{className:"at-icon at-icon-chevron-left"}),(0,ee.jsx)(h.View,{onClick:this.onReturnBtnClick,children:"返回"})]}),(0,ee.jsxs)(h.View,{className:D,onClick:this.onDateSelectorClick,children:[(0,ee.jsx)(h.Text,{children:i}),(0,ee.jsx)(h.Image,{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC2klEQVRYR+2XP2gTYRjGn/drQ0JBjIIKOgiCo05Bq0tJ7r0kDehYBBFExL9LrUodKoIuFaxubRVEFLGDi5BC9e67KtJF7KBiF7s4qOh0oLRJDL1XTppSklzatFe69IVM933v88vzPe/xHWGdi9ZZHxsAy3ZgfHzc8DzvaEtLS28ymSwGHZ1lWTuVUjeUUoOpVOrjUke8bADbtl8CyMzNzaWy2ezroMZa68sicgfAkGmaF1YMoLXeIyJ9ADoBbAeglmpW9bwE4A+AbwBelMvle7lc7nd1j7oOaK0PicgYgM1NijZaPt3a2ppKJpM+0ELVAOTz+bZYLPYFwC4i8iG6DcOY1lpbAJiITGbWDTLQS0T9APpd1+2Lx+PtRDQEYB8RvWXmjoYAlmWdIKInRPQpHo8nEolE2d+gte4RkdNElGTmX0EAjuMc9jzvKYDzpmm+8tfNB3NKROJEdICZ31f21zigtR4QkR6l1FXDMPwwhVJa6xEROUZEF5l5MBDAtu37AM4Q0VlmfhCKOoBKXxG5lk6nby8JAGCWiPwkh1Ii0gYg2gxAKMI1Y0d0jpl9l/9XTQYqVgG4VCqVHodFEYvF7orIyeqjDQRYqwxsAITiwMTExKZisbhtcT4ikYjMzMz8yOVydScnaLybzoAvXigUvgLYWieg70zTbK8X3NAAJicnI67r5gHsrTNieWbuXlOAlY5laA6sOYBlWcN+UqnqjbVS4co+27YfAjjl/0zTfNToTXgLQB8RDTDzldUK+/tFhBzH+SAi+4koxcwLV7qaKbAsq4OI3ojIrIgczGQyn1cLobW+LiI3Afx0XXd3V1fX30AH/Ada6zERyfoQSin/NjPt/5FmQYioTUSOiEiKiMTzvOPpdHpkcZ+6d8LR0dEt0Wj0OQCjWdGA9QWlVI9hGMM1o9tIwHGcznkndhBRs7dieJ7n3ymmlFLPDMP4Xk9r2d8FITlR02YD4B/XLXEw/o2QuQAAAABJRU5ErkJggg==",className:b})]})]}),(0,ee.jsxs)(h.View,{className:S,children:[(0,ee.jsx)(h.ScrollView,{scrollY:!0,scrollWithAnimation:!0,className:B,children:r.map((function(t,i){return(0,ee.jsx)(C.Z,{index:i,shopItem:t,checkShopIndex:m,onShopNameClick:e.onShopNameClick},t.id)}))}),(0,ee.jsxs)(h.View,{className:Q,children:[(0,ee.jsxs)(h.View,{className:v,children:[(0,ee.jsxs)(h.View,{className:Z,children:[(0,ee.jsxs)(h.View,{children:["￥",u.totalSum]}),(0,ee.jsx)(h.View,{className:U,children:(0,_.t)("aggregateAnmtmt")})]}),(0,ee.jsxs)(h.View,{className:Y,children:[(0,ee.jsxs)(h.View,{children:[(0,ee.jsx)(h.View,{children:u.saleNum}),(0,ee.jsx)(h.View,{className:U,children:(0,_.t)("saleNum")})]}),(0,ee.jsxs)(h.View,{children:[(0,ee.jsx)(h.View,{children:u.codeNum}),(0,ee.jsx)(h.View,{className:U,children:(0,_.t)("num4Code")})]}),(0,ee.jsxs)(h.View,{children:[(0,ee.jsx)(h.View,{children:u.backNum}),(0,ee.jsx)(h.View,{className:U,children:(0,_.t)("num4Return")})]})]})]}),(0,ee.jsxs)(h.View,{className:O,id:"goods-list",children:[(0,ee.jsx)(k.Z,{listData:te,onTabItemClick:this.onTabListClick,current:o,animation:l,lineWidth:60}),(0,ee.jsx)(h.View,{className:T,children:0===o?(0,ee.jsxs)(h.View,{children:[(0,ee.jsxs)(h.View,{className:R,children:[(0,ee.jsx)(h.View,{className:M,children:(0,_.t)("index")}),(0,ee.jsx)(h.View,{className:W,children:(0,_.t)("goods")}),(0,ee.jsx)(h.View,{className:M,children:"拿货数"})]}),c.length>0?(0,ee.jsx)(h.ScrollView,{scrollY:!0,className:X,scrollWithAnimation:!0,children:c.map((function(e,t){return(0,ee.jsxs)(h.View,{className:y,children:[(0,ee.jsx)(h.View,{className:E,children:0===t||1===t||2===t?(0,ee.jsx)(h.Image,{className:L,src:0===t?"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAcCAYAAAAJKR1YAAABRklEQVRYR+2WMUtCURSAv6M4iBC0Ojm9oV/QD4igtTYHf4BTg46NEkFjODgJD5/DI6hJooYWoajF1a0h2oSWSFROXOyBZGIv0XuHd6fLvVzOd75z7uUKgJZKHuPxKbAHbJk1W0O+YR6AbVsQs3FFi8VL4NAFGMNggN5tl+mnIXXFTmQoHlC5DPn8fA5hCL3eyrmZksUDqtWgUJgPXK9Dt2sByPMgm50GTqWgUpnOrQHNOjBAvp8ALe6LxNCyO5MY2rQh1WH8h3Gd117k1S0guHMN6MQlIEV1xyWgWwmCfVeAJqTTu+L7z64AnUsQVP/3QVv2NsXfv2Y0OpIwnNgHErknkzmQZvMzymO1ksW3EZ1QRC4YDKrS6Qxtf/JfUD2Wdvvqt3w2aaiPyBm5nC+NxmiR3HUAmeb8AN6APvCIyI20Wk9/qfAXnKjDkT/JOIkAAAAASUVORK5CYII=":1===t?"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAcCAYAAAAJKR1YAAACbklEQVRYR83WTUhUURTA8f/RxhybjNEkChMCFXEhbVLLJAQJ+lCoIMKgRUQRtAhioA+kqMX0tbNNrQLJgggKCylbmEE4fSxaFYaRjSYtskbN0nHmxptLoTFT972Zet7lzD3v/Oacc+8bAVD39pSjZoIoGoF86zO3liQw8Zk+wO8WYnZeUXdbbqHYPh8wlkFUZ0vE7TbNrVBni5ov1flZIXsg71IoroeiKsgrAk8efBuFrx9hqBdGQmn9Pqtl5qCybVDaDNk5qZOO9kNfEOLTjmDmoOINsHq/TmIlDT+CsfcQj4K3CFbWw/Jq/X24F15e/scgBCp3w1QEBjqTJ6vaByUNoOLw4CBEJ2yjzCtk8uiCCljXqnc+boXIW5OoOXsyC/KXQd0pnaAnABMfXAZV7ILSJt3W7kNA3EXQ4hJYfxqyPfDqRuo5+wsxMy2zTlndScj1w+c38OQMqJjt6ji7GH9Pk7cM1p4AbyGMD2mMg9OlH6um0quQbwXUHteVGQtDKKjnx/GSYeeg/BKoOQYL8yHyDkJnYXrcMSURKDx0BlqyCmqOQo5Pz0zoPMxMpofR0a32Qf5yqA7ol+qn1/D0AsS+ZwKjQFXaAxVWwpojsCAXvgzAizaITaXAKHstFLpla8dGc5DHB41tf37Tz6ZZ0K69ppWLkZVdK1van5uDcgs0yHTZASkuSnNHIDP3kCkw1T7hDpPRHbLzZuImNa9QuomTxksPPs8mabj661S4BVKIXCJrNCCbu+acCjdAg6AOS9P128mK9v9AQj/IOYYXtcuBK9GUI2XrT77ZHFnDOYkwgrIQhFByX5qvPTMJ/wHGPvIunvyVmgAAAABJRU5ErkJggg==":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAcCAYAAAAJKR1YAAACk0lEQVRYR83WW0gUYRTA8f9xdzXb0nbDCoVSops9dFEkujyEEYkvplJkVPjURYgQ7KmFQKGiwIeUyKfItIcuaBBiShcMK5JuEokJoWBqRaJk3nZ34mtaMnNjZlZbv5eF2TNzfnPOmW9GAA6WaSu9whlgBxCjjoVryS/MU8AVLsTEvJJXrt0CsmcDRhkUaCDcbZpcIW22VCdQIUOgmGg4mWmM7vXD6dvGYidHqZYZArmdcPGQsSRjXsivMBZrGeSwQXJC8CQrlsDuVP3/q01Q3zrDoH9d3uWEklxY4IRH76DigTWMqRkKlkJVzpMFyxdDRy8U14LXF0bQ0XTYugr6h8BzU/8NZRke6qmSZK6HvM0w7oOSGujoC4Win2sZlOCCs3shIkKvSlMbtPXA667QUJZBa+LhVNbfyds+wuX78GnQGswyKNIG7vkwxw7uebBhGWxbDWrIO7/o8+Tzm0NpMGoZNFWqjYlQmAEiUN4Aze/NgQS6pxWk0pfuh0WxcPclVD8xBwIapx10fh/Eu6DuFVxrNgnS8BgGqZnZtU6/c1+Qt19SHBTn6i271AiP202BNM1OsmFQdirkpEHfANxrhTdd0DsAfg1ioyElCXLTIHYufBuBwioYGjUFaqgukJ2GQduT4cAWiHL8TqK+E9SnhnqyAmt4DErr4G23KYzPZmNT5RFpMQxSl1d3n74WUhJh6UJ9UwyswWFo+QB3XsBn83vQheoCKQppp460662Ksuut6f9uqiITg2vH48i5sUd+vpJNVchyyiAnivDQEU3GlXwZCYSEC6SJUPbVS1Hdcflj9MMB6tSEE9ePSc1UhfufoHbROOd0UFlxWMaDtX8mQGo41Yj3ILTj55kI9VUF8tzIDP4AbO3w9t5MtkYAAAAASUVORK5CYII="}):(0,ee.jsx)(h.View,{children:t+1})}),(0,ee.jsxs)(h.View,{className:K,children:[(0,ee.jsx)(h.View,{className:J,children:(0,ee.jsx)(h.Image,{className:G,src:e.fileUrl?e.fileUrl:p})}),(0,ee.jsxs)(h.View,{children:[(0,ee.jsx)(h.View,{className:P,children:e.name}),(0,ee.jsx)(h.View,{className:z,children:e.code})]})]}),(0,ee.jsx)(h.View,{className:F,children:e.saleNum})]},t)}))}):(0,ee.jsx)(h.View,{className:q,children:"暂无数据"})]}):(0,ee.jsx)(h.View,{children:d.length>0?(0,ee.jsx)(h.View,{className:H,children:!n&&(0,ee.jsx)($.Z,{chartId:"",width:"185px",height:"270px",option:{legend:{orient:"horizontal",padding:[10,5,10,5],bottom:0,icon:"circle"},series:[{radius:["15%","30%"],center:["50%","40%"],data:d,type:"pie"}]}})}):(0,ee.jsx)(h.View,{className:q,children:"暂无数据"})})})]})]})]})]})}}]),i}(m.Component);Page((0,s.createPageConfig)(ie,"subpackages/mine/pages/statistics/index",{root:{cn:[]}},{navigationBarTitleText:"拿货统计"}||{}))}},function(e){e.O(0,[1891,7840,8510,7383,3629,3647,5599,6679,4436,4121,9617,2107,1216,8592],(function(){return t=11579,e(e.s=t);var t}));e.O()}]);