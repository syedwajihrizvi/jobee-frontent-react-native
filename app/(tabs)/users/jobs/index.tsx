import CompleteProfileReminder from '@/components/CompleteProfileReminder';
import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomSlider from '@/components/CustomSlider';
import JobListing from '@/components/JobListing';
import LocationSearch from '@/components/LocationSearch';
import SearchBar from '@/components/SearchBar';
import { useJobs } from '@/lib/services/useJobs';
import useAuthStore from '@/store/auth.store';
import { JobFilters, User } from '@/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const Index = () => {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    company: '',
    distance: undefined,
    salary: undefined,
    experience: undefined
  });
  const { data: jobs, isLoading } = useJobs(filters)
  const [isOpen, setIsOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<JobFilters>({...filters});
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [showProfileCompleteReminder, setShowProfileCompleteReminder] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    const checkProfileCompletion = async () => {
      const profileReminderShown = await AsyncStorage.getItem('profileReminderShown');
      setShowProfileCompleteReminder(profileReminderShown === 'false');
    };
    checkProfileCompletion();
  }, [user]);


  const handleApplyFilters = () => {
    setFilters({...tempFilters});
    closeFilters()
  }

  const handleResetFilters = () => {
    setTempFilters({
      search: '',
      location: '',
      company: '',
      distance: undefined,
      salary: undefined,
      experience: undefined
    });
    setFilters({
      search: '',
      location: '',
      company: '',
      distance: undefined,
      salary: undefined,
      experience: undefined
    });
    closeFilters();
  }

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
  }

  const handleProfileComplete = () => {
    setShowProfileCompleteReminder(false);
    AsyncStorage.setItem('profileReminderShown', 'true');
    router.push('/(tabs)/users/profile');
  }
    
  const handleProfileLater = () => {
    setShowProfileCompleteReminder(false);
    AsyncStorage.setItem('profileReminderShown', 'true');
  }

  const hasUserAppliedToJob = (jobId: number) => {
    let application = (user as User)?.applications.find(app => app.jobId === jobId)
    return application;
  }

  return (
    <SafeAreaView className='relative flex-1 bg-white'>
        <View className='w-full flex-row items-center justify-center px-8 gap-4'>
          <SearchBar 
            placeholder="Search for Jobs..." 
            onSubmit={handleSearchSubmit}/>
            <TouchableOpacity onPress={openFilters}>
              <Ionicons name="filter-circle-outline" size={30} color="black" />
            </TouchableOpacity>
        </View>
      {
        !isAuthLoading && 
        showProfileCompleteReminder && 
        <CompleteProfileReminder onComplete={handleProfileComplete} onLater={handleProfileLater}/>
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
                    status={userApplication && userApplication.status} />
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
            zIndex: 10,
          }}>
          <LocationSearch 
            value={tempFilters.location ? tempFilters.location : ''} 
            onChange={(text) => setTempFilters({...tempFilters, location: text})}/>
          <CustomInput 
            placeholder="Company" label="Company" 
            value={tempFilters.company ? tempFilters.company : ''} 
            onChangeText={(text) => setTempFilters({...tempFilters, company: text})}/>
          <CustomSlider label="Distance" minValue={0} maxValue={300} value={tempFilters.distance} onValueChange={(value) => setTempFilters({...tempFilters, distance: value})}/>
          <CustomSlider label="Salary" minValue={20000} maxValue={300000} value={tempFilters.salary} onValueChange={(value) => setTempFilters({...tempFilters, salary: value})}/>
          <CustomSlider label="Experience" minValue={0} maxValue={20} value={tempFilters.experience} onValueChange={(value) => setTempFilters({...tempFilters, experience: value})}/>
          <View className='flex-row items-center justify-between gap-2'>
            <CustomButton customClass="filter-button" text="Apply" onClick={handleApplyFilters} />
            <CustomButton customClass="filter-button" text="Reset" onClick={handleResetFilters} />
          </View>
        </Animated.View>
        </>
      )}
    </SafeAreaView>
  )
}

export default Index