import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from "react";
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Check, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Copy, 
  RotateCcw, 
  Save, 
  Trash2, 
  Search, 
  BookOpen, 
  Shield, 
  ArrowRight, 
  Eye, 
  Edit, 
  CheckCircle,
  FileDown,
  RefreshCw,
  HelpCircle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TulaneSOPData, SOPMetadata, SavedSOPRecord } from "./types";
import { PRESET_CHEMICALS, PresetChemical } from "./presets";
import { generateSOPPdf } from "./lib/pdfGenerator";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"scan" | "library" | "handbook">("scan");

  // Metadata inputs for Tulane SOP
  const [metadata, setMetadata] = useState<SOPMetadata>({
    department: "Chemistry & Biomolecular Engineering",
    room: "Musa Rad Lab 402",
    principalInvestigator: "Dr. Elizabeth Tulane",
    dsr: "Sarah Jenkins, EHS Representative",
    dateCreated: new Date().toISOString().substring(0, 10),
  });

  // Current SOP data state
  const [sopData, setSopData] = useState<TulaneSOPData | null>(null);

  // Local safety equipment map state
  const [equipmentMap, setEquipmentMap] = useState({
    eyewash: { distance: 8, direction: "NE", description: "beside the primary reagent sink", active: true },
    shower: { distance: 12, direction: "NW", description: "adjacent to the main exit door", active: true },
    extinguisher: { distance: 15, direction: "S", description: "mounted on the rear pillar near the electrical panel", active: true }
  });

  const getEquipmentSOPString = (map: typeof equipmentMap) => {
    const parts = [];
    if (map.eyewash.active) {
      parts.push(`Emergency Eyewash Station: Located approx. ${map.eyewash.distance} feet ${map.eyewash.direction} (${map.eyewash.description || "within reach of primary bench"}).`);
    }
    if (map.shower.active) {
      parts.push(`Emergency Drench Shower: Located approx. ${map.shower.distance} feet ${map.shower.direction} (${map.shower.description || "under accessible path"}).`);
    }
    if (map.extinguisher.active) {
      parts.push(`Class ABC Fire Extinguisher: Located approx. ${map.extinguisher.distance} feet ${map.extinguisher.direction} (${map.extinguisher.description || "on standard wall mount"}).`);
    }
    return parts.join(" ") || "No local safety equipment mapped or registered in this laboratory workstation.";
  };

  const updateEquipmentItem = (
    item: "eyewash" | "shower" | "extinguisher",
    field: "distance" | "direction" | "description" | "active",
    value: any
  ) => {
    const nextMap = {
      ...equipmentMap,
      [item]: {
        ...equipmentMap[item],
        [field]: value
      }
    };
    setEquipmentMap(nextMap);

    if (sopData) {
      const generatedText = getEquipmentSOPString(nextMap);
      setSopData({
        ...sopData,
        spillAndFirstAid: {
          ...sopData.spillAndFirstAid,
          emergencyLocations: generatedText
        }
      });
    }
  };

  const getCoordinates = (direction: string, distance: number) => {
    const center = 150;
    const maxDistance = 25;
    const radius = Math.min((distance / maxDistance) * 120, 125);
    
    let dx = 0;
    let dy = 0;
    
    switch (direction) {
      case "N": dx = 0; dy = -1; break;
      case "NE": dx = 0.707; dy = -0.707; break;
      case "E": dx = 1; dy = 0; break;
      case "SE": dx = 0.707; dy = 0.707; break;
      case "S": dx = 0; dy = 1; break;
      case "SW": dx = -0.707; dy = 0.707; break;
      case "W": dx = -1; dy = 0; break;
      case "NW": dx = -0.707; dy = -0.707; break;
      default: dx = 0; dy = 0; break;
    }
    
    return {
      x: center + dx * radius,
      y: center + dy * radius
    };
  };
  
  // App state
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  
  // Selected visual state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeEditingSection, setActiveEditingSection] = useState<string>("general");
  const [editorSelectedEquipment, setEditorSelectedEquipment] = useState<"eyewash" | "shower" | "extinguisher">("eyewash");

  // Local Storage safety vault
  const [savedRecords, setSavedRecords] = useState<SavedSOPRecord[]>([]);

  // Camera integration vars
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load saved SOP list from local storage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("tulane-sop-records");
      if (cached) {
        setSavedRecords(JSON.parse(cached));
      }
    } catch (e) {
      console.error("Local storage was not accessible:", e);
    }
  }, []);

  // Save records to storage helper
  const updateSavedRecords = (newRecords: SavedSOPRecord[]) => {
    setSavedRecords(newRecords);
    try {
      localStorage.setItem("tulane-sop-records", JSON.stringify(newRecords));
    } catch (e) {
      console.error("Could not write to local storage:", e);
    }
  };

  // Turn on device camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera capture failed:", err);
      setCameraError(
        "Could not access mobile or webcam device. Please ensure you granted camera permissions or upload an image file instead."
      );
      setIsCameraActive(false);
    }
  };

  // Turn off device camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Snap photo frame from the streaming video
  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImage(dataUrl);
        stopCamera();
        setSuccessMessage("Photo captured successfully! Ready to scan.");
      }
    } catch (err) {
      console.error("Could not capture photo frame:", err);
      setCameraError("Failed to render photograph frame.");
    }
  };

  // Handle local image file upload selection
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please drop/select a valid image file of a chemical label.");
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(10);
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setUploadProgress(100);
        setSuccessMessage("Label image uploaded successfully! Ready to scan.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Could not parse this label image.");
    };
    reader.readAsDataURL(file);
  };

  // Reset the scanned image and current state
  const clearScanState = () => {
    setImage(null);
    setSopData(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    setActiveRecordId(null);
    stopCamera();
  };

  // Load preset sample chemicals
  const loadPreset = (preset: PresetChemical) => {
    clearScanState();
    setMetadata(preset.defaultMetadata);
    setSopData(preset.sop);
    setImage(preset.imageUrl);
    
    // Set matching safety equipment coordinates for the preset
    if (preset.name.includes("THF") || preset.name.includes("Tetrahydrofuran")) {
      setEquipmentMap({
        eyewash: { distance: 8, direction: "NE", description: "beside the primary chemical reagent sink", active: true },
        shower: { distance: 12, direction: "NW", description: "adjacent to the main exit doorway", active: true },
        extinguisher: { distance: 15, direction: "S", description: "mounted right outside Room 402 cabinet", active: true }
      });
    } else if (preset.name.includes("Nitric")) {
      setEquipmentMap({
        eyewash: { distance: 6, direction: "SE", description: "inside acid fume hood station basin", active: true },
        shower: { distance: 10, direction: "NE", description: "beside the central corridor bay", active: true },
        extinguisher: { distance: 12, direction: "S", description: "mounted on the column beside the entrance door", active: true }
      });
    } else if (preset.name.includes("Carbon")) {
      setEquipmentMap({
        eyewash: { distance: 12, direction: "W", description: "outside gas cabinet security enclosure", active: true },
        shower: { distance: 15, direction: "N", description: "by the main physics lab common aisle", active: true },
        extinguisher: { distance: 10, direction: "SE", description: "on the side of the reactor control console", active: true }
      });
    }

    setSuccessMessage(`Pre-loaded complete EHS safety data sheet for ${preset.name}! You can now edit and print.`);
  };

  // Trigger Gemini AI full-stack scanning endpoint
  const scanChemicalLabel = async () => {
    if (!image) {
      setErrorMessage("Please take a photo or select an image first.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/generate-sop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: image,
          department: metadata.department,
          room: metadata.room,
          pi: metadata.principalInvestigator,
          dsr: metadata.dsr,
          date: metadata.dateCreated,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Internal response was not successful.");
      }

      setSopData(data.sop);
      setSuccessMessage(`Successfully compiled federal safety standards and created customized Tulane SOP for ${data.sop.chemicalName}!`);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setErrorMessage(
        `Failed to generate SOP: ${err.message}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current active SOP draft to Lab Safety Vault
  const saveActiveSopToLibrary = () => {
    if (!sopData) return;

    try {
      const newRecord: SavedSOPRecord = {
        id: activeRecordId || crypto.randomUUID(),
        metadata: { ...metadata },
        sop: { ...sopData },
        scannedAt: new Date().toLocaleString(),
        imageThumbnail: image || undefined,
      };

      let nextRecords: SavedSOPRecord[];
      if (activeRecordId) {
        // Update existing record
        nextRecords = savedRecords.map((rec) =>
          rec.id === activeRecordId ? newRecord : rec
        );
        setSuccessMessage("Successfully customized and updated this SOP in your Lab Safety Library!");
      } else {
        // Add new record
        nextRecords = [newRecord, ...savedRecords];
        setActiveRecordId(newRecord.id);
        setSuccessMessage("Standard Operating Procedure finalized and saved to Tulane Safe Lab Library Vault!");
      }

      updateSavedRecords(nextRecords);
    } catch (e) {
      console.error("Error saving record:", e);
      setErrorMessage("Could not safe-keep this SOP inside local memory.");
    }
  };

  // Load recorded SOP from library selection
  const loadSavedRecord = (record: SavedSOPRecord) => {
    setMetadata(record.metadata);
    setSopData(record.sop);
    setImage(record.imageThumbnail || null);
    setActiveRecordId(record.id);
    setActiveTab("scan");
    setSuccessMessage(`Loaded ${record.sop.chemicalName} SOP compiled on ${record.scannedAt}`);
  };

  // Delete saved record from history
  const deleteSavedRecord = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = savedRecords.filter((rec) => rec.id !== id);
    updateSavedRecords(updated);
    if (activeRecordId === id) {
      setActiveRecordId(null);
      setSopData(null);
      setImage(null);
    }
    setSuccessMessage("Selected chemical safety record removed from your local EHS vault.");
  };

  // Handle inline live edits of the generated SOP fields
  const handleSopFieldChange = (
    section: "general" | "safety" | "spillAndFirstAid",
    field: string,
    value: any
  ) => {
    if (!sopData) return;

    if (section === "general") {
      setSopData({
        ...sopData,
        [field]: value,
      });
    } else if (section === "safety") {
      setSopData({
        ...sopData,
        safetyMeasures: {
          ...sopData.safetyMeasures,
          [field]: value,
        },
      });
    } else if (section === "spillAndFirstAid") {
      setSopData({
        ...sopData,
        spillAndFirstAid: {
          ...sopData.spillAndFirstAid,
          [field]: value,
        },
      });
    }
  };

  // Handle list inputs (like multi-selection of primary hazard tags)
  const toggleHazardTag = (hazard: string) => {
    if (!sopData) return;
    const current = [...sopData.hazards];
    const index = current.indexOf(hazard);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(hazard);
    }
    setSopData({
      ...sopData,
      hazards: current,
    });
  };

  // Print SOP Document trigger (clean paper style handled by our @media print CSS)
  const triggerPrintSOP = () => {
    window.print();
  };

  // Export formal PDF SOP Document using client-side jsPDF with Tulane styling and layout
  const triggerExportSOPPdf = () => {
    if (!sopData) return;
    try {
      generateSOPPdf(metadata, sopData, equipmentMap);
      setSuccessMessage("Standard Operating Procedure exported successfully as an official Tulane EHS PDF document!");
    } catch (err: any) {
      console.error("PDF generation took an unexpected error:", err);
      setErrorMessage(`Could not export PDF automatically: ${err?.message || err}`);
    }
  };

  // Copy standard raw SOP text in elegant Markdown format to clipboard
  const copySopMarkdown = () => {
    if (!sopData) return;

    const markdownText = `
# STANDARD OPERATING PROCEDURE (SOP) FOR HANDLING HAZARDOUS CHEMICALS
**Tulane University Office of Environmental Health & Safety (EHS) Format**
*As per OSHA Laboratory Safety Guidance (29 CFR 1910.1450)*

---
## ADMINISTRATIVE OVERVIEW
- **Date Created/Revised**: ${metadata.dateCreated}
- **Department**: ${metadata.department}
- **Room**: ${metadata.room}
- **Principal Investigator (PI)**: ${metadata.principalInvestigator}
- **Department Safety Representative (DSR)**: ${metadata.dsr}
---

### 1. PURPOSE
${sopData.purpose}

### 2. RESPONSIBILITIES
${sopData.responsibilities}

### 3. NAME OF THE CHEMICAL(S)
- **Official Chemical Name**: ${sopData.chemicalName}
- **CAS Registration Number**: ${sopData.casNumber}

### 4. COMPLIANCE HAZARDS
- **Primary Hazard Classifications**: ${sopData.hazards.join(", ") || "None declared"}
- **Specific Acute Hazards**: ${sopData.additionalHazards}

### 5. SAFETY MEASURES & CONTROLS
- **Engineering Controls / Containment Devices**: ${sopData.safetyMeasures.engineeringControls}
- **Personal Protective Equipment (PPE)**: ${sopData.safetyMeasures.ppe}
- **Safer Process Substitutions**: ${sopData.safetyMeasures.saferAlternatives}

### 6. SAFE PROCEDURES FOR HANDLING
${sopData.handlingProcedures}

### 7. SECURE STORAGE REQUIREMENTS
- **Guidelines**: ${sopData.storageRequirements}

### 8. SPILLS, LEAKS, ACCIDENTS & FIRST AID
- **Chemical-Specific Spill Response**: ${sopData.spillAndFirstAid.spillProcedures}
- **First Aid Protocols**: ${sopData.spillAndFirstAid.firstAid}
- **Emergency Safety Location Guidance**: ${sopData.spillAndFirstAid.emergencyLocations}

### 9. STEPS FOR REGULATED DISPOSAL
${sopData.disposalGuidelines}

### 10. TRAINING REQUIREMENTS
${sopData.trainingRequirements}

### 11. TESTING & PERIODIC DOCUMENTATION
${sopData.testingAndDocumentation}

---
### 12. REGULATORY STANDARDS & EHS CROSS-REFERENCES
${sopData.regulatoryReferences}

*SOP generated automatically via the Tulane EHS Compliance Workstation. Contact Tulane OEHS at OEHS@tulane.edu for custom guidance.*
`;

    navigator.clipboard.writeText(markdownText.trim());
    setSuccessMessage("Full EHS Compliant SOP Markdown copied to your computer's clipboard! Paste it into Word or Scishield.");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filter saved records
  const filteredRecords = savedRecords.filter(rec => 
    rec.sop.chemicalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rec.sop.casNumber.includes(searchQuery) || 
    rec.metadata.principalInvestigator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER SECTION (Hidden when printing via index.css) */}
      <header className="bg-emerald-900 text-white shadow-md border-b-4 border-amber-500 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-emerald-950 p-2.5 rounded-lg flex items-center justify-center shadow-inner">
                <Shield className="w-8 h-8 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                    Tulane Chemical Safety SOP Workstation
                  </h1>
                  <span className="hidden sm:inline bg-amber-500/90 text-emerald-950 text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded uppercase">
                    EHS Compliant
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-sans mt-0.5">
                  OSHA 29 CFR 1910.1450 Compliance • Interactive Tulane OEHS Standard Operating Procedures
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="flex space-x-1 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80">
              <button
                onClick={() => setActiveTab("scan")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "scan"
                    ? "bg-amber-500 text-emerald-950 shadow-sm"
                    : "text-emerald-100 hover:bg-emerald-800/40 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Scan & Compose
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "library"
                    ? "bg-amber-500 text-emerald-950 shadow-sm"
                    : "text-emerald-100 hover:bg-emerald-800/40 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Lab Vault ({savedRecords.length})
              </button>
              <button
                onClick={() => setActiveTab("handbook")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "handbook"
                    ? "bg-amber-500 text-emerald-950 shadow-sm"
                    : "text-emerald-100 hover:bg-emerald-800/40 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                EHS Handbook
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* EMERGENCY SAFETY BULLETBAR (Only visible when not printing) */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Federal Guideline Checklist:</strong> All hazardous reagent processes at Tulane must maintain standard safety drafts. Distilled ethers and corrosives demand strict review.</span>
          </div>
          <div className="flex gap-4">
            <span>Tulane OEHS: <strong>OEHS@tulane.edu</strong></span>
            <span>Emergency: <strong>911 / (504) 865-5200</strong></span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* MESSAGES BAR */}
        <AnimatePresence mode="popLayout">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-start gap-2.5 no-print"
            >
              <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold">EHS Compliance Error</h5>
                <p>{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-start justify-between gap-2.5 no-print"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Protocol Executed</h5>
                  <p>{successMessage}</p>
                </div>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)} 
                className="text-emerald-600 hover:text-emerald-900 font-bold transition text-sm px-1.5"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================= */}
        {/* TAB 1: SCAN & NEW SOP GENERATION */}
        {/* ======================================= */}
        {activeTab === "scan" && (
          <div className="space-y-6">
            
            {/* STEP CONTROLS PANEL (Hidden if SOP exists and user is previewing, but let's make it compact) */}
            {!sopData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                
                {/* Panel 1: Photograph Capture or Upload */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between py-5 px-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1 uppercase tracking-tight">
                      <Camera className="w-4 h-4 text-emerald-700" />
                      1. Scan Reagent Container Label
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Federal standards expect correct identification of safety components. Hold your reagent bottle's GHS safety shield in front of the camera or upload a direct picture.
                    </p>

                    {/* Camera Active Viewport */}
                    {isCameraActive ? (
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-w-lg mx-auto border-2 border-dashed border-amber-400">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/50 via-transparent to-transparent gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-amber-500 hover:bg-amber-600 text-emerald-950 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                          >
                            <Check className="w-4 h-4" />
                            Snapping Frame
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Drag Upload Area */}
                        <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition group">
                          <Upload className="w-10 h-10 text-slate-400 group-hover:text-emerald-700 transition mb-2" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-900">
                            Upload Label Photo
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            PNG, JPG, or HEIC up to 10MB
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageFileChange} 
                            className="hidden" 
                          />
                        </label>

                        {/* Interactive Mobile Camera Trigger */}
                        <div 
                          onClick={startCamera}
                          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition group"
                        >
                          <Camera className="w-10 h-10 text-slate-400 group-hover:text-emerald-700 transition mb-2" />
                          <span className="text-xs font-medium text-slate-700 group-hover:text-emerald-900">
                            Use Device Camera
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 text-center">
                            Ideal for physical smartphone scanning
                          </span>
                        </div>

                      </div>
                    )}

                    {cameraError && (
                      <p className="text-[11px] text-red-600 mt-2 italic font-medium">{cameraError}</p>
                    )}

                    {/* Image Preview Box */}
                    {image && !isCameraActive && (
                      <div className="mt-4 p-3 bg-slate-100 rounded-lg flex items-center justify-between gap-3 max-w-md border border-slate-200">
                        <div className="flex items-center gap-3">
                          <img 
                            src={image} 
                            alt="Chemical Label Preview" 
                            className="w-12 h-12 rounded object-cover border border-slate-300 shadow-sm"
                          />
                          <div>
                            <span className="text-xs font-semibold text-emerald-900">Chemical Label Captured</span>
                            <span className="block text-[10px] text-slate-400">Ready for GHS & OSHA protocol extraction</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setImage(null)}
                          className="text-slate-400 hover:text-red-600 transition"
                          title="Remove Photograph"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Sensing Framework Status: <strong className="text-emerald-700">ONLINE</strong></span>
                    <span>No chemicals available on hand? Use pre-loaded models on the right →</span>
                  </div>
                </div>

                {/* Panel 2: Demo Presets */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-5 px-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1 uppercase tracking-tight">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Quick Demo Presets
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Are you a reviewer or TA without physical chemical reagents? Tap on these preset manufacturer label datasheets to immediately fill the Tulane EHS custom document layout:
                    </p>

                    <div className="space-y-2.5">
                      {PRESET_CHEMICALS.map((chem, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => loadPreset(chem)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/30 transition flex flex-row items-start gap-2.5 group"
                        >
                          <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition">
                            {idx + 1}
                          </span>
                          <div className="text-xs">
                            <span className="font-bold text-slate-800 group-hover:text-emerald-900 block">
                              {chem.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              CAS: {chem.cas}
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0 line-clamp-1 italic mt-0.5">
                              {chem.description}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-snug">
                    Preset templates demonstrate the print-ready CSS rendering and document edit mechanics perfectly.
                  </div>
                </div>

              </div>
            )}

            {/* METADATA OVERVIEW INPUTS: department, room, pi, dsr (Only hidden when printing) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 no-print">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700" />
                Tulane Lab Administrative Context (Header Fields)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Principal Investigator (PI)
                  </label>
                  <input
                    type="text"
                    value={metadata.principalInvestigator}
                    onChange={(e) => setMetadata({ ...metadata, principalInvestigator: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded px-2.5 py-1.5 text-xs text-slate-800 transition outline-none"
                    placeholder="e.g. Dr. Elizabeth Tulane"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Lab Department
                  </label>
                  <input
                    type="text"
                    value={metadata.department}
                    onChange={(e) => setMetadata({ ...metadata, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded px-2.5 py-1.5 text-xs text-slate-800 transition outline-none"
                    placeholder="e.g. Biochemistry"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Lab Room Number
                  </label>
                  <input
                    type="text"
                    value={metadata.room}
                    onChange={(e) => setMetadata({ ...metadata, room: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded px-2.5 py-1.5 text-xs text-slate-800 transition outline-none"
                    placeholder="e.g. Percival Hall 34"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Dept Safety Rep (DSR)
                  </label>
                  <input
                    type="text"
                    value={metadata.dsr}
                    onChange={(e) => setMetadata({ ...metadata, dsr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded px-2.5 py-1.5 text-xs text-slate-800 transition outline-none"
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Mandatory Date
                  </label>
                  <input
                    type="date"
                    value={metadata.dateCreated}
                    onChange={(e) => setMetadata({ ...metadata, dateCreated: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded px-2.5 py-1.5 text-xs text-slate-800 transition outline-none"
                  />
                </div>

              </div>

              {/* ACTION: GENERATE THROUGH GEMINI API (If image uploaded and not yet scanned) */}
              {image && !sopData && (
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={scanChemicalLabel}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Scanned & Researching EHS Database...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Extract Label & Search MSDS
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* RENDER PROGRESS LOADER */}
            {isGenerating && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-xl mx-auto no-print">
                <RefreshCw className="w-12 h-12 text-emerald-700 animate-spin mx-auto mb-4" />
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Lab Compliance Scientist at Work...</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  We are analysing the uploaded reagent label under federal safety guidelines, looking up safety sheets (SDS), cross-referencing OSHA 29 CFR 1910.1450 standard, and organizing Tulane safety policies, emergency first-aid triggers, and peroxide testing criteria. Please hold on...
                </p>
                <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Performing optical label OCR....
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Querying OSHA / NIOSH safety databases...
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                    Parsing specialized Tulane OEHS template...
                  </div>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* WORKSPACE AREA: ACTIONS & TWO-PANEL WORKSTATION */}
            {/* ======================================= */}
            {sopData && !isGenerating && (
              <div className="space-y-4">
                
                {/* FLOATING ACTION TOOLBAR (Hidden in Print) */}
                <div className="bg-slate-800 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide">SOP ACTIVE</span>
                    <span className="text-xs text-slate-200 font-medium">Editing & Previewing standard for: <strong>{sopData.chemicalName || "Custom Chemical"}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={saveActiveSopToLibrary}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5"
                      title="Save to history"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save to Vault
                    </button>
                    <button
                      onClick={copySopMarkdown}
                      className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3.5 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5"
                      title="Copy Markdown representation"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Raw Text
                    </button>
                    <button
                      onClick={triggerExportSOPPdf}
                      className="bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs px-3.5 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 shadow-sm"
                      title="Export formal PDF with proper pagination & EHS layout"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Export EHS PDF
                    </button>
                    <button
                      onClick={triggerPrintSOP}
                      className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3.5 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5"
                      title="Trigger browser print/pdf layout"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Layout
                    </button>
                    <button
                      onClick={clearScanState}
                      className="text-slate-400 hover:text-white transition text-xs font-semibold px-2"
                    >
                      Clear Scan
                    </button>
                  </div>
                </div>

                {/* THE DUAL MODES WORKSTATION WORKSPACE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT SPLIT (Col 1-5): THE FIELD EDITORS & CONTROLS */}
                  <div className="lg:col-span-5 space-y-4 no-print">
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                      <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <Edit className="w-4 h-4 text-emerald-700" />
                          Fine-Tune SOP Content
                        </h4>
                        <span className="text-[10px] text-slate-400 italic">Review & Approve draft</span>
                      </div>

                      {/* Navigation categories */}
                      <div className="flex bg-slate-100 p-1 rounded-lg text-xs mb-4">
                        <button
                          onClick={() => setActiveEditingSection("general")}
                          className={`flex-1 text-center py-1 rounded transition-all font-semibold ${
                            activeEditingSection === "general" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Hazards & Info
                        </button>
                        <button
                          onClick={() => setActiveEditingSection("safety")}
                          className={`flex-1 text-center py-1 rounded transition-all font-semibold ${
                            activeEditingSection === "safety" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Controls & Handling
                        </button>
                        <button
                          onClick={() => setActiveEditingSection("spillAndFirstAid")}
                          className={`flex-1 text-center py-1 rounded transition-all font-semibold ${
                            activeEditingSection === "spillAndFirstAid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Emergency & Other
                        </button>
                      </div>

                      {/* Category forms */}
                      <div className="space-y-4">
                        
                        {/* SUBFORM 1: HAZARDS & INFO */}
                        {activeEditingSection === "general" && (
                          <div className="space-y-4 animate-fadeIn">
                            
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chemical Name</label>
                              <input 
                                type="text"
                                value={sopData.chemicalName}
                                onChange={(e) => handleSopFieldChange("general", "chemicalName", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CAS Number</label>
                              <input 
                                type="text"
                                value={sopData.casNumber}
                                onChange={(e) => handleSopFieldChange("general", "casNumber", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 font-mono outline-none"
                              />
                            </div>

                            {/* Hazard Tags Checker */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Primary GHS Classifications</label>
                              <div className="flex flex-wrap gap-1.5">
                                {["Flammable", "Corrosive", "Reactive", "Toxic"].map((tag) => {
                                  const isActive = sopData.hazards.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => toggleHazardTag(tag)}
                                      className={`text-[10px] font-bold py-1 px-2.5 rounded transition ${
                                        isActive 
                                          ? "bg-emerald-600 text-white shadow-sm" 
                                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Additional Hazards & Specific warnings</label>
                              <textarea
                                value={sopData.additionalHazards}
                                onChange={(e) => handleSopFieldChange("general", "additionalHazards", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">1. Purpose Statement</label>
                              <textarea
                                value={sopData.purpose}
                                onChange={(e) => handleSopFieldChange("general", "purpose", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">2. Role Responsibilities</label>
                              <textarea
                                value={sopData.responsibilities}
                                onChange={(e) => handleSopFieldChange("general", "responsibilities", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                          </div>
                        )}

                        {/* SUBFORM 2: CONTROLS & HANDLING */}
                        {activeEditingSection === "safety" && (
                          <div className="space-y-4 animate-fadeIn">
                            
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">5a. Engineering Controls (Fume hoods, glove boxes)</label>
                              <textarea
                                value={sopData.safetyMeasures.engineeringControls}
                                onChange={(e) => handleSopFieldChange("safety", "engineeringControls", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">5b. Personal Protective Equipment (PPE specify gloves)</label>
                              <textarea
                                value={sopData.safetyMeasures.ppe}
                                onChange={(e) => handleSopFieldChange("safety", "ppe", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">5c. Recommended Safer Substitutes</label>
                              <textarea
                                value={sopData.safetyMeasures.saferAlternatives}
                                onChange={(e) => handleSopFieldChange("safety", "saferAlternatives", e.target.value)}
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">6. Procedure for Handling & Behaviors to Avoid</label>
                              <textarea
                                value={sopData.handlingProcedures}
                                onChange={(e) => handleSopFieldChange("general", "handlingProcedures", e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">7. Storage & Incompatible Substances</label>
                              <textarea
                                value={sopData.storageRequirements}
                                onChange={(e) => handleSopFieldChange("general", "storageRequirements", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                          </div>
                        )}

                        {/* SUBFORM 3: EMERGENCY & OTHER */}
                        {activeEditingSection === "spillAndFirstAid" && (
                          <div className="space-y-4 animate-fadeIn">
                            
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">8a. Spill Response Guidelines</label>
                              <textarea
                                value={sopData.spillAndFirstAid.spillProcedures}
                                onChange={(e) => handleSopFieldChange("spillAndFirstAid", "spillProcedures", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">8b. First Aid Management</label>
                              <textarea
                                value={sopData.spillAndFirstAid.firstAid}
                                onChange={(e) => handleSopFieldChange("spillAndFirstAid", "firstAid", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">8c. Emergency Safety Station Locations</label>
                              <textarea
                                value={sopData.spillAndFirstAid.emergencyLocations}
                                onChange={(e) => handleSopFieldChange("spillAndFirstAid", "emergencyLocations", e.target.value)}
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            {/* INTERACTIVE COMPASS & MAP WIDGET FOR 8c */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
                              <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                                <div className="flex items-center space-x-2">
                                  <div className="p-1 bg-teal-50 text-teal-600 rounded">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <h5 className="text-[11px] font-bold text-slate-700">Interactive EHS Floor Plan Builder</h5>
                                    <p className="text-[9px] text-slate-400">Position safety items to automatically format and fill SOP field above</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                  📍 Workstation Bench (0,0)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* LEFT: Live SVG Canvas Floor plan */}
                                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-2 relative h-[250px] overflow-hidden">
                                  <svg className="w-full h-full max-w-[220px] max-h-[220px]" viewBox="0 0 300 300">
                                    {/* Concentric distance rings */}
                                    <circle cx="150" cy="150" r="30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                                    <circle cx="150" cy="150" r="60" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                                    <circle cx="150" cy="150" r="90" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                                    <circle cx="150" cy="150" r="120" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4,4" />
                                    
                                    {/* Center crosshairs */}
                                    <line x1="150" y1="10" x2="150" y2="290" stroke="#f8fafc" strokeWidth="1" />
                                    <line x1="10" y1="150" x2="290" y2="150" stroke="#f8fafc" strokeWidth="1" />

                                    {/* Distance Labels */}
                                    <text x="150" y="116" className="text-[7.5px] fill-slate-400 font-mono" textAnchor="middle">5 ft</text>
                                    <text x="150" y="86" className="text-[7.5px] fill-slate-400 font-mono" textAnchor="middle">10 ft</text>
                                    <text x="150" y="56" className="text-[7.5px] fill-slate-400 font-mono" textAnchor="middle">15 ft</text>
                                    <text x="150" y="26" className="text-[7.5px] fill-slate-400 font-mono" textAnchor="middle">20 ft</text>

                                    {/* Compass markers */}
                                    <text x="150" y="14" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">N</text>
                                    <text x="288" y="153" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">E</text>
                                    <text x="150" y="293" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">S</text>
                                    <text x="12" y="153" className="text-[9px] font-bold fill-slate-400 font-sans" textAnchor="middle">W</text>

                                    {/* Connecting paths and Icons for active equipment */}
                                    {equipmentMap.eyewash.active && (() => {
                                      const pt = getCoordinates(equipmentMap.eyewash.direction, equipmentMap.eyewash.distance);
                                      return (
                                        <g>
                                          <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                                          <circle cx={pt.x} cy={pt.y} r="14" fill="#ecfeff" stroke="#06b6d4" strokeWidth="2" className="cursor-pointer transition-all hover:scale-110" onClick={() => setEditorSelectedEquipment("eyewash")} />
                                          <text x={pt.x} y={pt.y + 4} className="text-[11px] cursor-pointer" textAnchor="middle" onClick={() => setEditorSelectedEquipment("eyewash")}>🚰</text>
                                          <rect x={pt.x - 22} y={pt.y - 28} width="44" height="11" rx="2" fill="#0891b2" opacity="0.9" />
                                          <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Eyewash</text>
                                        </g>
                                      );
                                    })()}

                                    {equipmentMap.shower.active && (() => {
                                      const pt = getCoordinates(equipmentMap.shower.direction, equipmentMap.shower.distance);
                                      return (
                                        <g>
                                          <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                                          <circle cx={pt.x} cy={pt.y} r="14" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" className="cursor-pointer transition-all hover:scale-110" onClick={() => setEditorSelectedEquipment("shower")} />
                                          <text x={pt.x} y={pt.y + 4} className="text-[11px] cursor-pointer" textAnchor="middle" onClick={() => setEditorSelectedEquipment("shower")}>🚿</text>
                                          <rect x={pt.x - 22} y={pt.y - 28} width="44" height="11" rx="2" fill="#059669" opacity="0.9" />
                                          <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Shower</text>
                                        </g>
                                      );
                                    })()}

                                    {equipmentMap.extinguisher.active && (() => {
                                      const pt = getCoordinates(equipmentMap.extinguisher.direction, equipmentMap.extinguisher.distance);
                                      return (
                                        <g>
                                          <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                                          <circle cx={pt.x} cy={pt.y} r="14" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" className="cursor-pointer transition-all hover:scale-110" onClick={() => setEditorSelectedEquipment("extinguisher")} />
                                          <text x={pt.x} y={pt.y + 4} className="text-[11px] cursor-pointer" textAnchor="middle" onClick={() => setEditorSelectedEquipment("extinguisher")}>🧯</text>
                                          <rect x={pt.x - 24} y={pt.y - 28} width="48" height="11" rx="2" fill="#dc2626" opacity="0.9" />
                                          <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Extinguisher</text>
                                        </g>
                                      );
                                    })()}

                                    {/* Center Node (Workstation) */}
                                    <circle cx="150" cy="150" r="10" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
                                    <circle cx="150" cy="150" r="4" fill="#d97706" />
                                  </svg>
                                  <div className="absolute bottom-1 text-[8.5px] text-slate-450 font-mono text-center w-full">
                                    Click nodes or tabs to configure position
                                  </div>
                                </div>

                                {/* RIGHT: Selected Equipment Form controls */}
                                <div className="space-y-2">
                                  {/* Equipment Selection Tabs */}
                                  <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-slate-200 rounded">
                                    <button
                                      type="button"
                                      onClick={() => setEditorSelectedEquipment("eyewash")}
                                      className={`py-0.5 text-[9px] font-bold rounded flex items-center justify-center space-x-1 transition-all ${
                                        editorSelectedEquipment === "eyewash"
                                          ? "bg-white text-cyan-700 shadow-xs"
                                          : "text-slate-650 hover:text-slate-900"
                                      }`}
                                    >
                                      <span>🚰</span> <span className="inline">Eyewash</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditorSelectedEquipment("shower")}
                                      className={`py-0.5 text-[9px] font-bold rounded flex items-center justify-center space-x-1 transition-all ${
                                        editorSelectedEquipment === "shower"
                                          ? "bg-white text-emerald-700 shadow-xs"
                                          : "text-slate-650 hover:text-slate-900"
                                      }`}
                                    >
                                      <span>🚿</span> <span className="inline">Shower</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditorSelectedEquipment("extinguisher")}
                                      className={`py-0.5 text-[9px] font-bold rounded flex items-center justify-center space-x-1 transition-all ${
                                        editorSelectedEquipment === "extinguisher"
                                          ? "bg-white text-red-700 shadow-xs"
                                          : "text-slate-650 hover:text-slate-900"
                                      }`}
                                    >
                                      <span>🧯</span> <span className="inline">Extinguisher</span>
                                    </button>
                                  </div>

                                  {/* Configuration Subbox */}
                                  <div className="p-2 bg-white rounded border border-slate-200 space-y-1.5">
                                    {/* Active Toggle Switch */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-slate-650">Enable in floorplan</span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={equipmentMap[editorSelectedEquipment].active}
                                          onChange={(e) => updateEquipmentItem(editorSelectedEquipment, "active", e.target.checked)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                      </label>
                                    </div>

                                    {equipmentMap[editorSelectedEquipment].active ? (
                                      <>
                                        {/* Distance slider */}
                                        <div className="space-y-0.5">
                                          <div className="flex justify-between text-[9px]">
                                            <span className="font-medium text-slate-500">Radius (distance):</span>
                                            <span className="font-bold font-mono text-slate-700">{equipmentMap[editorSelectedEquipment].distance} ft</span>
                                          </div>
                                          <input
                                            type="range"
                                            min="2"
                                            max="25"
                                            value={equipmentMap[editorSelectedEquipment].distance}
                                            onChange={(e) => updateEquipmentItem(editorSelectedEquipment, "distance", parseInt(e.target.value))}
                                            className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                                          />
                                        </div>

                                        {/* Direction Compass Dial */}
                                        <div className="space-y-0.5">
                                          <span className="block text-[8.5px] font-medium text-slate-500">Cardinal direction relative to Bench:</span>
                                          <div className="flex justify-center">
                                            <div className="grid grid-cols-3 gap-0.5 w-[75px] h-[75px]">
                                              {[
                                                { dir: "NW", label: "↖" },
                                                { dir: "N", label: "↑" },
                                                { dir: "NE", label: "↗" },
                                                { dir: "W", label: "←" },
                                                { dir: "CENTER", label: "🧪" },
                                                { dir: "E", label: "→" },
                                                { dir: "SW", label: "↙" },
                                                { dir: "S", label: "↓" },
                                                { dir: "SE", label: "↘" },
                                              ].map((cell, idx) => {
                                                if (cell.dir === "CENTER") {
                                                  return (
                                                    <div
                                                      key={idx}
                                                      className="flex items-center justify-center text-[10px] bg-amber-50 text-amber-600 font-bold border border-amber-100 rounded"
                                                    >
                                                      {cell.label}
                                                    </div>
                                                  );
                                                }
                                                const isSelected = equipmentMap[editorSelectedEquipment].direction === cell.dir;
                                                return (
                                                  <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => updateEquipmentItem(editorSelectedEquipment, "direction", cell.dir)}
                                                    className={`flex flex-col items-center justify-center rounded text-[8px] font-bold transition-all ${
                                                      isSelected
                                                        ? "bg-slate-800 text-white shadow-xs"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-150"
                                                    }`}
                                                  >
                                                    <span className="text-[10px] leading-none">{cell.label}</span>
                                                    <span className="text-[6px] font-mono leading-none">{cell.dir}</span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Specific placement description */}
                                        <div className="space-y-0.5">
                                          <span className="block text-[8.5px] font-medium text-slate-500">Specific location description:</span>
                                          <input
                                            type="text"
                                            value={equipmentMap[editorSelectedEquipment].description || ""}
                                            onChange={(e) => updateEquipmentItem(editorSelectedEquipment, "description", e.target.value)}
                                            placeholder="e.g. beside chemical sink"
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-350"
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="py-4 text-center text-[9px] text-slate-400 italic">
                                        Disabled on workspace schematic
                                      </div>
                                    )}
                                  </div>

                                  {/* Sync Button */}
                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const generated = getEquipmentSOPString(equipmentMap);
                                        handleSopFieldChange("spillAndFirstAid", "emergencyLocations", generated);
                                      }}
                                      className="w-full bg-slate-800 text-white rounded py-1 text-[9px] font-bold hover:bg-slate-700 flex items-center justify-center space-x-1.5 shadow-xs"
                                    >
                                      <span>🔄</span>
                                      <span>Update field text from map</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">9. Steps for Regulated Disposal</label>
                              <textarea
                                value={sopData.disposalGuidelines}
                                onChange={(e) => handleSopFieldChange("general", "disposalGuidelines", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono text-emerald-800">11. Peroxide/Degradation Test Criteria</label>
                              <textarea
                                value={sopData.testingAndDocumentation}
                                onChange={(e) => handleSopFieldChange("general", "testingAndDocumentation", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white border-emerald-500 rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">12. OSHA/EHS Regulatory References</label>
                              <textarea
                                value={sopData.regulatoryReferences}
                                onChange={(e) => handleSopFieldChange("general", "regulatoryReferences", e.target.value)}
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded p-2 text-xs text-slate-800 outline-none resize-y leading-normal"
                              />
                            </div>

                          </div>
                        )}

                      </div>
                    </div>

                    {/* Quick guidelines reminder list */}
                    <div className="bg-slate-100 rounded-lg p-4 border border-slate-150 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                      <h5 className="font-bold text-slate-800">Tulane reviewer tip:</h5>
                      <p>• Ethers (like THF, Ethyl Ether) and cyclic alkanes demand 3-6 month peroxide testing frequency.</p>
                      <p>• Avoid using paper towels for strong liquid oxidizers (Nitric/Sulfuric Acid) as spark points may ignite.</p>
                    </div>

                  </div>

                  {/* RIGHT SPLIT (Col 6-12): THE HIGH-FIDELITY PRINTABLE TULANE SOP CANVAS */}
                  {/* Styled like the physical paper format screenshots */}
                  <div className="lg:col-span-7 bg-white rounded-xl shadow-lg border-2 border-slate-300 p-6 sm:p-8 md:p-10 text-neutral-900 font-sans leading-relaxed sop-card max-w-full overflow-x-auto">
                    
                    {/* PAPER BRANDING */}
                    <div className="pb-3 border-b-2 border-emerald-800 flex justify-between items-end mb-4 flex-wrap gap-2 text-neutral-700">
                      <div>
                        <h2 className="text-emerald-900 text-lg font-bold font-sans uppercase tracking-tight">SOP for Handling Hazardous Chemicals</h2>
                        <span className="text-[10px] text-amber-600 font-bold tracking-widest block uppercase">TULANE UNIVERSITY OFFICE OF ENVIRONMENTAL HEALTH & SAFETY (OEHS)</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 no-print">Printed Format Template</span>
                    </div>

                    {/* METADATA FORM TABLE GRID (Exactly replicating the PDF template first page header) */}
                    <div className="border-1.5 border-black text-xs font-sans mb-6 printable-header-grid w-full">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 printable-row">
                        <div className="border border-black p-2.5 printable-cell">
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Date created/revised:</span>
                          <span className="font-semibold">{metadata.dateCreated || "N/A"}</span>
                        </div>
                        <div className="border border-black p-2.5 printable-cell">
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Department:</span>
                          <span className="font-semibold">{metadata.department || "N/A"}</span>
                        </div>
                        <div className="border border-black p-2.5 printable-cell">
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Room:</span>
                          <span className="font-semibold">{metadata.room || "N/A"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 printable-row">
                        <div className="border border-black p-2.5 sm:col-span-2 printable-cell">
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Principal Investigator:</span>
                          <span className="font-semibold">{metadata.principalInvestigator || "N/A"}</span>
                        </div>
                        <div className="border border-black p-2.5 printable-cell">
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wide">DSR (Safety Rep):</span>
                          <span className="font-semibold">{metadata.dsr || "N/A"}</span>
                        </div>
                      </div>

                    </div>

                    {/* BRIEF COMPLIANCE NOTICE STATEMENT */}
                    <div className="bg-neutral-50 border border-neutral-200 p-2 text-[10px] text-neutral-500 mb-6 font-sans leading-normal">
                      <span className="font-bold text-neutral-700">Notice:</span> Text below has been derived from official federal hazard sheets (SDS) and customized in compliance with Tulane University OEHS guidelines to reflect lab-specific Room {metadata.room} specifications under PI {metadata.principalInvestigator}.
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 1: PURPOSE */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide flex items-center gap-1.5 text-neutral-800">
                        1. Purpose
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.purpose}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 2: RESPONSIBILITIES */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide flex items-center gap-1.5 text-neutral-800">
                        2. Responsibilities
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.responsibilities}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 3: NAME OF CHEMICAL */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        3. Name of the Chemical(s)
                      </h4>
                      <div className="grid grid-cols-2 bg-neutral-50 border border-neutral-200 rounded p-2.5">
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase">Chemical Class / Reagent</span>
                          <span className="font-bold text-neutral-800 text-sm whitespace-normal break-words">{sopData.chemicalName}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-500 uppercase">CAS Registration number</span>
                          <span className="font-mono font-bold text-sm bg-neutral-200/60 px-1.5 py-0.5 rounded text-neutral-800">{sopData.casNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 4: HAZARDS */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        4. Hazards
                      </h4>
                      <div className="space-y-2">
                        
                        {/* Dynamic tags parsed */}
                        <div className="flex gap-1.5">
                          {sopData.hazards.map((tag) => (
                            <span 
                              key={tag} 
                              className="bg-red-50 text-red-950 text-[10px] font-bold border border-red-200 rounded py-0.5 px-2 uppercase tracking-wider"
                            >
                              • {tag}
                            </span>
                          ))}
                        </div>

                        {sopData.additionalHazards && (
                          <p className="text-neutral-700 leading-relaxed pl-1 pt-1 border-l-2 border-amber-500 bg-amber-50/20 py-1 px-2 text-xs font-sans">
                            <span className="font-extrabold text-amber-800">Warning Guidelines:</span> {sopData.additionalHazards}
                          </p>
                        )}

                        <p className="text-[10px] text-neutral-500 italic mt-1 leading-normal font-sans">
                          Consult Safety Data Sheet (SDS) (Section 2) for detailed information on chemical hazards. It is advisable to develop separate SOP(s) for chemicals with acute toxicities.
                        </p>
                      </div>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 5: SAFETY MEASURES */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        5. Safety Measures (Engineering controls, Containment, PPE)
                      </h4>
                      <div className="space-y-3 font-sans">
                        <div>
                          <strong className="block text-neutral-800 text-[11px] uppercase tracking-wide">• Personal Protective Equipment (PPE):</strong>
                          <p className="text-neutral-700 leading-relaxed">{sopData.safetyMeasures.ppe}</p>
                        </div>
                        <div>
                          <strong className="block text-neutral-800 text-[11px] uppercase tracking-wide">• Engineering Controls & Ventilation Devices:</strong>
                          <p className="text-neutral-700 leading-relaxed">{sopData.safetyMeasures.engineeringControls}</p>
                        </div>
                        <div>
                          <strong className="block text-neutral-800 text-[11px] uppercase tracking-wide">• Process Substitutions / Safer Alternatives:</strong>
                          <p className="text-neutral-700 leading-relaxed italic">{sopData.safetyMeasures.saferAlternatives}</p>
                        </div>
                      </div>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 6: COMPLIANT HANDLING */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        6. Procedure for Handling
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.handlingProcedures}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 7: STORAGE */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        7. Storage
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.storageRequirements}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 8: SPILLS & FIRST AID */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        8. Spills / Leaks / Accidents / First Aid Measures
                      </h4>
                      <div className="space-y-3 font-sans">
                        <div>
                          <strong className="block text-neutral-800 text-[11px]">• Immediate Spill Remediation Protocols:</strong>
                          <p className="text-neutral-700 leading-relaxed">{sopData.spillAndFirstAid.spillProcedures}</p>
                        </div>
                        <div>
                          <strong className="block text-neutral-800 text-[11px]">• Mandatory First Aid Measures:</strong>
                          <p className="text-neutral-700 leading-relaxed">{sopData.spillAndFirstAid.firstAid}</p>
                        </div>
                        <div>
                          <strong className="block text-neutral-800 text-[11px]">• Lab Emergency Equipment Positions:</strong>
                          <p className="text-neutral-700 leading-relaxed italic">{sopData.spillAndFirstAid.emergencyLocations}</p>
                        </div>

                        {/* HIGH FIDELITY LAYOUT SCHEMATIC MAP IN SOP */}
                        <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded p-3 flex flex-col sm:flex-row items-center justify-center gap-6 no-print-break print:break-inside-avoid">
                          <div className="w-[180px] h-[180px] shrink-0 border border-neutral-250 rounded bg-white p-1">
                            <svg className="w-full h-full" viewBox="0 0 300 300">
                              {/* Concentric distance rings */}
                              <circle cx="150" cy="150" r="30" fill="none" stroke="#e1e1e1" strokeWidth="1" strokeDasharray="3,3" />
                              <circle cx="150" cy="150" r="60" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="3,3" />
                              <circle cx="150" cy="150" r="90" fill="none" stroke="#ccc" strokeWidth="1" strokeDasharray="3,3" />
                              <circle cx="150" cy="150" r="120" fill="none" stroke="#999" strokeWidth="1.2" strokeDasharray="4,4" />
                              
                              {/* Center crosshairs */}
                              <line x1="150" y1="10" x2="150" y2="290" stroke="#f0f0f0" strokeWidth="1" />
                              <line x1="10" y1="150" x2="290" y2="150" stroke="#f0f0f0" strokeWidth="1" />

                              {/* Distance Labels */}
                              <text x="150" y="116" className="text-[8px] fill-neutral-400 font-mono text-center" textAnchor="middle">5 ft</text>
                              <text x="150" y="86" className="text-[8px] fill-neutral-400 font-mono text-center" textAnchor="middle">10 ft</text>
                              <text x="150" y="56" className="text-[8px] fill-neutral-400 font-mono text-center" textAnchor="middle">15 ft</text>
                              <text x="150" y="26" className="text-[8px] fill-neutral-400 font-mono text-center" textAnchor="middle">20 ft</text>

                              {/* Compass markers */}
                              <text x="150" y="14" className="text-[9px] font-bold fill-neutral-500 font-sans text-center" textAnchor="middle">N</text>
                              <text x="288" y="153" className="text-[9px] font-bold fill-neutral-500 font-sans text-center" textAnchor="middle">E</text>
                              <text x="150" y="293" className="text-[9px] font-bold fill-neutral-500 font-sans text-center" textAnchor="middle">S</text>
                              <text x="12" y="153" className="text-[9px] font-bold fill-neutral-500 font-sans text-center" textAnchor="middle">W</text>

                              {/* Connecting paths and Icons for active equipment */}
                              {equipmentMap.eyewash.active && (() => {
                                const pt = getCoordinates(equipmentMap.eyewash.direction, equipmentMap.eyewash.distance);
                                return (
                                  <g>
                                    <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#0891b2" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <circle cx={pt.x} cy={pt.y} r="14" fill="#ecfeff" stroke="#0891b2" strokeWidth="2" />
                                    <text x={pt.x} y={pt.y + 4} className="text-[11px]" textAnchor="middle">🚰</text>
                                    <rect x={pt.x - 22} y={pt.y - 28} width="44" height="11" rx="2" fill="#0891b2" />
                                    <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Eyewash</text>
                                  </g>
                                );
                              })()}

                              {equipmentMap.shower.active && (() => {
                                const pt = getCoordinates(equipmentMap.shower.direction, equipmentMap.shower.distance);
                                return (
                                  <g>
                                    <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#059669" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <circle cx={pt.x} cy={pt.y} r="14" fill="#f0fdf4" stroke="#059669" strokeWidth="2" />
                                    <text x={pt.x} y={pt.y + 4} className="text-[11px]" textAnchor="middle">🚿</text>
                                    <rect x={pt.x - 22} y={pt.y - 28} width="44" height="11" rx="2" fill="#059669" />
                                    <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Shower</text>
                                  </g>
                                );
                              })()}

                              {equipmentMap.extinguisher.active && (() => {
                                const pt = getCoordinates(equipmentMap.extinguisher.direction, equipmentMap.extinguisher.distance);
                                return (
                                  <g>
                                    <line x1="150" y1="150" x2={pt.x} y2={pt.y} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <circle cx={pt.x} cy={pt.y} r="14" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
                                    <text x={pt.x} y={pt.y + 4} className="text-[11px]" textAnchor="middle">🧯</text>
                                    <rect x={pt.x - 24} y={pt.y - 28} width="48" height="11" rx="2" fill="#dc2626" />
                                    <text x={pt.x} y={pt.y - 20} className="text-[7.5px] fill-white font-bold" textAnchor="middle">Extinguisher</text>
                                  </g>
                                );
                              })()}

                              {/* Center Node (Workstation) */}
                              <circle cx="150" cy="150" r="10" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
                              <circle cx="150" cy="150" r="4" fill="#d97706" />
                            </svg>
                          </div>
                          
                          {/* Legend / Info List */}
                          <div className="space-y-1.5 text-[10.5px] max-w-sm text-neutral-700">
                            <h5 className="font-bold text-neutral-800 border-b border-neutral-200 pb-0.5">Laboratory EHS Equipment Layout</h5>
                            <div className="grid grid-cols-[16px_1fr] items-start gap-1">
                              <span className="text-center">🧪</span>
                              <span><strong>Workstation Bench</strong> (Reference Origin point 0,0)</span>
                            </div>
                            {equipmentMap.eyewash.active && (
                              <div className="grid grid-cols-[16px_1fr] items-start gap-1">
                                <span className="text-cyan-600 text-center">🚰</span>
                                <span><strong>Eyewash</strong>: {equipmentMap.eyewash.distance} ft {equipmentMap.eyewash.direction} - {equipmentMap.eyewash.description || "In workspace bounds"}</span>
                              </div>
                            )}
                            {equipmentMap.shower.active && (
                              <div className="grid grid-cols-[16px_1fr] items-start gap-1">
                                <span className="text-emerald-600 text-center">🚿</span>
                                <span><strong>Safety Shower</strong>: {equipmentMap.shower.distance} ft {equipmentMap.shower.direction} - {equipmentMap.shower.description || "Direct path access"}</span>
                              </div>
                            )}
                            {equipmentMap.extinguisher.active && (
                              <div className="grid grid-cols-[16px_1fr] items-start gap-1">
                                <span className="text-red-600 text-center">🧯</span>
                                <span><strong>Fire Extinguisher</strong>: {equipmentMap.extinguisher.distance} ft {equipmentMap.extinguisher.direction} - {equipmentMap.extinguisher.description || "Mounted on structural unit"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 9: DISPOSAL */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        9. Disposal
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.disposalGuidelines}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 10: TRAINING */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b border-neutral-300 pb-1 mb-1.5 uppercase font-sans tracking-wide text-neutral-800">
                        10. Training
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans">{sopData.trainingRequirements}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 11: TESTING AND DOCUMENTATION */}
                    {/* ======================================= */}
                    <div className="mb-5 sop-section text-xs">
                      <h4 className="font-bold border-b-2 border-emerald-800 pb-1 mb-1.5 uppercase font-sans tracking-wide text-emerald-900 font-bold">
                        11. Testing and Documentation
                      </h4>
                      <p className="text-neutral-700 leading-relaxed font-sans bg-emerald-50/20 p-2 border border-dashed border-emerald-200 font-sans">{sopData.testingAndDocumentation}</p>
                    </div>

                    {/* ======================================= */}
                    {/* SOP SECTION NO 12: REGULATORY REFERENCES */}
                    {/* ======================================= */}
                    <div className="mt-8 pt-4 border-t border-black text-[10px] text-neutral-500 font-sans">
                      <p className="font-bold text-neutral-700 uppercase mb-1">Standard Regulatory Protocols Cross-Referenced:</p>
                      <p className="leading-relaxed mb-6">{sopData.regulatoryReferences}</p>
                      
                      {/* HIGH FIDELITY ADOBE ACROBAT PI COMPLIANCE SIGNATURE BLOCK */}
                      <div className="bg-amber-50/45 border-1.5 border-amber-500/80 rounded-lg p-3.5 print:bg-amber-50/20 print:border-amber-600 no-print-break print:break-inside-avoid">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 border-b border-amber-200/50 pb-2">
                          <div>
                            <h5 className="font-bold text-emerald-950 text-[11px] uppercase tracking-wide">
                              Principal Investigator (PI) Compliance Certification & EHS Approval
                            </h5>
                            <p className="text-[8.5px] text-neutral-600 leading-normal mt-0.5">
                              Certified validation for lab room <strong className="text-neutral-800">{metadata.room}</strong>. Eligible for direct paper ink signature or digital certified signature in Adobe Acrobat / Acrobat Sign.
                            </p>
                          </div>
                          
                          {/* Tulane Verified Stamp */}
                          <div className="shrink-0 bg-emerald-50 border border-emerald-600 rounded px-2 py-1 text-center font-bold text-emerald-950 tracking-tight leading-none">
                            <span className="block text-[6.5px] text-emerald-700 font-bold uppercase">Tulane EHS</span>
                            <span className="block text-[8px] mt-0.5">SOP COMPLIANT</span>
                            <span className="block text-[5.5px] font-normal text-neutral-500 mt-0.5">OSHA 29CFR1910</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                          {/* Left: Acrobat Digital/Physical signature field */}
                          <div className="sm:col-span-5">
                            <span className="block text-[8.5px] font-bold text-neutral-700 mb-1">
                              PI Signature Field / Adobe Certified ID:
                            </span>
                            <div className="border border-slate-300 bg-white min-h-[44px] rounded flex items-center justify-center p-2 relative hover:bg-slate-50 transition border-dashed hover:cursor-pointer group">
                              <span className="text-[8.5px] text-slate-400 font-italic tracking-wider text-center select-none group-hover:text-slate-500">
                                [ CLICK TO SIGN IN ADOBE ACROBAT ]
                              </span>
                              {/* Signature placeholder line */}
                              <div className="absolute bottom-1.5 left-2 right-2 border-b border-neutral-200 border-dotted"></div>
                            </div>
                          </div>

                          {/* Middle: Printed Name */}
                          <div className="sm:col-span-4">
                            <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
                              PI Printed Name
                            </span>
                            <div className="border-b border-neutral-300 py-1.5 text-[11px] font-semibold text-neutral-800">
                              {metadata.principalInvestigator || "_________________________________"}
                            </div>
                          </div>

                          {/* Right: Date field */}
                          <div className="sm:col-span-3">
                            <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
                              Approval Date
                            </span>
                            <div className="border-b border-neutral-300 py-1.5 text-[11px] font-semibold text-neutral-800">
                              {metadata.dateCreated || "__________________"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* IF NO SOP GENERATED, RENDER INSTRUCTIONS */}
            {!sopData && !isGenerating && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Info className="w-5 h-5 text-emerald-800" />
                  Tulane Laboratory Reagent Compliance SOP Builder Instructions
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
                  
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-sm block">1. Take Bottle Photo</span>
                    <p>Activate your phone's camera in-app or snap a photograph of a chemical container manufacturer label. Make sure the reagent name, GHS safety symbols, and caution lines are visible in standard lighting.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-sm block">2. OSHA Cross-Referencing</span>
                    <p>Click "Extract Label", which routes the photo to our backend model. Gemini extracts the molecule and executes MSDS/SDSs comparisons, aligning chemical thresholds with OSHA 29 CFR 1910.1450 codes.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-sm block">3. Review, Tweak & Print EHS</span>
                    <p>Once generated, you can directly edit any field in the draft forms! The high-fidelity safety template reacts instantly. Tap "Print" to export a clean, compliant physical paper worksheet for your fume hood.</p>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: MY LAB SAFETY LIBRARY */}
        {/* ======================================= */}
        {activeTab === "library" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5.5 h-5.5 text-emerald-700" />
                  Federal Safety Archives (Lab Vault)
                </h2>
                <p className="text-xs text-slate-500">
                  Manage previous chemical scanning and safety sheet drafts saved on this device.
                </p>
              </div>

              {/* Search vault */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by reagent name or CAS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 transition outline-none"
                />
              </div>
            </div>

            {/* List saved records */}
            {filteredRecords.length === 0 ? (
              <div className="text-center py-10 text-slate-400 border border-dashed border-slate-150 rounded-xl space-y-3">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto" />
                <p className="text-xs">
                  {searchQuery 
                    ? "No safety SOP drafts match your search query." 
                    : "Your safety library is empty. Upload or snap a photo of any lab reagent label to compile your first custom SOP!"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab("scan")}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                  >
                    Generate SOP now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => loadSavedRecord(record)}
                    className="border border-slate-200 hover:border-emerald-600 bg-slate-50/40 hover:bg-white rounded-xl overflow-hidden cursor-pointer transition shadow-sm hover:shadow-md flex flex-col justify-between group"
                  >
                    <div className="p-4.5 space-y-3.5">
                      
                      {/* Name Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-emerald-950 text-sm line-clamp-1">
                            {record.sop.chemicalName}
                          </h4>
                          <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            CAS: {record.sop.casNumber}
                          </span>
                        </div>

                        {/* Hazards indicators */}
                        <div className="flex flex-wrap gap-1 max-w-[50%] justify-end">
                          {record.sop.hazards.slice(0, 2).map((h) => (
                            <span 
                              key={h} 
                              className="text-[8px] font-bold border border-red-200 text-red-700 bg-red-50 rounded px-1"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Brief details of controls */}
                      <div className="text-[11px] text-slate-500 space-y-1">
                        <p className="line-clamp-2">
                          <strong>PPE Protective Measure:</strong> {record.sop.safetyMeasures.ppe}
                        </p>
                        <p className="line-clamp-1 border-t border-slate-100 pt-1">
                          <strong>Lab Room:</strong> {record.metadata.room} • <strong>PI:</strong> {record.metadata.principalInvestigator}
                        </p>
                      </div>

                    </div>

                    {/* Metadata Footer */}
                    <div className="bg-slate-50 px-4.5 py-2.5 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Saved: {record.scannedAt}</span>
                      <button
                        onClick={(e) => deleteSavedRecord(record.id, e)}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Delete draft from library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: EHS HANDBOOK FAQs */}
        {/* ======================================= */}
        {activeTab === "handbook" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-250 p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-slate-150 pb-4">
              <h2 className="text-lg font-bold text-emerald-900 font-sans uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-700" />
                Tulane EHS Chemical Safety Handbook
              </h2>
              <p className="text-xs text-slate-500">
                Administrative policies and frequently asked questions for laboratory research personnel and students.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* FAQ Section */}
              <div className="lg:col-span-8 space-y-6 text-xs text-slate-600 leading-relaxed">
                
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-800 text-sm">Do I have to write an SOP for all chemicals in my laboratory?</h4>
                  <p>
                    <strong>Answer:</strong> No, an SOP is only required for hazardous chemicals. If a chemical is not hazardous, an SOP is not needed. As per Hazard Communication Standards (HCS), a hazardous chemical is any element, compound, or mixture that poses a physical or health hazard.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-800 text-sm">Where do I locate the exact information on chemical hazards?</h4>
                  <p>
                    <strong>Answer:</strong> Detailed information is found in <strong>Section 2, "Hazard(s) Identification,"</strong> of its Safety Data Sheet (SDS). You can request an SDS from the manufacturer or query databases like the SciShield SDS index, CAMEO chemicals, or the NIOSH Pocket Guide to Chemical Hazards. This app automatically searches and cross-references these for you.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-800 text-sm">Can I create a general SOP for multiple chem reagents?</h4>
                  <p>
                    <strong>Answer:</strong> Developing a single SOP for multiple chemicals with the same handling procedures is efficient. However, it is highly advisable to create separate SOPs for chemicals with unique, severe, or acute hazards (e.g., Hydrofluoric acid, organic mercury compounds, peroxide formers).
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-800 text-sm">What are Tulane's guidelines for peroxide-forming chemicals?</h4>
                  <p>
                    <strong>Answer:</strong> Certain solvents (like THF, Ethyl Ether, Dioxane) form shock-sensitive explosive peroxides upon exposure to air and light over time. Tulane OEHS mandates that these bottles be marked with date of receipt and first opening, tested using peroxide test strips at least every 3 to 6 months, and safely disposed of if levels exceed 20 ppm.
                  </p>
                </div>

              </div>

              {/* Sidebar Checklist */}
              <div className="lg:col-span-4 bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-4 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4 className="font-bold uppercase tracking-wider text-amber-800 text-xs">Required SOP Format Checklist</h4>
                </div>
                
                <p>Although the Tulane OEHS does not mandate a single rigid software layout, every valid customized Standard Operating Procedure must define the following points:</p>
                
                <ul className="space-y-2 pl-3 list-disc">
                  <li><strong>Section 1-3:</strong> Chemical Name and CAS Number.</li>
                  <li><strong>Section 4:</strong> Active Hazards (GHS Hazard Tags, SDS classification).</li>
                  <li><strong>Section 5:</strong> Engineering Controls (certified exhaust hood, local ventilation) and exact glove styles (neoprene, nitrile thicknesses).</li>
                  <li><strong>Section 6-7:</strong> Compliant Storage cabinets and Incompatible substances.</li>
                  <li><strong>Section 8:</strong> immediate spill mitigation neutralizers and eyewash wash times of 15 minutes.</li>
                  <li><strong>Section 9:</strong> Liquid and solid waste disposal routes.</li>
                </ul>

                <p className="text-[11px] text-amber-700 italic border-t border-amber-200 pt-2 font-medium">
                  This safety wizard was created under standard OSHA CFR 1910.1450 guidelines. Contact Tulane Environmental Health & Safety (OEHS) at OEHS@tulane.edu for specific regulatory reviews.
                </p>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER BAR (Hidden on print) */}
      <footer className="bg-slate-950 text-slate-400 text-[11px] text-center py-4 border-t border-slate-900 mt-8 no-print font-mono">
        <p>© 2026 Tulane University Chemical Safety SOP Workstation • EHS Compliant System Hub</p>
        <p className="mt-1">For student/TA laboratory reviews. Powered by Gemini-3.5-Flash Multimodal Search</p>
      </footer>

    </div>
  );
}
