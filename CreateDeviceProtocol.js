import React,{useState,useEffect} from "react";
import SectionTabs from "../../components/SectionTabs";
import ProtocolField from "../../components/ProtocolField/ProtocolField";

const TAB_HEADING = [
  { id: "availableProtocolTemplate", label: "Available Protocol Template" },
  { id: "customProtocolTemplates", label: "Custom Protocol Templates" },
];

const OPCUA_SECURITY_POLICIES = [
  "Basic128Rsa15",
  "Basic256",
  "Basic256Sha256",
  "Aes128Sha256RsaOaep",
  "Aes256Sha256RsaPss"
];

const OPCUA_SECURITY_MODES = [
  "None",
  "Sign",
  "SignAndEncrypt"
];

const AvailableProtocolTemplate = ({ selectedProtocol, setSelectedProtocol }) => {
  const protocols = [
    "device-mqtt",
    "device-rest",
    "device-virtual",
    "device-modbus-tcp",
    "device-modbus-rtu",
    "device-onvif-camera",
    "device-opcua",
    "device-s7",
    "device-rfid-llrp",
  ];

  return (
    <div className="form-control-item">
      <label className="label" style={{ marginBottom: 8 }}>Protocol Name</label>
      <select
        value={selectedProtocol}
        onChange={(e) => setSelectedProtocol(e.target.value)}
        className="form-control"
        style={{ width: "100%", padding: 10, borderRadius: 4 }}
      >
        <option value="">-- Select Protocol --</option>
        {protocols.map((proto) => (
          <option key={proto} value={proto}>{proto}</option>
        ))}
      </select>
    </div>
  );
};

const CustomProtocolTemplates = () => (
  <p className="text-gray-700 text-sm">This is Custom Protocol Template</p>
);

