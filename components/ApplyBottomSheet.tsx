import { formatDate, getUserDocumentById } from '@/lib/utils';
import useAuthStore from '@/store/auth.store';
import { User, UserDocument } from '@/type';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from './CustomButton';
import DocumentItem from './DocumentItem';

type ApplyBottomSheetProps = {
    userHasResume: boolean,
    selectedResume: string | null,
    setSelectedResume: React.Dispatch<React.SetStateAction<string | null>>
    openResumeDropdown: boolean,
    setOpenResumeDropdown: React.Dispatch<React.SetStateAction<boolean>>,
    selectedCoverLetter: string | null,
    setSelectedCoverLetter: React.Dispatch<React.SetStateAction<string | null>>
    openCoverLetterDropdown: boolean,
    setOpenCoverLetterDropdown: React.Dispatch<React.SetStateAction<boolean>>,
    userDocuments: {'RESUMES': UserDocument[], 'COVER_LETTERS': UserDocument[]} | null,
    isSubmittingApplication: boolean,
    handleSubmitApplication: () => void,
    closeSheet: () => void
}
const ApplyBottomSheet = ({userHasResume, selectedResume, setSelectedResume, openResumeDropdown, setOpenResumeDropdown, selectedCoverLetter, setSelectedCoverLetter, openCoverLetterDropdown, setOpenCoverLetterDropdown, userDocuments, isSubmittingApplication, handleSubmitApplication, closeSheet}: ApplyBottomSheetProps) => {
 const { user: authUser } = useAuthStore()
 const user = authUser as (User | null)
 
  return (
          <View className='p-4 bg-white flex-1'>
            {
            userHasResume ? 
            <>
              <View className='w-full flex-row items-center justify-between'>
                  <Text className='font-quicksand-bold text-2xl'>
                    Please confirm details
                  </Text>
                  <TouchableOpacity onPress={() => console.log("Show AI information")} className='p-1 rounded-full border border-black'>
                    <AntDesign name="info" size={16} color="black"/>
                  </TouchableOpacity>
              </View>
                <View>
                  <Text className='font-quicksand-bold text-xl'>Resume</Text>
                  <View className='flex-row gap-2 my-2'>
                    {selectedResume && <DocumentItem document={getUserDocumentById(Number(selectedResume), user!)!} />}
                    <View className='w-1/2'>
                      {user && user.documents && user.documents.length > 0?
                      <View className='flex-col gap-2'>
                        <DropDownPicker
                          open={openResumeDropdown}
                          value={selectedResume}
                          items={userDocuments?.RESUMES.map((doc) => ({label: doc.filename, value: String(doc.id)})) ?? []}
                          setOpen={setOpenResumeDropdown}
                          setValue={setSelectedResume}
                          onChangeValue={(value) => setSelectedResume(value)}
                          containerStyle={{width: '100%'}}
                          placeholder="Select a resume"
                        />
                        <Text className='font-quicksand-bold text-md color-blue-500'>Last Updated - {formatDate(user.documents[0].createdAt!)}</Text>
                      </View> : <Text>Upload a resume please</Text>}
                    </View>
                  </View>
                </View>
                <View className='divider'/>
                <View className='flex flex-col gap-2'>
                  <Text className='font-quicksand-bold text-xl'>Cover Letter (Optional)</Text>
                  <View className='flex-row gap-2 my-2'>
                    {
                    selectedCoverLetter && 
                    <DocumentItem 
                      document={getUserDocumentById(Number(selectedCoverLetter), user!)!}
                      customAction={() => {setSelectedCoverLetter(null); setOpenCoverLetterDropdown(false)}} 
                      actionIcon='delete'/>
                    }
                    <View className='w-1/2'>
                      {user && user.documents && user.documents.length > 0?
                      <View className='flex-col gap-2'>
                        <DropDownPicker
                          open={openCoverLetterDropdown}
                          value={selectedCoverLetter}
                          items={userDocuments?.COVER_LETTERS.map((doc) => ({label: doc.filename, value: String(doc.id)})) ?? []}
                          setOpen={setOpenCoverLetterDropdown}
                          setValue={setSelectedCoverLetter}
                          onChangeValue={(value) => setSelectedCoverLetter(value)}
                          containerStyle={{width: '100%'}}
                          placeholder="Select a cover letter"
                        />
                        <Text className='font-quicksand-bold text-md color-blue-500'>Last Updated - {formatDate(user.documents[0].createdAt!)}</Text>
                      </View> : <Text>Upload a resume please</Text>}
                    </View>
                  </View>
                </View>
                <View className='divider'/>
                <View>
                  <Text>Company specific questions: Please answer below</Text>
                </View>
                <View className='w-full flex flex-row gap-2'>
                  {/** TODO: New feature coming soon - Save for later */}
                  <CustomButton
                    customClass='apply-button w-1/2 items-center justify-center h-14 mt-4'
                    onClick={handleSubmitApplication}
                    text="Submit Application"
                    isLoading={isSubmittingApplication}
                    />
                  <CustomButton
                    customClass='cancel-button w-1/2 items-center justify-center h-14 mt-4'
                    onClick={closeSheet}
                    text="Cancel"
                    />
                </View>
            </> :
            <View>
              <Text className='font-quicksand-bold text-xl'>You need to upload a resume to apply for jobs</Text>
              <Text className='font-quicksand-medium text-md mt-2'>
                You can upload multiple resumes and cover letters in 
                your profile settings and select them when applying for jobs. You can also choose a
                primary resume to quickly apply for jobs.
              </Text>
              <CustomButton
                customClass='apply-button items-center justify-center h-14 mt-4'
                onClick={() => router.push('/profile/manageDocs')}
                text="Upload Resume"
                isLoading={isSubmittingApplication}
                />
            </View>}
          </View>
  )
}

export default ApplyBottomSheet