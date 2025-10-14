import React from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  data: { label: string; value: number; color: string }[];
};

const Piechart = ({ data }: Props) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  const slices = data.map((item, index) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    const endAngle = ((cumulative + item.value) / total) * 2 * Math.PI;
    cumulative += item.value;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const radius = 50;
    const x1 = radius + radius * Math.cos(startAngle);
    const y1 = radius + radius * Math.sin(startAngle);
    const x2 = radius + radius * Math.cos(endAngle);
    const y2 = radius + radius * Math.sin(endAngle);

    const d = `M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;

    return <Path key={index} d={d} fill={item.color} />;
  });

  return (
    <View className="items-center">
      <Svg width={100} height={100}>
        {slices}
      </Svg>
      <View className="mt-3 gap-1">
        {data.map((item, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View style={{ width: 10, height: 10, backgroundColor: item.color }} />
            <Text>{`${item.label}: ${item.value}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Piechart;