export default function CreateDeviceProtocol({
  activeTab,
  setActiveTab,
  selectedProtocol,
  setSelectedProtocol,
  protocolFields,
  setProtocolFields,
}) {

   const [localProtocol, setLocalProtocol] = useState({ ...protocolFields });

  useEffect(() => {
    setLocalProtocol(prev => ({ ...prev, ...protocolFields }));
  }, [protocolFields]);

  const handleChange = (field, value) => {
  setLocalProtocol(prev => ({ ...prev, [field]: value }));
};


  const handleBlur = () => {
    setProtocolFields(prev => ({ ...prev, ...localProtocol }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "availableProtocolTemplate":
        return (
          <>
            <AvailableProtocolTemplate
              selectedProtocol={selectedProtocol}
              setSelectedProtocol={setSelectedProtocol}
            />

            {/** OPC UA UI Field */}
           {selectedProtocol === "device-opcua" && (
            <>
            <ProtocolField
            label="Endpoint"
            value={localProtocol.endpoint}
            onChange={(v) => handleChange("endpoint", v)}
            onBlur={handleBlur}
            />

            <div className="form-control-item" style={{ marginTop: 15 }}>
                  <label className="label" style={{ marginBottom: 8, display: 'block' }}>
                    Security Policy
                  </label>
                  <select
                    className="form-control"
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
                    value={localProtocol.policy || ""}
                    onChange={(e) => {
                        handleChange("policy", e.target.value);
                    }}
                    onBlur={handleBlur}
                  >
                    <option value="">-- Select Policy --</option>
                    {OPCUA_SECURITY_POLICIES.map((policy) => (
                      <option key={policy} value={policy}>
                        {policy}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control-item" style={{ marginTop: 15 }}>
                  <label className="label" style={{ marginBottom: 8, display: 'block' }}>
                    Security Mode
                  </label>
                  <select
                    className="form-control"
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
                    value={localProtocol.mode || ""}
                    onChange={(e) => handleChange("mode", e.target.value)}
                    onBlur={handleBlur}
                  >
                    <option value="">-- Select Mode --</option>
                    {OPCUA_SECURITY_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
            </>
            
        )}

        {/** MQTT UI Fields */} 
        {selectedProtocol === "device-mqtt" && (
            <>
            <ProtocolField label="Schema" value={localProtocol.schema}
            onChange={(v)=>handleChange("schema",v)}onBlur={handleBlur}/>

            <ProtocolField label="Host" value={localProtocol.host}
            onChange={(v)=>handleChange("host",v)}onBlur={handleBlur} />
            <ProtocolField label="Port" value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur} />
            <ProtocolField label="User" value={localProtocol.user}
            onChange={(v)=>handleChange("user",v)}onBlur={handleBlur} />
            <ProtocolField label="Password" value={localProtocol.password}
            onChange={(v)=>handleChange("password",v)}onBlur={handleBlur} />
            <ProtocolField label="ClientId" value={localProtocol.clientId}
            onChange={(v)=>handleChange("clientId",v)}onBlur={handleBlur} />
            <ProtocolField label="CommandTopic" value={localProtocol.commandTopic}
            onChange={(v)=>handleChange("commandTopic",v)}onBlur={handleBlur} />
            </>
        )}

        {/** DEVICE-VIRTUAL UI */}  
        {selectedProtocol === "device-virtual" && (
            <>
            <ProtocolField label="Address" 
            value={localProtocol.address}
            onChange={(v)=>handleChange("address",v)}onBlur={handleBlur}
            />
            <ProtocolField label="Port"
            value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur}
            />
            </>
        )}

        {/** DEVICE-RFID-LLRP UI */}  
        {selectedProtocol === "device-rfid-llrp" && (
            <>
            <ProtocolField
            label="host"
            value={localProtocol.host}
            onChange={(v) => handleChange("host",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="port"
            value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur}
            />
            </>
        )}
        {/** DEVICE-MODBUS-TCP UI */}  
        {selectedProtocol === "device-modbus-tcp" && (
            <>
            <ProtocolField
            label="Address"
            value={localProtocol.address}
            onChange={(v) => handleChange("address",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Port"
            value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="UnitID"
            value={localProtocol.unitId}
            onChange={(v) => handleChange("unitId",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Timeout"
            value={localProtocol.timeout}
            onChange={(v) => handleChange("timeout",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="IdleTimeout"
            value={localProtocol.idleTimeout}
            onChange={(v) => handleChange("idleTimeout",v)}onBlur={handleBlur}
            />
            </>
        )}


        {/** DEVICE-S7 UI */}  
        {selectedProtocol === "device-s7" && (
            <>
            <ProtocolField
            label="Host"
            value={localProtocol.host}
            onChange={(v) => handleChange("host",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Port"
            value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Rack"
            value={localProtocol.rack}
            onChange={(v) => handleChange("rack",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Slot"
            value={localProtocol.slot}
            onChange={(v) => handleChange("slot",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Timeout"
            value={localProtocol.timeout}
            onChange={(v) => handleChange("timeout",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="IdleTimeout"
            value={localProtocol.idleTimeout}
            onChange={(v) => handleChange("idleTimeout",v)}onBlur={handleBlur}
            />
            </>
        )}

        {/** DEVICE-ONVIF-CAMERA UI */} 
        {selectedProtocol === "device-onvif-camera" && (
            <>
            <ProtocolField
            label="Address"
            value={localProtocol.address}
            onChange={(v) => handleChange("address",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Port"
            value={localProtocol.port}
            onChange={(v)=>handleChange("port",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="MACAddress"
            value={localProtocol.macAddress}
            onChange={(v) => handleChange("macAddress",v)}onBlur={handleBlur}
            />
            </>
        )}

        {/** DEVICE-MODBUS-RTU UI */}  
        {selectedProtocol === "device-modbus-rtu" && (
            <>
            <ProtocolField
            label="Address"
            value={localProtocol.address}
            onChange={(v) => handleChange("address",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="UnitID"
            value={localProtocol.unitId}
            onChange={(v) => handleChange("unitId",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="BaudRate"
            value={localProtocol.baudRate}
            onChange={(v) => handleChange("baudRate",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="DataBits"
            value={localProtocol.dataBits}
            onChange={(v) => handleChange("dataBits",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="StopBits"
            value={localProtocol.stopBits}
            onChange={(v) => handleChange("stopBits",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Parity"
            value={localProtocol.parity}
            onChange={(v) => handleChange("parity",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="Timeout"
            value={localProtocol.timeout}
            onChange={(v) => handleChange("timeout",v)}onBlur={handleBlur}
            />
            <ProtocolField
            label="IdleTimeout"
            value={localProtocol.idleTimeout}
            onChange={(v) => handleChange("idleTimeout",v)}onBlur={handleBlur}
            />
            </>
        )}
        {selectedProtocol === "device-rest" && (
            <div className="device-rest-box">
                <div className="device-rest-info">ℹ all built-in protocol templates refer to the device service released by edgex,
                    such as device-virtual, device-rest, device-mqtt, device-modbus
                </div>
                    <div className="device-rest-warning">⚠ this device service doesn't need to set protocol properties</div>
            </div>
        )}
         </>
        );

      case "custom":
        return <CustomProtocolTemplates />;

      default:
        return null;
    }
  };

  return (
    <div className="steps-body-item">
      <div className="steps-body-item-box">
        <SectionTabs
          version="style-2"
          tabs={TAB_HEADING}
          activeTab={activeTab}
          onTabClick={(id) => setActiveTab(id)}
        />

        <div className="tab-body" style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 20,
          background: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
