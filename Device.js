import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,hhh
  
} from "react";
import TableTopActions from "../../components/TableTopActions";
import ListView from "../../components/ListVIew";
import TableView from "../../components/TableView";
import DeviceIcon from "../../assests/images/HardDrives.svg";
import AddIcon from "../../assests/images/add.svg";
import Modal from "../../components/Modal";
import BackIcon from "../../assests/images/arrow-left.svg";
import PlusIcon from "../../assests/images/plus.svg";
import { v4 as uuidv4 } from "uuid";
import DevicePrimary from "./DevicePrimary";
import CreateDeviceProtocol from "./CreateDeviceProtocol";
import {
  
  getDevice,
  getAllDeviceServices,
  getDevices,
  addDevice,
  deleteDevice,
} from "../../services/edgexApi";


const TABLE_HEAD = [
  "Device Name",
  "Status",
  "Associated Count",
  "URL",
  "Operating Status",
  "Last Connected",
  "Last Reported",
];

const Device = () => {
  const [isModalShow, setIsModalShow] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [deviceServices, setDeviceServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [autoEvents, setAutoEvents] = useState([]);
  const [showAutoEventForm, setShowAutoEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState("availableProtocolTemplate");
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [protocolFields, setProtocolFields] = useState({
    /* OPC-UA */
    endpoint: "",
    policy: "", 
    mode:"",
    

  /* MQTT */
    schema: "",
    host: "",
    port: "",
    user: "",
    password: "",
    clientId: "",
    commandTopic: "",

  /* Device-Virtual */
    address: "",

  /* ONVIF Camera */
    macAddress: "",

  /* Modbus RTU */
    unitId: "",
    baudRate: "",
    dataBits: "",
    stopBits: "",
    parity: "",

  /* Modbus TCP */
    timeout: "",
    idleTimeout: "",

  /* S7 PLC */
    rack: "",
    slot: "",

  /* RFID LLRP */
    reconnectionInterval: "",
    keepaliveInterval: "",
    transmitPower: "",
});
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    labels: "",
    adminState: "", 
  });

  const modalToggleHandler = (show) => {
    setIsModalShow(show);
    if (!show) {
      setShowAutoEventForm(false);
      setAutoEvents([]);
    }
  };

  const viewHandler = (show) => {
    setIsListView(show);
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

 
  const extractResourcesFromProfile = (profile) => {
  if (!profile) return [];

  const resources = [];
  //  deviceResources
  if (Array.isArray(profile.deviceResources)) {
    profile.deviceResources.forEach((res) => {
      if (res.name) resources.push(res.name);
    });
  } 
  if (Array.isArray(profile.deviceCommands)) {
    profile.deviceCommands.forEach((cmd) => {
      if (cmd.name) resources.push(cmd.name);
    });
  }

  return resources;
};
  
  const availableResources = useMemo(() => {
    if (selectedProfile && deviceProfiles.length > 0) {
      const profile = deviceProfiles.find((p) => p.name === selectedProfile);
    return profile ? extractResourcesFromProfile(profile) : [];
    }
    return [];
  }, [selectedProfile, deviceProfiles]);

  
  const handleAddAutoEvent = () => {
    setShowAutoEventForm(true);
    const defaultResource = availableResources.length > 0 ? availableResources[0] : "";
    setAutoEvents([
      { interval: "30", unit: "second", onChange: "false", resource: defaultResource },
    ]);
  };

  const handleAutoEventChange = (index, field, value) => {
    const updatedEvents = [...autoEvents];
    updatedEvents[index][field] = value;
    setAutoEvents(updatedEvents);
  };

  const handleRemoveAutoEvent = (index) => {
    const updatedEvents = autoEvents.filter((_, i) => i !== index);
    setAutoEvents(updatedEvents);
  };

  const handleAddMoreAutoEvent = () => {
    const defaultResource = availableResources.length > 0 ? availableResources[0] : "";
    setAutoEvents([
      ...autoEvents,
      { interval: "30", unit: "second", onChange: "false", resource: defaultResource },
    ]);
  };

  
  const handleAddSave = async (formValues) => {
    try {
      const hasAutoEvents = autoEvents.length > 0 && autoEvents[0].resource;
      
      
      const buildProtocols = () => {
        switch (selectedProtocol) {
          case "device-opcua":
            return {
              opcua: {
                Endpoint: protocolFields.endpoint,
                SecurityPolicy: protocolFields.policy,
                SecurityMode: protocolFields.mode
              }
            };
          /*  MQTT */  
          case "device-mqtt":
            return {
              mqtt: {
                Schema: protocolFields.schema,
                Host: protocolFields.host,
                Port: protocolFields.port,
                User: protocolFields.user,
                Password: protocolFields.password,
                ClientId: protocolFields.clientId,
                CommandTopic: protocolFields.commandTopic
              }
            };
            /*  MODBUS RTU */
          case "device-modbus-rtu":
            return {
              modbus: {
                Address: protocolFields.address,
                UnitID: protocolFields.unitId,
                BaudRate: protocolFields.baudRate,
                DataBits: protocolFields.dataBits,
                StopBits: protocolFields.stopBits,
                Parity: protocolFields.parity,
                Timeout: protocolFields.timeout,
                IdleTimeout: protocolFields.idleTimeout,
              }
            };
            /*  MODBUS TCP */
          case "device-modbus-tcp":
            return {
              modbus: {
                Address: protocolFields.address,
                Port: protocolFields.port,
                UnitID: protocolFields.unitId,
                Timeout: protocolFields.timeout,
                IdleTimeout: protocolFields.idleTimeout,
              }
            };
          
            /*  ONVIF CAMERA */
          case "device-onvif-camera":
            return {
              onvif: {
                Address: protocolFields.address,
                Port: protocolFields.port,
                MACAddress: protocolFields.macAddress,
              }
            };
            
            /*  S7 PLC */
            case "device-s7":
              return {
                s7: {
                  Host: protocolFields.host,
                  Port: protocolFields.port,
                  Rack: protocolFields.rack,
                  Slot: protocolFields.slot,
                  Timeout: protocolFields.timeout,
                  IdleTimeout: protocolFields.idleTimeout,
                }
              };

              /*  RFID LLRP */
              case "device-rfid-llrp":
                return {
                  llrp: {
                    Host: protocolFields.host,
                    Port: protocolFields.port,
                    ReconnectionInterval: protocolFields.reconnectionInterval,
                    KeepaliveInterval: protocolFields.keepaliveInterval,
                    TransmitPower: protocolFields.transmitPower,
                  }
                };
                /*  DEVICE VIRTUAL */
                case "device-virtual":
                  return {
                    virtual: {
                      Address: protocolFields.address,
                      Port: protocolFields.port
                    }
                  };
                  
                  /*  DEVICE REST  */
                  case "device-rest":
                    return {};
                    
                    default:
                      return {};
                    }
                  };
const payload = [
         {
          apiVersion: "v3",
           requestId: uuidv4(),
           device: {
             name: formValues.name,
             description: formValues.description,
             adminState: formValues.adminState ? formValues.adminState.toUpperCase() : "UNLOCKED",
             operatingState: "UP",
             labels: formValues.labels ? formValues.labels.split(",") : [],
             serviceName: selectedService,
             profileName: selectedProfile,
 
            protocols: buildProtocols(), //  Uses dynamic function
             autoEvents: hasAutoEvents ? autoEvents.map(event => ({
             interval: `${event.interval}${event.unit === 'millisecond' ? 'ms' : event.unit === 'minute' ? 'm' : event.unit === 'hour' ? 'h' : 's'}`,
              onChange: event.onChange === "true",
              sourceName: event.resource
             })) : [],
             },
       }
    ];
      
      await addDevice(payload);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      await fetchDevices();
      setIsModalShow(false);
      
    } catch (error) {
      console.error("Error adding device:", error);
    }
  };

  
  const handleDeleteDevice = async () => {
    if (selectedDevices.length === 0) return;
    
    
    const deviceId = selectedDevices[0]; 
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      await deleteDevice(device.name); 
      await fetchDevices();
      setSelectedDevices([]);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

 
  const handleDeviceClick = (deviceId) => {
    
    setSelectedDevices([deviceId]);
  };


  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDevice();
      const fetchedDevices = response.data.devices || [];
      
      if (fetchedDevices.length > 0) {
        const formattedDevices = fetchedDevices.map((d) => ({
          id: d.id || d.name, 
          name: d.name,
          status: d.adminState || "UNKNOWN",
          associatedCount: d.profileName || "N/A", 
          url: d.serviceName || "N/A",
          operatingStatus: d.operatingState || "N/A",
          lastConnected: d.lastConnected ? new Date(d.lastConnected).toLocaleString() : "N/A",
          lastReported: d.lastReported ? new Date(d.lastReported).toLocaleString() : "N/A",
        }));
        setDevices(formattedDevices);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);


  useEffect(() => {
    if (isModalShow) {
      getAllDeviceServices()
        .then((res) => {
          setDeviceServices(res.data.services || []);
        })
        .catch((err) => {
          console.error("Error fetching device services:", err);
          setDeviceServices([]);
        });
      
      setSelectedService("");
      setSelectedProfile(null);
      setStep(1);
      setFormValues({
        name: "",
        description: "",
        labels: "",
        adminState: "UNLOCKED",
      });
      setAutoEvents([]);
      setShowAutoEventForm(false);
    }
  }, [isModalShow]);

  
  useEffect(() => {
    if (isModalShow && step === 2) {
      getDevices()
        .then((res) => {
          setDeviceProfiles(res.data.profiles || []);
        })
        .catch((err) => {
          console.error("Error fetching device profiles:", err);
          setDeviceProfiles([]);
        });
    }
  }, [isModalShow, step]);


  
  const SelectDevice = () => (
    <div className="device-summary-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {deviceServices.length === 0 ? (
        <p>No device services found.</p>
      ) : (
        deviceServices.map((svc) => (
          <div
            key={svc.name}
            className={`list-view-item${
              selectedService === svc.name ? " selected" : ""
            }`}
            onClick={() => setSelectedService(svc.name)}
            style={{
              cursor: "pointer",
              boxShadow:
                selectedService === svc.name
                  ? "inset 0 0 0 9999px rgba(0, 123, 255, 0.15)"
                  : "none",
              border:
                selectedService === svc.name
                  ? "1px solid rgba(0, 123, 255, 0.4)"
                  : "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <div className="list-view-item-icon">
              <img src={DeviceIcon} alt="Icon" />
            </div>
            <div className="list-view-item-content">
                <div className="list-view-header">
                  <h3>{svc.name}</h3>
                </div>
                <div className="device-description">
                  {svc.description || "No description available"}
                </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

 
  const DeviceProfile = () => (
    <div className="device-summary-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {deviceProfiles.length === 0 ? (
        <p>No device profiles found.</p>
      ) : (
        deviceProfiles.map((profile) => (
          <div
            key={profile.name}
            className={`list-view-item${
              selectedProfile === profile.name ? " selected" : ""
            }`}
            onClick={() => setSelectedProfile(profile.name)}
            style={{
              cursor: "pointer",
              boxShadow:
                selectedProfile === profile.name
                  ? "inset 0 0 0 9999px rgba(0, 123, 255, 0.15)"
                  : "none",
              border:
                selectedProfile === profile.name
                  ? "1px solid rgba(0, 123, 255, 0.4)"
                  : "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <div className="list-view-item-icon">
              <img src={DeviceIcon} alt="Icon" />
            </div>
            <div className="list-view-item-content">
                <div className="list-view-header">
                  <h3>{profile.name}</h3>
                </div>
                <div className="device-description">{profile.description || "No description"}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  
  const CreateAutoEvent = () => {
    return (
      <div className="steps-body-item">
        {!showAutoEventForm ? (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              className="btn-primary" 
              style={{
                display: "inline-flex", 
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={handleAddAutoEvent}
              disabled={!selectedProfile}
            >
              <img src={PlusIcon} alt="Icon" style={{ width: "18px" }} />
              <span>Add Auto Events</span>
            </button>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
              This step is optional. You can skip it and set it later in edit mode.
            </p>
            {!selectedProfile && (
              <p style={{ marginTop: "8px", fontSize: "12px", color: "#ff6b6b" }}>
                Please select a device profile first to see available resources.
              </p>
            )}
            {selectedProfile && availableResources.length > 0 && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f8ff", borderRadius: "4px" }}>
                <strong>Available Resources for {selectedProfile}:</strong> {availableResources.join(', ')}
              </div>
            )}
            {selectedProfile && availableResources.length === 0 && (
              <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
                <strong>No resources found</strong> in the selected profile. Auto events cannot be added.
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
              
            }}
          >
            {availableResources.length > 0 && (
              <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f0f8ff", borderRadius: "4px", width: "100%" }}>
                <strong>Available Resources for {selectedProfile}:</strong> {availableResources.join(', ')}
              </div>
            )}
            
            {autoEvents.map((event, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  background: "#fafafa",
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px" }}>
                    Interval
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="number"
                      placeholder="Enter interval"
                      value={event.interval}
                      onChange={(e) =>
                        handleAutoEventChange(idx, "interval", e.target.value)
                      }
                      style={{
                        width: "120px",
                        padding: "14px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                      }}
                    />
                    <select
                      value={event.unit}
                      onChange={(e) =>
                        handleAutoEventChange(idx, "unit", e.target.value)
                      }
                      style={{
                        width: "150px",
                        padding: "14px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                      }}
                    >
                      <option value="millisecond">milliseconds</option>
                      <option value="second">seconds</option>
                      <option value="minute">minutes</option>
                      <option value="hour">hours</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px" }}>
                    On Change
                  </label>
                  <select
                    value={event.onChange}
                    onChange={(e) =>
                      handleAutoEventChange(idx, "onChange", e.target.value)
                    }
                    style={{
                      width: "55%",
                      padding: "14px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  >
                    <option value="false">false (read on interval)</option>
                    <option value="true">true (read only on value change)</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px" }}>
                    Resource *
                  </label>
                  <select
                    value={event.resource}
                    onChange={(e) =>
                      handleAutoEventChange(idx, "resource", e.target.value)
                    }
                    style={{
                      width: "55%",
                      padding: "14px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                    disabled={availableResources.length === 0}
                  >
                    <option value="">Select a resource</option>
                    {availableResources.map(resource => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                  <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
                    Must be a valid resource from the selected device profile
                  </small>
                  {availableResources.length === 0 && (
                    <small style={{ display: "block", marginTop: "5px", color: "#ff6b6b" }}>
                      No resources found in the selected profile
                    </small>
                  )}
                </div>
                
                <div style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveAutoEvent(idx)}
                    style={{
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMoreAutoEvent}
                    style={{
                      background: "#3498db",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Add More AutoEvent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <SelectDevice />;
      case 2:
        return <DeviceProfile />;
      case 3:
        return (
          <DevicePrimary
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      case 4:
        return <CreateAutoEvent key={isModalShow ? "auto-event" : "auto-event-closed"} />;
      case 5:
        return <CreateDeviceProtocol
        activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedProtocol={selectedProtocol}
      setSelectedProtocol={setSelectedProtocol}
      protocolFields={protocolFields}
      setProtocolFields={setProtocolFields} />;
      default:
        return null;
    }
  };

  const isPrimaryValid = useMemo(() => {
    
    return (
      formValues.name.trim() !== "" &&
      formValues.description.trim() !== "" &&
      selectedService &&
      selectedProfile
    );
  }, [
    formValues.name,
    formValues.description,
    selectedService,
    selectedProfile,
  ]);

  
  const AddNewDevice = () => (
    <div className="steps-wrapper">
      <div className="steps-header">
        <ul className="steps-list">
          <li className={step === 1 ? "active" : step > 1 ? "done" : ""}>
            <span className="steps-count">01</span>
            <span className="steps-label">Select Device Service</span>
          </li>
          <li className={step === 2 ? "active" : step > 2 ? "done" : ""}>
            <span className="steps-count">02</span>
            <span className="steps-label">Device Profile</span>
          </li>
          <li className={step === 3 ? "active" : step > 3 ? "done" : ""}>
            <span className="steps-count">03</span>
            <span className="steps-label">Device Primary</span>
          </li>
          <li className={step === 4 ? "active" : step > 4 ? "done" : ""}>
            <span className="steps-count">04</span>
            <span className="steps-label">Create Auto Event</span>
          </li>
          <li className={step === 5 ? "active" : step > 5 ? "done" : ""}>
            <span className="steps-count">05</span>
            <span className="steps-label">Create Device Protocol</span>
          </li>
        </ul>
      </div>
      <div className="steps-body">{renderStepContent()}</div>
      <div className="steps-footer">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="btn-without-border no-btn"
          >
            <img src={BackIcon} alt="Back" />
            Back
          </button>
        )}
        {step < 5 && (
          <button
            onClick={nextStep}
            className="btn-secondary"
            disabled={
              (step === 1 && !selectedService) ||
              (step === 2 && !selectedProfile) ||
              (step === 3 && !isPrimaryValid) 
            }
          >
            Next
          </button>
        )}
        {step === 5 && (
          <button
            className="btn-secondary green"
            onClick={() => handleAddSave(formValues)}
            disabled={!isPrimaryValid} 
          >
            Submit
          </button>
        )}
        <p>
          {step} selected <span>/ 5</span>
        </p>
      </div>
    </div>
  );

 
  return (
    <>
      <div className="device-summary-actions">
        <div className="device-left-summary">
          <button
            type="button"
            className="no-btn btn-without-border"
            onClick={() => modalToggleHandler(true)}
          >
            <img src={AddIcon} alt="Add" />
            <span>Add</span>
          </button>
          <button
            type="button"
            className={`no-btn btn-without-border${selectedDevices.length > 0 ? '' : ' disabled'}`}
            disabled={selectedDevices.length === 0}
            onClick={handleDeleteDevice}
          >
            <span>Delete</span>
          </button>
          <button
            type="button"
            className="no-btn btn-without-border"
            onClick={fetchDevices}
            title="Refresh device list"
          >
            <span>Refresh</span>
          </button>
        </div>
        <div className="device-more-actions">
          <TableTopActions
            isListView={isListView}
            handleView={(isList) => viewHandler(isList)}
          />
        </div>
      </div>

      <div className="device-summary-body">
        {loading ? (
          <p>Loading devices...</p>
        ) : isListView ? (
          <ListView
            data={devices}
            icon={DeviceIcon}
            selectedIds={selectedDevices}
            onRowClick={handleDeviceClick}
          />
        ) : (
          <TableView th={TABLE_HEAD} data={devices} />
        )}
      </div>

      {isModalShow && (
        <Modal title="Add new Device" onClose={() => modalToggleHandler(false)}>
          <AddNewDevice />
        </Modal>
      )}
    </>
  );
};

export default Device;