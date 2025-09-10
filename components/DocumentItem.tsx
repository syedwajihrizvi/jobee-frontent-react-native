import { images } from '@/constants';
import { getS3DocumentUrl } from '@/lib/s3Urls';
import { UserDocument } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get("window");

const DocumentItem = (
  { document, actionIcon = 'edit', customAction }: { document: UserDocument, actionIcon?: string, customAction?: () => void }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => setModalVisible(true);
  const handleClose = () => setModalVisible(false);

  return (
    <>
     {customAction ? 
      <View className='relative w-30 h-30 items-center justify-center'>
        <TouchableOpacity className='w-20 h-20' onPress={handleOpen}>
          <Image source={images.resumeImage} className='w-full h-full' resizeMode='cover'/>
        </TouchableOpacity>
        <Text className='font-quicksand-semibold text-sm'>{document.documentType}</Text>
      <TouchableOpacity className='absolute -top-2 -right-2 bg-white rounded-full p-1' onPress={customAction}>
        <AntDesign name={actionIcon as any} size={12} color="black" />
      </TouchableOpacity>
      </View> :
      <TouchableOpacity className='document-item w-20 h-20 flex items-center justify-center' onPress={handleOpen}>
        <Text className='font-quicksand-bold text-sm'>Preview</Text>
      </TouchableOpacity>
    }
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
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
              <Text className="text-lg font-semibold">{document.documentType}</Text>
              <TouchableOpacity onPress={handleClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
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
