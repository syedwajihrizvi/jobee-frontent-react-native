import { getS3DocumentUrl } from '@/lib/s3Urls';
import { UserDocument } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get("window");

const DocumentItem = ({ document }: { document: UserDocument }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => setModalVisible(true);
  const handleClose = () => setModalVisible(false);

  return (
    <>
      {/* Document card */}
      <TouchableOpacity className='document-item' onPress={handleOpen}>
        <View className='bg-white absolute bottom-0 w-full p-2 items-center justify-center rounded-b-2xl'>
          <Text>{document.documentType}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal with centered popup */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/45 justify-center items-center">
          {/* Popup box */}
          <View 
            style={{ 
              height: height * 0.6,   // 80% of screen height
              width: width * 0.9,     // 90% of screen width
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "white"
            }}
          >
            {/* Header */}
            <View className="p-3 flex-row justify-between items-center bg-gray-200">
              <Text className="text-lg font-semibold">{document.documentType}</Text>
              <TouchableOpacity onPress={handleClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* WebView */}
            <WebView
              source={{ uri: getS3DocumentUrl(document.documentUrl) }}
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
    </>
  );
};

export default DocumentItem;
