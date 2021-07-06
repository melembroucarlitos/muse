/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { useRouter } from 'next/router';
import UserContext from '@src/contexts/UserContext';

// TODO: Use a version of this where we actually check back with the server whether the user is authorized
const withAuth = (WrappedComponent: any) => {
  return (props: any): any => {
    // checks whether we are on client / browser or server.
    if (typeof window !== 'undefined') {
      const Router = useRouter();

      const { user } = useContext(UserContext);

      // If there is no access token we redirect to "/" page.
      if (user.username === null) {
        Router.replace('/login');
        return null;
      }

      // If this is an accessToken we just render the component that was passed with all its props

      // eslint-disable-next-line react/jsx-props-no-spreading
      return <WrappedComponent {...props} />;
    }

    // If we are on server, return null
    return null;
  };
};

export default withAuth;
