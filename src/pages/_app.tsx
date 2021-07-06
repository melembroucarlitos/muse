import '@src/styles.css';

import { FC, useState } from 'react';
import { AppProps } from 'next/app';
import UserContext from '@src/contexts/UserContext';
import { userNull } from '@src/utils/misc';

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const [user, setUser] = useState<userNull>({
    id: null,
    email: null,
    username: null,
    password: null,
    createdAt: null,
    updatedAt: null,
  });

  return (
    <div className="w-full h-full min-w-full min-h-screen bg-gray-100">
      <UserContext.Provider value={{ user, setUser }}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </UserContext.Provider>
    </div>
  );
};

export default MyApp;
