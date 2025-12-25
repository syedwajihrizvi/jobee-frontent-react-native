import { UserDocumentType } from "@/constants";
import { Application, Experience, OneDriveFile, Project, User, UserDocument } from "@/type";
import { fromZonedTime } from "date-fns-tz";
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const formatDate = (date: string) => {
  if (!date) return "";
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

export const calculateRemainingTime = (nextApplyTime: string | undefined) => {
  if (!nextApplyTime) return { hours: 0, minutes: 0, progress: 100 };

  const nextApplyDate = new Date(nextApplyTime);
  const currentTime = new Date();
  const timeDifference = nextApplyDate.getTime() - currentTime.getTime();

  if (timeDifference <= 0) {
    return { hours: 0, minutes: 0, progress: 100 };
  }

  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  
  const totalCooldownMs = 6 * 60 * 60 * 1000;
  const progress = Math.max(0, Math.min(100, ((totalCooldownMs - timeDifference) / totalCooldownMs) * 100));

  return { hours, minutes, progress };
};

export const  convertTo12Hour =(time24: string): string => {
  // Expecting input like "23:15" or "08:05"
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 → 12 for midnight

  return `${hour}:${minute} ${ampm}`;
}
export const isApplied = (user: User, jobId: string) => user?.applications.find(app => app.job.id === Number(jobId))

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

export const getEducationLevelLabel = (level: string) => {
  switch(level) {
    case 'HIGH_SCHOOL':
      return "High School";
    case 'DIPLOMA':
      return "Diploma";
    case 'ASSOCIATES':
      return "Associate Degree";
    case 'BACHELORS':
      return "Bachelors Degree";
    case 'MASTERS':
      return "Masters Degree";
    case 'PHD':
      return "PHD";
    case 'POSTDOCTORATE':
      return "Post Doctorate";
    default:
      return "Not Specified";
  }

}
export const getExperienceLevel = (level: string) => {
  switch(level) {
    case 'Intern':
      return 'INTERN';
    case 'JUNIOR':
      return "JUNIOR";
    case 'MID':
      return "MID";
    case 'SENIOR':
      return "SENIOR";
    case 'LEAD':
      return "LEAD";
  }
}
export const getApplicationStatusLabel = (status: string) => {
  switch(status) {
    case 'PENDING':
      return "Pending";
    case 'INTERVIEW_COMPLETED':
      return "Interview Completed";
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
    default:
      return "Not Specified";
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

export const getJobLevel = (level?: string) => {
  switch(level) {
    case 'INTERN':
      return "Intern";
    case 'ENTRY':
      return "Entry-Level";
    case 'JUNIOR_LEVEL':
      return "Junior-Level";
    case 'MID_LEVEL':
      return "Mid-Level";
    case 'SENIOR_LEVEL':
      return "Senior-Level";
    case 'LEAD':
      return "Lead";
    default:
      return "Not Specified";
  }
}

export const getJobLevelColor = (
  level: string
): { color: string; iconColor: string } => {
  switch (level) {
    case "INTERN":
      return { color: "text-gray-800", iconColor: "#1f2937" };
    case "ENTRY":
      return { color: "text-blue-800", iconColor: "#1e40af" };
    case "JUNIOR_LEVEL":
      return { color: "text-green-800", iconColor: "#166534" };
    case "MID_LEVEL":
      return { color: "text-yellow-800", iconColor: "#854d0e" };
    case "SENIOR_LEVEL":
      return { color: "text-orange-800", iconColor: "#9a3412" };
    case "LEAD":
      return { color: "text-red-800", iconColor: "#991b1b" };
    default:
      return { color: "text-gray-800", iconColor: "#1f2937" };
  }
};

  export const getStatusColor = (status?: string) => {
    const normalizedStatus = (status ?? "").toLowerCase();
    if (normalizedStatus.includes("pending") || normalizedStatus.includes("review")) {
      return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
    }
    if (normalizedStatus.includes("completed")) {
      return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    }
    if (normalizedStatus.includes("scheduled")) {
      return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
    }
    if (normalizedStatus.includes("accepted") || normalizedStatus.includes("hired")) {
      return { bg: "bg-emerald-100", text: "text-green-700", border: "border-green-200" };
    }
    if (normalizedStatus.includes("rejected") || normalizedStatus.includes("declined")) {
      return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
    }
    return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
  };


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

export const convert10DigitNumberToPhoneFormat = (num: string | undefined) => {
  if (!num) return "";
  if (num.length !== 10) return num;
  const areaCode = num.slice(0, 3);
  const centralOfficeCode = num.slice(3, 6);
  const lineNumber = num.slice(6);
  return `(${areaCode})-${centralOfficeCode}-${lineNumber}`;
}

export const convert11Or10DigitNumberToPhoneFormat = (num: string | undefined) => {
  if (!num) return "";
  if (num.length === 10) {
    return convert10DigitNumberToPhoneFormat(num);
  }
  if (num.length === 11) {
    return `+${num[0]}-${convert10DigitNumberToPhoneFormat(num.slice(1))}`;
  }
}

export const onActionSuccess = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export const hasUserAppliedToJob = (applications: Application[], jobId: number) : Application | undefined => {
    let application = applications.find(
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

export const editProfileSections: { label: string; subtitle: string; route: string; icon: string }[] = [
  {
    label: "General Information",
    subtitle: "Update your personal details such as name, email, etc.",
    route: "general",
    icon: "user",
  },
  {
    label: "Profile Summary",
    subtitle: "Write a brief summary about yourself to showcase your skills and experience.",
    route: "summary",
    icon: "file-text",
  },
  {
    label: "Skills",
    subtitle: "Add or remove skills that highlight your expertise and qualifications.",
    route: "skills",
    icon: "zap",
  },
  {
    label: "Video Introduction",
    subtitle: "Record or upload a video introduction to give employers a better sense of who you are.",
    route: "video-intro",
    icon: "video",
  },
  {
    label: "Work Experience",
    subtitle: "Detail your previous job roles, responsibilities, and achievements.",
    route: "experiences",
    icon: "briefcase",
  },
  {
    label: "Education",
    subtitle: "List your educational background, degrees, and certifications.",
    route: "education",
    icon: "book-open",
  },
  {
    label: "Projects",
    subtitle: "Showcase projects you have worked on to demonstrate your skills in action.",
    route: "projects",
    icon: "folder",
  },
  {
    label: "Social Media Links",
    subtitle: "Add links to your professional social media profiles.",
    route: "socialMedia",
    icon: "share-2",
  }
];

export const businessProfileSections: { label: string; subtitle: string; route: string; icon: string }[] = [
  {
    label: "General Information",
    subtitle: "Update your personal details such as name, email, etc.",
    route: "general",
    icon: "user",
  },
  {
    label: "Social Media Links",
    subtitle: "Add links to your professional social media profiles.",
    route: "socialMedia",
    icon: "share-2",
  }
];

export const getCustomProfilePlaceholderForField = (field: string) => {
  switch(field) {
    case 'First Name':
      return "e.g. John";
    case 'Last Name':
      return "e.g. Doe";
    case 'Email':
      return "e.g. john.doe@example.com";
    case 'Phone Number':
      return "e.g. 1234567890";
    case 'Location':
      return "e.g. New York, NY";
    case 'Company':
      return "e.g. Amazon.";
    case 'Title':
      return "e.g. Software Engineer";
    default:
      return "e.g. Value";
  }
}

export const interviewStatusStyles = {
    SCHEDULED: {
      bgColor: "bg-emerald-500",
      chevronColor: "bg-emerald-100",
      chevronShadowColor: "#6366f1",
      text: "Interview Scheduled",
      chevronHexaColor: "#10b981"
    },
    COMPLETED: {
      bgColor: "bg-blue-500",
      chevronColor: "bg-blue-100",
      chevronShadowColor: "#3b82f6",
      text: "Interview Completed",
      chevronHexaColor: "#3b82f6"
    },
    CANCELLED: {
      bgColor: "bg-orange-500",
      chevronColor: "bg-orange-100",
      chevronShadowColor: "#f59e0b",
      text: "Interview Cancelled",
      chevronHexaColor: "#f59e0b"
    }
  };

export const getDecisionStyle = (decision: string) => {
    switch(decision) {
      case 'NEXT_ROUND':
        return { bgColor: "bg-emerald-100", textColor: "text-emerald-700", shadowColor: "#10b981" };
      case 'REJECTED':
        return { bgColor: "bg-red-100", textColor: "text-red-700", shadowColor: "#ef4444" };
      case 'PENDING':
        return { bgColor: "bg-yellow-100", textColor: "text-yellow-700", shadowColor: "#f59e0b" };
      case 'HIRED':
        return { bgColor: "bg-blue-100", textColor: "text-blue-700", shadowColor: "#3b82f6" };
      default:
        return { bgColor: "bg-gray-100", textColor: "text-gray-700", shadowColor: "#6b7280" };
    }
  }
export const getDecisionString = (decision: string, userType: 'user' | 'business' = 'business') => {
  switch(decision) {
    case 'NEXT_ROUND':
      return userType === 'user' ? "Passed" : "Candidate moved to next round";
    case 'REJECTED':
      return "Rejected";
    case 'PENDING':
      return "Decision is still pending";
    case 'HIRED':
      return "Candidate has received an offer";
  }

}

export const capFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const getMatchConfig = (percentage: number) => {
    if (percentage >= 90) return {
      bgColor: 'bg-emerald-500',
      borderColor: 'border-emerald-700',
      shadowColor: '#059669',
      textColor: 'text-white',
      icon: 'star',
      label: 'Excellent Match',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-emerald-600',
      progressBarColor: '#34d399', // emerald-400 for contrast
      progressBarBg: 'bg-emerald-200' // lighter background
    };
    if (percentage >= 75) return {
      bgColor: 'bg-emerald-500',
      borderColor: 'border-green-600',
      shadowColor: '#16a34a',
      textColor: 'text-white',
      icon: 'thumbs-up',
      label: 'Great Match',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-green-500',
      progressBarColor: '#4ade80', // green-400 for contrast
      progressBarBg: 'bg-emerald-200'
    };
    if (percentage >= 60) return {
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-600',
      shadowColor: '#eab308',
      textColor: 'text-white',
      icon: 'check-circle',
      label: 'Good Match',
      gradientFrom: 'from-amber-400',
      gradientTo: 'to-amber-500',
      progressBarColor: '#fbbf24', // yellow-400 for contrast
      progressBarBg: 'bg-amber-200'
    };
    if (percentage >= 40) return {
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-600',
      shadowColor: '#ea580c',
      textColor: 'text-white',
      icon: 'alert-circle',
      label: 'Fair Match',
      gradientFrom: 'from-orange-400',
      gradientTo: 'to-orange-500',
      progressBarColor: '#fb923c', // orange-400 for contrast
      progressBarBg: 'bg-orange-200'
    };
    return {
      bgColor: 'bg-red-500',
      borderColor: 'border-red-600',
      shadowColor: '#dc2626',
      textColor: 'text-white',
      icon: 'x-circle',
      label: 'Low Match',
      gradientFrom: 'from-red-400',
      gradientTo: 'to-red-500',
      progressBarColor: '#f87171', // red-400 for contrast
      progressBarBg: 'bg-red-200'
    };
  };

export const formatMessageTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 1 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } else if (diffDays < 2 && now.getDate() - date.getDate() === 1) {
    // Yesterday → show "Yesterday"
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const convertSocialMediaTypeToEnum = (type: string) => {
  switch(type) {
    case 'linkedin':
      return "LINKEDIN";
    case 'github':
      return "GITHUB";
    case 'stackOverflow':
      return "STACK_OVERFLOW";
    case 'twitter':
      return "TWITTER";
    case 'personalWebsite':
      return "PERSONAL_WEBSITE";
    default:
      return "PERSONAL_WEBSITE";
  }
}

export const convertEnumToSocialMediaType = (type: string) => {
  switch(type) {
    case 'LINKEDIN':
      return "linkedin";
    case 'GITHUB':
      return "github";
    case 'STACK_OVERFLOW':
      return "stackOverflow";
    case 'TWITTER':
      return "twitter";
    case 'PERSONAL_WEBSITE':
      return "personalWebsite";
    default:
      return "personalWebsite";
  }
}

export const converOAuthProviderToText = (provider: string) => {
  switch(provider) {
    case 'GOOGLE_DRIVE':
      return "Google Drive";
    case 'DROPBOX':
      return "Dropbox";
    case 'ONEDRIVE':
      return "OneDrive";
    default:
      return "Cloud Storage";
  }
}

export const convertMeetingProviderToText = (provider: string) => {
  switch(provider) {
    case 'GOOGLE_MEET':
      return "Google Meet";
    case 'ZOOM':
      return "Zoom";
    case 'WEBEX':
      return "Webex";
    case 'MICROSOFT_TEAMS':
      return "Microsoft Teams";
    default:
      return "Meeting Platform";
  }
}

export const isValidGoogleDriveLink = (link: string) => {
  const googleDrivePattern = /^(https?:\/\/)?(www\.)?(drive\.google\.com\/file\/d\/|docs\.google\.com\/)[\w-]+/;
  return googleDrivePattern.test(link);
}

export const isValidDropboxLink = (link: string) => {
  const dropboxPattern = /^(https?:\/\/)?(www\.)?dropbox\.com\/s\/[\w-]+/;
  return dropboxPattern.test(link);
}

export const isValidDocumentLink = (link: string) => {
  return isValidGoogleDriveLink(link) || isValidDropboxLink(link);
}

export const getMimeTypeFromFileName = (fileName: string):string => {
   const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'txt': return 'text/plain';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'odt': return 'application/vnd.oasis.opendocument.text';
    case 'ods': return 'application/vnd.oasis.opendocument.spreadsheet';
    case 'odp': return 'application/vnd.oasis.opendocument.presentation';
    case 'rtf': return 'application/rtf';
    case 'csv': return 'text/csv';
    case 'gif': return 'image/gif';
    case 'bmp': return 'image/bmp';
    case 'webp': return 'image/webp';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case 'avi': return 'video/x-msvideo';
    case 'zip': return 'application/zip';
    case 'rar': return 'application/vnd.rar';
    case '7z': return 'application/x-7z-compressed';
    case 'tar': return 'application/x-tar';
    case 'gz': return 'application/gzip';
    default: return 'application/octet-stream';
  } 
}

export const isValidFileType = (mimeType: string) => {
  const validMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.google-apps.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    "application/rtf"
  ];
  
  return validMimeTypes.includes(mimeType);
}

export const getOneDriveFileType = (item: OneDriveFile) => {
  if (item.folder) {
    return 'folder';
  } else if (item.file) {
    return 'file';
  } else if (item.specialFolder) {
    return 'specialFolder';
  }
  return 'unknown';
}

export const getFileIcon = (mimeType: string) => {
  if (mimeType === "application/pdf") {
    return { name: "file-text", color: "#ef4444", bgColor: "bg-red-100" };
  } else if (mimeType.startsWith("image/")) {
    return { name: "image", color: "#10b981", bgColor: "bg-emerald-100" };
  } else if (mimeType === "application/vnd.google-apps.document") {
    return { name: "file-text", color: "#3b82f6", bgColor: "bg-blue-100" };
  } else if (mimeType.includes("word") || mimeType.includes("document")) {
    return { name: "file-text", color: "#3b82f6", bgColor: "bg-blue-100" };
  } else if (mimeType === "folder") {
    return { name: "folder", color: "#f59e0b", bgColor: "bg-yellow-100" };
  } else if (mimeType === "specialFolder") {
    return { name: "folder", color: "#6b7280", bgColor: "bg-gray-100" };
  } else {
    return { name: "file", color: "#6b7280", bgColor: "bg-gray-100" };
  }
};

export const compressImage = async (uri: string) => {
  const compressedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // Resize to width of 1024px
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
  );
  return compressedImage.uri;
}


export const validateZoomMeetingLink = (link: string) => {
  const regex = /^https?:\/\/(www\.)?zoom\.us\/(j|my)\/[a-zA-Z0-9?=&_\-]+$/;
  return regex.test(link.trim());
};

export const validateGoogleMeetLink = (link: string) => {
  const regex = /^https?:\/\/(meet\.google\.com)\/[a-zA-Z0-9-]+$/;
  return regex.test(link.trim());
};

export const validateMicrosoftTeamsLink = (link: string) => {
  const regex = /^https?:\/\/(www\.)?teams\.microsoft\.com\/l\/meetup-join\/[a-zA-Z0-9/?=&_\-%.]+$/;
  return regex.test(link.trim());
};

export const validateSkypeLink = (link: string) => {
  const regex = /^https?:\/\/join\.skype\.com\/[a-zA-Z0-9]+$/;
  return regex.test(link.trim());
};

export const validateWebexLink = (link: string) => {
  const regex = /^https?:\/\/[a-zA-Z0-9-]+\.webex\.com\/(meet|join)\/[a-zA-Z0-9?=&_\-]+$/;
  return regex.test(link.trim());
};

export const validateCoderPadLink = (link: string) => {
  const regex = /^https?:\/\/(app\.)?coderpad\.io\/[a-zA-Z0-9]+$/;
  return regex.test(link.trim());
};

export const validateCodeSignalLink = (link: string) => {
  const regex = /^https?:\/\/(app\.)?codesignal\.com\/interview\/[a-zA-Z0-9-]+$/;
  return regex.test(link.trim());
};

export const validateMeetingLink = (link: string, platformType: string) => {
  switch(platformType) {
    case 'ZOOM':
      return validateZoomMeetingLink(link);
    case 'GOOGLE_MEET':
      return validateGoogleMeetLink(link);
    case 'MICROSOFT_TEAMS':
      return validateMicrosoftTeamsLink(link);
    case 'SKYPE':
      return validateSkypeLink(link);
    case 'WEBEX':
      return validateWebexLink(link);
    case 'CODERPAD':
      return validateCoderPadLink(link);
    case 'CODESIGNAL':
      return validateCodeSignalLink(link);
    case 'OTHER':
      return true; // No validation for other links
    default:
      return false;
  }
}

export const validatePhoneNumber = (phoneNumber: string) => {
  const cleaned = phoneNumber.replace(/[\s()-]/g, "");
  const phoneRegex = /^\+?[0-9]{7,15}$/;

  return phoneRegex.test(cleaned);
};

export const validTimeZone = (timezone: string) => {
  const lowerTimezone = timezone.toLowerCase();
  if (lowerTimezone === 'utc' || lowerTimezone === 'gmt' || lowerTimezone === 'est' || lowerTimezone === 'cst' || lowerTimezone === 'mst' || lowerTimezone === 'pst') return true;
  return false;
}

export const validateTime = (time: string) => {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time.trim());
};

// Validate that endTime is strictly after startTime
// Both inputs expected in "HH:MM AM/PM" but this function tolerates trailing commas/spaces.
export const validateTimes = (startTime: string, endTime: string) => {
  const sanitize = (t: string) =>
    (t || "")
      .toString()
      .trim()
      .replace(/[,\s]+$/g, ""); // strip trailing commas and trailing whitespace

  const s = sanitize(startTime);
  const e = sanitize(endTime);

  if (!validateTime(s) || !validateTime(e)) return false;

  const toMinutes = (t: string) => {
    const parts = t.split(/\s+/); // ["HH:MM", "AM"]
    const timePart = parts[0];
    const period = parts[1].toUpperCase();
    const [hoursStr, minutesStr] = timePart.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    let h = hours % 12; // 12 -> 0
    if (period === "PM") h += 12;
    return h * 60 + minutes;
  };

  const startMinutes = toMinutes(s);
  const endMinutes = toMinutes(e);

  return endMinutes > startMinutes;
};

export const validInterviewDate = (date: string) => {
  if (!date || typeof date !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const parsedDate = new Date(date + "T00:00:00"); // ensure no timezone drift
  if (isNaN(parsedDate.getTime())) return false; // invalid date

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsedDate >= today;
};

export const formatSWord = (word: string, count: number) => {
  return count === 1 ? word : `${word}s`;
}

export const getApplicationFilterText = (filter: string, count: number) => {
  switch(filter) {
    case "SHORTLISTED":
      return `${count} ${formatSWord("Shortlisted Application", count)}`;
    case "REJECTED":
      return `${count} ${formatSWord("Rejected Application", count)}`;
    case "PENDING":
      return `${count} ${formatSWord("Pending Application", count)}`;
    case "INTERVIEW_SCHEDULED":
      return `${count} ${formatSWord("Applicant", count)} to Interview`;
    case "INTERVIEW_COMPLETED":
      return `${count} ${formatSWord("Applicant", count)} Interviewed`;
    case "OFFER_MADE":
      return `${count} ${formatSWord("Applicant", count)} Offered position`;
    default:
      return `${count} ${formatSWord("Total Application", count)}`;
  }
}

export const getApplicationStatusFilterTextForUser = (status: string, count: number) => {
  switch(status) {
    case "PENDING":
      return `${count} ${formatSWord("Application", count)} Pending Review`;
    case "INTERVIEW_SCHEDULED":
      return `${count} ${formatSWord("Interview", count)} Scheduled`;
    case "INTERVIEW_COMPLETED":
      return `${count} ${formatSWord("Interview", count)} Completed`;
    case "OFFER_MADE":
      return `${count} ${formatSWord("Offer", count)} Made`;
    case "OFFER_ACCEPTED":
      return `${count} ${formatSWord("Offer", count)} Accepted`;
    case "OFFER_REJECTED":
      return `${count} ${formatSWord("Offer", count)} Rejected`;
    case "REJECTED":
      return `${count} ${formatSWord("Application", count)} Rejected`;
    default:
      return `${count} ${formatSWord("Total Application", count)}`;
  }
}
export const getInterviewFilterText = (filter: string, count: number) => {
  switch(filter) {
    case "SCHEDULED":
      return `${count} ${formatSWord("Scheduled Interview", count)}`;
    case "COMPLETED":
      return `${count} ${formatSWord("Completed Interview", count)}`;
    case "PENDING":
      return `${count} ${formatSWord("Interview", count)} Pending Decision`;
    case "REJECTED":
      return `${count} ${formatSWord("Candidate", count)} Rejected after Interview`;
    default:
      return `${count} ${formatSWord("Total Interview", count)}`;
    
  }
}

export const handleProfileImagePicker = async ({onSuccess}: {onSuccess: (result: ImagePicker.ImagePickerResult) => Promise<void>}) => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
            await onSuccess(cameraResult);
          }
          return;
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
            await onSuccess(galleryResult);
          }
          return;
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  export const getDurationString = (from: string, to: string) => {
    const currentDate = new Date();
    const fromDate = new Date(from);
    const toDate = to.toLowerCase() === 'present' ? currentDate : new Date(to);

    let years = toDate.getFullYear() - fromDate.getFullYear();
    let months = toDate.getMonth() - fromDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let duration = '';
    if (years > 0) {
      duration += `${years} ${formatSWord('year', years)}`;
    }
    if (months > 0) {
      if (duration) duration += ' ';
      duration += `${months} ${formatSWord('month', months)}`;
    }
  
    return duration || 'less than 1 year';
  }

