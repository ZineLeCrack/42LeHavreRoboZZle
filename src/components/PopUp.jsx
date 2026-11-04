import React from 'react';

export function PopUp({ active, setActive, button, actionButton, game, children }) {
  const handleClick = () => {
    actionButton(game);
    setActive(false);
  }
  
  return (
    <div className={`${active ? null : "hidden"} w-screen h-screen absolute bg-black/70 backdrop-blur-sm top-0 left-0 z-50 flex justify-center items-center p-4`}>
      <div className='text-white px-8 py-7 flex flex-col items-center gap-4 bg-gradient-to-b from-indigo-900/90 to-slate-900/95 ring-1 ring-white/15 rounded-2xl shadow-2xl'>
        <p className="text-xl font-semibold text-center">{children}</p>
        <button onClick={() => {handleClick()}} className="px-8 py-3 shadow-lg font-bold rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 hover:brightness-110 transition-all">{button}</button>
      </div>
    </div>
  );
}
