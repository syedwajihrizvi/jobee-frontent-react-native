import { useJobsForBusiness } from "@/lib/services/useJobs";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

const BusinessJobDetails = () => {
    const { id: jobId, companyId } = useLocalSearchParams()
    const { data: job, isLoading } = useJobsForBusiness(Number(companyId), Number(jobId))
    return (
        <SafeAreaView>
            {isLoading && <Text>Loading...</Text>}
            {job && (
                <View>
                    <Text className="text-2xl font-bold p-4">{job.title}</Text>
                    <Text className="font-quicksand-medium text-lg">{job.location}</Text>
                    <Text className="font-quicksand-semibold text-sm">${job.minSalary} - ${job.maxSalary} | {job.employmentType}</Text>
                    <Text className="font-quicksand-regular text-base my-4">{job.description}</Text>
                    {job.applications.map((application) => (
                        <View key={application.id} className="border-b border-gray-200 py-4">
                            <Text className="font-quicksand-semibold text-lg">{application.id}</Text>
                            <Text className="font-quicksand-regular text-sm">Status: {application.status}</Text>
                            <Text className="font-quicksand-regular text-sm">Applied At: {application.appliedAt}</Text>
                        </View>
                    ))}
                </View>
            )}
        </SafeAreaView>
    )
}
export default BusinessJobDetails;