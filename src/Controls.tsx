import React, { useMemo } from "react";
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  StyleProp,
  ImageStyle,
  ViewStyle,
} from "react-native";
import styles from "./MediaControls.style";
import { getPlayerStateIcon as defaultGetPlayerStateIcon } from "./utils";
import { Props } from "./MediaControls";
import { PLAYER_STATES } from "./constants/playerStates";

type ControlsProps = Pick<
  Props,
  "isLoading" | "mainColor" | "playerState" | "onReplay"
> & {
  onPause: () => void;
  getPlayerStateIcon?: (playerState: PLAYER_STATES) => any;
  renderPlayButton?: (playerState: PLAYER_STATES) => JSX.Element;
  playButtonStyle?: StyleProp<ImageStyle>;
  playButtonContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const Controls = ({
  isLoading,
  mainColor,
  playerState,
  renderPlayButton,
  playButtonStyle,
  playButtonContainerStyle,
  containerStyle,
  onReplay,
  onPause,
  getPlayerStateIcon = defaultGetPlayerStateIcon,
}: ControlsProps) => {
  const icon = getPlayerStateIcon(playerState);
  const pressAction = playerState === PLAYER_STATES.ENDED ? onReplay : onPause;

  const content = useMemo(
    () =>
      isLoading ? (
        <ActivityIndicator size="large" color="#FFF" />
      ) : (
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: mainColor },
            playButtonContainerStyle,
          ]}
          onPress={pressAction}
          accessibilityLabel={
            PLAYER_STATES.PAUSED ? "Tap to Play" : "Tap to Pause"
          }
          accessibilityHint={"Plays and Pauses the Video"}
        >
          {renderPlayButton ? (
            renderPlayButton(playerState)
          ) : (
            <Image source={icon} style={[styles.playIcon, playButtonStyle]} />
          )}
        </TouchableOpacity>
      ),
    [
      isLoading,
      playerState,
      mainColor,
      icon,
      playButtonContainerStyle,
      playButtonStyle,
      pressAction,
      renderPlayButton,
    ],
  );

  return <View style={[styles.controlsRow, containerStyle]}>{content}</View>;
};

export { Controls };
