import BackBar from '@/components/BackBar'
import { images } from '@/constants'
import { useApplicantsForJob, useShortListedCandidatesForJob } from '@/lib/services/useJobs'
import { getApplicationStatus } from '@/lib/utils'
import { ApplicationSummary } from '@/type'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { TextInput } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

const screenWidth = Dimensions.get('window').width;

const Applications = () => {
  const { id, shortListed } = useLocalSearchParams()
  const [tempFilterCount, setTempFilterCount] = useState(0)
  const [filterCount, setFilterCount] = useState(0)
  const [filters, setFilters] = useState<{locations: string[], skills: string[], education: string}>({locations: [], skills: [], education: 'Any'})
  const { data: applicants, isLoading } = useApplicantsForJob(Number(id), filters)
  const { data: shortListedApplicants } = useShortListedCandidatesForJob(Number(id))
  const applicantList = shortListed ? applicants?.filter(app => shortListedApplicants?.includes(app.id)) : applicants
  const [isOpen, setIsOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<{locations: string[], skills: string[], education: string}>({locations: [], skills: [], education: 'Any'})
  const skillInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [open, setOpen] = useState(false);

  const openFilters = () => {
    setIsOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  const closeFilters = () => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setIsOpen(false);
    });
  }

  const applyFilters = () => {
    setFilters({...tempFilters})
    setFilterCount(tempFilterCount)
  }

  const clearFilters = () => {
    setTempFilters({locations: [], skills: [], education: 'Any'})
    setFilters({locations: [], skills: [], education: 'Any'})
    setTempFilterCount(0)
  }

  const addSkill = (skill: string) => {
    if (skill && !tempFilters.skills.includes(skill)) {
      setTempFilterCount(prev => prev + 1)
      setTempFilters({...tempFilters, skills: [...tempFilters.skills, skill]});
    }
    skillInputRef.current?.clear();
  }

  const addLocation = (location: string) => {
    if (location && !tempFilters.locations.includes(location)) {
      setTempFilterCount(prev => prev + 1)
      setTempFilters({...tempFilters, locations: [...tempFilters.locations, location]});
    }
    locationInputRef.current?.clear();
  }

  if (shortListed && applicantList?.length === 0) {
    return (
      <SafeAreaView className='flex-1 bg-white relative'>
        <BackBar label="Shortlisted Applications"/>
        <View className='p-4 flex-1 justify-center items-center'>
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text className='font-quicksand-bold text-xl text-gray-600 mt-4'>
            No Shortlisted Applications
          </Text>
          <Text className='font-quicksand-regular text-gray-500 text-center mt-2'>
            Shortlisted applications will appear here when you shortlist candidates for this job.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const isShortListed = (applicantId: number) => {
    return shortListedApplicants?.includes(applicantId);
  }

  const renderApplicantCard = ({ item }: {item : ApplicationSummary}) => (
    <TouchableOpacity 
      className='bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm'
      activeOpacity={0.7}
      onPress={() => router.push(`/businessJobs/applications/applicant/${item.id}`)}
    >
      <View className='relative flex-row items-start justify-between mb-3'>
          {isShortListed(item.id) ? (
            <View className='absolute top-0 right-0 bg-yellow-100 px-2 py-1 rounded-full'>
              <Text className='font-quicksand-bold text-sm'>Shortlisted</Text>
            </View>
          ) : (
              <View className='absolute top-0 right-0 bg-green-100 px-2 py-1 rounded-full'>
                <Text className='font-quicksand-bold text-sm color-green-800'>{getApplicationStatus(item.status)}</Text>
              </View>
            )}
          <View className='flex-row items-center gap-3'>
            <Image 
              source={{ uri: images.companyLogo }} 
              className='w-12 h-12 rounded-full border border-gray-200' 
              resizeMode='cover'
            />
            <View className='flex-1'>
              <Text className='font-quicksand-bold text-lg text-gray-900 w-2/3'>
                {item.fullName}
              </Text>
              <Text className='font-quicksand-medium text-sm text-gray-600'>
                {item.title}  | {item.location}
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
    <SafeAreaView className='flex-1 relative'>
      <BackBar label="Applications"/>
      <View className='p-4 flex-1'>
        <View className='flex-row items-center justify-between mb-2'>
            <Text className='font-quicksand-bold text-lg text-gray-900'>
                {applicantList?.length} {applicantList?.length === 1 ? 'Application' : 'Applications'}
            </Text>
            <TouchableOpacity 
                className='px-3 py-1 border border-blue-600 rounded-full'
                onPress={openFilters}>
                <Text 
                    className='font-quicksand-medium text-blue-600'>
                    {filterCount > 0 ? (filterCount > 1 ?`${filterCount} Filters` : `${filterCount} Filter`) : 'Filters'}
                </Text>
            </TouchableOpacity>
        </View>
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
                <FlatList
                data={applicantList}
                renderItem={renderApplicantCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                />
            </>
        )}
      </View>
      {!isOpen && <View className='w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center'>
        <TouchableOpacity className='flex flex-row  gap-4 apply-button w-4/6 items-center justify-center h-14'>
            <Text className='font-quicksand-semibold text-md'>
                Find Applicants
            </Text>
            <Ionicons name="sparkles" size={20} color="gold" />
        </TouchableOpacity>
      </View>}
      {isOpen && (
        <>
          <TouchableWithoutFeedback onPress={closeFilters}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9,  
              }}/>
          </TouchableWithoutFeedback>
          <Animated.View
            className='animated-view'
            style={{
              transform: [{translateX: slideAnim}],
              zIndex: 100,
            }}>
            <View>
              <Text className='font-quicksand-bold text-2xl text-gray-900 text-center my-4'>Filter Applicants</Text>
              <View>
                <Text className='font-quicksand-medium text-lg text-gray-900'>Location</Text>
                <TextInput
                  ref={locationInputRef}
                  className='border border-black rounded-lg p-3 mt-2'
                  placeholder='e.g. New York, San Francisco'
                  returnKeyType='done'
                  onSubmitEditing={(event) => addLocation(event.nativeEvent.text)}
                />
                <View className='flex-row flex-wrap gap-2 mt-3'>
                  {tempFilters.locations.map((location, index) => (
                    <TouchableOpacity key={index}>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-800 font-quicksand-medium">{location}</Text>
                        </View>
                    </TouchableOpacity>   
                  ))}
                </View>
              </View>
              <View className='divider'/>
              <View>
                <Text className='font-quicksand-medium text-lg text-gray-900'>Desired Skills</Text>
                <TextInput
                  ref={skillInputRef}
                  className='border border-black rounded-lg p-3 mt-2'
                  placeholder='e.g. Python, React, SQL'
                  returnKeyType='done'
                  onSubmitEditing={(event) => {addSkill(event.nativeEvent.text)}}
                />
                <View className='flex-row flex-wrap gap-2 mt-3'>
                  {tempFilters.skills.map((skill, index) => (
                    <TouchableOpacity key={index}>
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-800 font-quicksand-medium">{skill}</Text>
                        </View>
                    </TouchableOpacity>
                    
                  ))}
                </View>
              </View>
              <View className='divider'/>
              <View>
                <Text className='font-quicksand-medium text-lg text-gray-900'>Desired Education</Text>
              <DropDownPicker
                  open={open}
                  value={tempFilters.education}
                  items={[
                      {label: 'Any', value: 'Any'},
                      {label: 'High School', value: 'High School'},
                      {label: 'Diploma', value: 'Diploma'},
                      {label: 'Associates', value: 'Associates'},
                      {label: 'Undergraduate', value: 'Undergraduate'},
                      {label: 'Postgraduate', value: 'Postgraduate'},
                      {label: 'PHD', value: 'PHD'},
                      {label: 'Post Doctorate', value: 'Post Doctorate'},
                  ]}
                  setOpen={setOpen}
                  setValue={(callback) => {
                    const value = typeof callback === 'function' ? callback(tempFilters.education) : callback;
                    if (value !== 'Any')
                      setTempFilterCount(prev => prev + 1)
                    else
                      setTempFilterCount(prev => prev - 1)
                    setTempFilters({...tempFilters, education: value});
                  }}
                  setItems={() => {}}
                  containerStyle={{width: '100%'}}
                  placeholder="Any"
              />
              </View>
              <View className='flex-row justify-center items-center gap-2'>
                <TouchableOpacity 
                  className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'
                  onPress={() => {applyFilters(); closeFilters()}}>
                  <Text className='font-quicksand-semibold text-md text-white'>
                      Apply
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'
                  onPress={clearFilters}>
                  <Text className='font-quicksand-semibold text-md text-white'>
                      Clear
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </> 
      )}
    </SafeAreaView>
  )
}

export default Applications