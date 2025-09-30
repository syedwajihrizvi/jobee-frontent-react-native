import { convertTo12Hour } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Calendar = ({
  interviewDetails,
}: {
  interviewDetails: InterviewDetails | undefined;
}) => {
  return (
    <View key={3} className="w-full h-full items-center justify-start gap-10">
      <Feather name="calendar" size={48} color="#22c55e" />
      <Text className="font-quicksand-bold text-2xl text-center">
        Your interview is scheduled for {interviewDetails?.interviewDate} at{" "}
        {convertTo12Hour(interviewDetails?.startTime!)}{" "}
        {interviewDetails?.timezone}
      </Text>
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Make sure to be ready 15 minutes before. Let&apos;s add this to your
        calendar and also set a reminder for Jobee to remind you 1 day before
        and 1 hour before the interview.
      </Text>
      <TouchableOpacity
        className="apply-button w-2/3 items-center flex-row gap-2 justify-center h-14"
        onPress={() => console.log("Add to calendar and set notificaton")}
      >
        <Text className="font-quicksand-semibold text-lg text-center">
          Help me Remember
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Calendar;
