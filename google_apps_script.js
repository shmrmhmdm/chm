/**
 * Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025)
 * Google Apps Script Backend, Auto-Setup & Daily AI Question Generator
 * 
 * ============================================================================
 * 🤖 എല്ലാ ദിവസവും 50 ചോദ്യങ്ങൾ വീതം ഓട്ടോമാറ്റിക്കായി ചേർക്കാൻ:
 * 1. Google AI Studio-ൽ നിന്ന് സൗജന്യമായി Gemini API Key എടുക്കുക (aistudio.google.com).
 * 2. താഴെ കൊടുത്തിരിക്കുന്ന GEMINI_API_KEY എന്ന വരിയിൽ നിങ്ങളുടെ കീ നൽകുക.
 * 3. ഗൂഗിൾ ഷീറ്റ് തുറക്കുമ്പോൾ മുകളിൽ '🤖 PSC AI Generator' എന്ന പുതിയ മെനു കാണാം.
 *    അതിൽ '⏰ Setup Daily Auto-Trigger' ക്ലിക്ക് ചെയ്താൽ എല്ലാ ദിവസവും രാവിലെ തനിയെ ചോദ്യങ്ങൾ ആഡ് ആകും!
 * ============================================================================
 */

// 🔑 നിങ്ങളുടെ സൗജന്യ Gemini API Key ഇവിടെ നൽകുക (aistudio.google.com):
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// 1. ഷീറ്റുകൾ ഓട്ടോമാറ്റിക്കായി നിർമ്മിക്കാനുള്ള ഫംഗ്ഷൻ (RUN THIS ONCE)
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const modules = [
    { name: "Module_1_Electronics", title: "Module 1: Basic Electronics (12 Marks)" },
    { name: "Module_2_Comp_Fundamentals", title: "Module 2: Computer Fundamentals (8 Marks)" },
    { name: "Module_3_Adv_Hardware_Storage", title: "Module 3: Advanced Hardware & Storage (10 Marks)" },
    { name: "Module_4_OS_Deployment", title: "Module 4: Operating Systems & Deployment (10 Marks)" },
    { name: "Module_5_System_Utilities", title: "Module 5: System Utilities & Maintenance (10 Marks)" },
    { name: "Module_6_Office_Applications", title: "Module 6: Office Applications (10 Marks)" },
    { name: "Module_7_IO_Devices", title: "Module 7: I/O Devices & Maintenance (10 Marks)" },
    { name: "Module_8_Networking", title: "Module 8: Networking Fundamentals (10 Marks)" },
    { name: "Module_9_Protocols_Servers", title: "Module 9: Application Protocols & Servers (10 Marks)" },
    { name: "Module_10_Security_Cloud_Law", title: "Module 10: Security, Cloud & IT Law (10 Marks)" },
    { name: "PSC_Previous_Exam", title: "PSC Previous Exam: Junior Instructor 147/2023 (100 Marks)" },
    { name: "PSC_Tradesman_191_2015", title: "PSC Tradesman CHM: 191/2015 (83 Marks)" },
    { name: "PSC_Tradesman_170_2014", title: "PSC Tradesman CHM: 170/2014 (100 Marks)" }
  ];

  const headers = [
    "id", 
    "question", 
    "option_a", 
    "option_b", 
    "option_c", 
    "option_d", 
    "correct_answer", 
    "explanation", 
    "subtopic"
  ];

  // പ്രാരംഭ സാമ്പിൾ ചോദ്യങ്ങൾ
  const initialQuestions = getInitialQuestions();

  modules.forEach(mod => {
    let sheet = ss.getSheetByName(mod.name);
    if (!sheet) {
      sheet = ss.insertSheet(mod.name);
    }
    
    // ഹെഡർ ചേർക്കുന്നു (ഇതിനകം ഇല്ലെങ്കിൽ)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      
      // ഹെഡർ ഫോർമാറ്റിംഗ് (Navy Blue Background, White Bold Text)
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e1b4b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(11);
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);

      // കോളം വീതികൾ ആവശ്യാനുസരണം ക്രമീകരിക്കുന്നു
      sheet.setColumnWidth(1, 80);   // id
      sheet.setColumnWidth(2, 400);  // question
      sheet.setColumnWidth(3, 180);  // option_a
      sheet.setColumnWidth(4, 180);  // option_b
      sheet.setColumnWidth(5, 180);  // option_c
      sheet.setColumnWidth(6, 180);  // option_d
      sheet.setColumnWidth(7, 120);  // correct_answer
      sheet.setColumnWidth(8, 350);  // explanation
      sheet.setColumnWidth(9, 160);  // subtopic

      // സാമ്പിൾ ചോദ്യങ്ങൾ ഉൾപ്പെടുത്തുന്നു
      const modQuestions = initialQuestions.filter(q => q.sheetName === mod.name);
      modQuestions.forEach(q => {
        sheet.appendRow([
          q.id,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer,
          q.explanation,
          q.subtopic
        ]);
      });
    }
  });

  // സ്ഥിരസ്ഥിതിയായ 'Sheet1' ശൂന്യമാണെങ്കിൽ നീക്കം ചെയ്യുക
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  // 11. റഫറൻസ് നോട്ടുകൾക്കും പ്രീവിയസ് ചോദ്യങ്ങൾക്കുമായി പ്രത്യേക ഷീറ്റ്
  let refSheet = ss.getSheetByName("Reference_Notes");
  if (!refSheet) {
    refSheet = ss.insertSheet("Reference_Notes");
    refSheet.appendRow(["Topic / Source Name", "Notes & Previous Exam Questions (NotebookLM / Study Materials)"]);
    const refHeader = refSheet.getRange(1, 1, 1, 2);
    refHeader.setBackground("#0f766e");
    refHeader.setFontColor("#ffffff");
    refHeader.setFontWeight("bold");
    refHeader.setFontSize(11);
    refSheet.setFrozenRows(1);
    refSheet.setColumnWidth(1, 220);
    refSheet.setColumnWidth(2, 650);
    refSheet.appendRow([
      "NotebookLM / Previous Questions",
      "നിങ്ങളുടെ NotebookLM-ൽ നിന്നോ മറ്റ് പുസ്തകങ്ങളിൽ നിന്നോ ഉള്ള പ്രധാന പോയിന്റുകളും മുൻകാല ചോദ്യങ്ങളും ഈ കോളത്തിൽ പേസ്റ്റ് ചെയ്യുക. ദിവസേനയുള്ള ചോദ്യങ്ങൾ നിർമ്മിക്കുമ്പോൾ AI ഈ വിവരങ്ങൾ കൂടി മുൻഗണന നൽകി പരിഗണിക്കും!"
    ]);
  }

  Logger.log("✅ എല്ലാ 10 മൊഡ്യൂൾ ഷീറ്റുകളും റഫറൻസ് ഷീറ്റും വിജയകരമായി തയ്യാറാക്കി!");
}


// 2. വെബ് ആപ്പിലേക്ക് ചോദ്യങ്ങൾ എത്തിക്കാനുള്ള API (WEB APP GET REQUEST)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const params = e.parameter || {};
    const moduleName = params.module;
    
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    
    let result = {};
    
    if (params.action === "getModules") {
      result = {
        status: "success",
        modules: sheetNames
      };
    } else if (!moduleName || moduleName.toLowerCase() === "all") {
      let allQuestions = [];
      sheets.forEach(sheet => {
        const qList = getQuestionsFromSheet(sheet);
        allQuestions = allQuestions.concat(qList);
      });
      result = {
        status: "success",
        total: allQuestions.length,
        questions: allQuestions
      };
    } else {
      const targetSheet = ss.getSheetByName(moduleName);
      if (!targetSheet) {
        return createJsonResponse({
          status: "error",
          message: "Sheet named '" + moduleName + "' not found! Available sheets: " + sheetNames.join(", ")
        });
      }
      const questions = getQuestionsFromSheet(targetSheet);
      result = {
        status: "success",
        module: moduleName,
        total: questions.length,
        questions: questions
      };
    }
    
    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

// 3. ഓട്ടോമേഷൻ വഴി പുതിയ ചോദ്യങ്ങൾ ഷീറ്റിലേക്ക് ചേർക്കാൻ (POST API)
function doPost(e) {
  try {
    let contents = e.postData ? e.postData.contents : "";
    if (!contents) {
      throw new Error("No payload data received");
    }
    const data = JSON.parse(contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const questions = Array.isArray(data.questions) ? data.questions : (Array.isArray(data) ? data : [data]);
    let addedCount = 0;
    
    questions.forEach(q => {
      if (q && q.question && q.option_a && q.option_b && q.correct_answer) {
        const targetSheetName = q.sheetName || data.sheetName || data.module || "Module_1_Electronics";
        let sheet = ss.getSheetByName(targetSheetName);
        
        // ഷീറ്റ് ഇല്ലെങ്കിൽ പുതിയത് ഉണ്ടാക്കുന്നു
        if (!sheet) {
          sheet = ss.insertSheet(targetSheetName);
          sheet.appendRow(["id", "question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "subtopic"]);
        }
        
        sheet.appendRow([
          q.id || ("AI_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000)),
          q.question,
          q.option_a,
          q.option_b,
          q.option_c || "",
          q.option_d || "",
          String(q.correct_answer).toUpperCase().trim(),
          q.explanation || "",
          q.subtopic || ""
        ]);
        addedCount++;
      }
    });
    
    return createJsonResponse({
      status: "success",
      message: `${addedCount} questions successfully added to Google Sheets!`,
      added: addedCount
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function getQuestionsFromSheet(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const questions = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1] || String(row[1]).trim() === "") continue;
    
    let item = {
      sheetName: sheet.getName()
    };
    
    headers.forEach((header, colIndex) => {
      let val = row[colIndex];
      if (header === "correct_answer") {
        val = String(val).trim().toUpperCase();
      }
      item[header] = val !== undefined ? String(val).trim() : "";
    });
    
    if (item.question && item.option_a && item.option_b && item.correct_answer) {
      questions.push(item);
    }
  }
  return questions;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// അടിസ്ഥാന ചോദ്യങ്ങൾ (Initial Seed Data - Complete 100 Syllabus Questions)
function getInitialQuestions() {
  return [
  {
    "id": "M1_01",
    "sheetName": "Module_1_Electronics",
    "question": "According to Kirchhoff's Current Law (KCL), what is the algebraic sum of currents entering and leaving a junction in an electrical circuit?",
    "option_a": "Equal to total voltage",
    "option_b": "Always zero",
    "option_c": "Equal to circuit impedance",
    "option_d": "Infinity",
    "correct_answer": "B",
    "explanation": "Kirchhoff's Current Law (KCL) states that charge cannot accumulate at a node; thus, the algebraic sum of currents meeting at any electrical node is zero (Total Current In = Total Current Out).\n\n[മലയാളം]: കിർച്ചോഫിന്റെ കറന്റ് നിയമം (KCL) അനുസരിച്ച് ഒരു ജംഗ്ഷനിലേക്ക് പ്രവേശിക്കുന്നതും പുറത്തേക്ക് പോകുന്നതുമായ കറന്റുകളുടെ ആകെത്തുക പൂജ്യമായിരിക്കും (ചാർജ്ജ് സംരക്ഷണ നിയമം).",
    "subtopic": "Basic Principles of Electricity"
  },
  {
    "id": "M1_02",
    "sheetName": "Module_1_Electronics",
    "question": "A carbon film resistor has color bands: Yellow, Violet, Orange, and Gold. What is its nominal resistance and tolerance value?",
    "option_a": "47 kΩ ± 5%",
    "option_b": "4.7 kΩ ± 10%",
    "option_c": "37 kΩ ± 5%",
    "option_d": "470 Ω ± 20%",
    "correct_answer": "A",
    "explanation": "In standard color code: Yellow = 4, Violet = 7, Orange = multiplier 10^3 (1,000), Gold = ±5% tolerance. Resistance = 47 × 10^3 = 47,000 Ω = 47 kΩ ± 5%.\n\n[മലയാളം]: റെസിസ്റ്റർ കളർ കോഡ് പ്രകാരം മഞ്ഞ (Yellow) = 4, വയലറ്റ് (Violet) = 7, ഓറഞ്ച് (Orange) = 10^3 (മൾട്ടിപ്ലയർ), സ്വർണ്ണ നിറം (Gold) = ±5% ടോളറൻസ്. അതിനാൽ മൂല്യം 47 kΩ ± 5% ആണ്.",
    "subtopic": "Resistors & Color Coding"
  },
  {
    "id": "M1_03",
    "sheetName": "Module_1_Electronics",
    "question": "What happens to the total capacitance when two capacitors of 10 µF each are connected in parallel in a circuit?",
    "option_a": "Reduces to 5 µF",
    "option_b": "Increases to 20 µF",
    "option_c": "Remains 10 µF",
    "option_d": "Drops to zero",
    "correct_answer": "B",
    "explanation": "For capacitors connected in parallel, the total capacitance is the sum of individual capacitances: C_total = C1 + C2 = 10 µF + 10 µF = 20 µF.\n\n[മലയാളം]: കപ്പാസിറ്ററുകൾ പാരലലായി ഘടിപ്പിക്കുമ്പോൾ അവയുടെ ആകെ കപ്പാസിറ്റൻസ് കൂടുന്നു (C = C1 + C2). അതിനാൽ 10 µF + 10 µF = 20 µF ആയിരിക്കും.",
    "subtopic": "Capacitors & Dielectrics"
  },
  {
    "id": "M1_04",
    "sheetName": "Module_1_Electronics",
    "question": "A step-down transformer has a primary winding of 1000 turns and secondary of 100 turns. If 230 V AC is applied to the primary, what is the secondary output voltage?",
    "option_a": "2300 V",
    "option_b": "23 V",
    "option_c": "115 V",
    "option_d": "12 V",
    "correct_answer": "B",
    "explanation": "Transformer turns ratio formula: Vs / Vp = Ns / Np. Therefore, Vs = Vp × (Ns / Np) = 230 × (100 / 1000) = 23 V.\n\n[മലയാളം]: ട്രാൻസ്ഫോർമർ ടേൺസ് അനുപാതം Vs/Vp = Ns/Np ആണ്. അതിനാൽ സെക്കൻഡറി വോൾട്ടേജ് = 230 × (100 / 1000) = 23 വോൾട്ട്.",
    "subtopic": "Inductors & Transformers"
  },
  {
    "id": "M1_05",
    "sheetName": "Module_1_Electronics",
    "question": "Which type of impurity is added to pure Silicon or Germanium to produce a P-type extrinsic semiconductor?",
    "option_a": "Pentavalent impurity (e.g., Phosphorus, Arsenic)",
    "option_b": "Trivalent impurity (e.g., Boron, Gallium, Indium)",
    "option_c": "Hexavalent impurity",
    "option_d": "Noble gas elements",
    "correct_answer": "B",
    "explanation": "Doping pure semiconductor with trivalent atoms (having 3 valence electrons like Boron, Indium, Gallium) creates excess holes, forming a P-type semiconductor.\n\n[മലയാളം]: ശുദ്ധമായ അർദ്ധചാലകങ്ങളിൽ ട്രൈവാലന്റ് (3 വാലൻസ് ഇലക്ട്രോണുകളുള്ള ബോറോൺ, ഗാലിയം പോലുള്ളവ) ചേർത്താണ് പോസിറ്റീവ് ഹോളുകൾ അധികമുള്ള P-ടൈപ്പ് അർദ്ധചാലകം നിർമ്മിക്കുന്നത്.",
    "subtopic": "Semiconductor Fundamentals"
  },
  {
    "id": "M1_06",
    "sheetName": "Module_1_Electronics",
    "question": "What is the typical barrier potential of a Silicon (Si) PN junction diode and a Germanium (Ge) diode respectively at room temperature?",
    "option_a": "0.7 V and 0.3 V",
    "option_b": "0.3 V and 0.7 V",
    "option_c": "1.2 V and 0.5 V",
    "option_d": "0.1 V and 0.9 V",
    "correct_answer": "A",
    "explanation": "At standard room temperature (25°C), the internal barrier potential is approximately 0.7 V for Silicon and 0.3 V for Germanium PN junction diodes.\n\n[മലയാളം]: റൂം ടെമ്പറേച്ചറിൽ സിലിക്കൺ (Si) ഡയോഡിന്റെ ബാരിയർ പൊട്ടൻഷ്യൽ 0.7 വോൾട്ടും, ജർമ്മേനിയം (Ge) ഡയോഡിന്റേത് 0.3 വോൾട്ടുമാണ്.",
    "subtopic": "PN Junction Diode"
  },
  {
    "id": "M1_07",
    "sheetName": "Module_1_Electronics",
    "question": "In a Silicon Controlled Rectifier (SCR), what is the difference between latching current and holding current?",
    "option_a": "Holding current is required to turn ON; latching is required to maintain OFF",
    "option_b": "Latching current is associated with turn-ON; holding current is the minimum current to maintain ON state",
    "option_c": "Both currents are identical in all operating conditions",
    "option_d": "Latching current is always smaller than holding current",
    "correct_answer": "B",
    "explanation": "Latching current is the minimum anode current required to transition the SCR from OFF to ON and maintain it when gate pulse is removed. Holding current is the minimum current below which SCR drops out of conduction. Latching current is typically 2 to 3 times greater than holding current.\n\n[മലയാളം]: SCR ഓണാക്കാൻ ആവശ്യമായ ഏറ്റവും കുറഞ്ഞ ആനോഡ് കറന്റാണ് ലാച്ചിംഗ് കറന്റ് (Latching Current). ഓൺ അവസ്ഥയിൽ തുടരാൻ ആവശ്യമായ ഏറ്റവും കുറഞ്ഞ കറന്റാണ് ഹോൾഡിംഗ് കറന്റ് (Holding Current).",
    "subtopic": "Power Semiconductor Devices - SCR"
  },
  {
    "id": "M1_08",
    "sheetName": "Module_1_Electronics",
    "question": "Which semiconductor device acts as a bidirectional diode and is universally used for triggering a TRIAC in AC phase control circuits?",
    "option_a": "UJT",
    "option_b": "DIAC",
    "option_c": "Varactor Diode",
    "option_d": "Tunnel Diode",
    "correct_answer": "B",
    "explanation": "A DIAC (Diode for Alternating Current) is a 2-terminal bidirectional switching diode without gate. It conducts only when breakdown voltage is reached in either polarity, making it ideal for triggering TRIACs.\n\n[മലയാളം]: രണ്ട് ദിശകളിലേക്കും ബ്രേക്ക്ഡൗൺ വോൾട്ടേജിൽ സ്വിച്ച് ചെയ്യുന്നതും TRIAC ട്രിഗർ ചെയ്യാൻ വ്യാപകമായി ഉപയോഗിക്കുന്നതുമായ ഉപകരണമാണ് DIAC.",
    "subtopic": "DIAC & TRIAC"
  },
  {
    "id": "M1_09",
    "sheetName": "Module_1_Electronics",
    "question": "When a Bipolar Junction Transistor (BJT) is used as an electronic ON/OFF switch in a digital circuit, in which two regions does it operate?",
    "option_a": "Active region and Inverted region",
    "option_b": "Cut-off region (OFF) and Saturation region (ON)",
    "option_c": "Active region and Breakdown region",
    "option_d": "Saturation region and Active region",
    "correct_answer": "B",
    "explanation": "As an electronic switch, the BJT operates in Cut-off (zero base current, switch open/OFF) and Saturation (maximum collector current, switch closed/ON with minimum Vce drop).\n\n[മലയാളം]: ഒരു ട്രാൻസിസ്റ്റർ (BJT) ഡിജിറ്റൽ സ്വിച്ച് ആയി പ്രവർത്തിക്കുമ്പോൾ കട്ട്-ഓഫ് (Cut-off - പൂർണ്ണമായി ഓഫ്), സാച്ചുറേഷൻ (Saturation - പൂർണ്ണമായി ഓൺ) എന്നീ രണ്ട് അവസ്ഥകളിലാണ് പ്രവർത്തിക്കുന്നത്.",
    "subtopic": "Transistors & BJT"
  },
  {
    "id": "M1_10",
    "sheetName": "Module_1_Electronics",
    "question": "Why do MOSFETs (Metal Oxide Semiconductor Field Effect Transistors) have extremely high input impedance compared to BJTs?",
    "option_a": "Because they use high reverse bias voltage on collector",
    "option_b": "Because the gate terminal is electrically insulated from the channel by a thin Silicon Dioxide (SiO2) dielectric layer",
    "option_c": "Because they operate solely using minority carrier injection",
    "option_d": "Because their channel has zero internal resistance",
    "correct_answer": "B",
    "explanation": "MOSFET gates are isolated from the conducting channel by an ultra-thin silicon dioxide (SiO2) insulating layer, resulting in near-zero gate leakage current and extremely high input impedance (10^12 to 10^14 ohms).\n\n[മലയാളം]: MOSFET-ൽ ഗേറ്റ് ടെർമിനൽ ചാനലിൽ നിന്നും സിലിക്കൺ ഡയോക്സൈഡ് (SiO2) എന്ന ഇൻസുലേറ്റിംഗ് ലെയർ വഴി വേർതിരിച്ചിരിക്കുന്നതിനാൽ ഇതിന്റെ ഇൻപുട്ട് ഇംപീഡൻസ് വളരെ കൂടുതലാണ്.",
    "subtopic": "FET, JFET & MOSFET"
  },
  {
    "id": "M1_11",
    "sheetName": "Module_1_Electronics",
    "question": "In standard fixed 3-terminal voltage regulators, what are the respective output voltages of the 7812 and 7912 ICs?",
    "option_a": "+12 V DC and -12 V DC",
    "option_b": "+5 V DC and -5 V DC",
    "option_c": "-12 V DC and +12 V DC",
    "option_d": "+24 V DC and 0 V",
    "correct_answer": "A",
    "explanation": "The 78xx series provides fixed positive regulated voltage (7812 = +12V), while the 79xx series provides fixed negative regulated voltage (7912 = -12V).\n\n[മലയാളം]: 78xx സീരീസ് പോസിറ്റീവ് റെഗുലേറ്ററാണ് (7812 എന്നാൽ +12V), 79xx സീരീസ് നെഗറ്റീവ് റെഗുലേറ്ററാണ് (7912 എന്നാൽ -12V).",
    "subtopic": "Power Supplies & 3-Pin Regulators"
  },
  {
    "id": "M1_12",
    "sheetName": "Module_1_Electronics",
    "question": "Which of the following logic gates are known as 'Universal Logic Gates' because any Boolean logic function can be constructed using only these gates?",
    "option_a": "AND and OR",
    "option_b": "NAND and NOR",
    "option_c": "XOR and XNOR",
    "option_d": "NOT and AND",
    "correct_answer": "B",
    "explanation": "NAND and NOR gates are termed Universal Gates because combinations of only NAND gates or only NOR gates can implement all basic gates (NOT, AND, OR, XOR).\n\n[മലയാളം]: മറ്റേതൊരു ലോജിക് ഗേറ്റുകളുടെയും ധർമ്മം നിർവ്വഹിക്കാൻ സാധിക്കുന്നതിനാൽ NAND, NOR എന്നിവയെ 'യൂണിവേഴ്സൽ ലോജിക് ഗേറ്റുകൾ' (Universal Gates) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Digital Electronics & Logic Gates"
  },
  {
    "id": "M2_01",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "Which electronic component served as the fundamental computing element in Second Generation computers (1956-1963)?",
    "option_a": "Vacuum Tubes",
    "option_b": "Transistors",
    "option_c": "Integrated Circuits (ICs)",
    "option_d": "Microprocessors (VLSI)",
    "correct_answer": "B",
    "explanation": "First Generation used Vacuum Tubes, Second Generation used discrete Transistors, Third Generation used Integrated Circuits (ICs), and Fourth Generation used Microprocessors (VLSI).\n\n[മലയാളം]: ഒന്നാം തലമുറയിൽ വാക്വം ട്യൂബുകളും, രണ്ടാം തലമുറ കമ്പ്യൂട്ടറുകളിൽ ട്രാൻസിസ്റ്ററുകളും, മൂന്നാം തലമുറയിൽ ഐ.സികളും (IC), നാലാം തലമുറയിൽ മൈക്രോപ്രോസസ്സറുകളുമാണ് ഉപയോഗിച്ചത്.",
    "subtopic": "Generations of Computers"
  },
  {
    "id": "M2_02",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "What is the sequential order of operations performed during a standard CPU machine instruction cycle?",
    "option_a": "Decode -> Fetch -> Execute -> Store",
    "option_b": "Fetch -> Decode -> Execute -> Store",
    "option_c": "Execute -> Fetch -> Decode -> Store",
    "option_d": "Store -> Decode -> Fetch -> Execute",
    "correct_answer": "B",
    "explanation": "The standard CPU instruction cycle sequence is: 1. Fetch instruction from memory, 2. Decode the op-code, 3. Execute the operation in ALU, 4. Store results in register/memory.\n\n[മലയാളം]: പ്രോസസ്സർ നിർദ്ദേശങ്ങൾ പ്രോസസ്സ് ചെയ്യുന്ന ഘട്ടങ്ങൾ: 1. Fetch (കൊണ്ടുവരിക), 2. Decode (അർത്ഥം തിരിക്കുക), 3. Execute (നടപ്പിലാക്കുക), 4. Store (റിസൾട്ട് സൂക്ഷിക്കുക).",
    "subtopic": "Instruction Cycle & CPU Architecture"
  },
  {
    "id": "M2_03",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "What standard dimensions define an ATX motherboard, and what is its standard primary power connector pin-count?",
    "option_a": "12 × 9.6 inches (305 × 244 mm) with 24-pin connector",
    "option_b": "9.6 × 9.6 inches with 20-pin connector",
    "option_c": "6.7 × 6.7 inches with 12-pin connector",
    "option_d": "15 × 15 inches with 8-pin connector",
    "correct_answer": "A",
    "explanation": "Standard ATX form factor measures 12 × 9.6 inches (305 × 244 mm) and uses a 24-pin primary ATX power connector (historically 20-pin in early ATX).\n\n[മലയാളം]: സ്റ്റാൻഡേർഡ് ATX മദർബോർഡിന്റെ വലിപ്പം 12 × 9.6 ഇഞ്ചും, ഇതിൽ 24-പിൻ പ്രധാന പവർ കണക്ടറുമാണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Motherboard Form Factors"
  },
  {
    "id": "M2_04",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "Which motherboard expansion slot provides the highest data transfer bandwidth dedicated for modern discrete graphics cards?",
    "option_a": "PCI (Peripheral Component Interconnect)",
    "option_b": "PCIe x16 (PCI Express 16-lane)",
    "option_c": "PCIe x1",
    "option_d": "AGP 4x",
    "correct_answer": "B",
    "explanation": "PCIe x16 uses 16 simultaneous serial transmission lanes, delivering up to 32 GB/s bidirectional bandwidth in PCIe 4.0 and 64 GB/s in PCIe 5.0, making it standard for GPUs.\n\n[മലയാളം]: ഗ്രാഫിക്സ് കാർഡുകൾ കണക്ട് ചെയ്യാൻ ഏറ്റവും ഉയർന്ന വേഗതയും 16 ലൈനുകളും നൽകുന്ന സ്ലോട്ടാണ് PCIe x16 സ്ലോട്ട്.",
    "subtopic": "Expansion Slots & Bus Architecture"
  },
  {
    "id": "M2_05",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "In classical PC motherboard architecture, what was the primary role of the Northbridge component in the chipset?",
    "option_a": "Managing low-speed peripherals like keyboard, mouse, and serial ports",
    "option_b": "Interfacing the CPU with high-speed memory (RAM) and graphics bus (AGP/PCIe)",
    "option_c": "Providing audio CODEC processing and BIOS storage",
    "option_d": "Controlling the SATA and USB controllers exclusively",
    "correct_answer": "B",
    "explanation": "The Northbridge (Memory Controller Hub) managed fast communications between CPU, RAM, and PCIe/AGP graphics. Southbridge (ICH) handled slower I/O like USB, SATA, audio, and BIOS.\n\n[മലയാളം]: മദർബോർഡിലെ നോർത്ത്ബ്രിഡ്ജ് (Northbridge) സി.പി.യു, റാം (RAM), ഗ്രാഫിക്സ് കാർഡ് എന്നിവ തമ്മിലുള്ള അതിവേഗ ഡാറ്റാ കൈമാറ്റത്തെയാണ് നിയന്ത്രിച്ചിരുന്നത്.",
    "subtopic": "Chipset Architecture"
  },
  {
    "id": "M2_06",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "What is the key physical difference between Intel's LGA (Land Grid Array) and AMD's traditional PGA (Pin Grid Array) processor sockets?",
    "option_a": "LGA has contact pins on the motherboard socket, whereas PGA has pins directly on the processor package",
    "option_b": "PGA has gold contact pads on the processor; LGA has fragile pins on the CPU",
    "option_c": "LGA does not require a lever or retention mechanism",
    "option_d": "PGA is exclusively soldered directly to the motherboard without a socket",
    "correct_answer": "A",
    "explanation": "In LGA (Land Grid Array), the delicate pins are situated inside the motherboard socket, while the CPU has flat gold landing pads. In PGA, the pins protrude from the CPU bottom.\n\n[മലയാളം]: LGA സോക്കറ്റിൽ പിന്നുകൾ മദർബോർഡിലും പ്രോസസ്സറിന്റെ അടിയിൽ പരന്ന പാഡുകളുമാണ്. എന്നാൽ PGA-യിൽ പിന്നുകൾ പ്രോസസ്സറിന്റെ അടിയിലാണ് കാണപ്പെടുന്നത്.",
    "subtopic": "Processor Sockets"
  },
  {
    "id": "M2_07",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "Which of the following accurately represents the order of data storage capacity units from smallest to largest?",
    "option_a": "Byte -> Gigabyte -> Megabyte -> Terabyte -> Petabyte",
    "option_b": "Byte -> Kilobyte -> Megabyte -> Gigabyte -> Terabyte -> Petabyte",
    "option_c": "Bit -> Byte -> Terabyte -> Gigabyte -> Kilobyte",
    "option_d": "Kilobyte -> Megabyte -> Petabyte -> Terabyte -> Exabyte",
    "correct_answer": "B",
    "explanation": "Storage hierarchy: 1 Byte = 8 bits; 1 KB = 1024 Bytes; 1 MB = 1024 KB; 1 GB = 1024 MB; 1 TB = 1024 GB; 1 PB = 1024 TB.\n\n[മലയാളം]: മെമ്മറി അളവുകളുടെ ശരിയായ ക്രമം: Byte -> Kilobyte (KB) -> Megabyte (MB) -> Gigabyte (GB) -> Terabyte (TB) -> Petabyte (PB).",
    "subtopic": "Memory Units & Hierarchy"
  },
  {
    "id": "M2_08",
    "sheetName": "Module_2_Comp_Fundamentals",
    "question": "Why does Dynamic RAM (DRAM) require periodic electrical refreshing circuits whereas Static RAM (SRAM) does not?",
    "option_a": "DRAM uses flip-flops made of 6 transistors which dissipate power quickly",
    "option_b": "DRAM stores each data bit in a tiny capacitor that gradually leaks its electrical charge",
    "option_c": "SRAM operates directly inside magnetic core storage",
    "option_d": "DRAM chips are non-volatile and write directly to magnetic disk",
    "correct_answer": "B",
    "explanation": "DRAM memory cells consist of one transistor and one capacitor. Since capacitors leak charge over milliseconds, they require periodic refreshing. SRAM uses transistor flip-flops and needs no refresh.\n\n[മലയാളം]: ഡൈനാമിക് റാമിൽ (DRAM) ഡാറ്റ കപ്പാസിറ്ററുകളിലാണ് സൂക്ഷിക്കുന്നത്. ഇതിലെ ചാർജ്ജ് ചോർന്നുപോകുന്നതിനാൽ ഇടയ്ക്കിടെ റീഫ്രഷ് ചെയ്യേണ്ടതുണ്ട്. സ്റ്റാറ്റിക് റാമിൽ (SRAM) ഫ്ലിപ്-ഫ്ലോപ്പുകൾ ആയതിനാൽ റീഫ്രഷ് ആവശ്യമില്ല.",
    "subtopic": "Primary Memory & Cache"
  },
  {
    "id": "M3_01",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What CPU architectural technique allows multiple instruction execution units to process different phases of multiple instructions simultaneously?",
    "option_a": "Clock throttling",
    "option_b": "Instruction Pipelining",
    "option_c": "Wait states insertion",
    "option_d": "Dynamic frequency scaling",
    "correct_answer": "B",
    "explanation": "Pipelining divides instruction execution into discrete stages (Fetch, Decode, Execute, Writeback) so that multiple instructions overlap in execution, maximizing CPU throughput.\n\n[മലയാളം]: ഒരേ സമയം ഒന്നിലധികം നിർദ്ദേശങ്ങൾ പല ഘട്ടങ്ങളിലായി ഒന്നിനുപുറകെ ഒന്നായി അതിവേഗത്തിൽ പ്രോസസ്സ് ചെയ്യുന്ന സി.പി.യു സാങ്കേതികവിദ്യയാണ് പൈപ്പ്‌ലൈനിംഗ് (Instruction Pipelining).",
    "subtopic": "CPU Architecture & Technology"
  },
  {
    "id": "M3_02",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What is Intel's Hyper-Threading Technology (or generic Simultaneous Multithreading - SMT)?",
    "option_a": "Doubling the physical silicon cores on the CPU die",
    "option_b": "Enabling one physical CPU core to function as two logical cores by sharing execution resources",
    "option_c": "Permanently increasing the base clock frequency by 50%",
    "option_d": "Converting L2 cache into L1 cache dynamically",
    "correct_answer": "B",
    "explanation": "Simultaneous Multithreading (SMT / Hyper-Threading) duplicates architectural state (registers, program counter) per core, allowing the operating system to address each physical core as two logical cores.\n\n[മലയാളം]: ഒരു ഫിസിക്കൽ സിപിയു കോറിനെ ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിന് രണ്ട് ലോജിക്കൽ കോറുകളായി കാണിച്ച് ഒരേസമയം രണ്ട് ത്രെഡുകൾ പ്രവർത്തിപ്പിക്കാൻ സഹായിക്കുന്ന സാങ്കേതികവിദ്യയാണ് ഹൈപ്പർ-ത്രെഡിംഗ് (Hyper-Threading).",
    "subtopic": "Multicore Processing"
  },
  {
    "id": "M3_03",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What is the primary function of thermal paste (thermal compound) applied between the CPU integrated heat spreader (IHS) and the heatsink base?",
    "option_a": "To glue the processor permanently to the socket",
    "option_b": "To eliminate microscopic air gaps and facilitate maximum heat conduction",
    "option_c": "To insulate the processor from electrical shock",
    "option_d": "To lubricate the CPU fan bearings",
    "correct_answer": "B",
    "explanation": "Microscopic imperfections on metal surfaces trap air (a poor thermal conductor). Thermal paste displaces air pockets, providing an unbroken bridge of high thermal conductivity to the heatsink.\n\n[മലയാളം]: പ്രോസസ്സറും ഹീറ്റ്സിങ്കും തമ്മിലുള്ള സൂക്ഷ്മമായ വായു അറകൾ (Air gaps) ഒഴിവാക്കി ചൂട് വേഗത്തിൽ ഹീറ്റ്സിങ്കിലേക്ക് കടത്തിവിടാനാണ് തെർമൽ പേസ്റ്റ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Thermal Cooling Mechanisms"
  },
  {
    "id": "M3_04",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "Which CPU parameter is safely increased in motherboard BIOS/UEFI to achieve processor overclocking?",
    "option_a": "CPU Core Multiplier (Ratio) and Base Clock (BCLK)",
    "option_b": "SATA controller clock frequency",
    "option_c": "RAM latency timings (CAS Latency)",
    "option_d": "PCI bus clock only",
    "correct_answer": "A",
    "explanation": "CPU Frequency = Base Clock (BCLK) × Core Multiplier. Overclocking is commonly achieved by raising the CPU core multiplier on unlocked processors (e.g., Intel 'K' or AMD 'X' series).\n\n[മലയാളം]: പ്രോസസ്സറിന്റെ ക്ലോക്ക് സ്പീഡ് കൂട്ടി ഓവർക്ലോക്ക് (Overclocking) ചെയ്യുന്നതിനായി ബയോസിൽ സി.പി.യു മൾട്ടിപ്ലയറും (CPU Multiplier) ബേസ് ക്ലോക്കുമാണ് (BCLK) ക്രമീകരിക്കുന്നത്.",
    "subtopic": "Overclocking"
  },
  {
    "id": "M3_05",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "In hard disk drive geometry, what is the term for the collection of identical tracks situated at the same radius across all magnetic platter surfaces?",
    "option_a": "Sector",
    "option_b": "Cylinder",
    "option_c": "Cluster",
    "option_d": "Actuator arm",
    "correct_answer": "B",
    "explanation": "A cylinder comprises all vertical tracks of equal radius across every platter surface in a multi-platter hard disk drive, accessible without moving the head actuator arm.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിലെ എല്ലാ പ്ലേറ്ററുകളിലും ഒരേ വ്യാസാർദ്ധത്തിൽ (Radius) ലംബമായി വരുന്ന ട്രാക്കുകളുടെ കൂട്ടത്തെ സിലിണ്ടർ (Cylinder) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Magnetic Storage & HDD Architecture"
  },
  {
    "id": "M3_06",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What S.M.A.R.T diagnostic attribute in hard drives monitors sectors that suffered read errors and were permanently swapped with reserved spare sectors?",
    "option_a": "Power-On Hours",
    "option_b": "Reallocated Sectors Count",
    "option_c": "Spin Retry Count",
    "option_d": "Airflow Temperature",
    "correct_answer": "B",
    "explanation": "When a hard drive detects a damaged sector, it remaps it to a reserve area. The 'Reallocated Sectors Count' tracks this; an increasing value strongly indicates impending mechanical drive failure.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിലെ തകരാറിലായ ബാഡ് സെക്ടറുകൾ സ്പെയർ സെക്ടറുകളിലേക്ക് മാറ്റിയതിന്റെ എണ്ണം സൂചിപ്പിക്കുന്ന S.M.A.R.T പരാമീറ്ററാണ് 'Reallocated Sectors Count'.",
    "subtopic": "Hard Drive Controller & Diagnostics"
  },
  {
    "id": "M3_07",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "Which operating system command informs an SSD controller which blocks of data are no longer in use so they can be wiped internally during idle cycles?",
    "option_a": "DEFRAG",
    "option_b": "TRIM",
    "option_c": "CHKDSK",
    "option_d": "FDISK",
    "correct_answer": "B",
    "explanation": "The TRIM command allows the OS to notify the SSD controller which data pages have been deleted. The controller can then perform garbage collection in advance, preserving write speed.\n\n[മലയാളം]: എസ്.എസ്.ഡിയിൽ (SSD) ഡിലീറ്റ് ചെയ്ത ഡാറ്റാ ബ്ലോക്കുകൾ മുൻകൂട്ടി മായ്ച്ച് റൈറ്റിംഗ് സ്പീഡ് നിലനിർത്താൻ സഹായിക്കുന്ന ഒ.എസ് കമാൻഡാണ് TRIM കമാൻഡ്.",
    "subtopic": "Solid State Devices (SSD)"
  },
  {
    "id": "M3_08",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What is the maximum theoretical throughput of the SATA Revision 3.0 storage interface standard?",
    "option_a": "1.5 Gbps (~150 MB/s)",
    "option_b": "3.0 Gbps (~300 MB/s)",
    "option_c": "6.0 Gbps (~600 MB/s)",
    "option_d": "32 Gbps (~4000 MB/s)",
    "correct_answer": "C",
    "explanation": "SATA III operates at a signaling rate of 6.0 Gbps, with real-world peak data throughput capped at approximately 550–600 MB/s due to 8b/10b encoding overhead.\n\n[മലയാളം]: SATA III സ്റ്റാൻഡേർഡിന്റെ പരമാവധി വേഗത 6.0 Gbps (ഏകദേശം 600 MB/s) ആണ്. ഇതിലും കൂടിയ വേഗതയ്ക്കാണ് NVMe PCIe ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Storage Interfaces (SATA & NVMe)"
  },
  {
    "id": "M3_09",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "Which RAID level requires a minimum of 3 physical disks and provides both data striping and distributed parity for single-drive fault tolerance?",
    "option_a": "RAID 0",
    "option_b": "RAID 1",
    "option_c": "RAID 5",
    "option_d": "RAID 10",
    "correct_answer": "C",
    "explanation": "RAID 5 stripes data and parity across at least 3 drives. If any single drive fails, parity information distributed on the surviving drives allows full data reconstruction.\n\n[മലയാളം]: കുറഞ്ഞത് 3 ഹാർഡ് ഡിസ്കുകൾ ആവശ്യമായതും, ഒരു ഡിസ്ക് തകരാറിലായാലും പാരിറ്റി (Parity) ഉപയോഗിച്ച് ഡാറ്റ വീണ്ടെടുക്കാൻ കഴിയുന്നതുമായ റെയ്ഡ് ലെവലാണ് RAID 5.",
    "subtopic": "RAID Concepts & Levels"
  },
  {
    "id": "M3_10",
    "sheetName": "Module_3_Adv_Hardware_Storage",
    "question": "What device category provides dedicated file-based shared data storage accessible to network clients over local TCP/IP Ethernet?",
    "option_a": "DAS (Direct Attached Storage)",
    "option_b": "NAS (Network Attached Storage)",
    "option_c": "VGA Switch",
    "option_d": "KVM Extender",
    "correct_answer": "B",
    "explanation": "Network Attached Storage (NAS) is a dedicated storage appliance connected directly to an Ethernet network, serving files to clients via protocols like NFS or SMB/CIFS.\n\n[മലയാളം]: നെറ്റ്‌വർക്ക് വഴി കമ്പ്യൂട്ടറുകൾക്ക് ഫയലുകൾ പരസ്പരം പങ്കുവെക്കാനും സൂക്ഷിക്കാനും ഉപയോഗിക്കുന്ന കേന്ദ്രീകൃത സ്റ്റോറേജ് ഉപകരണമാണ് NAS (Network Attached Storage).",
    "subtopic": "Network Attached Storage (NAS)"
  },
  {
    "id": "M4_01",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Under standard software classification, to which category do device drivers and operating system kernels belong?",
    "option_a": "Application Software",
    "option_b": "System Software",
    "option_c": "Shareware",
    "option_d": "Freeware",
    "correct_answer": "B",
    "explanation": "System software controls and manages the physical computer hardware, providing a platform for application software. Operating systems and device drivers are core system software.\n\n[മലയാളം]: ഹാർഡ്‌വെയർ നിയന്ത്രിക്കാനും മറ്റ് ആപ്ലിക്കേഷനുകൾ പ്രവർത്തിക്കാനുമുള്ള അടിസ്ഥാന സൗകര്യം നൽകുന്ന സോഫ്റ്റ്‌വെയറുകളാണ് സിസ്റ്റം സോഫ്റ്റ്‌വെയർ (System Software - ഉദാ: OS, ഡ്രൈവറുകൾ).",
    "subtopic": "Software Classification"
  },
  {
    "id": "M4_02",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which of the following operating systems is open-source, allowing users to freely modify and redistribute its source code?",
    "option_a": "Microsoft Windows 11",
    "option_b": "Apple macOS",
    "option_c": "Linux Ubuntu",
    "option_d": "MS-DOS 6.22",
    "correct_answer": "C",
    "explanation": "Linux (and distributions like Ubuntu, Debian, Fedora) is released under the GNU General Public License (GPL), making its kernel and source code completely open-source and free.\n\n[മലയാളം]: സോഴ്സ് കോഡ് സൗജന്യമായി ലഭ്യമാവുന്നതും ആർക്കും മാറ്റങ്ങൾ വരുത്താവുന്നതുമായ ഓപ്പൺ സോഴ്സ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റമാണ് ലിനക്സ് (Linux/Ubuntu).",
    "subtopic": "Open Source vs Proprietary OS"
  },
  {
    "id": "M4_03",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which network protocol enables a client computer with an empty hard drive to boot and install an operating system from a network server?",
    "option_a": "PXE (Preboot Execution Environment)",
    "option_b": "SNMP",
    "option_c": "SMTP",
    "option_d": "Telnet",
    "correct_answer": "A",
    "explanation": "PXE (Preboot Execution Environment) uses DHCP and TFTP to allow a computer's network interface card (NIC) to boot a remote OS installation image over the local network without local media.\n\n[മലയാളം]: ലോക്കൽ ഹാർഡ് ഡിസ്കോ പെൻഡ്രൈവോ ഇല്ലാതെ നെറ്റ്‌വർക്ക് സെർവറിൽ നിന്ന് നേരിട്ട് ഒ.എസ് ഇൻസ്റ്റാൾ ചെയ്യാൻ ബൂട്ട് ചെയ്യുന്ന സാങ്കേതികവിദ്യയാണ് PXE (Preboot Execution Environment).",
    "subtopic": "OS Deployment Methods"
  },
  {
    "id": "M4_04",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which Windows built-in command-line utility prepares a Windows installation for imaging by removing computer-specific SID and hardware configuration?",
    "option_a": "Sysprep (System Preparation Tool)",
    "option_b": "Diskpart",
    "option_c": "Chkdsk",
    "option_d": "Robocopy",
    "correct_answer": "A",
    "explanation": "Sysprep (sysprep.exe) generalizes a Windows installation by removing system-specific data like the Security Identifier (SID) and drivers so the image can be cloned to multiple PCs.\n\n[മലയാളം]: ഒരു വിൻഡോസ് ഇൻസ്റ്റാളേഷനിലെ സിസ്റ്റം ഐഡന്റിഫയർ (SID) നീക്കം ചെയ്ത് മറ്റ് കമ്പ്യൂട്ടറുകളിലേക്ക് ക്ലോൺ ചെയ്യാൻ പാകമാക്കുന്ന ടൂളാണ് സിസ്പ്രെപ്പ് (Sysprep).",
    "subtopic": "System Image Creation & Recovery"
  },
  {
    "id": "M4_05",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which Windows Registry root key contains configuration parameters regarding hardware drivers, software settings, and system services for the local machine?",
    "option_a": "HKEY_CURRENT_USER",
    "option_b": "HKEY_LOCAL_MACHINE (HKLM)",
    "option_c": "HKEY_USERS",
    "option_d": "HKEY_CURRENT_CONFIG",
    "correct_answer": "B",
    "explanation": "HKEY_LOCAL_MACHINE (HKLM) stores critical global system settings, installed device drivers, boot configurations, and software parameters that apply to all users on the computer.\n\n[മലയാളം]: വിൻഡോസ് കമ്പ്യൂട്ടറിലെ എല്ലാ ഹാർഡ്‌വെയർ ഡ്രൈവറുകളും സിസ്റ്റം ക്രമീകരണങ്ങളും പൊതുവായി സൂക്ഷിക്കുന്ന പ്രധാന രജിസ്ട്രി കീയാണ് HKEY_LOCAL_MACHINE (HKLM).",
    "subtopic": "Windows Registry Fundamentals"
  },
  {
    "id": "M4_06",
    "sheetName": "Module_4_OS_Deployment",
    "question": "In the Linux root file system hierarchy, which directory contains system-wide configuration files (such as network settings, user databases, and daemon configs)?",
    "option_a": "/dev",
    "option_b": "/etc",
    "option_c": "/bin",
    "option_d": "/tmp",
    "correct_answer": "B",
    "explanation": "In Linux, the /etc directory contains all host-specific system configuration files, scripts, and user account databases (/etc/passwd, /etc/network, /etc/fstab).\n\n[മലയാളം]: ലിനക്സ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിലെ പ്രധാന സിസ്റ്റം കോൺഫിഗറേഷൻ ഫയലുകൾ സൂക്ഷിച്ചിരിക്കുന്ന ഡയറക്ടറിയാണ് /etc.",
    "subtopic": "Linux File System Structure"
  },
  {
    "id": "M4_07",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which Linux command is used to modify file and directory access permissions (Read, Write, Execute)?",
    "option_a": "chown",
    "option_b": "chmod",
    "option_c": "ps",
    "option_d": "tar",
    "correct_answer": "B",
    "explanation": "'chmod' (Change Mode) alters file/folder access permissions for Owner, Group, and Others (e.g., chmod 755 filename). 'chown' is used to change ownership.\n\n[മലയാളം]: ലിനക്സിൽ ഫയലുകളുടെയും ഫോൾഡറുകളുടെയും പെർമിഷനുകൾ (Read, Write, Execute) മാറ്റാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് chmod (Change Mode).",
    "subtopic": "Linux Basic Commands"
  },
  {
    "id": "M4_08",
    "sheetName": "Module_4_OS_Deployment",
    "question": "What is the maximum disk partition size supported by the traditional Master Boot Record (MBR) scheme, and what is its primary partition limit?",
    "option_a": "2.2 TB and maximum 4 primary partitions",
    "option_b": "10 TB and maximum 128 primary partitions",
    "option_c": "500 GB and maximum 2 primary partitions",
    "option_d": "1 TB and unlimited partitions",
    "correct_answer": "A",
    "explanation": "MBR uses 32-bit sector addressing with 512-byte sector sizes, restricting capacity to 2.19 TB (approx. 2.2 TB) and allowing a maximum of 4 primary partitions.\n\n[മലയാളം]: പരമ്പരാഗത MBR പാർട്ടീഷൻ രീതിയിൽ പരമാവധി 2.2 TB വരെയുള്ള ഡ്രൈവുകളെ മാത്രമേ പിന്തുണയ്ക്കൂ, കൂടാതെ പരമാവധി 4 പ്രൈമറി പാർട്ടീഷനുകൾ മാത്രമേ നിർമ്മിക്കാനാവൂ.",
    "subtopic": "Partition Schemes (MBR vs GPT)"
  },
  {
    "id": "M4_09",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Why is GPT (GUID Partition Table) superior to MBR for modern operating system deployment?",
    "option_a": "GPT supports disks up to 9.4 ZB, allows up to 128 partitions in Windows, and uses CRC32 checksums for redundancy",
    "option_b": "GPT eliminates the need for an operating system bootloader",
    "option_c": "GPT only functions on legacy BIOS without requiring UEFI",
    "option_d": "GPT does not consume any space on the disk",
    "correct_answer": "A",
    "explanation": "GPT replaces MBR by supporting vast disk sizes (up to 9.4 Zettabytes), 128 primary partitions in Windows natively, and backup partition tables with CRC32 integrity checking.\n\n[മലയാളം]: GPT (GUID Partition Table) വലിയ ഹാർഡ് ഡിസ്കുകളെ പിന്തുണയ്ക്കുന്നു (9.4 ZB വരെ), 128 പ്രൈമറി പാർട്ടീഷനുകൾ വരെ സാധ്യമാക്കുന്നു, കൂടാതെ ബാക്കപ്പ് ടേബിൾ ഉള്ളതിനാൽ ഡാറ്റ സുരക്ഷിതവുമാണ്.",
    "subtopic": "GUID Partition Table (GPT)"
  },
  {
    "id": "M4_10",
    "sheetName": "Module_4_OS_Deployment",
    "question": "Which configuration file and boot manager does modern Windows (Vista through Windows 11) use to manage the system boot process?",
    "option_a": "boot.ini and NTLDR",
    "option_b": "Boot Configuration Data (BCD) file and Windows Boot Manager (bootmgr)",
    "option_c": "autoexec.bat and command.com",
    "option_d": "lilo.conf and LILO",
    "correct_answer": "B",
    "explanation": "Modern Windows replaced the legacy NTLDR and boot.ini with Windows Boot Manager (bootmgr.exe) which queries the registry-based Boot Configuration Data (BCD) store.\n\n[മലയാളം]: ആധുനിക വിൻഡോസ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റങ്ങൾ ബൂട്ട് ചെയ്യാൻ വിൻഡോസ് ബൂട്ട് മാനേജരും (bootmgr), ബൂട്ട് കോൺഫിഗറേഷൻ ഡാറ്റയും (BCD) ആണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Boot Management"
  },
  {
    "id": "M5_01",
    "sheetName": "Module_5_System_Utilities",
    "question": "What is the maximum addressable physical memory (RAM) capacity supported by a 32-bit (x86) operating system without PAE?",
    "option_a": "2 GB",
    "option_b": "4 GB",
    "option_c": "16 GB",
    "option_d": "128 GB",
    "correct_answer": "B",
    "explanation": "A 32-bit processor architecture has a 32-bit memory address register, meaning 2^32 distinct memory addresses, which mathematically limits addressable RAM to exactly 4,294,967,296 bytes (4 GB).\n\n[മലയാളം]: 32-ബിറ്റ് പ്രോസസ്സറുകൾക്കും ഓപ്പറേറ്റിംഗ് സിസ്റ്റങ്ങൾക്കും പരമാവധി 4 GB റാം (RAM) മാത്രമേ തിരിച്ചറിയാനും ഉപയോഗിക്കാനും സാധിക്കൂ (2^32 ബൈറ്റുകൾ).",
    "subtopic": "32-bit vs 64-bit Architecture"
  },
  {
    "id": "M5_02",
    "sheetName": "Module_5_System_Utilities",
    "question": "Which Windows command-line tool inspects all protected system files and replaces corrupt or missing files with verified cached copies?",
    "option_a": "sfc /scannow (System File Checker)",
    "option_b": "chkdsk /r",
    "option_c": "defrag C: /u",
    "option_d": "format C:",
    "correct_answer": "A",
    "explanation": "System File Checker (sfc /scannow) scans all protected Windows operating system files and repairs corrupt files by pulling healthy copies from %WinDir%\\System32\\dllcache.\n\n[മലയാളം]: വിൻഡോസിലെ പ്രധാന സിസ്റ്റം ഫയലുകളിൽ കേടുപാടുകൾ വന്നിട്ടുണ്ടോ എന്ന് പരിശോധിച്ച് അവ ശരിയാക്കാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് 'sfc /scannow' (System File Checker).",
    "subtopic": "Critical System Files & Commands"
  },
  {
    "id": "M5_03",
    "sheetName": "Module_5_System_Utilities",
    "question": "In Windows PowerShell, what is the standard naming syntax used for cmdlets (commands)?",
    "option_a": "Noun-Verb (e.g., Process-Get)",
    "option_b": "Verb-Noun (e.g., Get-Process, Stop-Service)",
    "option_c": "Action-Target-Flag",
    "option_d": "Command_Arg",
    "correct_answer": "B",
    "explanation": "PowerShell enforces a strict Verb-Noun convention for all standard cmdlets (e.g., Get-Service, Start-Process, Set-Item) to maintain consistency and ease of learning.\n\n[മലയാളം]: പവർഷെൽ (PowerShell) കമാൻഡുകൾ എല്ലായ്പ്പോഴും 'Verb-Noun' (ക്രിയ-നാമം) എന്ന രീതിയിലാണ് നൽകുന്നത് (ഉദാഹരണത്തിന് Get-Process, Stop-Service).",
    "subtopic": "Command-line & PowerShell Basics"
  },
  {
    "id": "M5_04",
    "sheetName": "Module_5_System_Utilities",
    "question": "In Windows Task Manager, setting a process priority to 'Realtime' can result in which critical problem?",
    "option_a": "The hard disk immediately formats",
    "option_b": "The process may monopolize the CPU, causing essential system processes, mouse, and keyboard input to freeze",
    "option_c": "All network interfaces shut down",
    "option_d": "The monitor resolution drops to 640x480",
    "correct_answer": "B",
    "explanation": "Realtime priority gives a thread higher execution precedence than core operating system background threads (including input/output). If it enters an intensive loop, the entire system stops responding.\n\n[മലയാളം]: ടാസ്ക് മാനേജറിൽ ഒരു പ്രോസസ്സിന്റെ പ്രയോറിറ്റി 'Realtime' ആക്കിയാൽ അത് സിപിയു പൂർണ്ണമായി ഉപയോഗിക്കുകയും സിസ്റ്റത്തിന്റെ മൗസ്, കീബോർഡ് പ്രതികരണങ്ങൾ മരവിക്കുകയും (Freeze) ചെയ്തേക്കാം.",
    "subtopic": "Task Manager & Process Priorities"
  },
  {
    "id": "M5_05",
    "sheetName": "Module_5_System_Utilities",
    "question": "Which Microsoft Management Console (MMC) snap-in monitors, logs, and diagnoses system errors, audit failures, and software crashes using Event IDs?",
    "option_a": "Event Viewer (eventvwr.msc)",
    "option_b": "Device Manager",
    "option_c": "Disk Management",
    "option_d": "DirectX Diagnostic Tool",
    "correct_answer": "A",
    "explanation": "Event Viewer (eventvwr.msc) maintains central logs categorized into Application, Security, System, and Setup, logging events with severity levels (Information, Warning, Error, Critical).\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ സിസ്റ്റം തകരാറുകൾ, മുന്നറിയിപ്പുകൾ, ക്രാഷുകൾ എന്നിവയുടെ ലോഗുകൾ പരിശോധിച്ച് പരിഹരിക്കാൻ ഉപയോഗിക്കുന്ന വിൻഡോസ് ടൂളാണ് ഇവന്റ് വ്യൂവർ (Event Viewer).",
    "subtopic": "Event Viewer & System Monitor"
  },
  {
    "id": "M5_06",
    "sheetName": "Module_5_System_Utilities",
    "question": "What is the primary operational state of Windows when booted in 'Safe Mode'?",
    "option_a": "All third-party startup applications and non-essential drivers are disabled, loading only minimal core drivers",
    "option_b": "Windows runs exclusively without graphical display using only DOS commands",
    "option_c": "All local hard drive security encryption is wiped",
    "option_d": "CPU clock speed is multiplied by two",
    "correct_answer": "A",
    "explanation": "Safe Mode loads Windows with a minimal set of basic device drivers (generic video, basic storage) and disables all third-party startup software, isolating driver or malware conflicts.\n\n[മലയാളം]: അടിസ്ഥാന ഡ്രൈവറുകൾ മാത്രം ലോഡ് ചെയ്ത് മറ്റ് ആപ്പുകളെയും പ്രശ്നക്കാരെയും ഒഴിവാക്കി കമ്പ്യൂട്ടർ പ്രശ്നങ്ങൾ കണ്ടെത്താൻ പ്രവർത്തിപ്പിക്കുന്ന അവസ്ഥയാണ് സേഫ് മോഡ് (Safe Mode).",
    "subtopic": "Safe Mode Functionality"
  },
  {
    "id": "M5_07",
    "sheetName": "Module_5_System_Utilities",
    "question": "What security feature in Windows prompts users for permission or administrator credentials before allowing an application to make system-level modifications?",
    "option_a": "BitLocker",
    "option_b": "User Account Control (UAC)",
    "option_c": "Windows Defender SmartScreen",
    "option_d": "Data Execution Prevention (DEP)",
    "correct_answer": "B",
    "explanation": "User Account Control (UAC) helps prevent malware from making unauthorized system changes by requiring explicit administrator consent before elevating process privileges.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിൽ സിസ്റ്റം ലെവൽ മാറ്റങ്ങൾ വരുത്തുന്നതിന് മുൻപ് ഉപയോക്താവിനോട് അനുമതി ചോദിക്കുന്ന സുരക്ഷാ ഫീച്ചറാണ് യൂസർ അക്കൗണ്ട് കൺട്രോൾ (UAC - User Account Control).",
    "subtopic": "User Account Security & UAC"
  },
  {
    "id": "M5_08",
    "sheetName": "Module_5_System_Utilities",
    "question": "Which file system permission feature in Windows NTFS determines whether files inside a folder automatically adopt the access permissions of their parent directory?",
    "option_a": "Permission Inheritance",
    "option_b": "Dynamic Linking",
    "option_c": "Disk Quotas",
    "option_d": "BitLocker Encryption",
    "correct_answer": "A",
    "explanation": "By default in NTFS, files and subfolders inherit their access control permissions (ACLs) from their parent container (folder), simplifying centralized access management.\n\n[മലയാളം]: ഒരു ഫോൾഡറിന് നൽകിയിട്ടുള്ള പെർമിഷനുകൾ അതിനുള്ളിലെ മറ്റ് ഫയലുകൾക്കും സബ്-ഫോൾഡറുകൾക്കും തനിയെ ലഭ്യമാകുന്ന ഫീച്ചറാണ് പെർമിഷൻ ഇൻഹെറിറ്റൻസ് (Permission Inheritance).",
    "subtopic": "Permissions & Group Policies"
  },
  {
    "id": "M5_09",
    "sheetName": "Module_5_System_Utilities",
    "question": "Where is the local 'hosts' file located in Windows, and what risk occurs if malware modifies it?",
    "option_a": "Located in C:\\Windows\\System32\\drivers\\etc\\hosts; malware can redirect legitimate web addresses to malicious IP addresses",
    "option_b": "Located in C:\\Program Files; malware will erase the Windows registry",
    "option_c": "Located on motherboard CMOS; malware will change processor clock speeds",
    "option_d": "Located in Recycle Bin; causes deletion of backup files",
    "correct_answer": "A",
    "explanation": "The hosts file (in C:\\Windows\\System32\\drivers\\etc) provides static local domain name resolution before DNS. Malicious editing can redirect users typing bank URLs to phishing servers.\n\n[മലയാളം]: C:\\Windows\\System32\\drivers\\etc-ൽ കാണപ്പെടുന്ന 'hosts' ഫയലിൽ മാറ്റം വരുത്തി ഉപഭോക്താവിനെ വ്യാജ വെബ്സൈറ്റുകളിലേക്ക് വഴിതിരിച്ചുവിടാൻ മാൽവെയറുകൾക്ക് സാധിക്കും.",
    "subtopic": "Malware & Hosts File Modification"
  },
  {
    "id": "M5_10",
    "sheetName": "Module_5_System_Utilities",
    "question": "Why should traditional disk defragmentation NOT be performed regularly on Solid State Drives (SSDs)?",
    "option_a": "It converts SSD memory cells from SLC to TLC",
    "option_b": "SSDs have instantaneous random access times, and defragmentation causes unnecessary write cycles that wear out NAND flash cells",
    "option_c": "It permanently erases the operating system boot partition",
    "option_d": "SSDs will slow down to 5400 RPM speed",
    "correct_answer": "B",
    "explanation": "SSDs have near-zero seek latency, so file fragmentation does not reduce read performance. Defragmenting writes large amounts of data repeatedly, unnecessarily exhausting the finite write endurance of NAND flash.\n\n[മലയാളം]: എസ്.എസ്.ഡികളിൽ (SSD) ചലിക്കുന്ന ഭാഗങ്ങൾ ഇല്ലാത്തതിനാൽ ഡീഫ്രാഗ്മെന്റേഷൻ വേഗത കൂട്ടുന്നില്ല. പകരം അനാവശ്യ റൈറ്റിംഗ് നടന്ന് ഫ്ലാഷ് മെമ്മറിയുടെ ആയുസ്സ് കുറയാൻ ഇത് കാരണമാകും.",
    "subtopic": "System Maintenance & Defragmentation"
  },
  {
    "id": "M6_01",
    "sheetName": "Module_6_Office_Applications",
    "question": "In word processing software (like MS Word / LibreOffice Writer), which keyboard shortcut keys create a manual Page Break immediately?",
    "option_a": "Ctrl + Enter",
    "option_b": "Alt + Enter",
    "option_c": "Shift + Enter",
    "option_d": "Ctrl + Shift + P",
    "correct_answer": "A",
    "explanation": "Pressing 'Ctrl + Enter' forces the cursor to immediately begin a new page (Page Break). 'Shift + Enter' inserts a soft line break within the same paragraph.\n\n[മലയാളം]: വേഡ് പ്രോസസ്സിംഗിൽ നിലവിലെ പേജ് അവസാനിപ്പിച്ച് പുതിയൊരു പേജിലേക്ക് കടക്കാൻ (Page Break) ഉപയോഗിക്കുന്ന കുറുക്കുവഴിയാണ് Ctrl + Enter.",
    "subtopic": "Document Formatting & Page Setup"
  },
  {
    "id": "M6_02",
    "sheetName": "Module_6_Office_Applications",
    "question": "To apply different headers, footers, or orientation (e.g., Portrait and Landscape) within the same document, what element must be inserted?",
    "option_a": "Soft Return",
    "option_b": "Section Break (Next Page)",
    "option_c": "Bookmark",
    "option_d": "Cross-reference",
    "correct_answer": "B",
    "explanation": "Section Breaks divide a document into independently formatted sections, allowing different page orientations, margins, page numbering styles, and headers/footers in a single document.\n\n[മലയാളം]: ഒരേ ഡോക്യുമെന്റിൽ ചില പേജുകൾ പോർട്രെയ്റ്റും (Portrait) ചിലത് ലാൻഡ്സ്കേപ്പും (Landscape) ആക്കാനും വ്യത്യസ്ത ഹെഡറുകൾ നൽകാനും സെക്ഷൻ ബ്രേക്ക് (Section Break) നൽകണം.",
    "subtopic": "Page Setup & Layout"
  },
  {
    "id": "M6_03",
    "sheetName": "Module_6_Office_Applications",
    "question": "In the Mail Merge process, what are the two core files required to generate personalized merged letters?",
    "option_a": "Main Document (template) and Data Source (recipient list)",
    "option_b": "Macros file and Executable program",
    "option_c": "Bitmap image and Font file",
    "option_d": "Print Spooler and Driver file",
    "correct_answer": "A",
    "explanation": "Mail Merge combines a 'Main Document' (containing standard text and merge field placeholders) with a 'Data Source' (Excel sheet, Access DB, or CSV containing individual recipient details).\n\n[മലയാളം]: മെയിൽ മെർജ് (Mail Merge) ചെയ്യുമ്പോൾ പ്രധാനമായും രണ്ട് ഫയലുകൾ ആവശ്യമാണ്: പ്രധാന ഡോക്യുമെന്റ് (Main Document) കൂടാതെ ആളുകളുടെ വിവരങ്ങൾ അടങ്ങിയ ഡാറ്റാ സോഴ്സ് (Data Source).",
    "subtopic": "Mail Merge"
  },
  {
    "id": "M6_04",
    "sheetName": "Module_6_Office_Applications",
    "question": "In spreadsheet software (MS Excel / LibreOffice Calc), what does an absolute cell reference represented as '$B$4' signify when copying the formula to other cells?",
    "option_a": "Both column B and row 4 remain fixed and will not change",
    "option_b": "Column B is variable but row 4 is fixed",
    "option_c": "The value is formatted in US Dollars automatically",
    "option_d": "The cell reference will increment by 1 each row",
    "correct_answer": "A",
    "explanation": "The dollar sign ($) locks the reference coordinate. '$B$4' is an absolute reference locking both Column B and Row 4 regardless of where the formula is copied.\n\n[മലയാളം]: സ്പ്രെഡ്ഷീറ്റിൽ '$B$4' എന്ന് നൽകിയാൽ അതൊരു അബ്സൊല്യൂട്ട് റഫറൻസാണ് (Absolute Reference). ഫോർമുല മറ്റ് സെല്ലുകളിലേക്ക് കോപ്പി ചെയ്താലും കോളം B-യും റോ 4-ഉം മാറാതെ നിൽക്കും.",
    "subtopic": "Spreadsheet Creation & Cell References"
  },
  {
    "id": "M6_05",
    "sheetName": "Module_6_Office_Applications",
    "question": "Which Excel formula correctly counts the number of cells in the range A1:A20 that contain a numeric value greater than or equal to 50?",
    "option_a": "=COUNT(A1:A20, \">=50\")",
    "option_b": "=COUNTIF(A1:A20, \">=50\")",
    "option_c": "=SUMIF(A1:A20, 50)",
    "option_d": "=IF(A1:A20 >= 50, COUNT)",
    "correct_answer": "B",
    "explanation": "The COUNTIF function takes two arguments: range and criteria. The correct syntax is =COUNTIF(A1:A20, \">=50\").\n\n[മലയാളം]: ഒരു നിശ്ചിത നിബന്ധനയ്ക്ക് (Condition) വിധേയമായി സെല്ലുകളുടെ എണ്ണം കണ്ടെത്താൻ ഉപയോഗിക്കുന്ന എക്സെൽ ഫോർമുലയാണ് COUNTIF (=COUNTIF(A1:A20, \">=50\")).",
    "subtopic": "Cell Formulas & Functions"
  },
  {
    "id": "M6_06",
    "sheetName": "Module_6_Office_Applications",
    "question": "Which spreadsheet chart type is most suitable for representing proportions of parts contributing to a whole (percentages)?",
    "option_a": "Scatter Plot (XY)",
    "option_b": "Pie Chart",
    "option_c": "High-Low-Close Stock Chart",
    "option_d": "Radar Chart",
    "correct_answer": "B",
    "explanation": "Pie charts visually display data as circular slices where each slice is proportional to its percentage of the total 100% whole.\n\n[മലയാളം]: ഡാറ്റയുടെ ആകെത്തുകയിലെ ഓരോ ഭാഗത്തിന്റെയും ശതമാന അനുപാതം കാണിക്കാൻ ഏറ്റവും അനുയോജ്യമായ ചാർട്ടാണ് പൈ ചാർട്ട് (Pie Chart).",
    "subtopic": "Chart Generation"
  },
  {
    "id": "M6_07",
    "sheetName": "Module_6_Office_Applications",
    "question": "What spreadsheet feature temporarily hides rows that do not meet specific criteria without permanently deleting them?",
    "option_a": "Cell Merging",
    "option_b": "AutoFilter / Filter",
    "option_c": "Text to Columns",
    "option_d": "Data Validation",
    "correct_answer": "B",
    "explanation": "The Filter (AutoFilter) tool allows users to select criteria from column dropdowns, temporarily hiding rows that do not match while keeping the underlying dataset intact.\n\n[മലയാളം]: സ്പ്രെഡ്ഷീറ്റിലെ വിവരങ്ങൾ മായ്ച്ചു കളയാതെ ആവശ്യമുള്ളവ മാത്രം തെരഞ്ഞെടുത്ത് കാണാൻ സഹായിക്കുന്ന ടൂളാണ് ഫിൽട്ടർ (AutoFilter).",
    "subtopic": "Data Sorting & Filtering"
  },
  {
    "id": "M6_08",
    "sheetName": "Module_6_Office_Applications",
    "question": "In presentation software (MS PowerPoint / LibreOffice Impress), what view or tool controls the default fonts, logos, colors, and layout for all slides in the deck?",
    "option_a": "Slide Sorter",
    "option_b": "Slide Master",
    "option_c": "Reading View",
    "option_d": "Notes Page",
    "correct_answer": "B",
    "explanation": "The Slide Master is the top hierarchy slide in the presentation. Changes made to the Slide Master (like company logo, background theme, font styling) cascade automatically across all slides.\n\n[മലയാളം]: പ്രസന്റേഷനിലെ എല്ലാ സ്ലൈഡുകളിലെയും പൊതുവായ ഫോണ്ട്, ലോഗോ, പശ്ചാത്തലം എന്നിവ ഒരൊറ്റ സ്ഥലത്ത് മാറ്റം വരുത്താൻ ഉപയോഗിക്കുന്നതാണ് സ്ലൈഡ് മാസ്റ്റർ (Slide Master).",
    "subtopic": "Presentations & Slide Themes"
  },
  {
    "id": "M6_09",
    "sheetName": "Module_6_Office_Applications",
    "question": "What is the difference between a 'Slide Transition' and a 'Custom Animation' in PowerPoint?",
    "option_a": "Transitions apply to the movement between slides; animations apply to individual objects (text, images) on a slide",
    "option_b": "Transitions are for text only; animations are exclusively for sound files",
    "option_c": "Animations control print margins; transitions control slide colors",
    "option_d": "Both terms refer to the exact same feature with no distinction",
    "correct_answer": "A",
    "explanation": "Slide Transitions govern the visual effect when advancing from one slide to the next. Animations dictate how specific individual items (text boxes, bullets, pictures) enter, emphasize, or exit a slide.\n\n[മലയാളം]: ഒരു സ്ലൈഡിൽ നിന്നും അടുത്ത സ്ലൈഡിലേക്ക് മാറുമ്പോഴുള്ള എഫക്റ്റാണ് സ്ലൈഡ് ട്രാൻസിഷൻ (Slide Transition). എന്നാൽ സ്ലൈഡിനുള്ളിലെ അക്ഷരങ്ങൾക്കും ചിത്രങ്ങൾക്കും നൽകുന്ന മൂവ്‌മെന്റുകളാണ് ആനിമേഷൻ (Custom Animation).",
    "subtopic": "Slide Transitions & Animations"
  },
  {
    "id": "M6_10",
    "sheetName": "Module_6_Office_Applications",
    "question": "Which keyboard shortcut initiates a PowerPoint slide show presentation from the very first slide?",
    "option_a": "F1",
    "option_b": "F5",
    "option_c": "Shift + F5",
    "option_d": "Ctrl + F5",
    "correct_answer": "B",
    "explanation": "Pressing F5 starts the slide show from Slide 1. Pressing 'Shift + F5' starts the slide show from the currently active slide.\n\n[മലയാളം]: പവർപോയിന്റ് പ്രസന്റേഷൻ ആദ്യത്തെ സ്ലൈഡ് മുതൽ പ്ലേ ചെയ്യാൻ (Slide Show) ഉപയോഗിക്കുന്ന കുറുക്കുവഴിയാണ് F5. (നിലവിലെ സ്ലൈഡ് മുതൽ പ്ലേ ചെയ്യാൻ Shift + F5).",
    "subtopic": "Slide Show & Multimedia Integration"
  },
  {
    "id": "M7_01",
    "sheetName": "Module_7_IO_Devices",
    "question": "Which mechanical keyboard switch type provides a tactile bump accompanied by an audible distinct clicking sound upon key actuation?",
    "option_a": "Linear Red switches",
    "option_b": "Clicky Blue switches",
    "option_c": "Silent Black switches",
    "option_d": "Membrane dome pads",
    "correct_answer": "B",
    "explanation": "Clicky switches (such as Cherry MX Blue) are designed with a tactile resistance bump and a loud, crisp acoustic click sound at the exact actuation point.\n\n[മലയാളം]: മെക്കാനിക്കൽ കീബോർഡുകളിൽ കീ പ്രസ്സ് ചെയ്യുമ്പോൾ ശബ്ദത്തോടൊപ്പം (Click sound) വ്യക്തമായ സ്പർശന പ്രതികരണവും (Tactile bump) നൽകുന്ന സ്വിച്ചുകളാണ് ബ്ലൂ സ്വിച്ചുകൾ (Blue Switches).",
    "subtopic": "Input Devices - Keyboards & Mice"
  },
  {
    "id": "M7_02",
    "sheetName": "Module_7_IO_Devices",
    "question": "Which biometric authentication technology captures high-contrast subsurface vein patterns or ridge endings (minutiae points) to verify human identity?",
    "option_a": "Capacitive / Optical Fingerprint Scanner",
    "option_b": "Dot-matrix impact head",
    "option_c": "Magnetic stripe reader",
    "option_d": "OMR Sheet Reader",
    "correct_answer": "A",
    "explanation": "Fingerprint scanners capture biometric ridge and valley patterns, comparing unique minutiae points (ridge endings, bifurcations) or optical/capacitive subsurface readings to authenticate users.\n\n[മലയാളം]: മനുഷ്യരുടെ വിരലടയാളങ്ങളിലെ സൂക്ഷ്മമായ വരകളും വളവുകളും (Minutiae points) ഒപ്റ്റിക്കൽ അല്ലെങ്കിൽ കപ്പാസിറ്റീവ് സാങ്കേതികവിദ്യ വഴി തിരിച്ചറിയുന്ന ബയോമെട്രിക് ഉപകരണമാണ് ഫിംഗർപ്രിന്റ് സ്കാനർ.",
    "subtopic": "Biometric & Commercial Peripherals"
  },
  {
    "id": "M7_03",
    "sheetName": "Module_7_IO_Devices",
    "question": "Why do OLED (Organic Light Emitting Diode) displays achieve true deep black levels and superior contrast compared to traditional LCD panels?",
    "option_a": "OLED displays use multiple fluorescent cold-cathode backlights",
    "option_b": "Each pixel in an OLED panel is self-emissive and can be turned completely off individually",
    "option_c": "OLED displays reflect ambient room light with mirror filters",
    "option_d": "OLED pixels rely on polarized liquid crystal twisting",
    "correct_answer": "B",
    "explanation": "LCD panels require a continuous backlighting source that always leaks some light. OLED pixels emit their own light individually; to produce black, pixels are powered completely OFF (0 nits).\n\n[മലയാളം]: OLED ഡിസ്പ്ലേകളിൽ ഓരോ പിക്സലുകളും സ്വയം പ്രകാശം പുറപ്പെടുവിക്കുന്നവയാണ്. കറുപ്പ് നിറം കാണിക്കേണ്ട ഭാഗങ്ങളിൽ പിക്സലുകൾ പൂർണ്ണമായി ഓഫാക്കാൻ കഴിയുന്നതിനാൽ യഥാർത്ഥ കറുപ്പും മികച്ച കോൺട്രാസ്റ്റും ലഭിക്കുന്നു.",
    "subtopic": "Display Technologies"
  },
  {
    "id": "M7_04",
    "sheetName": "Module_7_IO_Devices",
    "question": "How many pins are found on a standard legacy analog VGA (Video Graphics Array) D-sub connector?",
    "option_a": "9 pins",
    "option_b": "15 pins (arranged in 3 rows of 5 pins)",
    "option_c": "19 pins",
    "option_d": "25 pins",
    "correct_answer": "B",
    "explanation": "A standard analog VGA connector is a DE-15 D-sub connector having 15 pins arranged in three rows of 5 pins carrying RGB color signals and horizontal/vertical sync signals.\n\n[മലയാളം]: കമ്പ്യൂട്ടറുകളിൽ മോണിറ്റർ കണക്ട് ചെയ്യാൻ ഉപയോഗിച്ചിരുന്ന അനലോഗ് VGA കേബിളിൽ 3 നിരകളിലായി 15 പിന്നുകളാണ് (15 Pins) ഉള്ളത്.",
    "subtopic": "Video Interfacing (VGA, HDMI, DisplayPort)"
  },
  {
    "id": "M7_05",
    "sheetName": "Module_7_IO_Devices",
    "question": "According to the PC 99 standard audio color-coding specification, what is the color of the 3.5mm jack designated for Stereo Audio Line-Out / Speakers?",
    "option_a": "Pink",
    "option_b": "Light Green",
    "option_c": "Light Blue",
    "option_d": "Orange",
    "correct_answer": "B",
    "explanation": "Standard PC audio port colors: Light Green = Line-Out / Headphone / Front Speakers; Pink = Microphone In; Light Blue = Line-In; Orange = Center/Subwoofer.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ഓഡിയോ പോർട്ടുകളിൽ സ്പീക്കറുകൾ അല്ലെങ്കിൽ ഹെഡ്‌ഫോൺ കുത്താനുള്ള ലൈൻ-ഔട്ട് (Line-Out) പോർട്ടിന്റെ സ്റ്റാൻഡേർഡ് നിറം ഇളം പച്ചയാണ് (Light Green). മൈക്രോഫോൺ പോർട്ടിന്റെ നിറം പിങ്ക് ആണ്.",
    "subtopic": "Audio I/O Systems"
  },
  {
    "id": "M7_06",
    "sheetName": "Module_7_IO_Devices",
    "question": "Which of the following is an Impact Printer that uses solenoid-driven printhead pins striking an ink ribbon onto carbonized continuous stationary?",
    "option_a": "Thermal Inkjet Printer",
    "option_b": "Laser Printer",
    "option_c": "Dot Matrix Printer (DMP)",
    "option_d": "Dye-Sublimation Printer",
    "correct_answer": "C",
    "explanation": "Dot Matrix Printers (DMP) use mechanical impact pins (typically 9-pin or 24-pin) striking against an inked fabric ribbon to transfer dots to paper, making them capable of printing multi-part carbon copies.\n\n[മലയാളം]: ഇങ്ക് റിബണിൽ പിന്നുകൾ ശക്തിയായി അടിച്ച് ഡോക്യുമെന്റുകൾ പ്രിന്റ് ചെയ്യുന്നതും, ഒരേസമയം കാർബൺ കോപ്പികൾ എടുക്കാൻ സാധിക്കുന്നതുമായ ഇംപാക്ട് പ്രിന്ററാണ് ഡോട്ട് മാട്രിക്സ് പ്രിന്റർ (DMP).",
    "subtopic": "Impact Printers"
  },
  {
    "id": "M7_07",
    "sheetName": "Module_7_IO_Devices",
    "question": "In an Electrostatic Laser Printer, which assembly applies intense heat and mechanical pressure to permanently bond toner powder into paper fibers?",
    "option_a": "Primary Corona Wire / Charging Roller",
    "option_b": "Laser Scanning Unit",
    "option_c": "Fuser Assembly (Fuser Roller & Pressure Roller)",
    "option_d": "Transfer Roller",
    "correct_answer": "C",
    "explanation": "The Fuser Assembly consists of a heated halogen/ceramic roller and an opposing rubber pressure roller that melts the plastic/resin toner particles into the paper pores at approx. 200°C.\n\n[മലയാളം]: ലേസർ പ്രിന്ററിൽ പേപ്പറിലേക്ക് പകർത്തപ്പെട്ട ടോണർ പൊടിയെ ചൂടും മർദ്ദവും ഉപയോഗിച്ച് പേപ്പറിൽ ഉരുകിപ്പിടിപ്പിക്കുന്ന ഭാഗമാണ് ഫ്യൂസർ അസംബ്ലി (Fuser Assembly).",
    "subtopic": "Laser Printers"
  },
  {
    "id": "M7_08",
    "sheetName": "Module_7_IO_Devices",
    "question": "What is the correct sequential order of the 6 core stages in the electro-photographic Laser Printing process?",
    "option_a": "Charging -> Exposing -> Developing -> Transferring -> Fusing -> Cleaning",
    "option_b": "Cleaning -> Conditioning (Charging) -> Exposing (Writing) -> Developing -> Transferring -> Fusing",
    "option_c": "Developing -> Transferring -> Fusing -> Cleaning -> Charging -> Exposing",
    "option_d": "Exposing -> Fusing -> Developing -> Cleaning -> Charging -> Transferring",
    "correct_answer": "B",
    "explanation": "Standard EP Laser printing cycle: 1. Cleaning residual toner, 2. Conditioning (Charging drum with -600V), 3. Exposing with laser writing latent image, 4. Developing with toner, 5. Transferring to paper, 6. Fusing with heat & pressure.\n\n[മലയാളം]: ലേസർ പ്രിന്റിംഗിന്റെ 6 ഘട്ടങ്ങൾ: 1. Cleaning (വൃത്തിയാക്കൽ), 2. Charging (ഡ്രമ്മിൽ ചാർജ്ജ് നൽകൽ), 3. Exposing (ലേസർ പതിപ്പിക്കൽ), 4. Developing (ടോണർ ചേർക്കൽ), 5. Transferring (പേപ്പറിലേക്ക് മാറ്റൽ), 6. Fusing (ചൂടാക്കി ഉറപ്പിക്കൽ).",
    "subtopic": "Laser Printing Process Stages"
  },
  {
    "id": "M7_09",
    "sheetName": "Module_7_IO_Devices",
    "question": "In document scanners, what is the key optical advantage of CCD (Charge-Coupled Device) sensor scanners over CIS (Contact Image Sensor) scanners?",
    "option_a": "CCD scanners consume zero power",
    "option_b": "CCD utilizes true glass optics, lenses, and mirrors providing greater depth of field and color fidelity for 3D/bound books",
    "option_c": "CCD sensors are much thinner and cheaper than CIS",
    "option_d": "CCD scanners do not require any light source",
    "correct_answer": "B",
    "explanation": "CCD scanners use actual optical lenses and mirrors, delivering superior dynamic range and depth of field (essential when scanning thick books where pages do not lie flat). CIS requires direct flat contact.\n\n[മലയാളം]: സ്കാനറുകളിൽ CCD സാങ്കേതികവിദ്യ ലെൻസുകളും മിററുകളും ഉപയോഗിക്കുന്നതിനാൽ പുസ്തകങ്ങൾ പോലെ പൂർണ്ണമായി പതിഞ്ഞിരിക്കാത്ത വസ്തുക്കൾ പോലും മികച്ച ഗുണമേന്മയോടെ സ്കാൻ ചെയ്യാൻ സാധിക്കുന്നു.",
    "subtopic": "Scanners & MFDs"
  },
  {
    "id": "M7_10",
    "sheetName": "Module_7_IO_Devices",
    "question": "What maximum signaling speed was introduced with the SuperSpeed USB 3.0 standard?",
    "option_a": "12 Mbps",
    "option_b": "480 Mbps",
    "option_c": "5 Gbps",
    "option_d": "40 Gbps",
    "correct_answer": "C",
    "explanation": "USB 1.1 Full Speed = 12 Mbps; USB 2.0 High-Speed = 480 Mbps; USB 3.0 (USB 3.1 Gen 1) SuperSpeed = 5 Gbps; USB 3.1 Gen 2 SuperSpeed+ = 10 Gbps.\n\n[മലയാളം]: USB 3.0 (SuperSpeed) സാങ്കേതികവിദ്യയുടെ പരമാവധി ഡാറ്റാ കൈമാറ്റ വേഗത 5 Gbps ആണ്. (USB 2.0-ൽ ഇത് 480 Mbps ആയിരുന്നു).",
    "subtopic": "Peripheral Bus Standards (USB)"
  },
  {
    "id": "M8_01",
    "sheetName": "Module_8_Networking",
    "question": "In which network topology is every node directly connected to every other node, providing the highest fault tolerance with formula n(n-1)/2 physical links?",
    "option_a": "Star Topology",
    "option_b": "Full Mesh Topology",
    "option_c": "Bus Topology",
    "option_d": "Ring Topology",
    "correct_answer": "B",
    "explanation": "In a Full Mesh topology, every device has a dedicated point-to-point link to every other device. For n devices, total links = n(n - 1) / 2. Failure of one link affects only communication between those two nodes.\n\n[മലയാളം]: നെറ്റ്‌വർക്കിലെ ഓരോ കമ്പ്യൂട്ടറും മറ്റ് എല്ലാ കമ്പ്യൂട്ടറുകളുമായും നേരിട്ട് കണക്ട് ചെയ്തിരിക്കുന്നതും ഏറ്റവും കൂടുതൽ സുരക്ഷിതത്വം നൽകുന്നതുമായ ടോപ്പോളജിയാണ് മെഷ് ടോപ്പോളജി (Mesh Topology).",
    "subtopic": "Network Architectures & Topologies"
  },
  {
    "id": "M8_02",
    "sheetName": "Module_8_Networking",
    "question": "Which IEEE working group standard defines Wireless Local Area Networks (Wi-Fi)?",
    "option_a": "IEEE 802.3",
    "option_b": "IEEE 802.11",
    "option_c": "IEEE 802.15",
    "option_d": "IEEE 802.1Q",
    "correct_answer": "B",
    "explanation": "IEEE 802.11 defines Wi-Fi wireless LANs. IEEE 802.3 defines wired Ethernet, IEEE 802.15 defines Bluetooth/WPAN, and IEEE 802.1Q defines VLAN tagging.\n\n[മലയാളം]: വയർലെസ്സ് ലോക്കൽ ഏരിയ നെറ്റ്‌വർക്കിന് (Wi-Fi) ഉപയോഗിക്കുന്ന അന്താരാഷ്ട്ര ഐ.ഇ.ഇ.ഇ സ്റ്റാൻഡേർഡാണ് IEEE 802.11. (വയേർഡ് ഇഥർനെറ്റ് 802.3 ആണ്).",
    "subtopic": "IEEE Standards & Wireless Networking"
  },
  {
    "id": "M8_03",
    "sheetName": "Module_8_Networking",
    "question": "What is the maximum specified channel distance segment for an unshielded twisted-pair (UTP) Category 6 (Cat6) Ethernet cable run?",
    "option_a": "50 meters",
    "option_b": "100 meters (approx. 328 feet)",
    "option_c": "500 meters",
    "option_d": "1000 meters",
    "correct_answer": "B",
    "explanation": "TIA/EIA standard specifies a maximum channel length of 100 meters (90 meters horizontal solid cabling + 10 meters stranded patch cords) for UTP Cat5e/Cat6 Gigabit Ethernet runs.\n\n[മലയാളം]: ഇഥർനെറ്റ് നെറ്റ്വർക്ക് കേബിളുകളിൽ (Cat5e / Cat6) ഡാറ്റാ നഷ്ടം വരാതെ കണക്ട് ചെയ്യാവുന്ന പരമാവധി ദൂരം 100 മീറ്റർ (328 അടി) ആണ്.",
    "subtopic": "Transmission Media & Standards"
  },
  {
    "id": "M8_04",
    "sheetName": "Module_8_Networking",
    "question": "According to the TIA/EIA-568B wiring standard, what is the correct color pinout sequence from Pin 1 to Pin 8 for an RJ-45 connector?",
    "option_a": "White-Orange, Orange, White-Green, Blue, White-Blue, Green, White-Brown, Brown",
    "option_b": "White-Green, Green, White-Orange, Blue, White-Blue, Orange, White-Brown, Brown",
    "option_c": "Orange, White-Orange, Green, Blue, White-Green, White-Blue, Brown, White-Brown",
    "option_d": "White-Blue, Blue, White-Orange, Orange, White-Green, Green, White-Brown, Brown",
    "correct_answer": "A",
    "explanation": "T568B color order: 1: White-Orange, 2: Orange, 3: White-Green, 4: Blue, 5: White-Blue, 6: Green, 7: White-Brown, 8: Brown. (T568A swaps orange and green pairs).\n\n[മലയാളം]: T568B കളർ കോഡിംഗ് ക്രമം: 1: White-Orange, 2: Orange, 3: White-Green, 4: Blue, 5: White-Blue, 6: Green, 7: White-Brown, 8: Brown.",
    "subtopic": "CAT6 Wiring Conventions & RJ-45"
  },
  {
    "id": "M8_05",
    "sheetName": "Module_8_Networking",
    "question": "In data communications, which transmission mode permits simultaneous bidirectional data transfer in both directions at the same time?",
    "option_a": "Simplex mode",
    "option_b": "Half-Duplex mode",
    "option_c": "Full-Duplex mode",
    "option_d": "Multiplex mode",
    "correct_answer": "C",
    "explanation": "In Full-Duplex, both communicating nodes can transmit and receive data simultaneously over separate channels (e.g., telephone call, switched Ethernet). Half-duplex is alternate; Simplex is one-way.\n\n[മലയാളം]: ഒരേ സമയം രണ്ട് ദിശകളിലേക്കും തടസ്സമില്ലാതെ ഡാറ്റ ഒരേസമയം കൈമാറാൻ സാധിക്കുന്ന രീതിയാണ് ഫുൾ-ഡ്യൂപ്ലെക്സ് (Full-Duplex - ഉദാഹരണത്തിന് ടെലിഫോൺ സംഭാഷണം, സ്വിച്ച്ഡ് ഇഥർനെറ്റ്).",
    "subtopic": "Data Transmission Modes"
  },
  {
    "id": "M8_06",
    "sheetName": "Module_8_Networking",
    "question": "What is the Protocol Data Unit (PDU) name at the Data Link Layer (Layer 2) and Network Layer (Layer 3) of the OSI model respectively?",
    "option_a": "Frames and Packets",
    "option_b": "Bits and Segments",
    "option_c": "Packets and Frames",
    "option_d": "Segments and Data",
    "correct_answer": "A",
    "explanation": "OSI Layer PDUs: Layer 1 (Physical) = Bits; Layer 2 (Data Link) = Frames; Layer 3 (Network) = Packets; Layer 4 (Transport) = Segments (TCP) / Datagrams (UDP); Layers 5-7 = Data.\n\n[മലയാളം]: ഒ.എസ്.ഐ (OSI) മോഡലിൽ ഡാറ്റാ ലിങ്ക് ലെയറിലെ (Layer 2) ഡാറ്റാ യൂണിറ്റിനെ ഫ്രെയിമുകൾ (Frames) എന്നും, നെറ്റ്‌വർക്ക് ലെയറിലെ (Layer 3) യൂണിറ്റിനെ പാക്കറ്റുകൾ (Packets) എന്നും വിളിക്കുന്നു.",
    "subtopic": "OSI Reference Model"
  },
  {
    "id": "M8_07",
    "sheetName": "Module_8_Networking",
    "question": "What key mechanism distinguishes TCP from UDP at the Transport Layer of the TCP/IP protocol suite?",
    "option_a": "TCP is connectionless and does not guarantee delivery",
    "option_b": "TCP provides connection-oriented, reliable delivery using a Three-Way Handshake (SYN, SYN-ACK, ACK) and sequence numbers",
    "option_c": "UDP operates only over optical fiber",
    "option_d": "TCP cannot transport web traffic",
    "correct_answer": "B",
    "explanation": "TCP establishes a reliable connection using a 3-way handshake (SYN, SYN-ACK, ACK), guarantees in-order packet arrival, retransmits lost packets, and manages flow control. UDP is connectionless and best-effort.\n\n[മലയാളം]: ട്രാൻസ്പോർട്ട് ലെയറിൽ ടി.സി.പി (TCP) ത്രീ-വേ ഹാൻഡ്ഷേക്ക് (3-way handshake) വഴി ഡാറ്റ നഷ്ടപ്പെടാതെ വിശ്വസനീയമായി എത്തിക്കുന്നു. എന്നാൽ യു.ഡി.പി (UDP) വേഗതയുള്ളതും കണക്ഷൻ ഇല്ലാത്തതുമാണ്.",
    "subtopic": "TCP/IP Protocol Suite"
  },
  {
    "id": "M8_08",
    "sheetName": "Module_8_Networking",
    "question": "At which layer of the OSI model does a standard network Ethernet Switch operate, and what addressing does it inspect to forward frames?",
    "option_a": "Layer 1 (Physical) using Bit sequences",
    "option_b": "Layer 2 (Data Link Layer) using physical MAC addresses",
    "option_c": "Layer 3 (Network Layer) using logical IP addresses",
    "option_d": "Layer 4 (Transport Layer) using Port numbers",
    "correct_answer": "B",
    "explanation": "Layer 2 switches inspect incoming frames' destination MAC (hardware) addresses and use an internal CAM (MAC address) table to forward frames exclusively to the specific destination switch port.\n\n[മലയാളം]: സ്റ്റാൻഡേർഡ് നെറ്റ്‌വർക്ക് സ്വിച്ചുകൾ പ്രവർത്തിക്കുന്നത് ഒ.എസ്.ഐ മോഡലിലെ ഡാറ്റാ ലിങ്ക് ലെയറിലാണ് (Layer 2). അവ കമ്പ്യൂട്ടറുകളുടെ ഫിസിക്കൽ MAC വിലാസം പരിശോധിച്ചാണ് ഡാറ്റ കൈമാറുന്നത്.",
    "subtopic": "Networking Hardware - Switches"
  },
  {
    "id": "M8_09",
    "sheetName": "Module_8_Networking",
    "question": "Which of the following IPv4 address blocks is officially reserved for private local area networks (RFC 1918) and non-routable on the public Internet?",
    "option_a": "172.16.0.0 to 172.31.255.255 and 192.168.0.0 to 192.168.255.255",
    "option_b": "8.8.8.0 to 8.8.8.255",
    "option_c": "128.0.0.0 to 128.255.255.255",
    "option_d": "240.0.0.0 to 255.255.255.255",
    "correct_answer": "A",
    "explanation": "RFC 1918 Private IP ranges: Class A: 10.0.0.0–10.255.255.255; Class B: 172.16.0.0–172.31.255.255; Class C: 192.168.0.0–192.168.255.255. They cannot be routed directly on the Internet.\n\n[മലയാളം]: ലോക്കൽ നെറ്റ്‌വർക്കുകളിൽ ഉപയോഗിക്കാൻ നീക്കിവെച്ചിട്ടുള്ള പ്രൈവറ്റ് ഐ.പി (Private IP) റേഞ്ചുകളാണ് 10.0.0.0/8, 172.16.0.0 - 172.31.255.255, 192.168.0.0 - 192.168.255.255 എന്നിവ.",
    "subtopic": "IP Addressing & Subnetting"
  },
  {
    "id": "M8_10",
    "sheetName": "Module_8_Networking",
    "question": "Which network diagnostic command utility sends ICMP Echo Request packets to verify end-to-end IP network connectivity and round-trip latency?",
    "option_a": "ping",
    "option_b": "netstat",
    "option_c": "nslookup",
    "option_d": "arp -a",
    "correct_answer": "A",
    "explanation": "The 'ping' utility transmits ICMP (Internet Control Message Protocol) Echo Request datagrams to a target host and listens for Echo Replies, reporting packet loss percentage and latency in milliseconds.\n\n[മലയാളം]: രണ്ട് കമ്പ്യൂട്ടറുകൾ തമ്മിൽ നെറ്റ്‌വർക്ക് വഴി പരസ്പരം കണക്റ്റ് ചെയ്തിട്ടുണ്ടോ എന്നും അവ തമ്മിലുള്ള വേഗതയും പരിശോധിക്കാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് 'ping'.",
    "subtopic": "TCP/IP Utilities"
  },
  {
    "id": "M9_01",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "What is the sequential 4-step handshake process executed by DHCP to dynamically allocate IP parameters to client machines?",
    "option_a": "Discover -> Offer -> Request -> Acknowledge (DORA)",
    "option_b": "Demand -> Order -> Receive -> Accept",
    "option_c": "SYN -> SYN-ACK -> ACK -> FIN",
    "option_d": "Request -> Verify -> Authenticate -> Assign",
    "correct_answer": "A",
    "explanation": "DHCP DORA sequence: 1. DHCP Discover (broadcast from client), 2. DHCP Offer (unicast from server), 3. DHCP Request (client requests offered IP), 4. DHCP Acknowledge (server confirms lease).\n\n[മലയാളം]: ഡി.എച്ച്.സി.പി (DHCP) ഒരു കമ്പ്യൂട്ടറിന് ഐ.പി വിലാസം നൽകുന്ന 4 ഘട്ടങ്ങളാണ് DORA: Discover (കണ്ടെത്തൽ), Offer (വാഗ്ദാനം), Request (ആവശ്യപ്പെടൽ), Acknowledge (സ്ഥിരീകരിക്കൽ).",
    "subtopic": "DHCP Protocol & DORA"
  },
  {
    "id": "M9_02",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Which standard TCP/IP port and DNS Resource Record type resolve a domain name (FQDN) to an IPv4 address?",
    "option_a": "Port 53 and 'A' Record",
    "option_b": "Port 80 and 'MX' Record",
    "option_c": "Port 443 and 'PTR' Record",
    "option_d": "Port 21 and 'CNAME' Record",
    "correct_answer": "A",
    "explanation": "DNS operates on UDP/TCP Port 53. An 'A' (Address) record maps a hostname to an IPv4 address. 'AAAA' maps to IPv6, 'MX' specifies mail exchange servers, and 'PTR' maps IP to name.\n\n[മലയാളം]: ഡൊമൈൻ പേരുകളെ ഐ.പി വിലാസത്തിലേക്ക് മാറ്റുന്ന ഡി.എൻ.എസ് (DNS) പോർട്ട് 53-ലാണ് പ്രവർത്തിക്കുന്നത്. ഇതിനായി ഉപയോഗിക്കുന്ന പ്രധാന റിക്കോർഡാണ് 'A' Record.",
    "subtopic": "DNS & Record Types"
  },
  {
    "id": "M9_03",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Why has SSH (Secure Shell, Port 22) universally replaced Telnet (Port 23) for remote command-line server administration?",
    "option_a": "Telnet does not support Linux commands",
    "option_b": "Telnet transmits all credentials and session data in unencrypted plaintext, whereas SSH encrypts all network traffic",
    "option_c": "SSH requires physical serial cables only",
    "option_d": "Telnet cannot operate over local area networks",
    "correct_answer": "B",
    "explanation": "Telnet sends usernames and passwords over the wire as clear plaintext, susceptible to packet sniffing. SSH encrypts the entire connection using public-key cryptography.\n\n[മലയാളം]: ടെൽനെറ്റ് (Telnet) വഴി പാസ്‌വേഡുകൾ ക്ലിയർ ടെക്സ്റ്റായി അയക്കപ്പെടുന്നതിനാൽ സുരക്ഷിതമല്ല. എന്നാൽ SSH (പോർട്ട് 22) മുഴുവൻ വിവരങ്ങളും എൻക്രിപ്റ്റ് ചെയ്ത് അതീവ സുരക്ഷിതമായി അയക്കുന്നു.",
    "subtopic": "Remote Administration - SSH vs Telnet"
  },
  {
    "id": "M9_04",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Which transport protocol and default destination port are utilized when browsing secure HTTPS websites?",
    "option_a": "TCP Port 80",
    "option_b": "TCP Port 443 with SSL/TLS encryption",
    "option_c": "UDP Port 8080",
    "option_d": "TCP Port 25",
    "correct_answer": "B",
    "explanation": "HTTPS (Hypertext Transfer Protocol Secure) operates over TCP Port 443 and uses TLS (Transport Layer Security) encryption to protect HTTP communications against eavesdropping and tampering.\n\n[മലയാളം]: സുരക്ഷിതമായ HTTPS വെബ്സൈറ്റുകൾ പ്രവർത്തിക്കുന്നത് TCP പോർട്ട് 443-ലും SSL/TLS എൻക്രിപ്ഷൻ സാങ്കേതികവിദ്യയിലുമാണ്. (സാധാരണ HTTP പോർട്ട് 80 ആണ്).",
    "subtopic": "HTTP & HTTPS Protocols"
  },
  {
    "id": "M9_05",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Which email protocol is responsible for transmitting outgoing electronic mail messages between mail servers across the internet?",
    "option_a": "POP3 (Post Office Protocol v3)",
    "option_b": "IMAP (Internet Message Access Protocol)",
    "option_c": "SMTP (Simple Mail Transfer Protocol)",
    "option_d": "SNMP",
    "correct_answer": "C",
    "explanation": "SMTP (Simple Mail Transfer Protocol, default port 25/587) handles the sending and relaying of outbound emails. POP3 and IMAP are inbound protocols used to retrieve mail from a mailbox server.\n\n[മലയാളം]: ഇ-മെയിലുകൾ അയക്കാൻ (Sending) ഉപയോഗിക്കുന്ന പ്രോട്ടോക്കോളാണ് SMTP (Simple Mail Transfer Protocol). മെയിലുകൾ ഡൗൺലോഡ് ചെയ്യാനും വായിക്കാനും POP3, IMAP എന്നിവയാണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Email Protocols (SMTP, POP3, IMAP)"
  },
  {
    "id": "M9_06",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "What is the primary benefit of deploying Virtual Local Area Networks (VLANs, IEEE 802.1Q) on managed network switches?",
    "option_a": "Increasing the physical size of copper ethernet cables",
    "option_b": "Segmenting large broadcast domains into isolated logical networks on the same physical switch hardware",
    "option_c": "Automatically boosting internet connection speed tenfold",
    "option_d": "Eliminating the need for any IP addressing",
    "correct_answer": "B",
    "explanation": "VLANs logically partition a single physical switch into multiple isolated broadcast domains, containing broadcast storms, improving network performance, and enforcing departmental security boundaries.\n\n[മലയാളം]: ഒരൊറ്റ ഫിസിക്കൽ സ്വിച്ചിനെ തന്നെ പല ഡിപ്പാർട്ട്മെന്റുകൾക്കായി സുരക്ഷിതമായി വിഭജിച്ച് ബ്രോഡ്കാസ്റ്റ് ട്രാഫിക് നിയന്ത്രിക്കാൻ സഹായിക്കുന്ന സാങ്കേതികവിദ്യയാണ് VLAN (Virtual LAN).",
    "subtopic": "Virtual LAN (VLAN) Concepts"
  },
  {
    "id": "M9_07",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Which network software tool is a popular interactive packet simulator developed by Cisco used for training and testing complex network topologies without physical hardware?",
    "option_a": "Cisco Packet Tracer",
    "option_b": "Adobe Photoshop",
    "option_c": "AutoCAD",
    "option_d": "MS Excel",
    "correct_answer": "A",
    "explanation": "Cisco Packet Tracer is a visual network simulation and modeling tool that allows students and engineers to simulate router configurations, switch connections, and packet flow.\n\n[മലയാളം]: യഥാർത്ഥ റൂട്ടറുകളും സ്വിച്ചുകളും ഇല്ലാതെ തന്നെ കമ്പ്യൂട്ടറിൽ വെർച്വലായി നെറ്റ്‌വർക്ക് ഡിസൈൻ ചെയ്ത് പ്രവർത്തിപ്പിച്ചു നോക്കാൻ ഉപയോഗിക്കുന്ന പ്രശസ്തമായ സിമുലേറ്ററാണ് Cisco Packet Tracer.",
    "subtopic": "Packet Simulators"
  },
  {
    "id": "M9_08",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "What enterprise memory technology incorporates extra bits per word to detect and automatically correct single-bit memory corruption errors in servers?",
    "option_a": "Non-ECC Unbuffered RAM",
    "option_b": "ECC (Error-Correcting Code) RAM",
    "option_c": "VRAM",
    "option_d": "Static ROM",
    "correct_answer": "B",
    "explanation": "ECC (Error-Correcting Code) RAM uses parity calculation algorithms to detect and correct single-bit memory errors in real time, preventing unexpected server system crashes.\n\n[മലയാളം]: സെർവറുകൾ ക്രാഷാവാതെ 24 മണിക്കൂറും പ്രവർത്തിക്കാൻ, മെമ്മറിയിലെ ചെറിയ തകരാറുകൾ സ്വയം കണ്ടെത്തി തിരുത്താൻ ശേഷിയുള്ള റാം ആണ് ECC RAM (Error-Correcting Code).",
    "subtopic": "Server Systems Hardware"
  },
  {
    "id": "M9_09",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "In Microsoft Windows Server environments, what central database service authenticates users, enforces security group policies, and manages network resources in a domain?",
    "option_a": "Active Directory Domain Services (AD DS)",
    "option_b": "Windows Media Player Sharing",
    "option_c": "Peer-to-Peer Workgroups",
    "option_d": "Internet Information Services (IIS) only",
    "correct_answer": "A",
    "explanation": "Active Directory Domain Services (AD DS) runs on Domain Controllers, providing centralized authentication, authorization, and group policy management for all computers and users in an enterprise.\n\n[മലയാളം]: വിൻഡോസ് സെർവറിൽ എല്ലാ കമ്പ്യൂട്ടറുകളിലെയും ഉപയോക്താക്കളെയും ഗ്രൂപ്പ് പോളിസികളെയും ഒരൊറ്റ കേന്ദ്രത്തിൽ നിന്ന് നിയന്ത്രിക്കുന്ന ഡയറക്ടറി സർവീസാണ് ആക്ടീവ് ഡയറക്ടറി (Active Directory - AD DS).",
    "subtopic": "Windows Server Deployment"
  },
  {
    "id": "M9_10",
    "sheetName": "Module_9_Protocols_Servers",
    "question": "Which Linux service daemon and default port provide remote graphical desktop access to Windows systems via Microsoft Remote Desktop Protocol (RDP)?",
    "option_a": "Apache on Port 80",
    "option_b": "xrdp on TCP Port 3389",
    "option_c": "Bind9 on Port 53",
    "option_d": "vsftpd on Port 21",
    "correct_answer": "B",
    "explanation": "Microsoft Remote Desktop Protocol (RDP) operates over TCP Port 3389. On Linux servers, the 'xrdp' open-source daemon allows Windows clients to connect remotely via standard RDP.\n\n[മലയാളം]: മൈക്രോസോഫ്റ്റ് റിമോട്ട് ഡെസ്ക്ടോപ്പ് കണക്ഷൻ (RDP) പ്രവർത്തിക്കുന്നത് TCP പോർട്ട് 3389-ലാണ്. ലിനക്സിൽ ഇതിനായി 'xrdp' സർവീസ് ഉപയോഗിക്കുന്നു.",
    "subtopic": "Linux Server & Remote Administration"
  },
  {
    "id": "M10_01",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "In information security, what are the three fundamental pillars that constitute the 'CIA Triad'?",
    "option_a": "Control, Inspection, Authorization",
    "option_b": "Confidentiality, Integrity, and Availability",
    "option_c": "Cryptography, Internet, Authentication",
    "option_d": "Cables, Interfaces, Antivirus",
    "correct_answer": "B",
    "explanation": "The CIA Triad comprises Confidentiality (protecting data from unauthorized disclosure), Integrity (ensuring data is accurate and untampered), and Availability (ensuring timely authorized access).\n\n[മലയാളം]: സൈബർ സുരക്ഷയിലെ പ്രധാനപ്പെട്ട മൂന്ന് അടിസ്ഥാന സ്തംഭങ്ങളാണ് CIA ട്രയാഡ്: Confidentiality (രഹസ്യസ്വഭാവം), Integrity (വിശ്വാസ്യത/മാറ്റമില്ലായ്മ), Availability (ആവശ്യാനുസരണം ലഭ്യമാവുക).",
    "subtopic": "Information Security Concepts & CIA Triad"
  },
  {
    "id": "M10_02",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "What malicious attack involves tricking users into revealing sensitive passwords or financial credentials via fraudulent, deceptive emails mimicking trusted entities?",
    "option_a": "DDoS Attack",
    "option_b": "Phishing",
    "option_c": "Buffer Overflow",
    "option_d": "Port Scanning",
    "correct_answer": "B",
    "explanation": "Phishing is a social engineering attack where an attacker disguises as a reputable organization (bank, IT support) in emails to deceive victims into handing over passwords or credit card numbers.\n\n[മലയാളം]: ബാങ്ക് അല്ലെങ്കിൽ മറ്റ് വിശ്വസനീയ സ്ഥാപനങ്ങളുടെ പേരിൽ വ്യാജ ഇമെയിലുകളോ സന്ദേശങ്ങളോ അയച്ച് ഉപയോക്താക്കളുടെ പാസ്‌വേഡും അക്കൗണ്ട് വിവരങ്ങളും തട്ടിയെടുക്കുന്ന രീതിയാണ് ഫിഷിംഗ് (Phishing).",
    "subtopic": "Network Attacks - Social Engineering"
  },
  {
    "id": "M10_03",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "What is the primary difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?",
    "option_a": "IDS actively drops malicious packets; IPS only writes logs",
    "option_b": "IDS detects and alerts on suspicious traffic passively; IPS sits in-line and actively blocks or drops malicious network packets",
    "option_c": "IDS operates only on Wi-Fi; IPS works exclusively on fiber optic",
    "option_d": "Both tools perform identical tasks with no technical difference",
    "correct_answer": "B",
    "explanation": "An IDS (passive monitor) analyzes traffic copies and sends alert notifications upon detecting threats. An IPS (inline active device) detects threats and immediately drops/terminates malicious sessions.\n\n[മലയാളം]: IDS ഭീഷണികൾ കണ്ടെത്തി അലർട്ട് (മുന്നറിയിപ്പ്) മാത്രം തരുമ്പോൾ, IPS ട്രാഫിക്കിലെ അക്രമങ്ങളെ തത്സമയം സ്വയം തടയുകയും (Block) ഇല്ലാതാക്കുകയും ചെയ്യുന്നു.",
    "subtopic": "Security Strategies - IDS vs IPS"
  },
  {
    "id": "M10_04",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "In modern cryptography, how does Asymmetric (Public-Key) encryption differ from Symmetric encryption?",
    "option_a": "Asymmetric encryption uses the exact same single secret key for both encryption and decryption",
    "option_b": "Asymmetric encryption uses a mathematically linked key pair: a Public key to encrypt and a matching Private key to decrypt",
    "option_c": "Symmetric encryption cannot be decoded by any computer",
    "option_d": "Asymmetric encryption does not use any mathematical algorithm",
    "correct_answer": "B",
    "explanation": "Symmetric encryption uses a single shared secret key for encryption and decryption (AES). Asymmetric encryption uses a public key (openly distributed) and a private key (kept secret) pair (RSA, ECC).\n\n[മലയാളം]: സിമെട്രിക് എൻക്രിപ്ഷനിൽ ഒരു കീ തന്നെയാണ് പൂട്ടിടാനും തുറക്കാനും ഉപയോഗിക്കുന്നത്. എന്നാൽ അസിമെട്രിക് എൻക്രിപ്ഷനിൽ എൻക്രിപ്റ്റ് ചെയ്യാൻ പബ്ലിക് കീയും (Public Key), ഡീക്രിപ്റ്റ് ചെയ്യാൻ പ്രൈവറ്റ് കീയും (Private Key) ഉപയോഗിക്കുന്നു.",
    "subtopic": "Cryptography & Authentication"
  },
  {
    "id": "M10_05",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "What type of software architecture allows a single physical server to run multiple completely isolated virtual guest operating systems simultaneously?",
    "option_a": "Hypervisor (Virtual Machine Monitor)",
    "option_b": "Disk defragmenter",
    "option_c": "BIOS clock generator",
    "option_d": "Compiler",
    "correct_answer": "A",
    "explanation": "A Hypervisor (Virtual Machine Monitor - VMM) manages CPU, RAM, and storage allocation, allowing multiple isolated virtual machines (VMs) to run concurrently on one physical server.\n\n[മലയാളം]: ഒരൊറ്റ കമ്പ്യൂട്ടറിൽ ഒരേസമയം ഒന്നിലധികം ഓപ്പറേറ്റിംഗ് സിസ്റ്റങ്ങൾ വെർച്വലായി പ്രവർത്തിപ്പിക്കാൻ സഹായിക്കുന്ന സോഫ്റ്റ്‌വെയറാണ് ഹൈപ്പർവൈസർ (Hypervisor / VMM).",
    "subtopic": "Server Virtualization"
  },
  {
    "id": "M10_06",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "What is an example of a Type-1 (Bare-Metal) Hypervisor that installs directly on the host physical server hardware without an underlying host OS?",
    "option_a": "VMware ESXi / Microsoft Hyper-V Server / Proxmox VE",
    "option_b": "Oracle VirtualBox",
    "option_c": "VMware Workstation Pro",
    "option_d": "Windows Notepad",
    "correct_answer": "A",
    "explanation": "Type-1 (Bare-metal) hypervisors (VMware ESXi, Hyper-V, Proxmox) install directly onto the physical server hardware for maximum performance. Type-2 hypervisors (VirtualBox, Workstation) run inside a host OS.\n\n[മലയാളം]: ഹോസ്റ്റ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിന്റെ സഹായമില്ലാതെ നേരിട്ട് ഹാർഡ്‌വെയറിൽ ഇൻസ്റ്റാൾ ചെയ്യുന്ന ടൈപ്പ്-1 (Bare-metal) ഹൈപ്പർവൈസറുകളാണ് VMware ESXi, Proxmox VE, Hyper-V എന്നിവ.",
    "subtopic": "Hypervisors - Type 1 vs Type 2"
  },
  {
    "id": "M10_07",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "Under standard Cloud Computing service models, what service level provides on-demand raw virtual machines, storage, and networking (e.g., AWS EC2, Microsoft Azure VMs)?",
    "option_a": "Software as a Service (SaaS)",
    "option_b": "Platform as a Service (PaaS)",
    "option_c": "Infrastructure as a Service (IaaS)",
    "option_d": "Function as a Service only",
    "correct_answer": "C",
    "explanation": "Infrastructure as a Service (IaaS) gives users full administrative control over fundamental compute resources (virtual servers, network routing, storage) while the cloud provider manages physical hardware.\n\n[മലയാളം]: വെർച്വൽ മെഷീനുകൾ, സ്റ്റോറേജ്, നെറ്റ്‌വർക്ക് തുടങ്ങിയ അടിസ്ഥാന സൗകര്യങ്ങൾ ക്ലൗഡ് വഴി വാടകയ്ക്ക് നൽകുന്ന സേവനമാണ് IaaS (Infrastructure as a Service - ഉദാ: AWS EC2).",
    "subtopic": "Cloud Computing Service Models"
  },
  {
    "id": "M10_08",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "To which Cloud Service category do consumer web applications like Google Docs, Gmail, and Microsoft 365 belong?",
    "option_a": "Infrastructure as a Service (IaaS)",
    "option_b": "Software as a Service (SaaS)",
    "option_c": "Platform as a Service (PaaS)",
    "option_d": "Bare-Metal Hosting",
    "correct_answer": "B",
    "explanation": "Software as a Service (SaaS) delivers complete end-user applications accessed through a web browser; users don't manage any servers, databases, or operating systems (e.g., Gmail, M365, Salesforce).\n\n[മലയാളം]: ആപ്പുകൾ കമ്പ്യൂട്ടറിൽ ഇൻസ്റ്റാൾ ചെയ്യാതെ ബ്രൗസർ വഴി നേരിട്ട് ഉപയോഗിക്കാൻ സാധിക്കുന്ന ക്ലൗഡ് സേവനമാണ് SaaS (Software as a Service - ഉദാ: Gmail, Google Docs).",
    "subtopic": "Software as a Service (SaaS)"
  },
  {
    "id": "M10_09",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "In the Information Technology Act 2000 of India, which section specifically penalizes unauthorized access, hacking, and computer-related offenses with imprisonment up to 3 years?",
    "option_a": "Section 66",
    "option_b": "Section 10",
    "option_c": "Section 302",
    "option_d": "Section 144",
    "correct_answer": "A",
    "explanation": "Section 66 of the Information Technology Act, 2000 deals with 'Computer Related Offences' (hacking, sending offensive messages, data theft) prescribing imprisonment up to 3 years or fine up to 5 lakh rupees or both.\n\n[മലയാളം]: ഇന്ത്യയിലെ ഐ.ടി ആക്ട് 2000-ൽ കമ്പ്യൂട്ടർ ഹാക്കിംഗും അനധികൃത കടന്നുകയറ്റവും കുറ്റകരമാക്കുന്ന പ്രധാന വകുപ്പാണ് സെക്ഷൻ 66 (മൂന്ന് വർഷം വരെ തടവും പിഴയും).",
    "subtopic": "IT Act 2000 & Cyber Crime Provisions"
  },
  {
    "id": "M10_10",
    "sheetName": "Module_10_Security_Cloud_Law",
    "question": "According to the Indian IT Act 2000, what digital mechanism provides legal recognition for authenticating electronic records and ensuring non-repudiation?",
    "option_a": "Scanned photo of handwritten signature",
    "option_b": "Digital Signature issued by a licensed Certifying Authority (CA) using asymmetric cryptography",
    "option_c": "Plain email sign-off text",
    "option_d": "Capturing a screenshot of user ID",
    "correct_answer": "B",
    "explanation": "The IT Act 2000 grants electronic records legal validity through Digital Signatures created using asymmetric cryptosystems and hash functions issued by licensed Certifying Authorities under the Controller of Certifying Authorities (CCA).\n\n[മലയാളം]: ഇന്ത്യയിൽ ഇലക്ട്രോണിക് രേഖകൾക്ക് നിയമപരമായ സാധുത നൽകുന്നതിനായി അസിമെട്രിക് ക്രിപ്റ്റോഗ്രാഫി വഴി അംഗീകൃത അതോറിറ്റികൾ നൽകുന്നതാണ് ഡിജിറ്റൽ സിഗ്നേച്ചർ (Digital Signature).",
    "subtopic": "Digital Signatures & Legal Framework"
  }
];
}

// ============================================================================
// 🤖 DAILY AUTOMATION & AI QUESTION GENERATOR (GEMINI API)
// ============================================================================

/**
 * ഗൂഗിൾ ഷീറ്റ് തുറക്കുമ്പോൾ കസ്റ്റം മെനു ആഡ് ചെയ്യുന്നു
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🤖 PSC AI Generator")
    .addItem("▶️ Generate Questions for All Modules Now", "generateQuestionsForAllModules")
    .addItem("🏛️ Add COPA Previous Exam Sheet (100 Qs - 147/2023)", "setupPscPreviousExamSheet")
    .addItem("🛠️ Add Tradesman CHM 191/2015 Sheet (83 Qs)", "setupPscTradesman191_2015Sheet")
    .addItem("🛠️ Add Tradesman CHM 170/2014 Sheet (100 Qs)", "setupPscTradesman170_2014Sheet")
    .addSeparator()
    .addItem("⏰ Setup Daily Auto-Trigger (Every Day 6 AM)", "setupDailyTrigger")
    .addItem("⏹️ Remove Daily Auto-Trigger", "removeDailyTrigger")
    .addToUi();
}

/**
 * ദിവസവും രാവിലെ തനിയെ റൺ ആവാനുള്ള ട്രിഗർ സെറ്റ് ചെയ്യുന്നു
 */
function setupDailyTrigger() {
  // നിലവിലുള്ള ട്രിഗറുകൾ കളയുന്നു
  removeDailyTrigger();

  // എല്ലാ ദിവസവും രാവിലെ 5 മുതൽ 6 മണിക്കുള്ളിൽ ഓട്ടോമാറ്റിക്കായി റൺ ആവുന്നു
  ScriptApp.newTrigger("dailyAutoQuestionGenerator")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  SpreadsheetApp.getUi().alert(
    "✅ വിജയിച്ചു!\n\nഎല്ലാ ദിവസവും രാവിലെ 6:00 AM-ന് ഷീറ്റിലെ എല്ലാ മൊഡ്യൂളുകളിലേക്കും ചോദ്യങ്ങൾ ഓട്ടോമാറ്റിക്കായി ആഡ് ചെയ്യപ്പെടും."
  );
}

/**
 * ട്രിഗർ റിമൂവ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "dailyAutoQuestionGenerator") {
      ScriptApp.deleteTrigger(t);
    }
  });
}

/**
 * ഡെയ്‌ലി ട്രിഗർ വഴി പ്രവർത്തിക്കുന്ന പ്രധാന ഫംഗ്ഷൻ
 */
function dailyAutoQuestionGenerator() {
  generateQuestionsForAllModules(50);
}

/**
 * എല്ലാ മൊഡ്യൂളുകളിലേക്കും ചോദ്യങ്ങൾ നിർമ്മിച്ച് ഷീറ്റിലേക്ക് ചേർക്കുന്നു
 */
function generateQuestionsForAllModules(countPerModule = 10) {
  const apiKey = getEffectiveApiKey();
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    const msg = "⚠️ ദയവായി നിങ്ങളുടെ Gemini API Key നൽകുക! Apps Script-ലെ GEMINI_API_KEY എന്ന വേരിയബിളിൽ കീ പേസ്റ്റ് ചെയ്യുക.";
    Logger.log(msg);
    try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const modulePrompts = [
    {
      sheet: "Module_1_Electronics",
      prefix: "M1",
      topic: "Module 1: Basic Electronics (Marks: 12) - Electricity (Voltage, current, resistance, power, Ohm's/Kirchhoff's law), Resistors (color coding, power rating, series/parallel), Capacitors (dielectrics, series/parallel), Inductors & Transformers (mutual inductance, magnetic cores, inductive reactance, turns ratio, impedance matching), Semiconductors (intrinsic/extrinsic, p/n doping, PN junction), PN Diode (forward/reverse bias, barrier potential, breakdown, specialized diodes), Power devices (SCR structure, triggering, latching/holding current, phase control; DIAC bidirectional switching; TRIAC operations), Transistors (NPN/PNP, BJT switch/amplifier, FET, JFET, MOSFET), Power Supplies (Zener, current limiting, thermal protection, 3-Pin IC Regulators 78xx/79xx, SMPS linear/switching regulation), Digital Electronics (number systems, logic gates)."
    },
    {
      sheet: "Module_2_Comp_Fundamentals",
      prefix: "M2",
      topic: "Module 2: Computer Fundamentals (Marks: 08) - Characteristics, generations, classification, applications, hardware/software concepts, functional blocks, internal architecture, instruction cycle, motherboard components, Cabinet and motherboard form factors, expansion slots, bus architecture, add-on cards, chipset architecture, processor families, socket types, Memory hierarchy, memory units, primary memory, RAM, ROM, cache memory."
    },
    {
      sheet: "Module_3_Adv_Hardware_Storage",
      prefix: "M3",
      topic: "Module 3: Advanced Hardware & Storage (Marks: 10) - CPU Technology (Internal organization, modern architectures, multicore processing, thermal cooling mechanisms, overclocking), Storage Devices (Magnetic storage, HDD internal architecture, hard drive controller electronics, SSD solid state devices, storage interfaces SATA/NVMe/PCIe, optical storage, RAID concepts and levels 0/1/5/10, NAS network attached storage)."
    },
    {
      sheet: "Module_4_OS_Deployment",
      prefix: "M4",
      topic: "Module 4: Operating Systems and deployment (Marks: 10) - Software classification (system, application, utilities, high/low level languages), OS Setup & Recovery (OS functions, open source/proprietary, DOS, GUI, deployment methods, recovery partitions, system image creation, backup/restore, registry fundamentals, Linux features/structure, file system, process architecture, basic commands), Partition schemes (MBR, partition tables, primary/extended/logical), Boot management (boot loaders, Windows Boot Manager, alternative boot managers, multi-boot)."
    },
    {
      sheet: "Module_5_System_Utilities",
      prefix: "M5",
      topic: "Module 5: System Utilities & Maintenance (Marks: 10) - System Files & Commands (Windows Explorer, file system properties, 32/64-bit architecture, critical system32 files, CLI & PowerShell basics, Task Manager, Windows services, process priorities, Event Viewer, System Monitor, Safe Mode), User Account Security (account types, UAC, access levels, permissions, group policies, time-based expiration), Malware & Maintenance (antivirus configuration, definitions update, port blocking, hosts file modification, junk cleanup, defragmentation, licensing compliance)."
    },
    {
      sheet: "Module_6_Office_Applications",
      prefix: "M6",
      topic: "Module 6: Office Applications (Marks: 10) - Word Processing & Spreadsheets (document creation, editing, formatting, page setup, mail merge, spreadsheet creation, cell formulas, chart generation, data sorting/filtering), Presentations (slide creation, themes, formatting, animation, multimedia integration)."
    },
    {
      sheet: "Module_7_IO_Devices",
      prefix: "M7",
      topic: "Module 7: I/O Devices & Maintenance (Marks: 10) - I/O Devices (keyboards, mice, audio/visual input, biometric/commercial peripherals, display technologies, video interfacing, audio I/O), Printers (impact & non-impact: Dot Matrix, Inkjet, Laser printer drum/toner/fuser), scanners, MFDs, peripheral bus standards USB/HDMI/DisplayPort/VGA, installation, configuration, driver deployment, diagnostics, maintenance & repair."
    },
    {
      sheet: "Module_8_Networking",
      prefix: "M8",
      topic: "Module 8: Networking Fundamentals (Marks: 10) - Architectures & Topologies (P2P, Client-Server, Star/Mesh/Bus/Ring topologies, LAN/MAN/PAN/WAN, IEEE standards, Wireless), Transmission media & standards (twisted-pair Cat6, coaxial, fiber-optic, RJ-45/RJ-11/BNC, wiring conventions T568A/T568B, simplex/half-duplex/full-duplex), Reference models (OSI 7 layers, TCP/IP suite), Hardware (hubs, switches, routers, gateways, repeaters, transceivers, WAPs, firewalls), IP Addressing & Services (IPv4, IPv6, subnetting, TCP/IP utilities ping/traceroute/netstat)."
    },
    {
      sheet: "Module_9_Protocols_Servers",
      prefix: "M9",
      topic: "Module 9: Application Protocols and Server Administration (Marks: 10) - Application Protocols (DHCP, DNS, FTP, Telnet, SSH, HTTP, HTTPS, SMTP, VLAN concepts, packet simulators), Server Systems (hardware, Windows and Linux server deployment, network management utilities, remote administration RDP/SSH)."
    },
    {
      sheet: "Module_10_Security_Cloud_Law",
      prefix: "M10",
      topic: "Module 10: Network Security, Cloud Computing & IT Law (Marks: 10) - Network Security (concepts, attack types DoS/DDoS/phishing/malware, prevention, threats, data breaches, safe browsing, email security, cryptography & authentication), Virtualization & Cloud (server virtualization, VM requirements, cloud infrastructure IaaS/PaaS/SaaS, public/private/hybrid cloud), IT Act & Cyber Laws (IT Act 2000, Section 66, legal provisions, cybercrime, digital signatures, e-governance, data privacy)."
    }
  ];

  let totalAdded = 0;
  
  // Reference Notes ടാബിൽ നൽകിയിട്ടുള്ള മുൻകാല ചോദ്യങ്ങളും നോട്ടുകളും വായിക്കുന്നു
  const referenceNotes = getReferenceNotesText(ss);
  if (referenceNotes) {
    Logger.log("ℹ️ Reference Notes കണ്ടെത്തി. ചോദ്യങ്ങൾ നിർമ്മിക്കാൻ ഇവ കൂടി ഉൾപ്പെടുത്തുന്നു.");
  }

  modulePrompts.forEach(mod => {
    let sheet = ss.getSheetByName(mod.sheet);
    if (!sheet) {
      sheet = ss.insertSheet(mod.sheet);
      sheet.appendRow(["id", "question", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "subtopic"]);
    }

    const lastRow = sheet.getLastRow();
    const startIdNumber = lastRow > 1 ? lastRow : 1;

    try {
      const generated = fetchGeminiQuestions(apiKey, mod.topic, countPerModule, mod.prefix, startIdNumber, referenceNotes);
      if (generated && generated.length > 0) {
        generated.forEach(item => {
          sheet.appendRow([
            item.id || `${mod.prefix}_${Date.now()}`,
            item.question,
            item.option_a,
            item.option_b,
            item.option_c,
            item.option_d,
            item.correct_answer,
            item.explanation,
            item.subtopic || mod.sheet
          ]);
          totalAdded++;
        });
      }
      Utilities.sleep(1500); // API Rate Limit ഒഴിവാക്കാനായി 1.5 സെക്കൻഡ് ഇടവേള
    } catch (err) {
      Logger.log(`Error in ${mod.sheet}: ` + err.message);
    }
  });

  const completionMsg = `🎉 വിജയകരമായി പൂർത്തിയായി! ആകെ ${totalAdded} പുതിയ ചോദ്യങ്ങൾ എല്ലാ മൊഡ്യൂളുകളിലേക്കുമായി ചേർത്തു.`;
  Logger.log(completionMsg);
  try {
    SpreadsheetApp.getUi().alert(completionMsg);
  } catch (e) {}
}

/**
 * Reference_Notes ടാബിൽ നിന്നുള്ള വിവരങ്ങൾ ശേഖരിക്കുന്നു
 */
function getReferenceNotesText(ss) {
  const refSheet = ss.getSheetByName("Reference_Notes");
  if (!refSheet) return "";
  const lastRow = refSheet.getLastRow();
  if (lastRow < 2) return "";
  
  // ആദ്യത്തെ 60 വരികളിലെ നോട്ടുകളും പ്രീവിയസ് ചോദ്യങ്ങളും എടുക്കുന്നു
  const rowsToFetch = Math.min(lastRow - 1, 60);
  const data = refSheet.getRange(2, 1, rowsToFetch, 2).getValues();
  
  const formatted = data
    .filter(row => row[1] && row[1].toString().trim() !== "")
    .map(row => `${row[0] ? `[${row[0]}] ` : ""}${row[1]}`)
    .join("\n\n");
    
  return formatted.substring(0, 5000); // സുരക്ഷിതമായ പരിധി
}

/**
 * Gemini API കോൾ ചെയ്യുന്ന ഫംഗ്ഷൻ (Auto Model Fallback സഹിതം)
 */
function fetchGeminiQuestions(apiKey, topic, count, prefix, startId, referenceNotes = "") {
  let refSection = "";
  if (referenceNotes && referenceNotes.trim() !== "") {
    refSection = `\nREFERENCE STUDY MATERIALS & PREVIOUS EXAM QUESTIONS FROM CANDIDATE'S NOTEBOOK:
"""
${referenceNotes}
"""
Please strictly align your questions, topics, difficulty level, and concepts with the above candidate reference materials and previous question patterns whenever relevant.\n`;
  }

  const prompt = `You are an expert examiner creating high-quality Kerala PSC Tradesman Examination (Computer Hardware Maintenance - Cat. No. 884/2025) Multiple Choice Questions (MCQs).
Topic: ${topic}
Number of questions needed: ${count}
Starting ID index: ${startId}
${refSection}
REQUIREMENTS:
1. Each question must strictly follow the Kerala PSC exam standard.
2. English language questions and options.
3. Realistic options, with exactly one indisputably correct answer (A, B, C, or D).
4. Detailed technical explanation justifying the correct answer in English, followed by a simple Malayalam explanation:
   Format the explanation field strictly as: "English explanation here.\n\n[മലയാളം]: ലളിതമായ മലയാളം വിശദീകരണം."
5. Distribute questions specifically across the individual subtopics listed in the Topic description above.
6. In the "subtopic" field, explicitly state the exact syllabus subtopic name.
7. Return ONLY a valid raw JSON array of objects, with NO MARKDOWN formatting, NO \`\`\`json wrappers.

JSON SCHEMA:
[
  {
    "id": "${prefix}_${startId}",
    "question": "Clear technical question...",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_answer": "A",
    "explanation": "English technical explanation.\n\n[മലയാളം]: ലളിതമായ മലയാളം വിശദീകരണം.",
    "subtopic": "Specific subtopic name"
  }
]`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json"
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // ലഭ്യമായ മുൻഗണനാ മോഡലുകൾ (Google അക്കൗണ്ടിൽ സപ്പോർട്ട് ചെയ്യുന്ന ഒന്ന് സ്വയം തെരഞ്ഞെടുക്കും)
  const candidateEndpoints = [
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent",
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
  ];

  let lastError = null;

  for (let i = 0; i < candidateEndpoints.length; i++) {
    const endpoint = `${candidateEndpoints[i]}?key=${apiKey}`;
    try {
      const response = UrlFetchApp.fetch(endpoint, options);
      const code = response.getResponseCode();
      if (code === 200) {
        const jsonResponse = JSON.parse(response.getContentText());
        if (jsonResponse.candidates && jsonResponse.candidates[0].content.parts[0].text) {
          let rawText = jsonResponse.candidates[0].content.parts[0].text.trim();
          if (rawText.startsWith("```json")) {
            rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (rawText.startsWith("```")) {
            rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
          }
          return safeParseGeminiJson(rawText);
        }
      } else {
        lastError = new Error(`HTTP ${code}: ` + response.getContentText());
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate questions with available Gemini models.");
}

/**
 * Robust JSON parser that handles markdown ticks, unescaped newlines/tabs, and control characters
 */
function safeParseGeminiJson(rawText) {
  if (!rawText) throw new Error("Empty response received from AI");
  let text = rawText.trim();

  if (text.startsWith("```json")) {
    text = text.replace(/^```json/i, '').replace(/```$/, '').trim();
  } else if (text.startsWith("```")) {
    text = text.replace(/^```/i, '').replace(/```$/, '').trim();
  }

  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    text = text.substring(firstBracket, lastBracket + 1);
  }

  text = text.replace(/,\s*([\]}])/g, '$1');
  text = sanitizeJsonString(text);

  try {
    return JSON.parse(text);
  } catch (err) {
    return extractQuestionsFallback(rawText);
  }
}

function sanitizeJsonString(raw) {
  let inString = false;
  let isEscaped = false;
  let result = '';

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const code = raw.charCodeAt(i);

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        result += char;
      } else if (char === '\\') {
        isEscaped = true;
        result += char;
      } else if (char === '"') {
        inString = false;
        result += char;
      } else if (code < 32) {
        if (char === '\n') result += '\\n';
        else if (char === '\r') result += '\\r';
        else if (char === '\t') result += '\\t';
        else result += '\\u' + ('000' + code.toString(16)).slice(-4);
      } else {
        result += char;
      }
    } else {
      if (char === '"') inString = true;
      result += char;
    }
  }
  return result;
}

function extractQuestionsFallback(rawText) {
  const regex = /\{[\s\S]*?"question"[\s\S]*?\}/g;
  const matches = rawText.match(regex);
  if (!matches || matches.length === 0) {
    throw new Error("Could not parse AI response into questions.");
  }

  const results = [];
  for (let i = 0; i < matches.length; i++) {
    const block = matches[i];
    try {
      const sanitized = sanitizeJsonString(block.replace(/,\s*}/g, '}'));
      const obj = JSON.parse(sanitized);
      if (obj.question && obj.option_a) {
        results.push(obj);
        continue;
      }
    } catch (e) {}

    const getField = (name) => {
      const m = block.match(new RegExp(`"${name}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*})`));
      return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : "";
    };

    const q = getField("question");
    const a = getField("option_a");
    if (q && a) {
      results.push({
        question: q,
        option_a: a,
        option_b: getField("option_b"),
        option_c: getField("option_c"),
        option_d: getField("option_d"),
        correct_answer: (getField("correct_answer") || "A").toUpperCase(),
        explanation: getField("explanation") || "",
        sheetName: getField("sheetName") || "",
        subtopic: getField("subtopic") || ""
      });
    }
  }
  if (results.length === 0) {
    throw new Error("Failed to extract valid questions from AI response.");
  }
  return results;
}

/**
 * API Key കണ്ടുപിടിക്കാൻ (Script Properties അല്ലെങ്കിൽ കോഡിലെ വേരിയബിൾ)
 */
function getEffectiveApiKey() {
  const prop = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (prop) return prop;
  return GEMINI_API_KEY;
}



/**
 * PSC Previous Exam (147/2023) ഷീറ്റ് ഒറ്റ ക്ലിക്കിൽ നിർമ്മിച്ച് 100 ചോദ്യങ്ങളും ചേർക്കുന്നു
 */
function setupPscPreviousExamSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("PSC_Previous_Exam");
  if (!sheet) {
    sheet = ss.insertSheet("PSC_Previous_Exam");
  }

  const headers = [
    "id", "question", "option_a", "option_b", "option_c", "option_d",
    "correct_answer", "explanation", "subtopic"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e1b4b");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 450);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 180);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 120);
    sheet.setColumnWidth(8, 400);
    sheet.setColumnWidth(9, 220);
  }

  const existingData = sheet.getDataRange().getValues();
  const existingIds = new Set();
  for (let r = 1; r < existingData.length; r++) {
    if (existingData[r][0]) existingIds.add(String(existingData[r][0]));
  }

  const pscQuestions = getPscPreviousQuestions();
  let added = 0;
  pscQuestions.forEach(q => {
    if (!existingIds.has(q.id)) {
      sheet.appendRow([
        q.id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation,
        q.subtopic
      ]);
      added++;
    }
  });

  const msg = "✅ PSC Previous Exam Sheet (147/2023) വിജയകരമായി തയ്യാറാക്കി! ആകെ " + added + " ചോദ്യങ്ങൾ ചേർത്തു.";
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {}
}

/**
 * Kerala PSC Junior Instructor (COPA) - Question Code: 147/2023, Cat. No: 745/2021
 * Official 100 Questions with Provisional Answer Key & Malayalam Explanations
 */
function getPscPreviousQuestions() {
  return [
  {
    "id": "PSC_147_2023_001",
    "sheetName": "PSC_Previous_Exam",
    "question": "1. For pairing Bluetooth devices, it needs :",
    "option_a": "Keyword",
    "option_b": "Keycode",
    "option_c": "Passcode",
    "option_d": "Password",
    "correct_answer": "C",
    "explanation": "Bluetooth pairing requires a Passcode (or PIN) to establish a secure link between devices.\n\n[മലയാളം]: ബ്ലൂടൂത്ത് ഉപകരണങ്ങൾ തമ്മിൽ സുരക്ഷിതമായി പെയർ (pair) ചെയ്യുന്നതിനായി Passcode (അല്ലെങ്കിൽ PIN) ആണ് നൽകേണ്ടത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_002",
    "sheetName": "PSC_Previous_Exam",
    "question": "2. Name the electronic component used in second generation computer?",
    "option_a": "Transistors",
    "option_b": "Vacuum tubes",
    "option_c": "Large scale integrated circuits",
    "option_d": "Small scale integrated circuits",
    "correct_answer": "A",
    "explanation": "Second generation computers (1956-1963) replaced vacuum tubes with Transistors.\n\n[മലയാളം]: രണ്ടാം തലമുറ (2nd Generation) കമ്പ്യൂട്ടറുകളിൽ വാക്വം ട്യൂബുകൾക്ക് പകരമായി ട്രാൻസിസ്റ്ററുകൾ (Transistors) ആണ് ഉപയോഗിച്ചിരുന്നത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_003",
    "sheetName": "PSC_Previous_Exam",
    "question": "3. VGA connector is used to connect :",
    "option_a": "Printer",
    "option_b": "Monitor",
    "option_c": "Speaker",
    "option_d": "Keyboard",
    "correct_answer": "B",
    "explanation": "VGA (Video Graphics Array, 15-pin D-sub) connector is used to connect a Monitor to the computer.\n\n[മലയാളം]: മോണിറ്ററിലേക്ക് (Display) വീഡിയോ സിഗ്നലുകൾ എത്തിക്കുന്നതിനാണ് VGA (Video Graphics Array) കണക്ടർ ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_004",
    "sheetName": "PSC_Previous_Exam",
    "question": "4. The internal power supply of a CPU is referred as :",
    "option_a": "CVT",
    "option_b": "UPS",
    "option_c": "SMPS",
    "option_d": "Stabilizer",
    "correct_answer": "C",
    "explanation": "SMPS (Switched-Mode Power Supply) provides DC power to internal motherboard and CPU components.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ആന്തരിക ഭാഗങ്ങൾക്ക് ആവശ്യമായ DC വൈദ്യുതി നൽകുന്നത് SMPS (Switched-Mode Power Supply) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_005",
    "sheetName": "PSC_Previous_Exam",
    "question": "5. A computer program that converts an entire program into machine language at one time is called as a/an :",
    "option_a": "Interpreter",
    "option_b": "CPU",
    "option_c": "Compiler",
    "option_d": "Simulator",
    "correct_answer": "C",
    "explanation": "A Compiler converts the entire high-level source code into machine language at once, whereas an Interpreter translates line-by-line.\n\n[മലയാളം]: ഒരു ഹൈ-ലെവൽ പ്രോഗ്രാമിനെ ഒരൊറ്റ ഘട്ടത്തിൽ മുഴുവനായി മെഷീൻ ലാംഗ്വേജിലേക്ക് മാറ്റുന്ന പ്രോഗ്രാമാണ് കമ്പൈലർ (Compiler). വരിവരിയായി മാറ്റുന്നത് ഇന്റർപ്രെറ്ററാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_006",
    "sheetName": "PSC_Previous_Exam",
    "question": "6. Windows OS is a product of :",
    "option_a": "IBM",
    "option_b": "Apple",
    "option_c": "Google",
    "option_d": "Microsoft",
    "correct_answer": "D",
    "explanation": "Microsoft developed the Windows operating system.\n\n[മലയാളം]: വിൻഡോസ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റം നിർമ്മിച്ചത് മൈക്രോസോഫ്റ്റ് (Microsoft) കമ്പനിയാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_007",
    "sheetName": "PSC_Previous_Exam",
    "question": "7. What is the shortcut key to open file explorer?",
    "option_a": "Windows button + E",
    "option_b": "Alt + E",
    "option_c": "Shift + E",
    "option_d": "Ctrl + E",
    "correct_answer": "A",
    "explanation": "Windows key + E is the global keyboard shortcut to launch Windows File Explorer.\n\n[മലയാളം]: വിൻഡോസ് ഫയൽ എക്സ്പ്ലോറർ തുറക്കാനുള്ള കീബോർഡ് ഷോർട്ട്കട്ട് Windows Key + E ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_008",
    "sheetName": "PSC_Previous_Exam",
    "question": "8. Which combination of key is used to switch between all running apps?",
    "option_a": "Shift + Tab",
    "option_b": "Alt + Tab",
    "option_c": "Ctrl + Tab",
    "option_d": "Tab",
    "correct_answer": "B",
    "explanation": "Alt + Tab is used to quickly switch between open/running applications in Windows.\n\n[മലയാളം]: തുറന്നിരിക്കുന്ന ആപ്ലിക്കേഷനുകൾക്കിടയിൽ വേഗത്തിൽ മാറുവാൻ Alt + Tab കീ ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_009",
    "sheetName": "PSC_Previous_Exam",
    "question": "9. Which process determines the amount of memory present, the date/time, and which communications ports and display adapters are installed in a micro computer?",
    "option_a": "Start-up utility test",
    "option_b": "Power on self test",
    "option_c": "Power up boot process",
    "option_d": "Power on startup process",
    "correct_answer": "B",
    "explanation": "POST (Power-On Self-Test) executed by the BIOS checks and verifies RAM, ports, display adapters, and critical hardware upon boot.\n\n[മലയാളം]: കമ്പ്യൂട്ടർ ഓൺ ചെയ്യുമ്പോൾ മെമ്മറി, പോർട്ടുകൾ, ഡിസ്പ്ലേ തുടങ്ങിയ ഹാർഡ്‌വെയറുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുന്നത് POST (Power-On Self-Test) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_010",
    "sheetName": "PSC_Previous_Exam",
    "question": "10. Which printer uses dry ink toner?",
    "option_a": "Laser",
    "option_b": "Drum",
    "option_c": "Inkjet",
    "option_d": "Dot matrix",
    "correct_answer": "A",
    "explanation": "Laser printers use fine dry powder toner to print text and images on paper via electrostatic drum.\n\n[മലയാളം]: ഡ്രൈ ഇങ്ക് ടോണർ (Dry Ink Toner) പൗഡർ ഉപയോഗിച്ച് പ്രിന്റ് ചെയ്യുന്നത് ലേസർ പ്രിന്ററുകളാണ് (Laser Printers).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_011",
    "sheetName": "PSC_Previous_Exam",
    "question": "11. What are the functions of MODEM?\n(i) Analog Signal to Digital Signal\n(ii) Digital Signal to Analog Signal\n(iii) Analog Signal to Analog Signal\n(iv) Digital Signal to Digital Signal",
    "option_a": "Both (i) and (ii)",
    "option_b": "(i) only",
    "option_c": "(iii) only",
    "option_d": "Both (iv) and (iii)",
    "correct_answer": "A",
    "explanation": "MODEM (Modulator-Demodulator) modulates Digital to Analog signals and demodulates Analog to Digital signals.\n\n[മലയാളം]: മോഡം (MODEM) ഡിജിറ്റൽ സിഗ്നലുകളെ അനലോഗായും (Modulation), അനലോഗ് സിഗ്നലുകളെ തിരികെ ഡിജിറ്റലായും (Demodulation) മാറ്റുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_012",
    "sheetName": "PSC_Previous_Exam",
    "question": "12. Basic working principle of Fiber Optics :",
    "option_a": "Reflection",
    "option_b": "Total internal reflection",
    "option_c": "Refraction",
    "option_d": "Resistance",
    "correct_answer": "B",
    "explanation": "Optical fiber cables transmit light signals using the principle of Total Internal Reflection (TIR).\n\n[മലയാളം]: ഒപ്റ്റിക്കൽ ഫൈബർ കേബിളുകൾ പ്രകാശ സിഗ്നലുകൾ കടത്തിവിടുന്നത് പൂർണ്ണാന്തര പ്രതിഫലനം (Total Internal Reflection) എന്ന തത്വം വഴിയാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_013",
    "sheetName": "PSC_Previous_Exam",
    "question": "13. What is the explanation of SNMP?",
    "option_a": "Simplex Network Management Protocol",
    "option_b": "Simple Network Management Protocol",
    "option_c": "Simple Network Messaging Protocol",
    "option_d": "Simple Network Mailing Protocol",
    "correct_answer": "B",
    "explanation": "SNMP stands for Simple Network Management Protocol (used to monitor network devices, port 161).\n\n[മലയാളം]: SNMP-യുടെ പൂർണ്ണരൂപം Simple Network Management Protocol എന്നാണ് (നെറ്റ്‌വർക്ക് ഉപകരണങ്ങൾ നിരീക്ഷിക്കാൻ ഉപയോഗിക്കുന്നു).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_014",
    "sheetName": "PSC_Previous_Exam",
    "question": "14. Choose the true statement/statements about IPv6 :\n(i) IPv6 address have a size of 128 bits\n(ii) Helps in routing the data packets\n(iii) Helps in Unicasting\n(iv) Helps to convert analog to digital",
    "option_a": "(i) and (iv) only",
    "option_b": "(ii) and (iii) only",
    "option_c": "(i), (ii) and (iii) only",
    "option_d": "All of the above",
    "correct_answer": "C",
    "explanation": "IPv6 uses 128-bit addresses, supports unicast/anycast/multicast routing of packets. It does not perform analog to digital conversion.\n\n[മലയാളം]: IPv6 അഡ്രസ്സ് 128 ബിറ്റ് വലിപ്പമുള്ളതാണ്, പാക്കറ്റ് റൂട്ടിംഗിനും യൂണികാസ്റ്റിംഗിനും സഹായിക്കുന്നു. അനലോഗ്-ഡിജിറ്റൽ കൺവേർഷൻ ചെയ്യില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_015",
    "sheetName": "PSC_Previous_Exam",
    "question": "15. Maximum number of devices connected to Bluetooth :",
    "option_a": "8",
    "option_b": "4",
    "option_c": "2",
    "option_d": "3",
    "correct_answer": "A",
    "explanation": "A standard Bluetooth piconet can connect a maximum of 8 devices (1 master and 7 active slaves).\n\n[മലയാളം]: ഒരു ബ്ലൂടൂത്ത് പൈക്കോനെറ്റിൽ (Piconet) പരമാവധി 8 ഉപകരണങ്ങൾ കണക്ട് ചെയ്യാം (1 മാസ്റ്ററും 7 സ്ലേവുകളും).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_016",
    "sheetName": "PSC_Previous_Exam",
    "question": "16. Number of pins in RJ45 :",
    "option_a": "6",
    "option_b": "3",
    "option_c": "8",
    "option_d": "1",
    "correct_answer": "C",
    "explanation": "An RJ45 modular connector used for Ethernet cables has 8 pins (8P8C).\n\n[മലയാളം]: ഇതർനെറ്റ് നെറ്റ്വർക്കിംഗിനായി ഉപയോഗിക്കുന്ന RJ45 കണക്ടറിൽ 8 പിന്നുകൾ (8 Pins) ഉണ്ട്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_017",
    "sheetName": "PSC_Previous_Exam",
    "question": "17. The first network to implement the TCP/IP :",
    "option_a": "Arpanet",
    "option_b": "Ethernet",
    "option_c": "Wi-fi",
    "option_d": "Infrared",
    "correct_answer": "A",
    "explanation": "ARPANET officially adopted the TCP/IP protocol suite on January 1, 1983.\n\n[മലയാളം]: ആദ്യമായി TCP/IP പ്രോട്ടോക്കോൾ നടപ്പിലാക്കിയ നെറ്റ്‌വർക്ക് ARPANET ആണ് (1983 ജനുവരി 1).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_018",
    "sheetName": "PSC_Previous_Exam",
    "question": "18. Network device to translate one protocol into the other protocol is :",
    "option_a": "Gateway",
    "option_b": "Modem",
    "option_c": "Switch",
    "option_d": "Repeater",
    "correct_answer": "A",
    "explanation": "A Gateway is a network node that joins two networks using different transmission protocols.\n\n[മലയാളം]: വ്യത്യസ്ത പ്രോട്ടോക്കോളുകൾ ഉപയോഗിക്കുന്ന നെറ്റ്‌വർക്കുകൾ തമ്മിൽ പരസ്പരം വിവർത്തനം ചെയ്ത് ബന്ധിപ്പിക്കുന്ന ഉപകരണം ഗേറ്റ്‌വേ (Gateway) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_019",
    "sheetName": "PSC_Previous_Exam",
    "question": "19. Harmful software which can have unauthorized access to systems or cause damage?",
    "option_a": "Phishing",
    "option_b": "Snooping",
    "option_c": "Denial of Service",
    "option_d": "Malware",
    "correct_answer": "D",
    "explanation": "Malware (Malicious Software) includes viruses, worms, trojans, ransomware designed to damage or gain unauthorized access to computer systems.\n\n[മലയാളം]: കമ്പ്യൂട്ടറുകളിൽ അനധികൃതമായി കടന്നുകൂടി നാശനഷ്ടം വരുത്തുന്ന പ്രോഗ്രാമുകളെ പൊതുവായി മാൽവെയർ (Malware) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_020",
    "sheetName": "PSC_Previous_Exam",
    "question": "20. POP stands for :",
    "option_a": "Post Open Protocol",
    "option_b": "Post Office Program",
    "option_c": "Post Organized Protocol",
    "option_d": "Post Office Protocol",
    "correct_answer": "D",
    "explanation": "POP stands for Post Office Protocol (commonly POP3, port 110), used for retrieving incoming emails from a mail server.\n\n[മലയാളം]: ഇമെയിൽ സെർവറിൽ നിന്ന് മെയിലുകൾ ഡൗൺലോഡ് ചെയ്ത് വായിക്കാൻ ഉപയോഗിക്കുന്ന POP-യുടെ പൂർണ്ണരൂപം Post Office Protocol എന്നാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_021",
    "sheetName": "PSC_Previous_Exam",
    "question": "21. Which of the following is the correct format to add multiline comment in python?",
    "option_a": "“comment”",
    "option_b": "“”comment””",
    "option_c": "“””comment”””",
    "option_d": "#comment#",
    "correct_answer": "C",
    "explanation": "In Python, multiline comments or docstrings are enclosed in triple quotes (''' or \"\"\").\n\n[മലയാളം]: പൈത്തണിൽ ഒന്നിലധികം വരികളുള്ള കമന്റുകൾ (Multiline comments) നൽകാൻ ട്രിപ്പിൾ കൊട്ടേഷൻ (\"\"\" അല്ലെങ്കിൽ ''') ആണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_022",
    "sheetName": "PSC_Previous_Exam",
    "question": "22. Which is the exponent operator in python?",
    "option_a": "*",
    "option_b": "**",
    "option_c": "∧",
    "option_d": "%",
    "correct_answer": "B",
    "explanation": "In Python, ** is the power/exponent operator (e.g. 2 ** 3 = 8).\n\n[മലയാളം]: പൈത്തണിൽ എക്സ്പോണന്റ് (പവർ - ഘാതം) കണക്കാക്കാനുള്ള ഓപ്പറേറ്റർ ** ആണ് (ഉദാ: 2 ** 3 = 8).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_023",
    "sheetName": "PSC_Previous_Exam",
    "question": "23. Which of the following is a python tuple?",
    "option_a": "{ }",
    "option_b": "{10, 11, 12}",
    "option_c": "[10, 11, 12]",
    "option_d": "(10, 11, 12)",
    "correct_answer": "D",
    "explanation": "In Python, Tuples are enclosed in parentheses (), lists in [], sets/dicts in {}.\n\n[മലയാളം]: പൈത്തണിൽ ട്യൂപ്പിൾ (Tuple) പരാൻതീസിസിൽ (10, 11, 12) ആണ് സൂചിപ്പിക്കുന്നത്. സ്ക്വയർ ബ്രാക്കറ്റ് ലിസ്റ്റും, കർലി ബ്രാക്കറ്റ് സെറ്റും ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_024",
    "sheetName": "PSC_Previous_Exam",
    "question": "24. Which of the following statement is/are correct?\n(i) a, b, c = ”apple”, ”berry”, ”grapes”\n(ii) a = b = c = ”apple”\n(iii) a = ”apple”\n(iv) a = b = c = ’apple’",
    "option_a": "Only (i) and (ii)",
    "option_b": "Only (ii) and (iii)",
    "option_c": "(i), (ii), (iii) and (iv)",
    "option_d": "Only (i)",
    "correct_answer": "C",
    "explanation": "In Python, multiple assignment, chained assignment, single quotes, and double quotes are all valid syntax.\n\n[മലയാളം]: പൈത്തണിൽ മൾട്ടിപ്പിൾ അസൈൻമെന്റും സിംഗിൾ/ഡബിൾ കൊട്ടേഷനുകളും എല്ലാം അനുവദനീയമായ ശരിയായ സ്റ്റേറ്റ്മെന്റുകളാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_025",
    "sheetName": "PSC_Previous_Exam",
    "question": "25. What is the output of following code snippet?\nPrint ((eval(“ ‘py’ * 5”))",
    "option_a": "py py py py py",
    "option_b": "py5",
    "option_c": "5py",
    "option_d": "py*5",
    "correct_answer": "A",
    "explanation": "String replication replicates the string 5 times (PSC key confirmed A).\n\n[മലയാളം]: 'py' * 5 എന്നത് സ്ട്രിംഗിനെ 5 തവണ ആവർത്തിക്കുന്നു (PSC ഉത്തരസൂചിക പ്രകാരം Option A).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_026",
    "sheetName": "PSC_Previous_Exam",
    "question": "26. ——————— method searches for a specified string and splits the string into a tuple containing three elements.",
    "option_a": "Partition",
    "option_b": "Rpartition",
    "option_c": "Lpartition",
    "option_d": "Split",
    "correct_answer": "A",
    "explanation": "In Python, partition() splits a string at the first occurrence of separator into a 3-element tuple (head, sep, tail).\n\n[മലയാളം]: പൈത്തണിലെ partition() മെത്തേഡ് ഒരു സ്ട്രിംഗിനെ വേർതിരിച്ച് 3 എലമെന്റുകളുള്ള ഒരു ട്യൂപ്പിൾ ആയി മാറ്റുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_027",
    "sheetName": "PSC_Previous_Exam",
    "question": "27. Which of the following is a user defined data type in python?",
    "option_a": "List",
    "option_b": "Tuples",
    "option_c": "Dictionary",
    "option_d": "Class",
    "correct_answer": "D",
    "explanation": "In object-oriented Python, a 'Class' is a user-defined prototype / data type.\n\n[മലയാളം]: പൈത്തണിൽ ഉപയോക്താവ് നിർമ്മിക്കുന്ന ഡാറ്റാ ടൈപ്പ് (User Defined Data Type) ആണ് ക്ലാസ് (Class).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_028",
    "sheetName": "PSC_Previous_Exam",
    "question": "28. Which of the following is used to create an empty set in python?",
    "option_a": "set( )",
    "option_b": "set{ }",
    "option_c": "set[ ]",
    "option_d": "( )",
    "correct_answer": "A",
    "explanation": "In Python, an empty set is created using set(), because {} creates an empty dictionary.\n\n[മലയാളം]: പൈത്തണിൽ എംപ്റ്റി സെറ്റ് (Empty Set) നിർമ്മിക്കാൻ set() ആണ് ഉപയോഗിക്കുന്നത്. കാരണം {} എന്നത് എംപ്റ്റി ഡിക്ഷണറി ആയി മാറും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_029",
    "sheetName": "PSC_Previous_Exam",
    "question": "29. What will be the output of following python code?\na = 2\nb = 5\nprint (a, b)\na, b = b, a\nprint (a, b)",
    "option_a": "25 52",
    "option_b": "25 25",
    "option_c": "52 52",
    "option_d": "52 25",
    "correct_answer": "A",
    "explanation": "Initially a=2, b=5 (output 2 5). Then a,b = b,a swaps them to a=5, b=2 (output 5 2).\n\n[മലയാളം]: ആദ്യം 2 5 എന്ന് പ്രിന്റ് ചെയ്യുന്നു, സ്വാപ്പിംഗിന് ശേഷം a=5, b=2 ആയി മാറുന്നതിനാൽ 5 2 എന്നും പ്രിന്റ് ചെയ്യുന്നു (25 52).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_030",
    "sheetName": "PSC_Previous_Exam",
    "question": "30. What do we use to define a block of code in python?",
    "option_a": "Key",
    "option_b": "Brackets",
    "option_c": "Block",
    "option_d": "Indentation",
    "correct_answer": "D",
    "explanation": "Python uses Indentation (whitespace/tabs) instead of curly brackets {} to delimit blocks of code.\n\n[മലയാളം]: മറ്റു പ്രോഗ്രാമിംഗ് ഭാഷകളിലെ പോലെ ബ്രാക്കറ്റുകൾക്ക് പകരമായി പൈത്തണിൽ കോഡ് ബ്ലോക്കുകൾ നിർണ്ണയിക്കുന്നത് ഇൻഡെന്റേഷൻ (Indentation) വഴിയാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_031",
    "sheetName": "PSC_Previous_Exam",
    "question": "31. DCL stands for :",
    "option_a": "Data Consistency Language",
    "option_b": "Data Configuration Language",
    "option_c": "Data Control Language",
    "option_d": "Database Control Language",
    "correct_answer": "C",
    "explanation": "DCL stands for Data Control Language (includes GRANT and REVOKE commands for managing permissions).\n\n[മലയാളം]: SQL-ൽ ഡാറ്റാബേസ് അനുമതികൾ നിയന്ത്രിക്കുന്ന DCL-ന്റെ പൂർണ്ണരൂപം Data Control Language (GRANT, REVOKE) എന്നാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_032",
    "sheetName": "PSC_Previous_Exam",
    "question": "32. In relational model tables are also known as :",
    "option_a": "Tuples",
    "option_b": "Relations",
    "option_c": "Schema",
    "option_d": "Structures",
    "correct_answer": "B",
    "explanation": "In relational database theory (RDBMS), a table is formally called a Relation, rows are Tuples, columns are Attributes.\n\n[മലയാളം]: റിലേഷണൽ മോഡലിൽ ടേബിളുകൾക്ക് (Tables) നൽകിയിരിക്കുന്ന പേര് റിലേഷൻസ് (Relations) എന്നാണ്. വരികളെ ട്യൂപ്പിൾസ് (Tuples) എന്നും കോളങ്ങളെ ആട്രിബ്യൂട്ട്സ് (Attributes) എന്നും വിളിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_033",
    "sheetName": "PSC_Previous_Exam",
    "question": "33. ——————— property of transaction ensures that multiple transactions can occur independently without interference.",
    "option_a": "Consistency",
    "option_b": "Isolation",
    "option_c": "Durability",
    "option_d": "Atomicity",
    "correct_answer": "B",
    "explanation": "In ACID properties, 'Isolation' ensures that concurrent transactions execute independently without interfering with each other.\n\n[മലയാളം]: ഡാറ്റാബേസ് ട്രാൻസാക്ഷനിലെ ACID തത്വങ്ങളിൽ ഒന്നിലധികം ഇടപാടുകൾ പരസ്പരം തടസ്സമില്ലാതെ സ്വതന്ത്രമായി നടക്കാൻ സഹായിക്കുന്നത് ഐസൊലേഷൻ (Isolation) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_034",
    "sheetName": "PSC_Previous_Exam",
    "question": "34. Which of the following statement is/are correct about keys in MySql?\n(i) A foreign key is a field (or collection of fields) in one table that refers to the primary key in another table\n(ii) There will be more than one primary key in one table.\n(iii) A table can have multiple foreign keys\n(iv) A table can have multiple candidate keys, but can only have one primary key.",
    "option_a": "(i) and (ii)",
    "option_b": "Only (i), (iii) and (iv)",
    "option_c": "Only (i) and (iv)",
    "option_d": "All of above (i), (ii), (iii) and (iv)",
    "correct_answer": "B",
    "explanation": "Statement (ii) is false because a table can have only one Primary Key. Statements (i), (iii), and (iv) are correct.\n\n[മലയാളം]: ഒരു ടേബിളിൽ ഒരു പ്രൈമറി കീ മാത്രമേ ഉണ്ടാകൂ, എന്നാൽ ഒന്നിലധികം ഫോറിൻ കീകളും കാൻഡിഡേറ്റ് കീകളും ഉണ്ടാകാം. അതിനാൽ (i), (iii), (iv) എന്നിവ ശരിയാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_035",
    "sheetName": "PSC_Previous_Exam",
    "question": "35. Which is the correct syntax to create a stored procedure?",
    "option_a": "CREATE PROCEDURE procedure_name AS sql_statement GO;",
    "option_b": "CREATE STOREDPROCEDURE procedure_name AS sql_statement GO;",
    "option_c": "CREATE PROCEDURE procedure_name AS sql_statement START;",
    "option_d": "CREATE PROCEDURE procedure_name sql_statement GO;",
    "correct_answer": "A",
    "explanation": "The standard SQL syntax for creating a stored procedure is 'CREATE PROCEDURE procedure_name AS sql_statement GO;'.\n\n[മലയാളം]: സ്റ്റോർഡ് പ്രൊസീജിയർ ഉണ്ടാക്കുന്നതിനുള്ള ശരിയായ സിന്റാക്സ് CREATE PROCEDURE procedure_name AS sql_statement GO; എന്നാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_036",
    "sheetName": "PSC_Previous_Exam",
    "question": "36. A ——————— is basically a program which gets automatically executed in response to some events such as modification in the database.",
    "option_a": "Cursor",
    "option_b": "Method",
    "option_c": "Trigger",
    "option_d": "Action",
    "correct_answer": "C",
    "explanation": "A database Trigger automatically executes in response to certain events (INSERT, UPDATE, DELETE) on a specified table.\n\n[മലയാളം]: ഡാറ്റാബേസിൽ ഡാറ്റ മാറ്റപ്പെടുമ്പോൾ (INSERT, UPDATE, DELETE) തനിയെ എക്സിക്യൂട്ട് ആകുന്ന സ്പെഷ്യൽ പ്രോഗ്രാമാണ് ട്രിഗർ (Trigger).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_037",
    "sheetName": "PSC_Previous_Exam",
    "question": "37. A table that displays data redundancies yields ——————— anomalies.",
    "option_a": "Insertion",
    "option_b": "Deletion",
    "option_c": "Update",
    "option_d": "All of the above",
    "correct_answer": "A",
    "explanation": "Data redundancy causes update, insertion, and deletion anomalies (Official PSC answer key gives A).\n\n[മലയാളം]: ഡാറ്റാബേസിൽ വിവരങ്ങൾ അനാവശ്യമായി ആവർത്തിക്കുമ്പോൾ (Redundancy) ഉണ്ടാകുന്ന തകരാറുകളാണ് അനോമലികൾ (PSC ഉത്തരസൂചിക പ്രകാരം Option A).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_038",
    "sheetName": "PSC_Previous_Exam",
    "question": "38. Which of the following statements creates a new table ‘skilledworker’ that has the same schema as ‘worker’?",
    "option_a": "create table skilledworker;",
    "option_b": "Create table skilledworker like worker;",
    "option_c": "Create Table skilledworker as worker;",
    "option_d": "Create table like skilledworker;",
    "correct_answer": "B",
    "explanation": "The SQL syntax 'CREATE TABLE new_table LIKE original_table;' copies the schema without data.\n\n[മലയാളം]: ഒരു ടേബിളിന്റെ അതേ സ്ട്രക്ചറിൽ പുതിയൊരു ടേബിൾ നിർമ്മിക്കാൻ 'CREATE TABLE skilledworker LIKE worker;' എന്ന് നൽകുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_039",
    "sheetName": "PSC_Previous_Exam",
    "question": "39. Which is right statement to insert multiple records?",
    "option_a": "INSERT INTO TABLENAME VALUES (‘col1’, ‘col2’), (‘col1’, ‘col2’),...",
    "option_b": "INSERT INTO TABLENAME VALUES (‘col1’, ‘col2’), VALUES (‘col1’, ‘col2’),...",
    "option_c": "INSERT INTO VALUES OF TABLENAME (‘col1’, ‘col2’), (‘col1’, ‘col2’),...",
    "option_d": "INSERT INTO TABLENAME VALUES (‘col1’, ‘col2’), TABLENAME VALUES (‘col1’, ‘col2’),...",
    "correct_answer": "A",
    "explanation": "Multiple rows are inserted using comma-separated value tuples: INSERT INTO table VALUES (...), (...);\n\n[മലയാളം]: ഒന്നിലധികം റെക്കോർഡുകൾ ഒന്നിച്ച് ചേർക്കാൻ INSERT INTO TABLENAME VALUES ('col1', 'col2'), ('col1', 'col2')... എന്ന രീതി ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_040",
    "sheetName": "PSC_Previous_Exam",
    "question": "40. Which join is to be used between two tables A and B when the resultant table needs rows from A and B that matches the condition and rows from A that does not match the condition?",
    "option_a": "Inner Join",
    "option_b": "Cross Join",
    "option_c": "Outer Join",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "A Left Outer Join returns all matched rows plus unmatched rows from table A.\n\n[മലയാളം]: ടേബിൾ A-യിലെ മുഴുവൻ വരികളും ഒപ്പം ടേബിൾ B-യിലെ മാച്ച് ആകുന്ന വരികളും മാത്രം ലഭിക്കാൻ ലെഫ്റ്റ് ഔട്ടർ ജോയിൻ (Outer Join) ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_041",
    "sheetName": "PSC_Previous_Exam",
    "question": "41. Which interface is used to declare core methods in java?",
    "option_a": "Comparator",
    "option_b": "Event listener",
    "option_c": "Set",
    "option_d": "Collection",
    "correct_answer": "D",
    "explanation": "The Collection interface is the root interface in the collection hierarchy defining core collection methods.\n\n[മലയാളം]: ജാവയിലെ കളക്ഷൻ ഫ്രെയിംവർക്കിൽ പ്രധാന മെത്തേഡുകൾ ഡിക്ലയർ ചെയ്തിരിക്കുന്ന റൂട്ട് ഇന്റർഫേസ് Collection ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_042",
    "sheetName": "PSC_Previous_Exam",
    "question": "42. What is the output of following code?\nClass main{\nPublic static void main(String[ ] args){\nboolean flag;\nSystem.out.println(flag);\n}\n}",
    "option_a": "True",
    "option_b": "False",
    "option_c": "It will display an error message",
    "option_d": "1",
    "correct_answer": "C",
    "explanation": "Local variables in Java are not initialized with default values, so attempting to use an uninitialized local variable causes a compile error.\n\n[മലയാളം]: ജാവയിൽ മെത്തേഡിനുള്ളിലെ ലോക്കൽ വേരിയബിളുകൾക്ക് ഡിഫോൾട്ട് വാല്യൂ ലഭിക്കില്ല; ഇനിഷ്യലൈസ് ചെയ്യാതെ പ്രിന്റ് ചെയ്യാൻ ശ്രമിച്ചാൽ കമ്പൈൽ എറർ വരും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_043",
    "sheetName": "PSC_Previous_Exam",
    "question": "43. What will be the output of following code?\nClass Main {\npublic static void main(String[ ] args) {\nSystem.out.println(9.0/2);\nSystem.out.println(9/2);\nSystem.out.println(9.0/2.0);\nSystem.out.println(9/2.0);\n}\n}",
    "option_a": "4.5\n4\n4.5\n4.5",
    "option_b": "4\n5\n4.5\n4.5",
    "option_c": "4.5\n4.5\n4.5\n4.5",
    "option_d": "4\n4\n4.5\n4",
    "correct_answer": "A",
    "explanation": "9.0/2 = 4.5 (floating division), 9/2 = 4 (integer truncation), 9.0/2.0 = 4.5, 9/2.0 = 4.5.\n\n[മലയാളം]: പൂർണ്ണസംഖ്യകൾ തമ്മിൽ ഹരിക്കുമ്പോൾ (9/2) ദശാംശം ഇല്ലാതെ 4 ലഭിക്കും, എന്നാൽ ഫ്ലോട്ടിംഗ് പോയിന്റ് ഹരണത്തിൽ 4.5 ലഭിക്കും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_044",
    "sheetName": "PSC_Previous_Exam",
    "question": "44. A thread is said to ——————— when it is prevented from entering into the runnable state and subsequently the running state.",
    "option_a": "Dead",
    "option_b": "Blocked",
    "option_c": "Runnable",
    "option_d": "Stopped",
    "correct_answer": "B",
    "explanation": "A thread in Java is in the Blocked/Waiting state when it is waiting for a monitor lock or I/O operation.\n\n[മലയാളം]: ജാവയിൽ ഒരു ത്രെഡിന് റണ്ണബിൾ സ്റ്റേറ്റിലേക്ക് കടക്കാൻ കഴിയാതെ തടസ്സപ്പെടുന്ന അവസ്ഥയെ ബ്ലോക്ക്ഡ് (Blocked) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_045",
    "sheetName": "PSC_Previous_Exam",
    "question": "45. Which exception is thrown when Java is out of memory?",
    "option_a": "Memory Error",
    "option_b": "Out Of Memory Error",
    "option_c": "Memory out Of Bounds Exception",
    "option_d": "Memory Full Exception",
    "correct_answer": "B",
    "explanation": "java.lang.OutOfMemoryError is thrown when JVM cannot allocate an object due to insufficient heap memory.\n\n[മലയാളം]: JVM-ൽ ആവശ്യമായ ഹീപ്പ് മെമ്മറി ഇല്ലാതെ വരുമ്പോൾ ഉണ്ടാകുന്ന എററാണ് Out Of Memory Error (java.lang.OutOfMemoryError).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_046",
    "sheetName": "PSC_Previous_Exam",
    "question": "46. What will be the output of following code?\nPublic Class Solution\n{\nPublic static void main(String[ ] args){\nShort x = 10;\nx = x * 10;\nSystem.out.print(x);\n}\n}",
    "option_a": "50",
    "option_b": "Compile error",
    "option_c": "Exception",
    "option_d": "10",
    "correct_answer": "B",
    "explanation": "In Java, arithmetic expressions on byte and short are automatically promoted to int; assigning int to Short requires explicit cast, otherwise causes a compile error.\n\n[മലയാളം]: ജാവയിൽ short വേരിയബിളുകൾ ഗുണിക്കുമ്പോൾ ഫലം int ആയി മാറും; ഇതിനെ തിരികെ short-ലേക്ക് കാസ്റ്റ് ചെയ്യാതെ അസൈൻ ചെയ്യുന്നത് കമ്പൈൽ എററിന് കാരണമാകും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_047",
    "sheetName": "PSC_Previous_Exam",
    "question": "47. Automatic type conversion is possible in which of the possible cases?",
    "option_a": "Int to long",
    "option_b": "Long to int",
    "option_c": "Byte to int",
    "option_d": "Short to int",
    "correct_answer": "A",
    "explanation": "Widening primitive conversion (e.g. 32-bit int to 64-bit long) is performed automatically without cast (PSC key confirms A).\n\n[മലയാളം]: വലുപ്പം കുറഞ്ഞ ടൈപ്പിൽ നിന്ന് കൂടുതൽ വലുപ്പമുള്ള ടൈപ്പിലേക്ക് മാറ്റുന്ന Widening കൺവേർഷൻ (int to long) ഓട്ടോമാറ്റിക്കായി നടക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_048",
    "sheetName": "PSC_Previous_Exam",
    "question": "48. Which of the following is true about the keyword super?\n(i) Super may only be used within a subclass constructor method.\n(ii) The call to superclass constructor must appear as the first statement within the subclass constructor\n(iii) The parameters in the super call must match the order and type of the instance variable declared in the superclass.\n(iv) The keyword sup can be used instead of the keyword super.",
    "option_a": "Only (i), (ii) and (iv)",
    "option_b": "Only (i) and (ii)",
    "option_c": "Only (i), (ii) and (iii)",
    "option_d": "All of above",
    "correct_answer": "C",
    "explanation": "Statements (i), (ii), and (iii) describe super() constructor behavior (Official PSC answer key gives C).\n\n[മലയാളം]: സൂപ്പർക്ലാസ് കൺസ്ട്രക്ടറെ വിളിക്കാൻ ഉപയോഗിക്കുന്ന super() സബ്ക്ലാസ് കൺസ്ട്രക്ടറിന്റെ ആദ്യത്തെ വരിയായിരിക്കണം.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_049",
    "sheetName": "PSC_Previous_Exam",
    "question": "49. What will be the output of following code in case of x = 20, x = 40, x = 70?\nsalary = (x ! = 40)?((x<40)?(4*x + 100) : (4.5 *x +100)) : 300;",
    "option_a": "180.0, 300.0, 415.0",
    "option_b": "300.0, 415.0, 180.0",
    "option_c": "300.0, 180.0, 415.0",
    "option_d": "180, 300, 415",
    "correct_answer": "A",
    "explanation": "For x=20: 4(20)+100 = 180.0; For x=40: condition is false, returns 300.0; For x=70: 4.5(70)+100 = 415.0.\n\n[മലയാളം]: x=20 ആകുമ്പോൾ 180.0, x=40 ആകുമ്പോൾ 300.0, x=70 ആകുമ്പോൾ 415.0 എന്ന് ലഭിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_050",
    "sheetName": "PSC_Previous_Exam",
    "question": "50. Which of the following statements is/are true about method overriding?\n(i) Implements “run time polymorphism”.\n(ii) Implements “compile time polymorphism”.\n(iii) Occurs between superclass and subclass.\n(iv) On error it can be caught at compile time.",
    "option_a": "Only (i) and (iii)",
    "option_b": "Only (ii) and (iii)",
    "option_c": "Only (i), (iii) and (iv)",
    "option_d": "None of above",
    "correct_answer": "A",
    "explanation": "Method overriding implements runtime (dynamic) polymorphism and occurs between a superclass and its subclass.\n\n[മലയാളം]: മെത്തേഡ് ഓവർറൈഡിംഗ് (Method Overriding) റൺടൈം പോളിമോർഫിസം സാധ്യമാക്കുന്നു, ഇത് സൂപ്പർക്ലാസും സബ്ക്ലാസും തമ്മിലാണ് നടക്കുന്നത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_051",
    "sheetName": "PSC_Previous_Exam",
    "question": "51. Which among the following are valid operators in JavaScript?\n(i) & =\n(ii) ! = =\n(iii) = = =\n(iv) ??=",
    "option_a": "(i) only",
    "option_b": "(i) and (iii) only",
    "option_c": "(i), (ii) and (iii) only",
    "option_d": "All of the above",
    "correct_answer": "D",
    "explanation": "In modern JavaScript, &= (bitwise AND assignment), !== (strict inequality), === (strict equality), and ??= (nullish coalescing assignment) are all valid operators.\n\n[മലയാളം]: ജാവാസ്ക്രിപ്റ്റിൽ &=, !==, ===, ??= എന്നിവയെല്ലാം സാധുവായ ഓപ്പറേറ്ററുകളാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_052",
    "sheetName": "PSC_Previous_Exam",
    "question": "52. Which among the following are valid popup boxes in JavaScript?\n(i) alert ( )\n(ii) prompt ( )\n(iii) msgbox ( )\n(iv) confirm ( )",
    "option_a": "(i) and (ii) only",
    "option_b": "(i) and (iii) only",
    "option_c": "(i), (ii) and (iv) only",
    "option_d": "All of the above",
    "correct_answer": "C",
    "explanation": "JavaScript has three popup boxes: alert(), prompt(), and confirm(). 'msgbox' belongs to VBScript.\n\n[മലയാളം]: ജാവാസ്ക്രിപ്റ്റിലെ പോപ്പ്-അപ്പ് ബോക്സുകൾ alert(), prompt(), confirm() എന്നിവയാണ്. msgbox വിബിസ്ക്രിപ്റ്റിലേതാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_053",
    "sheetName": "PSC_Previous_Exam",
    "question": "53. With the document object model, JavaScript can\n(i) Remove existing HTML\n(ii) Add new HTML elements and attributes\n(iii) React to all existing HTML events in the page\n(iv) Change all CSS styles in the page",
    "option_a": "(ii) and (iv) only",
    "option_b": "(i) and (iv) only",
    "option_c": "(ii), (iii) and (iv) only",
    "option_d": "All of the above",
    "correct_answer": "D",
    "explanation": "The DOM allows JavaScript full dynamic access to add, remove, and modify HTML elements, attributes, CSS styles, and event listeners.\n\n[മലയാളം]: DOM (Document Object Model) ഉപയോഗിച്ച് ജാവാസ്ക്രിപ്റ്റിന് HTML എലമെന്റുകൾ മാറ്റാനും ചേർക്കാനും ഇവന്റുകൾ നിയന്ത്രിക്കാനും CSS മാറ്റാനും കഴിയും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_054",
    "sheetName": "PSC_Previous_Exam",
    "question": "54. Which among the following is not a JavaScript keyword?",
    "option_a": "this",
    "option_b": "buffer",
    "option_c": "enum",
    "option_d": "export",
    "correct_answer": "B",
    "explanation": "'buffer' is a Node.js global class / API, not a reserved language keyword in JavaScript.\n\n[മലയാളം]: 'buffer' എന്നത് ജാവാസ്ക്രിപ്റ്റിലെ റിസർവ്ഡ് കീവേഡ് അല്ല (Node.js-ലെ ഗ്ലോബൽ ക്ലാസ്സ് ആണ്).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_055",
    "sheetName": "PSC_Previous_Exam",
    "question": "55. Which of the following are valid array methods in JavaScript?\n(i) join( )\n(ii) push( )\n(iii) pop( )\n(iv) shift( )",
    "option_a": "(ii) and (iii) only",
    "option_b": "(i) and (iv) only",
    "option_c": "All of the above",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "join(), push(), pop(), and shift() are all built-in JavaScript Array prototype methods.\n\n[മലയാളം]: join(), push(), pop(), shift() എന്നിവയെല്ലാം ജാവാസ്ക്രിപ്റ്റിലെ അറേ മെത്തേഡുകളാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_056",
    "sheetName": "PSC_Previous_Exam",
    "question": "56. Which error indicates that the value is outside the range of expected type?",
    "option_a": "Type Error",
    "option_b": "Range Error",
    "option_c": "Syntax Error",
    "option_d": "Eval Error",
    "correct_answer": "A",
    "explanation": "TypeError occurs when an operation is performed on an unexpected or wrong data type (Official key gives A).\n\n[മലയാളം]: പ്രതീക്ഷിക്കുന്ന ഡാറ്റാ ടൈപ്പിൽ അല്ലാതെ വരുന്ന വാല്യൂ മൂലമുണ്ടാകുന്ന തകരാറാണ് TypeError (PSC ഉത്തരസൂചിക പ്രകാരം Option A).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_057",
    "sheetName": "PSC_Previous_Exam",
    "question": "57. Which is the correct syntax for referring to an external script called “abc.js”?",
    "option_a": "<script href = “abc.js”",
    "option_b": "<script src = “abc.js”",
    "option_c": "<script name = “abc.js”",
    "option_d": "<script type = “abc.js”",
    "correct_answer": "B",
    "explanation": "External JavaScript files are linked via the 'src' attribute: <script src=\"abc.js\"></script>.\n\n[മലയാളം]: എക്സ്റ്റേണൽ ജാവാസ്ക്രിപ്റ്റ് ഫയൽ ലിങ്ക് ചെയ്യാൻ 'src' ആട്രിബ്യൂട്ട് ആണ് ഉപയോഗിക്കുന്നത്: <script src=\"abc.js\"></script>.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_058",
    "sheetName": "PSC_Previous_Exam",
    "question": "58. When we execute the following JavaScript code segment, what will be the output?\nvar sname;\nalert(sname)",
    "option_a": "NaN",
    "option_b": "sname",
    "option_c": "undefined",
    "option_d": "error",
    "correct_answer": "C",
    "explanation": "A declared JavaScript variable that has not been assigned a value defaults to 'undefined'.\n\n[മലയാളം]: ജാവാസ്ക്രിപ്റ്റിൽ വേരിയബിൾ ഡിക്ലയർ ചെയ്ത ശേഷം മൂല്യം (value) നൽകിയിട്ടില്ലെങ്കിൽ അതിന്റെ ഔട്ട്പുട്ട് 'undefined' ആയിരിക്കും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_059",
    "sheetName": "PSC_Previous_Exam",
    "question": "59. Which of the following methods can be used to display data in some form using JavaScript?",
    "option_a": "document.write( )",
    "option_b": "console.log( )",
    "option_c": "window.alert( )",
    "option_d": "all of the above",
    "correct_answer": "D",
    "explanation": "JavaScript can output data using document.write(), console.log(), window.alert(), and innerHTML.\n\n[മലയാളം]: ജാവാസ്ക്രിപ്റ്റിൽ വിവരങ്ങൾ കാണിക്കാൻ document.write(), console.log(), window.alert() എന്നിവയെല്ലാം ഉപയോഗിക്കാം.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_060",
    "sheetName": "PSC_Previous_Exam",
    "question": "60. In JavaScript, which method removes the last element from an array?",
    "option_a": "remove( )",
    "option_b": "push( )",
    "option_c": "pop( )",
    "option_d": "delete( )",
    "correct_answer": "C",
    "explanation": "The pop() method removes the last element from an array and returns that element.\n\n[മലയാളം]: ജാവാസ്ക്രിപ്റ്റിൽ അറേയുടെ ഏറ്റവും അവസാനത്തെ എലമെന്റിനെ ഒഴിവാക്കാൻ pop() മെത്തേഡ് ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_061",
    "sheetName": "PSC_Previous_Exam",
    "question": "61. In MS word, which technique is used to select the whole paragraph :",
    "option_a": "Ctrl + A",
    "option_b": "Single click within the paragraph",
    "option_c": "Double click within the paragraph",
    "option_d": "Triple click within the paragraph",
    "correct_answer": "D",
    "explanation": "Triple-clicking anywhere within a paragraph selects the entire paragraph in MS Word.\n\n[മലയാളം]: എം.എസ് വേർഡിൽ ഒരു പാരഗ്രാഫ് മുഴുവനായി സെലക്ട് ചെയ്യാൻ പാരഗ്രാഫിൽ ട്രിപ്പിൾ ക്ലിക്ക് (Triple Click) ചെയ്താൽ മതിയാകും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_062",
    "sheetName": "PSC_Previous_Exam",
    "question": "62. Which is the shortcut key to insert a hyperlink in MS Word?",
    "option_a": "Ctrl + K",
    "option_b": "Ctrl + L",
    "option_c": "Ctrl + H",
    "option_d": "Ctrl + S",
    "correct_answer": "A",
    "explanation": "Ctrl + K is the universal shortcut key to insert a Hyperlink in Microsoft Office applications.\n\n[മലയാളം]: എം.എസ് വേർഡിൽ ഹൈപ്പർലിങ്ക് (Hyperlink) ചേർക്കാനുള്ള കീബോർഡ് ഷോർട്ട്കട്ട് Ctrl + K ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_063",
    "sheetName": "PSC_Previous_Exam",
    "question": "63. Which of the following are valid minimum and maximum zoom sizes in MS Word?",
    "option_a": "10, 100",
    "option_b": "10, 500",
    "option_c": "20, 200",
    "option_d": "20, 500",
    "correct_answer": "B",
    "explanation": "In Microsoft Word, the minimum zoom is 10% and the maximum zoom is 500%.\n\n[മലയാളം]: എം.എസ് വേർഡിലെ ഏറ്റവും കുറഞ്ഞ സൂം 10% ഉം, ഏറ്റവും കൂടിയ സൂം 500% ഉം ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_064",
    "sheetName": "PSC_Previous_Exam",
    "question": "64. Which of the following is not true regarding conditional formatting?",
    "option_a": "You can add more than one condition to check",
    "option_b": "You can set condition to look for Bold and apply Italics on them",
    "option_c": "You can apply Font, Border and pattern formats that meets the specified conditions",
    "option_d": "You can delete any condition from Conditional Formatting Dialog Box if it is not required",
    "correct_answer": "B",
    "explanation": "Conditional formatting evaluates cell values or formulas, not formatting attributes like existing bold to apply italics.\n\n[മലയാളം]: സെല്ലുകളിലെ മൂല്യങ്ങൾ (values) അടിസ്ഥാനമാക്കിയാണ് കണ്ടീഷണൽ ഫോർമാറ്റിംഗ് പ്രവർത്തിക്കുന്നത്; ഫോർമാറ്റ് നോക്കി ഫോർമാറ്റ് മാറ്റാൻ കഴിയില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_065",
    "sheetName": "PSC_Previous_Exam",
    "question": "65. Which dialog box allows you to change a field name in a PivotTable?",
    "option_a": "Field Options",
    "option_b": "Field Pane",
    "option_c": "Field Settings",
    "option_d": "Field Structure",
    "correct_answer": "C",
    "explanation": "Value Field Settings / Field Settings dialog box in Excel allows renaming and customizing PivotTable fields.\n\n[മലയാളം]: പിവറ്റ് ടേബിളിലെ ഫീൽഡ് നാമം മാറ്റാൻ Field Settings ഡയലോഗ് ബോക്സ് ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_066",
    "sheetName": "PSC_Previous_Exam",
    "question": "66. Which of the following is invalid regarding the protection in Excel?",
    "option_a": "Protect Worksheet",
    "option_b": "Protect Workbook",
    "option_c": "Protect Workspace",
    "option_d": "All of the above are valid",
    "correct_answer": "C",
    "explanation": "Excel supports Protect Sheet and Protect Workbook structure/windows, but there is no 'Protect Workspace'.\n\n[മലയാളം]: എക്സലിൽ Protect Worksheet, Protect Workbook എന്നിവയുണ്ട്; എന്നാൽ 'Protect Workspace' എന്നൊരു സൗകര്യമില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_067",
    "sheetName": "PSC_Previous_Exam",
    "question": "67. In which ribbon/tab does the macro group appear?",
    "option_a": "Data",
    "option_b": "View",
    "option_c": "Review",
    "option_d": "Formulas",
    "correct_answer": "B",
    "explanation": "In Microsoft Word and Excel, the Macros command group appears on the 'View' tab (and also on Developer tab).\n\n[മലയാളം]: എം.എസ് ഓഫീസ് പ്രോഗ്രാമുകളിൽ മാക്രോ (Macro) ഗ്രൂപ്പ് കാണപ്പെടുന്നത് View ടാബിലാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_068",
    "sheetName": "PSC_Previous_Exam",
    "question": "68. The default view of an Excel Worksheet is :",
    "option_a": "Normal View",
    "option_b": "Page Layout View",
    "option_c": "Page Break View",
    "option_d": "Print Layout View",
    "correct_answer": "A",
    "explanation": "Normal View is the default worksheet viewing mode in Microsoft Excel.\n\n[മലയാളം]: എക്സൽ വർക്ക്ഷീറ്റിന്റെ ഡിഫോൾട്ട് വ്യൂ 'Normal View' ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_069",
    "sheetName": "PSC_Previous_Exam",
    "question": "69. Which button is used to add instant animation to the presentation and helps interactive presentation?",
    "option_a": "Add Button",
    "option_b": "Start Button",
    "option_c": "Insert Button",
    "option_d": "Action Button",
    "correct_answer": "D",
    "explanation": "Action Buttons in PowerPoint allow user interaction by jumping to slides, playing sounds, or running programs.\n\n[മലയാളം]: പവർപോയിന്റിൽ സംവേദനാത്മകത (interactive presentation) നൽകാൻ Action Button ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_070",
    "sheetName": "PSC_Previous_Exam",
    "question": "70. Which among the following is not an Entrance Animation effect?",
    "option_a": "Flash Once",
    "option_b": "Spinner",
    "option_c": "Dissolve Out",
    "option_d": "Bounce",
    "correct_answer": "C",
    "explanation": "'Dissolve Out' is an Exit animation effect, not an Entrance animation.\n\n[മലയാളം]: 'Dissolve Out' എന്നത് എക്സിറ്റ് ആനിമേഷൻ (Exit effect) ആണ്; എൻട്രൻസ് ആനിമേഷൻ അല്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_071",
    "sheetName": "PSC_Previous_Exam",
    "question": "71. A CSS property that specifies an element’s transparency is :",
    "option_a": "Hover",
    "option_b": "Opacity",
    "option_c": "Clearfix",
    "option_d": "Overlay",
    "correct_answer": "B",
    "explanation": "The 'opacity' property in CSS sets the transparency level of an element (0.0 to 1.0).\n\n[മലയാളം]: ഒരു എലമെന്റിന്റെ സുതാര്യത (transparency) നിശ്ചയിക്കുന്ന CSS പ്രോപ്പർട്ടി 'opacity' ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_072",
    "sheetName": "PSC_Previous_Exam",
    "question": "72. Which of these browsers supports server – side events?",
    "option_a": "Mozilla Firefox",
    "option_b": "Google Chrome",
    "option_c": "Opera",
    "option_d": "All of these",
    "correct_answer": "D",
    "explanation": "Server-Sent Events (SSE) / EventSource API is supported across all modern browsers: Chrome, Firefox, Opera, Safari, Edge.\n\n[മലയാളം]: സെർവർ-സൈഡ് ഇവന്റുകൾ (Server-Sent Events) മോസില്ല ഫയർഫോക്സ്, ക്രോം, ഓപ്പറ തുടങ്ങിയ എല്ലാ ആധുനിക ബ്രൗസറുകളും സപ്പോർട്ട് ചെയ്യുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_073",
    "sheetName": "PSC_Previous_Exam",
    "question": "73. Which attribute specifies that the audio file will start over again, every time when it is completed?",
    "option_a": "src",
    "option_b": "loop",
    "option_c": "preload",
    "option_d": "autoplay",
    "correct_answer": "B",
    "explanation": "The HTML5 <audio loop> attribute causes the audio track to replay automatically upon completion.\n\n[മലയാളം]: ഓഡിയോ ഫയൽ തീരുന്ന മുറയ്ക്ക് വീണ്ടും ആദ്യമേ തനിയെ പ്ലേ ചെയ്യാൻ HTML-ൽ 'loop' ആട്രിബ്യൂട്ട് ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_074",
    "sheetName": "PSC_Previous_Exam",
    "question": "74. Which log file does Apache HTTP server maintain?",
    "option_a": "Apache/logs/access.log",
    "option_b": "Apache/access/file.log",
    "option_c": "Apache/logs/error.log",
    "option_d": "Both (A) and (C)",
    "correct_answer": "D",
    "explanation": "Apache HTTP Server maintains both access.log (client request logs) and error.log (server diagnostic logs).\n\n[മലയാളം]: അപ്പാച്ചെ വെബ് സെർവർ access.log, error.log എന്നീ രണ്ട് ലോഗ് ഫയലുകളും സൂക്ഷിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_075",
    "sheetName": "PSC_Previous_Exam",
    "question": "75. Which HTML element is used to define a multi-line input field?",
    "option_a": "<text>",
    "option_b": "<blocktext>",
    "option_c": "<textfield>",
    "option_d": "<textarea>",
    "correct_answer": "D",
    "explanation": "The <textarea> tag defines a multi-line text input control in HTML forms.\n\n[മലയാളം]: HTML-ൽ ഒന്നിലധികം വരികൾ ടൈപ്പ് ചെയ്യാനുള്ള മൾട്ടി-ലൈൻ ഇൻപുട്ട് ഫീൽഡിനായി <textarea> എലമെന്റ് ഉപയോഗിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_076",
    "sheetName": "PSC_Previous_Exam",
    "question": "76. Link URL in HTML is specified using ——————— attribute.",
    "option_a": "url",
    "option_b": "link",
    "option_c": "href",
    "option_d": "rel",
    "correct_answer": "C",
    "explanation": "The 'href' (hypertext reference) attribute specifies the target URL in an <a> tag.\n\n[മലയാളം]: HTML ലിങ്കുകളിൽ ടാർഗറ്റ് വെബ് വിലാസം നൽകുന്നത് 'href' (Hypertext Reference) ആട്രിബ്യൂട്ട് വഴിയാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_077",
    "sheetName": "PSC_Previous_Exam",
    "question": "77. Which of the following are automatically loaded and operates as a part of browser?",
    "option_a": "Plug-ins",
    "option_b": "Utilities",
    "option_c": "Add-ons",
    "option_d": "Widgets",
    "correct_answer": "A",
    "explanation": "Browser plug-ins are programs loaded into the browser to extend media capabilities (e.g. Flash, PDF viewer).\n\n[മലയാളം]: ബ്രൗസറിന്റെ ഭാഗമായി പ്രവർത്തിക്കുന്ന പ്രോഗ്രാമുകളാണ് പ്ലഗ്-ഇന്നുകൾ (Plug-ins).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_078",
    "sheetName": "PSC_Previous_Exam",
    "question": "78. The attribute which is used to set the white space between the cell edge and the cell content is :",
    "option_a": "Cellspacing",
    "option_b": "Colspan",
    "option_c": "Rowspan",
    "option_d": "Cellpadding",
    "correct_answer": "D",
    "explanation": "In HTML tables, 'cellpadding' controls the space between cell wall borders and content, while 'cellspacing' sets space between adjacent cells.\n\n[മലയാളം]: ടേബിൾ സെല്ലിന്റെ ബോർഡറും അതിനുള്ളിലെ ഉള്ളടക്കവും തമ്മിലുള്ള അകലം നിശ്ചയിക്കുന്നത് 'cellpadding' ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_079",
    "sheetName": "PSC_Previous_Exam",
    "question": "79. What is the use of iframe in HTML?",
    "option_a": "To display a webpage in a new tab",
    "option_b": "To display a webpage within a webpage",
    "option_c": "To display a webpage without browser",
    "option_d": "To display a webpage with animation effect",
    "correct_answer": "B",
    "explanation": "An <iframe> (inline frame) embeds another separate HTML document/webpage inside the current webpage.\n\n[മലയാളം]: ഒരു വെബ് പേജിനുള്ളിൽ മറ്റൊരു വെബ് പേജ് ഉൾക്കൊള്ളിച്ച് കാണിക്കാനാണ് <iframe> (Inline Frame) ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_080",
    "sheetName": "PSC_Previous_Exam",
    "question": "80. If the background image of a web page is smaller than the screen what will happen?",
    "option_a": "It will be stretched",
    "option_b": "It will leave a blank space at the bottom of the page",
    "option_c": "It will leave a blank space at the Top of the page",
    "option_d": "It will be repeated",
    "correct_answer": "D",
    "explanation": "By default, CSS background images repeat horizontally and vertically (tile) if smaller than the viewport.\n\n[മലയാളം]: ഡിഫോൾട്ടായി ബാക്ക്ഗ്രൗണ്ട് ഇമേജ് സ്ക്രീനിനേക്കാൾ ചെറുതാണെങ്കിൽ അത് സ്ക്രീൻ മുഴുവനാകുന്ന രീതിയിൽ ടൈൽ പോലെ ആവർത്തിച്ചു (repeated) വരും.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_081",
    "sheetName": "PSC_Previous_Exam",
    "question": "81. Which of these is not included as a type of cloud computing?",
    "option_a": "Public Cloud",
    "option_b": "Private Cloud",
    "option_c": "Hybrid Cloud",
    "option_d": "Digital Cloud",
    "correct_answer": "D",
    "explanation": "Standard cloud deployment models are Public, Private, Hybrid, and Community Cloud. 'Digital Cloud' is not a recognized model.\n\n[മലയാളം]: ക്ലൗഡ് കമ്പ്യൂട്ടിംഗ് മോഡലുകളിൽ പബ്ലിക്, പ്രൈവറ്റ്, ഹൈബ്രിഡ് എന്നിവയുണ്ട്; എന്നാൽ 'Digital Cloud' എന്നൊരു വിഭാഗമില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_082",
    "sheetName": "PSC_Previous_Exam",
    "question": "82. When two persons claim for the same domain name, it is known as?",
    "option_a": "Cyber Trafficking",
    "option_b": "Cyber Warfare",
    "option_c": "Cyber Squatting",
    "option_d": "Cyber Terrorism",
    "correct_answer": "C",
    "explanation": "Cybersquatting is registering, selling or using a domain name with bad-faith intent to profit from the goodwill of someone else's trademark.\n\n[മലയാളം]: മറ്റൊരാളുടെ വ്യാപാരമുദ്രയുള്ള ഡൊമെയ്ൻ നാമം ലാഭേച്ഛയോടെ രജിസ്റ്റർ ചെയ്യുകയോ ക്ലെയിം ചെയ്യുകയോ ചെയ്യുന്ന കുറ്റകൃത്യമാണ് സൈബർ സ്ക്വാറ്റിംഗ് (Cybersquatting).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_083",
    "sheetName": "PSC_Previous_Exam",
    "question": "83. Example for IaaS provider :",
    "option_a": "Salesforce.com",
    "option_b": "Digital Ocean",
    "option_c": "Microsoft Azure",
    "option_d": "Dropbox",
    "correct_answer": "B",
    "explanation": "DigitalOcean is a prominent Infrastructure-as-a-Service (IaaS) cloud provider (PSC answer key gives B).\n\n[മലയാളം]: ഇൻഫ്രാസ്ട്രക്ചർ ആസ് എ സർവീസ് (IaaS) പ്രൊവൈഡർക്ക് ഉദാഹരണമാണ് Digital Ocean (PSC ഉത്തരസൂചിക പ്രകാരം B).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_084",
    "sheetName": "PSC_Previous_Exam",
    "question": "84. Pillars of Information Assurance are :\n(i) Integrity\n(ii) Confidentiality\n(iii) Authentication\n(iv) Availability",
    "option_a": "(i),(ii) and (iv)",
    "option_b": "(i) and (ii)",
    "option_c": "(i), (ii), (iii) and (iv)",
    "option_d": "(iii) only",
    "correct_answer": "C",
    "explanation": "The five pillars of Information Assurance (IA) include Confidentiality, Integrity, Availability, Authentication, and Non-repudiation.\n\n[മലയാളം]: ഇൻഫർമേഷൻ അഷ്വറൻസിന്റെ പ്രധാന സ്തംഭങ്ങളാണ് രഹസ്യസ്വഭാവം (Confidentiality), കൃത്യത (Integrity), ആധികാരികത (Authentication), ലഭ്യത (Availability) എന്നിവ.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_085",
    "sheetName": "PSC_Previous_Exam",
    "question": "85. What are the advantages of cloud computing?\n(i) Cost saving\n(ii) Scalability\n(iii) Mobility\n(iv) Downtime",
    "option_a": "(i), (ii), (iii) and (iv)",
    "option_b": "(i), (ii) and (iii)",
    "option_c": "(i) and (ii)",
    "option_d": "(i) only",
    "correct_answer": "B",
    "explanation": "Cost saving, scalability, and mobility are advantages. Downtime is a risk/disadvantage.\n\n[മലയാളം]: ചിലവ് കുറയ്ക്കൽ (Cost saving), വ്യാപ്തി കൂട്ടാനുള്ള സൗകര്യം (Scalability), എവിടെനിന്നും ഉപയോഗിക്കാനുള്ള സൗകര്യം (Mobility) എന്നിവ ക്ലൗഡിന്റെ ഗുണങ്ങളാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_086",
    "sheetName": "PSC_Previous_Exam",
    "question": "86. Which is a method of defeating a cryptographic scheme by trying a large number of possibilities?",
    "option_a": "Brute Force Attack",
    "option_b": "Smurf Attack",
    "option_c": "DoS Attack",
    "option_d": "Teardrop Attack",
    "correct_answer": "A",
    "explanation": "A Brute Force Attack attempts all possible combinations of keys or passwords until the correct one is discovered.\n\n[മലയാളം]: എല്ലാ കോമ്പിനേഷനുകളും ഒന്നൊന്നായി പരീക്ഷിച്ച് പാസ്‌വേഡോ കീകളോ കണ്ടെത്താൻ ശ്രമിക്കുന്ന സൈബർ ആക്രമണമാണ് ബ്രൂട്ട് ഫോഴ്സ് അറ്റാക്ക് (Brute Force Attack).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_087",
    "sheetName": "PSC_Previous_Exam",
    "question": "87. Secret recipients’ address given in :",
    "option_a": "To field",
    "option_b": "CC field",
    "option_c": "BCC field",
    "option_d": "From field",
    "correct_answer": "C",
    "explanation": "BCC (Blind Carbon Copy) hides recipients' email addresses from all other recipients.\n\n[മലയാളം]: ഇമെയിലിൽ മറ്റ് സ്വീകർത്താക്കൾ കാണാത്ത രീതിയിൽ രഹസ്യമായി ഇമെയിൽ വിലാസം നൽകുന്നത് BCC (Blind Carbon Copy) ഫീൽഡിലാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_088",
    "sheetName": "PSC_Previous_Exam",
    "question": "88. If a person booked a railway ticket through IRCTC, but he couldn’t get the reservation in the time of chart preparation of the concerned train. Then IRCTC refund the amount to his bank account and it is known as :",
    "option_a": "COD",
    "option_b": "Charge back",
    "option_c": "Payment",
    "option_d": "Service Denial Charge",
    "correct_answer": "B",
    "explanation": "Returning funds back to the consumer's bank/card account after a non-fulfilled transaction is termed a Chargeback.\n\n[മലയാളം]: ടിക്കറ്റ് കൺഫേം ആകാത്തതിനെ തുടർന്ന് ഉപഭോക്താവിന്റെ അക്കൗണ്ടിലേക്ക് തുക തിരികെ ക്രെഡിറ്റ് ചെയ്യുന്ന പ്രക്രിയയെ Charge back എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_089",
    "sheetName": "PSC_Previous_Exam",
    "question": "89. Which provide the IP address corresponding to the URL?",
    "option_a": "Web server",
    "option_b": "Database server",
    "option_c": "Domain Name Server",
    "option_d": "Web Browser",
    "correct_answer": "C",
    "explanation": "A Domain Name Server (DNS) resolves human-friendly URLs/domain names to their corresponding numerical IP addresses.\n\n[മലയാളം]: ഒരു വെബ് വിലാസത്തിന് (URL) അനുയോജ്യമായ IP അഡ്രസ്സ് കണ്ടെത്തി നൽകുന്നത് DNS (Domain Name Server) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_090",
    "sheetName": "PSC_Previous_Exam",
    "question": "90. Categories of E-Commerce :\n(i) Business to Business\n(ii) Government to Business\n(iii) Business to Customer\n(iv) Government to Citizen",
    "option_a": "(i), (ii) and (iii)",
    "option_b": "(ii) and (iv)",
    "option_c": "(i) only",
    "option_d": "(i), (ii) (iii) and (iv)",
    "correct_answer": "D",
    "explanation": "B2B, G2B, B2C, and G2C are all recognized categories of e-commerce / e-governance.\n\n[മലയാളം]: B2B, G2B, B2C, G2C എന്നിവയെല്ലാം ഇ-കൊമേഴ്‌സിന്റെയും ഇ-ഗവേണൻസിന്റെയും പ്രധാന വിഭാഗങ്ങളാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_091",
    "sheetName": "PSC_Previous_Exam",
    "question": "91. Which helps to define common syntax in semantic web?",
    "option_a": "RDF",
    "option_b": "RDFS",
    "option_c": "URI",
    "option_d": "XML",
    "correct_answer": "D",
    "explanation": "XML provides a surface syntax for structured documents in semantic web (Official PSC answer key gives D).\n\n[മലയാളം]: സെമാന്റിക് വെബിൽ ഘടനാപരമായ വിവരങ്ങൾക്കായി പൊതുവായ സിന്റാക്സ് നൽകുന്നത് XML ആണ് (PSC ഉത്തരസൂചിക പ്രകാരം D).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_092",
    "sheetName": "PSC_Previous_Exam",
    "question": "92. Cyber crimes against government includes :\n(i) Cyber Vandalism\n(ii) Cyber Warfare\n(iii) Cyber Terrorism\n(iv) Cyber Trafficking",
    "option_a": "(i), (ii), (iii) and (iv)",
    "option_b": "(i) only",
    "option_c": "(i) and (ii)",
    "option_d": "(ii) and (iii)",
    "correct_answer": "D",
    "explanation": "Cyber Warfare and Cyber Terrorism are targeted crimes against governments and national infrastructure (Official answer key gives D).\n\n[മലയാളം]: സർക്കാരുകൾക്കും രാജ്യത്തിന്റെ സുരക്ഷയ്ക്കും എതിരെയുള്ള സൈബർ കുറ്റകൃത്യങ്ങളാണ് സൈബർ യുദ്ധവും (Cyber Warfare) സൈബർ ഭീകരവാദവും (Cyber Terrorism).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_093",
    "sheetName": "PSC_Previous_Exam",
    "question": "93. Which one is the intermediary responsible for processing the transfer of fund from payee to recipient in an E-commerce transaction?",
    "option_a": "Credit card",
    "option_b": "Debit Card",
    "option_c": "Payment Gateway",
    "option_d": "Wallet",
    "correct_answer": "C",
    "explanation": "A Payment Gateway is an e-commerce application service provider service that authorizes card or direct payments for online businesses.\n\n[മലയാളം]: ഓൺലൈൻ ഇടപാടുകളിൽ പണം കൈമാറ്റം സുരക്ഷിതമായി പ്രോസസ്സ് ചെയ്യുന്ന ഇടനിലക്കാരനാണ് പേയ്‌മെന്റ് ഗേറ്റ്‌വേ (Payment Gateway).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_094",
    "sheetName": "PSC_Previous_Exam",
    "question": "94. Who is the father of cloud computing?",
    "option_a": "Charles Bachman",
    "option_b": "Edgar Frank Codd",
    "option_c": "J.C.R. Licklider",
    "option_d": "Sharon B. Codd",
    "correct_answer": "C",
    "explanation": "J.C.R. Licklider is widely regarded as the father of cloud computing due to his vision of an 'Intergalactic Computer Network' in the 1960s.\n\n[മലയാളം]: ക്ലൗഡ് കമ്പ്യൂട്ടിംഗിന്റെ പിതാവ് എന്നറിയപ്പെടുന്നത് ജെ.സി.ആർ. ലിക്ക്ലൈഡർ (J.C.R. Licklider) ആണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_095",
    "sheetName": "PSC_Previous_Exam",
    "question": "95. Unsolicited email sent in bulk is :",
    "option_a": "Threat",
    "option_b": "Virus",
    "option_c": "Spam",
    "option_d": "Phishing",
    "correct_answer": "C",
    "explanation": "Spam is unsolicited bulk email sent to a large number of recipients.\n\n[മലയാളം]: ആവശ്യപ്പെടാതെ തന്നെ കൂട്ടത്തോടെ അയക്കപ്പെടുന്ന അനാവശ്യ ഇമെയിലുകളെ സ്പാം (Spam) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_096",
    "sheetName": "PSC_Previous_Exam",
    "question": "96. Which of the following is not a type of cloud server?",
    "option_a": "Public Cloud Servers",
    "option_b": "Private Cloud Server",
    "option_c": "Dedicated Cloud Servers",
    "option_d": "Merged Cloud Servers",
    "correct_answer": "D",
    "explanation": "Merged Cloud Servers is not a recognized category of cloud servers.\n\n[മലയാളം]: ക്ലൗഡ് സെർവറുകളുടെ തരങ്ങളിൽ പബ്ലിക്, പ്രൈവറ്റ്, ഡെഡിക്കേറ്റഡ് എന്നിവയുണ്ട്; എന്നാൽ 'Merged Cloud Servers' എന്നൊന്നില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_097",
    "sheetName": "PSC_Previous_Exam",
    "question": "97. Attacking the victims through fake URL resembling that of a valid financial institution is called as :",
    "option_a": "Worms",
    "option_b": "Phishing",
    "option_c": "Trojans",
    "option_d": "Computer virus",
    "correct_answer": "B",
    "explanation": "Phishing is a social engineering attack where fraudulent websites mimic legitimate banks or services to steal credentials.\n\n[മലയാളം]: യഥാർത്ഥ ബാങ്കുകളുടെയോ സ്ഥാപനങ്ങളുടെയോ വ്യാജ വെബ്‌സൈറ്റ് നിർമ്മിച്ച് ഉപയോക്താക്കളെ കബളിപ്പിക്കുന്ന രീതിയാണ് ഫിഷിംഗ് (Phishing).",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_098",
    "sheetName": "PSC_Previous_Exam",
    "question": "98. In credit/ Debit cards, CVV stands for :",
    "option_a": "Card Verification Value",
    "option_b": "Credit Verification Value",
    "option_c": "Card Validity Value",
    "option_d": "Credit Verification Visual",
    "correct_answer": "A",
    "explanation": "CVV stands for Card Verification Value (the 3-digit security code on the signature strip of payment cards).\n\n[മലയാളം]: ക്രെഡിറ്റ്/ഡെബിറ്റ് കാർഡുകൾക്ക് പിന്നിലുള്ള 3 അക്ക സുരക്ഷാ കോഡായ CVV-യുടെ പൂർണ്ണരൂപം Card Verification Value എന്നാണ്.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_099",
    "sheetName": "PSC_Previous_Exam",
    "question": "99. How many types of preventive controls?",
    "option_a": "2",
    "option_b": "3",
    "option_c": "4",
    "option_d": "5",
    "correct_answer": "B",
    "explanation": "Security controls are primarily categorized into 3 types: Administrative, Technical (Logical), and Physical.\n\n[മലയാളം]: പ്രിവന്റീവ് സെക്യൂരിറ്റി കൺട്രോളുകൾ പ്രധാനമായും 3 തരത്തിലാണ്: അഡ്മിനിസ്ട്രേറ്റീവ്, ടെക്നിക്കൽ, ഫിസിക്കൽ.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  },
  {
    "id": "PSC_147_2023_100",
    "sheetName": "PSC_Previous_Exam",
    "question": "100. The following are different types of cloud computing services except :",
    "option_a": "Infrastructure as a Service",
    "option_b": "Hardware as a Service",
    "option_c": "Platform as a Service",
    "option_d": "Software as a Service",
    "correct_answer": "B",
    "explanation": "The standard cloud service models are IaaS, PaaS, and SaaS. 'Hardware as a Service' is not a standard cloud computing service model.\n\n[മലയാളം]: ക്ലൗഡ് കമ്പ്യൂട്ടിംഗ് സർവീസുകളുടെ പ്രധാന വിഭാഗങ്ങൾ IaaS, PaaS, SaaS എന്നിവയാണ്; 'Hardware as a Service' ഇതിൽ ഉൾപ്പെടുന്നില്ല.",
    "subtopic": "Kerala PSC Junior Instructor (COPA) - 147/2023"
  }
];
}


/**
 * Tradesman (Computer Hardware Maintenance) 191/2015 ഷീറ്റ് നിർമ്മിച്ച് 83 ചോദ്യങ്ങളും ചേർക്കുന്നു
 */
function setupPscTradesman191_2015Sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("PSC_Tradesman_191_2015");
  if (!sheet) {
    sheet = ss.insertSheet("PSC_Tradesman_191_2015");
  }

  const headers = [
    "id", "question", "option_a", "option_b", "option_c", "option_d",
    "correct_answer", "explanation", "subtopic"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f766e"); // Teal background for Tradesman
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 450);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 180);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 120);
    sheet.setColumnWidth(8, 400);
    sheet.setColumnWidth(9, 220);
  }

  const existingData = sheet.getDataRange().getValues();
  const existingIds = new Set();
  for (let r = 1; r < existingData.length; r++) {
    if (existingData[r][0]) existingIds.add(String(existingData[r][0]));
  }

  const questions = getPscTradesman191Questions();
  let added = 0;
  questions.forEach(q => {
    if (!existingIds.has(q.id)) {
      sheet.appendRow([
        q.id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation,
        q.subtopic
      ]);
      added++;
    }
  });

  const msg = "✅ Tradesman CHM (191/2015) ഷീറ്റ് വിജയകരമായി തയ്യാറാക്കി! ആകെ " + added + " ചോദ്യങ്ങൾ ചേർത്തു.";
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {}
}

/**
 * Kerala PSC Tradesman (Computer Hardware Maintenance) - Question Code: 191/2015
 * 83 Official Questions with Final Answer Key & Malayalam Explanations
 */
function getPscTradesman191Questions() {
  return [
  {
    "id": "PSC_191_2015_001",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "1. The terms \"Red book\", \"Yellow book\" and \"Orange book\" refer to :",
    "option_a": "IDE",
    "option_b": "SCSI",
    "option_c": "CD ROM Standard",
    "option_d": "Floppy Drive Technology",
    "correct_answer": "C",
    "explanation": "The Rainbow Books are the collection of CD standards. Red Book defines Audio CD, Yellow Book defines CD-ROM data format, and Orange Book defines recordable media (CD-R/CD-RW).\n\n[മലയാളം]: വിവിധ ഒപ്റ്റിക്കൽ ഡിസ്ക് (CD-ROM) ഫോർമാറ്റുകളുടെ മാനദണ്ഡങ്ങൾ വ്യക്തമാക്കുന്ന സ്റ്റാൻഡേർഡുകളാണ് Rainbow Books (Red book - Audio CD, Yellow book - Data CD, Orange book - CD-R/RW).",
    "subtopic": "Optical Storage Devices"
  },
  {
    "id": "PSC_191_2015_002",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "2. IRQ 1 is commonly assigned to :",
    "option_a": "System timer",
    "option_b": "It is usually open",
    "option_c": "Real time clock",
    "option_d": "Keyboard",
    "correct_answer": "D",
    "explanation": "In x86 PC architecture, IRQ 0 is reserved for System Timer, IRQ 1 is assigned to the Keyboard controller, and IRQ 8 is for the Real-Time Clock (RTC).\n\n[മലയാളം]: പി.സി ആർക്കിടെക്ചറിൽ IRQ 1 (Interrupt Request 1) കീബോർഡിനായി നീക്കിവെച്ചിട്ടുള്ളതാണ് (IRQ 0 സിസ്റ്റം ടൈമറിനാണ്).",
    "subtopic": "Interrupts & System Resources"
  },
  {
    "id": "PSC_191_2015_003",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "3. What type of connector is used to plug a telephone line into a modem ?",
    "option_a": "RJ-11",
    "option_b": "COM1",
    "option_c": "RJ-45",
    "option_d": "RJ-25",
    "correct_answer": "A",
    "explanation": "RJ-11 (Registered Jack 11, typically 4-pin or 6P2C/6P4C) is used for connecting telephone lines to dial-up/DSL modems. RJ-45 (8-pin) is used for Ethernet LAN.\n\n[മലയാളം]: ടെലിഫോൺ ലൈൻ മോഡത്തിലേക്ക് കണക്ട് ചെയ്യാൻ ഉപയോഗിക്കുന്നത് 4-പിൻ RJ-11 കണക്ടറാണ് (ലാൻ കേബിളുകൾക്ക് RJ-45 ആണ്).",
    "subtopic": "Cables & Connectors"
  },
  {
    "id": "PSC_191_2015_004",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "4. Which computer manufacturer quotes \"Enabling today..Inspiring tomorrow..\" ?",
    "option_a": "INTEL",
    "option_b": "AMD",
    "option_c": "MERCURY",
    "option_d": "MICROSOFT",
    "correct_answer": "B",
    "explanation": "\"Enabling today. Inspiring tomorrow.\" was the brand tagline/quote used by AMD (Advanced Micro Devices).\n\n[മലയാളം]: 'Enabling today..Inspiring tomorrow..' എന്നത് പ്രമുഖ പ്രോസസ്സർ നിർമ്മാതാക്കളായ AMD-യുടെ പരസ്യവാചകമാണ് (Tagline).",
    "subtopic": "Processor Families & Industry"
  },
  {
    "id": "PSC_191_2015_005",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "5. Which of the following input device would be best suited to capture images for use with a personal computer ?",
    "option_a": "Optical mark reader",
    "option_b": "Touch screen",
    "option_c": "Digital camera",
    "option_d": "Graphical tablet",
    "correct_answer": "C",
    "explanation": "A Digital Camera captures real-world optical images and converts them into digital bitmap files directly usable on a PC.\n\n[മലയാളം]: നേരിട്ടുള്ള ചിത്രങ്ങൾ ഡിജിറ്റൈസ് ചെയ്ത് കമ്പ്യൂട്ടറിലേക്ക് ഇൻപുട്ട് ചെയ്യാൻ ഏറ്റവും അനുയോജ്യമായ ഉപകരണം ഡിജിറ്റൽ ക്യാമറയാണ്.",
    "subtopic": "I/O Devices & Peripherals"
  },
  {
    "id": "PSC_191_2015_006",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "6. What is the control unit's function in the CPU ?",
    "option_a": "To store program instruction",
    "option_b": "To transfer data to primary storage",
    "option_c": "To decode program instruction",
    "option_d": "To perform logic operation",
    "correct_answer": "C",
    "explanation": "The Control Unit (CU) fetches instructions from memory, decodes what operation needs to be performed, and directs data flow through the CPU.\n\n[മലയാളം]: പ്രോസസ്സറിലെ കൺട്രോൾ യൂണിറ്റിന്റെ (CU) പ്രധാന ധർമ്മം മെമ്മറിയിൽ നിന്നും ഇൻസ്ട്രക്ഷനുകൾ ഫെച്ച് ചെയ്യുകയും അവയുടെ അർത്ഥം ഗ്രഹിക്കുകയുമാണ് (Decode program instruction).",
    "subtopic": "CPU Architecture & Functional Blocks"
  },
  {
    "id": "PSC_191_2015_007",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "7. IPv6 address is _____ bit more than that of IPv4.",
    "option_a": "96 bit",
    "option_b": "128 bit",
    "option_c": "32 bit",
    "option_d": "64 bit",
    "correct_answer": "A",
    "explanation": "An IPv6 address is 128 bits and an IPv4 address is 32 bits. Therefore, IPv6 is 128 - 32 = 96 bits more than IPv4.\n\n[മലയാളം]: IPv6 അഡ്രസ് 128 ബിറ്റും IPv4 അഡ്രസ് 32 ബിറ്റുമാണ്. അതിനാൽ IPv6-ന് IPv4 നേക്കാൾ 96 ബിറ്റ് (128 - 32 = 96) കൂടുതൽ നീളമുണ്ട്.",
    "subtopic": "IP Addressing & Subnetting"
  },
  {
    "id": "PSC_191_2015_008",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "8. Which of the following memory needs periodic refresh ?",
    "option_a": "SRAM",
    "option_b": "DRAM",
    "option_c": "ROM",
    "option_d": "All of the above",
    "correct_answer": "B",
    "explanation": "DRAM (Dynamic RAM) stores each bit of data in a tiny capacitor within an integrated circuit. Because capacitors leak charge, DRAM requires periodic refreshing thousands of times per second.\n\n[മലയാളം]: DRAM (Dynamic RAM) കപ്പാസിറ്ററുകളിൽ ചാർജ്ജ് ആയി ഡാറ്റ സൂക്ഷിക്കുന്നതിനാൽ അതിലെ ചാർജ് നഷ്ടപ്പെടാതിരിക്കാൻ കൃത്യമായ ഇടവേളകളിൽ റീഫ്രഷ് (Periodic Refresh) ചെയ്യേണ്ടതുണ്ട്.",
    "subtopic": "Primary Memory & RAM Architecture"
  },
  {
    "id": "PSC_191_2015_026",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "26. A 25 pin female connector on the back of a computer will typically be :",
    "option_a": "Serial Port 1",
    "option_b": "VGA port",
    "option_c": "Parallel port",
    "option_d": "USB",
    "correct_answer": "C",
    "explanation": "A DB-25 female connector on the back of a PC is standard for the Parallel Port (LPT1), typically used for legacy printers. In contrast, standard 25-pin serial ports were male.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിന് പിന്നിലെ 25-പിൻ ഫീമെയിൽ (DB-25 Female) കണക്ടർ സാധാരണയായി പാരലൽ പോർട്ട് (Parallel/LPT Port) ആണ്. ഇത് പഴയ പ്രിന്ററുകൾ കണക്ട് ചെയ്യാൻ ഉപയോഗിച്ചിരുന്നു.",
    "subtopic": "Ports & Interfacing"
  },
  {
    "id": "PSC_191_2015_027",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "27. Which of the following is not a type of computer hard drive ?",
    "option_a": "SATA",
    "option_b": "SCSI",
    "option_c": "FDD",
    "option_d": "ID",
    "correct_answer": "C",
    "explanation": "FDD stands for Floppy Disk Drive, which is a removable magnetic storage device, not a type of hard disk drive. SATA, SCSI, and IDE are hard drive interfaces.\n\n[മലയാളം]: FDD എന്നത് ഫ്ലോപ്പി ഡിസ്ക് ഡ്രൈവ് (Floppy Disk Drive) ആണ്; ഇത് ഹാർഡ് ഡിസ്ക് വിഭാഗത്തിൽ ഉൾപ്പെടുന്ന ഒന്നല്ല.",
    "subtopic": "Storage Devices & Controllers"
  },
  {
    "id": "PSC_191_2015_028",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "28. Who built the first Mechanical Calculator ?",
    "option_a": "Howard Aiken",
    "option_b": "John Mauchly",
    "option_c": "Charles Babbage",
    "option_d": "Blaise Pascal",
    "correct_answer": "D",
    "explanation": "Blaise Pascal invented and built the first mechanical calculator (known as the Pascaline or Arithmétique) in 1642.\n\n[മലയാളം]: 1642-ൽ ആദ്യത്തെ മെക്കാനിക്കൽ കാൽക്കുലേറ്ററായ 'പാസ്കലൈൻ' (Pascaline) നിർമ്മിച്ചത് ബ്ലെയ്സ് പാസ്കൽ (Blaise Pascal) ആണ്.",
    "subtopic": "History & Computer Fundamentals"
  },
  {
    "id": "PSC_191_2015_029",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "29. To view any currently running Terminate Stay Resident (TSR) programs, we type :",
    "option_a": "Memory",
    "option_b": "MEM",
    "option_c": "SYS/M",
    "option_d": "MEMSHOW",
    "correct_answer": "B",
    "explanation": "In MS-DOS, the 'MEM' command (especially 'MEM /C' or 'MEM /D') displays used and free memory, including all resident TSR programs and device drivers loaded into memory.\n\n[മലയാളം]: MS-DOS ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിൽ മെമ്മറിയിൽ റൺ ചെയ്തുകൊണ്ടിരിക്കുന്ന TSR (Terminate and Stay Resident) പ്രോഗ്രാമുകളെയും ഡ്രൈവറുകളെയും കാണാൻ 'MEM' കമാൻഡ് ആണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Operating Systems & DOS Commands"
  },
  {
    "id": "PSC_191_2015_030",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "30. The four functions of a CPU are :",
    "option_a": "Fetch, Decode, Execute, Write back",
    "option_b": "Seek, Analyze, Execute, Burn",
    "option_c": "Fetch, Copy, Execute, Decode",
    "option_d": "Seek, Decode, Burn, Copy",
    "correct_answer": "A",
    "explanation": "The four primary functional steps of the CPU machine cycle are Fetch (retrieve instruction), Decode (interpret opcode), Execute (perform operation in ALU), and Write back (store result back to register/memory).\n\n[മലയാളം]: ഒരു പ്രോസസ്സറിന്റെ പ്രധാനപ്പെട്ട നാല് പ്രവർത്തന ഘട്ടങ്ങൾ: Fetch, Decode, Execute, Write back എന്നിവയാണ്.",
    "subtopic": "Instruction Cycle & CPU Architecture"
  },
  {
    "id": "PSC_191_2015_031",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "31. Which of the following device is attached with a ribbon cable ?",
    "option_a": "CPU",
    "option_b": "RAM",
    "option_c": "CD-ROM DRIVE",
    "option_d": "SOUND CARD",
    "correct_answer": "C",
    "explanation": "Optical drives like CD-ROM and IDE hard disk drives were traditionally connected to the motherboard using flat 40-pin or 80-conductor IDE/PATA ribbon cables.\n\n[മലയാളം]: സിഡി റോം ഡ്രൈവ് (CD-ROM Drive), ഹാർഡ് ഡിസ്ക് എന്നിവ മദർബോർഡുമായി ബന്ധിപ്പിക്കാൻ ഫ്ലാറ്റ് റിബൺ കേബിളുകൾ (PATA/IDE Ribbon Cable) ആണ് ഉപയോഗിച്ചിരുന്നത്.",
    "subtopic": "Cables & Peripheral Standards"
  },
  {
    "id": "PSC_191_2015_032",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "32. _____ stores the picture information as a charge distribution behind the phosphor coated screen.",
    "option_a": "Cathode Ray Tube",
    "option_b": "Direct-View Storage Tube",
    "option_c": "Flat Panel Displays",
    "option_d": "3D Viewing Device",
    "correct_answer": "B",
    "explanation": "Direct-View Storage Tube (DVST) maintains the image without refreshing by storing the picture information as a charge distribution directly on a storage grid behind the phosphor screen.\n\n[മലയാളം]: ഫോസ്ഫർ സ്ക്രീനിന് പിന്നിൽ ചാർജ്ജ് വിതരണമായി ചിത്ര വിവരങ്ങൾ സൂക്ഷിച്ചുവെക്കുന്ന ഡിസ്പ്ലേ ഉപകരണമാണ് Direct-View Storage Tube (DVST). ഇതിൽ ഫ്ലിക്കർ ഇല്ലാതെ ചിത്രം നിലനിൽക്കുന്നു.",
    "subtopic": "Display Technologies"
  },
  {
    "id": "PSC_191_2015_033",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "33. Which among the following connectors is used mostly for external hard drives ?",
    "option_a": "PATA",
    "option_b": "HDMI",
    "option_c": "PS/2",
    "option_d": "eSATA",
    "correct_answer": "D",
    "explanation": "eSATA (external Serial Advanced Technology Attachment) provides a high-speed external connection for SATA hard drives, matching internal SATA transfer rates.\n\n[മലയാളം]: എക്സ്റ്റേണൽ ഹാർഡ് ഡിസ്കുകൾ കമ്പ്യൂട്ടറുമായി ബന്ധിപ്പിക്കാൻ ഉപയോഗിക്കുന്ന ഉയർന്ന വേഗതയുള്ള കണക്ടറാണ് eSATA (external SATA).",
    "subtopic": "Storage Interfaces & Connectors"
  },
  {
    "id": "PSC_191_2015_034",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "34. Which of the following CPU features a Quick Path Interconnect interface ?",
    "option_a": "Intel Pentium 4",
    "option_b": "AMD Athlon",
    "option_c": "Intel Core i7",
    "option_d": "Intel Celeron",
    "correct_answer": "C",
    "explanation": "Intel introduced Intel QuickPath Interconnect (QPI) with the Nehalem microarchitecture (first-generation Intel Core i7) to replace the older Front-Side Bus (FSB).\n\n[മലയാളം]: പഴയ ഫ്രണ്ട് സൈഡ് ബസിന് (FSB) പകരമായി ഇന്റൽ തങ്ങളുടെ പ്രോസസ്സറുകളിൽ അവതരിപ്പിച്ച സാങ്കേതികവിദ്യയാണ് QPI (Quick Path Interconnect). ഇത് ആദ്യമായി Intel Core i7 പ്രോസസ്സറുകളിലാണ് ഉൾപ്പെടുത്തിയത്.",
    "subtopic": "CPU Technology & Bus Architecture"
  },
  {
    "id": "PSC_191_2015_035",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "35. Which of the following is a valid package size of DDR3 DIMMs ?",
    "option_a": "168 pin",
    "option_b": "172 pin",
    "option_c": "184 pin",
    "option_d": "240 pin",
    "correct_answer": "D",
    "explanation": "Standard desktop DDR3 SDRAM memory modules (DIMMs) have 240 pins (same pin count as DDR2, but with a different key notch position). DDR1 has 184 pins, SDR SDRAM has 168 pins.\n\n[മലയാളം]: ഡെസ്ക്ടോപ്പ് DDR3 റാം (DIMM) മൊഡ്യൂളുകളിൽ 240 പിന്നുകളാണ് (240-pin) ഉള്ളത് (DDR1-ൽ 184, SDRAM-ൽ 168 പിന്നുകൾ).",
    "subtopic": "RAM Modules & Form Factors"
  },
  {
    "id": "PSC_191_2015_036",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "36. Which Motherboard form factor uses one 20 pin connector ?",
    "option_a": "ATX",
    "option_b": "AT",
    "option_c": "BABY AT",
    "option_d": "None of the above",
    "correct_answer": "A",
    "explanation": "Original ATX motherboards (ATX 1.x) used a single 20-pin main power connector from the SMPS (later expanded to 24 pins in ATX12V 2.0). AT motherboards used two 6-pin connectors (P8 and P9).\n\n[മലയാളം]: ATX മദർബോർഡുകളിലാണ് SMPS-ൽ നിന്നുള്ള സിംഗിൾ 20-പിൻ പവർ കണക്ടർ (ATX Power Connector) ഉപയോഗിച്ചിരുന്നത് (പഴയ AT ബോർഡുകളിൽ P8, P9 എന്നീ രണ്ട് കണക്ടറുകളായിരുന്നു).",
    "subtopic": "Motherboard Form Factors & Power Supplies"
  },
  {
    "id": "PSC_191_2015_037",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "37. In Inkjet technology the droplets of ink are deflected by :",
    "option_a": "Multi directional nozzles",
    "option_b": "Electronically charged plates",
    "option_c": "High pressure plates",
    "option_d": "Electrostatic absorption",
    "correct_answer": "A",
    "explanation": "In standard Drop-on-Demand (DOD) inkjet print heads, ink droplets are precisely directed onto the paper by an array of multi-directional micro-nozzles.\n\n[മലയാളം]: ഇങ്ക്ജെറ്റ് പ്രിന്റർ ഹെഡുകളിൽ മൾട്ടി-ഡയറക്ഷണൽ നോസിലുകൾ (Multi directional nozzles) വഴിയാണ് മഷിയുടെ തുള്ളികൾ പേപ്പറിലേക്ക് സ്പ്രേ ചെയ്യപ്പെടുന്നത്.",
    "subtopic": "Printers & Maintenance"
  },
  {
    "id": "PSC_191_2015_038",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "38. When CD-ROM was prepared and made ?",
    "option_a": "1977",
    "option_b": "1980",
    "option_c": "1981",
    "option_d": "1985",
    "correct_answer": "D",
    "explanation": "The official CD-ROM standard specification (Yellow Book) was developed and released by Sony and Philips in 1985.\n\n[മലയാളം]: ഫിലിപ്സും സോണിയും ചേർന്ന് സിഡി-റോം യെല്ലോ ബുക്ക് സ്റ്റാൻഡേർഡ് പുറത്തിറക്കിയത് 1985-ലാണ്.",
    "subtopic": "Optical Storage Devices"
  },
  {
    "id": "PSC_191_2015_039",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "39. In First Generation computers, what was used for calculation ?",
    "option_a": "Transistors",
    "option_b": "Integrated circuits",
    "option_c": "Vacuum tubes",
    "option_d": "VSLI chips",
    "correct_answer": "C",
    "explanation": "First Generation computers (1940-1956) like ENIAC and UNIVAC utilized vacuum tubes (thermionic valves) as the primary switching and logic elements.\n\n[മലയാളം]: ഒന്നാം തലമുറ (First Generation) കമ്പ്യൂട്ടറുകളിൽ കണക്കുകൂട്ടലുകൾക്കും ലോജിക് പ്രവർത്തനങ്ങൾക്കുമായി വാക്വം ട്യൂബുകളാണ് (Vacuum tubes) ഉപയോഗിച്ചിരുന്നത്.",
    "subtopic": "Computer Generations"
  },
  {
    "id": "PSC_191_2015_040",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "40. An example of an operating system used in smart phones is _____",
    "option_a": "Unix",
    "option_b": "Windows XP",
    "option_c": "Novell",
    "option_d": "Symbian",
    "correct_answer": "D",
    "explanation": "Symbian OS was one of the most widely used mobile operating systems for smartphones (popularized globally by Nokia).\n\n[മലയാളം]: സ്മാർട്ട്‌ഫോണുകളിൽ (പ്രത്യേകിച്ച് നോക്കിയ ഫോണുകളിൽ) വ്യാപകമായി ഉപയോഗിച്ചിരുന്ന മൊബൈൽ ഓപ്പറേറ്റിംഗ് സിസ്റ്റമാണ് സിംബിയൻ (Symbian).",
    "subtopic": "Operating Systems"
  },
  {
    "id": "PSC_191_2015_041",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "41. In laser printer technology, what happens during the conditioning stage ?",
    "option_a": "A uniform negative charge is placed on the photosensitive drum.",
    "option_b": "The corona wire places a uniform positive charge on the paper.",
    "option_c": "A uniform negative charge is placed on the toner.",
    "option_d": "None of the above.",
    "correct_answer": "A",
    "explanation": "During the conditioning (or charging) stage of the laser electrophotographic process, the primary corona wire or charge roller places a uniform high negative charge (-600V DC) across the surface of the photosensitive drum.\n\n[മലയാളം]: ലേസർ പ്രിന്റിംഗിലെ കണ്ടീഷനിംഗ് (Conditioning/Charging) ഘട്ടത്തിൽ ഫോട്ടോസെൻസിറ്റീവ് ഡ്രമ്മിന് മുകളിൽ ഒരു നെഗറ്റീവ് ഇലക്ട്രിക്കൽ ചാർജ്ജ് (-600V) തുല്യമായി നൽകുന്നു.",
    "subtopic": "Laser Printers & Troubleshooting"
  },
  {
    "id": "PSC_191_2015_042",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "42. Which of the following is not a type of Motherboard expansion slot ?",
    "option_a": "ATX",
    "option_b": "ISA",
    "option_c": "PCI",
    "option_d": "AGP",
    "correct_answer": "A",
    "explanation": "ATX is a motherboard form factor specification, not an expansion bus slot. ISA, PCI, and AGP are physical bus expansion slots for add-on cards.\n\n[മലയാളം]: ISA, PCI, AGP എന്നിവ മദർബോർഡിലെ എക്സ്പാൻഷൻ സ്ലോട്ടുകളാണ്; എന്നാൽ ATX എന്നത് മദർബോർഡിന്റെ രൂപകൽപ്പനയുമായി (Form Factor) ബന്ധപ്പെട്ടതാണ്, സ്ലോട്ടല്ല.",
    "subtopic": "Expansion Slots & Bus Architecture"
  },
  {
    "id": "PSC_191_2015_043",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "43. What is the purpose of digital scanner ?",
    "option_a": "To detect computer viruses",
    "option_b": "To output images or pages of text",
    "option_c": "To input images or pages of text",
    "option_d": "To listen to digital radio signals",
    "correct_answer": "C",
    "explanation": "An optical digital flatbed or document scanner captures hardcopy images or printed text and inputs them as digital files into the computer.\n\n[മലയാളം]: അച്ചടിച്ച ചിത്രങ്ങളോ ഡോക്യുമെന്റുകളോ കമ്പ്യൂട്ടറിലേക്ക് ഡിജിറ്റലായി ഇൻപുട്ട് ചെയ്യുന്നതിനാണ് ഡിജിറ്റൽ സ്കാനർ ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Scanners & I/O Peripherals"
  },
  {
    "id": "PSC_191_2015_044",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "44. Routers operate in which layer of the OSI reference model ?",
    "option_a": "Physical layer",
    "option_b": "Network layer",
    "option_c": "Data link layer",
    "option_d": "Transport layer",
    "correct_answer": "B",
    "explanation": "Routers operate at Layer 3 (Network Layer) of the OSI reference model, directing packets between different networks based on logical IP addresses.\n\n[മലയാളം]: OSI മോഡലിലെ മൂന്നാമത്തെ ലെയറായ നെറ്റ്വർക്ക് ലെയറിലാണ് (Network Layer - Layer 3) റൂട്ടറുകൾ (Routers) പ്രവർത്തിക്കുന്നത്.",
    "subtopic": "OSI Reference Model & Networking Devices"
  },
  {
    "id": "PSC_191_2015_045",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "45. Which of the following memory has the shortest access time ?",
    "option_a": "Virtual memory",
    "option_b": "Cache memory",
    "option_c": "External memory",
    "option_d": "Register",
    "correct_answer": "D",
    "explanation": "CPU Registers are located directly inside the CPU core and operate at core clock speeds, giving them the shortest access time (sub-nanosecond), faster than cache memory or RAM.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ഏറ്റവും ഉയർന്ന വേഗതയും ഏറ്റവും കുറഞ്ഞ ആക്സസ്സ് സമയവുമുള്ള (Shortest Access Time) മെമ്മറിയാണ് പ്രോസസ്സറിനുള്ളിലെ രജിസ്റ്ററുകൾ (Registers).",
    "subtopic": "Memory Hierarchy & Registers"
  },
  {
    "id": "PSC_191_2015_046",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "46. ASCII has how many codes ?",
    "option_a": "254",
    "option_b": "255",
    "option_c": "256",
    "option_d": "265",
    "correct_answer": "C",
    "explanation": "Standard 7-bit ASCII defines 128 characters (0 to 127). The full 8-bit Extended ASCII standard provides a total of 256 unique codes (values 0 through 255).\n\n[മലയാളം]: 8-ബിറ്റ് എക്സ്റ്റെൻഡഡ് ASCII കോഡിൽ ആകെ 256 വ്യത്യസ്ത കോഡുകളാണ് (0 മുതൽ 255 വരെ) ഉള്ളത്.",
    "subtopic": "Number Systems & Digital Codes"
  },
  {
    "id": "PSC_191_2015_047",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "47. Electronic storage medium composed of silicon chip is :",
    "option_a": "RAM",
    "option_b": "CD-ROM",
    "option_c": "Hard Disk",
    "option_d": "Floppy Disk",
    "correct_answer": "A",
    "explanation": "RAM (Random Access Memory) is a semiconductor electronic solid-state memory fabricated on integrated silicon chips, whereas HDDs and FDDs use magnetic platters and CD-ROM uses optical polycarbonate.\n\n[മലയാളം]: സിലിക്കൺ ചിപ്പുകളാൽ (Semiconductor Integrated Circuits) നിർമ്മിക്കപ്പെട്ടിട്ടുള്ള ഇലക്ട്രോണിക് മെമ്മറിയാണ് റാം (RAM).",
    "subtopic": "Primary & Semiconductor Memory"
  },
  {
    "id": "PSC_191_2015_048",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "48. The device used in a data communication network to perform conversion between analogue and digital signal is called _____",
    "option_a": "Front end processor",
    "option_b": "Modem",
    "option_c": "Decoder",
    "option_d": "Multiplexer",
    "correct_answer": "B",
    "explanation": "A Modem (Modulator-Demodulator) converts outgoing digital data into analog audio signals for transmission over analog lines and demodulates incoming analog signals back into digital bits.\n\n[മലയാളം]: അനലോഗ് സിഗ്നലുകളെ ഡിജിറ്റലായും ഡിജിറ്റൽ സിഗ്നലുകളെ അനലോഗായും മാറ്റാൻ ഉപയോഗിക്കുന്ന നെറ്റ്വർക്കിംഗ് ഉപകരണമാണ് മോഡം (Modem - Modulator/Demodulator).",
    "subtopic": "Networking Hardware & Modems"
  },
  {
    "id": "PSC_191_2015_049",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "49. Which of the following connection can replace all of the mini-audio jacks on a system unit ?",
    "option_a": "Fire Wire",
    "option_b": "HDMI",
    "option_c": "S/PDIF",
    "option_d": "VESA",
    "correct_answer": "C",
    "explanation": "S/PDIF (Sony/Philips Digital Interface, optical TOSLINK or coaxial RCA) carries multi-channel digital audio over a single cable, replacing multiple 3.5mm analog mini-audio jacks.\n\n[മലയാളം]: ഒന്നിലധികം അനലോഗ് 3.5mm ഓഡിയോ ജാക്കുകൾക്ക് പകരമായി ഒറ്റ കേബിളിലൂടെ ഉയർന്ന നിലവാരമുള്ള ഡിജിറ്റൽ ഓഡിയോ കൈമാറാൻ S/PDIF (Sony/Philips Digital Interface) ഉപയോഗിക്കുന്നു.",
    "subtopic": "Audio I/O Systems & Interfacing"
  },
  {
    "id": "PSC_191_2015_050",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "50. Which of the following ports would you most likely find built into a Motherboard ?",
    "option_a": "DVI port",
    "option_b": "Keyboard port",
    "option_c": "HDMI port",
    "option_d": "RDA port",
    "correct_answer": "B",
    "explanation": "A keyboard port (historically 5-pin DIN or 6-pin PS/2 mini-DIN) has almost always been directly integrated onto PC motherboards since early IBM AT and ATX standards.\n\n[മലയാളം]: കമ്പ്യൂട്ടർ മദർബോർഡുകളിൽ തുടക്കം മുതലേ നേരിട്ട് ഘടിപ്പിച്ചിട്ടുള്ള പ്രധാന പോർട്ടാണ് കീബോർഡ് പോർട്ട് (PS/2 അല്ലെങ്കിൽ USB).",
    "subtopic": "Motherboard Ports & Connectors"
  },
  {
    "id": "PSC_191_2015_051",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "51. What is the name of the virtual memory file in Windows 2000/XP ?",
    "option_a": "SWAP.SYS",
    "option_b": "SYSTEM.INI",
    "option_c": "CACHE.VM",
    "option_d": "PAGEFILE.SYS",
    "correct_answer": "D",
    "explanation": "In Windows NT/2000/XP/Vista/7/10/11, the hidden system paging file that backs virtual memory on the hard drive is named 'PAGEFILE.SYS'.\n\n[മലയാളം]: വിൻഡോസ് 2000/XP ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിൽ വെർച്വൽ മെമ്മറിക്കായി ഹാർഡ് ഡിസ്കിൽ സൃഷ്ടിക്കപ്പെടുന്ന പേജിംഗ് ഫയലിന്റെ പേര് 'pagefile.sys' എന്നാണ്.",
    "subtopic": "Operating Systems & Virtual Memory"
  },
  {
    "id": "PSC_191_2015_052",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "52. You can find 16-bit ISA slots on which of these buses ?",
    "option_a": "AT bus",
    "option_b": "BT bus",
    "option_c": "PC bus",
    "option_d": "XT bus",
    "correct_answer": "A",
    "explanation": "The original IBM PC and PC/XT used an 8-bit bus, whereas the IBM PC/AT (Advanced Technology) introduced the 16-bit expansion bus architecture known as the AT bus (16-bit ISA).\n\n[മലയാളം]: 16-ബിറ്റ് ISA സ്ലോട്ടുകൾ അവതരിപ്പിച്ചത് IBM PC/AT-ൽ ഉപയോഗിച്ച AT bus ലൂടെയാണ് (പഴയ PC/XT ബസ് 8-ബിറ്റ് ആയിരുന്നു).",
    "subtopic": "Expansion Slots & Bus Architecture"
  },
  {
    "id": "PSC_191_2015_053",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "53. What type of power connector does a hard drive typically use ?",
    "option_a": "Molex",
    "option_b": "Mini",
    "option_c": "Sub-mini",
    "option_d": "Micro",
    "correct_answer": "A",
    "explanation": "Legacy IDE/PATA hard disk drives use a 4-pin Molex peripheral power connector (carrying +12V, +5V, and two ground wires).\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കുകളിലേക്ക് SMPS-ൽ നിന്ന് പവർ നൽകാൻ ഉപയോഗിച്ചിരുന്ന പരമ്പരാഗത 4-പിൻ കണക്ടറാണ് മോലെക്സ് കണക്ടർ (Molex Connector).",
    "subtopic": "Power Supplies & Internal Cabling"
  },
  {
    "id": "PSC_191_2015_054",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "54. When a key is pressed on keyboard, which standard is used for converting the keystroke into the corresponding bits ?",
    "option_a": "ISO",
    "option_b": "ANSI",
    "option_c": "EBCDIC",
    "option_d": "ASCII",
    "correct_answer": "D",
    "explanation": "Keyboards generate scan codes which are translated by the keyboard driver into standardized character encoding bits following ASCII.\n\n[മലയാളം]: കീബോർഡിൽ കീ പ്രസ്സ് ചെയ്യുമ്പോൾ ആ അക്ഷരത്തെ കമ്പ്യൂട്ടറിന് മനസ്സിലാകുന്ന ബിറ്റുകളാക്കി മാറ്റാൻ ഉപയോഗിക്കുന്ന സ്റ്റാൻഡേർഡ് എൻകോഡിംഗ് ASCII ആണ്.",
    "subtopic": "Keyboard Technology & Character Codes"
  },
  {
    "id": "PSC_191_2015_055",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "55. Which term describes the flow of a static electrical charge from a person to the inside of the PC ?",
    "option_a": "EMI",
    "option_b": "ESD",
    "option_c": "HDMI",
    "option_d": "TTFN",
    "correct_answer": "B",
    "explanation": "ESD stands for Electrostatic Discharge, the sudden flow of static electricity accumulated on a technician into sensitive semiconductor components, which can damage chips.\n\n[മലയാളം]: മനുഷ്യശരീരത്തിൽ അടിഞ്ഞുകൂടുന്ന സ്റ്റാറ്റിക് വൈദ്യുതി കമ്പ്യൂട്ടറിലെ സൂക്ഷ്മ ചിപ്പുകളിലേക്ക് പ്രവഹിച്ച് അവ തകരാറിലാകുന്ന പ്രതിഭാസമാണ് ESD (Electrostatic Discharge).",
    "subtopic": "Safety, Preventive Maintenance & ESD"
  },
  {
    "id": "PSC_191_2015_056",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "56. BIOS stands for _____",
    "option_a": "Bootstrap Initial Operating System",
    "option_b": "Basic Input Output Start-up",
    "option_c": "Basic Initial Open Standard",
    "option_d": "Basic Input Output System",
    "correct_answer": "D",
    "explanation": "BIOS stands for Basic Input/Output System, the firmware stored in non-volatile ROM/Flash memory used to perform hardware initialization during booting.\n\n[മലയാളം]: BIOS-ന്റെ പൂർണ്ണരൂപം 'Basic Input Output System' എന്നാണ്. കമ്പ്യൂട്ടർ ഓൺ ചെയ്യുമ്പോൾ ഹാർഡ്‌വെയറുകളെ പരിശോധിക്കുന്ന ഫേംവെയർ ആണിത്.",
    "subtopic": "BIOS & Motherboard Architecture"
  },
  {
    "id": "PSC_191_2015_057",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "57. What is an internal network designed to provide and disseminate information to internal staff by using the look and feel of the World Wide Web ?",
    "option_a": "Internet",
    "option_b": "Intranet",
    "option_c": "Extranet",
    "option_d": "Local area network",
    "correct_answer": "B",
    "explanation": "An Intranet is a private internal network restricted to an organization's employees, using standard internet protocols (HTTP, TCP/IP) and web pages for internal communication.\n\n[മലയാളം]: ഒരു സ്ഥാപനത്തിലെ ജീവനക്കാർക്ക് മാത്രമായി വെബ് സാങ്കേതികവിദ്യ ഉപയോഗിച്ച് വിവരങ്ങൾ കൈമാറാൻ തയ്യാറാക്കിയിട്ടുള്ള സ്വകാര്യ നെറ്റ്‌വർക്കാണ് ഇൻട്രാനെറ്റ് (Intranet).",
    "subtopic": "Networking Architectures"
  },
  {
    "id": "PSC_191_2015_058",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "58. The bus between CPU and memory is called :",
    "option_a": "Address bus",
    "option_b": "Data bus",
    "option_c": "System bus",
    "option_d": "I/O bus",
    "correct_answer": "C",
    "explanation": "The high-speed bus connecting the CPU to the primary system memory (via the Northbridge or memory controller) is called the System Bus (or Front-Side Bus).\n\n[മലയാളം]: സിപിയുവിനെയും പ്രധാന മെമ്മറിയെയും പരസ്പരം ബന്ധിപ്പിക്കുന്ന അതിവേഗ ബസ്സിനെ 'സിസ്റ്റം ബസ്' (System Bus / FSB) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Bus Architecture"
  },
  {
    "id": "PSC_191_2015_059",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "59. How many sticks of RAM do you need to fill slot in a computer that can use 168-pin DIMMs ?",
    "option_a": "One",
    "option_b": "Two",
    "option_c": "Four",
    "option_d": "Eight",
    "correct_answer": "A",
    "explanation": "Unlike older 30-pin and 72-pin SIMMs which had to be installed in pairs to match the CPU's 32-bit/64-bit bus, a 168-pin DIMM natively provides a full 64-bit data path, so only ONE stick is needed per bank.\n\n[മലയാളം]: 168-പിൻ DIMM റാമുകൾ 64-ബിറ്റ് ഡാറ്റാ പാത്ത് നൽകുന്നതിനാൽ ഒരു സ്ലോട്ടിൽ ഒറ്റ റാം സ്റ്റിക്ക് (One) മാത്രം ഘടിപ്പിച്ചാൽ തന്നെ സിസ്റ്റം പ്രവർത്തിക്കും (പഴയ SIMM-കൾ രണ്ട് വീതമായിരുന്നു).",
    "subtopic": "Memory Modules & Installation"
  },
  {
    "id": "PSC_191_2015_060",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "60. What is the correct boot sequence for a PC ?",
    "option_a": "CPU, POST, Power Good, Boot Loader, OS",
    "option_b": "POST, Power Good, CPU, Boot Loader, OS",
    "option_c": "Power Good, Boot Loader, CPU, POST, OS",
    "option_d": "Power Good, CPU, POST, Boot Loader, OS",
    "correct_answer": "D",
    "explanation": "When powered on, the SMPS stabilizes voltage and sends the 'Power Good' signal to the motherboard timer; the CPU initializes and starts execution; BIOS runs POST (Power-On Self-Test); BIOS loads the Boot Loader from MBR; the Boot Loader starts the Operating System.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിന്റെ ശരിയായ ബൂട്ടിംഗ് ക്രമം: SMPS-ൽ നിന്ന് Power Good സിഗ്നൽ വരുന്നു -> CPU റീസെറ്റ് റിലീസ് ചെയ്ത് തുടങ്ങുന്നു -> POST പരിശോധന നടത്തുന്നു -> Boot Loader ലോഡ് ചെയ്യുന്നു -> OS പ്രവർത്തിക്കുന്നു.",
    "subtopic": "PC Boot Sequence & POST"
  },
  {
    "id": "PSC_191_2015_061",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "61. You can receive an \"Invalid media\" error when trying to access a hard drive. What is the most likely cause of the error ?",
    "option_a": "The drive has not been partitioned",
    "option_b": "The drive has been not formatted",
    "option_c": "The drive has been not set to active",
    "option_d": "The drive has died",
    "correct_answer": "B",
    "explanation": "In MS-DOS and early Windows, accessing a drive letter assigned to an unformatted partition triggers the error message 'Invalid media type reading drive X:'. Formatting initializes the file system structures.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിൽ പാർട്ടീഷൻ ചെയ്തിട്ടുണ്ടെങ്കിലും അതിലേക്ക് ഫയൽ സിസ്റ്റം ഫോർമാറ്റ് ചെയ്തിട്ടില്ലെങ്കിൽ (Not Formatted) 'Invalid media' എന്ന എറർ ലഭിക്കുന്നു.",
    "subtopic": "Storage Troubleshooting & DOS Errors"
  },
  {
    "id": "PSC_191_2015_062",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "62. What is the minimum capacity of a DVD ?",
    "option_a": "7.34 GB",
    "option_b": "4.37 GB",
    "option_c": "3.47 GB",
    "option_d": "650 MB",
    "correct_answer": "B",
    "explanation": "A standard single-sided, single-layer DVD (DVD-5) has a nominal capacity of 4.7 GB (decimal), which corresponds to exactly 4.37 GiB (binary gigabytes).\n\n[മലയാളം]: സാധാരണ സിംഗിൾ ലെയർ ഡിവിഡിയുടെ (DVD-5) കുറഞ്ഞ സ്റ്റോറേജ് കപ്പാസിറ്റി 4.37 GB (4.7 GB ഡെസിമൽ) ആണ്.",
    "subtopic": "Optical Storage Devices"
  },
  {
    "id": "PSC_191_2015_063",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "63. AutoPlay reads which of the following file when an optical disc is inserted ?",
    "option_a": "AUTORUN.INF",
    "option_b": "AUTOPLAY.INF",
    "option_c": "AUTORUN.INI",
    "option_d": "AUTORUN.EXE",
    "correct_answer": "A",
    "explanation": "Windows AutoPlay / AutoRun looks for a configuration text file named 'AUTORUN.INF' in the root directory of the inserted CD/DVD media.\n\n[മലയാളം]: വിൻഡോസിൽ ഒരു സിഡിയോ ഡിവിഡിയോ ഇടുമ്പോൾ ഓട്ടോപ്ലേ പ്രവർത്തിക്കാനായി റൂട്ട് ഡയറക്ടറിയിൽ തിരയുന്ന ഫയലാണ് 'AUTORUN.INF'.",
    "subtopic": "Storage Media & Windows Execution"
  },
  {
    "id": "PSC_191_2015_064",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "64. Which is the command used to make TEST.TXT file read-only ?",
    "option_a": "ATTRIB TEST.TXT - R",
    "option_b": "ATTRIB TEST.TXT + R",
    "option_c": "READONLY TEST.TXT",
    "option_d": "TEST.TXT/READONLY",
    "correct_answer": "B",
    "explanation": "In Windows and DOS command prompts, 'ATTRIB +R filename' sets the Read-Only file attribute (+ adds attribute, - removes attribute).\n\n[മലയാളം]: കമാൻഡ് പ്രോംപ്റ്റിൽ ഒരു ഫയലിനെ റീഡ്-ഒൺലി (Read-Only) ആക്കി മാറ്റാൻ 'ATTRIB TEST.TXT +R' എന്ന കമാൻഡാണ് നൽകേണ്ടത് (+R എന്നാൽ റീഡ് ഒൺലി ഓൺ ചെയ്യുക).",
    "subtopic": "System Commands & File Attributes"
  },
  {
    "id": "PSC_191_2015_065",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "65. Which chip does the CPU uses to communicate with high-speed devices such as video cards of RAM ?",
    "option_a": "Scan code",
    "option_b": "CMOS",
    "option_c": "South bridge",
    "option_d": "North bridge",
    "correct_answer": "D",
    "explanation": "In traditional PC motherboard chipset architecture, the Northbridge (Memory Controller Hub) manages high-speed communication between the CPU, RAM, and PCIe/AGP graphics cards.\n\n[മലയാളം]: മദർബോർഡിൽ സിപിയുവിനെയും അതിവേഗ ഘടകങ്ങളായ റാം (RAM), ഗ്രാഫിക്സ് കാർഡ് (AGP/PCIe) എന്നിവയെയും ബന്ധിപ്പിക്കുന്ന ചിപ്പാണ് നോർത്ത് ബ്രിഡ്ജ് (North bridge).",
    "subtopic": "Chipset Architecture: Northbridge & Southbridge"
  },
  {
    "id": "PSC_191_2015_066",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "66. Why SDRAM is faster than regular DRAM ?",
    "option_a": "It has few pins, resulting in fewer corrupt bits",
    "option_b": "It uses dual channel architecture",
    "option_c": "It makes two processes per clock cycle",
    "option_d": "It runs synchronously with the system clock",
    "correct_answer": "D",
    "explanation": "SDRAM (Synchronous DRAM) synchronizes all its memory operations with the system clock bus, eliminating wait states and allowing pipelined commands compared to asynchronous DRAM.\n\n[മലയാളം]: സിസ്റ്റം ക്ലോക്കിനൊപ്പം ഒരേ താളത്തിൽ സമന്വയിച്ച് പ്രവർത്തിക്കുന്നതിനാലാണ് (Synchronously with the system clock) SDRAM സാധാരണ DRAM-നേക്കാൾ വേഗത്തിൽ പ്രവർത്തിക്കുന്നത്.",
    "subtopic": "RAM Technologies (SDR, DDR)"
  },
  {
    "id": "PSC_191_2015_067",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "67. What normally happens when you press the F1 key when a program is running ?",
    "option_a": "The program closes",
    "option_b": "The System Shut down",
    "option_c": "The help facility of the program is opened",
    "option_d": "You can do BIOS settings",
    "correct_answer": "C",
    "explanation": "In almost all GUI operating systems and applications, the universal keyboard shortcut key 'F1' opens the built-in Help system or documentation.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ഭൂരിഭാഗം സോഫ്റ്റ്‌വെയറുകളിലും F1 കീ അമർത്തിയാൽ ആ പ്രോഗ്രാമിന്റെ സഹായ വിൻഡോ (Help facility) ആണ് തുറന്നുവരിക.",
    "subtopic": "Keyboard Shortcuts & System Utilities"
  },
  {
    "id": "PSC_191_2015_068",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "68. ISO-9960 is related with the _____",
    "option_a": "Standard for encoding data on CD-ROM",
    "option_b": "Standard for printer",
    "option_c": "Standard for information processing",
    "option_d": "Standard for networking",
    "correct_answer": "A",
    "explanation": "ISO 9660 (often printed as ISO-9960 in the question) is the international standard file system format for data stored on CD-ROM media across different operating systems.\n\n[മലയാളം]: സിഡി-റോമിൽ (CD-ROM) ഡാറ്റ എൻകോഡ് ചെയ്യുന്നതിനുള്ള സാർവ്വദേശീയ ഫയൽ സിസ്റ്റം സ്റ്റാൻഡേർഡാണ് ISO 9660.",
    "subtopic": "Optical Storage Standards"
  },
  {
    "id": "PSC_191_2015_069",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "69. Of the following, what do USB and FireWire connections have in common ?",
    "option_a": "Both are used for connecting keyboards",
    "option_b": "Both support dual monitors",
    "option_c": "Both support hot-swapping devices",
    "option_d": "Both use D sub miniature connectors",
    "correct_answer": "C",
    "explanation": "Both USB and FireWire (IEEE 1394) support Hot-Swapping (plugging or unplugging devices while the computer is powered on and running without rebooting).\n\n[മലയാളം]: USB, FireWire എന്നീ രണ്ട് ഇന്റർഫേസുകളുടെയും പൊതുവായ പ്രത്യേകത കമ്പ്യൂട്ടർ ഓഫ് ചെയ്യാതെ തന്നെ ഉപകരണങ്ങൾ ഘടിപ്പിക്കാനും മാറ്റാനും സാധിക്കും (Hot-Swapping) എന്നതാണ്.",
    "subtopic": "Bus Standards: USB & FireWire"
  },
  {
    "id": "PSC_191_2015_070",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "70. What is true about a double-sided DIMM ?",
    "option_a": "It has memory chips on the front and back",
    "option_b": "It can be installed forward or backward",
    "option_c": "It is twice as fast as single sided DIMM",
    "option_d": "It has half the capacity of a quad sided DIMM",
    "correct_answer": "A",
    "explanation": "A double-sided DIMM has DRAM integrated circuit chips mounted on both the front and back surfaces of the printed circuit board.\n\n[മലയാളം]: ഡബിൾ-സൈഡഡ് DIMM റാമുകളിൽ സർക്യൂട്ട് ബോർഡിന്റെ മുന്നിലും പിന്നിലും മെമ്മറി ചിപ്പുകൾ ഘടിപ്പിച്ചിട്ടുണ്ടാകും.",
    "subtopic": "RAM Module Construction"
  },
  {
    "id": "PSC_191_2015_071",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "71. Which type of protocol is used by interface for Public Data Network ?",
    "option_a": "X.12",
    "option_b": "X.15",
    "option_c": "X.20",
    "option_d": "X.25",
    "correct_answer": "D",
    "explanation": "ITU-T X.25 is the classic standard protocol suite for packet-switched communication over Public Data Networks (PDNs).\n\n[മലയാളം]: പബ്ലിക് ഡാറ്റാ നെറ്റ്‌വർക്കുകളിലെ (PDN) പാക്കറ്റ് സ്വിച്ചിംഗിനായി ഉപയോഗിക്കുന്ന സ്റ്റാൻഡേർഡ് പ്രോട്ടോക്കോളാണ് X.25.",
    "subtopic": "Network Protocols & Standards"
  },
  {
    "id": "PSC_191_2015_072",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "72. A 1xx POST error code indicates problem with the :",
    "option_a": "RAM",
    "option_b": "Motherboard",
    "option_c": "HDD",
    "option_d": "Video",
    "correct_answer": "B",
    "explanation": "In standard IBM/legacy BIOS POST codes, 1xx errors indicate system board (motherboard) failures, 2xx indicates RAM/memory, and 3xx indicates keyboard.\n\n[മലയാളം]: BIOS POST പരിശോധനയിലെ 1xx (ഉദാ: 101, 199) എറർ കോഡുകൾ മദർബോർഡിലെ (Motherboard/System Board) തകരാറുകളെയാണ് സൂചിപ്പിക്കുന്നത് (2xx റാമും, 3xx കീബോർഡുമാണ്).",
    "subtopic": "Diagnostics & POST Error Codes"
  },
  {
    "id": "PSC_191_2015_073",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "73. Silicon lubricant is used with which of the following ?",
    "option_a": "Read/Write head",
    "option_b": "Keyboard",
    "option_c": "Mouse",
    "option_d": "Rollers in printer",
    "correct_answer": "D",
    "explanation": "Pure silicon-based lubricant/oil is used during printer service maintenance to lubricate gears, carriage guide rails, and paper feed roller mechanisms without degrading rubber.\n\n[മലയാളം]: പ്രിന്ററുകളിലെ ഗിയറുകളും റോളർ സംവിധാനങ്ങളും (Rollers in printer) കൃത്യമായി പ്രവർത്തിക്കാനാണ് സിലിക്കൺ ലൂബ്രിക്കന്റ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Preventive Maintenance & Printer Servicing"
  },
  {
    "id": "PSC_191_2015_074",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "74. The normal size of a Hard drive sector is _____",
    "option_a": "512 kB",
    "option_b": "512 Bytes",
    "option_c": "640 kB",
    "option_d": "640 Bytes",
    "correct_answer": "B",
    "explanation": "The traditional standard sector size for hard disk drives since the 1980s is 512 bytes per sector (prior to 4Kn Advanced Format).\n\n[മലയാളം]: ഒരു ഹാർഡ് ഡിസ്കിലെ സാധാരണ ഒരു സെക്ടറിന്റെ വലുപ്പം (Sector size) 512 ബൈറ്റുകളാണ് (512 Bytes).",
    "subtopic": "Hard Drive Geometry & Sectors"
  },
  {
    "id": "PSC_191_2015_075",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "75. The Master Boot Record (MBR) is located at the _____ of a hard disk.",
    "option_a": "Track 0 Sector 0",
    "option_b": "Track 1 Sector 1",
    "option_c": "Track 0 Sector 1",
    "option_d": "Track 1 Sector 0",
    "correct_answer": "A",
    "explanation": "The Master Boot Record (MBR) is the very first physical sector on a partitioned hard disk drive (historically referenced in PSC as Track 0 Sector 0 / Cylinder 0, Head 0, Sector 1 or LBA 0).\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിലെ ഏറ്റവും ആദ്യത്തെ ഭാഗമായ ട്രാക്ക് 0 സെക്ടർ 0-ൽ (Track 0 Sector 0) ആണ് മാസ്റ്റർ ബൂട്ട് റെക്കോർഡ് (MBR) സ്ഥിതി ചെയ്യുന്നത്.",
    "subtopic": "Partitions & Master Boot Record (MBR)"
  },
  {
    "id": "PSC_191_2015_076",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "76. Which of the following is the last processor designed by Intel which uses slot type socket ?",
    "option_a": "Celeron",
    "option_b": "Core 2 Duo",
    "option_c": "Pentium III",
    "option_d": "80486",
    "correct_answer": "C",
    "explanation": "Intel used the edge-connector Slot 1 architecture on Pentium II and early Pentium III (Katmai) before shifting entirely back to pin-grid sockets (Socket 370).\n\n[മലയാളം]: സ്ലോട്ട് ടൈപ്പ് സോക്കറ്റ് (Slot 1) ഉപയോഗിച്ച് ഇന്റൽ നിർമ്മിച്ച അവസാനത്തെ പ്രോസസ്സർ പെന്റിയം III (Pentium III) ആണ്.",
    "subtopic": "Processor Sockets & Slots"
  },
  {
    "id": "PSC_191_2015_077",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "77. Which service is used to translate domain name to IP address ?",
    "option_a": "NFS",
    "option_b": "TCP",
    "option_c": "NIS",
    "option_d": "DNS",
    "correct_answer": "D",
    "explanation": "DNS (Domain Name System) translates human-friendly host domain names (like www.google.com) into machine-readable numerical IP addresses.\n\n[മലയാളം]: ഡൊമെയ്ൻ പേരുകളെ ഐ.പി. അഡ്രസുകളാക്കി മാറ്റാൻ (Domain Name to IP address) ഉപയോഗിക്കുന്ന നെറ്റ്വർക്കിംഗ് സംവിധാനമാണ് DNS (Domain Name System).",
    "subtopic": "Network Services & Protocols (DNS)"
  },
  {
    "id": "PSC_191_2015_078",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "78. What command is used in vi editor in Linux operating sytem to move back to the beginning of a word ?",
    "option_a": "w",
    "option_b": "e",
    "option_c": "b",
    "option_d": "a",
    "correct_answer": "C",
    "explanation": "In Linux vi / vim editor in command mode, 'b' moves the cursor backward to the beginning of the previous/current word ('w' moves forward to next word, 'e' to end of word).\n\n[മലയാളം]: ലിനക്സിലെ vi എഡിറ്ററിൽ ഒരു വാക്കിന്റെ തുടക്കത്തിലേക്ക് പിന്നിലേക്ക് നീങ്ങാൻ 'b' (back) കമാൻഡ് ആണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Linux Commands & vi Editor"
  },
  {
    "id": "PSC_191_2015_079",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "79. Which of the following is not an output device ?",
    "option_a": "Plotter",
    "option_b": "Scanner",
    "option_c": "Printer",
    "option_d": "Monitor",
    "correct_answer": "B",
    "explanation": "A Scanner is an input device used to digitize documents into the computer, whereas Plotter, Printer, and Monitor are output devices.\n\n[മലയാളം]: സ്കാനർ (Scanner) ഒരു ഇൻപുട്ട് ഡിവൈസ് ആണ്; പ്ലോട്ടർ, പ്രിന്റർ, മോണിറ്റർ എന്നിവ ഔട്ട്പുട്ട് ഡിവൈസുകളാണ്.",
    "subtopic": "I/O Devices & Peripherals"
  },
  {
    "id": "PSC_191_2015_080",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "80. Which of the following processors was the first dual-core designed by AMD ?",
    "option_a": "Sempron",
    "option_b": "Duron",
    "option_c": "Athlon 64 X2",
    "option_d": "Phenom II X2",
    "correct_answer": "C",
    "explanation": "The Athlon 64 X2 was AMD's first native dual-core desktop microprocessor, released in 2005.\n\n[മലയാളം]: AMD നിർമ്മിച്ച ആദ്യത്തെ ഡ്യുവൽ-കോർ (Dual-core) പ്രോസസ്സറാണ് Athlon 64 X2.",
    "subtopic": "CPU Architecture & Multicore Processing"
  },
  {
    "id": "PSC_191_2015_081",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "81. Who raised patriotism to the pedestal of mother worship and said, 'I know my country as my mother, I adore her, I worship her' ?",
    "option_a": "Swami Vivekananda",
    "option_b": "Aurobindo Ghosh",
    "option_c": "B.G. Tilak",
    "option_d": "B.C. Chatterjee",
    "correct_answer": "B",
    "explanation": "Sri Aurobindo Ghosh elevated nationalism and patriotism to the level of divine mother worship with this famous quote.\n\n[മലയാളം]: 'ഞാൻ എന്റെ രാജ്യത്തെ എന്റെ അമ്മയായി കാണുന്നു, അവളെ ആരാധിക്കുന്നു' എന്ന് പ്രസ്താവിച്ചത് ശ്രീ അരവിന്ദ ഘോഷ് (Aurobindo Ghosh) ആണ്.",
    "subtopic": "Indian National Movement"
  },
  {
    "id": "PSC_191_2015_082",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "82. The Kanpur Conference, which is regarded as the formal foundation of the communist party in India in 1925, was held under the Presidency of :",
    "option_a": "Acharya Narendra Dev",
    "option_b": "S.A. Dange",
    "option_c": "M.N. Roy",
    "option_d": "Singarvelu Chettiar",
    "correct_answer": "D",
    "explanation": "The Kanpur Communist Conference in December 1925, which formally founded the Communist Party of India (CPI), was presided over by Singaravelu Chettiar.\n\n[മലയാളം]: 1925 ഡിസംബറിൽ കമ്മ്യൂണിസ്റ്റ് പാർട്ടി രൂപീകരിക്കപ്പെട്ട കാൺപൂർ സമ്മേളനത്തിന്റെ അധ്യക്ഷൻ സിംഗാരവേലു ചെട്ടിയാർ (Singaravelu Chettiar) ആയിരുന്നു.",
    "subtopic": "Indian History"
  },
  {
    "id": "PSC_191_2015_083",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "83. Which day is observed as 'Malala Day' by the UNO ?",
    "option_a": "July 12",
    "option_b": "June 12",
    "option_c": "June 21",
    "option_d": "August 21",
    "correct_answer": "A",
    "explanation": "July 12 (the birthday of Nobel laureate Malala Yousafzai) was declared 'Malala Day' by the United Nations to support world education for youth.\n\n[മലയാളം]: ഐക്യരാഷ്ട്രസഭ ജൂലൈ 12 (July 12) ആണ് 'മലാല ദിന'മായി ആചരിക്കുന്നത്.",
    "subtopic": "International Days & Current Affairs"
  },
  {
    "id": "PSC_191_2015_084",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "84. The southern most river in India :",
    "option_a": "Neyyar",
    "option_b": "Kallada",
    "option_c": "Karamana",
    "option_d": "Vamanapuram river",
    "correct_answer": "A",
    "explanation": "Neyyar river flowing through Thiruvananthapuram district in Kerala is the southernmost river in the Indian mainland (among the given options).\n\n[മലയാളം]: നൽകിയിരിക്കുന്നവയിൽ ഇന്ത്യയിലെ ഏറ്റവും തെക്കേ അറ്റത്തുള്ള നദി നെയ്യാർ (Neyyar) ആണ്.",
    "subtopic": "Indian & Kerala Geography"
  },
  {
    "id": "PSC_191_2015_085",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "85. The city Srinagar is situated near :",
    "option_a": "Satlaj",
    "option_b": "Jhelum",
    "option_c": "Beas",
    "option_d": "Ravi",
    "correct_answer": "B",
    "explanation": "The historic city of Srinagar in Jammu and Kashmir is situated on both banks of the Jhelum River.\n\n[മലയാളം]: ജമ്മു കശ്മീരിലെ ശ്രീനഗർ നഗരം ഝലം (Jhelum) നദിയുടെ തീരത്താണ് സ്ഥിതി ചെയ്യുന്നത്.",
    "subtopic": "Indian Geography"
  },
  {
    "id": "PSC_191_2015_086",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "86. Who was known as 'Kerala Lincoln' ?",
    "option_a": "Dr. Sukumar Azneekode",
    "option_b": "Sree Narayana Guru",
    "option_c": "Pandit Karuppan",
    "option_d": "Dr. Palpu",
    "correct_answer": "C",
    "explanation": "Pandit K.P. Karuppan was hailed as the 'Lincoln of Kerala' for his relentless campaign against social discrimination and upliftment of marginalized communities.\n\n[മലയാളം]: 'കേരള ലിങ്കൺ' എന്നറിയപ്പെടുന്നത് പണ്ഡിറ്റ് കെ.പി. കറുപ്പൻ (Pandit Karuppan) ആണ്.",
    "subtopic": "Kerala Renaissance Leaders"
  },
  {
    "id": "PSC_191_2015_087",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "87. Which of the following was the Chief organiser of the Revolt of 1857 in Bihar ?",
    "option_a": "Amar Singh",
    "option_b": "Bahadurshah II",
    "option_c": "Kunwar Singh",
    "option_d": "Begum Hasrat Mahal",
    "correct_answer": "C",
    "explanation": "Kunwar Singh (Veer Kunwar Singh of Jagdishpur) was the principal leader and organizer of the 1857 First War of Independence in Bihar.\n\n[മലയാളം]: 1857-ലെ ഒന്നാം സ്വാതന്ത്ര്യ സമരത്തിൽ ബീഹാറിലെ വിപ്ലവത്തിന് നേതൃത്വം നൽകിയത് കുൻവർ സിംഗ് (Kunwar Singh) ആയിരുന്നു.",
    "subtopic": "Revolt of 1857"
  },
  {
    "id": "PSC_191_2015_088",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "88. The Imperial Bank of India, after nationalisation, was given the name of :",
    "option_a": "Reserve Bank of India",
    "option_b": "Bank of India",
    "option_c": "Indian Bank",
    "option_d": "State Bank of India",
    "correct_answer": "D",
    "explanation": "Under the State Bank of India Act 1955, the Imperial Bank of India was nationalized on July 1, 1955, and renamed as the State Bank of India (SBI).\n\n[മലയാളം]: 1955-ൽ ഇംപീരിയൽ ബാങ്ക് ഓഫ് ഇന്ത്യയെ ദേശസാൽക്കരിച്ച ശേഷമാണ് 'സ്റ്റേറ്റ് ബാങ്ക് ഓഫ് ഇന്ത്യ' (State Bank of India - SBI) എന്ന് പുനർനാമകരണം ചെയ്തത്.",
    "subtopic": "Indian Banking & Economy"
  },
  {
    "id": "PSC_191_2015_089",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "89. In which state in India was Panchayati Raj first introduced ?",
    "option_a": "UP",
    "option_b": "Rajasthan",
    "option_c": "Madhya Pradesh",
    "option_d": "Andra Pradesh",
    "correct_answer": "B",
    "explanation": "Panchayati Raj was first inaugurated in India by Prime Minister Jawaharlal Nehru on October 2, 1959, in Nagaur district, Rajasthan.\n\n[മലയാളം]: ഇന്ത്യയിൽ ആദ്യമായി പഞ്ചായത്തിരാജ് സംവിധാനം നടപ്പിലാക്കിയത് 1959 ഒക്ടോബർ 2-ന് രാജസ്ഥാനിലെ നാഗോർ ജില്ലയിലാണ്.",
    "subtopic": "Indian Polity & Panchayati Raj"
  },
  {
    "id": "PSC_191_2015_090",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "90. The First Muslim President of the Indian National Congress was :",
    "option_a": "Badruddin Tyabji",
    "option_b": "Abul Kalam Azad",
    "option_c": "Hakkim Ajmal Khan",
    "option_d": "Hasrat Mohani",
    "correct_answer": "A",
    "explanation": "Badruddin Tyabji presided over the 3rd session of the Indian National Congress held at Madras in 1887, becoming its first Muslim President.\n\n[മലയാളം]: ഇന്ത്യൻ നാഷണൽ കോൺഗ്രസിന്റെ (INC) ആദ്യത്തെ മുസ്ലിം പ്രസിഡന്റ് ബദ്റുദ്ദീൻ ത്യാബ്ജി (Badruddin Tyabji - 1887 മദ്രാസ് സമ്മേളനം) ആയിരുന്നു.",
    "subtopic": "Indian National Congress"
  },
  {
    "id": "PSC_191_2015_091",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "91. Who started Siddhasamajam in Vatakara ?",
    "option_a": "Dr. Velukutti Arayan",
    "option_b": "Swami Sivananda Paramahamsa",
    "option_c": "Vagbhatanandan",
    "option_d": "Alathoor Sivanandayogi",
    "correct_answer": "B",
    "explanation": "Swami Sivananda Paramahamsa founded the Siddha Samajam at Vatakara in Kozhikode district in 1921.\n\n[മലയാളം]: വടകരയിൽ സിദ്ധസമാജം (Siddhasamajam) സ്ഥാപിച്ചത് സ്വാമി ശിവാനന്ദ പരമഹംസർ (Swami Sivananda Paramahamsa) ആണ്.",
    "subtopic": "Kerala Renaissance"
  },
  {
    "id": "PSC_191_2015_092",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "92. Who wrote the book \"Swathanthra Samudayam\" ?",
    "option_a": "E.M.S. Namboodirippadu",
    "option_b": "Sree Narayana Guru",
    "option_c": "E. Madhavan",
    "option_d": "Ayyankali",
    "correct_answer": "C",
    "explanation": "\"Swathanthra Samudayam\" was written by social reformer E. Madhavan in 1934.\n\n[മലയാളം]: 'സ്വതന്ത്ര സമുദായം' എന്ന പ്രശസ്ത ഗ്രന്ഥം രചിച്ചത് ഇ. മാധവൻ (E. Madhavan) ആണ്.",
    "subtopic": "Kerala Renaissance Literature"
  },
  {
    "id": "PSC_191_2015_093",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "93. Which of the following river flows westward ?",
    "option_a": "Cauvery",
    "option_b": "Krishna",
    "option_c": "Narmada",
    "option_d": "Mahanadi",
    "correct_answer": "C",
    "explanation": "The Narmada and Tapti rivers flow westward through rift valleys and empty into the Arabian Sea. Most other major peninsular rivers flow east into the Bay of Bengal.\n\n[മലയാളം]: നൽകിയിരിക്കുന്നവയിൽ പടിഞ്ഞാറോട്ട് ഒഴുകി അറബിക്കടലിൽ ചേരുന്ന നദി നർമ്മദ (Narmada) ആണ് (കാവേരി, കൃഷ്ണ, മഹാനദി എന്നിവ കിഴക്കോട്ടാണ് ഒഴുകുന്നത്).",
    "subtopic": "Indian Rivers & Geography"
  },
  {
    "id": "PSC_191_2015_094",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "94. Which place is known as the Capital of Indian Coal ?",
    "option_a": "Ranchi",
    "option_b": "Danbad",
    "option_c": "Jamshedpur",
    "option_d": "Culcutta",
    "correct_answer": "B",
    "explanation": "Dhanbad in Jharkhand is famous as the 'Coal Capital of India' due to its vast coal mines like Jharia.\n\n[മലയാളം]: ഇന്ത്യയുടെ കൽക്കരി തലസ്ഥാനം (Coal Capital of India) എന്നറിയപ്പെടുന്ന നഗരം ജാർഖണ്ഡിലെ ധൻബാദ് (Dhanbad) ആണ്.",
    "subtopic": "Indian Geography & Resources"
  },
  {
    "id": "PSC_191_2015_095",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "95. Which amendment of Indian Constitution guarantee free and compulsory education to children up to 14 years ?",
    "option_a": "85",
    "option_b": "84",
    "option_c": "87",
    "option_d": "86",
    "correct_answer": "D",
    "explanation": "The 86th Constitutional Amendment Act of 2002 inserted Article 21A, guaranteeing free and compulsory education for children aged 6 to 14 as a Fundamental Right.\n\n[മലയാളം]: 6 മുതൽ 14 വയസ്സുവരെയുള്ള കുട്ടികൾക്ക് സൗജന്യവും നിർബന്ധിതവുമായ വിദ്യാഭ്യാസം മൗലികാവകാശമാക്കിയത് 86-ാം ഭരണഘടനാ ഭേദഗതി (2002 - Article 21A) വഴിയാണ്.",
    "subtopic": "Indian Constitution & Fundamental Rights"
  },
  {
    "id": "PSC_191_2015_096",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "96. Name the first Indian language which got classical status ?",
    "option_a": "Tamil",
    "option_b": "Hindi",
    "option_c": "Malayalam",
    "option_d": "Bengali",
    "correct_answer": "A",
    "explanation": "Tamil was the first Indian language to be officially granted Classical Language status by the Government of India in the year 2004.\n\n[മലയാളം]: ഇന്ത്യയിൽ ആദ്യമായി ശ്രേഷ്ഠഭാഷാ പദവി (Classical Status) ലഭിച്ച ഭാഷ തമിഴ് (Tamil - 2004) ആണ്.",
    "subtopic": "Indian Culture & Languages"
  },
  {
    "id": "PSC_191_2015_097",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "97. A Public Service Commission was established in India for the first time by :",
    "option_a": "The Indian Council Act of 1892",
    "option_b": "The Act of 1909",
    "option_c": "The Government of India Act, 1919",
    "option_d": "The Government of India Act, 1935",
    "correct_answer": "C",
    "explanation": "The Government of India Act 1919 (Montagu-Chelmsford Reforms) provided for the establishment of a Public Service Commission, leading to the creation of the Central Public Service Commission in 1926.\n\n[മലയാളം]: ഇന്ത്യയിൽ ആദ്യമായി ഒരു പബ്ലിക് സർവീസ് കമ്മീഷൻ സ്ഥാപിക്കാൻ വ്യവസ്ഥ ചെയ്ത നിയമം ഗവൺമെന്റ് ഓഫ് ഇന്ത്യാ ആക്ട് 1919 (Government of India Act, 1919) ആണ്.",
    "subtopic": "Constitutional Development & PSC History"
  },
  {
    "id": "PSC_191_2015_098",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "98. Rajiv Gandhi International Airport is situated in :",
    "option_a": "Hyderabad",
    "option_b": "Bangalore",
    "option_c": "New Delhi",
    "option_d": "Kanpur",
    "correct_answer": "A",
    "explanation": "Rajiv Gandhi International Airport (HYD) is an international airport serving Hyderabad, the capital city of Telangana.\n\n[മലയാളം]: രാജീവ് ഗാന്ധി ഇന്റർനാഷണൽ എയർപോർട്ട് സ്ഥിതി ചെയ്യുന്നത് ഹൈദരാബാദിലാണ് (Hyderabad).",
    "subtopic": "Airports & Transport in India"
  },
  {
    "id": "PSC_191_2015_099",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "99. Who was the Editor of the journal 'Mitavadi' ?",
    "option_a": "Dr. Palppu",
    "option_b": "Kesavan Asan",
    "option_c": "C. Krishnan",
    "option_d": "Vakkam Abdul Khader Moulavi",
    "correct_answer": "C",
    "explanation": "Mithavadi C. Krishnan was a prominent social reformer, journalist, and the editor and owner of the journal 'Mitavadi' published from Calicut.\n\n[മലയാളം]: 'മിതവാദി' പത്രത്തിന്റെ എഡിറ്റർ സി. കൃഷ്ണൻ (Mitavadi C. Krishnan) ആയിരുന്നു.",
    "subtopic": "Kerala Renaissance & Journalism"
  },
  {
    "id": "PSC_191_2015_100",
    "sheetName": "PSC_Tradesman_191_2015",
    "question": "100. Who founded 'Samathwa Samajam' ?",
    "option_a": "Pattamthanupillai",
    "option_b": "Mannath Padmanabhan",
    "option_c": "V.T. Bhattathirippadu",
    "option_d": "Vaikunda Swamikal",
    "correct_answer": "D",
    "explanation": "Vaikunda Swamikal founded 'Samathwa Samajam' in 1836, which is regarded as the first socio-religious reform movement in Kerala.\n\n[മലയാളം]: 1836-ൽ 'സമത്വ സമാജം' സ്ഥാപിച്ചത് വൈകുണ്ഠ സ്വാമികൾ (Vaikunda Swamikal) ആണ്.",
    "subtopic": "Kerala Renaissance Movements"
  }
];
}


/**
 * Tradesman (Computer Hardware Maintenance) 170/2014 ഷീറ്റ് നിർമ്മിച്ച് 100 ചോദ്യങ്ങളും ചേർക്കുന്നു
 */
function setupPscTradesman170_2014Sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("PSC_Tradesman_170_2014");
  if (!sheet) {
    sheet = ss.insertSheet("PSC_Tradesman_170_2014");
  }

  const headers = [
    "id", "question", "option_a", "option_b", "option_c", "option_d",
    "correct_answer", "explanation", "subtopic"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e3a8a"); // Blue-900 background
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 450);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 180);
    sheet.setColumnWidth(6, 180);
    sheet.setColumnWidth(7, 120);
    sheet.setColumnWidth(8, 400);
    sheet.setColumnWidth(9, 220);
  }

  const existingData = sheet.getDataRange().getValues();
  const existingIds = new Set();
  for (let r = 1; r < existingData.length; r++) {
    if (existingData[r][0]) existingIds.add(String(existingData[r][0]));
  }

  const questions = getPscTradesman170Questions();
  let added = 0;
  questions.forEach(q => {
    if (!existingIds.has(q.id)) {
      sheet.appendRow([
        q.id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation,
        q.subtopic
      ]);
      added++;
    }
  });

  const msg = "✅ Tradesman CHM (170/2014) ഷീറ്റ് വിജയകരമായി തയ്യാറാക്കി! ആകെ " + added + " ചോദ്യങ്ങൾ ചേർത്തു.";
  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {}
}

/**
 * Kerala PSC Tradesman (Computer Hardware Maintenance) - Question Code: 170/2014
 * Complete 100 Official Questions with Final Answer Key & Malayalam Explanations
 */
function getPscTradesman170Questions() {
  return [
  {
    "id": "PSC_170_2014_001",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "1. Which of the following is an impact printer?",
    "option_a": "Inkjet Printer",
    "option_b": "Dot Matrix Printer",
    "option_c": "Laser Printer",
    "option_d": "Thermal Printer",
    "correct_answer": "B",
    "explanation": "Dot Matrix Printers are impact printers that print by physically striking pins against an ink ribbon onto paper. Inkjet, Laser, and Thermal printers are non-impact.\n\n[മലയാളം]: ഡോട്ട് മാട്രിക്സ് പ്രിന്റർ (Dot Matrix Printer) ഒരു ഇംപാക്ട് പ്രിന്ററാണ് (Impact Printer). ഇതിൽ പിന്നുകൾ റിബണിൽ തട്ടിയാണ് അക്ഷരങ്ങൾ പതിപ്പിക്കുന്നത്.",
    "subtopic": "Printers: Impact vs Non-Impact"
  },
  {
    "id": "PSC_170_2014_002",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "2. The data transfer rate of a 48x CDROM is :",
    "option_a": "7200 KB/sec",
    "option_b": "7200 MB/sec",
    "option_c": "720 KB/sec",
    "option_d": "720 MB/sec",
    "correct_answer": "A",
    "explanation": "The base data transfer rate of 1x CD-ROM is 150 KB/sec. Therefore, a 48x drive achieves 48 × 150 KB/sec = 7200 KB/sec.\n\n[മലയാളം]: അടിസ്ഥാന 1x സിഡി റോമിന്റെ വേഗത 150 KB/s ആണ്. അതിനാൽ 48x സിഡി റോമിന്റെ ഡാറ്റാ ട്രാൻസ്ഫർ റേറ്റ് 48 × 150 = 7200 KB/sec ആണ്.",
    "subtopic": "Optical Storage Devices"
  },
  {
    "id": "PSC_170_2014_003",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "3. The smallest individually addressable unit of information stored on a hard disk is :",
    "option_a": "Track",
    "option_b": "Platter",
    "option_c": "Sector",
    "option_d": "Cylinder",
    "correct_answer": "C",
    "explanation": "A sector (traditionally 512 bytes) is the smallest individually addressable physical storage block on a hard disk drive platter.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിൽ സ്വതന്ത്രമായി ഡാറ്റ അഡ്രസ് ചെയ്യാൻ സാധിക്കുന്ന ഏറ്റവും ചെറിയ യൂണിറ്റാണ് സെക്ടർ (Sector - 512 Bytes).",
    "subtopic": "Hard Disk Architecture & Geometry"
  },
  {
    "id": "PSC_170_2014_004",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "4. Which of the following is not a motherboard component?",
    "option_a": "Hard Disk",
    "option_b": "BIOS ROM",
    "option_c": "CMOS Battery",
    "option_d": "Processor",
    "correct_answer": "A",
    "explanation": "The Hard Disk is an internal/external storage peripheral connected via cables to the motherboard, not an onboard motherboard component.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്ക് (Hard Disk) ഒരു പെരിഫറൽ സ്റ്റോറേജ് ഉപകരണമാണ്; അത് മദർബോർഡിലെ ഒരു ഘടകമല്ല (BIOS, CMOS ബാറ്ററി, പ്രോസസ്സർ എന്നിവ മദർബോർഡിൽ ഘടിപ്പിച്ചിട്ടുള്ളവയാണ്).",
    "subtopic": "Motherboard Components"
  },
  {
    "id": "PSC_170_2014_005",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "5. SMPS is used to :",
    "option_a": "Control speed of processor",
    "option_b": "Manage Data transfer",
    "option_c": "Convert ac voltage to dc",
    "option_d": "Control I/O devices",
    "correct_answer": "C",
    "explanation": "SMPS (Switched-Mode Power Supply) converts 230V AC mains electrical voltage into stable, regulated low-voltage DC outputs (+12V, +5V, +3.3V, -12V) required by computer components.\n\n[മലയാളം]: മെയിൻസ് സപ്ലൈയിൽ നിന്നുള്ള ഉയർന്ന AC വോൾട്ടേജിനെ കമ്പ്യൂട്ടറിന് ആവശ്യമായ സുരക്ഷിതമായ വിവിധ DC വോൾട്ടേജുകളാക്കി മാറ്റാനാണ് SMPS ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Power Supplies & SMPS"
  },
  {
    "id": "PSC_170_2014_006",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "6. If the number of gates in an IC is between 100 and 5000, then the integration level is :",
    "option_a": "SSI",
    "option_b": "MSI",
    "option_c": "LSI",
    "option_d": "VLSI",
    "correct_answer": "C",
    "explanation": "Integration scale classifications: SSI (<10 to 12 gates), MSI (12 to 100 gates), LSI (100 to 5,000 gates), VLSI (5,000 to 100,000+ gates).\n\n[മലയാളം]: ഒരു ഇന്റഗ്രേറ്റഡ് സർക്യൂട്ടിൽ (IC) ലോജിക് ഗേറ്റുകളുടെ എണ്ണം 100 മുതൽ 5000 വരെയാണെങ്കിൽ അതിനെ LSI (Large Scale Integration) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Digital Electronics & IC Levels"
  },
  {
    "id": "PSC_170_2014_007",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "7. Linux is :",
    "option_a": "An operating system",
    "option_b": "A free software",
    "option_c": "A system software",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "Linux is a free and open-source operating system kernel and comprehensive system software under the GNU GPL.\n\n[മലയാളം]: ലിനക്സ് (Linux) ഒരു ഓപ്പറേറ്റിംഗ് സിസ്റ്റവും, സിസ്റ്റം സോഫ്റ്റ്‌വെയറും, ഒപ്പം ഒരു സൗജന്യ സോഫ്റ്റ്‌വെയറുമാണ് (All the above).",
    "subtopic": "Operating Systems & Linux"
  },
  {
    "id": "PSC_170_2014_008",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "8. Which of the following is a gaming device?",
    "option_a": "Mouse",
    "option_b": "Joystick",
    "option_c": "Web cam",
    "option_d": "Track Ball",
    "correct_answer": "B",
    "explanation": "A Joystick is a handheld lever input controller specifically designed for controlling video games and flight simulators.\n\n[മലയാളം]: വീഡിയോ ഗെയിമുകൾ കളിക്കുന്നതിനായി പ്രത്യേകമായി ഉപയോഗിക്കുന്ന ഇൻപുട്ട് ഉപകരണമാണ് ജോയ്‌സ്റ്റിക് (Joystick).",
    "subtopic": "I/O Devices & Peripherals"
  },
  {
    "id": "PSC_170_2014_009",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "9. The device that connect computers by means of telephone line :",
    "option_a": "NIC",
    "option_b": "Bus",
    "option_c": "Cable",
    "option_d": "Modem",
    "correct_answer": "D",
    "explanation": "A Modem (Modulator-Demodulator) modulates digital computer signals to analog audio for transmission over telephone lines and demodulates incoming signals.\n\n[മലയാളം]: ടെലിഫോൺ ലൈൻ വഴി കമ്പ്യൂട്ടറുകളെ ഇന്റർനെറ്റിലേക്ക് ബന്ധിപ്പിക്കാൻ ഉപയോഗിക്കുന്ന ഉപകരണമാണ് മോഡം (Modem).",
    "subtopic": "Networking Devices & Modems"
  },
  {
    "id": "PSC_170_2014_010",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "10. POST means :",
    "option_a": "Power On System Test",
    "option_b": "Power On Self Test",
    "option_c": "Power Out System Test",
    "option_d": "Power Out Self Test",
    "correct_answer": "B",
    "explanation": "POST stands for Power-On Self-Test, the diagnostic testing sequence executed by the BIOS firmware immediately after powering on a computer.\n\n[മലയാളം]: POST-ന്റെ പൂർണ്ണരൂപം 'Power On Self Test' എന്നാണ്. കമ്പ്യൂട്ടർ ഓൺ ചെയ്യുമ്പോൾ ഹാർഡ്‌വെയറുകളുടെ പ്രവർത്തനം പരിശോധിക്കുന്ന പ്രക്രിയയാണിത്.",
    "subtopic": "BIOS & POST Diagnostics"
  },
  {
    "id": "PSC_170_2014_011",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "11. The Principles of Structured programming forbid the use of :",
    "option_a": "switch",
    "option_b": "if",
    "option_c": "for",
    "option_d": "goto",
    "correct_answer": "D",
    "explanation": "Structured programming principles (championed by Edsger Dijkstra) strictly discourage or forbid unconditional branching statements like 'goto' to avoid spaghetti code.\n\n[മലയാളം]: സ്ട്രക്ചേർഡ് പ്രോഗ്രാമിംഗിൽ (Structured programming) അനിയന്ത്രിതമായ ജമ്പിംഗ് ഒഴിവാക്കാനായി 'goto' സ്റ്റേറ്റ്‌മെന്റിന്റെ ഉപയോഗം കർശനമായി വിലക്കിയിരിക്കുന്നു.",
    "subtopic": "Software Concepts & Programming"
  },
  {
    "id": "PSC_170_2014_012",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "12. A microcontroller contains :",
    "option_a": "CPU and ROM",
    "option_b": "CPU, RAM and I/O ports",
    "option_c": "CPU and RAM",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "A microcontroller is a compact computer-on-a-chip that integrates the CPU, RAM memory, ROM/Flash memory, and I/O ports all within a single integrated circuit.\n\n[മലയാളം]: ഒരു മൈക്രോകൺട്രോളറിനുള്ളിൽ CPU, RAM, ROM, I/O ports എന്നിവയെല്ലാം ഒരൊറ്റ ചിപ്പിൽ സംയോജിപ്പിച്ചിരിക്കുന്നു (All the above).",
    "subtopic": "Microprocessor vs Microcontroller"
  },
  {
    "id": "PSC_170_2014_013",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "13. Which is the term not related with Database?",
    "option_a": "TTL",
    "option_b": "SQL",
    "option_c": "DML",
    "option_d": "DDL",
    "correct_answer": "A",
    "explanation": "SQL (Structured Query Language), DDL (Data Definition Language), and DML (Data Manipulation Language) are fundamental database terms. TTL is Transistor-Transistor Logic or Time To Live.\n\n[മലയാളം]: ഡാറ്റാബേസുമായി ബന്ധമില്ലാത്ത പദമാണ് TTL (Transistor-Transistor Logic). SQL, DML, DDL എന്നിവ ഡാറ്റാബേസ് പദങ്ങളാണ്.",
    "subtopic": "Databases & Basic Electronics"
  },
  {
    "id": "PSC_170_2014_014",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "14. Overclocking a CPU results in :",
    "option_a": "Increased performance",
    "option_b": "Increased heat",
    "option_c": "Increased bus speed",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "Overclocking increases the clock multiplier or front-side bus frequency beyond manufacturer ratings, resulting in higher processing performance, higher bus speed, and substantially increased heat dissipation.\n\n[മലയാളം]: ഒരു സിപിയു ഓവർക്ലോക്ക് (Overclocking) ചെയ്യുമ്പോൾ പെർഫോമൻസ് കൂടുന്നു, ഒപ്പം ഹീറ്റും ബസ് സ്പീഡും വർദ്ധിക്കുന്നു (All the above).",
    "subtopic": "CPU Technology & Overclocking"
  },
  {
    "id": "PSC_170_2014_015",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "15. The errors detected by compiler are :",
    "option_a": "Syntax errors",
    "option_b": "Semantic errors",
    "option_c": "Logical errors",
    "option_d": "Internal errors",
    "correct_answer": "A",
    "explanation": "Compilers check the source code against the grammatical rules of the programming language and flag Syntax Errors during translation.\n\n[മലയാളം]: പ്രോഗ്രാം കമ്പൈൽ ചെയ്യുമ്പോൾ കമ്പൈലർ കണ്ടെത്തുന്ന വ്യാകരണപരമായ തെറ്റുകളെ സിന്റാക്സ് എററുകൾ (Syntax errors) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "System Software & Compilers"
  },
  {
    "id": "PSC_170_2014_016",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "16. USB stands for :",
    "option_a": "Universal Synchronous Bus",
    "option_b": "Universal Serial Bus",
    "option_c": "Uniform Standard Bus",
    "option_d": "Uniform Serial Bus",
    "correct_answer": "B",
    "explanation": "USB stands for Universal Serial Bus, an industry standard establishing specifications for cables, connectors, and protocols for connection and power supply between computers and peripherals.\n\n[മലയാളം]: USB-യുടെ പൂർണ്ണരൂപം 'Universal Serial Bus' എന്നാണ്.",
    "subtopic": "Bus Standards: USB"
  },
  {
    "id": "PSC_170_2014_017",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "17. Cache memory is used to :",
    "option_a": "Increase capacity of memory",
    "option_b": "Store permanent data",
    "option_c": "Store permanent code",
    "option_d": "Increase processing speed",
    "correct_answer": "D",
    "explanation": "High-speed SRAM Cache memory buffers frequently accessed instructions and data close to the CPU core to reduce latency and dramatically increase overall processing speed.\n\n[മലയാളം]: സിപിയുവിന് ഇടയ്ക്കിടെ ആവശ്യമുള്ള വിവരങ്ങൾ അതിവേഗത്തിൽ നൽകി പ്രോസസ്സിംഗ് വേഗത വർദ്ധിപ്പിക്കാനാണ് (Increase processing speed) കാഷ് മെമ്മറി ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Cache Memory & CPU Architecture"
  },
  {
    "id": "PSC_170_2014_018",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "18. The functioning of a microprocessor is controlled by :",
    "option_a": "Central Processing Unit",
    "option_b": "Arithmetic Logic Unit",
    "option_c": "Control Unit",
    "option_d": "All the above",
    "correct_answer": "C",
    "explanation": "The Control Unit (CU) coordinates and directs all operations within the microprocessor, directing data transfer, timing, and instruction decoding.\n\n[മലയാളം]: പ്രോസസ്സറിലെ എല്ലാ ഘടകങ്ങളുടെയും പ്രവർത്തനങ്ങളെ നിയന്ത്രിക്കുകയും ഏകോപിപ്പിക്കുകയും ചെയ്യുന്നത് കൺട്രോൾ യൂണിറ്റാണ് (Control Unit).",
    "subtopic": "Control Unit & CPU Functional Blocks"
  },
  {
    "id": "PSC_170_2014_019",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "19. A nibble is a group of :",
    "option_a": "2 bits",
    "option_b": "4 bits",
    "option_c": "8 bits",
    "option_d": "16 bits",
    "correct_answer": "B",
    "explanation": "A nibble is a unit of digital data comprising 4 bits (half a byte). An 8-bit byte equals 2 nibbles.\n\n[മലയാളം]: 4 ബിറ്റുകൾ (4 bits) ചേരുന്ന ഡിജിറ്റൽ മെമ്മറി യൂണിറ്റാണ് നിബിൾ (Nibble).",
    "subtopic": "Memory Units & Number Systems"
  },
  {
    "id": "PSC_170_2014_020",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "20. North Bridge chip is responsible for interfacing with :",
    "option_a": "CPU and I/O",
    "option_b": "Memory and I/O",
    "option_c": "CPU and memory",
    "option_d": "All the above",
    "correct_answer": "C",
    "explanation": "In traditional PC motherboard chipset architecture, the Northbridge connects the CPU directly to high-speed system memory (RAM) and AGP/PCIe graphics.\n\n[മലയാളം]: മദർബോർഡിൽ സിപിയുവിനെയും മെമ്മറിയെയും (RAM) പരസ്പരം ബന്ധിപ്പിക്കുന്നത് നോർത്ത് ബ്രിഡ്ജ് ചിപ്പ് (North Bridge) ആണ്.",
    "subtopic": "Chipset Architecture: Northbridge & Southbridge"
  },
  {
    "id": "PSC_170_2014_021",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "21. The contents are determined by metal masks during chip fabrication in :",
    "option_a": "ROM",
    "option_b": "PROM",
    "option_c": "EPROM",
    "option_d": "EEPROM",
    "correct_answer": "A",
    "explanation": "Masked ROM (MROM) has its binary contents hardwired permanently during chip manufacturing using photolithographic metal masks.\n\n[മലയാളം]: ചിപ്പ് നിർമ്മാണ വേളയിൽ തന്നെ മെറ്റൽ മാസ്കുകൾ (Metal masks) ഉപയോഗിച്ച് ഡാറ്റ സ്ഥിരമായി രേഖപ്പെടുത്തുന്ന മെമ്മറിയാണ് മാസ്ക് റോം (Mask ROM).",
    "subtopic": "ROM Types: Mask ROM, PROM, EPROM"
  },
  {
    "id": "PSC_170_2014_022",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "22. BIOS is typically placed in :",
    "option_a": "CPU",
    "option_b": "ROM Chip",
    "option_c": "RAM",
    "option_d": "Cache memory",
    "correct_answer": "B",
    "explanation": "The BIOS firmware is non-volatile and permanently stored on a motherboard ROM/Flash EEPROM chip so it is preserved when power is turned off.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ BIOS ഫേംവെയർ സൂക്ഷിച്ചിരിക്കുന്നത് മദർബോർഡിലെ റോം ചിപ്പിലാണ് (ROM/Flash ROM Chip).",
    "subtopic": "BIOS & Motherboard Architecture"
  },
  {
    "id": "PSC_170_2014_023",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "23. Which of the following is a magnetic storage?",
    "option_a": "Hard Disk",
    "option_b": "Compact disc",
    "option_c": "Flash memory",
    "option_d": "Blu-ray Disc",
    "correct_answer": "A",
    "explanation": "A Hard Disk uses magnetic platters to record data. CDs and Blu-ray discs use optical pits/lands, while Flash memory uses solid-state floating-gate transistors.\n\n[മലയാളം]: കാന്തിക തരംഗങ്ങൾ (Magnetic field) ഉപയോഗിച്ച് ഡാറ്റ സൂക്ഷിക്കുന്ന സ്റ്റോറേജ് ഉപകരണമാണ് ഹാർഡ് ഡിസ്ക് (Hard Disk).",
    "subtopic": "Storage Devices: Magnetic vs Optical"
  },
  {
    "id": "PSC_170_2014_024",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "24. A 5 pin DIN connector is used to connect :",
    "option_a": "Mouse",
    "option_b": "Keyboard",
    "option_c": "Monitor",
    "option_d": "Power to hard disk",
    "correct_answer": "B",
    "explanation": "The circular 5-pin DIN connector was the standard keyboard interface used on original IBM PC/XT and AT motherboards (predecessor to 6-pin PS/2).\n\n[മലയാളം]: പഴയ തലമുറയിലെ IBM PC/AT കമ്പ്യൂട്ടറുകളിൽ കീബോർഡ് (Keyboard) കണക്ട് ചെയ്യാനാണ് വലിയ വൃത്താകൃതിയിലുള്ള 5-പിൻ DIN കണക്ടർ ഉപയോഗിച്ചിരുന്നത്.",
    "subtopic": "Connectors & Peripheral Ports"
  },
  {
    "id": "PSC_170_2014_025",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "25. To remove or replace jumpers on circuit board, we use :",
    "option_a": "Screw driver",
    "option_b": "Wire snips",
    "option_c": "Needle-Nose plier",
    "option_d": "Tweezers",
    "correct_answer": "C",
    "explanation": "Needle-nose pliers (or tweezers) provide the fine grip required to remove or insert small configuration jumpers on motherboards and drive pins.\n\n[മലയാളം]: സർക്യൂട്ട് ബോർഡിലെ ചെറിയ ജമ്പറുകൾ (Jumpers) ഇളക്കിമാറ്റാനും ഘടിപ്പിക്കാനും നീഡിൽ-നോസ് പ്ലെയർ (Needle-Nose plier) ആണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Hardware Tools & Maintenance"
  },
  {
    "id": "PSC_170_2014_026",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "26. In Dynamic RAM, data is stored using :",
    "option_a": "Flip-flop",
    "option_b": "Magnetic field",
    "option_c": "Capacitor",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "DRAM memory cells store each bit of binary data as an electrical charge inside a microscopic capacitor paired with an access transistor.\n\n[മലയാളം]: ഡൈനാമിക് റാമിൽ (DRAM) ഓരോ ബിറ്റ് ഡാറ്റയും സൂക്ഷിച്ചുവെക്കുന്നത് കപ്പാസിറ്ററുകളിലെ (Capacitor) ഇലക്ട്രിക്കൽ ചാർജ്ജ് ആയിട്ടാണ്.",
    "subtopic": "RAM Architecture: DRAM vs SRAM"
  },
  {
    "id": "PSC_170_2014_027",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "27. The time required for the read/write head of hard disk to position on the correct track is :",
    "option_a": "Seek time",
    "option_b": "Latency",
    "option_c": "Access time",
    "option_d": "Tracking time",
    "correct_answer": "A",
    "explanation": "Seek Time is the duration taken by the actuator arm to mechanically move the read/write heads to the target track/cylinder on a hard disk platter.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിലെ റീഡ്/റൈറ്റ് ഹെഡിന് ആവശ്യമുള്ള ട്രാക്കിന് മുകളിലേക്ക് എത്തിച്ചേരാൻ എടുക്കുന്ന സമയത്തെ സീക്ക് ടൈം (Seek time) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Hard Disk Performance Metrics"
  },
  {
    "id": "PSC_170_2014_028",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "28. Communication network over global area is called :",
    "option_a": "LAN",
    "option_b": "MAN",
    "option_c": "WAN",
    "option_d": "VAN",
    "correct_answer": "C",
    "explanation": "A Wide Area Network (WAN) spans broad geographical areas, connecting cities, countries, or the entire globe (e.g., the Internet).\n\n[മലയാളം]: ഭൂമിശാസ്ത്രപരമായി ആഗോളതലത്തിൽ അല്ലെങ്കിൽ വലിയ പ്രദേശങ്ങളിലായി വ്യാപിച്ച് കിടക്കുന്ന നെറ്റ്‌വർക്കുകളെ WAN (Wide Area Network) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Network Topologies & Types (LAN/MAN/WAN)"
  },
  {
    "id": "PSC_170_2014_029",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "29. Central Processing Unit consists of :",
    "option_a": "Control Unit and Memory Unit",
    "option_b": "ALU and Memory Unit",
    "option_c": "ALU and Registers",
    "option_d": "ALU and Control Unit",
    "correct_answer": "D",
    "explanation": "At its core architectural definition, the CPU consists of the Arithmetic Logic Unit (ALU) and the Control Unit (CU), along with internal registers.\n\n[മലയാളം]: സിപിയുവിന്റെ (CPU) പ്രധാനപ്പെട്ട രണ്ട് അടിസ്ഥാന വിഭാഗങ്ങളാണ് ALU-വും കൺട്രോൾ യൂണിറ്റും (ALU and Control Unit).",
    "subtopic": "CPU Architecture & Functional Blocks"
  },
  {
    "id": "PSC_170_2014_030",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "30. If a microprocessor can access 64 K memory, then its address bus will be :",
    "option_a": "8 bits",
    "option_b": "16 bits",
    "option_c": "32 bits",
    "option_d": "64 bits",
    "correct_answer": "B",
    "explanation": "Addressable memory equals 2^n bytes, where n is the address bus width. For 64 KB (65,536 bytes): 2^16 = 65,536, requiring a 16-bit address bus.\n\n[മലയാളം]: 64 KB മെമ്മറി ആക്സസ്സ് ചെയ്യണമെങ്കിൽ 2^16 = 65536 ആയതിനാൽ അഡ്രസ് ബസ്സിന് 16 ബിറ്റ് (16 bits) നീളം വേണം (ഉദാ: 8085 പ്രോസസ്സർ).",
    "subtopic": "Address Bus & Memory Addressing"
  },
  {
    "id": "PSC_170_2014_031",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "31. The decimal number 17 can be represented in hexadecimal as :",
    "option_a": "11",
    "option_b": "17",
    "option_c": "23",
    "option_d": "1 F",
    "correct_answer": "A",
    "explanation": "In hexadecimal conversion: 17 divided by 16 = 1 with a remainder of 1. Therefore, decimal 17 equals (11) in hexadecimal.\n\n[മലയാളം]: ഡെസിമൽ സംഖ്യയായ 17-നെ ഹെക്സാഡെസിമലിലേക്ക് മാറ്റുമ്പോൾ 16 × 1 + 1 = (11)₁₆ എന്ന് ലഭിക്കുന്നു.",
    "subtopic": "Number Systems & Conversion"
  },
  {
    "id": "PSC_170_2014_032",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "32. From a Stack structure, data can be accessed :",
    "option_a": "In any order",
    "option_b": "First in First out order",
    "option_c": "Last in First out order",
    "option_d": "Based on Priority only",
    "correct_answer": "C",
    "explanation": "A Stack is a Last-In, First-Out (LIFO) data structure where elements are pushed and popped strictly from the top.\n\n[മലയാളം]: സ്റ്റാക്ക് (Stack) ഡാറ്റാ സ്ട്രക്ചറിൽ നിന്നും ഡാറ്റ എടുക്കുന്നത് LIFO അഥവാ Last in First out (അവസാനം വെച്ചത് ആദ്യം) എന്ന ക്രമത്തിലാണ്.",
    "subtopic": "Data Structures & Stack Operation"
  },
  {
    "id": "PSC_170_2014_033",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "33. Which of the following IC is used for Keyboard/Display interfacing?",
    "option_a": "8279",
    "option_b": "8255",
    "option_c": "8257",
    "option_d": "8259",
    "correct_answer": "A",
    "explanation": "Intel 8279 is a general-purpose programmable keyboard and display I/O interface IC designed for use with microprocessors.\n\n[മലയാളം]: പ്രോസസ്സറുമായി കീബോർഡും ഡിസ്പ്ലേയും ഇന്റർഫേസ് ചെയ്യാൻ ഉപയോഗിക്കുന്ന സ്പെഷ്യലൈസ്ഡ് ഐ.സിയാണ് Intel 8279.",
    "subtopic": "Peripheral Interface ICs (8279, 8255)"
  },
  {
    "id": "PSC_170_2014_034",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "34. Post script Language is used for :",
    "option_a": "Website creation",
    "option_b": "Printers",
    "option_c": "Modems",
    "option_d": "Graphics",
    "correct_answer": "B",
    "explanation": "PostScript is a page description programming language developed by Adobe, used primarily in electronic and desktop publishing to communicate page layouts to laser printers.\n\n[മലയാളം]: അഡോബ് വികസിപ്പിച്ച പോസ്റ്റ് സ്ക്രിപ്റ്റ് (PostScript) പേജ് ഡിസ്ക്രിപ്ഷൻ ഭാഷ പ്രിന്ററുകളിലേക്ക് പ്രിന്റ് ലേഔട്ടുകൾ കൈമാറാനാണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Printers & Page Description Languages"
  },
  {
    "id": "PSC_170_2014_035",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "35. Movement of a mouse is detected using LED in :",
    "option_a": "Optical Mouse",
    "option_b": "Opto-mechanical Mouse",
    "option_c": "Mechanical Mouse",
    "option_d": "USB Mouse",
    "correct_answer": "A",
    "explanation": "An Optical Mouse uses a light-emitting diode (LED) and an optoelectronic sensor to detect movement by tracking surface texture reflections.\n\n[മലയാളം]: ചുവപ്പ് LED ലൈറ്റും ഒപ്റ്റിക്കൽ സെൻസറും ഉപയോഗിച്ച് ചലനം രേഖപ്പെടുത്തുന്ന മൗസാണ് ഒപ്റ്റിക്കൽ മൗസ് (Optical Mouse).",
    "subtopic": "Mouse Technologies: Mechanical vs Optical"
  },
  {
    "id": "PSC_170_2014_036",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "36. Resolution of computer monitors is measured in :",
    "option_a": "Hz",
    "option_b": "mm",
    "option_c": "Pitch",
    "option_d": "Pixel",
    "correct_answer": "D",
    "explanation": "Screen display resolution is measured by the number of horizontal and vertical distinct picture elements called Pixels (e.g., 1920 × 1080 pixels).\n\n[മലയാളം]: മോണിറ്ററിന്റെ സ്ക്രീൻ റെസല്യൂഷൻ അളക്കുന്നത് പിക്സലുകളുടെ (Pixel) എണ്ണത്തിലാണ്.",
    "subtopic": "Display Technologies & Resolution"
  },
  {
    "id": "PSC_170_2014_037",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "37. CD-RW permits data to :",
    "option_a": "Write once",
    "option_b": "Write many times",
    "option_c": "Write once and read many",
    "option_d": "Read only",
    "correct_answer": "B",
    "explanation": "CD-RW (Compact Disc ReWritable) uses a phase-change recording layer that permits data to be written, erased, and rewritten many times (typically up to 1,000 times).\n\n[മലയാളം]: CD-RW (ReWritable) ഡിസ്കുകളിൽ പലതവണ വിവരങ്ങൾ മായ്ച്ച് വീണ്ടും പുതിയ ഡാറ്റ എഴുതാൻ സാധിക്കും (Write many times).",
    "subtopic": "Optical Storage Devices (CD-RW)"
  },
  {
    "id": "PSC_170_2014_038",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "38. Zoned recording in hard disk increases available disk spaces by having more sectors in :",
    "option_a": "All tracks",
    "option_b": "Inner tracks",
    "option_c": "Middle tracks",
    "option_d": "Outer tracks",
    "correct_answer": "D",
    "explanation": "Zone Bit Recording (ZBR) takes advantage of the larger circumference of outer tracks by packing more physical sectors on outer tracks compared to shorter inner tracks.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്കിലെ Zoned Recording സാങ്കേതികവിദ്യ വലിയ ചുറ്റളവുള്ള പുറം ട്രാക്കുകളിൽ (Outer tracks) കൂടുതൽ സെക്ടറുകൾ ഉൾപ്പെടുത്തി സ്റ്റോറേജ് വർദ്ധിപ്പിക്കുന്നു.",
    "subtopic": "Hard Disk Geometry: Zone Bit Recording"
  },
  {
    "id": "PSC_170_2014_039",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "39. Formatting a hard disk means, reallocating :",
    "option_a": "Tracks",
    "option_b": "Sectors",
    "option_c": "File system",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "High-level and low-level formatting initializes tracks and sectors, maps bad sectors, and creates the file system structures and root directory on the disk.\n\n[മലയാളം]: ഹാർഡ് ഡിസ്ക് ഫോർമാറ്റ് ചെയ്യുമ്പോൾ ട്രാക്കുകൾ, സെക്ടറുകൾ, ഫയൽ സിസ്റ്റം എന്നിവയെല്ലാം പുനഃക്രമീകരിക്കപ്പെടുന്നു (All the above).",
    "subtopic": "Disk Formatting & File Systems"
  },
  {
    "id": "PSC_170_2014_040",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "40. Which of the following is not a microprocessor component?",
    "option_a": "Decode unit",
    "option_b": "Program Counter",
    "option_c": "Arithmetic Logic Unit",
    "option_d": "Heat sink",
    "correct_answer": "D",
    "explanation": "The Decode unit, Program Counter (PC), and ALU are internal on-chip microprocessor components. The heat sink is an external passive cooling hardware accessory.\n\n[മലയാളം]: ഹീറ്റ് സിങ്ക് (Heat sink) പ്രോസസ്സറിന് പുറത്ത് ഘടിപ്പിക്കുന്ന കൂളിംഗ് ഉപകരണമാണ്; അത് മൈക്രോപ്രോസസ്സറിന്റെ ആന്തരിക ഭാഗമല്ല.",
    "subtopic": "CPU Architecture & Cooling"
  },
  {
    "id": "PSC_170_2014_041",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "41. Hyper Threading technology enables a single CPU to :",
    "option_a": "Act like multiple CPU",
    "option_b": "Use cache memory",
    "option_c": "Process floating point operations",
    "option_d": "Display high resolution graphics",
    "correct_answer": "A",
    "explanation": "Intel Hyper-Threading Technology (HTT) duplicates architectural state on a single physical core, allowing the operating system to address it as two logical/virtual processors.\n\n[മലയാളം]: ഹൈപ്പർ ത്രെഡിംഗ് (Hyper Threading) സാങ്കേതികവിദ്യ വഴി ഒരൊറ്റ ഫിസിക്കൽ സിപിയുവിന് ഒരേസമയം ഒന്നിലധികം സിപിയു ആയി (Act like multiple CPU) പ്രവർത്തിക്കാൻ സാധിക്കുന്നു.",
    "subtopic": "CPU Technology: Hyper-Threading"
  },
  {
    "id": "PSC_170_2014_042",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "42. The number of bits processed by a microprocessor at a time is its :",
    "option_a": "Data size",
    "option_b": "Word size",
    "option_c": "Code size",
    "option_d": "None of the above",
    "correct_answer": "B",
    "explanation": "The word size (e.g., 8-bit, 16-bit, 32-bit, or 64-bit) defines the native bit-width of data that the CPU's internal ALU registers can process in a single instruction cycle.\n\n[മലയാളം]: ഒരു മൈക്രോപ്രോസസ്സറിന് ഒരൊറ്റ സൈക്കിളിൽ പ്രോസസ്സ് ചെയ്യാൻ സാധിക്കുന്ന ബിറ്റുകളുടെ എണ്ണത്തെ അതിന്റെ വേഡ് സൈസ് (Word size) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "CPU Architecture & Word Size"
  },
  {
    "id": "PSC_170_2014_043",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "43. The system bus (FSB) is placed between :",
    "option_a": "CPU and I/O device",
    "option_b": "CPU and Cache memory",
    "option_c": "CPU and memory",
    "option_d": "Memory and I/O device",
    "correct_answer": "C",
    "explanation": "The Front-Side Bus (FSB) or system bus is the primary bi-directional data conduit connecting the CPU to main system memory through the Northbridge.\n\n[മലയാളം]: പ്രോസസ്സറിനെയും പ്രധാന സിസ്റ്റം മെമ്മറിയെയും പരസ്പരം ബന്ധിപ്പിക്കുന്നത് സിസ്റ്റം ബസ് (FSB) ആണ്.",
    "subtopic": "Bus Architecture & FSB"
  },
  {
    "id": "PSC_170_2014_044",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "44. Pin Grid Array packaging is used for :",
    "option_a": "Memory",
    "option_b": "DMA Controller",
    "option_c": "Microprocessor",
    "option_d": "AGP",
    "correct_answer": "C",
    "explanation": "PGA (Pin Grid Array) is a classic integrated circuit chip packaging style featuring an array of pins on the bottom, predominantly used for desktop microprocessors (e.g., AMD AM4, Intel Socket 478).\n\n[മലയാളം]: പ്രോസസ്സറുകൾ (Microprocessors) സോക്കറ്റിൽ ഘടിപ്പിക്കാൻ ഉപയോഗിക്കുന്ന ചിപ്പ് പാക്കേജിംഗ് രീതിയാണ് PGA (Pin Grid Array).",
    "subtopic": "Processor Sockets & Chip Packaging"
  },
  {
    "id": "PSC_170_2014_045",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "45. The form factor of a motherboard determines its :",
    "option_a": "Physical shape and size",
    "option_b": "Type of processor supported",
    "option_c": "Capacity of RAM supported",
    "option_d": "All the above",
    "correct_answer": "A",
    "explanation": "Motherboard form factor strictly defines physical dimensions, mounting hole locations, and power supply layout (e.g., ATX, Micro-ATX, Mini-ITX).\n\n[മലയാളം]: മദർബോർഡിന്റെ ഫോം ഫാക്ടർ (Form factor) എന്നത് അതിന്റെ ഭൗതിക വലിപ്പവും ആകൃതിയും (Physical shape and size) മൗണ്ടിംഗ് സ്ക്രൂ പോയിന്റുകളുമാണ് വ്യക്തമാക്കുന്നത്.",
    "subtopic": "Motherboard Form Factors"
  },
  {
    "id": "PSC_170_2014_046",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "46. Operating system lies between :",
    "option_a": "Hardware and software",
    "option_b": "Hardware and firmware",
    "option_c": "Hardware and user",
    "option_d": "Software and user",
    "correct_answer": "C",
    "explanation": "An operating system acts as the fundamental intermediate interface between the underlying computer hardware and the human user / user applications.\n\n[മലയാളം]: കമ്പ്യൂട്ടർ ഹാർഡ്‌വെയറിനും ഉപയോക്താവിനും (Hardware and user) ഇടയിലുള്ള പ്രധാന ഇന്റർഫേസായി പ്രവർത്തിക്കുന്നത് ഓപ്പറേറ്റിംഗ് സിസ്റ്റമാണ്.",
    "subtopic": "OS Fundamentals & Architecture"
  },
  {
    "id": "PSC_170_2014_047",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "47. Source programs are converted to object programs using :",
    "option_a": "Compiler",
    "option_b": "Interpreter",
    "option_c": "Assembler",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "Language translators (Compilers, Assemblers, and Interpreters) translate human-readable source code instructions into machine/object code representations.\n\n[മലയാളം]: പ്രോഗ്രാമർ എഴുതുന്ന സോഴ്സ് പ്രോഗ്രാമുകളെ മെഷീന് മനസ്സിലാകുന്ന ഒബ്ജക്റ്റ് കോഡാക്കി മാറ്റാൻ കമ്പൈലർ, ഇന്റർപ്രെറ്റർ, അസംബ്ലർ എന്നിവ ഉപയോഗിക്കുന്നു (All the above).",
    "subtopic": "Translators & System Software"
  },
  {
    "id": "PSC_170_2014_048",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "48. The dimension of a ATX motherboard in inches is :",
    "option_a": "12 x 9.6",
    "option_b": "9.6 x 9.6",
    "option_c": "9 x 10",
    "option_d": "12 x 12",
    "correct_answer": "A",
    "explanation": "Standard ATX form factor specifications define dimensions of 12 inches wide by 9.6 inches deep (305 mm × 244 mm).\n\n[മലയാളം]: സ്റ്റാൻഡേർഡ് ATX മദർബോർഡിന്റെ അളവുകൾ 12 × 9.6 ഇഞ്ച് (305 × 244 mm) ആണ്.",
    "subtopic": "Motherboard Form Factors: ATX Dimensions"
  },
  {
    "id": "PSC_170_2014_049",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "49. Which of the following is not a networking device?",
    "option_a": "Switch",
    "option_b": "Repeater",
    "option_c": "Bridge",
    "option_d": "LAN",
    "correct_answer": "D",
    "explanation": "LAN (Local Area Network) is a network type/classification, whereas Switch, Repeater, and Bridge are physical networking hardware devices.\n\n[മലയാളം]: സ്വിച്ച്, റിപ്പീറ്റർ, ബ്രിഡ്ജ് എന്നിവ നെറ്റ്വർക്കിംഗ് ഉപകരണങ്ങളാണ്; എന്നാൽ LAN എന്നത് നെറ്റ്വർക്കിന്റെ ഒരു വിഭാഗമാണ്, ഉപകരണമല്ല.",
    "subtopic": "Networking Devices & Hardware"
  },
  {
    "id": "PSC_170_2014_050",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "50. 4 pin Molex is a :",
    "option_a": "Data connector",
    "option_b": "Power Connector",
    "option_c": "Peripheral Connector",
    "option_d": "None of the above",
    "correct_answer": "B",
    "explanation": "The 4-pin Molex (AMP 1-480424-0) is an internal DC power connector delivering +12V and +5V from the power supply unit to PATA hard drives and optical drives.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ഹാർഡ് ഡിസ്കുകൾക്കും ഒപ്റ്റിക്കൽ ഡ്രൈവുകൾക്കും പവർ നൽകാൻ ഉപയോഗിക്കുന്ന പവർ കണക്ടറാണ് 4-പിൻ മോലെക്സ് (Molex Power Connector).",
    "subtopic": "Power Supplies & Connectors"
  },
  {
    "id": "PSC_170_2014_051",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "51. The size of MAC address is :",
    "option_a": "24 bits",
    "option_b": "48 bits",
    "option_c": "24 bytes",
    "option_d": "48 bytes",
    "correct_answer": "B",
    "explanation": "A MAC (Media Access Control) physical address is 48 bits (6 bytes) long, represented as 12 hexadecimal digits (e.g., 00:1A:2B:3C:4D:5E).\n\n[മലയാളം]: നെറ്റ്‌വർക്ക് ഇന്റർഫേസ് കാർഡുകളുടെ ഫിസിക്കൽ അഡ്രസ്സായ MAC അഡ്രസ്സിന്റെ വലിപ്പം 48 ബിറ്റുകളാണ് (48 bits / 6 bytes).",
    "subtopic": "MAC Addressing & Data Link Layer"
  },
  {
    "id": "PSC_170_2014_052",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "52. The OR gate has :",
    "option_a": "One input and one output",
    "option_b": "Two input and one output",
    "option_c": "Many input and one output",
    "option_d": "One input and many output",
    "correct_answer": "C",
    "explanation": "In Boolean digital electronics, an OR logic gate can have two or more (many) inputs and produces a single output that is HIGH if any input is HIGH.\n\n[മലയാളം]: ഒരു OR ലോജിക് ഗേറ്റിന് രണ്ടോ അതിലധികമോ ഇൻപുട്ടുകളും (Many inputs) ഒരൊറ്റ ഔട്ട്പുട്ടും (One output) ആണ് ഉണ്ടാകുക.",
    "subtopic": "Digital Electronics: Logic Gates"
  },
  {
    "id": "PSC_170_2014_053",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "53. A maximum of 127 devices can be connected using :",
    "option_a": "Parallel port",
    "option_b": "Serial Port",
    "option_c": "USB port",
    "option_d": "Game port",
    "correct_answer": "C",
    "explanation": "The Universal Serial Bus (USB) architecture supports a tiered star topology allowing up to 127 physical devices (including hubs) on a single USB host controller.\n\n[മലയാളം]: ഒരൊറ്റ കൺട്രോളറിൽ ഹബ്ബുകൾ വഴി പരമാവധി 127 ഉപകരണങ്ങൾ വരെ ബന്ധിപ്പിക്കാൻ സാധിക്കുന്ന ഇന്റർഫേസാണ് USB.",
    "subtopic": "USB Architecture & Limits"
  },
  {
    "id": "PSC_170_2014_054",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "54. The technology that enables devices to automatically install themselves is :",
    "option_a": "Autorun",
    "option_b": "Plug and Play",
    "option_c": "PCI",
    "option_d": "Auto load",
    "correct_answer": "B",
    "explanation": "Plug and Play (PnP) enables the operating system and BIOS to automatically detect, allocate system resources (IRQ, DMA, I/O ports), and configure device drivers without user intervention.\n\n[മലയാളം]: പുതിയ ഹാർഡ്‌വെയറുകൾ ഘടിപ്പിക്കുമ്പോൾ കമ്പ്യൂട്ടർ തനിയെ അവയെ തിരിച്ചറിഞ്ഞ് ഇൻസ്റ്റാൾ ചെയ്യുന്ന സാങ്കേതികവിദ്യയാണ് പ്ലഗ് ആൻഡ് പ്ലേ (Plug and Play).",
    "subtopic": "Plug and Play & Device Configuration"
  },
  {
    "id": "PSC_170_2014_055",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "55. Which of the following is a feature of USB?",
    "option_a": "No device driver needed",
    "option_b": "Hot-swappable",
    "option_c": "No plug and play",
    "option_d": "All the above",
    "correct_answer": "B",
    "explanation": "USB is hot-swappable (hot-pluggable), meaning devices can be attached or removed without restarting the PC. It does require drivers (often generic class drivers) and is fully plug-and-play.\n\n[മലയാളം]: കമ്പ്യൂട്ടർ പ്രവർത്തിച്ചുകൊണ്ടിരിക്കുമ്പോൾ തന്നെ ഉപകരണങ്ങൾ ഘടിപ്പിക്കാനും മാറ്റാനും സാധിക്കുന്ന (Hot-swappable) സവിശേഷത USB-ക്കുണ്ട്.",
    "subtopic": "USB Features: Hot Swapping"
  },
  {
    "id": "PSC_170_2014_056",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "56. How many read/write heads is needed for a hard drive with 4 platters?",
    "option_a": "16",
    "option_b": "12",
    "option_c": "8",
    "option_d": "4",
    "correct_answer": "C",
    "explanation": "Each hard disk platter has two recordable surfaces (top and bottom). For 4 platters: 4 × 2 = 8 read/write heads are required.\n\n[മലയാളം]: ഒരു ഹാർഡ് ഡിസ്ക് പ്ലാറ്ററിന് രണ്ട് വശങ്ങളുള്ളതിനാൽ, 4 പ്ലാറ്ററുകളുള്ള ഒരു ഹാർഡ് ഡിസ്കിൽ 4 × 2 = 8 റീഡ്/റൈറ്റ് ഹെഡുകൾ (8 heads) ആവശ്യമാണ്.",
    "subtopic": "Hard Disk Geometry: Platters and Heads"
  },
  {
    "id": "PSC_170_2014_057",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "57. Internal CD-ROM drives are connected to the motherboard using :",
    "option_a": "IDE",
    "option_b": "USB",
    "option_c": "Parallel port",
    "option_d": "PCI",
    "correct_answer": "A",
    "explanation": "Legacy internal optical CD-ROM and DVD drives connected to the system motherboard via 40-pin IDE/ATAPI ribbon cable interfaces.\n\n[മലയാളം]: പരമ്പരാഗത ഇന്റേണൽ സിഡി റോം ഡ്രൈവുകൾ മദർബോർഡുമായി ബന്ധിപ്പിച്ചിരുന്നത് IDE (Integrated Drive Electronics) ഇന്റർഫേസ് വഴിയാണ്.",
    "subtopic": "Storage Interfaces: IDE/ATAPI"
  },
  {
    "id": "PSC_170_2014_058",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "58. Which of the following is a valid refresh rate of a CRT monitor?",
    "option_a": "72 THz",
    "option_b": "72 MHz",
    "option_c": "72 KHz",
    "option_d": "72 Hz",
    "correct_answer": "D",
    "explanation": "Vertical refresh rates of CRT monitors are measured in Hertz (Hz), commonly ranging between 60 Hz to 85 Hz to prevent visible screen flicker.\n\n[മലയാളം]: മോണിറ്ററുകളുടെ വെർട്ടിക്കൽ റീഫ്രഷ് റേറ്റ് അളക്കുന്നത് ഹെർട്സിലാണ് (Hz). സാധാരണയായി 72 Hz അല്ലെങ്കിൽ 60–85 Hz ആണ് CRT മോണിറ്ററുകളിൽ ഉണ്ടാകുക.",
    "subtopic": "Monitors & Refresh Rates"
  },
  {
    "id": "PSC_170_2014_059",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "59. An optical mouse works well on :",
    "option_a": "Any smooth surface",
    "option_b": "Transparent surface",
    "option_c": "Non-transparent surface",
    "option_d": "Conducting surface",
    "correct_answer": "C",
    "explanation": "An optical mouse requires a non-transparent, textured surface so its optical sensor can register changes in reflected light patterns (fails on clear glass/mirrors).\n\n[മലയാളം]: ഒപ്റ്റിക്കൽ മൗസ് കൃത്യമായി പ്രവർത്തിക്കാൻ പ്രകാശം ആഗിരണം ചെയ്യുകയോ പ്രതിഫലിപ്പിക്കുകയോ ചെയ്യുന്ന സുതാര്യമല്ലാത്ത പ്രതലങ്ങൾ (Non-transparent surface) വേണം (ഗ്ലാസ്സിൽ പ്രവർത്തിക്കില്ല).",
    "subtopic": "Mouse Technologies"
  },
  {
    "id": "PSC_170_2014_060",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "60. Inkjet printers contains :",
    "option_a": "2 colours of ink",
    "option_b": "4 colours of ink",
    "option_c": "6 colours of ink",
    "option_d": "8 colours of ink",
    "correct_answer": "B",
    "explanation": "Standard color inkjet printers utilize the 4 CMYK process primary ink colors: Cyan, Magenta, Yellow, and Key (Black).\n\n[മലയാളം]: സാധാരണ കളർ ഇങ്ക്ജെറ്റ് പ്രിന്ററുകളിൽ 4 പ്രധാന നിറങ്ങളിലുള്ള (CMYK: Cyan, Magenta, Yellow, Black) മഷിയാണ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "Printers & CMYK Ink Technology"
  },
  {
    "id": "PSC_170_2014_061",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "61. Which is the protocol used by internet?",
    "option_a": "IPX/SPX",
    "option_b": "NetBEUI",
    "option_c": "TCP/IP",
    "option_d": "PPP",
    "correct_answer": "C",
    "explanation": "TCP/IP (Transmission Control Protocol / Internet Protocol) is the fundamental communications protocol suite that powers the global Internet.\n\n[മലയാളം]: ഇന്റർനെറ്റിലെ കമ്പ്യൂട്ടറുകൾ പരസ്പരം ആശയവിനിമയം നടത്താൻ ഉപയോഗിക്കുന്ന ആഗോള സ്റ്റാൻഡേർഡ് പ്രോട്ടോക്കോളാണ് TCP/IP.",
    "subtopic": "TCP/IP Protocol Suite"
  },
  {
    "id": "PSC_170_2014_062",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "62. The process of writing data to a CD is called :",
    "option_a": "Loading",
    "option_b": "Writing",
    "option_c": "Backup",
    "option_d": "Burning",
    "correct_answer": "D",
    "explanation": "Writing binary information to an optical disc (CD/DVD) using a laser to alter the organic dye layer is called 'Burning'.\n\n[മലയാളം]: സിഡിയിലേക്കോ ഡിവിഡിയിലേക്കോ ഡാറ്റ എഴുതുന്ന പ്രക്രിയയെ ബേണിംഗ് (Burning) എന്ന് വിളിക്കുന്നു.",
    "subtopic": "Optical Storage Devices & Burning"
  },
  {
    "id": "PSC_170_2014_063",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "63. Software the works with operating system to enable hardware devices is :",
    "option_a": "Device driver",
    "option_b": "Firmware",
    "option_c": "Device Manager",
    "option_d": "Debugger",
    "correct_answer": "A",
    "explanation": "A Device Driver is specialized system software that allows the operating system to communicate with and control specific hardware devices.\n\n[മലയാളം]: ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിന് ഒരു പ്രത്യേക ഹാർഡ്‌വെയറിനെ തിരിച്ചറിഞ്ഞ് നിയന്ത്രിക്കാൻ സഹായിക്കുന്ന സോഫ്റ്റ്‌വെയറാണ് ഡിവൈസ് ഡ്രൈവർ (Device driver).",
    "subtopic": "Device Drivers & OS Architecture"
  },
  {
    "id": "PSC_170_2014_064",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "64. What is the reason to choose a laser printer over an inkjet printer?",
    "option_a": "Speed",
    "option_b": "Colour",
    "option_c": "Cost",
    "option_d": "Resolution",
    "correct_answer": "A",
    "explanation": "Laser printers offer significantly higher print speeds (pages per minute) and lower cost-per-page for high-volume text printing compared to inkjet printers.\n\n[മലയാളം]: ഇങ്ക്ജെറ്റ് പ്രിന്ററുകളെ അപേക്ഷിച്ച് കൂടുതൽ പേജുകൾ അതിവേഗത്തിൽ പ്രിന്റ് ചെയ്യാൻ സാധിക്കും (Speed) എന്നതാണ് ലേസർ പ്രിന്ററുകൾ തിരഞ്ഞെടുക്കാനുള്ള പ്രധാന കാരണം.",
    "subtopic": "Printers: Laser vs Inkjet"
  },
  {
    "id": "PSC_170_2014_065",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "65. Extented partition of a hard drive is :",
    "option_a": "Optional",
    "option_b": "Not bootable",
    "option_c": "Divided into logical drives",
    "option_d": "All the above",
    "correct_answer": "D",
    "explanation": "An extended partition is optional, cannot contain an active bootable operating system partition, and serves as a container sub-divided into multiple logical drives.\n\n[മലയാളം]: ഒരു ഹാർഡ് ഡിസ്കിലെ എക്സ്റ്റെൻഡഡ് പാർട്ടീഷൻ നിർബന്ധമില്ലാത്തതും (Optional), ബൂട്ട് ചെയ്യാൻ പറ്റാത്തതും (Not bootable), നിരവധി ലോജിക്കൽ ഡ്രൈവുകളായി തിരിക്കാവുന്നതുമാണ് (All the above).",
    "subtopic": "Partition Schemes: Primary vs Extended"
  },
  {
    "id": "PSC_170_2014_066",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "66. Which of the following is not a file system?",
    "option_a": "FAT32",
    "option_b": "NTFS",
    "option_c": "FDISK",
    "option_d": "EXT4",
    "correct_answer": "C",
    "explanation": "FDISK is a command-line disk partitioning utility program. FAT32, NTFS, and EXT4 are file systems.\n\n[മലയാളം]: FDISK എന്നത് ഒരു പാർട്ടീഷനിംഗ് യൂട്ടിലിറ്റിയാണ്; FAT32, NTFS, EXT4 എന്നിവ ഫയൽ സിസ്റ്റങ്ങളാണ് (File systems).",
    "subtopic": "File Systems vs Disk Utilities"
  },
  {
    "id": "PSC_170_2014_067",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "67. The port which is not normally associated with a mouse is :",
    "option_a": "USB",
    "option_b": "Parallel",
    "option_c": "Serial",
    "option_d": "PS/2",
    "correct_answer": "B",
    "explanation": "Mice historically connected via Serial (COM), PS/2, or USB ports. Parallel ports (DB-25) were used for printers, not mice.\n\n[മലയാളം]: പാരലൽ പോർട്ട് (Parallel port) പ്രിന്ററുകൾക്കായി ഉപയോഗിക്കുന്നതാണ്; മൗസ് സാധാരണയായി USB, PS/2 അല്ലെങ്കിൽ സീരിയൽ പോർട്ടുകളിലാണ് കണക്ട് ചെയ്യാറുള്ളത്.",
    "subtopic": "I/O Ports & Mouse Connectivity"
  },
  {
    "id": "PSC_170_2014_068",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "68. Zero Insertion Force (ZIF) is related with :",
    "option_a": "CD",
    "option_b": "CPU",
    "option_c": "Memory",
    "option_d": "USB",
    "correct_answer": "B",
    "explanation": "ZIF (Zero Insertion Force) sockets allow a CPU to be inserted or removed without applying physical force, secured with a locking lever.\n\n[മലയാളം]: മദർബോർഡിൽ ബലപ്രയോഗമില്ലാതെ പ്രോസസ്സർ ഘടിപ്പിക്കാൻ ഉപയോഗിക്കുന്ന ലിവർ സോക്കറ്റുകളാണ് ZIF (Zero Insertion Force) സോക്കറ്റുകൾ. ഇത് CPU-വുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു.",
    "subtopic": "CPU Sockets & ZIF"
  },
  {
    "id": "PSC_170_2014_069",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "69. How many pins does a video connector have?",
    "option_a": "15 pins in two rows",
    "option_b": "9 pins in two rows",
    "option_c": "15 pins in three rows",
    "option_d": "9 pins in three rows",
    "correct_answer": "C",
    "explanation": "Standard VGA (Video Graphics Array) D-sub connectors have 15 pins arranged in three rows of 5 pins each.\n\n[മലയാളം]: സാധാരണ VGA വീഡിയോ കണക്ടറിൽ മൂന്ന് നിരകളിലായി 15 പിന്നുകളാണ് (15 pins in three rows) ഉള്ളത്.",
    "subtopic": "Video Display Connectors: VGA"
  },
  {
    "id": "PSC_170_2014_070",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "70. Applying thermal compound in CPU fan assembly is to :",
    "option_a": "Improve heat transfer",
    "option_b": "Control dust",
    "option_c": "Increase fan speed",
    "option_d": "Cool down the processor",
    "correct_answer": "A",
    "explanation": "Thermal paste/compound eliminates microscopic air gaps between the CPU heat spreader and heatsink surface to maximize conductive heat transfer.\n\n[മലയാളം]: പ്രോസസ്സറും ഹീറ്റ് സിങ്കും തമ്മിലുള്ള വായു അറകൾ ഒഴിവാക്കി ചൂട് വേഗത്തിൽ ഹീറ്റ് സിങ്കിലേക്ക് കടത്തിവിടാനാണ് (Improve heat transfer) തെർമൽ പേസ്റ്റ് ഉപയോഗിക്കുന്നത്.",
    "subtopic": "CPU Cooling & Thermal Pastes"
  },
  {
    "id": "PSC_170_2014_071",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "71. Each sector of hard disk can hold :",
    "option_a": "126 Bytes",
    "option_b": "512 Bytes",
    "option_c": "1024 Bytes",
    "option_d": "It depends on capacity of the disk",
    "correct_answer": "B",
    "explanation": "Traditional hard disk drive architecture standardized on storing exactly 512 bytes of user data per physical sector.\n\n[മലയാളം]: പരമ്പരാഗത ഹാർഡ് ഡിസ്കിലെ ഓരോ സെക്ടറിലും 512 ബൈറ്റ് (512 Bytes) ഡാറ്റയാണ് സൂക്ഷിക്കാൻ സാധിക്കുന്നത്.",
    "subtopic": "Hard Disk Sector Capacity"
  },
  {
    "id": "PSC_170_2014_072",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "72. Increasing the screen resolution also increases :",
    "option_a": "Pixels",
    "option_b": "Dot pitches",
    "option_c": "VIS",
    "option_d": "Colours",
    "correct_answer": "A",
    "explanation": "Increasing screen resolution increases the total count and density of pixels displayed on the screen, creating sharper, more detailed graphics.\n\n[മലയാളം]: സ്ക്രീൻ റെസല്യൂഷൻ വർദ്ധിപ്പിക്കുമ്പോൾ സ്ക്രീനിലെ പിക്സലുകളുടെ (Pixels) എണ്ണവും സാന്ദ്രതയുമാണ് വർദ്ധിക്കുന്നത്.",
    "subtopic": "Display Resolution & Pixels"
  },
  {
    "id": "PSC_170_2014_073",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "73. Which organic ink colour provides the best write for a CD-R?",
    "option_a": "Blue",
    "option_b": "Green",
    "option_c": "Gold",
    "option_d": "The ink colour doesn't matter",
    "correct_answer": "D",
    "explanation": "PSC Answer Key confirms: 'The ink colour doesn't matter'. Modern CD-R media dyes (cyanine, phthalocyanine, azo) are all optimized to read at the 780nm laser wavelength regardless of apparent visual dye color.\n\n[മലയാളം]: ഒഫീഷ്യൽ പി.എസ്.സി കീ പ്രകാരം 'The ink colour doesn't matter' എന്നാണ് ശരിയുത്തരം (വിവിധ തരം ഡൈകൾ ഉണ്ടെങ്കിലും ലേസർ വേവ്‌ലെങ്തിൽ പ്രവർത്തനം തുല്യമാണ്).",
    "subtopic": "Optical Storage: CD-R Dyes"
  },
  {
    "id": "PSC_170_2014_074",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "74. What happens to the CPU if any one of its pin is broken?",
    "option_a": "The CPU is useless",
    "option_b": "Used, but speed will be decreased",
    "option_c": "Can be used by soldering a new pin",
    "option_d": "Nothing. Most of the pins are redundant",
    "correct_answer": "A",
    "explanation": "A broken pin disrupts electrical signals (address, data, power, or clock lines) critical to CPU operation, rendering the processor non-functional (useless).\n\n[മലയാളം]: പ്രോസസ്സറിന്റെ ഏതെങ്കിലും ഒരു പിൻ ഒടിഞ്ഞുപോയാൽ ആ പ്രോസസ്സർ ഉപയോഗശൂന്യമായിത്തീരും (The CPU is useless).",
    "subtopic": "CPU Maintenance & Pin Integrity"
  },
  {
    "id": "PSC_170_2014_075",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "75. Which of the following factors identify a CPU?",
    "option_a": "Manufacturer, Speed, Manufacturing process, Form factor",
    "option_b": "Manufacturer, Model, Speed, Manufacturing Process",
    "option_c": "Manufacturer, Model, Speed, Package",
    "option_d": "Form factor, Model, Speed, Package",
    "correct_answer": "C",
    "explanation": "A CPU is primarily identified in hardware specifications by its Manufacturer (e.g., Intel/AMD), Model (e.g., Core i7 12700K), Speed/Clock Rate (e.g., 3.6 GHz), and Package type (e.g., LGA 1700).\n\n[മലയാളം]: ഒരു പ്രോസസ്സറിനെ പൂർണ്ണമായി തിരിച്ചറിയാൻ ഉപയോഗിക്കുന്ന ഘടകങ്ങൾ: Manufacturer, Model, Speed, Package എന്നിവയാണ്.",
    "subtopic": "CPU Identification & Specifications"
  },
  {
    "id": "PSC_170_2014_076",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "76. Which port allows a CD-ROM to play music from a CD through a computer?",
    "option_a": "Serial",
    "option_b": "AUX_IN",
    "option_c": "Parallel",
    "option_d": "CD_IN",
    "correct_answer": "D",
    "explanation": "The 4-pin analog CD_IN connector on sound cards or motherboards connected directly to the analog audio output port of internal CD-ROM drives.\n\n[മലയാളം]: സിഡി റോമിൽ നിന്ന് ഓഡിയോ നേരിട്ട് കമ്പ്യൂട്ടറിലെ സൗണ്ട് കാർഡിലൂടെ കേൾക്കാൻ ഉപയോഗിച്ചിരുന്ന ആന്തരിക കണക്ടറാണ് CD_IN.",
    "subtopic": "Audio Connectors: CD_IN"
  },
  {
    "id": "PSC_170_2014_077",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "77. Which of the following memory is used for Cache?",
    "option_a": "Flash memory",
    "option_b": "ROM Chip",
    "option_c": "DRAM",
    "option_d": "SRAM",
    "correct_answer": "D",
    "explanation": "SRAM (Static RAM) does not need periodic refreshing and is extremely fast, making it ideal for CPU L1, L2, and L3 cache memory.\n\n[മലയാളം]: അതിവേഗ കാഷ് മെമ്മറിയായി (Cache memory) ഉപയോഗിക്കുന്നത് സ്റ്റാറ്റിക് റാം (SRAM) ആണ്.",
    "subtopic": "SRAM & Cache Architecture"
  },
  {
    "id": "PSC_170_2014_078",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "78. Which of the following is not a primary storage device? [Deleted by PSC]",
    "option_a": "Magnetic Tape",
    "option_b": "Floppy Disk",
    "option_c": "Optical Disk",
    "option_d": "None of the above",
    "correct_answer": "X",
    "explanation": "[Note: This question was officially DELETED by PSC in the final answer key because Magnetic Tape, Floppy Disk, and Optical Disk are all secondary storage devices, so none of them are primary storage].\n\n[മലയാളം]: ഈ ചോദ്യം പി.എസ്.സി ഔദ്യോഗിക ഫൈനൽ കീയിൽ ഒഴിവാക്കിയിട്ടുണ്ട് (Deleted). മാഗ്നറ്റിക് ടേപ്പ്, ഫ്ലോപ്പി ഡിസ്ക്, ഒപ്റ്റിക്കൽ ഡിസ്ക് എന്നിവയെല്ലാം സെക്കൻഡറി സ്റ്റോറേജ് ഡിവൈസുകളാണ്.",
    "subtopic": "Primary vs Secondary Storage"
  },
  {
    "id": "PSC_170_2014_079",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "79. The software used to visit a website is :",
    "option_a": "search engine",
    "option_b": "browser",
    "option_c": "file manager",
    "option_d": "www",
    "correct_answer": "B",
    "explanation": "A Web Browser (such as Chrome, Firefox, Safari) is application software used to access, retrieve, and view web pages on the World Wide Web.\n\n[മലയാളം]: വെബ്സൈറ്റുകൾ സന്ദർശിക്കാനും ബ്രൗസ് ചെയ്യാനും ഉപയോഗിക്കുന്ന ആപ്ലിക്കേഷൻ സോഫ്റ്റ്‌വെയറാണ് വെബ് ബ്രൗസർ (Web browser).",
    "subtopic": "Internet & Web Browsers"
  },
  {
    "id": "PSC_170_2014_080",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "80. Which of the following is not a sound file format?",
    "option_a": "TXT",
    "option_b": "WAV",
    "option_c": "WMA",
    "option_d": "RM",
    "correct_answer": "A",
    "explanation": "TXT is a plain text file format. WAV, WMA, and RM (RealMedia Audio) are digital audio sound formats.\n\n[മലയാളം]: TXT എന്നത് ടെക്സ്റ്റ് ഫയൽ ഫോർമാറ്റാണ്; WAV, WMA, RM എന്നിവ ഓഡിയോ ഫയൽ ഫോർമാറ്റുകളാണ്.",
    "subtopic": "Multimedia File Formats"
  },
  {
    "id": "PSC_170_2014_081",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "81. The first Indian who became Governor General of India?",
    "option_a": "Lord Mount Batten",
    "option_b": "C. Rajagopalachari",
    "option_c": "Dr. S. Radhakrishnan",
    "option_d": "Sardar Vallabhai Patel",
    "correct_answer": "B",
    "explanation": "C. Rajagopalachari (Rajaji) served as the first and only Indian Governor-General of independent India from June 1948 to January 1950.\n\n[മലയാളം]: സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യത്തെയും അവസാനത്തെയും ഇന്ത്യൻ ഗവർണർ ജനറൽ സി. രാജഗോപാലാചാരി (C. Rajagopalachari) ആയിരുന്നു.",
    "subtopic": "Indian History"
  },
  {
    "id": "PSC_170_2014_082",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "82. Longest river in India :",
    "option_a": "Ganga",
    "option_b": "Brahmaputra",
    "option_c": "Yamuna",
    "option_d": "Thapthi",
    "correct_answer": "A",
    "explanation": "The Ganga is the longest river flowing entirely within India, with an official length of 2,525 km.\n\n[മലയാളം]: ഇന്ത്യയിലൂടെ ഏറ്റവും കൂടുതൽ ദൂരം ഒഴുകുന്ന ഏറ്റവും നീളം കൂടിയ നദി ഗംഗ (Ganga - 2,525 km) ആണ്.",
    "subtopic": "Indian Geography: Rivers"
  },
  {
    "id": "PSC_170_2014_083",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "83. The slogan 'jai jawan, jai kisan' is associated with :",
    "option_a": "Jawaharlal Nehru",
    "option_b": "Gulsarilal Nanda",
    "option_c": "Indira Gandhi",
    "option_d": "Lal Bahadur Sastri",
    "correct_answer": "D",
    "explanation": "The historic slogan 'Jai Jawan, Jai Kisan' (Hail the Soldier, Hail the Farmer) was coined by India's second Prime Minister, Lal Bahadur Shastri, in 1965.\n\n[മലയാളം]: 'ജയ് ജവാൻ, ജയ് കിസാൻ' എന്ന വിഖ്യാത മുദ്രാവാക്യം മുഴക്കിയത് ലാൽ ബഹദൂർ ശാസ്ത്രി (Lal Bahadur Shastri) ആണ്.",
    "subtopic": "Indian National Movement & Leaders"
  },
  {
    "id": "PSC_170_2014_084",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "84. First democratically elected communist Government was constituted in :",
    "option_a": "Manipur",
    "option_b": "West Bengal",
    "option_c": "Kerala",
    "option_d": "Thripura",
    "correct_answer": "C",
    "explanation": "In 1957, the world's first democratically elected Communist ministry led by E.M.S. Namboodiripad assumed office in Kerala.\n\n[മലയാളം]: ലോകത്തിൽ ജനാധിപത്യ പ്രക്രിയയിലൂടെ തെരഞ്ഞെടുക്കപ്പെട്ട ആദ്യത്തെ കമ്മ്യൂണിസ്റ്റ് മന്ത്രിസഭ 1957-ൽ കേരളത്തിലാണ് (ഇ.എം.എസിന്റെ നേതൃത്വത്തിൽ) അധികാരത്തിൽ വന്നത്.",
    "subtopic": "Kerala History"
  },
  {
    "id": "PSC_170_2014_085",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "85. Who was known as 'Fontier Gandhi'?",
    "option_a": "Ayub khan",
    "option_b": "Firoz Gandhi",
    "option_c": "Khan Abdul Gaffer Khan",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "Khan Abdul Ghaffar Khan (Badshah Khan), leader of the non-violent Khudai Khidmatgar movement in the North-West Frontier Province, was known as Frontier Gandhi.\n\n[മലയാളം]: 'അതിർത്തി ഗാന്ധി' (Frontier Gandhi) എന്നറിയപ്പെടുന്നത് ഖാൻ അബ്ദുൽ ഗാഫർ ഖാൻ (Khan Abdul Ghaffar Khan) ആണ്.",
    "subtopic": "Indian Freedom Struggle"
  },
  {
    "id": "PSC_170_2014_086",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "86. The first Indian received Nobel Prize in Medicine :",
    "option_a": "Har Govind Khurana",
    "option_b": "Ravindranath Tagore",
    "option_c": "C.V. Raman",
    "option_d": "Amartya Sen",
    "correct_answer": "A",
    "explanation": "Indian-American biochemist Har Gobind Khorana shared the 1968 Nobel Prize in Physiology or Medicine for interpreting the genetic code.\n\n[മലയാളം]: വൈദ്യശാസ്ത്രത്തിൽ (Medicine) നോബൽ സമ്മാനം നേടിയ ആദ്യത്തെ ഇന്ത്യൻ വംശജൻ ഡോ. ഹർ ഗോവിന്ദ് ഖുറാന (Har Gobind Khorana - 1968) ആണ്.",
    "subtopic": "Indian Nobel Laureates"
  },
  {
    "id": "PSC_170_2014_087",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "87. Temple entry proclamation was signed in the year :",
    "option_a": "1936",
    "option_b": "1934",
    "option_c": "1933",
    "option_d": "1932",
    "correct_answer": "A",
    "explanation": "The historic Temple Entry Proclamation was issued by the Maharaja of Travancore, Chithira Thirunal Balarama Varma, on November 12, 1936.\n\n[മലയാളം]: തിരുവിതാംകൂറിൽ ചരിത്രപ്രസിദ്ധമായ ക്ഷേത്രപ്രവേശന വിളംബരം പുറപ്പെടുവിച്ചത് 1936 നവംബർ 12-നാണ് (ശ്രീ ചിത്തിര തിരുനാൾ ബാലരാമവർമ്മ).",
    "subtopic": "Kerala Renaissance & Temple Entry"
  },
  {
    "id": "PSC_170_2014_088",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "88. Newly deposited alluvial soil that found in Northern Great Plain is known as :",
    "option_a": "Bhangar",
    "option_b": "Black soil",
    "option_c": "Desert soil",
    "option_d": "Khader",
    "correct_answer": "D",
    "explanation": "In the Indo-Gangetic plains, the newer, highly fertile alluvial soil deposited annually by floods is called Khadar (older alluvium is Bhangar).\n\n[മലയാളം]: ഉത്തരേന്ത്യൻ സമതലങ്ങളിൽ നദികൾ ഓരോ വർഷവും പുതുതായി നിക്ഷേപിക്കുന്ന ഫലഭൂയിഷ്ഠമായ എക്കൽമണ്ണിനെ 'ഖാദർ' (Khadar / Khader) എന്ന് വിളിക്കുന്നു (പഴയ എക്കൽമണ്ണ് ഭംഗാർ ആണ്).",
    "subtopic": "Indian Soils & Geography"
  },
  {
    "id": "PSC_170_2014_089",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "89. 'Adukkalayil ninnum arangethekku' is a famous drama written by :",
    "option_a": "Thoppil Bhasi",
    "option_b": "Chembaka Raman",
    "option_c": "V.T. Bhattathirippad",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "'Adukkalayil Ninnum Arangathecku' (From the Kitchen to the Stage) is a revolutionary social drama written by V.T. Bhattathiripad in 1929 against orthodoxy in the Namboothiri community.\n\n[മലയാളം]: 'അടുക്കളയിൽ നിന്ന് അരങ്ങത്തേക്ക്' എന്ന പ്രശസ്ത സാമൂഹിക നാടകം രചിച്ചത് വി.ടി. ഭട്ടതിരിപ്പാട് (V.T. Bhattathiripad) ആണ്.",
    "subtopic": "Kerala Renaissance Literature"
  },
  {
    "id": "PSC_170_2014_090",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "90. Saadhu Jana Paripalana Sangham was founded by :",
    "option_a": "Sri. Narayana Guru",
    "option_b": "Ayyankali",
    "option_c": "Chattampi Swamikal",
    "option_d": "Dr. Palppu",
    "correct_answer": "B",
    "explanation": "Mahatma Ayyankali founded the Sadhu Jana Paripalana Sangham (SJPS) in 1907 to advance education and civil rights for marginalized Dalits.\n\n[മലയാളം]: 1907-ൽ സാധുജന പരിപാലന സംഘം (SJPS) സ്ഥാപിച്ചത് മഹാത്മാ അയ്യങ്കാളി (Ayyankali) ആണ്.",
    "subtopic": "Kerala Renaissance Leaders: Ayyankali"
  },
  {
    "id": "PSC_170_2014_091",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "91. NREGPA is a programme for :",
    "option_a": "rural employment guarantee",
    "option_b": "rural education guarantee",
    "option_c": "rural women empowerment",
    "option_d": "rural literacy programme",
    "correct_answer": "A",
    "explanation": "MGNREGA / NREGA provides a legal guarantee for at least 100 days of paid wage employment in a financial year to rural adult households.\n\n[മലയാളം]: ഗ്രാമീണ കുടുംബങ്ങൾക്ക് വർഷത്തിൽ 100 ദിവസത്തെ തൊഴിൽ ഉറപ്പുനൽകുന്ന പദ്ധതിയാണ് ഗ്രാമീണ തൊഴിലുറപ്പ് പദ്ധതി (Rural employment guarantee).",
    "subtopic": "Social Welfare Schemes"
  },
  {
    "id": "PSC_170_2014_092",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "92. 'One Caste, one religion, One God for mankind is associated with :",
    "option_a": "Kumara Guru",
    "option_b": "Sri Narayana Guru",
    "option_c": "Vaikunta Swamikal",
    "option_d": "Sahodaran Ayyappan",
    "correct_answer": "B",
    "explanation": "'One Caste, One Religion, One God for Mankind' (ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം മനുഷ്യന്) is the universal teaching of Sree Narayana Guru.\n\n[മലയാളം]: 'ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം മനുഷ്യന്' എന്ന വിശ്വപ്രസിദ്ധമായ സന്ദേശം നൽകിയത് ശ്രീനാരായണ ഗുരു (Sree Narayana Guru) ആണ്.",
    "subtopic": "Kerala Renaissance: Sree Narayana Guru"
  },
  {
    "id": "PSC_170_2014_093",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "93. The first spacecraft of India for lunar expedition :",
    "option_a": "Rohini",
    "option_b": "Aryabhatta",
    "option_c": "Chandrayan-1",
    "option_d": "None of the above",
    "correct_answer": "C",
    "explanation": "Chandrayaan-1 was India's first lunar probe mission, launched by ISRO using PSLV-C11 in October 2008.\n\n[മലയാളം]: ഇന്ത്യയുടെ പ്രഥമ ചാന്ദ്രദൗത്യ പേടകമാണ് ചന്ദ്രയാൻ-1 (Chandrayaan-1 - 2008).",
    "subtopic": "Space Missions & ISRO"
  },
  {
    "id": "PSC_170_2014_094",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "94. Founder of Grameen Bank who contributed the idea of micro credit and micro financing :",
    "option_a": "Amartya Sen",
    "option_b": "Muhammed Yunus",
    "option_c": "Manmohan Singh",
    "option_d": "Ranga Rajan",
    "correct_answer": "B",
    "explanation": "Muhammad Yunus of Bangladesh founded the Grameen Bank pioneering the concepts of microcredit and microfinance, receiving the Nobel Peace Prize in 2006.\n\n[മലയാളം]: ഗ്രാമീൺ ബാങ്ക് സ്ഥാപിച്ച് മൈക്രോക്രെഡിറ്റ്, മൈക്രോഫിനാൻസ് ആശയങ്ങൾ ലോകത്തിന് പരിചയപ്പെടുത്തിയത് മുഹമ്മദ് യൂനുസ് (Muhammad Yunus) ആണ്.",
    "subtopic": "Economics & Global Personalities"
  },
  {
    "id": "PSC_170_2014_095",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "95. Nobel Prize winner for Literature in 2013 :",
    "option_a": "Peter Higgs",
    "option_b": "Moyan",
    "option_c": "Gabriel Garcia Marquiz",
    "option_d": "Alice Munro",
    "correct_answer": "D",
    "explanation": "Canadian short-story author Alice Munro won the Nobel Prize in Literature in 2013 as a 'master of the contemporary short story'.\n\n[മലയാളം]: 2013-ലെ സാഹിത്യത്തിനുള്ള നോബൽ സമ്മാനം നേടിയത് കനേഡിയൻ എഴുത്തുകാരിയായ ആലീസ് മൺറോ (Alice Munro) ആണ്.",
    "subtopic": "Nobel Prizes & Literature"
  },
  {
    "id": "PSC_170_2014_096",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "96. 2010 FIFA World Cup winner :",
    "option_a": "Brazil",
    "option_b": "Netherland",
    "option_c": "Italy",
    "option_d": "Spain",
    "correct_answer": "D",
    "explanation": "Spain won the 2010 FIFA World Cup held in South Africa, defeating the Netherlands 1-0 in the final.\n\n[മലയാളം]: 2010-ൽ ദക്ഷിണാഫ്രിക്കയിൽ നടന്ന ഫിഫ ലോകകപ്പ് ഫുട്ബോൾ കിരീടം നേടിയ രാജ്യം സ്പെയിൻ (Spain) ആണ്.",
    "subtopic": "Sports & FIFA World Cup"
  },
  {
    "id": "PSC_170_2014_097",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "97. Original name of Kumara Guru who fought against discrimination towards Dalit Christians :",
    "option_a": "Mathai Yohannan",
    "option_b": "Poikayil Yohannan",
    "option_c": "Pandit Karuppan",
    "option_d": "Ayyankali",
    "correct_answer": "B",
    "explanation": "Poikayil Appachan (Poikayil Yohannan), also known as Kumara Guru, founded the Prathyaksha Raksha Daiva Sabha (PRDS) in 1909.\n\n[മലയാളം]: പൊയ്കയിൽ അപ്പച്ചൻ / പൊയ്കയിൽ യോഹന്നാൻ (Poikayil Yohannan) ആണ് കുമാരഗുരുദേവൻ എന്നറിയപ്പെടുന്നത്. അദ്ദേഹം PRDS സ്ഥാപിച്ചു.",
    "subtopic": "Kerala Renaissance: Poikayil Yohannan"
  },
  {
    "id": "PSC_170_2014_098",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "98. Present Chief Justice of India : [Deleted by PSC]",
    "option_a": "R.M. Lodha",
    "option_b": "Justice K.G. Balakrishnan",
    "option_c": "J.H. Khania",
    "option_d": "R.S. Pathak",
    "correct_answer": "X",
    "explanation": "[Note: This question was DELETED by PSC in the final key because Chief Justice R.M. Lodha retired on September 27, 2014, and Justice H.L. Dattu took over before the exam on October 17, 2014].\n\n[മലയാളം]: ഈ ചോദ്യം പി.എസ്.സി ഔദ്യോഗിക ഫൈനൽ കീയിൽ ഒഴിവാക്കിയിട്ടുണ്ട് (Deleted). 2014 സെപ്റ്റംബറിൽ ആർ.എം. ലോധ വിരമിച്ചതിനാലാണ് ചോദ്യം ഒഴിവാക്കിയത്.",
    "subtopic": "Indian Judiciary"
  },
  {
    "id": "PSC_170_2014_099",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "99. Jalianwala Bagh was held in :",
    "option_a": "1917",
    "option_b": "1919",
    "option_c": "1920",
    "option_d": "1921",
    "correct_answer": "B",
    "explanation": "The Jallianwala Bagh massacre occurred on April 13, 1919, in Amritsar, Punjab, when British troops commanded by General Dyer opened fire on unarmed crowds.\n\n[മലയാളം]: ജാലിയൻ വാലാബാഗ് കൂട്ടക്കൊല നടന്നത് 1919 ഏപ്രിൽ 13-നാണ്.",
    "subtopic": "Indian National Movement"
  },
  {
    "id": "PSC_170_2014_100",
    "sheetName": "PSC_Tradesman_170_2014",
    "question": "100. Edakkal Cave is situated in :",
    "option_a": "Palakkad",
    "option_b": "Kannur",
    "option_c": "Kasergod",
    "option_d": "Wayanad",
    "correct_answer": "D",
    "explanation": "The historic prehistoric Edakkal Caves containing Neolithic rock petroglyphs are situated on Ambukuthi Mala in Wayanad district, Kerala.\n\n[മലയാളം]: നവീന ശിലായുഗ ചിത്രങ്ങൾ കാണപ്പെടുന്ന ചരിത്രപ്രസിദ്ധമായ എടക്കൽ ഗുഹകൾ സ്ഥിതി ചെയ്യുന്നത് വയനാട് (Wayanad) ജില്ലയിലാണ്.",
    "subtopic": "Kerala Geography & Prehistoric Sites"
  }
];
}
