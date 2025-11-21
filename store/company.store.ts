import { Company } from "@/type";
import { create } from "zustand";

const COMPANIES_API_URL = `http://192.168.2.29:8080/api/companies`;

interface CompanyState {
    companyInformation: Record<number, Company>;
    loadingCompanyInformation: boolean;
    lastFetchedCompanyInformation: number | null;

    fetchCompanyInformation: (companyId: number) => Promise<void>;
    getCompanyInformation: (companyId: number) => Company | null;

    isLoadingCompanyInformation: () => boolean;
    hasValidCompanyInformation: (companyId: number) => boolean;
    refreshCompanyInformation: (companyId: number) => Promise<void>;

    updateCompany: (companyId: number, companyData: Partial<Company>) => void; 
    updateCompanyLogoUrl: (companyId: number, logoUrl: string) => void;
}

const useCompanyStore = create<CompanyState>((set, get) => ({
    companyInformation: {},
    loadingCompanyInformation: false,
    lastFetchedCompanyInformation: null,

    fetchCompanyInformation: async (companyId: number) => {
        const state = get()
        if (state.isLoadingCompanyInformation()) return;
        set({ loadingCompanyInformation: true });
        try {
            const response = await fetch(`${COMPANIES_API_URL}/${companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json() as Company;
            set((state) => ({
                companyInformation: {
                    ...state.companyInformation,
                    [companyId]: data,
                },
                lastFetchedCompanyInformation: Date.now(),
            }));
        } catch (error) {
            console.error("Error fetching company information:", error);
        } finally {
            set({ loadingCompanyInformation: false });
        }
    },

    getCompanyInformation: (companyId: number) => {
        const state = get();
        return state.companyInformation[companyId] || null;
    },
    isLoadingCompanyInformation: () => {
        const state = get();
        return state.loadingCompanyInformation;
    },
    
    hasValidCompanyInformation: (companyId: number) => {
        const state = get();
        const companyData = state.companyInformation[companyId];
        if (!companyData) return false;
        const THIRTY_MINUTES = 30 * 60 * 1000;
        return state.lastFetchedCompanyInformation !== null &&
            (Date.now() - state.lastFetchedCompanyInformation) < THIRTY_MINUTES;
    },

    refreshCompanyInformation: async (companyId: number) => {
        const newState = get();
        delete newState.companyInformation[companyId];
        set({ companyInformation: newState.companyInformation });
        await newState.fetchCompanyInformation(companyId);
    },

    updateCompany: (companyId: number, companyData: Partial<Company>) => {
        const state = get();
        const existingData = state.companyInformation[companyId] || {};
        const updatedData = { ...existingData, ...companyData };
        set((state) => ({
            companyInformation: {
                ...state.companyInformation,
                [companyId]: updatedData,
            },
        }));
    },

    updateCompanyLogoUrl: (companyId: number, logoUrl: string) => {
        const state = get();
        const existingData = state.companyInformation[companyId] || {};
        const updatedData = { ...existingData, profileImageUrl: logoUrl };
        set((state) => ({
            companyInformation: {
                ...state.companyInformation,
                [companyId]: updatedData,
            },
        }));
    }
}))

export default useCompanyStore;