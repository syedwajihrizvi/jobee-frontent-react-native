import BusinessJobListings from '@/components/BusinessJobListings'
import { images } from '@/constants'
import { useJobsByCompany } from '@/lib/services/useJobs'
import useAuthStore from '@/store/auth.store'
import { BusinessUser } from '@/type'
import React from 'react'
import { FlatList, Image, SafeAreaView, Text, View } from 'react-native'

const Jobs = () => {
  const { user: businessUser } = useAuthStore()
  const user = businessUser as BusinessUser | null
  const { data: jobs, isLoading } = useJobsByCompany(user?.companyId)
  return (
    <SafeAreaView>
      <View className='flex-row items-center px-4 py-2'>
        <Image source={{ uri: images.companyLogo }} className='size-8' resizeMode='contain'/>
        <Text className='text-2xl font-bold p-4'>{user?.companyName} Job Listings</Text>
      </View>
      {
      isLoading ? 
      <Text>Loading</Text>
      : 
      <FlatList
        data={jobs}
        renderItem={({ item }) => (
          <BusinessJobListings job={item} />
        )}
        ItemSeparatorComponent={() => <View className='divider'/>}
        contentContainerClassName='pb-20'
      />}
    </SafeAreaView>
  )
}

export default Jobs