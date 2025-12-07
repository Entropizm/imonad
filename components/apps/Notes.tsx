"use client";

import { useState } from "react";
import AppHeader from "./AppHeader";

interface NotesProps {
  onClose: () => void;
}

export default function Notes({ onClose }: NotesProps) {
  const [notes, setNotes] = useState<string[]>(["Welcome to Notes!\nStart typing..."]);
  const [selectedNote, setSelectedNote] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const handleNewNote = () => {
    setNotes([...notes, ""]);
    setSelectedNote(notes.length);
    setIsEditing(true);
  };

  const handleNoteChange = (text: string) => {
    const newNotes = [...notes];
    newNotes[selectedNote] = text;
    setNotes(newNotes);
  };

  const getPreview = (text: string) => {
    const firstLine = text.split("\n")[0];
    return firstLine || "New Note";
  };

  if (isEditing) {
    return (
      <div className="w-full h-full bg-yellow-50 flex flex-col">
        <AppHeader
          title={getPreview(notes[selectedNote])}
          onClose={() => setIsEditing(false)}
          color="yellow"
        />
        <textarea
          value={notes[selectedNote]}
          onChange={(e) => handleNoteChange(e.target.value)}
          className="flex-1 p-4 bg-yellow-50 text-gray-800 text-lg font-serif resize-none focus:outline-none"
          placeholder="Start typing..."
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      <AppHeader title="Notes" onClose={onClose} />

      <div className="flex-1 overflow-y-auto">
        {notes.map((note, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedNote(index);
              setIsEditing(true);
            }}
            className="w-full p-4 bg-white border-b border-gray-200 text-left active:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-800">
              {getPreview(note)}
            </div>
            <div className="text-sm text-gray-500 truncate mt-1">
              {note.split("\n").slice(1).join(" ")}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleNewNote}
        className="m-4 p-4 bg-blue-500 text-white rounded-lg active:bg-blue-600 font-medium"
      >
        + New Note
      </button>
    </div>
  );
}

