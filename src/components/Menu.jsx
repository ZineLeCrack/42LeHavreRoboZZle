import React from 'react';

export function Menu({ name, connected, queued, notice, onPlay, onCancel }) {
  return (
    <div className="bg-[#2d2d2d] w-screen h-screen flex flex-col justify-center items-center gap-6 px-4 text-white">
      <h1 className="text-3xl font-semibold text-center">42 Le Havre RoboZZle</h1>

      <p className="text-gray-400 text-center">
        {connected ? `Connected as ${name}` : "Connecting to the server..."}
      </p>

      {notice ? <p className="text-yellow-400 text-center">{notice}</p> : null}

      {queued ? (
        <>
          <i className="fa-solid fa-spinner fa-spin text-3xl"></i>
          <p className="text-lg text-center">Waiting for another player...</p>
          <button
            onClick={onCancel}
            className="px-8 py-3 shadow-lg hover:shadow font-semibold rounded bg-black/20 hover:bg-black/30 text-white"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={onPlay}
          disabled={!connected}
          className="px-12 py-4 text-xl shadow-lg hover:shadow font-semibold bg-white rounded text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Play
        </button>
      )}
    </div>
  );
}
