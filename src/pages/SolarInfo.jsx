import React from "react";
import "./SolarInfo.css";

const SolarInfo = () => {
  return (
    <div className="solar-info-section">

      <h2 className="info-title">☀️ About Solar Panels</h2>

      <p className="info-description">
        Solar panels convert sunlight into electricity using photovoltaic (PV) cells.
        They provide a clean and renewable energy source that helps reduce electricity
        bills and carbon emissions. Maintaining solar panels properly ensures maximum
        energy efficiency and longer lifespan.
      </p>

      <div className="info-cards">

        <div className="info-card">
          <span className="icon">⚡</span>
          <h3>Renewable Energy</h3>
          <p>Solar power is a sustainable and eco-friendly source of electricity.</p>
        </div>

        <div className="info-card">
          <span className="icon">💰</span>
          <h3>Cost Saving</h3>
          <p>Installing solar panels reduces long-term electricity expenses.</p>
        </div>

        <div className="info-card">
          <span className="icon">🔧</span>
          <h3>Maintenance</h3>
          <p>Regular inspection helps detect cracks, dust, and faults early.</p>
        </div>

        <div className="info-card">
          <span className="icon">🌍</span>
          <h3>Eco Friendly</h3>
          <p>Solar energy reduces pollution and protects the environment.</p>
        </div>

      </div>
    </div>
  );
};

export default SolarInfo;