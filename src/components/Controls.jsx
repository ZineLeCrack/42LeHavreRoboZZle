import React from 'react';

const MIN_DELAY = 25;
const MAX_DELAY = 1500;

export function Controls(props) {
  const running = props.play && !props.paused;

  async function handleChange(event) {
    const speed = parseInt(event.target.value);
    props.setDeltaTime(MIN_DELAY + MAX_DELAY - speed);
  }

  async function handleClick() {
    props.setPlay(!running);
  }

  return (
    <div className="w-full my-2 flex justify-evenly px-4 items-center max-w-[500px]">
        <button
          onClick={() => handleClick()}
          className={`text-white rounded-xl cursor-pointer py-3 px-4 w-20 shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center ${running ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-500 hover:bg-emerald-400"}`}
        >
          <i className={`fa-solid ${running ? "fa-pause" : "fa-play"}`}/>
        </button>
        {props.play ? (
          <button
            title="Reset"
            onClick={() => props.onReset()}
            className="text-white rounded-xl cursor-pointer py-3 px-4 w-16 shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center bg-white/10 hover:bg-white/20 ring-1 ring-white/10"
          >
            <i className="fa-solid fa-stop"/>
          </button>
        ) : null}
        <input
          id="default-range"
          type="range"
          value={MIN_DELAY + MAX_DELAY - props.deltaTime}
          min={MIN_DELAY}
          max={MAX_DELAY}
          onChange={handleChange}
          className="w-1/2 h-2 cursor-pointer accent-amber-300"
        />
    </div>
  );
}
