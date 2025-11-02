import React from "react";

interface SignInParams {
    email: string;
    password: string;
}

interface UserSignUpParams {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string,
    lastName: string,
}

interface BusinessSignUpParams {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export type CustomInputProps = {
    placeholder: string;
    label: string?;
    value?: string;
    multiline?: boolean;
    style?: object;
    autocorrect?: boolean;
    fullWidth?: boolean;
    customClass?: string;
    returnKeyType?: string;
    keyboardType?: string;
    autoCapitalize?: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: (text: string) => void
}

export type CustomButtonProps = {
    text: string;
    customClass?: string;
    isLoading?: boolean;
    onClick: () => void;
}

export type UserProfileSummary = {
    fullName: string;
    profileViews: number;
    profileViews: number;
    lastApplicationDate: string;
    totalInConsideration: number;
    totalRejections: number;
    totalApplications: number;
    totalInterviews: number;
    lastApplication: Application| null;
    favoriteCompanies: Company[];
}

export type BusinessProfileSummary = {
    totalJobsPosted: number;
    totalJobsPostedByUser: number;
    totalApplicationsReceived: number;
    totalJobViews: number;
    totalInterviewsScheduled: number
    totalOffersMade: number;
    totalHires: number;
    lastJobPosted: Job | null;
    upcomingInterviews: InterviewSummary[];
    mostAppliedJobs: Job[];
    mostViewedJobs: Job[];

}

export type Message = {
    id: number;
    conversationId: number;
    text: string;
    timestamp: string;
    sentByUser: boolean
}

export type MessagePreview = {
    id: number;
    from: string;
    to: string;
    senderProfileImageUrl: string;
    dateReceived: string;
    receiverProfileImageUrl: string;
    content: string;
    read: boolean
}

export type Conversation = {
    id: number;
    lastMessageRead: boolean;
    participantId: number;
    participantName: string;
    participantProfileImageUrl: string;
    participantRole: string;
    participantOneName; string;
    participantTwoName: string;
    lastMessageTimestamp: string;
    lastMessageContent: string;
    wasLastMessageSender: boolean;
}

export type ApplicationsForBusinessUserState = {
    applications: ApplicationSummary[];
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    setApplications: (applications: ApplicationSummary[]) => void
};

export type AuthState = {
    isAuthenticated: boolean;
    user: User | BusinessUser | null;
    userType: 'user' | 'business';
    isLoading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | BusinessUser | null) => void;
    setUserType: (type: 'user' | 'business') => void;
    setIsLoading: (isLoading: boolean) => void;
    fetchAuthenticatedUser: () => Promise<void>;
    removeUser: () => void
}

export type ProfileSummaryState = {
    profileSummary: UserProfileSummary | null;
    setProfileSummary: (summary: UserProfileSummary) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    fetchProfileSummary: () => Promise<void>
}

export type BusinessProfileSummaryState = {
    profileSummary: BusinessProfileSummary | null;
    setProfileSummary: (summary: BusinessProfileSummary) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    fetchProfileSummary: () => Promise<void>
}

export type Tag = {
    id: number;
    name: string;
    description: string;
}

export type Job = {
    id: number,
    title: string,
    description: string,
    businessName: string,
    companyId: number,
    department: string,
    level: string,
    views: number,
    businessAccountId: number,
    experience: number,
    location: string,
    employmentType: string,
    minSalary: number,
    maxSalary: number,
    tags: Tag[],
    applicants: number,
    pendingApplicationsSize: number,
    interviews: number
    createdAt: string,
    employmentType: string,
    setting: string
    applications: Application[],
    totalShortListedCandidates: number,
    appDeadline: string
}

export type JobFilters = {
    search: string;
    locations: string[];
    companies?: string[];
    tags: string[];
    distance?: string;
    minSalary?: number;
    maxSalary?: number;
    experience: string;
    employmentTypes?: string[];
    workArrangements?: string[];
}

export type ApplicantFilters = {
    locations: string[];
    skills: string[];
    educations: string;
    experiences: string;
    hasVideoIntro?: boolean;
    hasCoverLetter?: boolean;
    applicationDateRange?: number;
    search?: string;
}

export type CandidateForJob = {
    id: number;
    fullName: string;
    profileImageUrl: string;
    title: string;
    location: string;
    matchScore: number;
}

