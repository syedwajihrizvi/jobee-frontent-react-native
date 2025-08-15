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
    label: string;
    value: string;
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