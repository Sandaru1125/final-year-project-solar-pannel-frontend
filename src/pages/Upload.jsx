import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { predictImage } from "../api/api";
import { Upload, AlertCircle, Battery, Sun, Shield } from "lucide-react";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("Image size must be under 10MB");
      return;
    }

    setError("");
    setFile(selected);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select an image");

    setLoading(true);
    try {
      const result = await predictImage(file);

      sessionStorage.setItem(
        "predictionResult",
        JSON.stringify({
          ...result,
          imageFile: preview,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        })
      );

      navigate("/result");
    } catch {
      setError("Failed to analyze image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HERO */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-10 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <Sun size={48} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Solar Panel Health Detection
          </h1>
          <p className="text-blue-100">
            AI-powered solar panel condition analysis
          </p>
        </div>

        {/* MAIN */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">

          {/* DESCRIPTION */}
          <div className="bg-white rounded-2xl p-8 shadow">
            <div className="flex items-center gap-3 mb-4 text-blue-700">
              <Shield />
              <h2 className="text-xl font-semibold">
                Why Solar Panel Health Matters
              </h2>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Maintaining solar panel health is crucial for maximizing energy
              production and return on investment. Regular monitoring helps
              detect issues early and prevents long-term damage.
            </p>
          </div>

          {/* UPLOAD */}
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Analyze Your Panel
            </h2>
            <p className="text-gray-500 mb-6">
              Upload a solar panel image for instant AI analysis
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Upload Box */}
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-48 w-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload size={40} className="mx-auto text-blue-500" />
                    <p className="mt-3 font-medium text-gray-700">
                      Click to upload image
                    </p>
                    <p className="text-sm text-gray-400">
                      JPG, PNG • Max 10MB
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? (
                  "Analyzing..."
                ) : (
                  <>
                    <Battery size={18} />
                    Analyze Panel
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadPage;
