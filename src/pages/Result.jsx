import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem("predictionResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      navigate("/upload");
    }
  }, [navigate]);

  const getPredictionColor = (prediction) => {
    const colors = {
      clean: "bg-green-500",
      dusty: "bg-yellow-400",
      snowy: "bg-cyan-500",
      bird_drop: "bg-orange-500",
      electrical_damage: "bg-red-600",
      physical_damage: "bg-purple-600",
    };
    return colors[prediction] || "bg-indigo-500";
  };

  const getPredictionIcon = (prediction) => {
    const icons = {
      clean: "✅",
      dusty: "🌫️",
      snowy: "❄️",
      bird_drop: "🐦",
      electrical_damage: "⚡",
      physical_damage: "🔧",
    };
    return icons[prediction] || "🔍";
  };

  const formatPredictionName = (prediction) => {
    const names = {
      clean: "Clean",
      dusty: "Dusty",
      snowy: "Snow Covered",
      bird_drop: "Bird Droppings",
      electrical_damage: "Electrical Damage",
      physical_damage: "Physical Damage",
    };
    return (
      names[prediction] ||
      prediction.charAt(0).toUpperCase() +
        prediction.slice(1).replace(/_/g, " ")
    );
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🔍 Analysis Results
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="flex justify-center">
            {result.imageFile && (
              <img
                src={result.imageFile}
                alt="Solar Panel"
                className="rounded-xl shadow-md max-h-80 object-contain"
              />
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Prediction Badge */}
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-white text-lg font-semibold ${getPredictionColor(
                result.prediction
              )}`}
            >
              <span className="text-2xl">
                {getPredictionIcon(result.prediction)}
              </span>
              {formatPredictionName(result.prediction)}
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">💡 Recommendation</h3>

              {/* Title */}
              <p className="font-medium text-gray-800 mb-3">
                {result.recommendation.title}
              </p>

              {/* 🟢 Minor Issues */}
              {result.recommendation.severity === "minor" && (
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {result.recommendation.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              )}

              {/* 🔴 Major Issues */}
              {result.recommendation.severity === "major" && (
                <div className="space-y-3">
                  <p className="text-red-600 font-semibold">
                    {result.recommendation.warning}
                  </p>

                  <button
                    onClick={() => navigate("/booking")}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Hire Certified Technician
                  </button>
                </div>
              )}
            </div>

            {/* Confidence */}
            {result.confidence && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800">
                  Confidence:{" "}
                  <strong className="text-indigo-600">
                    {(result.confidence * 100).toFixed(1)}%
                  </strong>
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              {result.recommendation.severity === "minor" && (
                <button
                  onClick={() => navigate("/booking")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Book Cleaning Service
                </button>
              )}

              <button
                onClick={() => navigate("/upload")}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Analyze Another Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
