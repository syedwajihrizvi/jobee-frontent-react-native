import { UserDocument } from "@/type";
import React, { ReactNode, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CollapsibleSection from "./CollapsibleSection";
import DocumentItem from "./DocumentItem";

type Props = {
  title: string;
  documents: UserDocument[];
  icon: ReactNode;
  ownerName: string;
};

const DocumentSection = ({ title, documents, icon, ownerName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CollapsibleSection
      title={title}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      icon={icon}
      titleSize="text-md"
    >
      <FlatList
        data={documents}
        horizontal
        ItemSeparatorComponent={() => <View className="w-4" />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 2,
          flexGrow: 1,
          minWidth: "100%",
          flexDirection: "row",
          marginBottom: 8,
        }}
        renderItem={({ item }) => (
          <DocumentItem
            canEdit={false}
            document={item}
            customAction={() => {}}
            otherPartyName={ownerName}
            canDownload={true}
            canEmail={true}
          />
        )}
      />
    </CollapsibleSection>
  );
};

export default DocumentSection;
