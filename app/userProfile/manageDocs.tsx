import BackBar from "@/components/BackBar";
import DocumentItem from "@/components/DocumentItem";
import { UserDocumentType } from "@/constants";
import { useDocuments } from "@/lib/services/useDocuments";
import useAuthStore from "@/store/auth.store";
import { AllUserDocuments, User, UserDocument } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const documentTypes = [
  { label: "Resume", value: UserDocumentType.RESUME, icon: "file-text", color: "#3b82f6" },
  { label: "Cover Letter", value: UserDocumentType.COVER_LETTER, icon: "mail", color: "#8b5cf6" },
  { label: "Certificate", value: UserDocumentType.CERTIFICATE, icon: "award", color: "#f59e0b" },
  { label: "Transcript", value: UserDocumentType.TRANSCRIPT, icon: "book", color: "#10b981" },
  { label: "Recommendation", value: UserDocumentType.RECOMMENDATION, icon: "star", color: "#ef4444" },
];

const ManageDocuments = () => {
  const { isLoading, user: authUser } = useAuthStore();
  const { data: userDocs, isLoading: isLoadingDocs } = useDocuments();
  const [userDocuments, setUserDocuments] = useState<AllUserDocuments | null>(null);
  const user = authUser as User | null;
  useEffect(() => {
    if (userDocs && !isLoadingDocs) {
      const resumeDocuments: UserDocument[] = userDocs.filter((doc) => doc.documentType === UserDocumentType.RESUME);
      const coverLetterDocuments: UserDocument[] = userDocs.filter(
        (doc) => doc.documentType === UserDocumentType.COVER_LETTER
      );
      const certificateDocuments: UserDocument[] = userDocs.filter(
        (doc) => doc.documentType === UserDocumentType.CERTIFICATE
      );
      const transcriptDocuments: UserDocument[] = userDocs.filter(
        (doc) => doc.documentType === UserDocumentType.TRANSCRIPT
      );
      const recommendationDocuments: UserDocument[] = userDocs.filter(
        (doc) => doc.documentType === UserDocumentType.RECOMMENDATION
      );
      setUserDocuments({
        resumeDocuments,
        coverLetterDocuments,
        certificateDocuments,
        transcriptDocuments,
        recommendationDocuments,
      });
    }
  }, [userDocs, isLoadingDocs]);

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find((doc) => doc.value === type) || documentTypes[0];
  };

  const renderDocumentFlatList = ({
    title,
    documents,
    type,
  }: {
    title: string;
    documents: UserDocument[];
    type: string;
  }) => {
    const docInfo = getDocumentTypeInfo(type);

    return (
      <View
        className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${docInfo.color}20` }}
          >
            <Feather name={docInfo.icon as any} size={20} color={docInfo.color} />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-gray-900">{title}</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {documents.length === 0 ? (
          <View className="items-center py-8">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${docInfo.color}10` }}
            >
              <Feather name={docInfo.icon as any} size={24} color={docInfo.color} />
            </View>
            <Text className="font-quicksand-semibold text-gray-700 mb-2">No documents yet</Text>
            <Text className="font-quicksand-medium text-sm text-gray-500 text-center">
              Upload your first {title.toLowerCase()} to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={({ item }) => (
              <DocumentItem
                document={item}
                actionIcon="edit"
                customAction={() => {}}
                standOut={item.documentType === UserDocumentType.RESUME && item.id === user?.primaryResume?.id}
              />
            )}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="w-4" />}
            contentContainerStyle={{ paddingHorizontal: 2 }}
          />
        )}
      </View>
    );
  };

  const getTotalDocumentsCount = () => {
    if (!userDocuments) return 0;
    return (
      (userDocuments?.resumeDocuments?.length || 0) +
      (userDocuments?.coverLetterDocuments?.length || 0) +
      (userDocuments?.certificateDocuments?.length || 0) +
      (userDocuments?.transcriptDocuments?.length || 0) +
      (userDocuments?.recommendationDocuments?.length || 0)
    );
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <BackBar
        label="Manage Documents"
        optionalThirdItem={
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-green-500 items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => router.push("/userProfile/uploadNewDoc")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="white" />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text className="font-quicksand-semibold text-lg text-gray-700">Loading documents...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              className="mx-4 mb-6 bg-white rounded-2xl p-5 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center gap-3 mb-4">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                  <Feather name="folder" size={24} color="#6366f1" />
                </View>
                <View>
                  <Text className="font-quicksand-bold text-xl text-gray-900">Document Library</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    Manage all your professional documents
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <Text className="font-quicksand-bold text-2xl text-blue-600">{getTotalDocumentsCount()}</Text>
                  <Text className="font-quicksand-medium text-sm text-blue-700">Total Documents</Text>
                </View>
              </View>
            </View>

            {renderDocumentFlatList({
              title: "My Resumes",
              documents: userDocuments?.resumeDocuments || [],
              type: UserDocumentType.RESUME,
            })}

            {renderDocumentFlatList({
              title: "My Cover Letters",
              documents: userDocuments?.coverLetterDocuments || [],
              type: UserDocumentType.COVER_LETTER,
            })}

            {renderDocumentFlatList({
              title: "My Certificates",
              documents: userDocuments?.certificateDocuments || [],
              type: UserDocumentType.CERTIFICATE,
            })}

            {renderDocumentFlatList({
              title: "My Transcripts",
              documents: userDocuments?.transcriptDocuments || [],
              type: UserDocumentType.TRANSCRIPT,
            })}

            {renderDocumentFlatList({
              title: "My Recommendations",
              documents: userDocuments?.recommendationDocuments || [],
              type: UserDocumentType.RECOMMENDATION,
            })}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default ManageDocuments;
