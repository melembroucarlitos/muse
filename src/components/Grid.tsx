/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import { Dispatch, FC, SetStateAction } from 'react';

type GridProps = {
  grid: boolean[][];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setGrid: Dispatch<SetStateAction<boolean[][]>> | any;
  labels: string[];
  currentBeat: number;
};

const Grid: FC<GridProps> = ({ grid, setGrid, labels, currentBeat }) => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        {labels.map((label, idx) => (
          <span key={label} className={`items-baseline w-4 h-4 ${idx !== 0 ? 'mt-1' : ''} -ml-12 text-black`}>
            {label}
          </span>
        ))}
      </div>
      {grid.map((beat, beatIdx) => (
        <div
          key={beatIdx}
          className={`flex flex-col 
                     ${beatIdx % 4 === 0 ? 'ml-2' : 'ml-1'}`}
        >
          {beat.map((btn, btnIdx) => (
            <button
              type="button"
              key={btnIdx}
              className={`mt-1 w-4 h-4 focus:outline-none border-2 
                         ${beatIdx === currentBeat ? 'border-red-900' : 'border-gray-900'}
                         ${btn ? 'bg-yellow-500' : 'bg-gray-600'}`}
              onClick={() =>
                setGrid(
                  grid.map((beet, beatIndex) =>
                    beet.map((_, noteIndex) =>
                      beatIndex === beatIdx && noteIndex === btnIdx
                        ? !grid[beatIndex][noteIndex]
                        : grid[beatIndex][noteIndex]
                    )
                  )
                )
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;

// <div className="flex flex-col">
// <span className="items-baseline w-4 h-4 text-gray-500">2</span>
// <span className="items-baseline w-4 h-4 mt-1 text-black">1</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">5</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">4</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">3</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">2</span>
// <span className="items-baseline w-4 h-4 mt-1 text-black">1</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">5</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">4</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">3</span>
// <span className="items-baseline w-4 h-4 mt-1 text-gray-500">2</span>
// <span className="items-baseline w-4 h-4 mt-1 text-black">1</span>
// </div>
