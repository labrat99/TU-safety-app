export interface TulaneSOPData {
  chemicalName: string;
  casNumber: string;
  hazards: string[];
  additionalHazards: string;
  purpose: string;
  responsibilities: string;
  safetyMeasures: {
    engineeringControls: string;
    ppe: string;
    saferAlternatives: string;
  };
  handlingProcedures: string;
  storageRequirements: string;
  spillAndFirstAid: {
    spillProcedures: string;
    firstAid: string;
    emergencyLocations: string;
  };
  disposalGuidelines: string;
  trainingRequirements: string;
  testingAndDocumentation: string;
  regulatoryReferences: string;
}

export interface SOPMetadata {
  department: string;
  room: string;
  principalInvestigator: string;
  dsr: string; // Department Safety Representative
  dateCreated: string;
  piSignatureDate?: string;
  ehsApproved?: boolean;
  ehsApprovalDate?: string;
  msdsUrl?: string; // External web link to chemical MSDS/SDS
  msdsFileName?: string; // Optional attached local file name
  msdsFileData?: string; // Optional attached local file base64 data URL
}

export interface SavedSOPRecord {
  id: string;
  metadata: SOPMetadata;
  sop: TulaneSOPData;
  scannedAt: string;
  imageThumbnail?: string; // Base64 thumbnail for visual recall
}

export const FULL_DISCLAIMER = "AI-GENERATED DRAFT — FOR REVIEW ONLY. This SOP was drafted by an AI tool from a chemical label image and has NOT been verified or approved. All values — particularly the CAS number, hazard classifications, chemical incompatibilities, PPE, and first-aid procedures — must be verified against the manufacturer's Safety Data Sheet (SDS) and approved and signed by the Principal Investigator and Tulane OEHS before any laboratory use. This is NOT an official EHS-approved document.";

export const SHORT_DISCLAIMER = "AI-generated draft — unverified. Confirm all values against the SDS; not valid until reviewed and signed by PI and Tulane OEHS.";
