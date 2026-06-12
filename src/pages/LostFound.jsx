import React, { useState } from "react";

function LostFound() {

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-8">

      {/* HEADER */}
      <div className="bg-[#18182a] p-6 rounded-3xl border border-violet-900 mb-8">

        <h1 className="text-4xl font-bold text-violet-300">
          Lost & Found
        </h1>

        <p className="text-gray-400 mt-2">
          Upload and manage lost items
        </p>

      </div>

      {/* UPLOAD BOX */}
      <div className="bg-[#18182a] p-6 rounded-3xl border border-violet-900 max-w-xl">

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 text-gray-300"
        />

        <input
          type="text"
          placeholder="Enter item description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#0f0f1a] border border-violet-900 mb-4"
        />

        <button
          onClick={() => alert("Item uploaded successfully")}
          className="w-full bg-violet-700 p-3 rounded-xl"
        >
          Upload Item
        </button>

      </div>

      {/* SAMPLE ITEMS */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">

        <div className="bg-[#18182a] p-4 rounded-2xl border border-violet-900">
          Lost Wallet - Bus 2
        </div>

        <div className="bg-[#18182a] p-4 rounded-2xl border border-violet-900">
          Water Bottle - Bus 5
        </div>

        <div className="bg-[#18182a] p-4 rounded-2xl border border-violet-900">
          ID Card - Gate Area
        </div>

      </div>

    </div>
  );
}

export default LostFound ;