export const sortProjectsByDate = (projects: Project[]) => {
  return projects.sort((p1, p2) => {
    const year1 = p1.yearCompleted;
    const year2 = p2.yearCompleted;
    if (year1?.toLowerCase() === "present") return -1;
    if (year2?.toLowerCase() === "present") return 1;

    const year1Empty = !year1 || year1.trim() === "";
    const year2Empty = !year2 || year2.trim() === "";

    if (year1Empty && year2Empty) return 0;
    if (year1Empty) return 1;
    if (year2Empty) return -1;

    try {
      const y1 = parseInt(year1.trim());
      const y2 = parseInt(year2.trim());
      
      if (isNaN(y1) || isNaN(y2)) {
        // If parsing fails, compare as strings
        return year1.localeCompare(year2);
      }
      
      return y2 - y1; // descending order (newer first)
    } catch (e) {
      return year1.localeCompare(year2);
    }
  });
};

export const sortExperiencesByDate = (experiences: Experience[]) => {
  return experiences.sort((e1, e2) => {
    // Experiences with empty 'to' field come first
    const e1ToEmpty = !e1.to || e1.to === "" || e1.to.toLowerCase() === "present";
    const e2ToEmpty = !e2.to || e2.to === "" || e2.to.toLowerCase() === "present";

    if (e1ToEmpty && !e2ToEmpty) return -1;
    if (!e1ToEmpty && e2ToEmpty) return 1;

    // Both have same 'to' status, sort by fromYear descending, then toYear descending
    const from1 = parseInt(e1.from);
    const from2 = parseInt(e2.from);
    const to1 = parseInt(e1.to);
    const to2 = parseInt(e2.to);

    const fromCompare = from2 - from1; // Descending order (newer first)
    if (fromCompare !== 0) return fromCompare;

    return to2 - to1; // Descending order (newer first)
  });
};

