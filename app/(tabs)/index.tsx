import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import CustomSlider from '@/components/CustomSlider';
import JobListing from '@/components/JobListing';
import LocationSearch from '@/components/LocationSearch';
import SearchBar from '@/components/SearchBar';
import { Job } from '@/type';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const Index = () => {
  const jobs:Job[] = [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      salary: 120000,
      postedDate: "2023-10-01",
      tags: ["Full-Time", "Remote", "Benefits", "Health Insurance", "401k", "Flexible Hours", "Career Growth"]
    }
  ];
  const [isOpen, setIsOpen] = useState(false)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

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
  return (
    <SafeAreaView className='flex-1 bg-white'>
            <View className='w-full flex-row items-center justify-center px-8 gap-4'>
              <SearchBar placeholder="Search for Jobs..." onChange={(text) => console.log(text)} />
                <TouchableOpacity onPress={openFilters}>
                  <Ionicons name="filter-circle-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>
      <FlatList
        className='w-full p-2'
        data={Array(14).fill(jobs[0])} // Simulating multiple job listings
        renderItem={({item, index}) => <JobListing key={index} {...item} />}
        ItemSeparatorComponent={() => <View className='divider'/>}
      />
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
          <LocationSearch />
          <CustomInput placeholder="Company" label="Company" value="" onChangeText={() => {}}/>
          <CustomSlider label="Distance" minValue={0} maxValue={300}/>
          <CustomSlider label="Salary" minValue={20000} maxValue={300000}/>
          <CustomSlider label="Experience" minValue={0} maxValue={20}/>
          <View className='flex-row items-center justify-between gap-2'>
            <CustomButton customClass="filter-button" text="Apply" onClick={() => {}} />
            <CustomButton customClass="filter-button" text="Reset" onClick={() => {}} />
          </View>
        </Animated.View>
        </>
      )}
    </SafeAreaView>
  )
}

export default Index