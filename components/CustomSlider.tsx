import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, View } from 'react-native';

const CustomSlider = ({label, minValue, maxValue}: {label: string, minValue: number, maxValue: number}) => {
  return (
    <View>
      <Text>{label}</Text>
      <Slider
        style={{width: '100%', height: 40}}
        minimumValue={minValue}
        maximumValue={maxValue}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1EB1FC"
      />
    </View>
  )
}

export default CustomSlider