import { Icon } from "@iconify/react";
import type { AppDispatch, RootState } from "../app/store";
import { useDispatch, useSelector } from "react-redux";
import { changeSong, playToggle } from "../features/player/playerSlice";
import styles from "../styles/Player.module.css";
import { useEffect, useState } from "react";
// import { useState } from "react";

export const Player = (): JSX.Element => {
  const currentSong = useSelector((state: RootState) => state.player.currentSong);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(changeSong("ba898259-9001-44b1-a2ef-051922bcfcb3"));
  }, []);

  useEffect(() => {
    setMyAudio(new Audio(currentSong?.link));
  }, [currentSong]);

  // const [playerIsInFullscreenView, setPlayerIsInFullscreenView] = useState<boolean>(false);

  const [myAudio, setMyAudio] = useState(new Audio(currentSong?.link));

  const albumCover = <Icon icon="akar-icons:music-album-fill" color="white" width={50} />;

  const songBox = (
    <div className={styles.songBox}>
      {albumCover}
      <div className={styles.songInfo}>
        <button className={styles.title} tabIndex={0}>
          {currentSong?.title ?? "unknown"}
        </button>
        <button className={styles.author} tabIndex={0}>
          {currentSong?.author ?? "unknown"}
        </button>
      </div>
    </div>
  );

  const progressBar = <input type="range" name="progressBar" />;

  const repeatButton = (
    <button>
      <Icon icon="ph:repeat-bold" color="white" width={50} tabIndex={0} />
    </button>
  );

  const skipBackButton = (
    <button>
      <Icon icon="ph:skip-back-fill" color="white" width={50} tabIndex={0} />
    </button>
  );

  const playToggleButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        dispatch(playToggle());
        console.log(myAudio.duration);
        isPlaying ? myAudio?.pause() : myAudio?.play();
      }}
    >
      <Icon
        icon={isPlaying ? "material-symbols:pause-circle-rounded" : "material-symbols:play-circle-rounded"}
        color="white"
        width={50}
        tabIndex={0}
      />
    </button>
  );

  const skipForwardButton = (
    <button>
      <Icon icon="ph:skip-forward-fill" color="white" width={50} tabIndex={0} />
    </button>
  );

  const shuffleButton = (
    <button>
      <Icon icon="ph:shuffle-bold" color="white" width={50} tabIndex={0} />
    </button>
  );

  const controls = (
    <div className={styles.controls}>
      {progressBar}
      <div className={styles.controlButtons}>
        {repeatButton}
        {skipBackButton}
        {playToggleButton}
        {skipForwardButton}
        {shuffleButton}
      </div>
    </div>
  );

  if (currentSong?.link === undefined) return <></>;

  return (
    <div className={styles.container}>
      {songBox}
      {controls}
    </div>
  );
};
