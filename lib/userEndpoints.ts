import { ApplicantFilters, Application, InterviewDetails, InterviewFilters, PagedResponse } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEducationLevel, getExperienceLevel } from "./utils";

const APPLICATIONS_API_URL = `http://192.168.2.29:8080/applications`;
const INTERVIEWS_API_URL = `http://192.168.2.29:8080/interviews`;
const JOBS_API_URL = `http://192.168.2.29:8080/jobs`;

export const getUserInterviews = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${INTERVIEWS_API_URL}/candidate/me`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as InterviewDetails[];
}

export const getUserApplications = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${APPLICATIONS_API_URL}/user/me`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as Application[];
}

export const getBusinessUserInterviews = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${INTERVIEWS_API_URL}/business`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as InterviewDetails[];
}

export const getApplicationsForJob = async (
    jobId: number, page: number, pageSize: number, filters?: ApplicantFilters
) => {
   const token = await AsyncStorage.getItem('x-auth-token')
   const queryParams = new URLSearchParams()
   const locations = filters?.locations || []
   const skills = filters?.skills || []
   const educations = filters?.educations
   const experiences = filters?.experiences
   locations.forEach(location => queryParams.append('locations', location))
   skills.forEach(skill => queryParams.append('skills', skill))
   if (filters?.search) {
     queryParams.append('search', filters.search)
   }
   if (educations && educations !== 'Any') 
     queryParams.append('educationLevel', getEducationLevel(educations) ?? '')
   if (experiences && experiences !== 'Any')
     queryParams.append('experienceLevel', getExperienceLevel(experiences) ?? '')
   if (filters?.hasVideoIntro)
     queryParams.append('hasVideoIntro', true.toString())
   if (filters?.hasCoverLetter)
     queryParams.append('hasCoverLetter', true.toString())
   if (filters?.applicationDateRange) {
     queryParams.append('applicationDateRange', filters?.applicationDateRange.toString())
   }
   if (filters?.applicationStatus) {
    if (filters.applicationStatus === 'SHORTLISTED') {
        queryParams.append('shortlisted', 'true')
    } else {
        queryParams.append('applicationStatus', filters.applicationStatus)
    }
   }
   const params = queryParams.toString()   
   const response = await fetch(`${APPLICATIONS_API_URL}/jobs/${jobId}?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
       method: 'GET',
       headers: {
           'x-auth-token': `Bearer ${token}`
       }
   })
   const data = await response.json() as PagedResponse<Application>;
   return data
   
}

export const getShortListedApplicationsForJob = async (jobId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${JOBS_API_URL}/${jobId}/shortlisted`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json()
    return data as number[];
}

export const getInterviewsForJobAndFilter = async (page: number, pageSize: number, filter?: InterviewFilters) => {
    const token = await AsyncStorage.getItem('x-auth-token')

    const queryParams = new URLSearchParams()
    if (filter?.search) {
        queryParams.append('search', filter.search)
    }
    if (filter?.dateRangeInDays) {
        queryParams.append('dateAgo', filter.dateRangeInDays.toString())
    }
    if (filter?.status) {
        queryParams.append('interviewStatus', filter.status)
    }
    if (filter?.decisionResult) {
        queryParams.append('decisionResult', filter.decisionResult)
    }
    if (filter?.jobId) {
        queryParams.append('jobId', filter.jobId.toString())
    }
    const params = queryParams.toString()
    const response = await fetch(`${INTERVIEWS_API_URL}?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as PagedResponse<InterviewDetails>;
    return data;
}