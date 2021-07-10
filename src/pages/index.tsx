/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import { FC, useContext, useState } from 'react';
import withAuth from '@src/components/hoc/withAuth';
import Room from '@src/components/Room';
import Sampler from '@src/components/Sampler';
import UserContext from '@src/contexts/UserContext';
import useRefAndState from '@src/hooks/useRefAndState';

// TODO: useReducer && useContext refactor
const Home: FC = () => {
  const { user } = useContext(UserContext);
  const { username } = user;

  const [grid, gridCopy, gridUpdate] = useRefAndState<boolean[][]>(Array(16).fill(Array(3).fill(false)));
  const [bpm, bpmCopy, bpmUpdate] = useRefAndState<number>(80);
  const [playbackRate, playbackRateCopy, playbackRateUpdate] = useRefAndState<number>(1);

  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  // TODO: count the max number of changes per turn
  // TODO: update animation
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 font-normal">
      <span>Welcome {username}!</span>
      <Sampler
        bpm={bpm}
        bpmCopy={bpmCopy}
        bpmUpdate={bpmUpdate}
        grid={grid}
        gridCopy={gridCopy}
        gridUpdate={gridUpdate}
        playbackRate={playbackRate}
        playbackRateCopy={playbackRateCopy}
        playbackRateUpdate={playbackRateUpdate}
        isFrozen={isFrozen}
      />
      <Room
        grid={grid}
        bpm={bpm}
        playbackRate={playbackRate}
        setIsFrozen={setIsFrozen}
        gridUpdate={gridUpdate}
        bpmUpdate={bpmUpdate}
        playbackRateUpdate={playbackRateUpdate}
      />
    </div>
  );
};

export default withAuth(Home);
