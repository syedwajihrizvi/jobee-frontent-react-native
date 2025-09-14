import { User, UserDocument } from "@/type";

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

export const convert10DigitNumberToPhoneFormat = (num: string) => {
  if (num.length !== 10) return num;
  const areaCode = num.slice(0, 3);
  const centralOfficeCode = num.slice(3, 6);
  const lineNumber = num.slice(6);
  return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
}
