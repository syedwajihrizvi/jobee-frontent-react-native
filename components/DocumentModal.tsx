import { getS3DocumentUrl } from '@/lib/s3Urls';
import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';


const { height, width } = Dimensions.get("window");

const DocumentModal = (
    {documentType, documentUrl, visible, handleClose}: {documentType: string, documentUrl: string, visible: boolean, handleClose: () => void}) => {
  return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View 
            style={{ 
              height: height * 0.6,
              width: width * 0.9,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "white"
            }}
          >
            <View className="p-3 flex-row justify-between items-center bg-gray-200">
              <Text className="text-lg font-semibold">{documentType}</Text>
              <TouchableOpacity onPress={handleClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: getS3DocumentUrl(documentUrl) }}
              style={{ flex: 1 }}
              scalesPageToFit
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => <Text>Loading...</Text>}
              renderError={() => <Text>Error loading document</Text>}
            />
          </View>
        </View>
      </Modal>
  )
}

export default DocumentModal