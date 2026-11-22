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
    { name: "Module_10_Security_Cloud_Law", title: "Module 10: Security, Cloud & IT Law (10 Marks)" }
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
5. Return ONLY a valid raw JSON array of objects, with NO MARKDOWN formatting, NO \`\`\`json wrappers.

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
          return JSON.parse(rawText);
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
 * API Key കണ്ടുപിടിക്കാൻ (Script Properties അല്ലെങ്കിൽ കോഡിലെ വേരിയബിൾ)
 */
function getEffectiveApiKey() {
  const prop = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (prop) return prop;
  return GEMINI_API_KEY;
}

