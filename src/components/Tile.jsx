import React from 'react';

const COLORS = {
    blue: "bg-blue-500 hover:bg-blue-600",
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
};

const ICONS = {
    forward: "fa-arrow-up",
    left: "fa-arrow-rotate-left",
    right: "fa-arrow-rotate-right",
};

export function Tile({ inst, current, onClick }) {
    const isFunc = typeof inst.movement === "number";
    const classes = (COLORS[inst.color] ?? "") + (current ? " border-2 border-white" : "");
    const icon = isFunc ? "" : (ICONS[inst.movement] ?? "");

    return (
    <div className={`${classes} text-white cursor-pointer rounded w-12 aspect-square flex items-center justify-center bg-[#3e3e3e] hover:bg-[#4a4a4a] shadow-lg hover:shadow transition-all`}
        onClick={onClick}>
            {isFunc ? `F${inst.movement + 1}` : ""}
            <i className={`${icon} text-2xl fa-solid`}></i>
    </div>
  );
}
