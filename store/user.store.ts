import { UserDocumentType } from '@/constants';
import { getLastUserApplication, getUserApplications, getUserDocuments, getUserEducations, getUserExperiences, getUserInterviews, getUserProjects, getUserSkills, getUserSocialMedias } from '@/lib/userEndpoints';
import { convertEnumToSocialMediaType, sortExperiencesByDate, sortProjectsByDate } from '@/lib/utils';
import { Application, Education, Experience, InterviewDetails, Project, SocialMedia, UserDocument, UserSkill, UserSocials } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

type UserType = {
    type: 'user' | 'business',
    isLoadingInterviews: boolean,
    isLoadingApplications: boolean,
    isLoadingLastApplication: boolean,
    isLoadingSkills: boolean,
    isLoadingExperiences: boolean,
    isLoadingEducations: boolean,
    isLoadingProjects: boolean,
    isLoadingSocialMedias: boolean,
    isLoadingDocuments: boolean,
    interviews: InterviewDetails[],
    applications: Application[],
    skills: UserSkill[],
    experiences: Experience[],
    educations: Education[],
    projects: Project[],
    socialMedias: UserSocials,
    resumeDocuments: UserDocument[],
    coverLetterDocuments: UserDocument[],
    certificateDocuments: UserDocument[],
    transcriptDocuments: UserDocument[],
    recommendationDocuments: UserDocument[],
    documents: UserDocument[],
    lastApplication: Application | null,
    lastFetchedLastApplication: number | null,
    lastFetchedSkills: number | null,
    lastFetchedExperiences: number | null,
    lastFetchedEducations: number | null,
    lastFetchedProjects: number | null,
    lastFetchedDocuments: number | null,
    lastFetchedSocialMedias: number | null,
    setType: (type: 'user' | 'business') => Promise<void>,
    fetchUserData: () => Promise<void>,
    fetchLastApplication: () => Promise<void>,
    fetchUserSkills: () => Promise<void>,
    fetchUserExperiences: () => Promise<void>,
    fetchUserEducations: () => Promise<void>,
    fetchUserProjects: () => Promise<void>,
    fetchUserSocialMedias: () => Promise<void>,
    fetchUserDocuments: () => Promise<void>,
    refetchInterviews: () => Promise<void>,
    refetchCandidateInformation: () => Promise<void>,
    refetchUserDocuments: () => Promise<void>,
    setInterviews: (interviews: InterviewDetails[]) => void,
    setApplications: (applications: Application[]) => void,
    setSkills: (skills: UserSkill[]) => void,
    setApplicationStatus: (applicationId: number, status: string) => void,
    setInterviewStatus: (interviewId: number, status: string) => void,
    setInterviewDecision: (interviewId: number, decision: string) => void,
    setLastApplication: (application: Application | null) => void,
    getLastApplication: () => Application | null,
    getSkills: () => UserSkill[],
    getExperiences: () => Experience[],
    getEducations: () => Education[],
    getProjects: () => Project[],
    getSocialMedias: () => UserSocials,
    getDocuments: () => UserDocument[],
    // We have a number for the primary so that we place it first in the list
    getResumeDocuments: (primaryResumeId: number | null) => UserDocument[],
    getCoverLetterDocuments: () => UserDocument[],
    getCertificateDocuments: () => UserDocument[],
    getTranscriptDocuments: () => UserDocument[],
    getRecommendationDocuments: () => UserDocument[],
    hasUserAppliedToJob: (jobId: number) => Application | undefined,
    hasValidLastApplication: () => boolean,
    hasValidSkills: () => boolean,
    hasValidExperiences: () => boolean,
    hasValidEducations: () => boolean,
    hasValidProjects: () => boolean,
    hasValidSocialMedias: () => boolean,
    hasValidDocuments: () => boolean,
    updateSkills: (skill: UserSkill) => void,
    removeSkill: (skillId: number) => void,
    updateExperiences: (experience: Experience) => void,
    removeExperience: (experienceId: number) => void,
    updateEducations: (education: Education) => void,
    removeEducation: (educationId: number) => void,
    updateProjects: (project: Project) => void,
    removeProject: (projectId: number) => void,
    updateSocialMedias: (socialMedia: SocialMedia) => void

}

