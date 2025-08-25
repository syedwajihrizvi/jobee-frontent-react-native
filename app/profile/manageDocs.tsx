import BackBar from '@/components/BackBar';
import DocumentItem from '@/components/DocumentItem';
import LinkInput from '@/components/LinkInput';
import { UserDocumentType } from '@/constants';
import { uploadUserDocument } from '@/lib/manageUserDocs';
import useAuthStore from '@/store/auth.store';
import { AllUserDocuments, UserDocument } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

const ManageDocuments = () => {
  const {isLoading, user} = useAuthStore()
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetterLink, setCoverLetterLink] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('RESUME');
  const [open, setOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const addDocumentRef = useRef<BottomSheet>(null);
  const [userDocuments, setUserDocuments] = useState<AllUserDocuments | null>(null);

  useEffect(() => {
    if (user && user.documents) {
      // Fetch user documents from the server or local storage
      // This is a placeholder, replace with actual API call
      const resumeDocuments: UserDocument[] = user.documents.filter(doc => doc.documentType === UserDocumentType.RESUME);
      const coverLetterDocuments: UserDocument[] = user.documents.filter(doc => doc.documentType === UserDocumentType.COVER_LETTER);
      const certificateDocuments: UserDocument[] = user.documents.filter(doc => doc.documentType === UserDocumentType.CERTIFICATE);
      const transcriptDocuments: UserDocument[] = user.documents.filter(doc => doc.documentType === UserDocumentType.TRANSCRIPT);
      const recommendationDocuments: UserDocument[] = user.documents.filter(doc => doc.documentType === UserDocumentType.RECOMMENDATION);
      setUserDocuments({
        resumeDocuments,
        coverLetterDocuments,
        certificateDocuments,
        transcriptDocuments,
        recommendationDocuments
      });
    }
  }, [isLoading, user])

  const handleUpload = async (documentType: string) => {
    setUploadingDocument(true)
    try {
        const document = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
        })
        if (!document.canceled) {
            setUploadedDocument(document);
            console.log('Selected document:', document);
        }
    } catch (error) {
        console.error('Error picking document: ', error);
        Alert.alert('Error', 'Failed to upload document. Please try again.')
    } finally {
        setUploadingDocument(false)
    }
  }

  const handleDocumentUploadSubmit = async () => {
    if (!uploadedDocument) {
        Alert.alert('Error', 'Please select a document to upload');
        return;
    }
    setUploadingDocument(true);
    try {
        await uploadUserDocument(uploadedDocument, selectedDocumentType);
        Alert.alert('Success', 'Document uploaded successfully');
        addDocumentRef.current?.close();
    } catch (error) {
        console.error('Error uploading document:', error);
        Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
        setUploadingDocument(false)
    }
  }

  const renderDocumentFlatList = ({title, documents}: {title: string, documents: UserDocument[]}) => (
    <View className='p-4 bg-white'>
      <Text className='font-quicksand-bold text-xl'>{title}</Text>
      <FlatList
        data={documents}
        renderItem={({ item }) => (
          <DocumentItem document={item}/>
        )}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className='w-5'/>}
        contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 4 }}
      />
    </View>
  )
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

  const sendDocumentUriToServer = async () => {
    console.log('Sending document URI to server...');
  }

  /*
  User can upload documents the following ways
  1) Upload File
  2) Pase Google Drive / Dropbox Link
  3) Take a Photo which we will convert to PDF
  */
  // TODO: Replace RESUME and COVER_LETTER with actual DocumentType enum values
  return (
    <SafeAreaView className='flex-1 bg-white h-full'>
      <BackBar label="Manage Documents" optionalThirdItem={
        <TouchableOpacity onPress={() => addDocumentRef.current?.expand()}>
            <AntDesign name="plus" size={24} color="black"/>
        </TouchableOpacity>
      }/>     
      {isLoading ? <ActivityIndicator size='large' className='flex-1 justify-center items-center'/> :
        <ScrollView>
          {renderDocumentFlatList({title: 'My Resumes', documents: userDocuments?.resumeDocuments || []})}
          <View className='divider'/>
          {renderDocumentFlatList({title: 'My Cover Letters', documents: userDocuments?.coverLetterDocuments || []})}
          <View className='divider'/>
          {renderDocumentFlatList({title: 'My Certificates', documents: userDocuments?.certificateDocuments || []})}
        <View className='divider'/>
        {renderDocumentFlatList({title: 'My Transcripts', documents: userDocuments?.transcriptDocuments || []})}
        <View className='divider'/>
        {renderDocumentFlatList({title: 'My Recommendations', documents: userDocuments?.recommendationDocuments || []})}
      </ScrollView>}
      <BottomSheet ref={addDocumentRef} index={-1} snapPoints={["40%", '50%']} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white p-4 gap-4 w-full justify-center items-center'>
            <View>
            <Text className='font-quicksand-bold text-md mb-1'>Document Type</Text>
            <DropDownPicker
                open={open}
                value={selectedDocumentType}
                items={[
                    {label: 'Resume', value: UserDocumentType.RESUME},
                    {label: 'Cover Letter', value: UserDocumentType.COVER_LETTER},
                    {label: 'Certificate', value: UserDocumentType.CERTIFICATE},
                    {label: 'Transcript', value: UserDocumentType.TRANSCRIPT},
                    {label: 'Recommendation', value: UserDocumentType.RECOMMENDATION}
                ]}
                setOpen={setOpen}
                setValue={(value) => setSelectedDocumentType(value)}
                setItems={() => {}}
                containerStyle={{width: '100%'}}
                placeholder="Select Document Type"
            />
            </View>
            {
            !uploadedDocument ? 
            <TouchableOpacity className="action-button bg-blue-500 w-full" onPress={() => handleUpload(selectedDocumentType)}>
                <Text className='action-button__text'>Upload a Document</Text>
                <AntDesign name="upload" size={20} color="black"/>
            </TouchableOpacity> :
            <View className='w-full flex-col gap-2'>
                <Text className='font-quicksand-bold color-blue-500'>{uploadedDocument.assets && uploadedDocument.assets[0]?.name ? uploadedDocument.assets[0].name : 'No document name available'}</Text>
                <TouchableOpacity className='action-button bg-red-500 w-full' onPress={() => setUploadedDocument(null)}>
                    <Text className='action-button__text'>Remove Document</Text>
                    <AntDesign name="file1" size={20} color="black"/>
                </TouchableOpacity>
            </View>}
            <Text className='font-quicksand-bold text-md'>OR</Text>
            <TouchableOpacity className="action-button bg-blue-500 w-full"onPress={() => handleDocImagePicker("Need to access camera!", "Upload document by taking a photo", "Choose an option", "Upload from Gallery")}>
                <Text className='action-button__text'>Take a Photo</Text>
                <AntDesign name="camera" size={20} color="black"/>
            </TouchableOpacity>
            <Text className='font-quicksand-bold text-md'>OR</Text>
            <LinkInput
                value={resumeLink}
                onChangeText={setResumeLink}
                onIconPress={sendDocumentUriToServer}
            />
            <View className="w-full p-4 flex-row gap-2 items-center justify-center">
                <TouchableOpacity 
                    className='apply-button w-3/6 items-center justify-center h-14'
                    onPress={handleDocumentUploadSubmit}>
                <Text className='font-quicksand-semibold text-md'>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className='favorite-button h-14 w-3/6 items-center justify-center'
                    onPress={() => addDocumentRef.current?.close()}>
                <Text className='font-quicksand-semibold text-md'>Close</Text>
                </TouchableOpacity>
            </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  )
}

export default ManageDocuments