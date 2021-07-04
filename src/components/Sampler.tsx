/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */
import { FC, useEffect, useRef, useState } from 'react';
import useRefAndState from '@src/hooks/useRefAndState';
import Kick from '../../assets/samples/TrapDrumKits/DeepTrapKit/Kick_08_712.wav';
import Grid from './Grid';

// TODO: Implement live grid update functionality
const Sampler: FC = () => {
  const [grid, gridCopy, gridUpdate] = useRefAndState<boolean[][]>(Array(16).fill(Array(4).fill(false)));
  const [bpm, bpmCopy, bpmUpdate] = useRefAndState<number>(80);
  const [playbackRate, playbackRateCopy, playbackRateUpdate] = useRefAndState<number>(1);

  const [play, setPlay] = useState<boolean>(true);

  const [testSample, setTestSample] = useState<AudioBuffer>();
  const testAudioCtx = useRef<any>();
  const setTestAudioCtx = (x: any) => {
    testAudioCtx.current = x;
  };

  // UTILS BEGIN
  const mod = (a: number, n: number): number => ((a % n) + n) % n;
  // UTILS END

  // SEQUENCER STATE BEGIN
  const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  const [currentBeat, setCurrentBeat] = useState<number>(-1);
  const currentNoteIdx = useRef<number>(0);
  const setCurrentNoteIdx = (x: number | undefined = undefined) => {
    if (x === undefined) {
      if (currentNoteIdx.current === 15) {
        currentNoteIdx.current = 0;
        setCurrentBeat(mod(currentNoteIdx.current - 1, 16));
      } else {
        currentNoteIdx.current += 1;
        setCurrentBeat(mod(currentNoteIdx.current - 1, 16));
      }
    } else {
      currentNoteIdx.current = x;
      setCurrentBeat(mod(currentNoteIdx.current - 1, 16));
    }
  };

  const nextNoteTime = useRef<number>(0.0); // when the next note is due.
  const setNextNoteTime = (x: any) => {
    nextNoteTime.current = x;
  };

  const timerID = useRef<number>(0);
  const setTimerID = (x: any) => {
    timerID.current = x;
  };
  // SEQUENCER STATE END

  const playKick = (time = 0) => {
    const sampleSource = testAudioCtx.current.createBufferSource();
    sampleSource.buffer = testSample;
    sampleSource.playbackRate.value = playbackRateCopy.current;
    sampleSource.connect(testAudioCtx.current.destination);
    sampleSource.start(time);

    return sampleSource;
  };

  // SETTING UP SEQUENCER BEGIN
  const AdvanceNote = () => {
    const secondsPerTick = 60.0 / (bpmCopy.current * 4);

    setNextNoteTime(nextNoteTime.current + secondsPerTick);

    // Advance the beat number, wrap to zero
    setCurrentNoteIdx();
  };

  const scheduleNote = (beatNumber: number, time: number) => {
    if (gridCopy.current[beatNumber][0]) {
      playKick(time);
    }
  };

  const scheduler = () => {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (nextNoteTime.current < testAudioCtx.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentNoteIdx.current, nextNoteTime.current);
      AdvanceNote();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    setTimerID(window.setTimeout(scheduler, lookahead));
  };
  // SETTING UP SEQUENCER END

  // LOADING SAMPLES HOOK BEGIN --
  const getFile = async (file: string, audioContext: AudioContext) => {
    const byteCharacters = atob(file.slice(24));
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const boobs = new Blob([byteArray], { type: 'audio/basic' });
    const arrayBuffer = await boobs.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  };
  // LOADING SAMPLES HOOK END

  // sets the audio context and sample on component mount
  useEffect(() => {
    const { AudioContext } = window;
    const audioCtx = new AudioContext();

    const setUpSample = (file: string): Promise<AudioBuffer> => getFile(file, audioCtx);

    setUpSample(Kick).then((sample) => {
      setTestSample(sample);
      setTestAudioCtx(audioCtx);
    });
  }, []);

  const playPlay = () => {
    if (typeof testAudioCtx.current !== 'undefined') {
      if (play) {
        if (testAudioCtx.current.state === 'suspended') testAudioCtx.current.resume();
        setCurrentNoteIdx(0);
        setNextNoteTime(testAudioCtx.current.currentTime);
        scheduler();
        setPlay(!play);
      } else {
        window.clearTimeout(timerID.current);
        setPlay(!play);
      }
    }
  };

  return (
    <div>
      <div className="flex">
        <input type="range" min="1" max="200" value={bpm} onChange={(e) => bpmUpdate(parseFloat(e.target.value))} />
        <span className="ml-1">{bpm} bpm</span>
      </div>
      <div className="flex">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="rate">Rate</label>
        <input
          name="rate"
          id="rate"
          type="range"
          min="0.1"
          max="2"
          value={playbackRate}
          onChange={(ev) => playbackRateUpdate(parseFloat(ev.target.value))}
          step="0.1"
          className="ml-1"
        />
        <span className="ml-1">{playbackRate}</span>
      </div>
      <Grid grid={grid} setGrid={gridUpdate} labels={['Kick', 'Snare', 'HiHat', 'Stick']} currentBeat={currentBeat} />
      <button
        type="button"
        className="px-1 mt-2 bg-gray-400 rounded-sm"
        onClick={() => {
          playPlay();
          if (!play) setCurrentBeat(-1);
        }}
      >
        {play ? 'Start' : 'Stop'} Sequencer
      </button>
    </div>
  );
};

export default Sampler;
