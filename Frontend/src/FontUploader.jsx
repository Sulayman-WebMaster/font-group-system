import { FaUpload } from "react-icons/fa";
import { useDropzone } from "react-dropzone";

function FontUploader({ handleFileChange, fonts }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'font/ttf': ['.ttf'] },
    multiple: true,
    onDrop: acceptedFiles => handleFileChange({ target: { files: acceptedFiles } }),
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 justify-center">
        <FaUpload className="text-black text-3xl" />
        Upload Fonts (.ttf only)
      </h2>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'} 
        hover:border-blue-400 cursor-pointer`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-lg">
          {isDragActive ? "Drop the fonts here..." : "Uplaod "}
        </p>
      </div>

      {/* Uploaded Fonts Table */}
      {fonts.length > 0 && (
        <div className="mt-8 overflow-auto max-h-64">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-blue-100 text-left text-gray-700">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Font Name</th>
                <th className="p-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {fonts.map((font, i) => (
                <tr key={font._id || i} className="border-t border-gray-200">
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
      )}
    </div>
  );
}

export default FontUploader;