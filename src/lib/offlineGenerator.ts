import { TulaneSOPData, SOPMetadata } from "../types";

export type OfflineSopCategory = "flammable" | "corrosive" | "toxic" | "reactive" | "general";

export function generateLocalOfflineSop(
  chemicalName: string,
  casNumber: string,
  category: OfflineSopCategory,
  hazards: string[],
  metadata: SOPMetadata
): TulaneSOPData {
  const normName = chemicalName.trim() || "Unspecified Active Substance";
  const normCas = casNumber.trim() || "N/A";
  const piName = metadata.principalInvestigator || "the supervising PI";
  const roomNum = metadata.room || "the assigned laboratory room";

  let sop: TulaneSOPData;

  switch (category) {
    case "flammable":
      sop = {
        chemicalName: normName,
        casNumber: normCas,
        hazards: hazards.length > 0 ? hazards : ["Flammable", "Toxic"],
        additionalHazards: "Vapor forms explosive mixtures with air. May cause respiratory irritation, central nervous system depression, or drowsiness upon acute inhalation. Flammable class liquid hazard.",
        purpose: `This Standard Operating Procedure (SOP) describes safety, operational, and containment procedures for the safe handling of ${normName} and related volatile flammable solvents in Room ${roomNum}.`,
        responsibilities: `The Principal Investigator (${piName}) is responsible for keeping active inventories below flammable storage limit thresholds, and verifying that spark-free equipment is used. All operators must certify they have read and sign off on this document.`,
        safetyMeasures: {
          engineeringControls: "Must be handled inside a certified Chemical Fume Hood with sash position kept below 18 inches. Ensure no active flames, hot plates, or spark-producing devices are operational nearby. Spark-free heating mantles or water baths are strictly mandatory for distillations.",
          ppe: "Wear standard Nomex flame-resistant laboratory coat, chemical safety splash goggles with side shields, and heavy-duty nitrile gloves (minimum thickness of 8 mil, or double-glove). Discard gloves immediately if exposed.",
          saferAlternatives: "Evaluate replacing with higher flash point solvents where research reactions allow, or use pre-diluted flammable solutions to limit volatile vapor cloud accumulation."
        },
        handlingProcedures: "Keep container tightly closed when not in use. Avoid pouring or transferring near high-voltage spark fields. Always use glass or chemical-compatibility HDPE containers. Ground metallic containers when transferring volumes greater than 4 Liters to prevent static discharge.",
        storageRequirements: "Store inside a certified flammables safety cabinet on secondary spill containment trays. Keep isolated from strong mineral acids, strong oxidizers (like Nitric Acid, Hydrogen Peroxide), and open flame hazards. Keep storage temp cooler.",
        spillAndFirstAid: {
          spillProcedures: "For small spills (<100mL), immediately extinguish nearby ignition sources, apply specialized solvent-absorbent pads from the station spill kit, and dispatch into vapor-sealed chemical bags. For large spills, instantly evacuate the room, pull the building fire alarm, and contact Tulane OEHS emergency service.",
          firstAid: "Eye Contact: Flush at eyewash station for at least 15 minutes. Skin Contact: Wash skin with soap and plenty of water, removing contaminated garments. Inhalation: Move individual to fresh air. Ingestion: Contact emergency medical services immediately, do not induce vomiting.",
          emergencyLocations: `The nearest Class B flammables fire extinguisher is mounted by the exit door of Room ${roomNum}. The nearest drench shower/eyewash is immediately accessible with a clear path.`
        },
        disposalGuidelines: "Pour flammables waste into designated green-coded amber glass waste receptacles. Clearly write 'Hazardous Waste - Flammable Organic Solvents' and the list of active percentages. Do not mix with halogenated substances. Register pick up via Tulane OEHS (OEHS@tulane.edu).",
        trainingRequirements: "Required complete training of Tulane laboratory chemical hygiene communication pathways and chemical-specific physical safe-handling processes.",
        testingAndDocumentation: "N/A - Solvent does not form organic peroxides under standard storage conditions unless left open next to oxygen for extended years.",
        regulatoryReferences: "OSHA Lab Standard 29 CFR 1910.1450, Tulane OEHS Chemical Hygiene Plan, and NIOSH Safety Guide for Flammable Solvents."
      };
      break;

    case "corrosive":
      sop = {
        chemicalName: normName,
        casNumber: normCas,
        hazards: hazards.length > 0 ? hazards : ["Corrosive"],
        additionalHazards: "Strong mineral oxidant or base. Causes severe chemical tissue burns, destructive eye damage, and releasing toxic acidic fumes upon decomposing reactively.",
        purpose: `This Standard Operating Procedure (SOP) describes acid/base containment safety and remediation for handling concentrated corrosive reagents including ${normName} in Room ${roomNum}.`,
        responsibilities: `The Principal Investigator (${piName}) must establish acid-designated benches and provide specialized neutralizing materials. Lab members must verify that emergency washes are unoccupied before acid work.`,
        safetyMeasures: {
          engineeringControls: "Mandatorily handle inside an executive acid-rated chemical fume hood with corrosion-proof ducting. The sash must be kept at the lowest operational level. Do not work with hot concentrated acids on wooden benches.",
          ppe: "Thick chemical-resistant neoprene or butyl gloves (note: thin nitrile does not have chemical resistance to high mineral concentrations). Splash goggles, high-density lab coat, face shield (when handling volumes above 250mL), and heavy acid impervious apron.",
          saferAlternatives: "Utilize diluted forms of the acid or base (e.g., 5% or 10% concentrations) wherever experimental protocols permit to greatly minimize critical burn dangers."
        },
        handlingProcedures: "When blending or diluting, always slowly add ACID to WATER (never water to acid!) to avoid heat-driven boiling and popping splatters. Do not allow contact with organic reagents, volatile solvents, or cellulosic products like paper towels (organic reactions can ignite).",
        storageRequirements: "Store inside a dedicated, corrosion-proof acid/base safety cabinet on secondary high-density polyethylene trays. Separately store acids from bases and organic solvents. Keep oxidizers (e.g., Nitric Acid) separate from acetic acid.",
        spillAndFirstAid: {
          spillProcedures: "Do not absorb with paper towels or sawdust (spontaneous combustion hazard). Treat spills under the fume hood by slowly applying sodium bicarbonate (for acids) or citric acid (for bases) neutralizer. Once bubbling has completely ceased, clean up with absorbent pads.",
          firstAid: "Skin: Jump under safety drench shower for 15 minutes, removing clothes. Eyes: Flush with copious water at public eyewash for 15 minutes. Ingestion: Rinse mouth, drink plenty of fresh water to dilute, do not induce vomiting, and call emergency transport.",
          emergencyLocations: `The acid neutralizer spill kit is stored directly underneath the fume hood setup in Room ${roomNum}. The nearest drench shower is down the hall.`
        },
        disposalGuidelines: "Store corrosive waste in original high-density polyethylene (HDPE) waste jars. Never mix mineral corrosives with organic flammables in closed containers. Clearly label on EHS standard tags and queue pick up.",
        trainingRequirements: "Mandatory acid/base safety coursework and a supervised hands-on walk-through of neutralize-reclaim protocols signed off by a senior researcher.",
        testingAndDocumentation: "N/A - Visually inspect container cap seals annually for deterioration, salt crusting, or color fading.",
        regulatoryReferences: "OSHA 29 CFR 1910.1450 Corrosive Safety Appendix, Tulane OEHS Chemical Hygiene Manual, and NIOSH Corrosives Database."
      };
      break;

    case "toxic":
      sop = {
        chemicalName: normName,
        casNumber: normCas,
        hazards: hazards.length > 0 ? hazards : ["Toxic"],
        additionalHazards: "Systemic health hazard, acute toxin, potential carcinogen, mutagen, or reproductive hazard. Highly dangerous via inhalation, oral pathways, or dermal absorption.",
        purpose: `This Standard Operating Procedure (SOP) describes special safe containment controls, handling protocols, and protective boundaries for working with toxic/systemically poisonous compound ${normName} in Room ${roomNum}.`,
        responsibilities: `The PI (${piName}) is responsible for documenting a designated toxic use area in the laboratory housing. Only certified personnel under clear supervision are allowed to weigh or prepare standard batches.`,
        safetyMeasures: {
          engineeringControls: "Must be handled within a certified Chemical Fume Hood or clean glovebox atmosphere. If solid powder, weigh inside the containment hood. Ensure the exhaust airflow velocity is active and warning bells are silent.",
          ppe: "Double-glove using standard nitrile gloves (discarding the outer glove immediately upon speckling). Closed laboratory coat, splash safety goggles, long trousers, and solid closed leather shoes.",
          saferAlternatives: "Verify if chemical compounds can be purchased as stable pre-dissolved liquid aliquots to eliminate breathing risk or powder particulate dissemination."
        },
        handlingProcedures: "Do not weigh powders near window drafts or open doorways. Always wash hands immediately after glove removal. Fully clean all analytical weighing spoon tips and surrounding balance surfaces with secondary waste wipes.",
        storageRequirements: "Keep stored locked inside a dedicated, secure chemical cabinet labeled 'Highly Toxic / Carcinogen Keep Out'. Keep away from incompatible classes (e.g., avoid strong acids if using azides/cyanides, preventing lethal gas).",
        spillAndFirstAid: {
          spillProcedures: "For dry powder spills, slowly apply damp absorbent pads to prevent dust from floating. For solutions, absorb with inert clay or organic pillows. Place all contaminated cleanup items in durable double bags, and contact Tulane EHS.",
          firstAid: "Inhalation: Immediately extract exposed victim to outdoors fresh air. Skin: Wash thoroughly with water and medical-grade soap for 15 min. Eyes: Flush for 15 minutes under flowing eyewash. Consult poison control lines.",
          emergencyLocations: `The chemical poison antidote kit is stored near the central laboratory desk in Room ${roomNum}. Standard EHS emergency contact is posted on the wall.`
        },
        disposalGuidelines: "Place all toxic residue and contaminated pipette tips in thick-walled waste glass or HDPE. List exact solute percentages. Label clearly with 'Hazardous Waste - Toxic Toxin' and dispatch via the Tulane EHS web console.",
        trainingRequirements: "Tulane Hazardous Communication Training, specific carcinogen/mutagen containment coaching, and full SOP signature proof.",
        testingAndDocumentation: "Weekly cleanliness check of the designated toxic balance area, recorded in the lab safety clipboard ledger.",
        regulatoryReferences: "OSHA 29 CFR 1910.1450 Special Toxics Standard, Tulane EHS Carcinogen Protocol, and NIOSH Toxic Database Listing."
      };
      break;

    case "reactive":
      sop = {
        chemicalName: normName,
        casNumber: normCas,
        hazards: hazards.length > 0 ? hazards : ["Reactive", "Flammable"],
        additionalHazards: "Highly reactive compound. Spontaneously ignites on exposure to air (pyrophoric) or releases flammable/explosive hydrogen gases on reaction with water or humidity.",
        purpose: `This Standard Operating Procedure (SOP) outlines critical extreme containment steps and emergency responses for highly reactive/air-water sensitive material ${normName} in Room ${roomNum}.`,
        responsibilities: `The PI (${piName}) must certify that dry sand/smothering media are inside the room, and must oversee the operator's first active batch run. No solitary evening operations are permitted.`,
        safetyMeasures: {
          engineeringControls: "Operation must occur inside a continuous inert gas (Argon/Nitrogen) glovebox, or using specialized air-free cannula needles inside a certifiably dry hood. Shielding sash shield must remain operational and closed.",
          ppe: "Thick flame-resistant Nomex lab coats (an absolute, non-negotiable rule), heavy leather overgloves when operating syringe valves, chemical splash goggles, and fully closed leather work boots.",
          saferAlternatives: "Switch to pre-packaged lower concentrations (e.g., 1.0M butyllithium down from 10M) to limit fire intensity, or purchase active materials as soft oil dispersions."
        },
        handlingProcedures: "Never allow contact with atmospheric air, humidity, or moisture. Use completely dried syringes and glassware purged with inert gas multiple times. Have dry sand or soda ash open and near your hand prior to puncturing bottle caps.",
        storageRequirements: "Store container under protective mineral oil, inside secondary air-tight containment jars. Secure in a dedicated flammables safety cabinet away from water pipes, faucets, aqueous reagents, or sprinkler zones.",
        spillAndFirstAid: {
          spillProcedures: "STRICT WARNING: Do NOT use water, foam, or standard wet absorbents - these cause extreme fires. Smother the area completely with dry sand or soda ash. Once fire is extinguished and surface is cool, scoop residues into metal tubs.",
          firstAid: "Skin: Gently brush away dry chemicals with clean dry towels, then rinse skin with large volumes of dry olive oil or water (if certain chemical has been removed). Eyes: Flush with water. Seek direct medical trauma room.",
          emergencyLocations: `A bucket of Class D dry sand is positioned right next to the fume hood in Room ${roomNum}. Safety fire blanket is mounted directly on the wall for immediate wrap-around.`
        },
        disposalGuidelines: "Quench all small residual volumes slowly under an inert atmosphere with dry isopropyl alcohol prior to discarding. Dispose of solid dry sand residues in labeled metal buckets with tight screw-top lids. Route through Tulane EHS.",
        trainingRequirements: "Highly specialized Air-Free Cannula/Syringe Operations training course and direct side-by-side coaching signed off by the PI.",
        testingAndDocumentation: "Perform complete syringe gasket integrity inspection prior to every process run, logging date and air pressure tests.",
        regulatoryReferences: "OSHA 29 CFR 1910.1450 Reactive Hazards standard, Tulane EHS Air-Free Protocol, and NIOSH Reactives Directory."
      };
      break;

    default: // general
      sop = {
        chemicalName: normName,
        casNumber: normCas,
        hazards: hazards.length > 0 ? hazards : ["Toxic"],
        additionalHazards: "Standard chemical reagent hazard class demanding basic laboratory safety discipline, protective coatings, and certified local ventilation.",
        purpose: `This Standard Operating Procedure (SOP) describes general handling, containment, and waste disposal protocols for ${normName} in Room ${roomNum}.`,
        responsibilities: `The PI (${piName}) is responsible for keeping MSDS/SDS sheets accessible and ensuring researchers understand the core risks. Lab workers must maintain clear benches.`,
        safetyMeasures: {
          engineeringControls: "Should be handled inside a certified Chemical Fume Hood or custom local spot exhaust snout if vapors or particles are generated. Standard room air changes active.",
          ppe: "Standard cotton lab coat, safety glasses with clear side shields, and 4-mil to 6-mil nitrile laboratory gloves. Discard gloves if chemical is spilled directly on hand.",
          saferAlternatives: "Explore alternative green organic reagents or non-volatile solvents listed on the ACS Green Chemistry database."
        },
        handlingProcedures: "Maintain basic clean bench hygiene. Wash hands when entering and exiting the lab room. Never pipette by mouth. Keep bottle closed tightly with positive seal.",
        storageRequirements: "Store inside a general chemical safety cabinet organized by thermodynamic hazard group list. Keep bottle labeled and dry.",
        spillAndFirstAid: {
          spillProcedures: "Absorb spill with general chemical-absorbent towels from the wall safety cabinet. Discard waste in standard zip-sealed chemical bags under the ventilation hood.",
          firstAid: "Eyes: Rinse at eyewash station for 15 minutes. Skin: Thoroughly wash with soap and water of comfortable temp. Inhalation: Move to well-ventilated open air.",
          emergencyLocations: `The standard lab chemical spill kit is located near the secondary door of Room ${roomNum}. Phone is mounted with Tulane EHS contacts.`
        },
        disposalGuidelines: "Collect waste liquid or solid in compliant laboratory waste jars. Clearly write full chemical content. Place request using the online Tulane EHS request app.",
        trainingRequirements: "Complete Tulane University General Laboratory Safety & Chemical Hygiene Plan online instruction.",
        testingAndDocumentation: "N/A - General substance verification under standard inventory.",
        regulatoryReferences: "OSHA Laboratory Standard 29 CFR 1910.1450 and general Tulane OEHS directives."
      };
      break;
  }

  return sop;
}
