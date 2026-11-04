import React from 'react';

const BASE = "rounded-xl cursor-pointer h-full aspect-square mx-1 shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center";

export function Toolbar(props) {

  const handleClick = (str) => {
    props.setSelected(str);
  };

  const style = (name) => `${BASE} ${props.selected === name ? "ring-2 ring-amber-300" : "ring-1 ring-white/10"}`;

  return (
    <div className="w-full max-w-[500px] h-28 text-white text-2xl flex flex-col items-center justify-center bg-white/5 ring-1 ring-white/10 rounded-2xl py-2 mb-2 shadow-xl overflow-y-auto">
      <div className="h-1/2 flex items-center justify-center mb-2">
        <div className={`${style('forward')} bg-white/10 hover:bg-white/20`} onClick={() => handleClick('forward')}>
          <i className="fa-solid fa-arrow-up"/>
        </div>
        <div className={`${style('left')} bg-white/10 hover:bg-white/20`} onClick={() => handleClick('left')}>
          <i className="fa-solid fa-arrow-rotate-left"/>
        </div>
        <div className={`${style('right')} bg-white/10 hover:bg-white/20`} onClick={() => handleClick('right')}>
          <i className="fa-solid fa-arrow-rotate-right"/>
        </div>

        <div className={`${style('blue')} bg-blue-500 hover:bg-blue-400`} onClick={() => handleClick('blue')}></div>
        <div className={`${style('red')} bg-red-500 hover:bg-red-400`} onClick={() => handleClick('red')}></div>
        <div className={`${style('green')} bg-green-500 hover:bg-green-400`} onClick={() => handleClick('green')}></div>
        <div className={`${style('gray')} bg-slate-400/30 hover:bg-slate-400/40`} onClick={() => handleClick('gray')}></div>
      </div>
      <div className="h-1/2 flex items-center justify-center flex-wrap w-full">
        <div className={`${style('cancel')} mb-2 bg-white/10 hover:bg-white/20`} onClick={() => handleClick('cancel')}>
          <i className="text-rose-400 fa-solid fa-xmark"/>
        </div>
        {props.functions.length ? props.functions.map((inst, index) => (
          <div key={index} className={`${style('F' + (index + 1))} mb-2 bg-white/10 hover:bg-white/20 font-bold text-xl`} onClick={() => handleClick('F' + (index + 1))}>F{index + 1}</div>
        )) : null}
      </div>
    </div>
  );
}
