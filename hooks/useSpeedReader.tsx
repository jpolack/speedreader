import { useState, useEffect } from 'react';

const calculatePivotIndex = (x) => (x.length !== 1 ? Math.floor(x.length / 7 + 1) : 0);

export type SpeedReaderMatch = {
  pattern: RegExp
  durationInSec: number
}

export const defaultPausing = [{
  pattern: /,|-/,
  durationInSec: 0.25,
}, {
  pattern: /\.|!|\?|:|;/,
  durationInSec: 0.5,
}, {
  pattern: /\r?\n/,
  durationInSec: 1,
}];

export type SpeedReaderDisplayState = {
  word: string
  pivotElementIndex: number
}

export type SpeedReaderProps = {
  text: string
  speed: number
  pauseConfig?: SpeedReaderMatch[]
  wordIndex?: number
  isPaused?: boolean
  isFinished?: () => void
  onRenderWord?: (word: SpeedReaderDisplayState, index: number, count: number) => void
}

export const useSpeedReader = ({
  text = '',
  speed = 400,
  pauseConfig = [],
  wordIndex = 0,
  isPaused = false,
  isFinished = () => { },
  onRenderWord = () => { },
}: SpeedReaderProps): SpeedReaderDisplayState => {
  const words = text.trim().replace(/([\r\n]+)/gm, '$1 ').split(/[^\S\r\n]+/);

  if (words.length <= 1) {
    return {
      word: '',
      pivotElementIndex: -1,
    };
  }

  if (wordIndex > words.length - 1) {
    console.warn('wordIndex must not be larger than wordcount');
    return {
      word: '',
      pivotElementIndex: -1,
    };
  }

  const [currentIndex, setCurrentIndex] = useState<number>(wordIndex);
  const word = words[currentIndex];

  const play = (offset: number = 0) => {
    setTimeout(() => {
      if (currentIndex === words.length - 1) {
        isFinished();
        return;
      }
      setCurrentIndex(currentIndex + 1);
    }, (60000 / speed) + (offset * 1000));
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    if (pauseConfig.length > 0) {
      const matchedConfig = pauseConfig.find((matcher) => matcher.pattern.test(word));
      if (matchedConfig) {
        play(matchedConfig.durationInSec);
        return;
      }
    }
    play(0);
  }, [isPaused, currentIndex]);

  onRenderWord({
    word,
    pivotElementIndex: calculatePivotIndex(word),
  }, currentIndex, words.length);

  return {
    word,
    pivotElementIndex: calculatePivotIndex(word),
  };
};

export default useSpeedReader;
