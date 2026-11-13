import React from 'react';
import { Rocket, SPACE_BG } from './Sprites';

export function Menu({ name, connected, queued, queueLevel, notice, onPlay, onSolo, onCancel, onResetProgress }) {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-6 px-4 text-white" style={SPACE_BG}>
      <Rocket angle={-45} className="w-28 h-28" />

      <h1 className="text-4xl font-extrabold text-center tracking-tight bg-gradient-to-r from-amber-200 via-white to-sky-200 bg-clip-text text-transparent">
        42 Le Havre RoboZZle
      </h1>

      <p className="px-4 py-1 rounded-full bg-white/10 ring-1 ring-white/10 text-sm text-slate-300 text-center">
        {connected ? `Connected as ${name}` : "Connecting to the server..."}
      </p>

      {notice ? <p className="text-amber-300 text-center">{notice}</p> : null}

      {queued ? (
        <>
          <i className="fa-solid fa-spinner fa-spin text-3xl text-amber-300"></i>
          <p className="text-lg text-center">Looking for a teammate for level {queueLevel}...</p>
          <p className="max-w-sm px-4 py-2 rounded-2xl bg-white/10 ring-1 ring-white/10 text-sm text-slate-200 text-center">
            <i className="fa-solid fa-handshake-angle text-amber-300 mr-2"></i>
            While you wait, feel free to give a hand to the other players!
          </p>
          <button
            onClick={onCancel}
            className="px-10 py-3 shadow-lg font-semibold rounded-2xl bg-white/10 ring-1 ring-white/20 hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onPlay}
            disabled={!connected}
            className="px-14 py-4 text-xl font-bold rounded-2xl shadow-lg bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Duo
          </button>
          <button
            onClick={onSolo}
            disabled={!connected}
            className="px-14 py-3 text-lg font-semibold rounded-2xl shadow-lg bg-white/10 ring-1 ring-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Solo
          </button>
          <button
            onClick={onResetProgress}
            className="px-8 py-2 text-sm font-semibold rounded-xl bg-rose-500/20 ring-1 ring-rose-300/30 hover:bg-rose-500/30 transition-all"
          >
            Réinitialiser ma progression
          </button>
        </div>
      )}
    </div>
  );
}
