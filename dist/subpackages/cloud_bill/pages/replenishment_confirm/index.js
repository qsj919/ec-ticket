"use strict";require("../../sub-vendors.js");(wx.webpackJsonp=wx.webpackJsonp||[]).push([[9352],{62871:function(e,_,s){var n=s(32180),t=s(62724),i=s(33661),o=s(12742),a=s(22700),l=s(95333),d=s(14175),r=s(3701),c=s(66058),p=s(92954),u=s.n(p),m=s(67294),h=s(71515),g=s(49181),x=s(92156),f=s(96486),w=s(80170),b=s(24962),N=s(63056),I=s(6420),A=s(75508),j=s(7567),v=s(86792),k=s(59009),y=s(3662),Z=s(29748),V=s(14067),M=s(91629),C=s(31254),T=s(27863),S={page:"index-module__page___voa3b",content:"index-module__content___ESjPW",address:"index-module__address___DSq3e",address__detail:"index-module__address__detail___EMJw3",address__detail__icon:"index-module__address__detail__icon___iNN8a",address__detail__info:"index-module__address__detail__info___e1qoX",address__detail__main:"index-module__address__detail__main___gA1oL",address__detail__sub:"index-module__address__detail__sub___yqgQ8",address__detail__angle_icon:"index-module__address__detail__angle_icon___zpiOC",segmentation:"index-module__segmentation___MHlas",segmentation__line:"index-module__segmentation__line___otUy8",segmentation__left__circle:"index-module__segmentation__left__circle___v1jOV",segmentation__right__circle:"index-module__segmentation__right__circle___bquZQ",shop:"index-module__shop___R_Aq2",shop__info:"index-module__shop__info___z87ya",shop__info__image:"index-module__shop__info__image___uWyMu",shop__info__name:"index-module__shop__info__name___b5Foq",shop__info__angle:"index-module__shop__info__angle___Bocyf",spus:"index-module__spus___MhChd",spus__spu__header:"index-module__spus__spu__header___m7XsD",spus__spu__img:"index-module__spus__spu__img___TnmTq",spus__spu__info:"index-module__spus__spu__info___Npj59",spus__spu__code:"index-module__spus__spu__code____QwIR",spus__spu__total:"index-module__spus__spu__total___Mp3iP",spus__spu__price:"index-module__spus__spu__price___ke6ff",price_tag:"index-module__price_tag___RI_M1",spus__spu__table:"index-module__spus__spu__table___Ihk_O",spus__spu__row:"index-module__spus__spu__row___JtzlJ",spus__spu__row_item:"index-module__spus__spu__row_item___cV1bB",total:"index-module__total___OWLO3",total__row:"index-module__total__row___zD_wa",total__row__label:"index-module__total__row__label___kMqt4",total__row__amount:"index-module__total__row__amount___wfOQJ",total__row__remark:"index-module__total__row__remark___BDctT",rem_c:"index-module__rem_c___gTa08",rem:"index-module__rem___zONfD","rem--input":"index-module__rem--input___QBVqX",bottom:"index-module__bottom___Dp9G7",bottom__total:"index-module__bottom__total___QZtQg",bottom__total__price:"index-module__bottom__total__price___nL_Rl",bottom__total__price__num:"index-module__bottom__total__price__num___L5LTb",tips:"index-module__tips___gWXNg",modal:"index-module__modal___tiIt7",modal_input:"index-module__modal_input___uVVYy",input_confirm:"index-module__input_confirm___p4mVC",transparent:"index-module__transparent___F1HsF",getphone_fail_view__mask:"index-module__getphone_fail_view__mask___RmT2K",getphone_fail_view__mask__content:"index-module__getphone_fail_view__mask__content___rIUmf",move:"index-module__move___Z5OCp",getphone_fail_view__mask__content__title:"index-module__getphone_fail_view__mask__content__title___jpX4E",getphone_fail_view__mask__content__label:"index-module__getphone_fail_view__mask__content__label___et1TJ",getphone_fail_view__mask__content__btn:"index-module__getphone_fail_view__mask__content__btn___hxA72"},P=s(85893),B=["errMsg"],G=function(e){(0,l.Z)(s,e);var _=(0,d.Z)(s);function s(){var e;(0,i.Z)(this,s);for(var n=arguments.length,o=new Array(n),l=0;l<n;l++)o[l]=arguments[l];return e=_.call.apply(_,[this].concat(o)),(0,r.Z)((0,a.Z)(e),"state",{addressScope:!0,inputModal:!1,inputModal_rem:"",inputModal_mpErpId:0,fromPage:""}),(0,r.Z)((0,a.Z)(e),"onRemClick",(function(_){e.setState({inputModal:!0,inputModal_mpErpId:_.mpErpId,inputModal_rem:_.remark})})),(0,r.Z)((0,a.Z)(e),"hideInputModal",(function(){e.setState({inputModal:!1,inputModal_rem:""})})),(0,r.Z)((0,a.Z)(e),"onAddressClick",(function(){e.state.addressScope||e.goAuthAddress(),u().getSetting().then((function(_){_.authSetting["scope.address"]?e.chooseAddress():u().authorize({scope:"scope.address"}).then((function(){e.chooseAddress()})).catch((function(_){N.Z.showAlert("点击去授权","获取地址失败").then((function(){e.goAuthAddress()})),e.setState({addressScope:!1})}))}))})),(0,r.Z)((0,a.Z)(e),"goAuthAddress",(function(){u().openSetting().then((function(_){_.authSetting["scope.address"]&&(e.setState({addressScope:!0}),e.chooseAddress())}))})),(0,r.Z)((0,a.Z)(e),"_chooseAddress",(function(){u().chooseAddress().then((function(_){_.errMsg;var s=(0,t.Z)(_,B),n={province:s.provinceName,city:s.cityName,county:s.countyName,addrDetail:s.detailInfo,receiveName:s.userName,receivePhone:s.telNumber};e.props.dispatch({type:"replenishment/save",payload:{address:n}})}))})),(0,r.Z)((0,a.Z)(e),"chooseAddress",(0,f.throttle)(e._chooseAddress,1500,{leading:!0})),(0,r.Z)((0,a.Z)(e),"onRemInput",(function(_){e.props.dispatch({type:"replenishment/updateRemarkInConfirmPage",payload:{rem:_,mpErpId:e.state.inputModal_mpErpId}}),e.hideInputModal()})),(0,r.Z)((0,a.Z)(e),"onRemConfirm",(function(_,s,n){e.props.dispatch({type:"replenishment/updateRemInConfirmPage",payload:{rem:_,mpErpId:s,id:n}})})),(0,r.Z)((0,a.Z)(e),"onGetPhone",(function(_){if(_.detail.errMsg.includes("ok")){u().showLoading();var s=_.detail,n=s.encryptedData,t=s.iv,i=s.code;e.props.dispatch({type:"user/verifyPhone",payload:{encryptedData:n,iv:t,wechat:!0,code:i}}).then((function(){u().hideLoading(),e.onConfirm()})).catch((function(e){u().hideLoading()}))}})),(0,r.Z)((0,a.Z)(e),"onConfirm",(function(){var _=e.props,s=_.boundPhone,n=_.address;if(!s)return N.Z.showToast("请先绑定手机号");var t=wx.getEnterOptionsSync();return C.N4&&!n.city?N.Z.showToast("请选择地址"):T.oG.includes(t.scene)?n.city?void(wx.checkBeforeAddOrder?wx.checkBeforeAddOrder({success:function(_){e.confirmOrder({traceId:_.data.traceId,appScene:"channelLive"})},fail:function(e){console.log(e)}}):N.Z.showAlert("微信版本过低，请升级微信至8.0.19及以上")):N.Z.showToast("请选择地址"):void e.confirmOrder()})),(0,r.Z)((0,a.Z)(e),"confirmOrder",(function(_){var s=wx.getEnterOptionsSync(),n=e.props,t=n.address,i=n.totalNum,o=n.totalSkuNum,a=n.mpErpId,l=n.orderPay,d=e.state.fromPage;u().showLoading({title:"正在提交...",mask:!0}),e.props.dispatch({type:"replenishment/order",payload:(0,c.Z)({},_)}).then((function(_){if("stockBar"!==d){w.Z.track(b.ZP.replenishSuccess,{skunum:o,totalnum:i,province:t.province,city:t.city,county:t.county,mp_erp_id:String(a)});var n=e.props.shopList.find((function(e){return e.id===a}));if(n){var r=n.sn,c=n.epid,p=n.shopid;w.Z.trackToBigData({sn:r,epid:c,shop:p,data:[{key:"submit_order",value:1}],tag:{sku_num:o,total_num:i}})}var m=_.billId;(n&&2===n.independentType||T.oG.includes(s.scene))&&!e.props.cardPwd?(u().showLoading({title:"请稍等..."}),(0,V._9)({code:"order_pay",mpErpId:a}).then((function(e){"1"===e.data.val||T.oG.includes(s.scene)?(0,Z.Nf)({mpErpId:a,billId:m}).then((function(e){var _=e.data,n={timeStamp:_.timeStamp.toString(),nonceStr:_.nonceStr,package:_.package,signType:_.signType,paySign:_.paySign,success:function(e){u().hideLoading(),u().redirectTo({url:"/subpackages/cloud_bill/pages/replenish_success/index?billId=".concat(m)})},fail:function(e){u().hideLoading(),console.log("支付fail回调",e);var _="billId=".concat(m,"&mpErpId=").concat(a,"&orderPay=").concat(l);u().redirectTo({url:"/subpackages/mine/pages/order_list/order_list_detail/index?".concat(_)})}};T.oG.includes(s.scene)?wx.requestOrderPayment(n):wx.requestPayment(n)})).catch((function(e){u().hideLoading()})):(u().hideLoading(),u().redirectTo({url:"/subpackages/cloud_bill/pages/replenish_success/index?billId=".concat(m)}))}))):(u().hideLoading(),u().redirectTo({url:"/subpackages/cloud_bill/pages/replenish_success/index?billId=".concat(m)}))}else u().hideLoading(),u().redirectTo({url:"/subpackages/cloud_bill/pages/replenish_success/index?billId=".concat(_.billId)})}))})),(0,r.Z)((0,a.Z)(e),"onGetPhoneClick",(function(){e.props.dispatch({type:"user/save",payload:{retryGetPhoneNumber:!1}})})),(0,r.Z)((0,a.Z)(e),"onShopInfoClick",(function(_){var s=e.props.shopList.find((function(e){return e.id===_.mpErpId}));if(s){var n=s.cloudBillFlag===T.PC.never||s.cloudBillFlag===T.PC.expire?T.yK.replenishment:T.yK.all;e.props.dispatch({type:"cloudBill/init",payload:{mpErpId:_.mpErpId,cloudType:n,cloudSource:T.o0.CLOUD_TAB}}),M.Z.navigateTo({url:"/subpackages/cloud_bill/pages/all_goods/index?type=".concat(n)})}})),e}return(0,o.Z)(s,[{key:"UNSAFE_componentWillMount",value:function(){var e,_=(0,I.JU)(null===(e=u().getCurrentInstance)||void 0===e?void 0:e.call(u())).from;_&&this.setState({fromPage:_}),this.props.dispatch({type:"replenishment/fetchAddress"})}},{key:"render",value:function(){var e=this,_=this.state,s=(_.inputModal_rem,_.inputModal),n=this.props,t=n.address,i=n.stockBarForbillDetail,o=n.totalNum,a=n.totalMoney,l=n.boundPhone,d=n.shopList,r=n.mpErpId,c=n.retryGetPhoneNumber,p=""!==t.city,m=d.find((function(e){return e.id===r}));return(0,P.jsxs)(h.View,{className:S.page,children:[(0,P.jsxs)(h.View,{className:S.content,children:[(0,P.jsx)(h.View,{className:S.address,onClick:this.onAddressClick,children:p?(0,P.jsxs)(h.View,{className:S.address__detail,children:[(0,P.jsx)(h.Image,{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAsCAYAAAAATWqyAAABYWlDQ1BrQ0dDb2xvclNwYWNlRGlzcGxheVAzAAAokWNgYFJJLCjIYWFgYMjNKykKcndSiIiMUmB/yMAOhLwMYgwKicnFBY4BAT5AJQwwGhV8u8bACKIv64LMOiU1tUm1XsDXYqbw1YuvRJsw1aMArpTU4mQg/QeIU5MLikoYGBhTgGzl8pICELsDyBYpAjoKyJ4DYqdD2BtA7CQI+whYTUiQM5B9A8hWSM5IBJrB+API1klCEk9HYkPtBQFul8zigpzESoUAYwKuJQOUpFaUgGjn/ILKosz0jBIFR2AopSp45iXr6SgYGRiaMzCAwhyi+nMgOCwZxc4gxJrvMzDY7v////9uhJjXfgaGjUCdXDsRYhoWDAyC3AwMJ3YWJBYlgoWYgZgpLY2B4dNyBgbeSAYG4QtAPdHFacZGYHlGHicGBtZ7//9/VmNgYJ/MwPB3wv//vxf9//93MVDzHQaGA3kAFSFl7jXH0fsAAAd3SURBVFgJxZh5bBdVEMf7+/WihUIP2yq0JfSubQMUBBuiVCMRIkpFK/8AQbSARiVEUIkGAUMUjKgcIqJS0jQY+ocICGoiVq4iplJbex9CW5FSekHoRQ8/s+w22/3t77AQfcnLe2/mO/NmZ+bN2103t2G2gYEBS3R0dHBMTExCUlJS6Pr1663DVKWIWVwVnjJlim9bW9uj4NMxYqbFYhnL6KnJs+5lfpl+mn6Q9dHq6uprGt/Z6NSQxMTEwM7OzrdQtILuY6KwA5qvkY4hN6FleXl5vV1WVva3kW9c23WnuD4qKmo1RtQitIrug/IGxp2Mc6xWa3RAQMDI2trakRERET6enp6R8B6hb4VfK96iZ3Z3d1ejZyMeHfQeGJtm6hG8MKqrqysHRU+IBIpL6Wtx9SEbDXYIbP4wrM3omCoQ5H/G2KfKy8ubzURsDImNjR3X29t7DHAywj2Mr6akpOzKzc3tM1PgiIYRFpJ5YX9//y5wI+l/EqrZGFNplBtiSGpqqs+VK1dOoSAFI5oY5+P6U0ahf7vm4SbycN8gNx691b6+vtOKi4tb9XqG5AhGZIkRAFoZZ9wJI2SzysrK3729vVMxogG90R0dHblpaWkeekMGPRIZGfksjC8B9wKejRE/6oHGOXgJ3b30u3B9C2MlOfQb44ARq62pOylgT7KWU/YGe2zWeIohakgqMSAMRetqamre0QD6UZ6ioaFhGcpWQ5+g58kc2b8YtoWHh2/Ly8vrMvJlTRIvY5/dTNvJlygteZXQNDY2rlSNuOTv7/+BmQKeJqy+vv4sRuyEP4FNJZF/oR9mfoaxAx3j6Jvr6uoK4+PjY6HZNBL/C/ClMMb09PS8qQEUj+DmCxAkkZbjjc80pjZKCaee/Mom4WBuMm7iKG6tqKi4rmHEq01NTSswdBM0qTnN9OmEq0bDaCMPNQ+cVN9rI0aMCC4pKemxcrwmARAjuj08PPZrYP1Ich0QI6BdFOXEdoPeCMHm5+d3sumHuHsSmFLwQfSDZoVs8uTJR8BchT+agpcm8lYW6TKhHTcqFyLWP83wIH3A3d19MZudF7q9ptaIBWzUg+6k9vb2TCNWrUlHhI5nlP3FkGkq8DujgKzhvygjindUVVWdkLmzRnj/ALNRcJq8icz3QkOvsr8YMlYlXDSC4+Li/KA9IHTCJknqcsN7cjL60J+YkJAw3iiIAReEpu1vhXCPELjELsmob1TD8QA9wFwnbBV6nrM5ReyqthmnI8qIJyTafiEZGRnucnz9BcSmbUYw6zEqrd2E5wpJk9P06GU0nntRUZGvGNIkXKwP0aPUeaM6BovVJnxnpLsNevR4ZT/2bZZDIjlSJlzG+/QomVPcJG/a4XkXFhbOMPIdrbno4pEby0a9fn5+pUYsqaAkKZhq4bG2/iQTBObKqG8FBQXylvWt0IjpBoSUAqjH2Jv39fVppyaPh7AJO7rmqbLK/hKag0KAkUZ2K4mrApSBCioXU7/wqSkv6Xn25twnC8BnCJ8HfNeI48VLQpau8nNktFKgxG1yZ7iT3TYbEb8ieB/Tpb3PJmscvbHLpQbucwXt5pZDTTmuzgcH3v4yMdQTQpFac9zEIxKfHTLCfEGtHbIcbJTpNTzZIfje9C3Z2dmn2DA9OTk5QEB4ajTrOdxZP8DfTR8F+QTvss8PKlEneMOL6XJZsu92lXzLEGr/fjaSpAngGL+mMbVRSvKiRYueZP0eOHlfSaV/fePGjRY27yV/JKGPwp9F76fv8vHxmWX2KsDluQrsOPTUhIWFZYFV2mDy8USLAeyD2kFexBASreCo0FsDG8cwW4mieeDDdMxGaIepwNvVcOpYt6aSG4RF3nv88IbcW9k2IJgWNjlHH8Cor2wAJgQJI30CMmYFy0YCvXtV/SXGPBv0iEgR6/tx8xmmQp/Lda8cXeHdbuN1YzpHOl/04LWZXAEn9TqVZNUIuOos7t2jrj+R7xuNdzujfK5ihIQd9ZY9RiNE9xBDhIC1qwHXM40gnoNZLbzhNr6Z5fUzjn6ZKvu6mR6b+6O5ubknKChI3rAWIjCJeVlLS0uJmbArNHLiMXBbBcurwZLS0tLzZnJDckQPILE+wpiV0KQ8TyRf6vR8V+boCAFXjJ4QTsleQr/UnpxNaDQg4REXFtL96QfUQqSxnY7qqcgSIwCX83X3siMhm9BoYMLRFxISkoeiJdAiSbbg1tZWl08Rnx5yST7HA8lL+WxCInlnt9k1RCTIl2ZypAqFz7CcGhgYeBFjxEsOG2XgcWTkwxs7LKsIyWGHAgJ0BhA+sd6C4jVM5estzlG+yIcVl+c5cFLkcsBK0jttdnNEL8nX2Vqe7Bg0L8q/5Ixpk0sQI+Tpx4AvCA0NzTQF3g4Rj1i029ZMj3xI4bnjaglvZC4fZC63Ib8GHEnxhPKV32oPQ+58Cu8hcN2M83nPcJicRj0uG2IU1K/xwjrWSo3Ac0vJi9N6/n8yJwSZEg7pnJa1w93UpVNjTzlGzMADJ+DLh9p2wvGKPawzukunxoESSUgxYh+1Qq6D/68RjuA7sfs/ZHVWogvfFt8AAAAASUVORK5CYII=",className:S.address__detail__icon}),(0,P.jsxs)(h.View,{className:S.address__detail__info,children:[(0,P.jsx)(h.View,{className:S.address__detail__main,children:(0,P.jsx)(h.Text,{children:"".concat(t.receiveName,"    ").concat(t.receivePhone)})}),(0,P.jsx)(h.View,{className:S.address__detail__sub,children:"".concat(t.province).concat(t.city).concat(t.county||"").concat(t.addrDetail)})]}),(0,P.jsx)(h.Image,{src:v,className:S.address__detail__angle_icon})]}):(0,P.jsx)(h.View,{children:"请添加收货地址"})}),i.map((function(_){return(0,P.jsxs)(h.View,{className:S.shop,children:[(0,P.jsxs)(h.View,{className:S.shop__info,onClick:function(){return e.onShopInfoClick(_)},children:[(0,P.jsx)(h.Image,{className:S.shop__info__image,src:_.logoUrl||y},_.logoUrl),(0,P.jsx)(h.View,{className:S.shop__info__name,children:_.shopName}),(0,P.jsx)(h.Image,{src:v,className:S.shop__info__angle})]}),_.spuTable.map((function(e){return(0,P.jsx)(h.View,{className:S.spus,children:(0,P.jsxs)(h.View,{className:S.spus__spu,children:[(0,P.jsxs)(h.View,{className:S.spus__spu__header,children:[(0,P.jsx)(h.Image,{mode:"aspectFill",src:e.imgUrl||k,className:S.spus__spu__img,onClick:function(){return u().previewImage({urls:Array.isArray(e.imgUrl)?e.imgUrl:[e.imgUrl]})}}),(0,P.jsxs)(h.View,{className:S.spus__spu__info,children:[(0,P.jsx)(h.Text,{className:S.spus__spu__code,children:e.code}),(0,P.jsx)(h.Text,{className:S.spus__spu__name,children:e.name}),m&&m.industries?(0,P.jsx)(h.View,{className:"col",children:e.skus.map((function(e){return(0,P.jsxs)(h.Text,{className:S.spus__spu__total,children:["¥".concat(e.price,"/").concat(e.sizeName),(0,P.jsx)(h.Text,{style:"margin-left:10px;",children:"X".concat(e.num)})]})}))}):(0,P.jsx)(h.Text,{className:S.spus__spu__total,children:"".concat(e.totalNum)}),(0,P.jsxs)(h.View,{className:S.spus__spu__price,children:[(0,P.jsx)(h.Text,{className:S.price_tag,children:"¥"}),(0,P.jsx)(h.Text,{children:e.totalMoney})]})]})]}),(!m||!m.industries)&&(0,P.jsx)(h.View,{className:S.spus__spu__table,children:e.table.map((function(e,_){return(0,P.jsx)(h.View,{className:S.spus__spu__row,children:e.map((function(e,s){return(0,P.jsx)(h.View,{className:S.spus__spu__row_item,children:0===_&&0===s?"颜色/尺码":e},s)}))},_)}))})]})},e.code)})),(0,P.jsxs)(h.View,{className:S.segmentation,children:[(0,P.jsx)(h.View,{className:S.segmentation__left__circle}),(0,P.jsx)(h.View,{className:S.segmentation__line}),(0,P.jsx)(h.View,{className:S.segmentation__right__circle})]}),(0,P.jsxs)(h.View,{className:S.total,children:[(0,P.jsxs)(h.View,{className:S.total__row,children:[(0,P.jsx)(h.View,{className:S.total__row__label,children:"总数"}),(0,P.jsx)(h.View,{children:"".concat(_.totalTable.totalNum)})]}),(0,P.jsxs)(h.View,{className:S.total__row,children:[(0,P.jsx)(h.View,{className:S.total__row__label,children:"总额"}),(0,P.jsx)(h.View,{className:S.total__row__amount,children:"￥".concat(_.totalTable.totalMoney)})]}),(0,P.jsxs)(h.View,{className:S.total__row,children:[(0,P.jsx)(h.View,{className:S.total__row__label,children:"备注"}),(0,P.jsx)(h.View,{className:S.total__row__remark,onClick:function(){return e.onRemClick(_)},children:_.remark?_.remark:"请输入备注"})]})]})]},_.mpErpId)}))]}),(0,P.jsxs)(h.View,{children:[(0,P.jsx)(h.View,{className:S.tips,children:"最终货款以商家开单数据为准"}),(0,P.jsxs)(h.View,{className:S.bottom,children:[(0,P.jsxs)(h.View,{className:S.bottom__total,children:["共",o,"件 合计:",(0,P.jsxs)(h.View,{className:S.bottom__total__price,children:["¥",(0,P.jsx)(h.View,{className:S.bottom__total__price__num,children:a})]})]}),(0,P.jsx)(h.Button,{openType:l?void 0:"getPhoneNumber",onGetPhoneNumber:this.onGetPhone,children:(0,P.jsx)(g.Z,{label:"立即提交",onButtonClick:this.onConfirm,width:200})})]})]}),(0,P.jsx)(x.Z,{rem:this.state.inputModal_rem,visible:s,onConfirm:this.onRemInput,onRequestClose:this.hideInputModal}),c&&(0,P.jsx)(h.View,{className:S.getphone_fail_view__mask,children:(0,P.jsxs)(h.View,{className:S.getphone_fail_view__mask__content,children:[(0,P.jsx)(h.Text,{className:S.getphone_fail_view__mask__content__title,children:"确认手机号"}),(0,P.jsx)(h.Text,{className:S.getphone_fail_view__mask__content__label,children:"还需要确认您的手机号，请重新获取"}),(0,P.jsx)(h.Button,{openType:"getPhoneNumber",onGetPhoneNumber:this.onGetPhone,onClick:this.onGetPhoneClick,className:S.getphone_fail_view__mask__content__btn,children:"立即获取"})]})})]})}}]),s}(m.PureComponent),R=(0,A.$j)((function(e){var _=e.replenishment,s=e.cloudBill,n=e.shop,t=e.user;return(0,c.Z)({billid:_.billId,shopList:n.list,address:_.address,stockBarForbillDetail:_.stockBarForbillDetail,mpErpId:s.mpErpId,retryGetPhoneNumber:t.retryGetPhoneNumber,orderPay:"1"===s.shopParams.orderPay,boundPhone:t.phone.length>0,cardPwd:_.cardPwd},(0,j.G_)(_.stockBarForbillDetail,_.isGiftCard))}))(G);Page((0,n.createPageConfig)(R,"subpackages/cloud_bill/pages/replenishment_confirm/index",{root:{cn:[]}},{navigationBarTitleText:"提交订单"}||{}))}},function(e){e.O(0,[666,1772,2107,1216,8592],(function(){return _=62871,e(e.s=_);var _}));e.O()}]);