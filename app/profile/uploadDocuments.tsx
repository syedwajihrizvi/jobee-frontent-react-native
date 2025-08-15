import BackBar from '@/components/BackBar';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UploadDocuments = () => {
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetterLink, setCoverLetterLink] = useState('');
  const handleUpload = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        })
        console.log(result);
    } catch (error) {
        console.error('Error picking document: ', error);
    }
  }

  const handleDocImagePicker = async (
    noAccessMsg:string, accessMsg: string, uploadByPhotoMsg: string, uploadByGalleryMsg: string) => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted === false) {
      Alert.alert(noAccessMsg);
      return;
    }
    Alert.alert(
        'Add new Resume', 
        'Choose an option', 
        [
            {
                text: uploadByPhotoMsg,
                onPress: async () => {
                    const image = await ImagePicker.launchCameraAsync({
                        mediaTypes: 'images',
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    });
                    if (!image.canceled) {
                        console.log('Image selected:', image);
                        // Here you can convert the image to PDF or handle it as needed
                    }
                }
            },
            {
                text: uploadByGalleryMsg,
                onPress: async () => {
                    const image = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    });
                    if (!image.canceled) {
                        console.log('Image selected:', image);
                        // Here you can convert the image to PDF or handle it as needed
                    }
                }
            },
            {
                text: 'Cancel',
                style: 'cancel'
            }
        ]);
  }

  /*
  User can upload documents the following ways
  1) Upload File
  2) Pase Google Drive / Dropbox Link
  3) Take a Photo which we will convert to PDF
  */
  return (
    <SafeAreaView className='flex-1 bg-white h-full p-4'>
      <BackBar label="Upload Documents" />     
      <View>
        <Button title="Upload new Resume" onPress={handleUpload} />
        <Button title="Upload new Cover Letter" onPress={handleUpload} />
        <TextInput placeholder='Paste your Google Drive / Dropbox Link for your resume' value={resumeLink} onChangeText={setResumeLink} />
        <TextInput placeholder='Paste your Google Drive / Dropbox Link for your cover letter' value={coverLetterLink} onChangeText={setCoverLetterLink} />
        <Button title="Take a Photo for Resume" onPress={() => handleDocImagePicker("Need to access camera!", "Upload Resume by taking a photo", "Choose an option", "Upload from Gallery")}/>
        <Button title="Take a Photo for Cover Letter" onPress={() => handleDocImagePicker("Need to access camera!", "Upload Cover Letter by taking a photo", "Choose an option", "Upload from Gallery")}/>
      </View>
    </SafeAreaView>
  )
}

export default UploadDocuments