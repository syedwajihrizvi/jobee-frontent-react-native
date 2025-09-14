import { images } from '@/constants';
import { getS3DocumentUrl } from '@/lib/s3Urls';
import { UserDocument } from '@/type';
import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import RenderSlicedText from './RenderSlicedText';

const { height, width } = Dimensions.get("window");

const DocumentItem = (
  { document, actionIcon = 'edit', customAction, outline }: { document: UserDocument, actionIcon?: string, customAction?: () => void, outline?: boolean }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => setModalVisible(true);
  const handleClose = () => setModalVisible(false);

  return (
    <>
     {customAction ? 
      <View className='items-center justify-center'>
        <TouchableOpacity className='w-20 h-20 relative overflow-visible' onPress={handleOpen}>
          <Feather name={actionIcon as any} size={16} color="green" className='absolute -top-1 -right-1 z-50 bg-white'/>
          <Image source={images.resumeImage} className='w-full h-full' resizeMode='cover'/>
        </TouchableOpacity>
        {document.title && <RenderSlicedText text={document.title} maxLength={10} textClassName='font-quicksand-semibold text-sm'/>}
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
              <Text className="text-lg font-semibold">{document.title || document.documentType}</Text>
              <View className='flex-row gap-2'>
                <TouchableOpacity onPress={handleClose}>
                  <Feather name="edit" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose}>
                  <AntDesign name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
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
