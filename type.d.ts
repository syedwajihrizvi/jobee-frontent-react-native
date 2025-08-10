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

export type Job = {
    title: string,
    company: string,
    location: string,
    salary: number,
    postedDate: string,
    tags?: string[]
}