import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Animated,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  ViewStyle,
  ImageStyle,
  StyleProp,
} from "react-native";
import styles from "./MediaControls.style";
import { PLAYER_STATES } from "./constants/playerStates";
import { Controls } from "./Controls";
import { Slider, CustomSliderStyle } from "./Slider";
import { Toolbar } from "./Toolbar";

export type Props = {
  children: React.ReactNode;
  containerStyle: ViewStyle;
  duration: number;
  fadeOutDelay?: number;
  isFullScreen: boolean;
  isLoading: boolean;
  mainColor: string;
  onFullScreen?: (event: GestureResponderEvent) => void;
  onPaused: (playerState: PLAYER_STATES) => void;
  onReplay: () => void;
  onSeek: (value: number) => void;
  onSeeking: (value: number) => void;
  playerState: PLAYER_STATES;
  progress: number;
  showOnStart?: boolean;
  sliderStyle?: CustomSliderStyle;
  toolbarStyle?: ViewStyle;
  getPlayerStateIcon?: (playerState: PLAYER_STATES) => any;
  renderPlayButton?: (playerState: PLAYER_STATES) => JSX.Element;
  playButtonStyle?: StyleProp<ImageStyle>;
  playButtonInnerContainerStyle?: StyleProp<ViewStyle>;
  playButtonContainerStyle?: StyleProp<ViewStyle>;
  renderCloseButton?: () => JSX.Element;
  fadeInDuration?: number;
  fadeOutDuration?: number;
};

const DEFAULT_FADE_IN_DURATION = 300;
const DEFAULT_FADE_OUT_DURATION = 300;

const MediaControls = (props: Props) => {
  const {
    children,
    containerStyle: customContainerStyle = {},
    duration,
    fadeOutDelay = 5000,
    isLoading = false,
    mainColor = "rgba(12, 83, 175, 0.9)",
    onFullScreen,
    onReplay: onReplayCallback,
    onSeek,
    onSeeking,
    playerState,
    progress,
    showOnStart = true,
    sliderStyle, // defaults are applied in Slider.tsx
    toolbarStyle: customToolbarStyle = {},
    getPlayerStateIcon,
    renderPlayButton,
    playButtonStyle,
    playButtonContainerStyle,
    playButtonInnerContainerStyle,
    renderCloseButton,
    fadeInDuration = DEFAULT_FADE_IN_DURATION,
    fadeOutDuration = DEFAULT_FADE_OUT_DURATION,
  } = props;
  const { initialOpacity, initialIsVisible } = (() => {
    if (showOnStart) {
      return {
        initialOpacity: 1,
        initialIsVisible: true,
      };
    }

    return {
      initialOpacity: 0,
      initialIsVisible: false,
    };
  })();

  const [opacity] = useState(new Animated.Value(initialOpacity));
  const [isVisible, setIsVisible] = useState(initialIsVisible);

  const fadeOutControls = useCallback(
    (delay = 0) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: fadeOutDuration,
        delay,
        useNativeDriver: false,
      }).start(result => {
        /* I noticed that the callback is called twice, when it is invoked and when it completely finished
      This prevents some flickering */
        if (result.finished) {
          setIsVisible(false);
        }
      });
    },
    [opacity, fadeOutDuration],
  );

  const fadeInControls = (loop = true) => {
    setIsVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: fadeInDuration,
      delay: 0,
      useNativeDriver: false,
    }).start(() => {
      if (loop) {
        fadeOutControls(fadeOutDelay);
      }
    });
  };

  const onReplay = () => {
    fadeOutControls(fadeOutDelay);
    onReplayCallback();
  };

  const cancelAnimation = () => opacity.stopAnimation(() => setIsVisible(true));

  const onPause = () => {
    const { playerState, onPaused } = props;
    const { PLAYING, PAUSED, ENDED } = PLAYER_STATES;
    switch (playerState) {
      case PLAYING: {
        cancelAnimation();
        break;
      }
      case PAUSED: {
        fadeOutControls(fadeOutDelay);
        break;
      }
      case ENDED:
        break;
    }

    const newPlayerState = playerState === PLAYING ? PAUSED : PLAYING;
    return onPaused(newPlayerState);
  };

  const toggleControls = () => {
    // value is the last value of the animation when stop animation was called.
    // As this is an opacity effect, I (Charlie) used the value (0 or 1) as a boolean
    opacity.stopAnimation((value: number) => {
      setIsVisible(!!value);
      return value ? fadeOutControls() : fadeInControls();
    });
  };

  useEffect(() => {
    fadeOutControls(fadeOutDelay);
  }, [fadeOutControls, fadeOutDelay]);

  return (
    <TouchableWithoutFeedback accessible={false} onPress={toggleControls}>
      <Animated.View
        style={[styles.container, customContainerStyle, { opacity }]}
      >
        {isVisible && (
          <View style={[styles.container, customContainerStyle]}>
            <View
              style={[
                styles.controlsRow,
                styles.toolbarRow,
                customToolbarStyle,
              ]}
            >
              {children}
            </View>
            <Controls
              onPause={onPause}
              onReplay={onReplay}
              isLoading={isLoading}
              mainColor={mainColor}
              playerState={playerState}
              containerStyle={playButtonContainerStyle}
              getPlayerStateIcon={getPlayerStateIcon}
              playButtonContainerStyle={playButtonInnerContainerStyle}
              playButtonStyle={playButtonStyle}
              renderPlayButton={renderPlayButton}
            />
            <Slider
              progress={progress}
              duration={duration}
              mainColor={mainColor}
              onFullScreen={onFullScreen}
              playerState={playerState}
              onSeek={onSeek}
              onSeeking={onSeeking}
              onPause={onPause}
              customSliderStyle={sliderStyle}
            />
            {renderCloseButton ? renderCloseButton() : null}
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

MediaControls.Toolbar = Toolbar;

export default MediaControls;
