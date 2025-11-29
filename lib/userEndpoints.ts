import { getAPIUrl } from "@/constants";
import { ApplicantFilters, Application, ApplicationStatusFilter, Education, Experience, InterviewDetails, InterviewFilters, Job, JobFilters, PagedResponse, Project, SocialMedia, UserDocument, UserSkill } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEducationLevel, getExperienceLevel } from "./utils";

const APPLICATIONS_API_URL = getAPIUrl('applications');
const INTERVIEWS_API_URL = getAPIUrl('interviews');
const JOBS_API_URL = getAPIUrl('jobs');
const USER_PROFILE_API_URL = getAPIUrl('profiles');
const USER_SKILL_API = getAPIUrl('profiles/skills');
const USER_EXPERIENCES_API = getAPIUrl('profiles/experiences');
const USER_EDUCATION_API = getAPIUrl('profiles/education');
const USER_PROJECTS_API = getAPIUrl('profiles/projects');
const USER_DOCUMENTS_API = getAPIUrl('user-documents')

export const getUserInterviews = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return []
    const response = await fetch(`${INTERVIEWS_API_URL}/candidate/me`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    console.log("User Interviews Response:", response);
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

export const getLastUserApplication = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    if (!token) return null
    const response = await fetch(`${APPLICATIONS_API_URL}/users/last-application`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (response.status === 404) {
        return null
    }
    const data = await response.json()
    return data as Application
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

const createJobQueryParams = (filter?: JobFilters) => {
    const queryParams = new URLSearchParams()
    if (filter?.search) {
        queryParams.append('search', filter.search)
    }
    if (filter?.locations) {
        filter.locations.forEach(location => queryParams.append('locations', location))
    }
    if (filter?.companies) {
        filter.companies.forEach(company => queryParams.append('companies', company))
    }
    if (filter?.tags) {
        filter.tags.forEach(tag => queryParams.append('tags', tag))
    }
    if (filter?.minSalary !== undefined) {
        queryParams.append('minSalary', filter.minSalary.toString())
    }
    if (filter?.maxSalary !== undefined) {
        queryParams.append('maxSalary', filter.maxSalary.toString())
    }
    if (filter?.employmentTypes) {
        filter.employmentTypes.forEach(type => queryParams.append('employmentTypes', type))
    }
    if (filter?.workArrangements) {
        filter.workArrangements.forEach(arrangement => queryParams.append('workArrangements', arrangement))
    }
    if (filter?.experience) {
        filter.experience.forEach(exp => queryParams.append('experience', exp))
    }
    return queryParams.toString();
}

export const getJobsForBusinessAndFilter = async (page: number, pageSize: number, filter?: JobFilters) => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const params = createJobQueryParams(filter);
    const response = await fetch(`${JOBS_API_URL}/businesses?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as PagedResponse<Job>;
    return data;
}
    

export const getJobsForUserAndFilter = async (page: number, pageSize: number, filter?: JobFilters) => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const params = createJobQueryParams(filter);
    const response = await fetch(`${JOBS_API_URL}?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as PagedResponse<Job>;
    return data;
}

export const getRecommendedJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const response = await fetch(`${USER_PROFILE_API_URL}/recommended-jobs`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as { job: Job, match: number }[];
    return data;
}

export const getFavoriteJobsForUser = async (page: number, pageSize: number) => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const response = await fetch(`${USER_PROFILE_API_URL}/favorite-jobs?pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as PagedResponse<Job>;
    return data;
}

export const getAppliedJobsForUserAndFilter = async (page: number, pageSize: number, filter?: ApplicationStatusFilter) => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const queryParams = new URLSearchParams()
    if (filter) {
        queryParams.append('applicationStatus', filter)
    }
    const params = queryParams.toString()
    const response = await fetch(`${USER_PROFILE_API_URL}/appliedJobs?${params}&pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as PagedResponse<Job>;
    return data;
}

export const getUserSkills = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_SKILL_API}/my-skills`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as UserSkill[];
}

export const getUserExperiences = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_EXPERIENCES_API}/my-experiences`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as Experience[];
}

export const getUserEducations = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_EDUCATION_API}/my-education`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as Education[];
}

export const getUserProjects = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_PROJECTS_API}/my-projects`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as Project[];
}   

export const getUserDocuments = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_DOCUMENTS_API}/user/me`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as UserDocument[];

}   

export const getUserSocialMedias = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${USER_PROFILE_API_URL}/social-media/my-social-media`, {
        headers: {
            'x-auth-token': `Bearer ${token}` || ''
        }
    });
    const data = await response.json();
    return data as SocialMedia[];
}

export const getMostPopularJobs = async () => {
    const token = await AsyncStorage.getItem('x-auth-token')
    const response = await fetch(`${JOBS_API_URL}/popular-jobs`, {
        method: 'GET',
        headers: {
            'x-auth-token': `Bearer ${token}`
        }
    })
    const data = await response.json() as {mostAppliedJobs: Job[], mostViewedJobs: Job[]};
    return data;
}