export const renderLocationString = (city: string, state: string, country: string) => {
  console.log('Rendering location with:', { city, state, country });
  let location = '';
  if (city) location += city;
  if (state) {
    if (location) location += ', ';
    location += state;
  }
  if (country) {
    if (location) location += ', ';
    location += country;
  }
  console.log('Rendered location:', location);
  return location;
}

export const documentTypes = [
  { label: "Resume", value: UserDocumentType.RESUME, icon: "file-text", color: "#3b82f6" },
  { label: "Cover Letter", value: UserDocumentType.COVER_LETTER, icon: "mail", color: "#8b5cf6" },
  { label: "Certificate", value: UserDocumentType.CERTIFICATE, icon: "award", color: "#f59e0b" },
  { label: "Transcript", value: UserDocumentType.TRANSCRIPT, icon: "book", color: "#10b981" },
  { label: "Recommendation", value: UserDocumentType.RECOMMENDATION, icon: "star", color: "#ef4444" },
];

export const convertDocumentTypeToLabel = (type: string | undefined) => {
  switch(type) {
    case 'RESUME':
      return "Resume";
    case 'COVER_LETTER':
      return "Cover Letter";
    case 'CERTIFICATE':
      return "Certificate";
    case 'TRANSCRIPT':
      return "Transcript";
    case 'RECOMMENDATION':
      return "Recommendation";
    default:
      return "Document";
  }
}