const useUserStore = create<UserType>((set, get) => ({
    type: 'user',
    isLoadingInterviews: false,
    isLoadingApplications: false,
    isLoadingLastApplication: false,
    isLoadingSkills: false,
    isLoadingExperiences: false,
    isLoadingEducations: false,
    isLoadingProjects: false,
    isLoadingSocialMedias: false,
    isLoadingDocuments: false,
    interviews: [],
    applications: [],
    skills: [],
    experiences: [],
    educations: [],
    projects: [],
    socialMedias: {
      linkedin: { id: 0, url: "" },
      github: { id: 0, url: "" },
      stackOverflow: { id: 0, url: "" },
      twitter: { id: 0, url: "" },
      personalWebsite: { id: 0, url: "" },
    },
    resumeDocuments: [],
    coverLetterDocuments: [],
    certificateDocuments: [],
    transcriptDocuments: [],
    recommendationDocuments: [],
    documents: [],
    lastApplication: null,
    lastFetchedLastApplication: null,
    lastFetchedSkills: null,
    lastFetchedExperiences: null,
    lastFetchedEducations: null,
    lastFetchedProjects: null,
    lastFetchedSocialMedias: null,
    lastFetchedDocuments: null,
    setType: async (type: 'user' | 'business') => {
        await AsyncStorage.setItem('userType', type);
        set({ type });
    },
    fetchUserData: async () => {
        set({ isLoadingInterviews: true, isLoadingApplications: true });
        const [interviewsResult, applicationsResult] = await Promise.allSettled([
            getUserInterviews(),
            getUserApplications()
        ]);
        if (interviewsResult.status === 'fulfilled') {
            set({ interviews: interviewsResult.value });
        } else {
            console.log(interviewsResult)
            console.error("Error fetching user interviews:", interviewsResult.reason);
        }
        
        if (applicationsResult.status === 'fulfilled') {
            set({ applications: applicationsResult.value });
        } else {
            console.error("Error fetching user applications:", applicationsResult.reason);
        }
        set({ isLoadingInterviews: false, isLoadingApplications: false });
    },
    fetchLastApplication: async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) {
            set({ lastApplication: null });
            return;
        }
        set({ isLoadingLastApplication: true });
        try {
            const response = await getLastUserApplication();
            set({ lastApplication: response || null }); 
        } catch (error) {
             console.error("Error fetching last user application:", error);
        } finally {
            set({ isLoadingLastApplication: false });
        }
    },
    fetchUserSkills: async () => {
        if (get().isLoadingSkills) return;
        set({ isLoadingSkills: true });
        try {
            const skills = await getUserSkills();
            set({ skills, lastFetchedSkills: Date.now() });
        } catch (error) {
            console.error("Error fetching user skills:", error);
        } finally {
            set({ isLoadingSkills: false });
        }
    },
    fetchUserExperiences: async () => {
        if (get().isLoadingExperiences) return;
        set({ isLoadingExperiences: true });
        try {
            const experiences = await getUserExperiences();
            set({ experiences, lastFetchedExperiences: Date.now() });
        } catch (error) {
            console.error("Error fetching user experiences:", error);
        } finally {
            set({ isLoadingExperiences: false });
        }
    },
    fetchUserEducations: async () => {
        if (get().isLoadingEducations) return;
        set({ isLoadingEducations: true });
        try {
            const educations = await getUserEducations();
            set({ educations, lastFetchedEducations: Date.now() });
        } catch (error) {
            console.error("Error fetching user educations:", error);
        } finally {
            set({ isLoadingEducations: false });
        }
    },
    fetchUserProjects: async () => {
        if (get().isLoadingProjects) return;
        set({ isLoadingProjects: true });
        try {
            const projects = await getUserProjects();
            set({ projects, lastFetchedProjects: Date.now() });
        } catch (error) {
            console.error("Error fetching user projects:", error);
        } finally {
            set({ isLoadingProjects: false });
        }
    },
    fetchUserSocialMedias: async () => {
        if (get().isLoadingSocialMedias) return;
        set({ isLoadingSocialMedias: true });
        try {
            const socialMedias = await getUserSocialMedias();
            socialMedias.forEach((social) => {
                const convertType = convertEnumToSocialMediaType(social.type);
                if (convertType in get().socialMedias) {
                    set((state) => ({
                        socialMedias: {
                            ...state.socialMedias,
                            [convertType]: { id: social.id, url: social.url },
                        },
                    }));
                }
            });
            set({ lastFetchedSocialMedias: Date.now() });
        } catch (error) {
            console.error("Error fetching user social medias:", error);
        } finally {
            set({ isLoadingSocialMedias: false });
        }
    },
    fetchUserDocuments: async () => {
        if (get().isLoadingDocuments) return;
        set({ isLoadingDocuments: true });
        try {
            const documents = await getUserDocuments();
            set({ 
              resumeDocuments: documents.filter(doc => doc.documentType === UserDocumentType.RESUME),
              coverLetterDocuments: documents.filter(doc => doc.documentType === UserDocumentType.COVER_LETTER),
              certificateDocuments: documents.filter(doc => doc.documentType === UserDocumentType.CERTIFICATE),
              transcriptDocuments: documents.filter(doc => doc.documentType === UserDocumentType.TRANSCRIPT),
              recommendationDocuments: documents.filter(doc => doc.documentType === UserDocumentType.RECOMMENDATION),
              documents,
              lastFetchedDocuments: Date.now() 
            });
        } catch (error) {
            console.error("Error fetching user documents:", error);
        } finally {
            set({ isLoadingDocuments: false });
        }
    },
    refetchInterviews: async () => {
        set({ isLoadingInterviews: true });
        try {
            const interviews = await getUserInterviews();
            set({ interviews });
        } catch (error) {
            console.error("Error refetching user interviews:", error);
        } finally {
            set({ isLoadingInterviews: false });
        }
    },
    refetchCandidateInformation: async () => {
        await Promise.all([
            get().fetchUserSkills(),
            get().fetchUserExperiences(),
            get().fetchUserEducations(),
            get().fetchUserProjects(),
            get().fetchUserSocialMedias(),
            get().fetchUserDocuments(),
        ]);
    },
    refetchUserDocuments: async () => {
        await get().fetchUserDocuments();
    },
    setInterviews: (interviews: InterviewDetails[]) => set({ interviews }),
    setInterviewStatus: (interviewId: number, status: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, status} : interview
        )
    })),
    setApplications: (applications: Application[]) => set({ applications }),
    setApplicationStatus: (applicationId: number, status: string) => set((state) => ({
        applications: state.applications.map(app => 
            app.id === applicationId ? { ...app, status } : app
        )
    })),
    getLastApplication: () => {
        return get().lastApplication;
    },
    getSkills: () => {
        return get().skills;
    },
    getExperiences: () => {
        return get().experiences;
    },
    getEducations: () => {
        return get().educations;
    },
    getProjects: () => {
        return get().projects;
    },
    getSocialMedias: () => {
        return get().socialMedias;
    },
    getDocuments: () => {
        return get().documents;
    },
    getResumeDocuments: (primaryResumeId: number | null) => {
        const resumes = get().resumeDocuments;
        if (primaryResumeId === null) return resumes;
        const primaryResumeIndex = resumes.findIndex(doc => doc.id === primaryResumeId);
        if (primaryResumeIndex === -1) return resumes;
        const primaryResume = resumes[primaryResumeIndex];
        const otherResumes = resumes.filter(doc => doc.id !== primaryResumeId);
        return [primaryResume, ...otherResumes];
    },
    getCoverLetterDocuments: () => {
        return get().coverLetterDocuments;
    },
    getCertificateDocuments: () => {
        return get().certificateDocuments;
    },
    getTranscriptDocuments: () => {
        return get().transcriptDocuments;
    },
    getRecommendationDocuments: () => {
        return get().recommendationDocuments;
    },
    setInterviewDecision: (interviewId: number, decision: string) => set((state) => ({
        interviews: state.interviews.map(interview => 
            interview.id === interviewId ? { ...interview, decision } : interview
        )
    })),
    setLastApplication: (application: Application | null) => {
        set({ lastApplication: application, lastFetchedLastApplication: Date.now() });
    },
    setSkills: (skills: UserSkill[]) => {},
    hasUserAppliedToJob: (jobId: number) => {
        return get().applications.find(
            (app) => app.jobId === jobId
        );
    },
    hasValidLastApplication: () => {
        const { lastApplication, lastFetchedLastApplication } = get();
        if (!lastApplication || !lastFetchedLastApplication) return false;
        const THIRTY_MINUTES = 30 * 60 * 1000;
        return (Date.now() - lastFetchedLastApplication) < THIRTY_MINUTES;
    },
    hasValidSkills: () => {
        const { skills, lastFetchedSkills } = get();
        if (skills.length === 0 || !lastFetchedSkills) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedSkills) < ONE_HOUR;
    },
    hasValidExperiences: () => {
        const { experiences, lastFetchedExperiences } = get();
        if (experiences.length === 0 || !lastFetchedExperiences) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedExperiences) < ONE_HOUR;
    },
    hasValidEducations: () => {
        const { educations, lastFetchedEducations } = get();
        if (educations.length === 0 || !lastFetchedEducations) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedEducations) < ONE_HOUR;
    },
    hasValidProjects: () => {
        const { projects, lastFetchedProjects } = get();
        if (projects.length === 0 || !lastFetchedProjects) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedProjects) < ONE_HOUR;
    },
    hasValidSocialMedias: () => {
        const { lastFetchedSocialMedias } = get();
        if (!lastFetchedSocialMedias) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedSocialMedias) < ONE_HOUR;
    },
    hasValidDocuments: () => {
        const { documents, lastFetchedDocuments } = get();
        if (documents.length === 0 || !lastFetchedDocuments) return false;
        const ONE_HOUR = 60 * 60 * 1000;
        return (Date.now() - lastFetchedDocuments) < ONE_HOUR;
    },
    updateSkills: (skill: UserSkill) => {
        set((state) => {
            const existingSkillIndex = state.skills.findIndex(s => s.id === skill.id);
            let updatedSkills;
            if (existingSkillIndex !== -1) {
                updatedSkills = [...state.skills];
                updatedSkills[existingSkillIndex] = skill;
            } else {
                updatedSkills = [...state.skills, skill];
            }
            return { skills: updatedSkills };
        });
    },
    removeSkill: (skillId: number) => set((state) => ({
        skills: state.skills.filter(skill => skill.id !== skillId)
    })),
    updateExperiences: (experience: Experience) => {
        set((state) => {
            const existingExperienceIndex = state.experiences.findIndex(e => e.id === experience.id);
            let updatedExperiences;
            if (existingExperienceIndex !== -1) {
                updatedExperiences = [...state.experiences];
                updatedExperiences[existingExperienceIndex] = experience;
            } else {
                updatedExperiences = [...state.experiences, experience];
            }
            return { experiences: sortExperiencesByDate(updatedExperiences) };
        });
    },
    removeExperience: (experienceId: number) => set((state) => ({
        experiences: state.experiences.filter(experience => experience.id !== experienceId)
    })),
    updateEducations: (education: Education) => {
        set((state) => {
            const existingEducationIndex = state.educations.findIndex(e => e.id === education.id);
            let updatedEducations;
            if (existingEducationIndex !== -1) {
                updatedEducations = [...state.educations];
                updatedEducations[existingEducationIndex] = education;
            } else {
                updatedEducations = [...state.educations, education];
            }
            return { educations: updatedEducations };
        });
    },
    removeEducation: (educationId: number) => set((state) => ({
        educations: state.educations.filter(education => education.id !== educationId)
    })),
    updateProjects: (project: Project) => {
        set((state) => {
            const existingProjectIndex = state.projects.findIndex(p => p.id === project.id);
            let updatedProjects;
            if (existingProjectIndex !== -1) {
                updatedProjects = [...state.projects];
                updatedProjects[existingProjectIndex] = project;
            } else {
                updatedProjects = [...state.projects, project];
            }
            return { projects: sortProjectsByDate(updatedProjects) };
        });
    },
    removeProject: (projectId: number) => set((state) => ({
        projects: state.projects.filter(project => project.id !== projectId)
    })),
    updateSocialMedias: (social: SocialMedia) => {
        const convertType = convertEnumToSocialMediaType(social.type);
        if (convertType in get().socialMedias) {
            set((state) => ({
                socialMedias: {
                    ...state.socialMedias,
                    [convertType]: { id: social.id, url: social.url },
                },
            }));
        }
    }
}))

export default useUserStore;