import { Application, OneDriveFile, User, UserDocument } from "@/type";
import * as Haptics from 'expo-haptics';

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
    if (normalizedStatus.includes("interview")) {
      return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
    }
    if (normalizedStatus.includes("accepted") || normalizedStatus.includes("hired")) {
      return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
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
    icon: "award",
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

export const getCustomCompanyFormPlaceholderField = (field: string) => {
  switch(field) {
    case 'Company Name':
      return "e.g. Amazon";
    case 'Industry':
      return "e.g. Information Technology";
    case 'Description':
      return "e.g. Amazon is a multinational technology company...";
    case 'Location':
      return "e.g. Seattle, WA";
    case 'Company Size':
      return "e.g. 10,000+ employees";
    case 'Website':
      return "e.g. www.amazon.com";
    case 'LinkedIn':
      return "e.g. linkedin.com/company/amazon";
    default:
      return "e.g. Value";
}
}

export const interviewStatusStyles = {
    SCHEDULED: {
      bgColor: "bg-emerald-500",
      chevronColor: "bg-emerald-100",
      chevronShadowColor: "#6366f1",
      text: "Interview Scheduled"
    },
    COMPLETED: {
      bgColor: "bg-blue-500",
      chevronColor: "bg-blue-100",
      chevronShadowColor: "#3b82f6",
      text: "Interview Completed"
    },
  };

export const getDecisionString = (decision: string) => {
  switch(decision) {
    case 'NEXT_ROUND':
      return "Candidate moved to next round";
    case 'REJECTED':
      return "Candidate has been rejected";
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
      bgColor: 'bg-emerald-600',
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
      bgColor: 'bg-green-500',
      borderColor: 'border-green-600',
      shadowColor: '#16a34a',
      textColor: 'text-white',
      icon: 'thumbs-up',
      label: 'Great Match',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-green-500',
      progressBarColor: '#4ade80', // green-400 for contrast
      progressBarBg: 'bg-green-200'
    };
    if (percentage >= 60) return {
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-600',
      shadowColor: '#eab308',
      textColor: 'text-white',
      icon: 'check-circle',
      label: 'Good Match',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-yellow-500',
      progressBarColor: '#fbbf24', // yellow-400 for contrast
      progressBarBg: 'bg-yellow-200'
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
    return { name: "image", color: "#10b981", bgColor: "bg-green-100" };
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
