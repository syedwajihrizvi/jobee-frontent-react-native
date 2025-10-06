import React, { ReactNode } from "react";
import { Dimensions, Modal, View } from "react-native";
const { height, width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  customHeight?: number;
  customWidth?: number;
  children: ReactNode;
};

const ModalWithBg = ({ visible, children, customHeight, customWidth }: Props) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View
          style={{
            height: height * (customHeight || 0.5),
            width: width * (customWidth || 0.75),
            borderRadius: 20,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default ModalWithBg;
