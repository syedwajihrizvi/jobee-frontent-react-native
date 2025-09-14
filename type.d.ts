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
    age: number
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
    value: string;
    multiline?: boolean;
    customClass?: string;
    returnKeyType?: string;
    autoCapitalize?: string;
    onChangeText: (text: string) => void;
}

export type CustomButtonProps = {
    text: string;
    customClass?: string;
    isLoading?: boolean;
    onClick: () => void;
}

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
    businessAccountId: number,
    experience: number,
    location: string,
    employmentType: string,
    minSalary: number,
    maxSalary: number,
    tags: Tag[],
    applicants: number,
    createdAt: string,
    employmentType: string,
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
    experience?: string;
}

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

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    location: string;
    company: string;
    phoneNumber: string;
    title: string;
    summary: string;
    skills: UserSkill[];
    education: Education[];
    experiences: Experience[];
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
    toYear: string | null
}

export type ProfileImageUpdate = {
    profileImageUrl: string;}

export type AddUserSkillForm = {
    skill: string;
    experience: string;
}

export type AddUserEducationForm = {
    institution: string;
    degree: string;
    fromYear: string;
    toYear: string;
}

export type AddExperienceForm = {
    title: string;
    company: string;
    description: string;
    city: string;
    country: string;
    from: string;
    to: string;
}

export type CreateApplication = {
    jobId: number,
    resumeDocumentId: number,
    coverLetterDocumentId?: number
}

export type Application = {
    id: number,
    jobId: number,
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
    fullName: string;
    jobId: number;
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
    location: string;
    meetingLink: string;
    phoneNumber: string;
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
    interviewType: string;
    timezone: string;
    interviewers: {name: string; email: string}[];
    otherInterviewers: {name: string; email: string}[];
    location: string;
    meetingLink: string;
    phoneNumber: string;
    notes: string[];
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

export type CompleteProfileForm = {
    title: string;
    city: string;
    country: string;
    summary: string;
    company: string;
    position: string;
    phoneNumber: string;
}