import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const PrepareWithJobee = ({
  visible,
  company,
  handlePrepareWithJobeeConfirm,
  handleClose,
}: {
  visible: boolean;
  company: string;
  handlePrepareWithJobeeConfirm: () => void;
  handleClose: () => void;
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/45 justify-center items-center">
        <View
          style={{
            width: 300,
            height: 200,
            backgroundColor: "white",
            borderRadius: 16,
            paddingHorizontal: 10,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            gap: 10,
          }}
        >
          <Text className="font-quicksand-bold text-lg">
            Prepare with Jobee
          </Text>
          <Text className="font-quicksand-semibold text-base text-center">
            We will get you ready for you interview with {company}!
          </Text>
          <View className="flex flex-row items-center justify-center w-full gap-2">
            <TouchableOpacity
              className="apply-button w-1/2 items-center justify-center h-14"
              onPress={handlePrepareWithJobeeConfirm}
            >
              <Text className="font-quicksand-bold">Prepare</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="apply-button w-1/2 items-center justify-center h-14"
              onPress={handleClose}
            >
              <Text className="font-quicksand-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PrepareWithJobee;
