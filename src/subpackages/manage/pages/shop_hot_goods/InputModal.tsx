import { AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useRef } from 'react'

const InputModal = ({ visible, value, onCancel, onConfirm }) => {
  const valueRef = useRef(value)
  const handleEditTitleSave = () => onConfirm(valueRef.current)

  return (
    <AtModal isOpened={visible}>
      <AtModalHeader>活动标题</AtModalHeader>
      <AtModalContent>
        {visible && (
          <Input
            focus
            adjustPosition
            value={valueRef.current}
            onInput={e => (valueRef.current = String(e.detail.value))}
          />
        )}
      </AtModalContent>
      <AtModalAction>
        <Button onClick={() => onCancel()}>取消</Button>
        <Button onClick={handleEditTitleSave}>确定</Button>
      </AtModalAction>
    </AtModal>
  )
}

export default InputModal
