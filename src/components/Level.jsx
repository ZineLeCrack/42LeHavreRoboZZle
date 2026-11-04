import React from 'react';

export function Level(props) {
  return (
    <div className="cursor-pointer w-full flex justify-center mt-2 select-none"
	  	 onClick={() => {props.setLevel(1)}}>
      <div className="px-5 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-white font-bold tracking-widest text-sm uppercase">
        Level <span className="text-amber-300 text-lg ml-1">{props.level}</span>
      </div>
    </div>
  );
}
