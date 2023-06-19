import Taro from '@tarojs/taro'
import React from 'react'
import { View, Input, Text, Image, Button, Block } from '@tarojs/components'
import { DefaultDispatchProps, GlobalState } from '@@types/model_state'
import { connect } from 'react-redux'
import angleIcon from '@/images/angle_right_gray_40.png'

import {
  getCategoriesByType,
  getMiniAppVersionInfo,
  getWxAppRegisterData,
  IRegisterAppParams,
  registerApp
} from '@api/applyApp_api_manager'
import { getTaroParams } from '@utils/utils'
import AuthImgUpload from '../../components/AuthImgUpload'
import AvatarUpload from '../../components/AvatarUpload'
import styles from './index.module.scss'
import { getCategoriesLevelMap } from '../../utils'
import BusinessCategoriesSelect, { ICateOption } from '../../components/BusinessCategoriesSelect'
import CodeTypeSelect from '../../components/CodeTypeSelect'
import UnderReview from '../../components/Result/UnderReview'
import CreateSuccess from '../../components/Result/CreateSuccess'
import ApplyError from '../../components/Result/ApplyError'
import { CodeTypes } from '../../utils/constants'
import CodeTypePicker from '../../components/CodeTypePicker'
import BusinessCatePicker from '../../components/BusinessCatePicker'

const needJudge = [
  {
    keyName: 'appHeadImageDocId',
    msg: '请上传小程序头像'
  },
  {
    keyName: 'appName',
    msg: '请输入小程序名'
  },
  {
    keyName: 'bizLicenseDocId',
    msg: '请上传营业执照'
  },
  {
    keyName: 'corpName',
    msg: '请输入企业名称'
  },
  {
    keyName: 'corpCode',
    msg: '请输入企业代码'
  },
  {
    keyName: 'corpCodeType',
    msg: '请选择企业代码类型'
  },
  {
    keyName: 'legalPersonName',
    msg: '请输入法人名称'
  },
  {
    keyName: 'legalPersonWechat',
    msg: '请输入法人微信'
  },
  {
    keyName: 'componentPhone',
    msg: '请输入第三方联系电话'
  }
]

const mapStateToProps = ({ applyMiniapp }: GlobalState) => {
  const { name, avatar, seniorityAuth, businessCategory, certifications } = applyMiniapp
  return {
    name,
    avatar,
    seniorityAuth,
    businessCategory,
    certifications
  }
}
type State = {
  businessCategoryLevelMap: Map<any, any>
  businessCategoriesIdMap: Map<any, any>
  applyFlag: number | null // -1失败 0默认 1等待 2成功
  bizId: string
}

type StateProps = ReturnType<typeof mapStateToProps>

// @connect<StateProps, DefaultDispatchProps>(mapStateToProps)
class ApplyMiniappIndex extends React.Component<
  StateProps & DefaultDispatchProps,
  State
