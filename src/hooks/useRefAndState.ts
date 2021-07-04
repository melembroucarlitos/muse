/* eslint-disable react-hooks/rules-of-hooks */
import { MutableRefObject, useRef, useState } from 'react';

// eslint-disable-next-line no-unused-vars
const useRefAndState = <T>(data: T): [T, MutableRefObject<T>, (x: T) => void] => {
  const [state, setState] = useState<T>(data);
  const stateCopy = useRef<T>(data);

  const updateState = (newData: T) => {
    setState(newData);
    stateCopy.current = newData;
  };

  return [state, stateCopy, updateState];
};

export default useRefAndState;
