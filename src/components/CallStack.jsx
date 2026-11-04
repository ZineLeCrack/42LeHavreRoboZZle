import React from 'react';

const ICONS = {
  forward: "fa-arrow-up",
  left: "fa-arrow-rotate-left",
  right: "fa-arrow-rotate-right",
};

const COLORS = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
};

export function CallStack({ stack, instance }) {
  const frames = [...stack].reverse();

  return (
    <div className="hidden sm:flex flex-col w-40 h-full max-h-[90vh] py-4 text-white">
      <div className="text-sm font-semibold uppercase tracking-widest text-center mb-2 text-indigo-200">Stack</div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 bg-white/5 ring-1 ring-white/10 rounded-2xl p-2 shadow-xl">
        {frames.length === 0 ? (
          <div className="text-sm text-slate-400 text-center mt-2">Empty</div>
        ) : frames.map((frame, i) => {
          const inst = instance.instructions[frame.func]?.[frame.index];
          const isTop = i === 0;
          return (
            <div
              key={frames.length - i}
              className={`flex items-center justify-between rounded-xl px-2 py-1.5 bg-white/10 ${isTop ? "ring-2 ring-amber-300" : "ring-1 ring-white/10"}`}
            >
              <span className="font-bold">F{frame.func + 1}</span>
              <span className="text-xs text-slate-300">#{frame.index + 1}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${COLORS[inst?.color] ?? "bg-white/10"}`}>
                {typeof inst?.movement === "number"
                  ? `F${inst.movement + 1}`
                  : <i className={`fa-solid ${ICONS[inst?.movement] ?? ""}`} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