> {
  state = {
    businessCategoryLevelMap: new Map(),
    businessCategoriesIdMap: new Map(),
    applyFlag: null,
    bizId: ''
  }

  async componentDidMount() {
    Taro.showLoading({ title: '加载中' })
    Taro.setNavigationBarColor({ backgroundColor: '#f9f9f9', frontColor: '#000000' })
    Taro.setNavigationBarTitle({ title: '' })

    const { bizId, proType } = getTaroParams(Taro.getCurrentInstance?.())
    // 查询当前注册状态
    const appRegisterRes = await getWxAppRegisterData({ bizId, proType })
    let {
      flag,
      appName,
      appHeadImageDocId,
      appHeadImageDocUrl,
      bizLicenseDocId,
      bizLicenseDocUrl,
      categories,
      corpCode,
      corpCodeType,
      corpName,
      legalPersonName,
      legalPersonWechat,
      componentPhone,
      appId
    } = appRegisterRes.data

    if (flag === 2) {
      // 判断小程序是否发布
      const appVersionRes = await getMiniAppVersionInfo({ appId, proType: 'cloudBill' })
      const { release_info } = appVersionRes.data
      if (release_info === undefined) {
        // 未上线
        flag = 1
      }
    }

    if (flag !== 0 && flag !== -1) {
      return this.setState({ applyFlag: flag, bizId }, () => Taro.hideLoading())
    }

    const res = await getCategoriesByType()
    const { businessCategoryLevelMap, businessCategoriesIdMap } = getCategoriesLevelMap(
      res.data.categories_list.categories
    )

    if (flag === -1) {
      const l1Category = businessCategoriesIdMap.get(categories[0].first)
      const l2Category = businessCategoriesIdMap.get(categories[0].second)
      this.props.dispatch({
        type: 'applyMiniapp/save',
        payload: {
          name: appName,
          avatar: {
            url: appHeadImageDocUrl[0],
            docId: appHeadImageDocId
          },
          businessCategory: {
            l1Category,
            l2Category
          },
          seniorityAuth: {
            bizLicense: {
              docId: bizLicenseDocId,
              url: bizLicenseDocUrl[0]
            },
            licenseNo: corpCode,
            faRen: legalPersonName,
            faRenWx: legalPersonWechat,
            codeType: CodeTypes.find(t => t.id === corpCodeType),
            companyName: corpName,
            componentPhone: componentPhone || ''
          },
          certifications: categories[0].certicates.map(certicate => {
            return {
              qualifyName: certicate.key,
              url: certicate.docUrls[0],
              docId: certicate.docId
            }
          })
        }
      })
    }

    this.setState(
      { businessCategoryLevelMap, businessCategoriesIdMap, applyFlag: flag, bizId },
      () => Taro.hideLoading()
    )
  }

  handleSeniorityAuthChange = (keyName, value) => {
    this.props.dispatch({
      type: 'applyMiniapp/changeSeniorityAuth',
      payload: { [keyName]: value }
    })
  }

  handleAppNameChange = e => {
    this.props.dispatch({
      type: 'applyMiniapp/save',
      payload: { name: e.detail.value }
    })
  }

  handleFaRenWxChange = e => this.handleSeniorityAuthChange('faRenWx', e.detail.value)

  handleFaRenChange = e => this.handleSeniorityAuthChange('faRen', e.detail.value)

  handleLicenseNoChange = e => this.handleSeniorityAuthChange('licenseNo', e.detail.value)

  handleCompanyNameChange = e => this.handleSeniorityAuthChange('companyName', e.detail.value)

  handleComponentPhoneChange = e => this.handleSeniorityAuthChange('componentPhone' , e.detail.value)

  handleSubmit = async () => {
    // 收集请求数据，对非空值判断
    const { name, avatar, seniorityAuth, businessCategory, certifications } = this.props
    const { bizLicense, codeType, licenseNo, faRen, faRenWx, companyName ,componentPhone} = seniorityAuth
    if (!businessCategory.l1Category || !businessCategory.l2Category) {
      return Taro.showToast({ icon: 'none', title: '请选择经营类目' })
    }
    // 判断资质证书是否上传
    const flatQualify: any[] = []
    businessCategory.l2Category.sensitive_type === 1 &&
      businessCategory.l2Category.qualify.exter_list.forEach((exter, index) => {
        exter.inner_list.map(inner => {
          flatQualify.push(inner)
        })
      })
    if (!certifications && flatQualify.length !== 0) {
      return Taro.showToast({ icon: 'none', title: '请上传资质证书' })
    }
    // 资质证书上传至少一个即可
    // if (certifications.length != flatQualify.length) {
    //   return Taro.showToast({ icon: 'none', title: '请上传资质证书' })
    // }

    const certicates: any[] = []
    if (certifications) {
      for (let i = 0; i < certifications.length; i++) {
        if (certifications[i]) {
          certicates.push({
            key: certifications[i].qualifyName,
            docId: certifications[i].docId
          })
        }
      }
    }

    const categories = [
      {
        first: businessCategory.l1Category.id,
        second: businessCategory.l2Category.id,
        certicates
      }
    ]

    const formData = {
      proType: 'cloudBill',
      bizId: this.state.bizId,
      appName: name,
      appHeadImageDocId: avatar && avatar.docId,
      bizLicenseDocId: bizLicense && bizLicense.docId,
      corpCode: licenseNo,
      corpCodeType: codeType && codeType.id,
      legalPersonName: faRen,
      legalPersonWechat: faRenWx,
      corpName: companyName,
      categories,
      componentPhone
    }
    for (let i = 0; i < needJudge.length; i++) {
      const cur = needJudge[i]
      if (!formData[cur.keyName]) {
        return Taro.showToast({ icon: 'none', title: cur.msg })
      }
    }

    Taro.showLoading({ title: '提交中' })
    try {
      await registerApp(formData as IRegisterAppParams)
      this.setState({ applyFlag: 1 }, () => Taro.hideLoading())
    } catch(e) {
    } finally {
      Taro.hideLoading()
    }
  }

  businessCategorySelected = (cateOption: ICateOption) => {
    const { l1Categories, corresChilds, curL1CateIdx, curL2CateIdx } = cateOption
    const l1Category = l1Categories[curL1CateIdx]
    const l2Category = corresChilds[curL2CateIdx]
    if (l1Category && l2Category) {
      this.props.dispatch({
        type: 'applyMiniapp/changeBusinessCategory',
        payload: {
          businessCategory: {
            l1Category,
            l2Category
          }
        }
      })
    }
  }

  onBizLicenseImgUpload = async () => {
    const choosedImgUrl = await Taro.chooseImage({
      count: 1,
      sourceType: ['album']
    })
    if (!choosedImgUrl.tempFilePaths[0]) return
    Taro.showLoading({ title: '图片上传中' })
    await this.props.dispatch({
      type: 'applyMiniapp/uploadImage',
      payload: { url: choosedImgUrl.tempFilePaths[0], imgType: 'bizLicense' }
    })
    Taro.hideLoading()
  }

  onCertificationImgUpload = async qualify => {
    const choosedImgUrl = await Taro.chooseImage({
      count: 1,
      sourceType: ['album']
    })
    if (!choosedImgUrl.tempFilePaths[0]) return
    Taro.showLoading({ title: '图片上传中' })
    await this.props.dispatch({
      type: 'applyMiniapp/uploadImage',
      payload: {
        url: choosedImgUrl.tempFilePaths[0],
        imgType: 'certifications',
        index: qualify.index,
        qualifyName: qualify.qualifyName
      }
    })
    Taro.hideLoading()
  }

  fixInfo = () => {
    this.setState({ applyFlag: 0 })
  }

  render() {
    const { name, avatar, seniorityAuth, businessCategory, certifications } = this.props
    const { bizLicense, codeType } = seniorityAuth
    const { applyFlag } = this.state

    if (applyFlag === 1) {
      return <UnderReview />
    } else if (applyFlag === 2) {
      return <CreateSuccess />
    } else if (applyFlag === -1) {
      return <ApplyError onReSubmit={this.fixInfo} />
    } else if (applyFlag === null) {
      return <Block />
    }

    const flatQualify: any[] = []
    businessCategory.l2Category &&
      businessCategory.l2Category.sensitive_type === 1 &&
      businessCategory.l2Category.qualify.exter_list.forEach((exter, index) => {
        exter.inner_list.map(inner => {
          flatQualify.push(inner)
        })
      })
    return (
      <View className={styles.page}>
        <View className={styles.hint}>
          <View className={styles.hint__title}>请填写以下资料，快速创建小程序</View>
          <View className={styles.hint__desc}>确保资料正确无误</View>
        </View>
        {/* 基础信息 */}
        <View className={styles.card}>
          <View className={styles.baseinfo}>
            <View className={styles.baseinfo__avatar}>
              <AvatarUpload
                url={avatar && avatar.url}
                dispatch={this.props.dispatch}
                label='点击上传小程序头像'
              ></AvatarUpload>
            </View>
            <View className={styles.input}>
              <Text className={styles.input__label}>小程序名称</Text>
              <View className={styles.input__input}>
                <Input
                  placeholder='请输入名称'
                  value={name}
                  onInput={this.handleAppNameChange}
                  maxlength={10}
                ></Input>
              </View>
              <View className={styles.input__suffix}>
                <Text>{`${name.length}/10`}</Text>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>经营类目</Text>
              <View className={styles.input__input}>
              {Taro.getEnv() === Taro.ENV_TYPE.WEB ? (
                  <BusinessCatePicker
                    handleSelected={this.businessCategorySelected}
                    categoriesLevelMap={this.state.businessCategoryLevelMap}
                    placeholder={
                      businessCategory.l1Category && businessCategory.l2Category
                        ? `${businessCategory.l1Category.name}  ${businessCategory.l2Category.name}`
                        : '请选择'
                    }
                  />
                ) : (
                  <BusinessCategoriesSelect
                    handleSelected={this.businessCategorySelected}
                    categoriesLevelMap={this.state.businessCategoryLevelMap}
                    placeholder={
                      businessCategory.l1Category && businessCategory.l2Category
                        ? `${businessCategory.l1Category.name}  ${businessCategory.l2Category.name}`
                        : '请选择'
                    }
                  />
                )}
              </View>
              <View className={styles.input__suffix}>
                <Image src={angleIcon} className={styles.input__suffix__icon} />
              </View>
            </View>

            {/* sensitive_type	number	是否为敏感类目（1 为敏感类目，需要提供相应资质证明审核；0 为非敏感类目，无需审核) */}
            {businessCategory.l2Category &&
              businessCategory.l2Category.sensitive_type === 1 &&
              flatQualify.length > 0 &&
              flatQualify.map((qualify, index) => {
                return (
                  <Block key={index}>
                    <View className='solid_line'></View>
                    <View className={styles.input}>
                      <Text className={styles.input__label}>
                        资质证书{flatQualify.length > 1 ? index + 1 : ''}
                      </Text>
                      <View className={styles.input__input}>
                        <AuthImgUpload
                          url={certifications && certifications[index] && certifications[index].url}
                          label={qualify.name}
                          onImgUpload={() =>
                            this.onCertificationImgUpload({ index, qualifyName: qualify.name })
                          }
                        ></AuthImgUpload>
                      </View>
                    </View>
                  </Block>
                )
              })}
          </View>
        </View>

        {/* 资历认证 */}
        <View className={styles.label}>资历认证</View>
        <View className={styles.card}>
          <View className={styles.baseinfo}>
            <View className={styles.input}>
              <Text className={styles.input__label}>营业执照</Text>
              <View className={styles.input__input}>
                <AuthImgUpload
                  url={bizLicense && bizLicense.url}
                  label='点击上传'
                  onImgUpload={this.onBizLicenseImgUpload}
                  type='bizLicense'
                ></AuthImgUpload>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>企业名称</Text>
              <View className={styles.input__input}>
                <Input
                  value={seniorityAuth.companyName}
                  placeholder='请输入企业名称'
                  onInput={this.handleCompanyNameChange}
                ></Input>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>企业代码类型</Text>
              <View className={styles.input__input}>
                {Taro.getEnv() === Taro.ENV_TYPE.WEB  ? <CodeTypePicker seniorityAuth={seniorityAuth} /> : <CodeTypeSelect seniorityAuth={seniorityAuth} />}
              </View>
              <View className={styles.input__suffix}>
                <Image src={angleIcon} className={styles.input__suffix__icon} />
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>企业代码</Text>
              <View className={styles.input__input}>
                <Input
                  value={seniorityAuth.licenseNo}
                  placeholder='请输入企业代码'
                  onInput={this.handleLicenseNoChange}
                  maxlength={codeType ? codeType.numLength : 20}
                ></Input>
              </View>
              <View className={styles.input__suffix}>
                <Text>{codeType ? `${codeType.numLength}位` : ''}</Text>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>法人名称</Text>
              <View className={styles.input__input}>
                <Input
                  value={seniorityAuth.faRen}
                  placeholder='请输入名称'
                  onInput={this.handleFaRenChange}
                ></Input>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>法人微信号</Text>
              <View className={styles.input__input}>
                <Input
                  value={seniorityAuth.faRenWx}
                  placeholder='请输入微信号'
                  onInput={this.handleFaRenWxChange}
                ></Input>
              </View>
            </View>

            <View className='solid_line'></View>

            <View className={styles.input}>
              <Text className={styles.input__label}>联系电话</Text>
              <View className={styles.input__input}>
                <Input
                  value={seniorityAuth.componentPhone}
                  placeholder='请输入联系电话'
                  onInput={this.handleComponentPhoneChange}
                ></Input>
              </View>
            </View>

          </View>
        </View>

        {/* 底部提交按钮 */}
        <View className={styles.bar}>
          <Button className={styles.bar__submit} onClick={this.handleSubmit}>
            立即创建
          </Button>
        </View>
      </View>
    )
  }
}
export default connect<StateProps, DefaultDispatchProps>(mapStateToProps)(ApplyMiniappIndex)
