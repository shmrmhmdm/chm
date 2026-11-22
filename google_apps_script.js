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

// അടിസ്ഥാന ചോദ്യങ്ങൾ (Initial Seed Data)
function getInitialQuestions() {
  return [
    {
      sheetName: "Module_1_Electronics",
      id: "M1_01",
      question: "Which electronic component opposes sudden changes in current?",
      option_a: "Capacitor",
      option_b: "Inductor",
      option_c: "Resistor",
      option_d: "Zener Diode",
      correct_answer: "B",
      explanation: "An inductor opposes sudden changes in electric current due to Lenz's law and self-inductance. Capacitors oppose sudden changes in voltage.",
      subtopic: "Inductors"
    },
    {
      sheetName: "Module_1_Electronics",
      id: "M1_02",
      question: "What is the barrier potential of a Silicon PN junction diode at room temperature?",
      option_a: "0.3 V",
      option_b: "0.7 V",
      option_c: "1.1 V",
      option_d: "0.2 V",
      correct_answer: "B",
      explanation: "Silicon diode barrier potential is approximately 0.7 V, while for Germanium it is around 0.3 V.",
      subtopic: "Semiconductors"
    },
    {
      sheetName: "Module_2_Comp_Fundamentals",
      id: "M2_01",
      question: "Which type of memory is volatile and requires continuous power to retain data?",
      option_a: "ROM",
      option_b: "Flash Memory",
      option_c: "RAM",
      option_d: "EEPROM",
      correct_answer: "C",
      explanation: "RAM (Random Access Memory) is volatile; contents are lost when system power is turned off.",
      subtopic: "Memory Hierarchy"
    },
    {
      sheetName: "Module_3_Adv_Hardware_Storage",
      id: "M3_01",
      question: "Which RAID level provides block-level striping without parity or fault tolerance?",
      option_a: "RAID 0",
      option_b: "RAID 1",
      option_c: "RAID 5",
      option_d: "RAID 10",
      correct_answer: "A",
      explanation: "RAID 0 divides data evenly across two or more disks (striping) without redundancy.",
      subtopic: "RAID"
    },
    {
      sheetName: "Module_4_OS_Deployment",
      id: "M4_01",
      question: "What is the maximum disk partition size supported by the traditional Master Boot Record (MBR) scheme?",
      option_a: "1 TB",
      option_b: "2 TB",
      option_c: "4 TB",
      option_d: "8 TB",
      correct_answer: "B",
      explanation: "MBR partitioning uses 32-bit sector addressing, limiting partition capacity to approximately 2 TB.",
      subtopic: "Partition Schemes"
    },
    {
      sheetName: "Module_5_System_Utilities",
      id: "M5_01",
      question: "Which Windows directory stores critical system DLLs, kernel files, and system executables for 64-bit systems?",
      option_a: "C:\\Program Files",
      option_b: "C:\\Windows\\System32",
      option_c: "C:\\Windows\\Temp",
      option_d: "C:\\Users",
      correct_answer: "B",
      explanation: "C:\\Windows\\System32 contains essential core operating system files and commands.",
      subtopic: "System Files"
    },
    {
      sheetName: "Module_6_Office_Applications",
      id: "M6_01",
      question: "Which feature in word processing is used to generate personalized letters to multiple recipients simultaneously?",
      option_a: "Track Changes",
      option_b: "Mail Merge",
      option_c: "AutoCorrect",
      option_d: "Macro",
      correct_answer: "B",
      explanation: "Mail Merge allows creating multiple documents combining a standard template with a data source.",
      subtopic: "Word Processing"
    },
    {
      sheetName: "Module_7_IO_Devices",
      id: "M7_01",
      question: "Which printer type utilizes a photosensitive drum, laser beam, and toner powder to produce printouts?",
      option_a: "Dot Matrix Printer",
      option_b: "Inkjet Printer",
      option_c: "Thermal Printer",
      option_d: "Laser Printer",
      correct_answer: "D",
      explanation: "Laser printers use an electrostatic digital printing process with a rotating photosensitive drum and toner powder.",
      subtopic: "Printers"
    },
    {
      sheetName: "Module_8_Networking",
      id: "M8_01",
      question: "Which OSI model layer is responsible for logical IP addressing and path determination (routing)?",
      option_a: "Data Link Layer (Layer 2)",
      option_b: "Network Layer (Layer 3)",
      option_c: "Transport Layer (Layer 4)",
      option_d: "Session Layer (Layer 5)",
      correct_answer: "B",
      explanation: "The Network Layer (Layer 3) handles IP addressing, packet forwarding, and routing.",
      subtopic: "OSI Reference Model"
    },
    {
      sheetName: "Module_9_Protocols_Servers",
      id: "M9_01",
      question: "Which protocol automatically assigns IP addresses, subnet masks, and default gateways to network clients?",
      option_a: "DNS",
      option_b: "DHCP",
      option_c: "SNMP",
      option_d: "SMTP",
      correct_answer: "B",
      explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP configuration to devices.",
      subtopic: "Application Protocols"
    },
    {
      sheetName: "Module_10_Security_Cloud_Law",
      id: "M10_01",
      question: "In India, which legislation governs electronic commerce, digital signatures, and cybercrimes?",
      option_a: "Indian Penal Code (IPC) 1860",
      option_b: "Information Technology Act 2000 (IT Act)",
      option_c: "Digital Data Act 1998",
      option_d: "Copyright Act 1957",
      correct_answer: "B",
      explanation: "The Information Technology Act, 2000 (IT Act) is the primary law in India dealing with cybercrime.",
      subtopic: "IT Act & Cyber Laws"
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

