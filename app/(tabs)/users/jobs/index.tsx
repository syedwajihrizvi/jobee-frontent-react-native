import CompleteProfileReminder from '@/components/CompleteProfileReminder';
import JobListing from '@/components/JobListing';
import QuickApplyModal from '@/components/QuickApplyModal';
import SearchBar from '@/components/SearchBar';
import { quickApplyToJob } from '@/lib/jobEndpoints';
import { useJobs, useUserAppliedJobs } from '@/lib/services/useJobs';
import useAuthStore from '@/store/auth.store';
import { JobFilters, User } from '@/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const Index = () => {
  const defaultFilters: JobFilters = {
    search: '',
    locations: [],
    companies: [],
    tags: [],
    distance: '',
    minSalary: undefined,
    maxSalary: undefined,
    experience: ''
  }
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<JobFilters>({...defaultFilters});
  const [tempFilters, setTempFilters] = useState<JobFilters>({...defaultFilters});
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [quickApplyJob, setQuickApplyJob] = useState<number | null>(null);
  const [quickApplyLabel, setQuickApplyLabel] = useState('');
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const { data: jobs, isLoading } = useJobs(filters)
  const { data: appliedJobs, isLoading: isAppliedJobsLoading } = useUserAppliedJobs();
  const [isOpen, setIsOpen] = useState(false)
  const { user: authUser, isLoading: isAuthLoading, userType } = useAuthStore();
  const user = authUser as (User | null)
  const [showProfileCompleteReminder, setShowProfileCompleteReminder] = useState(!user?.profileComplete);
  const [localApplyJobs, setLocalApplyJobs] = useState<number[]>(appliedJobs || []);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const locationInputRef = useRef<TextInput>(null);

  const openFilters = () => {
    setIsOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
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

  const handleSearchSubmit = (text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
    closeFilters()
  }

  const handleProfileComplete = () => {
    setShowProfileCompleteReminder(false);
    router.push('/profile/completeProfile/uploadProfilePic');
  }
    
  const handleProfileLater = () => {
    setShowProfileCompleteReminder(false);
  }

  const hasUserAppliedToJob = (jobId: number) => {
    let application = (user as User)?.applications.find(app => app.jobId === jobId)
    return application;
  }

  const addLocation = (location: string) => {
    if (location && !tempFilters.locations.includes(location)) {
      setTempFilterCount(prev => prev + 1)
      setTempFilters({...tempFilters, locations: [...tempFilters.locations, location]})
    }
    locationInputRef.current?.clear();
  }

  const handleFilterApply = () => {
    setFilters(tempFilters);
    setFilterCount(tempFilterCount);
    closeFilters()
  }

  const handleClearFilters = () => {
    setTempFilterCount(0)
    setFilterCount(0)
    setTempFilters({...defaultFilters})
    setFilters({...defaultFilters})
    closeFilters()
  }

  const addCompany = (company: string) => {
    if (company && !tempFilters.companies?.includes(company)) {
      setTempFilterCount(prev => prev + 1)
      setTempFilters({...tempFilters, companies: [...tempFilters.companies || [], company]})
    }
    locationInputRef.current?.clear();
  }

  const addTag = (tag: string) => {
    if (tag && !tempFilters.tags.includes(tag)) {
      setTempFilterCount(prev => prev + 1)
      setTempFilters({...tempFilters, tags: [...tempFilters.tags, tag]})
    }
    locationInputRef.current?.clear();
  }

  const handleMinSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert('Invalid Input', 'Please enter a valid number for salary.');
      return;
    }
    setTempFilterCount(prev => prev + 1)
    setTempFilters({...tempFilters, minSalary: salary });
  }

    const handleMaxSalary = (text: string) => {
    const salary = Number(text);
    if (isNaN(salary)) {
      Alert.alert('Invalid Input', 'Please enter a valid number for salary.');
      return;
    }
    if (tempFilters.minSalary && salary < tempFilters.minSalary) {
      Alert.alert('Invalid Input', 'Max salary cannot be less than min salary.');
      return;
    }
    setTempFilterCount(prev => prev + 1)
    setTempFilters({...tempFilters, maxSalary: salary });
  }

  if (userType === "business") {
    return <Redirect href="/(tabs)/business/jobs" />
  }

  const handleQuickApply = (jobId: number, jobTitle: string, companyName: string) => {
    setQuickApplyJob(jobId);
    setQuickApplyLabel(`Quick Apply for ${jobTitle} at ${companyName}`);
    setShowQuickApplyModal(true);
  }

  const handleQuickApplyClose = async (apply: boolean, routeToSignUp: boolean) => {
    if (apply && quickApplyJob) {
      const res = await quickApplyToJob(quickApplyJob)
      if (res != null) {
        queryClient.invalidateQueries({ queryKey: ['job', quickApplyJob, 'application'] });
        queryClient.invalidateQueries({ queryKey: ['jobs', 'applications'] });
        setLocalApplyJobs(prev => [...prev, quickApplyJob]);
      }
    }
    setQuickApplyJob(null);
    setShowQuickApplyModal(false);
  }

  const canQuickApply = (jobId: number) => {
    return !isAppliedJobsLoading && (!appliedJobs?.includes(jobId) && !localApplyJobs.includes(jobId)) && !hasUserAppliedToJob(jobId);
  }

  return (
    <SafeAreaView className='relative flex-1 bg-white'>
        <View className='w-full flex-row items-center justify-center px-8 gap-4'>
          <SearchBar 
            placeholder="Search for Jobs..." 
            onSubmit={handleSearchSubmit}/>
            <TouchableOpacity onPress={openFilters} className='relative'>
              <Ionicons name="filter-circle-outline" size={30} color="black" />
              <View className='absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center'>
                <Text className='text-white font-quicksand-bold'>{filterCount}</Text>
              </View>
            </TouchableOpacity>
        </View>
      {
        !isAuthLoading && 
        showProfileCompleteReminder && 
        <CompleteProfileReminder 
          onComplete={handleProfileComplete} 
          onLater={handleProfileLater}/>
      }
      {isLoading ? 
      <ActivityIndicator size="large" color="#0000ff" className='flex-1 justify-center items-center'/> :
      <FlatList
        className='w-full p-2'
        data={jobs} // Simulating multiple job listings
        renderItem={({item, index}) => {
          let userApplication = hasUserAppliedToJob(item.id);
          let showFavorite = userApplication ? false : true
          return <JobListing 
                    key={index} job={item} 
                    showFavorite={showFavorite} showStatus={!showFavorite} 
                    status={userApplication && userApplication.status}
                    canQuickApply={canQuickApply(item.id)}
                    handleQuickApply={() => handleQuickApply(item.id, item.title, item.businessName)}
                    />
        }}
        ItemSeparatorComponent={() => <View className='divider'/>}
      />}
      {isOpen && (
        <>
        <TouchableWithoutFeedback onPress={closeFilters}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
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
            <Text className="font-quicksand-bold text-2xl text-gray-900 text-center my-4">Filter Jobs</Text>
              <View>
                <Text className='font-quicksand-medium text-lg text-gray-900'>Location</Text>
                <TextInput
                  ref={locationInputRef}
                  className='border border-black rounded-lg p-3 mt-2'
                  placeholder='e.g. New York, San Francisco'
                  returnKeyType='done'
                  onSubmitEditing={(event) => addLocation(event.nativeEvent.text.trim())}
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
                <Text className='font-quicksand-medium text-lg text-gray-900'>Companies</Text>
                <TextInput
                  ref={locationInputRef}
                  className='border border-black rounded-lg p-3 mt-2'
                  placeholder='e.g. Google, Microsoft'
                  returnKeyType='done'
                  onSubmitEditing={(event) => addCompany(event.nativeEvent.text.trim())}
                />
                <View className='flex-row flex-wrap gap-2 mt-3'>
                  {tempFilters.companies?.map((company, index) => (
                    <TouchableOpacity key={index}>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-800 font-quicksand-medium">{company}</Text>
                        </View>
                    </TouchableOpacity>   
                  ))}
                </View>
              </View>
              <View className='divider'/>
              <View>
                <Text className='font-quicksand-medium text-lg text-gray-900'>Skills</Text>
                <TextInput
                  ref={locationInputRef}
                  className='border border-black rounded-lg p-3 mt-2'
                  placeholder='e.g. JavaScript, Python'
                  returnKeyType='done'
                  onSubmitEditing={(event) => addTag(event.nativeEvent.text.trim())}
                />
                <View className='flex-row flex-wrap gap-2 mt-3'>
                  {tempFilters.tags.map((tag, index) => (
                    <TouchableOpacity key={index}>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-800 font-quicksand-medium">{tag}</Text>
                        </View>
                    </TouchableOpacity>   
                  ))}
                </View>
              </View>
              <View className='divider'/>
              <View className='flex flex-row justify-between items-center gap-2'>
                <View className='w-1/2'>
                  <Text>Min Salary</Text>
                  <TextInput
                    ref={locationInputRef}
                    className='border border-black rounded-lg p-3 mt-2'
                    returnKeyType='done'
                    placeholder='e.g. 50000'
                    onSubmitEditing={(event) => handleMinSalary(event.nativeEvent.text)}
                  />
                </View>
                <View className='w-1/2'>
                  <Text>Max Salary</Text>
                  <TextInput
                    ref={locationInputRef}
                    className='border border-black rounded-lg p-3 mt-2'
                    placeholder='e.g. 150000'
                    returnKeyType='done'
                    onSubmitEditing={(event) => handleMaxSalary(event.nativeEvent.text)}
                  />
                </View>
              </View>
                <View className='flex-row justify-center items-center gap-2'>
                  <TouchableOpacity 
                    className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'
                    onPress={handleFilterApply}>
                    <Text className='font-quicksand-semibold text-md text-white'>
                        Apply
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className='mt-6 apply-button px-6 py-3 w-1/2 rounded-full flex items-center justify-center'
                    onPress={handleClearFilters}>
                    <Text className='font-quicksand-semibold text-md text-white'>
                        Clear
                    </Text>
                  </TouchableOpacity>
                </View>
              
          </View>
        </Animated.View>
        </>
      )}
      <QuickApplyModal 
        visible={showQuickApplyModal} 
        label={quickApplyLabel}
        handleClose={handleQuickApplyClose}
        canQuickApply={!!user?.primaryResume}/>
    </SafeAreaView>
  )
}

export default Index