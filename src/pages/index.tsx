// index.tsx
import { FC } from 'react';
import HelloWorld from '@src/components/HelloWorld';

const Home: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 font-normal">
      <HelloWorld />
    </div>
  );
};

export default Home;
