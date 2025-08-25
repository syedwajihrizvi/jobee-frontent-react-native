import React from "react";

interface SignInParams {
    email: string;
    password: string;
}

interface SignUpParams {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string,
    lastName: string,
    age: number
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
    user: User | null;
    isLoading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | null) => void;
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
    tags: Tag[]
}

export type JobFilters = {
    search?: string;
    location?: string;
    company?: string;
    distance?: number;
    salary?: number;
    experience?: number;
}

export type ProfileLinks = {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
}

export type UserDocument = {
    id: number,
    documentUrl: string,
    documentType: string,
    createdAt: string,
    filename: string
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
    documents: UserDocument[]
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
    appliedAt: string
}