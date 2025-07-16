import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaUpload, FaFont } from 'react-icons/fa';

function App() {
  const [fonts, setFonts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupFonts, setGroupFonts] = useState([null]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFonts();
    fetchGroups();
  }, []);

  const fetchFonts = async () => {
    const res = await axios.get('http://localhost:3000/fonts');
    setFonts(res.data);
  };

  const fetchGroups = async () => {
    const res = await axios.get('http://localhost:3000/font-groups');
    setGroups(res.data);
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append('fonts', file);
    }

    try {
      await axios.post('http://localhost:3000/upload-fonts', formData);
      fetchFonts();
    } catch {
      alert('Upload failed');
    }
  };

  const handleAddRow = () => {
    setGroupFonts([...groupFonts, null]);
  };

  const handleGroupFontChange = (index, value) => {
    const updated = [...groupFonts];
    updated[index] = value;
    setGroupFonts(updated);
  };

  const handleCreateGroup = async () => {
    const selected = groupFonts.filter((f) => f);
    if (selected.length < 2) return setError('Select at least 2 fonts');

    try {
      await axios.post('http://localhost:3000/font-groups', { fonts: selected });
      fetchGroups();
      setGroupFonts([null]);
      setError('');
    } catch {
      setError('Failed to create group');
    }
  };

  const handleDeleteGroup = async (id) => {
    await axios.delete(`http://localhost:3000/font-groups/${id}`);
    fetchGroups();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaFont /> Font Group Manager
      </h1>

      {/* Upload Fonts */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUpload /> Upload Fonts (.ttf only)
        </h2>
        <input
          type="file"
          accept=".ttf"
          multiple
          onChange={handleFileChange}
          className="mb-4 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full
                     file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm border">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Font Name</th>
                <th className="p-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {fonts.map((font, i) => (
                <tr key={font._id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{font.filename}</td>
                  <td className="p-2">
                    <span style={{ fontFamily: font.family }} className="text-lg">
                      Example Style
                    </span>
                    <style>
                      {`@font-face {
                        font-family: '${font.family}';
                        src: url('data:font/ttf;base64,${font.base64}') format('truetype');
                      }`}
                    </style>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Group */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaPlus /> Create Font Group
        </h2>
        <table className="w-full text-sm border mb-4">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Row</th>
              <th className="p-2">Select Font</th>
            </tr>
          </thead>
          <tbody>
            {groupFonts.map((fontId, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <select
                    value={fontId || ''}
                    onChange={(e) => handleGroupFontChange(index, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Font</option>
                    {fonts.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fullName}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleAddRow}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Add Row
          </button>
          <button
            onClick={handleCreateGroup}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Group
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Font Groups */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">📚 Font Groups</h2>
        {groups.length === 0 ? (
          <p className="text-gray-500">No groups created yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group, idx) => (
              <div
                key={group._id}
                className="border p-3 rounded flex justify-between items-center flex-wrap gap-2"
              >
                <div>
                  <strong>Group {idx + 1}:</strong>{' '}
                  {group.fonts.map((fId) => {
                    const f = fonts.find((font) => font._id === fId);
                    return f ? (
                      <span
                        key={f._id}
                        className="inline-block bg-gray-200 px-2 py-1 rounded mr-1 text-sm"
                      >
                        {f.fullName}
                      </span>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => handleDeleteGroup(group._id)}
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
