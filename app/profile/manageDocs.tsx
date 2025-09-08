import BackBar from '@/components/BackBar';
import DocumentItem from '@/components/DocumentItem';
import LinkInput from '@/components/LinkInput';
import { UserDocumentType } from '@/constants';
import { uploadUserDocument } from '@/lib/manageUserDocs';
import { useDocuments } from '@/lib/services/useDocuments';
import useAuthStore from '@/store/auth.store';
import { AllUserDocuments, User, UserDocument } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const documentTypes = [
  { label: 'Resume', value: UserDocumentType.RESUME },
  { label: 'Cover Letter', value: UserDocumentType.COVER_LETTER },
  { label: 'Certificate', value: UserDocumentType.CERTIFICATE },
  { label: 'Transcript', value: UserDocumentType.TRANSCRIPT },
  { label: 'Recommendation', value: UserDocumentType.RECOMMENDATION }
]

const ManageDocuments = () => {
  const {isLoading, user:authUser} = useAuthStore()
  const {data: userDocs, isLoading: isLoadingDocs} = useDocuments()
  const queryClient = useQueryClient()
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetterLink, setCoverLetterLink] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('RESUME');
  const [open, setOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const addDocumentRef = useRef<BottomSheet>(null);
  const [userDocuments, setUserDocuments] = useState<AllUserDocuments | null>(null);
  const user = authUser as User | null; // Cast once at the top
  useEffect(() => {
    if (userDocs && !isLoadingDocs) {
      // Fetch user documents from the server or local storage
      // This is a placeholder, replace with actual API call
      const resumeDocuments: UserDocument[] = userDocs.filter(doc => doc.documentType === UserDocumentType.RESUME);
      const coverLetterDocuments: UserDocument[] = userDocs.filter(doc => doc.documentType === UserDocumentType.COVER_LETTER);
      const certificateDocuments: UserDocument[] = userDocs.filter(doc => doc.documentType === UserDocumentType.CERTIFICATE);
      const transcriptDocuments: UserDocument[] = userDocs.filter(doc => doc.documentType === UserDocumentType.TRANSCRIPT);
      const recommendationDocuments: UserDocument[] = userDocs.filter(doc => doc.documentType === UserDocumentType.RECOMMENDATION);
      setUserDocuments({
        resumeDocuments,
        coverLetterDocuments,
        certificateDocuments,
        transcriptDocuments,
        recommendationDocuments
      });
    }
  }, [userDocs, isLoadingDocs]);

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
        queryClient.invalidateQueries({ queryKey: ['documents', 'user'] });
    } catch (error) {
        console.error('Error uploading document:', error);
        Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
        setUploadingDocument(false)
    }
  }

  const renderDocumentFlatList = ({title, documents}: {title: string, documents: UserDocument[]}) => (
    <View className='p-4 bg-white'>
      <Text className='font-quicksand-bold text-md'>{title}</Text>
      <FlatList
        data={documents}
        renderItem={({ item }) => (
          <DocumentItem document={item} actionIcon='edit' customAction={() => {}}/>
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
                    await ImagePicker.launchCameraAsync({
                        mediaTypes: 'images',
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    });
                }
            },
            {
                text: uploadByGalleryMsg,
                onPress: async () => {
                    await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    });
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
      <BottomSheet ref={addDocumentRef} index={-1} snapPoints={["30%", '40%']} enablePanDownToClose>
        <BottomSheetView className='flex-1 bg-white p-4 gap-2 w-full justify-center items-center'>
            <View>
              <Text className='font-quicksand-bold text-lg mb-1'>Choose Document Type</Text>
                <View className='flex flex-row flex-wrap gap-1'>
                  {documentTypes.map((doc) => (
                    <TouchableOpacity 
                      key={doc.value} 
                      className={`${selectedDocumentType === doc.value ? 'bg-green-200' : ''} px-3 py-1 rounded-full`}
                      onPress={() => setSelectedDocumentType(doc.value)}>
                      <View>
                        <Text className="text-green-800 font-quicksand-medium">{doc.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
            </View>
            <View className='flex flex-row gap-2'>
            {
            !uploadedDocument ? 
            <TouchableOpacity className="apply-button flex flex-row items-center justify-center w-1/2 gap-2 px-4 py-2" onPress={() => handleUpload(selectedDocumentType)}>
                <Text className='action-button__text'>Upload</Text>
                <AntDesign name="upload" size={20} color="black"/>
            </TouchableOpacity> :
                <TouchableOpacity className='action-button flex flex-row items-center justify-center w-1/2 gap-2 px-4 py-2 bg-red-500' onPress={() => setUploadedDocument(null)}>
                    <Text className='action-button__text'>
                      {uploadedDocument?.assets && uploadedDocument.assets[0]?.name
                        ? uploadedDocument.assets[0].name
                        : 'Document Selected'}
                    </Text>
                    <AntDesign name="delete" size={20} color="black"/>
                </TouchableOpacity>
            }
            <TouchableOpacity 
              className="apply-button flex flex-row items-center justify-center w-1/2 gap-2 gap-2 px-4 py-2"
              onPress={() => handleDocImagePicker("Need to access camera!", "Upload document by taking a photo", "Choose an option", "Upload from Gallery")}>
                <Text className='action-button__text'>Take Photo</Text>
                <AntDesign name="camera" size={20} color="black"/>
            </TouchableOpacity>
            </View>
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