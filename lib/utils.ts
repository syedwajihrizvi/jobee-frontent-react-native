import { Application, User, UserDocument } from "@/type";
import * as Haptics from 'expo-haptics';

export const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
    return formatter.format(parsedDate)
  }

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export const  convertTo12Hour =(time24: string): string => {
  // Expecting input like "23:15" or "08:05"
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 → 12 for midnight

  return `${hour}:${minute} ${ampm}`;
}
export const isApplied = (user: User, jobId: string) => user?.applications.find(app => app.jobId === Number(jobId))

export const getUserDocumentById = (id: number, user: User): UserDocument | undefined => {
    return user?.documents.find(doc => doc.id === id);
}

export const extractMeridiem = (time: string) => {
  const formattedTime = time.replace(" ", "").toLowerCase()
  return formattedTime.includes('am') ? 'AM' : 'PM';
}

export const extract24HourTime = (time: string) => {
  const meridiem = extractMeridiem(time)
  const formattedTime = time.replace(" ", "").toLowerCase().replace(meridiem.toLowerCase(), "")
  let [hours, minutes] = formattedTime.split(':').map(Number);
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export const getEducationLevel = (level: string) => {
  switch(level) {
    case 'High School':
      return 'HIGH_SCHOOL';
    case 'Diploma':
      return "DIPLOMA";
    case 'Associates':
      return "ASSOCIATES";
    case 'Undergraduate':
      return "UNDERGRADUATE";
    case 'Postgraduate':
      return "POSTGRADUATE";
    case 'PHD':
      return "PHD";
    case 'Post Docotorate':
      return "POST_DOCTORATE";
  };
}

export const getApplicationStatus = (status: string) => {
  switch(status) {
    case 'PENDING':
      return "Pending";
    case 'INTERVIEW_SCHEDULED':
      return "Interview Scheduled";
    case 'OFFER_MADE':
      return "Offer Made";
    case 'OFFER_ACCEPTED':
      return "Offer Accepted";
    case 'OFFER_REJECTED':
      return "Offer Rejected";
    case 'OFFER_WITHDRAWN':
      return "Offer Withdrawn";
    case 'WITHDRAWN_BY_USER':
      return "Withdrawn by User";
    case 'REJECTED':
      return "Rejected";
    case 'CANCELED':
      return "Canceled";
  }
}

export const getInterviewStyle = (status: string) => {
  switch(status) {
    case 'ONLINE':
      return "Online";
    case 'IN_PERSON':
      return "In Person";
    case 'PHONE':
      return "Phone";
  }
}

export const getEmploymentType = (type?: string) => {
  switch(type) {
    case 'FULL_TIME':
      return "Full-Time";
    case 'PART_TIME':
      return "Part-Time";
    case 'CONTRACT':
      return "Contract";
    case 'INTERN':
      return "Intern";
    case 'FREELANCE':
      return "Freelance";
  }
}

export const getWorkArrangement = (arrangement?: string) => {
  switch(arrangement) {
    case 'ON_SITE':
      return "On-Site";
    case 'REMOTE':
      return "Remote";
    case 'HYBRID':
      return "Hybrid";
  }
}

export const convert10DigitNumberToPhoneFormat = (num: string) => {
  if (num.length !== 10) return num;
  const areaCode = num.slice(0, 3);
  const centralOfficeCode = num.slice(3, 6);
  const lineNumber = num.slice(6);
  return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
}

export const onActionSuccess = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

}

export const hasUserAppliedToJob = (user: User | null, jobId: number) : Application | undefined => {
    let application = (user as User)?.applications.find(
      (app) => app.jobId === jobId
    );
    return application;  
}

export const renderInterviewType = (type: string | undefined) => {
  switch(type) {
    case 'ONLINE':
      return (
        `This interview will be conducted online. Please ensure you have a stable 
        internet connection and a quiet environment for the interview.
        Make sure there is good lighting and we recommend you use headphones 
        and dress professionally even if it is a virtual interview.`);
    case 'IN_PERSON':
      return ("This interview will take place at the company's office location. Please arrive 10-15 minutes early and bring any necessary documents or identification.");
    case 'PHONE':
      return ("This interview will be conducted over the phone. Please ensure you are in a quiet location with good reception at the scheduled time.");
    default:
      return ("Interview type not specified. Please check with the recruiter for more details.");
  }
}

export const renderQuestionSteps = [
  "Select the volume icon to hear the question.",
  "Press the microphone icon to start recording your response.",
  "Press the microphone icon again to stop recording.",
  "Select the play icon to review your answer.",
  "If you are satisfied with your response, select the checkmark icon to submit. Otherwise, you can re-record your answer by pressing the microphone icon again.",
  "Once the answer is submitted, I will give you feedback and you can re-record if you'd like to improve it.",
]