import React from 'react';
import { Tile } from './Tile';

export function Composition(props) {
  return (
    <div className="flex-1 w-full flex flex-col items-start overflow-y-auto overflow-x-auto min-h-300 max-w-[500px]">
      <div className="flex flex-col items-start">
        {
          props.instance.instructions.length ?
          props.instance.instructions.map((func, indexFunc) => (
            <div key={indexFunc} style={`grid-template-columns: repeat(${func.length + 1}, 1fr);`} className="grid my-2 rounded gap-1 font-semibold text-xl select-none">
              <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-xl w-12 aspect-square flex items-center justify-center shadow-lg ring-1 ring-white/20">F{indexFunc + 1}</div>
              {func.map((inst, indexInst) => (
                <Tile
                  key={indexInst}
                  inst={inst}
                  current={props.currentInst.x === indexFunc && props.currentInst.y === indexInst}
                  onClick={() => props.onEdit(indexFunc, indexInst)}
                />
              ))}
            </div>
          )) : null
        }
      </div>
    </div>
  );
}
