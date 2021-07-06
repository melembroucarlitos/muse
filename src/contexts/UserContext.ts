import { createContext, Dispatch, SetStateAction } from 'react';
import { userNull } from '@src/utils/misc';

// eslint-disable-next-line react-hooks/rules-of-hooks
const UserContext = createContext<{ user: userNull; setUser: Dispatch<SetStateAction<userNull>> | null }>({
  user: {
    id: null,
    email: null,
    username: null,
    password: null,
    createdAt: null,
    updatedAt: null,
  },
  setUser: null,
});

export default UserContext;