export type InterviewFilter = 'Upcoming' | 'Completed' | 'Pending Decision' | 'Hired' | 'Next Round' | 'Rejected'

export type ProfileLinks = {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
}

export type UserDocument = {
    id: number,
    documentUrl: string,
    documentType?: string,
    createdAt?: string,
    filename?: string,
    title?: string
}

export type AllUserDocuments = {
    resumeDocuments: UserDocument[];
    coverLetterDocuments: UserDocument[];
    certificateDocuments: UserDocument[];
    transcriptDocuments: UserDocument[];
    recommendationDocuments: UserDocument[];
}

export type Company = {
    id: number;
    name: string;
    website: string;
    foundedYear: number;
    logoUrl: string;
    rating: number;
    numEmployees: number,
    industry: string;
    description: string;
    location: string;
    hqCity: string;
    hqState: string;
    province: string;
    hqCountry: string;
}
    
export type User = {
    id: number;
    firstName: string;
    lastName: string;
    canQuickApplyBatch: boolean;
    nextQuickApplyBatchTime: string | null;
    age: number;
    email: string;
    state: string;
    province: string;
    city: string;
    country: string;
    location: string;
    company: string;
    phoneNumber: string;
    title: string;
    summary: string;
    skills: UserSkill[];
    education: Education[];
    experiences: Experience[];
    projects: Project[];
    applications: Application[];
    profileComplete: boolean;
    profileImageUrl: string;
    favoriteJobs: {id:number}[];
    documents: UserDocument[],
    primaryResume: UserDocument | null
    videoIntroUrl: string | null;
}

export type BusinessUser = {
    id: number;
    email: string;
    companyName: string;
    companyId: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    title: string;
    location: string;
    verified: boolean;
    city: string;
    state: string;
    country: string;
    phoneNumber: string;
}

export type InterviewerProfileSummary = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    summary: string;
    verified: boolean;
    socialLinks?: {platform: string, url: string}[];
}

export type EditUserProfileForm = {
    firstName: string;
    lastName: string;
    summary: string;
    title: string;
    location: string;
}

export type Experience = {
    id: number;
    title: string;
    description: string;
    company: string;
    city: string;
    country: string;
    from: string;
    to: string;
    currentlyWorking: boolean;
}

export type Project = {
   id: number;
   name: string;
   description: string;
   link: string;
   yearCompleted: string; 
}

export type UserSkill = {
    id: number;
    experience: number;
    skill: Skill
}

export type Skill = {
    id: number;
    name: string;
    description: string;
}

export type Education = {
    id: number;
    institution: string;
    degree: string;
    fromYear: string;
    toYear: string | null;
    degreeType: string;
}

export type SocialMedia = {
    id: number;
    type: string;
    url: string;
}

export type ProfileImageUpdate = {
    profileImageUrl: string;}

export type UpdateProfileForm = {
    firstName?: string;
    lastName?: string;
    title?: string;
    company?: string;
    email?: string;
    phoneNumber?: string;
    location?: string;
}

export type AddUserSkillForm = {
    id: number;
    skill: string;
    experience: string;
    skillId: number;
}

export type AddUserEducationForm = {
    id: number;
    institution: string;
    degree: string;
    fromYear: string;
    toYear: string;
    degreeType: string;
}

export type AddExperienceForm = {
    id: number;
    title: string;
    company: string;
    description: string;
    city: string;
    country: string;
    from: string;
    to: string;
}

export type AddProjectForm = {
    id: number;
    name: string;
    description: string;
    link: string;
    yearCompleted: string;
}

export type CreateApplication = {
    jobId: number,
    resumeDocumentId: number,
    coverLetterDocumentId?: number
}

export type Application = {
    id: number,
    jobId: number,
    companyName: string,
    jobTitle: string,
    status: string,
    appliedAt: string;
    interviewId: number | null
}

export type ApplicationSummary = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImageUrl: string;
    location: string;
    appliedAt: string;
    profileSummary: string;
    title: string;
    shortListed: boolean;
    status: string;
}

export type ApplicationDetailsForBusiness = {
    id: number;
    appliedAt: string;
    status: string;
    resumeUrl: string;
    coverLetterUrl?: string;
    interviewIds: number[];
    fullName: string;
    jobId: number;
    jobTitle: string;
    companyName: string;
    shortListed: boolean;
    userProfile: User
}

