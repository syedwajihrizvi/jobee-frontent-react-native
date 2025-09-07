import { images } from '@/constants';
import { completeProfile } from '@/lib/updateUserProfile';
import useAuthStore from '@/store/auth.store';
import { CompleteProfileForm } from '@/type';
import { AntDesign } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { ReactNode, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const UploadProfilePic = () => {
  const { fetchAuthenticatedUser } = useAuthStore();
  const [uploadedResume, setUploadedResume] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<ImagePicker.ImagePickerResult | null>(null)
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [detailsForm, setDetailsForm] = useState<CompleteProfileForm>({
    title: '', city: '',  country: '', summary: '', company: '', position: '', phoneNumber: ''
  })
  const [step, setSteps] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current;
  const handleProfileImageCamera = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }
    Alert.alert(
      'Take Profile Picture',
      '',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const cameraResult = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
              setUploadedProfileImage(cameraResult);
            }
            return
          }
        },
      ]
    );
  }
  const handleProfileImagePicker = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }
    Alert.alert(
      'Upload Profile Picture',
      '',
      [
        {
          text: 'Gallery',
          onPress: async () => {
            const galleryResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
              setUploadedProfileImage(galleryResult);
            }
            return
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
  const handleUpload = async () => {
    try {
        const document = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
        })
        if (!document.canceled) {
            setUploadedResume(document);
        }
    } catch (error) {
        console.error('Error picking document: ', error);
        Alert.alert('Error', 'Failed to upload document. Please try again.')
    }
  }

  const renderProfileImageUri = () => {
    if (uploadedProfileImage && uploadedProfileImage.assets && uploadedProfileImage.assets.length > 0) {
      return uploadedProfileImage.assets[0].uri;
    }
    return images.companyLogo
  }

  const renderUploadedResumeInfo = () => {
    if (uploadedResume && !uploadedResume.canceled && uploadedResume.assets && uploadedResume.assets.length > 0) {
        return (
            <TouchableOpacity>
                <Text className='font-quicksand-bold text-3xl underline'>
                    {uploadedResume.assets[0].name || ''}
                </Text>
            </TouchableOpacity>
        )
    }
  }

  const handleDone = async () => {
    setIsSubmitting(true);
    try {
        await completeProfile(uploadedResume!, uploadedProfileImage!, detailsForm);
        setShowCompleteProfileModal(true);
        await fetchAuthenticatedUser();
    } catch (error) {
        console.error("Error completing profile:", error);
    } finally {
        setIsSubmitting(false);
    }
  }

  const screens: { stepName: string; element: ReactNode }[] = [
    {
      stepName: 'Add Profile Picture',
      element: (
        <View key={1} className="w-full h-full items-center justify-center">
          <View className="mb-4 p-4 rounded-lg flex flex-col items-center justify-center">
            <Image
              source={{ uri: renderProfileImageUri() }}
              className="size-24 rounded-full border-2 border-gray-300"
              resizeMode="contain"
            />
            <View className="flex flex-row gap-4 mt-6">
              <TouchableOpacity 
                className="apply-button px-6 py-3 rounded-full shadow-md"
                onPress={handleProfileImagePicker}
              >
                <Text className="font-quicksand-bold text-white">Upload Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="apply-button px-6 py-3 rounded-full shadow-md"
                onPress={handleProfileImageCamera}
              >
                <Text className="font-quicksand-bold text-white">Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ),
    },
    {
      stepName: 'Add Resume',
      element: (
        <View key={2} className="w-full h-full items-center justify-center">
          <View className="mb-4 p-4 rounded-lg flex flex-col items-center justify-center">
            {uploadedResume ? 
            <>
            <View>
                {renderUploadedResumeInfo()}
            </View>
            </> : 
            <AntDesign name="file1" size={64} color="black" />}
            <View className="flex flex-col gap-6 mt-6">
              <View className="flex flex-row gap-4">
                <TouchableOpacity 
                    className="apply-button px-6 py-3 w-1/2 rounded-full items-center justify-center shadow-md"
                    onPress={handleUpload}>
                  <Text className="font-quicksand-bold text-white">Upload Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity className="apply-button px-6 py-3 w-1/2 rounded-full items-center justify-center shadow-md">
                  <Text className="font-quicksand-bold text-white">Take Photo</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-center font-quicksand-bold text-gray-600">OR</Text>
              <View>
                <TextInput
                  className="rounded-full px-4 py-3 border border-gray-300 shadow-sm text-center"
                  placeholder="Enter your resume link"
                />
              </View>
            </View>
          </View>
        </View>
      ),
    },
    {
      stepName: 'Add Title & Bio',
      element: (
        <View key={2} className="w-full h-full items-center justify-center gap-4">
          <View className='w-full flex-row'>
            <View className='form-input w-full'>
                <Text className='form-input__label'>Title</Text>
                <TextInput 
                    value={detailsForm.title}
                    onChangeText={(text) => setDetailsForm({...detailsForm, title: text})}
                    className='form-input__input'
                    placeholder="eg. Software Engineer"
                />
            </View>            
          </View>
          <View className='w-full flex-row gap-1'>
            <View className='form-input w-1/2'>
                <Text className='form-input__label'>City</Text>
                <TextInput 
                    value={detailsForm.city}
                    onChangeText={(text) => setDetailsForm({...detailsForm, city: text})}
                    className='form-input__input'
                    placeholder="eg. New York, NY"
                />
            </View>  
            <View className='form-input w-1/2'>
                <Text className='form-input__label'>Country</Text>
                <TextInput 
                    value={detailsForm.country}
                    onChangeText={(text) => setDetailsForm({...detailsForm, country: text})}
                    className='form-input__input'
                    placeholder="eg. New York, NY"
                />
            </View>            
          </View>
          <View className='w-full flex-row'>
            <View className='form-input w-full'>
                <Text className='form-input__label'>Phone Number (optional but recommended)</Text>
                <TextInput 
                    value={detailsForm.phoneNumber}
                    onChangeText={(text) => setDetailsForm({...detailsForm, phoneNumber: text})}
                    keyboardType='phone-pad'
                    className='form-input__input'
                    placeholder="eg. (123) 456-7890"
                />
            </View>            
          </View>
          <View className='w-full flex-row'>
            <View className='form-input w-full'>
                <Text className='form-input__label'>Professional Summary</Text>
            <TextInput
                value={detailsForm.summary}
                onChangeText={(text) => setDetailsForm({...detailsForm, summary: text})}
                placeholder="eg. Experienced software engineer with passion for..."
                className='h-30 border border-black rounded-lg p-4 text-gray-700 w-full'
                multiline={true}
                blurOnSubmit={true}
                textAlignVertical="top"
                />
            </View>            
          </View>
        <View>
        <Text className='font-quicksand-bold text-gray-700'>(Leave Blank if Not Currently Employed)</Text>
          <View className='w-full flex-row gap-2'>
            <View className='form-input w-1/2'>
                <Text className='form-input__label'>Current Company</Text>
                <TextInput 
                    value={detailsForm.company}
                    onChangeText={(text) => setDetailsForm({...detailsForm, company: text})}
                    className='form-input__input'
                    placeholder="eg. Amazon"
                />
            </View>
            <View className='form-input w-1/2'>
                <Text className='form-input__label'>Position</Text>
                <TextInput 
                    value={detailsForm.position}
                    onChangeText={(text) => setDetailsForm({...detailsForm, position: text})}
                    className='form-input__input'
                    placeholder="eg. Software Engineer"
                />
            </View>
          </View>
        </View>
        </View>
      ),
    },
    {
      stepName: '',
      element: (
        <View key={2} className="w-full h-full items-center justify-center gap-4">
            <Text className="font-quicksand-bold text-2xl text-gray-700">You&apos;re all set!</Text>
            <Text className="text-center font-quicksand-medium px-4 text-lg">
                With your uploaded resume, our AI will extract information such as skills, education, and work experience.
            </Text>
            <Text className="text-center font-quicksand-medium px-4 text-md">
                You can always update your profile information later from your profile settings.
            </Text>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (step < screens.length - 1) {
      Animated.spring(translateX, {
        toValue: -(step + 1) * Dimensions.get('window').width,
        useNativeDriver: true,
      }).start();
      setSteps(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      Animated.spring(translateX, {
        toValue: -(step - 1) * Dimensions.get('window').width,
        useNativeDriver: true,
      }).start();
      setSteps(step - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        style={{
          flexDirection: 'row',
          width: Dimensions.get('window').width * screens.length,
          height: '80%',
          transform: [{ translateX }],
        }}
      >
        {screens.map((screen, index) => (
          <View
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: Dimensions.get('window').width,
            }}
          >
            {screen.stepName &&<Text className="font-quicksand-bold text-2xl top-20 text-gray-700">
              {index + 1}) {screen.stepName}
            </Text>}
            <View className="flex-1 items-center justify-center px-4">{screen.element}</View>
          </View>
        ))}
      </Animated.View>
      <View className="flex flex-row items-center justify-center w-full gap-4 p-4">
        <TouchableOpacity
          className={`${
            step === 0 ? 'bg-gray-300' : 'apply-button'
          } w-1/2 items-center justify-center h-14 rounded-full`}
          onPress={handlePrev}
          disabled={step === 0}
        >
          <Text className="font-quicksand-bold text-white">Previous</Text>
        </TouchableOpacity>
        {step === screens.length - 1 ? 
                <TouchableOpacity
          className='apply-button w-1/2 items-center justify-center h-14 rounded-full'
          onPress={handleDone}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-quicksand-bold text-white">Done</Text>}
        </TouchableOpacity> :
        <TouchableOpacity
          className={`${
            step === screens.length - 1 ? 'bg-gray-300' : 'apply-button'
          } w-1/2 items-center justify-center h-14 rounded-full`}
          onPress={handleNext}
          disabled={step === screens.length - 1}
        >
          <Text className="font-quicksand-bold text-white">Next</Text>
        </TouchableOpacity>
        }
      </View>
    <Modal
        transparent
        animationType="fade"
        visible={showCompleteProfileModal}
    >
      <View className='flex-1 bg-black/45 justify-center items-center'>
        <View
            style={{
                width: 300,
                height: 200,
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                gap: 10
            }}>
            <View className='flex flex-col items-center justify-center gap-4'>
              <Text className='font-quicksand-bold text-xl'>Good Job!</Text>
              <Text className='font-quicksand-medium text-center'>With your updated profile, you can now apply for jobs more easily!</Text>
                  <TouchableOpacity 
                      className='apply-button w-full items-center justify-center h-14 px-6 py-2'
                      onPress={() => {
                          setShowCompleteProfileModal(false);
                          router.push('/(tabs)/users/jobs');
                      }}>
                      <Text className='font-quicksand-bold text-lg'>Return Home</Text>
                  </TouchableOpacity>
                </View>
            </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
};

export default UploadProfilePic;