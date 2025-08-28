import BackBar from '@/components/BackBar'
import { images } from '@/constants'
import { useApplicantsForJob } from '@/lib/services/useJobs'
import { ApplicationSummary } from '@/type'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Applications = () => {
  const { id } = useLocalSearchParams()
  const { data: applicants, isLoading } = useApplicantsForJob(Number(id))

  const renderApplicantCard = ({ item }: {item : ApplicationSummary}) => (
    <TouchableOpacity 
      className='bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm'
      activeOpacity={0.7}
      onPress={() => router.push(`/businessJobs/applications/applicant/${item.id}`)}
    >
      <View className='flex-row items-center justify-between mb-3'>
        <View className='flex-row items-center gap-3'>
          <Image 
            source={{ uri: images.companyLogo }} 
            className='w-12 h-12 rounded-full border border-gray-200' 
            resizeMode='cover'
          />
          <View className='flex-1'>
            <Text className='font-quicksand-bold text-lg text-gray-900'>
              {item.fullName}
            </Text>
            <Text className='font-quicksand-medium text-sm text-gray-600'>
              {item.title}
            </Text>
          </View>
        </View>
      </View>
      <View className='flex-row'>
        <View className='flex-row items-center gap-2 flex-1'>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text className='font-quicksand-medium text-sm text-gray-700 flex-1' numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View className='flex-row items-center gap-2'>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text className='font-quicksand-medium text-sm text-gray-700'>
            {item.phoneNumber}
          </Text>
        </View>
      </View>
      <View>
        <Text className='font-quicksand-regular text-sm text-gray-800 leading-5' numberOfLines={3}>
          {item.profileSummary || "No summary provided by the applicant."}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className='flex-1 bg-white relative'>
      <BackBar label="Applications"/>
      <View className='p-4 flex-1'>
        {isLoading ? (
          <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className='font-quicksand-medium text-gray-600 mt-2'>
              Loading applications...
            </Text>
          </View>
        ) : applicants?.length === 0 ? (
          <View className='flex-1 justify-center items-center'>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text className='font-quicksand-bold text-xl text-gray-600 mt-4'>
              No Applications Yet
            </Text>
            <Text className='font-quicksand-regular text-gray-500 text-center mt-2'>
              Applications will appear here when candidates apply for this job.
            </Text>
          </View>
        ) : (
            <>
                <View className='flex-row items-center justify-between mb-2'>
                    <Text className='font-quicksand-bold text-lg text-gray-900'>
                        {applicants?.length} {applicants?.length === 1 ? 'Application' : 'Applications'}
                    </Text>
                    <TouchableOpacity 
                        className='px-3 py-1 border border-blue-600 rounded-full'
                        onPress={() => console.log('Open filter modal')}>
                        <Text 
                            className='font-quicksand-medium text-blue-600'>
                            Filters
                        </Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                data={applicants}
                renderItem={renderApplicantCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                />
            </>
        )}
      </View>
      <View className='w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center'>
        <TouchableOpacity className='flex flex-row  gap-4 apply-button w-4/6 items-center justify-center h-14'>
            <Text className='font-quicksand-semibold text-md'>
                Find Applicants
            </Text>
            <Ionicons name="sparkles" size={20} color="gold" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Applications