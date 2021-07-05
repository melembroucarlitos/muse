/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */
import { FC, useEffect, useRef, useState } from 'react';
import useRefAndState from '@src/hooks/useRefAndState';
import { mod } from '@src/utils/misc';
import HiHat from '../../assets/samples/TrapDrumKits/DeepTrapKit/HiHat_05_712.wav';
import Kick from '../../assets/samples/TrapDrumKits/DeepTrapKit/Kick_08_712.wav';
import Snare from '../../assets/samples/TrapDrumKits/DeepTrapKit/Snare_06_712.wav';
import Grid from './Grid';

// TODO: implement useSample hook
const Sampler: FC = () => {
  const [grid, gridCopy, gridUpdate] = useRefAndState<boolean[][]>(Array(16).fill(Array(3).fill(false)));
  const [bpm, bpmCopy, bpmUpdate] = useRefAndState<number>(80);
  const [playbackRate, playbackRateCopy, playbackRateUpdate] = useRefAndState<number>(1);

  const [kickSample, setKickSample] = useState<AudioBuffer>();
  const [hiHatSample, setHiHatSample] = useState<AudioBuffer>();
  const [snareSample, setSnareSample] = useState<AudioBuffer>();

  const audioCtx = useRef<any>();
  const setAudioCtx = (x: any) => {
    audioCtx.current = x;
  };

  const [play, setPlay] = useState<boolean>(true);

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

  // TODO: Inject the dependency and den curry da bitch
  const playSample = (audioCtxSample: AudioContext) => (sample: AudioBuffer) => (playbackRateSample: number) => (
    time = 0
  ) => {
    const sampleSource = audioCtxSample.createBufferSource();
    sampleSource.buffer = sample;
    sampleSource.playbackRate.value = playbackRateSample;
    sampleSource.connect(audioCtxSample.destination);
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      playSample(audioCtx.current)(kickSample!)(playbackRateCopy.current)(time);
    }

    if (gridCopy.current[beatNumber][1]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      playSample(audioCtx.current)(snareSample!)(playbackRateCopy.current)(time);
    }

    if (gridCopy.current[beatNumber][2]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      playSample(audioCtx.current)(hiHatSample!)(playbackRateCopy.current)(time);
    }
  };

  const scheduler = () => {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (nextNoteTime.current < audioCtx.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentNoteIdx.current, nextNoteTime.current);
      AdvanceNote();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    setTimerID(window.setTimeout(scheduler, lookahead));
  };
  // SETTING UP SEQUENCER END

  // A loading samples hook would take in a b64 file...
  // and return a play file function
  // LOADING SAMPLES HOOK BEGIN --
  const getFile = (audioContext: AudioContext) => async (file: string): Promise<AudioBuffer> => {
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
    const newAudioCtx = new AudioContext();
    setAudioCtx(newAudioCtx);

    const setUpSample = getFile(newAudioCtx);
    setUpSample(Kick).then((sample) => {
      setKickSample(sample);
    });

    setUpSample(HiHat).then((sample) => {
      setHiHatSample(sample);
    });

    setUpSample(Snare).then((sample) => {
      setSnareSample(sample);
    });
  }, []);

  const playPlay = () => {
    if (typeof audioCtx.current !== 'undefined') {
      if (play) {
        if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
        setCurrentNoteIdx(0);
        setNextNoteTime(audioCtx.current.currentTime);
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
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="bpm">Tempo</label>
        <input
          type="range"
          min="1"
          id="bpm"
          max="200"
          value={bpm}
          onChange={(e) => bpmUpdate(parseFloat(e.target.value))}
        />
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
      <Grid grid={grid} setGrid={gridUpdate} labels={['Kick', 'Snare', 'HiHat']} currentBeat={currentBeat} />
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
