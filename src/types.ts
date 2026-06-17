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
}

export interface SavedSOPRecord {
  id: string;
  metadata: SOPMetadata;
  sop: TulaneSOPData;
  scannedAt: string;
  imageThumbnail?: string; // Base64 thumbnail for visual recall
}
