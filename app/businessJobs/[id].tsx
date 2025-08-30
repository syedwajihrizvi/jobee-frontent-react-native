import BackBar from "@/components/BackBar";
import { useJobsForBusiness, useShortListedCandidatesForJob } from "@/lib/services/useJobs";
import { formatDate } from "@/lib/utils";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

const BusinessJobDetails = () => {
    const { id: jobId, companyId } = useLocalSearchParams()
    const { data: job, isLoading } = useJobsForBusiness(Number(companyId), Number(jobId))
    const { data: shortListedCandidates, isLoading: loadingShortListedCandidates } = useShortListedCandidatesForJob(Number(jobId))
    return (
        <SafeAreaView className="flex-1 bg-white relative">
            <BackBar label="Job Details"/>
            {isLoading && <ActivityIndicator size="large" />}
            {job && (
            <View className="p-4">
                <View className="flex-row items-start justify-between">
                    <View>
                        <Text className="text-2xl font-bold">{job.title}</Text>
                        <Text className="font-quicksand-medium text-lg">{job.location}</Text>
                        <Text className="font-quicksand-semibold text-sm">${job.minSalary} - ${job.maxSalary} | {job.employmentType}</Text>
                        <Text className="font-quicksand-semibold text-sm">Posted on {formatDate(job.createdAt)}</Text>
                    </View>
                    <View className="gap-2">
                        <TouchableOpacity onPress={() => router.push(`/businessJobs/applications/${jobId}`)}>
                            <Text className="font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full">
                                {job.applicants} Applicants
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('View Shortlist')}>
                            <Text className="font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full">
                                {loadingShortListedCandidates ? 'Loading...' : `${shortListedCandidates?.length || 0} Shortlisted`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="divider my-4"/>
                <View>
                    <Text className="font-quicksand-bold text-xl">Job Description</Text>
                    <Text className="font-quicksand-regular text-base">{job.description}</Text>
                </View>
                <View className="divider my-4"/>
                <View>
                    <Text className="font-quicksand-bold text-xl mb-2">Tags</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {job.tags.map(tag => (
                            <View key={tag.id} className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-blue-800 font-quicksand-medium">{tag.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View className="divider my-4"/>
                <View>
                    <Text className="font-quicksand-bold text-xl">Chosen Candidates</Text>
                </View>
                <View className="divider my-4"/>
                <View>
                    <Text className="font-quicksand-bold text-xl">Upcoming Interviews</Text>
                </View>
            </View>
            )}
            <View className="w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center">
                <TouchableOpacity 
                className='apply-button w-1/2 items-center justify-center h-14'
                onPress={() => router.push(`/businessJobs/applications/${jobId}`)}>
                    <Text className='font-quicksand-semibold text-md'>
                        View Applicants
                    </Text>
                </TouchableOpacity>
                {shortListedCandidates && shortListedCandidates.length > 0 && (
                    <TouchableOpacity 
                    className='apply-button w-1/2 items-center justify-center h-14'
                    onPress={() => router.push(`/businessJobs/applications/${jobId}?shortListed=true`)}>
                        <Text className='font-quicksand-semibold text-md'>
                            View Shortlist
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    )
}
export default BusinessJobDetails;