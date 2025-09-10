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
  setSelectedResume: React.Dispatch<React.SetStateAction<string | null>>,
  openResumeDropdown: boolean,
  setOpenResumeDropdown: React.Dispatch<React.SetStateAction<boolean>>,
  selectedCoverLetter: string | null,
  setSelectedCoverLetter: React.Dispatch<React.SetStateAction<string | null>>,
  openCoverLetterDropdown: boolean,
  setOpenCoverLetterDropdown: React.Dispatch<React.SetStateAction<boolean>>,
  userDocuments: { RESUMES: UserDocument[]; COVER_LETTERS: UserDocument[] } | null,
  isSubmittingApplication: boolean,
  handleSubmitApplication: () => void,
  closeSheet: () => void;
};

const ApplyBottomSheet = ({
  userHasResume,
  selectedResume,
  setSelectedResume,
  openResumeDropdown,
  setOpenResumeDropdown,
  selectedCoverLetter,
  setSelectedCoverLetter,
  openCoverLetterDropdown,
  setOpenCoverLetterDropdown,
  userDocuments,
  isSubmittingApplication,
  handleSubmitApplication,
  closeSheet,
}: ApplyBottomSheetProps) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;

  return (
    <View className="flex-1 bg-white rounded-t-2xl shadow-lg p-6">
      {userHasResume ? (
        <>
          {/* Header */}
          <View className="w-full flex-row items-center justify-between mb-4">
            <Text className="font-quicksand-bold text-2xl">Confirm Application</Text>
            <TouchableOpacity
              onPress={() => console.log('Show AI information')}
              className="p-2 rounded-full bg-gray-100"
            >
              <AntDesign name="info" size={18} color="black" />
            </TouchableOpacity>
          </View>

          {/* Resume Section */}
          <View className="mb-6">
            <Text className="font-quicksand-bold text-lg mb-2">Resume</Text>
            <View className="flex-row gap-3">
              {selectedResume && (
                <DocumentItem
                  document={getUserDocumentById(Number(selectedResume), user!)!}
                />
              )}
              <View className="flex-1">
                {user && user.documents && user.documents.length > 0 ? (
                  <View className="flex-col gap-2">
                    <DropDownPicker
                      open={openResumeDropdown}
                      value={selectedResume}
                      items={
                        userDocuments?.RESUMES.map((doc) => ({
                          label: doc.filename,
                          value: String(doc.id),
                        })) ?? []
                      }
                      setOpen={setOpenResumeDropdown}
                      setValue={setSelectedResume}
                      onChangeValue={(value) => setSelectedResume(value)}
                      placeholder="Select a resume"
                      style={{
                        backgroundColor: '#f9fafb', // light gray background
                        borderColor: '#e5e7eb',     // Tailwind gray-200
                        borderRadius: 10,
                        minHeight: 35,              // less tall than default
                      }}
                      textStyle={{
                        fontSize: 14,
                        fontFamily: 'Quicksand-Medium',
                        color: '#111827',           // Tailwind gray-900
                      }}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        borderRadius: 12,
                      }}
                      labelStyle={{
                        fontSize: 14,
                        fontFamily: 'Quicksand-Regular',
                        color: '#111827',
                      }}
                      listItemContainerStyle={{
                        paddingVertical: 8,
                      }}
                      containerStyle={{
                        width: '100%',
                      }}
                    />
                    <Text className="font-quicksand-medium text-sm text-gray-500">
                      Last Updated • {formatDate(user.documents[0].createdAt!)}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-500">Upload a resume to continue</Text>
                )}
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 my-4" />

          {/* Cover Letter Section */}
          <View className="mb-6">
            <Text className="font-quicksand-bold text-lg mb-2">Cover Letter (Optional)</Text>
            <View className="flex-row gap-3">
              {selectedCoverLetter && (
                <DocumentItem
                  document={getUserDocumentById(Number(selectedCoverLetter), user!)!}
                  customAction={() => {
                    setSelectedCoverLetter(null);
                    setOpenCoverLetterDropdown(false);
                  }}
                  actionIcon="delete"
                />
              )}
              <View className="flex-1">
                {user && user.documents && user.documents.length > 0 ? (
                  <View className="flex-col gap-2">
                    <DropDownPicker
                      open={openCoverLetterDropdown}
                      value={selectedCoverLetter}
                      items={
                        userDocuments?.COVER_LETTERS.map((doc) => ({
                          label: doc.filename,
                          value: String(doc.id),
                        })) ?? []
                      }
                      setOpen={setOpenCoverLetterDropdown}
                      setValue={setSelectedCoverLetter}
                      onChangeValue={(value) => setSelectedCoverLetter(value)}
                      placeholder="Select a cover letter"
                    style={{
                      backgroundColor: '#f9fafb', // light gray background
                      borderColor: '#e5e7eb',     // Tailwind gray-200
                      borderRadius: 10,
                      minHeight: 35,              // less tall than default
                    }}
                    textStyle={{
                      fontSize: 14,
                      fontFamily: 'Quicksand-Medium',
                      color: '#111827',           // Tailwind gray-900
                    }}
                    dropDownContainerStyle={{
                      backgroundColor: 'white',
                      borderColor: '#e5e7eb',
                      borderRadius: 12,
                    }}
                    labelStyle={{
                      fontSize: 14,
                      fontFamily: 'Quicksand-Regular',
                      color: '#111827',
                    }}
                    listItemContainerStyle={{
                      paddingVertical: 8,
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    />
                    <Text className="font-quicksand-medium text-sm text-gray-500">
                      Last Updated • {formatDate(user.documents[0].createdAt!)}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-500">Upload a cover letter to continue</Text>
                )}
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 my-4" />

          {/* Company Questions */}
          <View className="mb-6">
            <Text className="font-quicksand-medium text-base text-gray-700">
              Company-specific questions will appear here.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <CustomButton
              customClass="apply-button flex-1 items-center justify-center h-14"
              onClick={handleSubmitApplication}
              text="Submit Application"
              isLoading={isSubmittingApplication}
            />
            <CustomButton
              customClass="cancel-button flex-1 items-center justify-center h-14"
              onClick={closeSheet}
              text="Cancel"
            />
          </View>
        </>
      ) : (
        // No Resume Case
        <View>
          <Text className="font-quicksand-bold text-xl mb-2">
            You need to upload a resume
          </Text>
          <Text className="font-quicksand-medium text-base text-gray-600 mb-4">
            You can upload multiple resumes and cover letters in your profile
            settings and select them when applying. You can also choose a primary
            resume to apply quickly.
          </Text>
          <CustomButton
            customClass="apply-button items-center justify-center h-14"
            onClick={() => router.push('/profile/manageDocs')}
            text="Upload Resume"
            isLoading={isSubmittingApplication}
          />
        </View>
      )}
    </View>
  );
};

export default ApplyBottomSheet;
