import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const UserVideoIntro = ({ videoSource }: { videoSource: string }) => {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.pause();
  });

  return (
    <View className="w-fullpx-4 mb-6">
      <TouchableOpacity
        activeOpacity={0.9}
        className="w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black relative"
      >
        <VideoView
          style={{ width: "100%", height: "100%" }}
          player={player}
          contentFit="cover"
          allowsPictureInPicture={false}
        />
      </TouchableOpacity>
    </View>
  );
};

export default UserVideoIntro;
