import BackBar from '@/components/BackBar'
import CompanyInformation from '@/components/CompanyInformation'
import { useProfileIntervies } from '@/lib/services/useProfile'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const UpcomingInterviews = () => {
  const { userId } = useLocalSearchParams()
  const { data: interviews, isLoading } = useProfileIntervies(Number(userId))

  console.log(interviews)
  return (
    <SafeAreaView>
        <BackBar label="Upcoming Interviews" />
     {isLoading ? 
     <ActivityIndicator size="large" className='mt-10' /> : 
    <FlatList
        data={interviews} // Temporary until API is ready
        renderItem={({ item }) => (
            <View key={item.id} className='w-full px-4 py-2 rounded-full'>
                <TouchableOpacity onPress={() => console.log("Interview Pressed")}>
                    <View className='flex-row items-center justify-between'>
                        <CompanyInformation company={item.companyName} />
                    </View>
                    <View>
                        <View className='flex flex-row items-center justify-between'>
                            <Text className='font-quicksand-bold text-2xl'>{item.jobTitle}</Text>
                            <Text className='font-quicksand-semibold text-sm'>{item.interview_date}</Text>
                        </View>
                        <View>
                            <Text className='font-quicksand-medium text-md'>{item.description}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row gap-2 mt-2'>
                        <Text 
                            className='font-quicksand-semibold text-sm text-green-800 bg-green-200 px-2 py-1 rounded-full'>
                            {item.start_time} - {item.end_time}
                        </Text>
                        <Text className='font-quicksand-semibold text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-full'>
                            {item.timezone}
                        </Text>
                        <Text className='font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full'>
                            {item.interviewType}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )}
        ItemSeparatorComponent={() => <View className='divider' />}
      />}
    </SafeAreaView>
  )
}

export default UpcomingInterviews