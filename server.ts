import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Apply bodyParser middleware to handle large base64 image payloads from mobile phone captures
app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const vertexProject = process.env.VERTEX_PROJECT_ID;
const vertexLocation = process.env.VERTEX_LOCATION || "us-central1";

let ai: GoogleGenAI | null = null;

if (vertexProject) {
  console.log(`[Google GenAI] Initializing in Vertex AI mode. Project: ${vertexProject}, Location: ${vertexLocation}`);
  ai = new GoogleGenAI({
    project: vertexProject,
    location: vertexLocation,
  });
} else if (apiKey) {
  console.log("[Google GenAI] Initializing in Gemini Developer API (AI Studio) mode.");
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("[Google GenAI] Warning: No Vertex AI or Gemini Developer API credentials found.");
}

// API Endpoints
app.post("/api/generate-sop", async (req, res): Promise<any> => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Google GenAI client is not initialized. Please configure either the VERTEX_PROJECT_ID or GEMINI_API_KEY in secrets/environment variables.",
      });
    }

    const { image, department, room, pi, dsr, date } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided for label analysis." });
    }

    // Process base64 image data
    let base64Data = image;
    let mimeType = "image/jpeg";

    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      const match = image.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
      base64Data = parts[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptText = `
You are an expert Federal Research Laboratory Safety Compliance officer and a Senior Lab Safety Scientist.
Your job is to inspect this chemical container manufacturer label screenshot/photo and use your scientific expertise to find, cross-reference, and compile the official health, safety, and regulatory protocols for this chemical.

Specifically cross-reference:
- OSHA Laboratory Safety Guidance (29 CFR 1910.1450)
- EHS / Academic OEHS regulatory protocols (specifically aligning with the safety norms of Tulane University's Office of Environmental Health & Safety - OEHS)
- Safety Data Sheets (SDS), NIOSH Pocket Guide to Chemical Hazards, PubChem, and CAMEO Chemicals.

You MUST compile all the safety, handling, storage, spill, first aid, disposal, training, and testing details into the exact fields of the Tulane Chemical Safety SOP Template.

Metadata provided by the user (incorporate these where appropriate or leave as is if not requested directly in the structure):
- Department: ${department || "Chemical Engineering"}
- Room: ${room || "Lab Room"}
- PI: ${pi || "Principal Investigator"}
- DSR: ${dsr || "Department Safety Representative"}
- Date: ${date || new Date().toLocaleDateString()}

Here is the exact mapping you must provide:
1. Chemical Name: Detect the official IUPAC/common chemical name printed on the label.
2. CAS Number: Extract the Chemical Abstracts Service number. If not visible on label, search for the official CAS number based on the chemical name.
3. Hazards: Classify whether it is Flammable, Corrosive, Reactive, and/or Toxic.
4. Additional Hazards: Specify acute risks like Carcinogen, Embryotoxic, Pyrophoric, Water Reactive, Explosive, Peroxide Formers, Poisonous Gases, Lethal by Skin Contact, etc.
5. Safety Measures - Engineering Controls: Specific fume hood requirements (e.g. chemical fume hood, canopy hood, glove box), local exhaust, or shielding.
6. Safety Measures - PPE: Specific glove type (e.g., nitrile vs chemical-resistant neoprene vs butyl, specifying thickness or brand if critical), protective coat (e.g. flame-resistant), goggles/mask, respirator type.
7. Safety Measures - Safer Alternatives: Recommended substitutions to mitigate hazards if available (e.g., replacing benzene with toluene, or safer alternatives).
8. Procedure for Handling: Clear, actionable step-by-step guide for standard lab work with this class of compound. List what MUST be avoided (e.g., heating, pouring techniques, high friction, light exposure).
9. Storage: Optimal temperature, cabinetry (flammable, acid cabinets, desiccator), secondary containment setups, and a list of strictly incompatible materials (acids, water, oxidizing agents, metals).
10. Spills/Leaks/Accidents: Specific immediate cleanup protocols (neutralizing agents, spill kit materials, ventilation) and reference the Tulane general chemical spill response.
11. First Aid Measures: Clear procedures for eye contact, skin contact, inhalation, and ingestion. Include emergency wash/drench instructions and emergency contact info (e.g., Tulane OEHS: OEHS@tulane.edu, and standard emergency lines).
12. Disposal: Regulatory waste stream protocols, proper waste containers, labeling, and Tulane compliance guidance.
13. Training: Relevant training levels needed (e.g., general hazard communication, laboratory standard training, and chemical-specific hands-on coaching).
14. Testing & Documentation: Mandatory regular testing intervals and materials (e.g., test strips for peroxides) if this is a peroxide-forming chemical (like ethers, THF, dioxane) or self-degrading, otherwise outline N/A.
15. Regulatory References: List the specific federal, state, and academic policy refs (e.g., OSHA 29 CFR 1910.1450, EHS, NIOSH guides, PubChem URL context).

Verify all details thoroughly. Return the output as a fully filled, professional SOP in JSON format matching the schema requested. Do not return empty fields. Ensure instructions are deep, detailed, and completely custom for this specific chemical. Do not use generic filler text.
`;

    const textPart = { text: promptText };

    // Resilient model try loop with exponential retry to prevent 503 (temporary high demand) or 429 (quota exhausted) errors
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          console.log(`[Gemini Resilient Pipeline] Selected: ${modelName} (Attempt ${attempt}/4)`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [imagePart, textPart] },
            config: {
              systemInstruction: "You are an expert Laboratory Safety Compliance Officer at Tulane University. You always supply deep, realistic, high-fidelity scientific data, safety precautions, and precise CAS numbers matching the scanned chemical.",
              responseMimeType: "application/json",
              responseSchema: {
          type: Type.OBJECT,
          properties: {
            chemicalName: { type: Type.STRING, description: "Full official chemical name" },
            casNumber: { type: Type.STRING, description: "Chemical Abstracts Service (CAS) number (e.g., 67-64-1)" },
            hazards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Primary hazardous tags: Flammable, Corrosive, Reactive, Toxic, Explosive, Oxidyzer, Pyrophoric, Water Reactive etc."
            },
            additionalHazards: { type: Type.STRING, description: "Detailed warnings like Carcinogen, Peroxide Former, Fatal by Skin Exposure" },
            purpose: { type: Type.STRING, description: "Standard Purpose boilerplate aligned with the chemical class and OSHA 1910.1450" },
            responsibilities: { type: Type.STRING, description: "Delineated responsibilities for the PI, Lab Manager, and Students for this specific chemical hazard" },
            safetyMeasures: {
              type: Type.OBJECT,
              properties: {
                engineeringControls: { type: Type.STRING, description: "What fume hoods, glove boxes, sash settings, or ventilation are required specifically for this chemical" },
                ppe: { type: Type.STRING, description: "Specific personal protective equipment. Specify glove type (e.g. 8-mil Nitrile, Silver Shield, Neoprene) and flame-resistant clothing details" },
                saferAlternatives: { type: Type.STRING, description: "Molecules or processes that could substitute this chemical for lower hazard" }
              },
              required: ["engineeringControls", "ppe", "saferAlternatives"]
            },
            handlingProcedures: { type: Type.STRING, description: "Step-by-step instructions for use, transfer, dispensing, stating list of behaviors to strictly avoid" },
            storageRequirements: { type: Type.STRING, description: "Temperature, container materials, cabinet classification, secondary containment, and highly incompatible substances list" },
            spillAndFirstAid: {
              type: Type.OBJECT,
              properties: {
                spillProcedures: { type: Type.STRING, description: "Details on chemical-specific spill mitigation, neutralizing agents, absorbent type, and referencing standard Tulane OEHS procedures" },
                firstAid: { type: Type.STRING, description: "Specific first aid steps for skin, eye, inhalation, and ingestion. Reference eyewash wash time and target emergency numbers" },
                emergencyLocations: { type: Type.STRING, description: "Guidance on identifying nearby safety showers, eyewash stations, and fire extinguishers suited for this chemical" }
              },
              required: ["spillProcedures", "firstAid", "emergencyLocations"]
            },
            disposalGuidelines: { type: Type.STRING, description: "Waste accumulation container type, labeling requirements, incompatibles in waste streams, and reference to contacting Tulane OEHS at OEHS@tulane.edu" },
            trainingRequirements: { type: Type.STRING, description: "Specific training content required before handling this chemical, frequency, and sign-offs" },
            testingAndDocumentation: { type: Type.STRING, description: "Specific guidelines on testing (e.g., peroxide test strips frequency for ethers), otherwise statement of NA" },
            regulatoryReferences: { type: Type.STRING, description: "Standard regulatory reference codes including OSHA 29 CFR 1910.1450, EHS, NIOSH, CAMEO, PubChem" }
          },
          required: [
            "chemicalName",
            "casNumber",
            "hazards",
            "additionalHazards",
            "purpose",
            "responsibilities",
            "safetyMeasures",
            "handlingProcedures",
            "storageRequirements",
            "spillAndFirstAid",
            "disposalGuidelines",
            "trainingRequirements",
            "testingAndDocumentation",
            "regulatoryReferences"
          ]
        }
      }
          });
          console.log(`[Gemini Resilient Pipeline] Generative call completed successfully using ${modelName}!`);
          break; // successfully generated, break out of attempt loop
        } catch (err: any) {
          lastError = err;
          const status = err.status || (err.error && err.error.status) || "";
          const msg = err.message || (err.error && err.error.message) || "";
          const errCode = err.code || (err.error && err.error.code) || 0;
          
          console.warn(`[Gemini Resilient Pipeline] Attempt ${attempt}/4 failed for ${modelName}. Code: ${errCode}, Status: ${status}, Message: ${msg}`);

          // Recognize transient errors
          const errStr = `${status} ${msg} ${errCode}`.toLowerCase();
          const isTransient = errStr.includes("503") || errStr.includes("429") || errStr.includes("limit") || errStr.includes("exhausted") || errStr.includes("temporary") || errStr.includes("busy") || errStr.includes("unavailable") || errStr.includes("demand");

          if (isTransient && attempt < 4) {
            const delay = Math.pow(2, attempt) * 1200 + Math.random() * 800;
            console.log(`[Gemini Resilient Pipeline] Transient issue. Waiting ${Math.round(delay)}ms (Attempt ${attempt}/4) before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            // Give up on this model, continue to the next model in our list
            break;
          }
        }
      }
      if (response) {
        break; // If a model succeeded, terminate the outer model iteration
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to contact chemical safety services. Please try again or use the offline generator mode.");
    }

    const jsonText = response.text || "{}";
    const sopData = JSON.parse(jsonText);

    res.json({ success: true, sop: sopData });
  } catch (error: any) {
    console.error("SOP Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze chemical label and generate safety SOP." });
  }
});

const SOPS_FILE = path.join(process.cwd(), "sops.json");

// Helper to read SOPs
function readSopsFile(): Record<string, any> {
  try {
    if (fs.existsSync(SOPS_FILE)) {
      const data = fs.readFileSync(SOPS_FILE, "utf-8");
      return JSON.parse(data || "{}");
    }
  } catch (err) {
    console.error("Error reading sops.json file:", err);
  }
  return {};
}

// Helper to write SOPs
function writeSopsFile(id: string, sopRecord: any) {
  try {
    const sops = readSopsFile();
    sops[id] = sopRecord;
    fs.writeFileSync(SOPS_FILE, JSON.stringify(sops, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to sops.json:", err);
  }
}

// POST /api/sop -> save SOP draft and return direct view URL for QR scanning
app.post("/api/sop", (req, res): any => {
  try {
    const { id, metadata, sop, scannedAt, imageThumbnail } = req.body;
    if (!id || !sop) {
      return res.status(400).json({ error: "Missing required SOP fields." });
    }

    const record = { id, metadata, sop, scannedAt, imageThumbnail };
    writeSopsFile(id, record);

    // Extract robust host for external mobile browser compatibility
    let devHost = (req.headers["x-forwarded-host"] as string) || req.headers["host"] || req.get("host") || "localhost:3000";
    let protocol = (req.headers["x-forwarded-proto"] as string) || "https";

    // If Referer header exists, resolve devHost from the actual website page
    const referer = req.headers["referer"];
    if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.host && !refUrl.host.includes("localhost") && !refUrl.host.includes("127.0.0.1")) {
          devHost = refUrl.host;
          protocol = refUrl.protocol.replace(":", "");
        }
      } catch (e) {
        // Fallback safely
      }
    }

    // Default to https for Cloud Run
    if (devHost.includes("run.app") || devHost.includes("aistudio")) {
      protocol = "https";
    }

    // Create a public pre-shared domain counterpart
    let preHost = devHost;
    if (preHost.includes("ais-dev-")) {
      preHost = preHost.replace("ais-dev-", "ais-pre-");
    }

    const viewUrl = `${protocol}://${preHost}/?sopId=${id}`;
    const devViewUrl = `${protocol}://${devHost}/?sopId=${id}`;

    res.json({ success: true, id, viewUrl, devViewUrl });
  } catch (err: any) {
    console.error("Failed to save SOP share record:", err);
    res.status(500).json({ error: err.message || "Failed to save share record." });
  }
});

// GET /api/sop/:id -> load saved SOP draft details
app.get("/api/sop/:id", (req, res): any => {
  try {
    const id = req.params.id;
    const sops = readSopsFile();
    const record = sops[id];
    if (!record) {
      return res.status(404).json({ error: "Standard Operating Procedure record not found." });
    }
    res.json({ success: true, record });
  } catch (err: any) {
    console.error("Failed to read SOP record:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve SOP record." });
  }
});

// Setup dynamic Vite development server middleware OR static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Science Compliant SOP Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
