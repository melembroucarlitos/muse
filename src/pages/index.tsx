/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
import { FC, useContext } from 'react';
import withAuth from '@src/components/hoc/withAuth';
import Room from '@src/components/Room';
import Sampler from '@src/components/Sampler';
import UserContext from '@src/contexts/UserContext';

const Home: FC = () => {
  const { user } = useContext(UserContext);
  const { username } = user;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 font-normal">
      <span>Welcome {username}!</span>
      <Sampler />
      <Room />
    </div>
  );
};

export default withAuth(Home);
