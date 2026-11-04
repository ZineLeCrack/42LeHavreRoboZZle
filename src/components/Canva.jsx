import React from 'react';
import '../index.css';
import { useEffect, useState } from 'preact/hooks';
import { THEME } from '../app';
import { Rocket, Star } from './Sprites';

const CELL_COLORS = {
  b: "bg-gradient-to-br from-sky-400 to-blue-600 ring-1 ring-inset ring-white/30",
  r: "bg-gradient-to-br from-rose-400 to-red-600 ring-1 ring-inset ring-white/30",
  g: "bg-gradient-to-br from-lime-400 to-green-600 ring-1 ring-inset ring-white/30",
};

const THEME_COLORS = {
  b: "from-blue-500 to-blue-600",
  r: "from-red-500 to-red-600",
  g: "from-lime-500 to-lime-600",
};

export function Canva(props) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (props.data.map.length) {
        const width = props.data.map[0].length;
        const height = props.data.map.length;
        setDimension({width, height});
    }
  }, [props.data.map]);

  function getAngle(angle) {
    if (angle == "right")
        return 0;
    else if (angle == "left")
        return 180;
    else if (angle == "down")
        return 90;
    else if (angle == "up")
        return 270;
  }

  function renderCell(cell, x, y) {
    const isShip = x == props.data.x && y == props.data.y;
    const hasStar = cell == cell.toUpperCase() && cell != ' ';

    if (THEME) {
      const icon = isShip ? `player-${getAngle(props.data.dir)}` : (hasStar ? "collectible" : "");
      return (
        <div
          key={`${x}-${y}`}
          className={`${THEME_COLORS[cell.toLowerCase()] ?? "tile"} aspect-w-1 aspect-h-1 bg-gradient-to-br flex justify-center items-center`}
        >
          <i className={`${icon} fa-solid flex items-center justify-center w-4/5 h-4/5 text-white`}></i>
        </div>
      );
    }

    const base = CELL_COLORS[cell.toLowerCase()]
      ?? (cell == ' ' ? "bg-white/[0.03]" : "bg-slate-500/30 ring-1 ring-inset ring-white/10");

    return (
      <div key={`${x}-${y}`} className="p-0.5">
        <div className={`${base} w-full h-full rounded-lg flex justify-center items-center`}>
          {isShip ? <Rocket angle={getAngle(props.data.dir)} /> : (hasStar ? <Star /> : null)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] my-4 p-2 rounded-2xl bg-black/30 ring-1 ring-white/10 shadow-2xl">
      <div
        style={`grid-template-columns: repeat(${dimension.width}, 1fr); grid-template-rows: repeat(${dimension.height}, 1fr); aspect-ratio: ${dimension.width}/${dimension.height};`}
        className="grid w-full"
      >
        {props.data.map.map((line, y) => (
          line.split("").map((cell, x) => renderCell(cell, x, y))
        ))}
      </div>
    </div>
  );
}
