import { TulaneSOPData, SOPMetadata } from "./types";

export interface PresetChemical {
  name: string;
  cas: string;
  description: string;
  imageUrl: string;
  defaultMetadata: SOPMetadata;
  sop: TulaneSOPData;
}

export const PRESET_CHEMICALS: PresetChemical[] = [
  {
    name: "Tetrahydrofuran (THF)",
    cas: "109-99-9",
    description: "Highly flammable solvent, classic peroxide former requiring strict testing.",
    imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Chemistry & Biomolecular Engineering",
      room: "Musa Rad Lab 402",
      principalInvestigator: "Dr. Elizabeth Tulane",
      dsr: "Sarah Jenkins, EHS Rep",
      dateCreated: "2026-06-17"
    },
    sop: {
      chemicalName: "Tetrahydrofuran (THF)",
      casNumber: "109-99-9",
      hazards: ["Flammable", "Toxic", "Reactive"],
      additionalHazards: "Peroxide Former, Serious Eye Damage, Specific Target Organ Toxicity (Inhalation - Respiratory Irritation).",
      purpose: "This Standard Operating Procedure (SOP) describes the safe handling of Tetrahydrofuran (THF) or other organic peroxide-forming solvents in laboratory environments.",
      responsibilities: "The Principal Investigator (PI) or Lab Manager must ensure all operators receive chemical-specific hazard communication training. Students and researchers must test for peroxide concentration prior to taking any aliquot.",
      safetyMeasures: {
        engineeringControls: "Must be handled within a certified Chemical Fume Hood with the sash positioned at or below 18 inches. Never heat or concentrate THF solutions unless a certified glove box or local nitrogen purge exhaust ventilation is operational. Spark-free heating mantles only.",
        ppe: "Wear standard flame-resistant Nomex lab coats, chemical safety splash goggles, and heavy-duty nitrile gloves (minimum thickness of 8 mil, preferably double-gloved). Note that standard single thin nitrile gloves provide less than 5 minutes of breakthrough time; immediately discard if contact occurs.",
        saferAlternatives: "For chromatography or extraction, explore replacing THF with Ethyl Acetate/Heptane mixtures or Methyl Tert-Butyl Ether (MTBE) which form peroxides much more slowly."
      },
      handlingProcedures: "Always handle under an inert atmosphere (Nitrogen/Argon) if distilling. Never evaporate to dryness as concentrated peroxide crystals are highly shock-sensitive explosives. Open bottles must be dated upon receipt and dated upon first opening.",
      storageRequirements: "Store in a designated, ventilated flammables cabinet away from strong oxidizers, mineral acids, and direct sunlight. Keep containers tightly closed under nitrogen blanket where possible. Keep away from heat, sparks, open flames, and hot surfaces.",
      spillAndFirstAid: {
        spillProcedures: "For small spills (<100mL), extinguish all ignition sources, apply specialized solvent-absorbent pads from the spill kit, and place in a vapor-tight waste container. For larger spills, evacuate the room immediately, pull fire alarm, and contact Tulane EHS emergency response line.",
        firstAid: "Eye contact: Flush with copious water at the emergency eyewash station for at least 15 minutes. Skin contact: Remove contaminated clothing and flush skin with drench shower. Inhalation: Move victim to fresh air. Ingestion: Seek immediate emergency medical care, do not induce vomiting.",
        emergencyLocations: "The nearest emergency drench shower and eyewash station are located adjacent to the main lab doorway exit. Class B fire extinguisher is mounted right outside Room 402."
      },
      disposalGuidelines: "Store liquid waste in certified amber glass containers equipped with vented caps. Label clearly with 'Hazardous Waste - Tetrahydrofuran'. Do not mix with chlorinated solvents. Evacuate waste cycles via Tulane EHS by emailing OEHS@tulane.edu.",
      trainingRequirements: "All lab personnel must successfully complete Tulane's General Lab Safety & HazCom training, followed by a signed hands-on peer review of THF distillation and air-free transfer protocols.",
      testingAndDocumentation: "THF bottles MUST be tested for active organic peroxides every 3 to 6 months using starch-iodide test strips. If peroxide concentration exceeds 20 ppm, operation must cease and the bottle must be stabilized and disposed of immediately. All test levels, dates, and operator initials must be written on the container label.",
      regulatoryReferences: "OSHA Laboratory Standard (29 CFR 1910.1450), Tulane OEHS Hazardous Waste Management Manual, and NIOSH THF Hazard Handbook."
    }
  },
  {
    name: "Nitric Acid (70%)",
    cas: "7697-37-2",
    description: "Strong mineral acid and powerful oxidizing agent.",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Materials Science & Engineering",
      room: "Boggs Hall 112",
      principalInvestigator: "Dr. James Vance",
      dsr: "Arthur Dent, Safety Rep",
      dateCreated: "2026-06-17"
    },
    sop: {
      chemicalName: "Nitric Acid (65-70%)",
      casNumber: "7697-37-2",
      hazards: ["Corrosive", "Reactive"],
      additionalHazards: "Strong Oxidizer, Severe Skin Burns, Eye Damage, Poisonous gas release (Nitrogen Dioxide) upon contact with organic compounds.",
      purpose: "This Standard Operating Procedure (SOP) describes safe handling, storage, and emergency procedures for concentrated Nitric Acid in etching and synthesis processes.",
      responsibilities: "The PI is responsible for establishing a designated acid workstation. Personnel must maintain diligent records of all acid digestions.",
      safetyMeasures: {
        engineeringControls: "Always handle within a fully functional Chemical Fume Hood with acid-resistant coating. Ensure sash is kept at lowest usable height. Never close/block the fume hood deck vents.",
        ppe: "Thick neoprene or butyl chemical-resistant gloves (do not use thin nitrile gloves as Nitric Acid degrades them instantly). Chemistry splash goggles, full face shield if handling >250mL, acid-resistant apron, and closed-toe leather shoes.",
        saferAlternatives: "Use diluted Nitric Acid (10% or less) if etching speeds permit, or switch to safer organic acids depending on mineral digestion requirements."
      },
      handlingProcedures: "Always add acid to water (never add water to acid!). Nitric acid reacts violently with organic solvents (like ethanol, acetone) and paper towels. Never wipe up nitric acid spills with paper towels — they will catch fire!",
      storageRequirements: "Store inside a dedicated, corrosion-resistant acid cabinet on secondary containment trays. nitric acid must be stored separately from organic acids (e.g., Acetic Acid, Formic Acid) and organic solvents.",
      spillAndFirstAid: {
        spillProcedures: "Do NOT use organic materials like sawdust or paper towels to absorb. Neutralize spill slowly with sodium bicarbonate (baking soda) or a certified acid spill neutralizer until bubbling stops, then wipe up with acid-neutralizing pads.",
        firstAid: "Skin: Flush immediately under safety drench shower for 15 minutes, removing contaminated clothes. Eyes: Flush at eyewash station for 15 minutes. Ingestion: Drink plenty of water immediately, do not induce vomiting, seek immediate emergency medicine.",
        emergencyLocations: "Safety shower is located within 10 seconds of Boggs Room 112. Lime-green acid safety spill kit is situated by the fume hood."
      },
      disposalGuidelines: "Store waste in high-density polyethylene (HDPE) containers. Never mix nitric acid waste with organic wastes (explosive risk). Label container clearly and submit disposal request to Tulane OEHS.",
      trainingRequirements: "General Acid safety training plus classroom orientation on oxidizer reactivities.",
      testingAndDocumentation: "N/A - Nitric acid does not form peroxides, but inspect bottles annually for cap degradation and yellowing of the liquid (indicating nitrogen oxide gas buildup).",
      regulatoryReferences: "OSHA 29 CFR 1910.1450, Tulane University OEHS Chemical Hygiene Plan, and NIOSH Pocket Guide to Nitric Acid."
    }
  },
  {
    name: "Gaseous Carbon Monoxide",
    cas: "630-08-0",
    description: "Highly toxic toxic gas, odorless, flammable, requiring continuous monitoring.",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-cdab29b069a8?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Physics & Engineering Physics",
      room: "Percival Lab 304",
      principalInvestigator: "Dr. Rachel Green",
      dsr: "Monica Geller, safety inspector",
      dateCreated: "2026-06-17"
    },
    sop: {
      chemicalName: "Carbon Monoxide Gas",
      casNumber: "630-08-0",
      hazards: ["Flammable", "Toxic"],
      additionalHazards: "Chemical Asphyxiant, Lethal by Inhalation, Reprotoxic, compressed cylinder hazards. Odorless and tasteless.",
      purpose: "This Standard Operating Procedure (SOP) describes procedures for safe work with compressed Carbon Monoxide gas in chemical vapor deposition.",
      responsibilities: "The PI must maintain a calibrated, hard-wired carbon monoxide detector in the laboratory. Students must never work alone with carbon monoxide gas cylinders.",
      safetyMeasures: {
        engineeringControls: "Cylinder must be stored inside a continuously exhausted gas cabinet. Exhaust line must be direct-vented to the roof. Process must operate within a sealed vacuum reactor or enclosed fume hood. Must have automated pneumatic shutoff valves connected to the gas alarm system.",
        ppe: "Nomex flame-resistant lab coat, certified safety glasses with side shields, and standard laboratory gloves. (PPE does NOT protect against carbon monoxide inhalation; reliance is entirely on engineering controls and gas detection).",
        saferAlternatives: "None available for carbonylation synthesis, but use premixed diluted CO (e.g., 10% CO in Nitrogen or Argon) where possible to lower hazard release severity."
      },
      handlingProcedures: "Execute leak checks of all fittings using soap solution or leak detectors before opening cylinder valve. Always clear lines with an inert gas (Argon/Nitrogen) purging sequence before and after CO flow.",
      storageRequirements: "Store cylinders in standard exhaust gas cabinets. Secure cylinders with dynamic high-double-clamp brackets to solid support structures. Keep away from oxidizing gases and ignition sources.",
      spillAndFirstAid: {
        spillProcedures: "In case of gas alarm triggering, immediately close cylinder valve IF safe to do so. Gather all occupants, evacuate the laboratory immediately, close the door, and pull the emergency building fire alarm to initiate sirens.",
        firstAid: "Inhalation: Immediately move the exposed person to fresh air. If breathing has stopped, trained personnel should administer CPR or 100% supplemental oxygen. Seek emergency clinical transport immediately.",
        emergencyLocations: "Calibrated optical CO alarm display is positioned on the wall next to the main corridor exit. The system emergency gas shut-off button is highlighted in yellow on the gas cabinet exterior panel."
      },
      disposalGuidelines: "Return empty or unused cylinders directly to the gas distributor. Do not attempt to vent gases locally.",
      trainingRequirements: "Mandatory compressed cylinder safety certificate, CO alarm drills, and full-scale peer walkthroughs with EHS present.",
      testingAndDocumentation: "Weekly functional testing of local alarm sensors. Tubing leak checks recorded in the lab safety log book prior to every active gas run.",
      regulatoryReferences: "OSHA 29 CFR 1910.1017, Compressed Gas Association (CGA) P-1, and Tulane Safety Standard for Toxic Gases."
    }
  }
];