export type CreateJobForm = {
    title: string;
    description: string;
    location: string;
    minSalary: string;
    maxSalary: string;
    experience: string;
    employmentType: string;
    setting: string;
    appDeadline: string;
    tags: string[]
}

export type CreateInterviewForm = {
    title: string;
    description: string;
    conductors: {name: string; email: string}[];
    interviewDate: string;
    startTime: string;
    timezone: string;
    endTime: string;
    interviewType: string;
    streetAddress: string;
    buildingName: string;
    parkingInfo: string;
    contactInstructionsOnArrival: string;
    meetingLink: string;
    meetingPlatformType: string;
    phoneNumber: string;
    preparationTipsFromInterviewer: string[];
}

export type InterviewDetails = {
    id: number,
    title: string;
    jobTitle: string;
    jobId: number;
    companyName: string;
    description: string;
    interviewDate: string;
    startTime: string;
    endTime: string;
    applicationId: number;
    candidateId: number;
    candidateName: string;
    candidateProfileImageUrl: string;
    decisionDate: string;
    decisionResult: string;
    status: string;
    interviewType: string;
    timezone: string;
    interviewers: {name: string; email: string, title: string}[];
    otherInterviewers: {name: string; email: string, title: string}[];
    preparationTipsFromInterviewer: string[];
    streetAddress: string;
    buildingName: string;
    parkingInfo: string;
    contactInstructionsOnArrival: string;
    meetingLink: string;
    interviewMeetingPlatform: string;
    phoneNumber: string;
    notes: string[];
    preparationStatus: string;
}

export type InterviewSummary = {
    id: number;
    title: string;
    interviewDate: string;
    jobTitle: string;
    description: string;
    startTime: string;
    endTime: string;
    interviewType: string;
    timezone: string;
    companyName: string;
}

export type InterviewPrepQuestion = {
    id: number;
    question: string;
    answer: string;
    questionAudioUrl: string | null;
    answerAudioUrl: string | null;
    aiAnswer: string | null;
    aiAnswerAudioUrl: string | null;
    userAnswerScore: string | null;
    reasonForScore: string | null;
}

export type InterviewPreparation = {
    id: number;
    strengths: string[];
    weaknesses: string[];
    questions: InterviewPrepQuestion[];
    resources: {title: string, link: string, description: string, type: string}[];
    overallAdvice: string;
    notesFromInterviewer: string[]
}
    
export type AnswerFeedback = {
    userAnswerScore: number | null;
    reasonForScore: string | null;
    aiAnswer: string | null;
    aiAnswerAudioUrl: string | null;
}

export type CompleteProfileForm = {
    title: string;
    city: string;
    country: string;
    summary: string;
    phoneNumber: string;
}

export interface PagedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasMore: boolean
}


export type GoogleDriveFile = {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size: string;
}

export type DropboxFile = {
    id: string;
    name: string;
    server_modified: string;
    client_modified: string;
    path_display: string;
    ".tag": string;
    size: number;
}

export type OneDriveFile = {
    id: string;
    name: string;
    lastModifiedDateTime: string;
    folder: any;
    file: any;
    specialFolder: any;
    "@microsoft.graph.downloadUrl"?: string;
    size: number;
}

type GoogleDrivePathContent = {
  id: string;
  name: string;
  fileType: "file" | "folder";
  modifiedTime: string;
  mimeType?: string;
  fileSize?: number;
};

type DropBoxPathContent = {
  id: string;
  name: string;
  pathDisplay: string;
  fileType: string;
  serverModified?: string;
  clientModified?: string;
  fileSize?: number;
    mimeType?: string;
};

type OneDrivePathContent = {
  id: string;
  name: string;
  fileType: "file" | "folder" | "specialFolder" | "unknown";
  lastModifiedDateTime: string;
  mimeType?: string;
  downloadUrl?: string;
  fileSize?: number;
};

export type SelectedUploadMethod = "IMAGE_UPLOAD" |"DIRECT_UPLOAD" | "GOOGLE_DRIVE" | "DROPBOX" | "ONEDRIVE" | "LINK_INPUT" | null;