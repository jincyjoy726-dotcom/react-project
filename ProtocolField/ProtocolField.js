import React from "react";
import "./ProtocolField.scss";

export default function ProtocolField({ label, value, onChange, onBlur ,type = "text" }) {
  
  return (
    <div className="protocol-row">
      <div className="protocol-col label">{label}</div>

      <div className="protocol-col">
        <input
          type={type}
          value={value}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </div>
      {/* <div className="protocol-arrow">→</div> */}
    </div>
  );
}
