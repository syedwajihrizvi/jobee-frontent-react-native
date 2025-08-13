import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomSlider from '@/components/CustomSlider';
import JobListing from '@/components/JobListing';
import LocationSearch from '@/components/LocationSearch';
import SearchBar from '@/components/SearchBar';
import { useJobs } from '@/lib/services/useJobs';
import { JobFilters } from '@/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
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
  const [tempFilters, setTempFilters] = useState<JobFilters>({...filters});

  const { data: jobs, isLoading } = useJobs(filters)
  const [isOpen, setIsOpen] = useState(false)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

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

  return (
    <SafeAreaView className='flex-1 bg-white'>
            <View className='w-full flex-row items-center justify-center px-8 gap-4'>
              <SearchBar 
                placeholder="Search for Jobs..." 
                onSubmit={handleSearchSubmit}/>
                <TouchableOpacity onPress={openFilters}>
                  <Ionicons name="filter-circle-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>
      {isLoading ? 
      <ActivityIndicator size="large" color="#0000ff" className='flex-1 justify-center items-center'/> :
      <FlatList
        className='w-full p-2'
        data={jobs} // Simulating multiple job listings
        renderItem={({item, index}) => <JobListing key={index} {...item} />}
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