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
    name: "Paraformaldehyde",
    cas: "30525-89-4",
    description: "Highly toxic formaldehyde polymer commonly used for tissue fixation. Releases flammable and carcinogenic formaldehyde gas upon heating; potent sensitizer.",
    imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Cell & Molecular Biology",
      room: "Musa Rad Lab 402",
      principalInvestigator: "Dr. Elizabeth Tulane",
      dsr: "Sarah Jenkins, EHS Rep",
      dateCreated: "2026-06-18"
    },
    sop: {
      chemicalName: "Paraformaldehyde (powder / solid)",
      casNumber: "30525-89-4",
      hazards: ["Toxic", "Flammable"],
      additionalHazards: "Flammable Solid, Suspected Human Carcinogen, Strong Skin & Respiratory Sensitizer, Severe Eye Damage/Irritation, Releases Toxic Formaldehyde Gas on depolymerization.",
      purpose: "This Standard Operating Procedure (SOP) describes the safe handling, depolymerization (fixation prep), and containment protocols for dry Paraformaldehyde powder within laboratory research environments.",
      responsibilities: "The PI or Lab Manager must ensure that all researchers working with paraformaldehyde have received chemical-specific hazard communication training and are logged under the local carcinogen surveillance protocol.",
      safetyMeasures: {
        engineeringControls: "Paraformaldehyde powder must ALWAYS be weighed, transferred, and dissolved inside a certified Chemical Fume Hood with the sash positioned below 18 inches. Heat or depolymerization under basic/acidic conditions can ONLY be performed within a working hood to capture gaseous formaldehyde releases. Never handle dry powder on the open bench.",
        ppe: "Wear a fire-resistant Nomex lab coat, chemical safety splash goggles, and heavy-duty nitrile gloves (minimum 8 mil thickness or double-glove). Standard thin nitrile gloves provide weak protection against formaldehyde; immediately remove and discard gloves if contact occurs.",
        saferAlternatives: "Use pre-made, commercially sealed 4% or 10% buffered neutral formalin vials instead of weighing out dry paraformaldehyde powder to completely eliminate the dust inhalation hazard."
      },
      handlingProcedures: "Weigh dry powder using a pre-calibrated balance placed inside the chemical fume hood (or use a closed container transport protocol: tare bottle, add powder in hood, seal, weigh outside, return to hood). Avoid any activities generating aerosolized dust. When preparing 4% solutions by heating, use a temperature-controlled hotplate and ensure a closed or vented container under secondary containment to catch any spills.",
      storageRequirements: "Store dry solid in a tightly sealed container in a cool, dry, well-ventilated location away from strong oxidizers, strong acids, and reducing agents. Keep containers tightly closed and clearly labeled as a carcinogen.",
      spillAndFirstAid: {
        spillProcedures: "For small dry powder spills (<5g inside a fume hood), moisten the powder with water to prevent airborne dust, carefully sweep or wipe with a damp paper towel/pad, and place in a sealed bag. For larger spills or spills outside the hood, immediately evacuate the room, isolate the area to prevent inhalation of formaldehyde gas, and dial Tulane EHS emergency response.",
        firstAid: "Inhalation: Immediately move the victim to fresh air; seek emergency medical advice. Eye contact: Flush at the eyewash station with copious water for at least 15 minutes. Skin contact: Remove contaminated clothing and flush skin with drench shower. Ingestion: Drink water to rinse mouth; do not induce vomiting, seek immediate emergency medical care.",
        emergencyLocations: "Nearest drench shower and eyewash station are located directly adjacent to the main laboratory doorway exit. Formaldehyde-specific spill absorbent pads are stored in the lime-green spill cylinder in Room 402."
      },
      disposalGuidelines: "All paraformaldehyde waste, contaminated materials, and unused solutions must be collected in compatible high-density polyethylene waste containers labeled 'Hazardous Waste - Contains Formaldehyde/Paraformaldehyde'. Never pour raw formalin solutions down the drain. Schedule laboratory waste collection via Tulane EHS at OEHS@tulane.edu.",
      trainingRequirements: "Personnel must complete Tulane's HazCom/General Laboratory Safety, Respirator Awareness (if applicable), and hands-on, peer-reviewed preparation of fixing solutions in a chemical fume hood.",
      testingAndDocumentation: "Containers must be inspected monthly for cap degradation or volatile powder crystallization. Track total amounts manufactured and used in the lab carcinogen inventory spreadsheet.",
      regulatoryReferences: "OSHA Formaldehyde Standard (29 CFR 1910.1048), Tulane University Chemical Hygiene Plan, and NIOSH Select Carcinogens Registry."
    }
  },
  {
    name: "Paclitaxel (Taxol)",
    cas: "33069-62-4",
    description: "Highly potent mitotic inhibitor chemotherapy agent. Severe reproductive hazard, teratogen, and potential mutagen; requires glove box or high-containment weighing.",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Cancer Research & Bio-Innovation",
      room: "Boggs Hall 112",
      principalInvestigator: "Dr. James Vance",
      dsr: "Arthur Dent, Safety Rep",
      dateCreated: "2026-06-18"
    },
    sop: {
      chemicalName: "Paclitaxel (Taxol)",
      casNumber: "33069-62-4",
      hazards: ["Toxic"],
      additionalHazards: "Mitotic Inhibitor (Chemotherapeutic), Severe Teratogen and Reproductive Toxin, Suspected Human Carcinogen, Potential Mutagen, Skin Sensitizer, and Eye Irritant.",
      purpose: "This Standard Operating Procedure (SOP) defines the containment, safe manipulation, weighing, and decontamination requirements for Paclitaxel-powdered dry active pharmaceutical materials to prevent occupational exposure.",
      responsibilities: "The PI must maintain a registered inventory of high-potency API substances (HPAPIs). All female personnel of reproductive capacity must review the explicit developmental hazard warnings prior to working with paclitaxel.",
      safetyMeasures: {
        engineeringControls: "Weighing of dry Paclitaxel powder must ONLY be executed within a certified Class II Biosafety Cabinet (BSC) with negative pressure, a dedicated HEPA-filtered glove box, or a dedicated powder containment enclosure. Do not handle dry powder inside an uncontained fume hood unless static-controlled weigh chambers are activated.",
        ppe: "Double-gloving with high-performance nitrile gloves (first layer under cuff, second layer over cuff; minimum 7 mil thickness each). Long-sleeved impervious disposable Tyvek sleeve covers or gowns over standard Nomex lab coats. Certified N95 or HEPA-filtered half-face respirator is required if weighing uncontained powders outside a closed isolator system.",
        saferAlternatives: "Purchase paclitaxel as pre-formulated, pre-dissolved stock solution aliquots in DMSO or ethanol rather than dry powder to bypass high-risk powder weighing and static dispersion issues."
      },
      handlingProcedures: "Work must be conducted only within a designated containment area marked with warning labels. Store and transport the analytical vials inside durable, secondary shatter-resistant containers. Decontaminate all weigh boxes, spatulas, and balances immediately after use with a 0.1M Sodium Hydroxide (NaOH) hydrolysis solution or specialized chemotherapeutic decontamination agents.",
      storageRequirements: "Store inside a locked, labeled refrigerator at 2-8°C with secondary containment. The outer refrigerator door must display a clear warning: 'POTENT INDUCING CHEMOTHERAPEUTIC ACTIVE PHARMACEUTICAL AGENT - TOXIN/TERATOGEN STORAGE'. Keep away from food, drink, and animal feeding areas.",
      spillAndFirstAid: {
        spillProcedures: "Small dry spills (<10mg inside containment scale-well): Clean using chemotherapeutic-specific sticky wipe pads or wet-mop with 0.1M NaOH solution. Do not dry-sweep. Large spills or spills outside containment: Evacuate the room immediately, close and lock doors, post warnings, and contact Tulane Biosafety and EHS Emergency Teams for professional cleanup.",
        firstAid: "Eyes: Flush immediately with generous volumes of saline or water for 15 minutes. Skin: Wash thoroughly with large volumes of soap and water; do not scrub intensely as it increases skin absorption. Remove clothing immediately. Inhalation: Move victim to fresh air. Seek immediate specialized clinical toxicologist assessment.",
        emergencyLocations: "Chemotherapeutic spill neutralizer kits and decontamination solutions are stored in the high-containment yellow box under the Boggs Hall Room 112 biosafety wash workstation."
      },
      disposalGuidelines: "Dispose of all solids, vials, solutions, pipettes, and containment items as regulated chemotherapeutic bio-hazardous medical waste. Place inside a black hazardous waste bucket equipped with tight-fitting lids. Do not mix with standard chemical or biological wastes. Coordinate waste disposal cycles via Tulane EHS.",
      trainingRequirements: "Mandatory Tulane Biosafety Program certification, specialized chemotherapeutic toxin handling training, and peer-verified double-bagged container disposal procedures.",
      testingAndDocumentation: "Workplaces and BSC interiors must undergo formal wipe-testing or UV fluorescent tracer analysis every 6 months to ensure no persistent chemotherapeutic residue remains. Log all aliquots prepared inside the lab active inventory ledger.",
      regulatoryReferences: "OSHA Hazardous Drugs Standard, NIOSH List of Antineoplastic and Other Hazardous Drugs in Healthcare Settings, and Tulane University Biological Safety Manual."
    }
  },
  {
    name: "Perchloric Acid (70%)",
    cas: "7601-90-3",
    description: "Extremely strong mineral superacid and powerful oxidizer. Reacts violently with organic matter and forms highly shock-sensitive, explosive perchlorate salts.",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-cdab29b069a8?auto=format&fit=crop&q=80&w=400",
    defaultMetadata: {
      department: "Materials Science & Engineering",
      room: "Percival Lab 304",
      principalInvestigator: "Dr. Rachel Green",
      dsr: "Monica Geller, Safety Inspector",
      dateCreated: "2026-06-18"
    },
    sop: {
      chemicalName: "Perchloric Acid (60-70%)",
      casNumber: "7601-90-3",
      hazards: ["Corrosive", "Reactive"],
      additionalHazards: "Strong Oxidizer, Contact with organic materials may cause fire or explosion, Forms shock-sensitive explosive perchlorate metal/organic salts, Severe Chemical Burns and Eye Damage.",
      purpose: "This Standard Operating Procedure (SOP) defines the safety standards, containment controls, and reactive chemical hazards associated with utilizing concentrated Perchloric Acid in mineral digestions or electro-polishing.",
      responsibilities: "The PI is responsible for ensuring perchloric acid work is restricted ONLY to certified perchloric wash-down fume hoods. No student or researcher is permitted to use perchloric acid outside specialized washdown systems.",
      safetyMeasures: {
        engineeringControls: "If heating or distilling, you MUST use a dedicated Perchloric Acid Fume Hood equipped with automated water spray/wash-down manifolds, constructed entirely of non-combustible stainless steel or PVC. Never heat perchloric acid in standard organic chemical hoods, as the vapor forms explosive anhydride salts on wooden boards and in ductwork. Ensure ductwash systems are activated weekly.",
        ppe: "Chemical-resistant heavy neoprene, fluororubber, or heavy-duty PVC gloves (avoid light nitrile gloves which degrade rapidly). Indirect-ventilation chemical splash goggles and a full-face safety shield. Splash-proof chemical apron and closed-toe leather/synthetic hazard shoes.",
        saferAlternatives: "Evaluate replacing perchloric-nitric digestions with safer, non-explosive acid digestions such as Hydrochloric-Nitric acid (Aqua Regia) or high-pressure microwave digestion with dilute Nitric Acid."
      },
      handlingProcedures: "Never heat perchloric acid with organic compounds (e.g., grease, alcohols, paper, cloth, or organic solvents) as this results in violent, explosive reactions. Never use greased ground glass joints. Clean all apparatus thoroughly of any organic contamination before introduction. Always add perchloric acid to water, never water to acid, and handle inside Teflon or glass containment trays.",
      storageRequirements: "Store in a dedicated, corrosion-resistant, fireproof acid cabinet in glass secondary containment trays. NEVER store perchloric acid on wooden shelves or near paper/cardboard. Keep strictly separated from dehydrating agents (such as Sulfuric Acid or Phosphorus Pentoxide) and organic chemicals (solvents, acetic acid).",
      spillAndFirstAid: {
        spillProcedures: "Do NOT use organic sorbents like sawdust, paper, or standard organic chemical pads (which will ignite or form explosive crystals). Neutralize the spill slowly with sodium bicarbonate or calcium carbonate. Once neutralized, dilute with plentiful volumes of water and clean using inorganic cotton pads or inert squeegees. Place in a designated, water-flooded disposal bottle.",
        firstAid: "Skin contact: Immediately flood the area under the safety drench shower for 15 minutes, removing all contaminated clothing. Eye contact: Flush immediately at the eyewash station for at least 15 minutes. Inhalation: Move to fresh air and check for breathing difficulties. Ingestions: Do not induce vomiting; drink water and seek immediate emergency clinical support.",
        emergencyLocations: "The nearest dedicated stainless steel perchloric wash-down workstation and emergency drench shower are located in Percival Room 304. Inorganic spill neutralizer kits are situated by the cabinet."
      },
      disposalGuidelines: "Store waste separated from any organic chemical streams inside pure glass or Teflon containers. Dilute waste with neutral water to prevent salt crystallization. Clearly label container as 'Hazardous Waste - Hydrated Perchloric Acid Residue' and organize immediate removal with Tulane EHS at OEHS@tulane.edu.",
      trainingRequirements: "Mandatory completion of Tulane's Reactive Chemicals & Explosive Hazard Training, combined with a physical walkthrough and hands-on run of the hood washdown manifolds with EHS Representatives.",
      testingAndDocumentation: "Weekly logging of fume hood washdown activation. Quarterly testing of metal or duct joints using specialized methylene blue perchlorate identification reagents to detect explosive crystal deposition.",
      regulatoryReferences: "OSHA 29 CFR 1910.1450 Reactive Chemicals Protocol, NFPA 430 Code for the Storage of Liquid and Solid Oxidizers, and Tulane EHS Guidelines on Perchloric Acid Use."
    }
  }
];
