import { jsPDF } from "jspdf";
import { TulaneSOPData, SOPMetadata } from "../types";

// Tulane color palette values
const COLOR_PRIMARY_GREEN: [number, number, number] = [0, 103, 71]; // #006747 Tulane Green
const COLOR_SECONDARY_GOLD: [number, number, number] = [217, 119, 6]; // #d97706 Tulane Gold
const COLOR_CHARCOAL_TEXT: [number, number, number] = [33, 41, 54]; // Dark slate text
const COLOR_MUTED_GRAY: [number, number, number] = [100, 116, 139]; // Muted label text

export function generateSOPPdf(
  metadata: SOPMetadata,
  sopData: TulaneSOPData,
  equipmentMap: {
    eyewash: { distance: number; direction: string; description: string; active: boolean };
    shower: { distance: number; direction: string; description: string; active: boolean };
    extinguisher: { distance: number; direction: string; description: string; active: boolean };
  }
) {
  // Create jsPDF instance with standard 210mm x 297mm (A4) dimensions
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170mm

  let totalPages = 1;
  let currentY = 15;

  // Helper variables to track rendering state
  let footerY = pageHeight - 15;

  // Draw Header Decoration & Footer
  function drawHeaderFooter(pageNumber: number) {
    // Top fine gold rule
    doc.setDrawColor(COLOR_SECONDARY_GOLD[0], COLOR_SECONDARY_GOLD[1], COLOR_SECONDARY_GOLD[2]);
    doc.setLineWidth(1.2);
    doc.line(marginX, 12, pageWidth - marginX, 12);

    // Footer divider
    doc.setDrawColor(226, 232, 240); // very light gray
    doc.setLineWidth(0.4);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text(
      "Tulane University Office of Environmental Health & Safety (EHS) • OEHS@tulane.edu",
      marginX,
      footerY
    );
    doc.text(`Page ${pageNumber}`, pageWidth - marginX, footerY, { align: "right" });
  }

  // Draw initial page decoration
  drawHeaderFooter(1);

  // Helper function to handle wrapping paragraphs and moving to new page automatically
  function addParagraph(
    text: string,
    fontSize: number = 9.5,
    style: "normal" | "bold" | "italic" = "normal",
    color: [number, number, number] = COLOR_CHARCOAL_TEXT,
    lineGap: number = 1.2
  ) {
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    const estimatedLineHeight = fontSize * 0.42; // standard font height to mm converter

    for (let i = 0; i < lines.length; i++) {
      if (currentY + estimatedLineHeight > footerY - 8) {
        // Trigger page break
        doc.addPage();
        totalPages++;
        drawHeaderFooter(totalPages);
        currentY = 22; // Start position below header rule
      }
      doc.text(lines[i], marginX, currentY);
      currentY += estimatedLineHeight + lineGap;
    }
    currentY += 1.5; // space after paragraph
  }

  // Draw Tulane EHS header shield logo + Title
  function drawMainTitle() {
    // Draw a neat solid vector shield vector icon
    doc.setDrawColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
    doc.setFillColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
    
    // Draw outer green shield
    const sx = marginX;
    const sy = 16;
    doc.rect(sx, sy, 10, 10, "FD");
    
    // Inner shield emblem drawing (cross)
    doc.setDrawColor(COLOR_SECONDARY_GOLD[0], COLOR_SECONDARY_GOLD[1], COLOR_SECONDARY_GOLD[2]);
    doc.setLineWidth(1.0);
    doc.line(sx + 5, sy + 2, sx + 5, sy + 8);
    doc.line(sx + 2, sy + 5, sx + 8, sy + 5);

    // Title Texts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
    doc.text("TULANE UNIVERSITY CHEMICAL SAFETY", sx + 13, sy + 4.5);

    doc.setFont("helvetica", "semibold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("Environmental Health & Safety Workstation • OSHA 29 CFR 1910.1450 Compliance", sx + 13, sy + 9);

    currentY = 32;

    // Standard Document Title Banner
    doc.setFillColor(241, 245, 249); // light cool slate
    doc.rect(marginX, currentY, contentWidth, 9, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text("STANDARD OPERATING PROCEDURE FOR HAZARDOUS CHEMICALS", marginX + 3, currentY + 6.2);
    currentY += 14;
  }

  drawMainTitle();

  // Draw Administrative / Metadata grid box
  function drawMetadataGrid() {
    doc.setDrawColor(15, 23, 42); // solid thin black grid
    doc.setLineWidth(0.35);

    const boxHeight = 33;
    const colWidth = contentWidth / 3;

    // Outer boundary box
    doc.rect(marginX, currentY, contentWidth, boxHeight, "S");

    // Horizontal split lines inside box
    doc.line(marginX, currentY + 11, marginX + contentWidth, currentY + 11);
    doc.line(marginX, currentY + 22, marginX + contentWidth, currentY + 22);

    // Vertical dividers - Row 1
    doc.line(marginX + colWidth, currentY, marginX + colWidth, currentY + 11);
    doc.line(marginX + colWidth * 2, currentY, marginX + colWidth * 2, currentY + 11);

    // Vertical divider - Row 2
    doc.line(marginX + colWidth * 2, currentY + 11, marginX + colWidth * 2, currentY + 22);

    // Vertical divider - Row 3
    doc.line(marginX + colWidth * 2, currentY + 22, marginX + colWidth * 2, currentY + 33);

    // Cell Texts & Values (Row 1)
    // Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("DATE CREATED/REVISED", marginX + 2.5, currentY + 4);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    doc.text(metadata.dateCreated || "N/A", marginX + 2.5, currentY + 8.5);

    // Department
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("DEPARTMENT OFFICE", marginX + colWidth + 2.5, currentY + 4);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    const deptTruncated = metadata.department.length > 25 ? metadata.department.slice(0, 25) + "..." : metadata.department;
    doc.text(deptTruncated || "N/A", marginX + colWidth + 2.5, currentY + 8.5);

    // Room
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("LABORATORY ROOM #", marginX + colWidth * 2 + 2.5, currentY + 4);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    doc.text(metadata.room || "N/A", marginX + colWidth * 2 + 2.5, currentY + 8.5);

    // Cell Texts & Values (Row 2)
    // Principal Investigator (takes 2 cols width)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("PRINCIPAL INVESTIGATOR (PI)", marginX + 2.5, currentY + 14.5);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    doc.text(metadata.principalInvestigator || "N/A", marginX + 2.5, currentY + 19);

    // DSR
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("EHS REPRESENTATIVE / DSR", marginX + colWidth * 2 + 2.5, currentY + 14.5);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    const dsrTruncated = metadata.dsr.length > 25 ? metadata.dsr.slice(0, 25) + "..." : metadata.dsr;
    doc.text(dsrTruncated || "N/A", marginX + colWidth * 2 + 2.5, currentY + 19);

    // Cell Texts & Values (Row 3 - MSDS Link and Attachment details)
    // MSDS Web Link (takes 2 cols width)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("ASSOCIATED MSDS/SDS WEB LINK", marginX + 2.5, currentY + 25.5);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    
    const msdsUrlRaw = metadata.msdsUrl || "";
    let msdsUrlTruncated = "N/A";
    if (msdsUrlRaw) {
      msdsUrlTruncated = msdsUrlRaw.length > 80 ? msdsUrlRaw.slice(0, 77) + "..." : msdsUrlRaw;
    }
    doc.text(msdsUrlTruncated, marginX + 2.5, currentY + 30);

    // Physical SDS File Attachment (takes 1 col width)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
    doc.text("PHYSICAL SDS FILE ATTACHMENT", marginX + colWidth * 2 + 2.5, currentY + 25.5);
    doc.setFont("helvetica", "semibold");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
    
    const msdsFileNameRaw = metadata.msdsFileName || "";
    let msdsFileNameTruncated = "No document file attached";
    if (msdsFileNameRaw) {
      msdsFileNameTruncated = msdsFileNameRaw.length > 28 ? msdsFileNameRaw.slice(0, 25) + "..." : msdsFileNameRaw;
      doc.setTextColor(8, 122, 85); // elegant emerald hue for active attachment
    }
    doc.text(msdsFileNameTruncated, marginX + colWidth * 2 + 2.5, currentY + 30);

    currentY += boxHeight + 4;

    // Draw little informative notice
    doc.setFillColor(248, 250, 252); // extremely light gray/blue
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(marginX, currentY, contentWidth, 8, "FD");
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Notice: Extracted from chemical specifications to reflect Room ${metadata.room} operating controls supervised by PI ${metadata.principalInvestigator}.`,
      marginX + 2.5,
      currentY + 5
    );

    currentY += 13;
  }

  drawMetadataGrid();

  // Helper section renderer with bulletproof page tracking and custom left vertical color bar
  function renderSectionHeader(title: string) {
    if (currentY + 15 > footerY - 5) {
      // Create new page to prevent orphan headings
      doc.addPage();
      totalPages++;
      drawHeaderFooter(totalPages);
      currentY = 22;
    }

    // Left vertical accent stroke (Tulane green)
    doc.setFillColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
    doc.rect(marginX, currentY, 2, 6.2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
    doc.text(title.toUpperCase(), marginX + 3.8, currentY + 5);

    // Underline separating rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY + 7.5, marginX + contentWidth, currentY + 7.5);

    currentY += 12;
  }

  // 1. purpose
  renderSectionHeader("1. Purpose & Scope");
  addParagraph(sopData.purpose || "No stated purpose declared.");

  // 2. responsibilities
  renderSectionHeader("2. Roles & Laboratory Responsibilities");
  addParagraph(sopData.responsibilities || "No laboratory responsibilities listed.");

  // 3. Chemical & CAS
  renderSectionHeader("3. Regulated Chemical Profile");
  addParagraph(`Chemical Substance Name:  ${sopData.chemicalName}`, 10, "bold", [15, 23, 42], 0.5);
  addParagraph(`Chemical CAS Registry Number:  ${sopData.casNumber}`, 9.5, "normal", COLOR_CHARCOAL_TEXT, 3);

  // 4. Compliance Hazards
  renderSectionHeader("4. OSHA compliance Hazards & Classifications");
  addParagraph("Active Chemical Hazard Flags Selected:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  const hazardList = sopData.hazards.length > 0 ? sopData.hazards.join(", ") : "No basic hazards categorized";
  addParagraph(`• Key classifications: ${hazardList}`, 9.5, "bold", [185, 28, 28], 1.5);
  addParagraph("Specific Acute & Health Hazards:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.additionalHazards || "No supplementary safety details entered.", 9.5, "italic", COLOR_CHARCOAL_TEXT, 4);

  // 5. Engineering controls
  renderSectionHeader("5. Mandatory Engineering & Containment Controls");
  addParagraph(sopData.safetyMeasures.engineeringControls || "No controls entered.");

  // 6. PPE
  renderSectionHeader("6. Personal Protective Equipment (PPE)");
  addParagraph(sopData.safetyMeasures.ppe || "No PPE listed.");

  if (sopData.safetyMeasures.saferAlternatives) {
    addParagraph("Green Alternatives & Process Tweak Guidance:", 9, "bold", COLOR_PRIMARY_GREEN);
    addParagraph(sopData.safetyMeasures.saferAlternatives);
  }

  // 7. Handling and Storage
  renderSectionHeader("7. Safe Handling Procedures & Storage Standards");
  addParagraph("Standard Daily Operational Safety Measures:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.handlingProcedures || "No specific guidelines provided.");
  addParagraph("Chemical Cabinets & Isolation Protocols:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.storageRequirements || "No generic storage rules declared.", 9.5, "normal", COLOR_CHARCOAL_TEXT, 4);

  // 8. Emergency Spill, First Aid and Location map
  renderSectionHeader("8. Spill Remediation, First Aid, & Equipment Coordinates");
  addParagraph("Immediate Initial Spill Remediation Measures:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.spillAndFirstAid.spillProcedures || "No rules defined.");
  
  addParagraph("Immediate First Aid Exposures Procedure:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.spillAndFirstAid.firstAid || "No exposure protocols detailed.");

  addParagraph("Local Laboratory Safety Equipment Description:", 9, "bold", COLOR_PRIMARY_GREEN, 0.5);
  addParagraph(sopData.spillAndFirstAid.emergencyLocations || "No local coordinates inputted.", 9.5, "italic", COLOR_MUTED_GRAY, 4);

  // HIGH FIDELITY GEOMETRIC SCHEMATIC DRAWING IN PDF SECTION!
  if (currentY + 68 > footerY) {
    // Add page if the schematic drawing can't fit
    doc.addPage();
    totalPages++;
    drawHeaderFooter(totalPages);
    currentY = 22;
  }

  // Draw schematic box card container
  doc.setDrawColor(203, 213, 225); // light border slate
  doc.setFillColor(252, 252, 253);
  doc.setLineWidth(0.35);
  doc.rect(marginX, currentY, contentWidth, 54, "FD");

  // Title of schematic
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("HIGH FIDELITY LABORATORY EHS EMERGENCY FLOOR MAP", marginX + 3.5, currentY + 4.5);
  
  // Center of our miniature vector schematic inside the box
  const cx = marginX + 32;
  const cy = currentY + 28;

  // Draw concentric distance circles (scale is about 23mm radius max representing 25ft)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.circle(cx, cy, 6, "S");
  doc.circle(cx, cy, 12, "S");
  doc.circle(cx, cy, 18, "S");
  doc.setDrawColor(180, 180, 180);
  doc.circle(cx, cy, 23, "S"); // outer ring

  // Draw axis crosshairs
  doc.setDrawColor(241, 245, 249);
  doc.line(cx - 24, cy, cx + 24, cy);
  doc.line(cx, cy - 24, cx, cy + 24);

  // Compass directions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("N", cx, cy - 24.5, { align: "center" });
  doc.text("S", cx, cy + 26.5, { align: "center" });
  doc.text("E", cx + 25.5, cy + 2, { align: "center" });
  doc.text("W", cx - 27.5, cy + 2, { align: "center" });

  // Helper coordinate converter for PDF unit
  const convertToMapCoords = (direction: string, distance: number) => {
    const maxDist = 25;
    const r = Math.min((distance / maxDist) * 22, 23);
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
    }
    return { x: cx + dx * r, y: cy + dy * r };
  };

  // Draw active items on PDF Map
  if (equipmentMap.eyewash.active) {
    const pt = convertToMapCoords(equipmentMap.eyewash.direction, equipmentMap.eyewash.distance);
    doc.setDrawColor(8, 145, 178); // cyan
    doc.setFillColor(236, 254, 255);
    doc.setLineWidth(0.6);
    doc.circle(pt.x, pt.y, 2.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(8, 145, 178);
    doc.text("EW", pt.x, pt.y + 1.8, { align: "center" });
  }

  if (equipmentMap.shower.active) {
    const pt = convertToMapCoords(equipmentMap.shower.direction, equipmentMap.shower.distance);
    doc.setDrawColor(5, 150, 105); // emerald green
    doc.setFillColor(240, 253, 244);
    doc.setLineWidth(0.6);
    doc.circle(pt.x, pt.y, 2.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(5, 150, 105);
    doc.text("SH", pt.x, pt.y + 1.8, { align: "center" });
  }

  if (equipmentMap.extinguisher.active) {
    const pt = convertToMapCoords(equipmentMap.extinguisher.direction, equipmentMap.extinguisher.distance);
    doc.setDrawColor(220, 38, 38); // red
    doc.setFillColor(254, 242, 242);
    doc.setLineWidth(0.6);
    doc.circle(pt.x, pt.y, 2.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(220, 38, 38);
    doc.text("FE", pt.x, pt.y + 1.8, { align: "center" });
  }

  // Draw center reference node (Amber gold)
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(255, 251, 235);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, 2, "FD");

  // Draw Legend Block on right half of card
  const lx = marginX + 68;
  let ly = currentY + 11;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Floorplan Equipment Legend:", lx, ly);
  ly += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("• Center Amber Dot (0,0):  Reference Workstation Desk", lx, ly);
  ly += 4;

  if (equipmentMap.eyewash.active) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178);
    doc.text(`• [EW] Eyewash Station:`, lx, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`   ${equipmentMap.eyewash.distance} ft ${equipmentMap.eyewash.direction} (${equipmentMap.eyewash.description || "near bay"})`, lx + 33, ly);
    ly += 4;
  }

  if (equipmentMap.shower.active) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text(`• [SH] Safety Shower:`, lx, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`   ${equipmentMap.shower.distance} ft ${equipmentMap.shower.direction} (${equipmentMap.shower.description || "clear aisle"})`, lx + 33, ly);
    ly += 4;
  }

  if (equipmentMap.extinguisher.active) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`• [FE] Fire Extinguisher:`, lx, ly);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`   ${equipmentMap.extinguisher.distance} ft ${equipmentMap.extinguisher.direction} (${equipmentMap.extinguisher.description || "on mount"})`, lx + 33, ly);
    ly += 4;
  }

  // Draw scale notice in legend
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Concentric rings trace: inner = 5ft, dashed = 10ft, 15ft, outer boundary = 20-25ft.", lx, ly + 2.5);

  currentY += 60; // Advance past map block

  // 9. Regulated disposal
  renderSectionHeader("9. Hazardous Material Reclamation & Disposal");
  addParagraph(sopData.disposalGuidelines || "No specific guidelines provided.");

  // 10. Training 
  renderSectionHeader("10. Mandatory Training Requirements");
  addParagraph(sopData.trainingRequirements || "No training courses stated.");

  // 11. Testing and documentation
  renderSectionHeader("11. Periodic Lab Testing & Documentation Protocols");
  addParagraph(sopData.testingAndDocumentation || "No custom interval tests written.");

  // 12. References
  renderSectionHeader("12. Tulane Office of EHS & Regulatory References");
  addParagraph(sopData.regulatoryReferences || "OSHA Laboratory Standard 29 CFR 1910.1450.");

  // PI COMPLIANCE SIGNATURE BLOCK (Optimized for Adobe Acrobat / Acrobat Sign)
  if (currentY + 45 > footerY) {
    doc.addPage();
    totalPages++;
    drawHeaderFooter(totalPages);
    currentY = 22;
  }

  currentY += 2;

  // Render a golden or green-accented formal box for approvals
  doc.setDrawColor(COLOR_SECONDARY_GOLD[0], COLOR_SECONDARY_GOLD[1], COLOR_SECONDARY_GOLD[2]);
  doc.setFillColor(255, 251, 235); // warm gold tinted bg
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, contentWidth, 34, "FD");

  // Compliance Certification text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
  doc.text("PRINCIPAL INVESTIGATOR (PI) COMPLIANCE CERTIFICATION & FORMAL SIGN-OFF", marginX + 4, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
  doc.text(
    "By signing below (digitally via Adobe Acrobat / Adobe Sign or physically with ink), the Principal Investigator certifies",
    marginX + 4,
    currentY + 10.5
  );
  doc.text(
    `that this EHS compliance standard operating procedure is fully accurate, approved, and enacted for Room ${metadata.room || "N/A"}.`,
    marginX + 4,
    currentY + 14
  );

  // Digital Signature Field Box (for Acrobat)
  const sigBoxW = 60;
  const sigBoxH = 14;
  const sigBoxX = marginX + 4;
  const sigBoxY = currentY + 17;

  // Border for signature field (with solid outline which Adobe Acrobat Auto-Detect Signature Field mechanism expects)
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.setFillColor(254, 254, 255);
  doc.setLineWidth(0.42);
  doc.rect(sigBoxX, sigBoxY, sigBoxW, sigBoxH, "FD");

  // Subtle guide text inside the signature box
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text("[ CLICK TO SIGN IN ADOBE ACROBAT ]", sigBoxX + sigBoxW / 2, sigBoxY + 8.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("PI Signature Field / Adobe Certified ID: ", sigBoxX, sigBoxY - 1.5);

  // Name and Date lines on the right
  const labelX = marginX + 70;
  const lineW = 34;

  // Name Printed Line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
  doc.text("PRINT PI NAME:", labelX, currentY + 20.5);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(labelX + 26, currentY + 21, labelX + 26 + lineW, currentY + 21);
  doc.setFont("helvetica", "semibold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
  doc.text(metadata.principalInvestigator || "", labelX + 27, currentY + 20);

  // Date Line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
  doc.text("APPROVAL DATE:", labelX, currentY + 28.5);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(labelX + 26, currentY + 29, labelX + 26 + lineW, currentY + 29);
  doc.setFont("helvetica", "semibold");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_CHARCOAL_TEXT[0], COLOR_CHARCOAL_TEXT[1], COLOR_CHARCOAL_TEXT[2]);
  doc.text(metadata.dateCreated || "", labelX + 27, currentY + 28);

  // Verification Seal
  const sealX = marginX + 136;
  const sealY = currentY + 17;
  doc.setDrawColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
  doc.setFillColor(240, 253, 244);
  doc.setLineWidth(0.45);
  doc.rect(sealX, sealY, 30, sigBoxH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(COLOR_PRIMARY_GREEN[0], COLOR_PRIMARY_GREEN[1], COLOR_PRIMARY_GREEN[2]);
  doc.text("TULANE EHS", sealX + 15, sealY + 3.8, { align: "center" });
  doc.setFont("helvetica", "semibold");
  doc.setFontSize(5);
  doc.text("SOP REAGENT VERIFIED", sealX + 15, sealY + 7.2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4);
  doc.setTextColor(COLOR_MUTED_GRAY[0], COLOR_MUTED_GRAY[1], COLOR_MUTED_GRAY[2]);
  doc.text("Compliance Code: 29CFR1910", sealX + 15, sealY + 11.2, { align: "center" });

  currentY += 38;

  // Finally, trigger browser PDF download with format-specific naming
  const rawSubstanceName = sopData.chemicalName || "Chemical";
  const sanitizedSubstance = rawSubstanceName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .slice(0, 30);
  
  doc.save(`tulane_ehs_sop_${sanitizedSubstance}.pdf`);
}