export const getNotificationIcon = (type: string) => {
    switch (type) {
      case "INTERVIEW_CREATED_SUCCESSFULLY":
        return { name: "calendar", color: "#10b981", bgColor: "#d1fae5" };
      case "INTERVIEW_SCHEDULED":
        return { name: "calendar", color: "#10b981", bgColor: "#d1fae5" };
      case "INTERVIEW_RESULT":
        return { name: "file-text", color: "#8b5cf6", bgColor: "#ede9fe" };
      case "INTERVIEW_COMPLETED":
        return { name: "check-circle", color: "#10b981", bgColor: "#d1fae5" };
      case "REJECTION":
        return { name: "x-circle", color: "#ef4444", bgColor: "#fee2e2" };
      case "GENERAL":
        return { name: "bell", color: "#6b7280", bgColor: "#f3f4f6" };
      case "APPLICATION_RECEIVED":
        return { name: "inbox", color: "#10b981", bgColor: "#d1fae5" };
      case "APPLICATION_VIEWED":
        return { name: "eye", color: "#f59e0b", bgColor: "#fef3c7" };
      case "INTERVIEW_PREP_READY":
        return { name: "book-open", color: "#14b8a6", bgColor: "#ccfbf1" };
      case "INTERVIEW_REMINDER":
        return { name: "clock", color: "#f59e0b", bgColor: "#fef3c7" };
      case "AI_RESUME_REVIEW_COMPLETE":
        return { name: "cpu", color: "#8b5cf6", bgColor: "#ede9fe" };
      default:
        return { name: "info", color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  export const getBorderColor = (type: string, isRead: boolean) => {
    switch (type) {
      case "INTERVIEW_SCHEDULED":
        return "#bfdbfe";
      case "INTERVIEW_RESULT":
        return "#c4b5fd";
      case "INTERVIEW_COMPLETED":
        return "#a7f3d0";
      case "REJECTION":
        return "#fecaca";
      case "GENERAL":
        return "#d1d5db";
      case "APPLICATION_RECEIVED":
        return "#bbf7d0";
      case "APPLICATION_VIEWED":
        return "#fed7aa";
      case "INTERVIEW_PREP_READY":
        return "#99f6e4";
      case "INTERVIEW_REMINDER":
        return "#fbbf24";
      case "AI_RESUME_REVIEW_COMPLETE":
        return "#c4b5fd";
      default:
        return "#d1d5db";
    }
  };

  export const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };


export const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const val = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return val;
  };

export const convertTimeZoneToIANA = (timezone: string) => {
  switch(timezone.toUpperCase()) {
    case 'ET':
      return 'America/New_York';
    case 'UTC':
      return 'UTC';
    case 'CT':
      return 'America/Chicago';
    case 'MT':
      return 'America/Denver';
    case 'PT':
      return 'America/Los_Angeles';
    case 'UK':
      return 'Europe/London';
    case 'CET':
      return 'Europe/Berlin';
    case 'UAE':
      return 'Asia/Dubai';
    case 'IST':
      return 'Asia/Kolkata';
    case 'SINGAPORE':
      return 'Asia/Singapore';
    case 'CHINA':
      return 'Asia/Shanghai';
    case 'TOKYO':
      return 'Asia/Tokyo';
    case 'AUSTRALIA':
      return 'Australia/Sydney';
    default:
      return timezone;
  }
}

export const convertFromIANAToTimeZone = (ianaTimezone: string) => {
  switch(ianaTimezone) {
    case 'America/New_York':
      return 'ET';
    case 'UTC':
      return 'UTC';
    case 'America/Chicago':
      return 'CT';
    case 'America/Denver':
      return 'MT';
    case 'America/Los_Angeles':
      return 'PT';
    case 'Europe/London':
      return 'UK';
    case 'Europe/Berlin':
      return 'CET';
    case 'Asia/Dubai':
      return 'UAE';
    case 'Asia/Kolkata':
      return 'IST';
    case 'Asia/Singapore':
      return 'SINGAPORE';
    case 'Asia/Shanghai':
      return 'CHINA';
    case 'Asia/Tokyo':
      return 'TOKYO';
    case 'Australia/Sydney':
      return 'AUSTRALIA';
    default:
      return ianaTimezone;
  }
}

export const convertToUTCDateString = (time: string, date: string, timezone: string) => {
  const ianaTimezone = convertTimeZoneToIANA(timezone);
  const isPM = time.toUpperCase().includes("PM");
  const isAM = time.toUpperCase().includes("AM");

  let [hours, minutes] = time
    .replace(/AM|PM/i, "")
    .trim()
    .split(":")
    .map(Number);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  const isoLocal = `${date.slice(0, 10)}T${hh}:${mm}:00`;
  const result = fromZonedTime(isoLocal, ianaTimezone);
  return result.toISOString();
};

export function combineDateAndTime(
  dateString: string, // yyyy-MM-dd
  timeString: string // "5:00 PM"
) {
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return `${dateString.slice(0, 10)}T${hh}:${mm}:00`;
}

export function combineDateAndTimeWithNoAMPM(
  dateString: string, // yyyy-MM-dd
  timeString: string // "17:00"
) {
  const [hours, minutes] = timeString.split(":").map(Number);

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return `${dateString.slice(0, 10)}T${hh}:${mm}:00`;
}

export const getDurationInMinutes = (from: string, to: string, timezone: string) => {
  const ianaTimezone = convertTimeZoneToIANA(timezone);
  const fromDate = fromZonedTime(from, ianaTimezone);
  const toDate = fromZonedTime(to, ianaTimezone);
  const diffInMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffInMs / (1000 * 60));
}

export const formatTimeForDisplay = (time: Date) => {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;  
      return formattedTime
}

export const convertToDate = (date: string, startTime: string, timezone: string) => {
  const ianaTimezone = convertTimeZoneToIANA(timezone);
  const dateTimeString = combineDateAndTimeWithNoAMPM(date, startTime);
  const zonedDate = fromZonedTime(dateTimeString, ianaTimezone);
  return zonedDate;
}

export const isInPast = (date: Date) => {
  const now = new Date();
  return date.getTime() < now.getTime();
}