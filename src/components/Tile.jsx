import React from 'react';

const COLORS = {
    blue: "bg-blue-500 hover:bg-blue-400",
    red: "bg-red-500 hover:bg-red-400",
    green: "bg-green-500 hover:bg-green-400",
};

const ICONS = {
    forward: "fa-arrow-up",
    left: "fa-arrow-rotate-left",
    right: "fa-arrow-rotate-right",
};

export function Tile({ inst, current, onClick, disabled = false }) {
    const isFunc = typeof inst.movement === "number";
    const color = COLORS[inst.color] ?? "bg-white/10 hover:bg-white/20";
    const ring = current ? "ring-2 ring-amber-300" : "ring-1 ring-white/10";
    const icon = isFunc ? "" : (ICONS[inst.movement] ?? "");

    return (
    <div
        className={`${color} ${ring} text-white font-bold rounded-xl w-12 aspect-square flex items-center justify-center shadow-lg transition-all ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"}`}
        onClick={disabled ? undefined : onClick}
        title={disabled ? "Case réservée à l'autre joueur" : undefined}
        aria-disabled={disabled}
    >
            {isFunc ? `F${inst.movement + 1}` : ""}
            <i className={`${icon} text-2xl fa-solid`}></i>
    </div>
  );
}
