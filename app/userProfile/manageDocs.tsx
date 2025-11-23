import BackBar from "@/components/BackBar";
import DocumentItem from "@/components/DocumentItem";
import { UserDocumentType } from "@/constants";
import { documentTypes } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import { User, UserDocument } from "@/type";
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

const ManageDocuments = () => {
  const { user: authUser } = useAuthStore();
  const [viewingDocuments, setViewingDocuments] = useState<UserDocumentType>(UserDocumentType.RESUME);
  const {
    getResumeDocuments,
    getCoverLetterDocuments,
    getCertificateDocuments,
    getTranscriptDocuments,
    getRecommendationDocuments,
    fetchUserDocuments,
    hasValidDocuments,
    isLoadingDocuments,
  } = useUserStore();
  const user = authUser as User | null;

  useEffect(() => {
    if (!hasValidDocuments()) {
      fetchUserDocuments();
    }
  }, []);
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
          height: 320,
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
        {viewingDocuments === UserDocumentType.RESUME && (
          <View className="mr-4 mb-3">
            <View className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <View className="flex-row items-start gap-2">
                <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mt-0.5">
                  <Feather name="zap" size={10} color="#10b981" />
                </View>
                <Text className="font-quicksand-medium text-emerald-700 text-xs flex-1 leading-4">
                  <Text className="font-quicksand-semibold">Primary resume</Text> is used for quick apply
                </Text>
              </View>
            </View>
          </View>
        )}
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
          contentContainerStyle={{
            paddingHorizontal: 2,
            flexGrow: 1,
            minWidth: "100%",
            flexDirection: "row",
            marginBottom: 8,
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-8">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${docInfo.color}10` }}
              >
                <Feather name={docInfo.icon as any} size={24} color={docInfo.color} />
              </View>
              <Text className="font-quicksand-semibold text-gray-700 mb-2">No {title.toLowerCase()} yet</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="w-4" />}
        />
        <TouchableOpacity
          className="px-3 py-4 rounded-md"
          style={{
            backgroundColor: docInfo.color,
          }}
          onPress={() => router.push(`/userProfile/uploadNewDoc?initialType=${type}`)}
        >
          <Text className="font-quicksand-semibold text-white text-lg text-center">Add {title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const resumes = getResumeDocuments(user?.primaryResume?.id || null);
  const coverLetters = getCoverLetterDocuments();
  const certificates = getCertificateDocuments();
  const transcripts = getTranscriptDocuments();
  const recommendations = getRecommendationDocuments();

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <BackBar
        label="Manage Documents"
        optionalThirdItem={
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center"
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

      {isLoadingDocuments ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
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
              className="mx-4 mb-4 bg-white rounded-xl p-4 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                    <Feather name="folder" size={20} color="#6366f1" />
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Document Library</Text>
                    <Text className="font-quicksand-medium text-xs text-gray-600">
                      Manage your professional documents
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View className="mx-4 mb-6 flex-row flex-wrap gap-2">
              {documentTypes.map((doc) => (
                <TouchableOpacity
                  className={`px-4 py-2 rounded-xl border ${viewingDocuments === doc.value ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"}`}
                  style={{
                    shadowColor: viewingDocuments === doc.value ? "#10b981" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: viewingDocuments === doc.value ? 0.1 : 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  key={doc.value}
                  onPress={() => setViewingDocuments(doc.value)}
                >
                  <Text className="font-quicksand-semibold text-sm">{doc.label}s</Text>
                </TouchableOpacity>
              ))}
            </View>
            {viewingDocuments === UserDocumentType.RESUME &&
              renderDocumentFlatList({
                title: "Resumes",
                documents: resumes,
                type: UserDocumentType.RESUME,
              })}

            {viewingDocuments === UserDocumentType.COVER_LETTER &&
              renderDocumentFlatList({
                title: "Cover Letters",
                documents: coverLetters,
                type: UserDocumentType.COVER_LETTER,
              })}

            {viewingDocuments === UserDocumentType.CERTIFICATE &&
              renderDocumentFlatList({
                title: "Certificates",
                documents: certificates,
                type: UserDocumentType.CERTIFICATE,
              })}

            {viewingDocuments === UserDocumentType.TRANSCRIPT &&
              renderDocumentFlatList({
                title: "Transcripts",
                documents: transcripts,
                type: UserDocumentType.TRANSCRIPT,
              })}

            {viewingDocuments === UserDocumentType.RECOMMENDATION &&
              renderDocumentFlatList({
                title: "Recommendations",
                documents: recommendations,
                type: UserDocumentType.RECOMMENDATION,
              })}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default ManageDocuments;
