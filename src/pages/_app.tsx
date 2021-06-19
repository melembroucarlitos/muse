import '@src/styles.css';

import { FC } from 'react';
import { AppProps } from 'next/app';

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <div className="w-full h-full min-w-full min-h-screen bg-gray-100">
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
