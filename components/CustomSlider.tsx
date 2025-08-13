import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, View } from 'react-native';

const CustomSlider = (
  {label, minValue, maxValue, value, onValueChange}: {label: string, minValue: number, maxValue: number, value?: number, onValueChange: (value: number) => void}) => {
  return (
    <View>
      <Text>{label}</Text>
      <Text className='label'>{value ? value.toFixed(0) : minValue}</Text>
      <Slider
        style={{width: '100%', height: 40}}
        minimumValue={minValue}
        maximumValue={maxValue}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1EB1FC"
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  )
}

export default CustomSlider