// High-Yield Syllabus Gap Questions for Kerala PSC Tradesman CHM (Cat. No. 884/2025)
// Focused on topics under-represented in older papers (SCR/DIAC/TRIAC, RAID, PowerShell/System32, Excel, IT Act 2000, Cloud, VLAN)

const SYLLABUS_EXTRA_QUESTIONS = [
  // ================= MODULE 1: BASIC ELECTRONICS (12 Marks) =================
  {
    id: "EX_M1_01",
    sheetName: "Module_1_Electronics",
    question: "How many PN junctions and terminals does a Silicon Controlled Rectifier (SCR) have?",
    option_a: "2 junctions and 2 terminals",
    option_b: "3 junctions and 3 terminals",
    option_c: "4 junctions and 3 terminals",
    option_d: "3 junctions and 4 terminals",
    correct_answer: "B",
    explanation: "An SCR is a 4-layer (PNPN) semiconductor device with 3 PN junctions (J1, J2, J3) and 3 terminals: Anode (A), Cathode (K), and Gate (G).\n\n[മലയാളം]: SCR (Silicon Controlled Rectifier) ഒരു 4-ലെയർ (PNPN) ഉപകരണമാണ്; ഇതിൽ 3 PN ജംഗ്ഷനുകളും 3 ടെർമിനലുകളും (Anode, Cathode, Gate) ആണുള്ളത്.",
    subtopic: "Power Semiconductor Devices: SCR"
  },
  {
    id: "EX_M1_02",
    sheetName: "Module_1_Electronics",
    question: "Which power semiconductor device is a bidirectional switch without a gate terminal, primarily used to trigger a TRIAC?",
    option_a: "SCR",
    option_b: "DIAC",
    option_c: "MOSFET",
    option_d: "Zener Diode",
    correct_answer: "B",
    explanation: "A DIAC (Diode for Alternating Current) is a two-terminal, bidirectional switching device with no gate terminal, commonly used to trigger TRIACs in AC phase-control circuits.\n\n[മലയാളം]: ഗേറ്റ് ടെർമിനൽ ഇല്ലാത്തതും ഇരുദിശകളിലേക്കും (Bidirectional) പ്രവർത്തിക്കുന്നതുമായ പവർ ഡിവൈസാണ് DIAC. പ്രധാനമായും TRIAC-നെ ട്രിഗർ ചെയ്യാനാണ് ഇത് ഉപയോഗിക്കുന്നത്.",
    subtopic: "Power Semiconductor Devices: DIAC & TRIAC"
  },
  {
    id: "EX_M1_03",
    sheetName: "Module_1_Electronics",
    question: "What is the minimum anode current required to keep an SCR in the conducting ON state immediately after the gate signal is removed?",
    option_a: "Holding current",
    option_b: "Latching current",
    option_c: "Reverse saturation current",
    option_d: "Breakdown current",
    correct_answer: "B",
    explanation: "Latching current (IL) is the minimum anode current needed to turn ON and latch an SCR when the gate signal is removed. Holding current (IH) is the minimum current below which an already conducting SCR turns OFF (IL > IH).\n\n[മലയാളം]: ഗേറ്റ് സിഗ്നൽ മാറ്റിയതിന് ശേഷം SCR ഓൺ അവസ്ഥയിൽ തുടരാൻ വേണ്ട ഏറ്റവും കുറഞ്ഞ ആനോഡ് കറന്റാണ് 'ലാച്ചിംഗ് കറന്റ്' (Latching current). ഓഫ് ആകാതെ നിലനിർത്താനുള്ള കുറഞ്ഞ കറന്റ് ഹോൾഡിംഗ് കറന്റാണ്.",
    subtopic: "SCR: Latching & Holding Current"
  },
  {
    id: "EX_M1_04",
    sheetName: "Module_1_Electronics",
    question: "In a Zener diode voltage regulator, how is the Zener diode always connected in the circuit?",
    option_a: "Forward biased in series with load",
    option_b: "Reverse biased in parallel with load",
    option_c: "Forward biased in parallel with load",
    option_d: "Reverse biased in series with load",
    correct_answer: "B",
    explanation: "A Zener diode operates in the reverse breakdown region and is connected in reverse bias in parallel (shunt) with the load resistor to maintain a constant output voltage.\n\n[മലയാളം]: വോൾട്ടേജ് റെഗുലേറ്ററുകളിൽ സീനർ ഡയോഡ് എപ്പോഴും ലോഡിന് പാരലലായി (Parallel) റിവേഴ്സ് ബയസിലാണ് (Reverse Biased) ഘടിപ്പിക്കുന്നത്.",
    subtopic: "Voltage Regulation: Zener Regulators"
  },
  {
    id: "EX_M1_05",
    sheetName: "Module_1_Electronics",
    question: "Which 3-pin IC voltage regulator provides an adjustable positive DC output voltage from +1.25V to +37V?",
    option_a: "LM7805",
    option_b: "LM7912",
    option_c: "LM317",
    option_d: "LM7812",
    correct_answer: "C",
    explanation: "LM317 is a popular 3-terminal adjustable positive voltage regulator capable of supplying +1.25V to +37V using two external resistors. 78xx/79xx are fixed regulators.\n\n[മലയാളം]: +1.25V മുതൽ +37V വരെ ആവശ്യാനുസരണം ക്രമീകരിക്കാവുന്ന (Adjustable) 3-പിൻ പോസിറ്റീവ് വോൾട്ടേജ് റെഗുലേറ്റർ ഐ.സിയാണ് LM317.",
    subtopic: "3-Pin IC Voltage Regulators"
  },
  {
    id: "EX_M1_06",
    sheetName: "Module_1_Electronics",
    question: "What is the approximate barrier potential (knee voltage) of a Silicon PN junction diode at room temperature?",
    option_a: "0.3 V",
    option_b: "0.7 V",
    option_c: "1.1 V",
    option_d: "5.0 V",
    correct_answer: "B",
    explanation: "At room temperature (~25°C), the barrier potential is approximately 0.7 V for Silicon (Si) diodes and 0.3 V for Germanium (Ge) diodes.\n\n[മലയാളം]: സിലിക്കൺ (Silicon) PN ജംഗ്ഷൻ ഡയോഡിന്റെ ബാരിയർ പൊട്ടൻഷ്യൽ ഏകദേശം 0.7 V ആണ് (ജർമ്മേനിയത്തിന് 0.3 V).",
    subtopic: "PN Junction Diode"
  },
  {
    id: "EX_M1_07",
    sheetName: "Module_1_Electronics",
    question: "Two resistors of 6 Ω and 3 Ω are connected in parallel. What is their equivalent resistance?",
    option_a: "9 Ω",
    option_b: "4.5 Ω",
    option_c: "2 Ω",
    option_d: "1.5 Ω",
    correct_answer: "C",
    explanation: "For two resistors in parallel: Req = (R1 × R2) / (R1 + R2) = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω.\n\n[മലയാളം]: പാരലൽ കണക്ഷനിൽ Req = (R1 × R2) / (R1 + R2) = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω.",
    subtopic: "Resistors: Series & Parallel"
  },
  {
    id: "EX_M1_08",
    sheetName: "Module_1_Electronics",
    question: "Two capacitors of 4 µF each are connected in series. What is the total equivalent capacitance?",
    option_a: "8 µF",
    option_b: "4 µF",
    option_c: "2 µF",
    option_d: "1 µF",
    correct_answer: "C",
    explanation: "Capacitors in series combine like resistors in parallel: 1/Ceq = 1/4 + 1/4 = 2/4, so Ceq = 2 µF.\n\n[മലയാളം]: കപ്പാസിറ്ററുകൾ സീരീസ് (Series) ആയി ഘടിപ്പിക്കുമ്പോൾ ആകെ കപ്പാസിറ്റൻസ് കുറയുന്നു: Ceq = (4 × 4) / (4 + 4) = 2 µF.",
    subtopic: "Capacitors: Series & Parallel"
  },
  {
    id: "EX_M1_09",
    sheetName: "Module_1_Electronics",
    question: "According to Kirchhoff's Voltage Law (KVL), what is the algebraic sum of all voltages around any closed loop in a circuit?",
    option_a: "Equal to supply current",
    option_b: "Always zero",
    option_c: "Always positive",
    option_d: "Equal to total resistance",
    correct_answer: "B",
    explanation: "Kirchhoff's Voltage Law (conservation of energy) states that the algebraic sum of all electromotive forces and voltage drops around any closed loop equals zero.\n\n[മലയാളം]: കിർച്ചോഫിന്റെ വോൾട്ടേജ് നിയമപ്രകാരം (KVL), ഒരു ക്ലോസ്ഡ് ലൂപ്പിലെ എല്ലാ വോൾട്ടേജുകളുടെയും ബീജഗണിത തുക എപ്പോഴും പൂജ്യം (Zero) ആയിരിക്കും.",
    subtopic: "Kirchhoff's Laws"
  },
  {
    id: "EX_M1_10",
    sheetName: "Module_1_Electronics",
    question: "Which logic gate produces a HIGH (1) output only when its two inputs are different from each other?",
    option_a: "XNOR",
    option_b: "XOR",
    option_c: "NAND",
    option_d: "NOR",
    correct_answer: "B",
    explanation: "An XOR (Exclusive-OR) gate outputs HIGH (1) when an odd number of inputs are 1 (for 2 inputs, when A ≠ B).\n\n[മലയാളം]: രണ്ട് ഇൻപുട്ടുകളും വ്യത്യസ്തമാകുമ്പോൾ (ഒന്ന് 0, മറ്റൊന്ന് 1) മാത്രം ഔട്ട്പുട്ട് 1 നൽകുന്ന ലോജിക് ഗേറ്റാണ് XOR (Exclusive-OR) ഗേറ്റ്.",
    subtopic: "Digital Electronics: Logic Gates"
  },

  // ================= MODULE 2 & 3: HARDWARE, CPU & RAID =================
  {
    id: "EX_M3_01",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "Which RAID level uses disk striping with single distributed parity and requires a minimum of 3 hard drives?",
    option_a: "RAID 0",
    option_b: "RAID 1",
    option_c: "RAID 5",
    option_d: "RAID 10",
    correct_answer: "C",
    explanation: "RAID 5 stripes data and parity across at least 3 disks, surviving a single drive failure while keeping usable capacity at (N - 1) disks.\n\n[മലയാളം]: കുറഞ്ഞത് 3 ഹാർഡ് ഡിസ്കുകൾ ആവശ്യമുള്ളതും, ഡാറ്റയും പാരിറ്റിയും (Distributed Parity) വിഭജിച്ച് സൂക്ഷിക്കുന്നതുമായ RAID ലെവലാണ് RAID 5.",
    subtopic: "RAID Concepts and Levels"
  },
  {
    id: "EX_M3_02",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "Which RAID level provides mirroring plus striping (nested RAID) and requires a minimum of 4 drives?",
    option_a: "RAID 0",
    option_b: "RAID 1",
    option_c: "RAID 5",
    option_d: "RAID 10",
    correct_answer: "D",
    explanation: "RAID 10 (RAID 1+0) combines mirrored pairs into a striped array, requiring at least 4 drives for both high speed and strong fault tolerance.\n\n[മലയാളം]: മിററിംഗും (Mirroring) സ്ട്രൈപ്പിംഗും (Striping) സംയോജിപ്പിച്ചതും കുറഞ്ഞത് 4 ഡ്രൈവുകൾ ആവശ്യമുള്ളതുമായ RAID ലെവലാണ് RAID 10.",
    subtopic: "RAID Concepts and Levels"
  },
  {
    id: "EX_M3_03",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "Which storage protocol is specifically designed for SSDs connected directly over the PCIe bus for ultra-low latency?",
    option_a: "PATA",
    option_b: "NVMe",
    option_c: "IDE",
    option_d: "SCSI-1",
    correct_answer: "B",
    explanation: "NVMe (Non-Volatile Memory Express) communicates directly over PCIe lanes with up to 64,000 command queues, eliminating the SATA/AHCI bottleneck.\n\n[മലയാളം]: PCIe ബസ്സിലൂടെ അതിവേഗത്തിൽ SSD-കളുമായി ആശയവിനിമയം നടത്താൻ രൂപകൽപ്പന ചെയ്ത സ്റ്റോറേജ് പ്രോട്ടോക്കോളാണ് NVMe.",
    subtopic: "Solid State Devices & Interfaces"
  },
  {
    id: "EX_M3_04",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "What does NAS stand for in enterprise and home network storage?",
    option_a: "Network Array System",
    option_b: "Network Attached Storage",
    option_c: "Node Access Storage",
    option_d: "Native Allocation System",
    correct_answer: "B",
    explanation: "NAS stands for Network Attached Storage, a dedicated file-level storage server connected to a LAN.\n\n[മലയാളം]: ഒരു ലോക്കൽ നെറ്റ്‌വർക്കിലൂടെ ഫയലുകൾ ഷെയർ ചെയ്യാൻ ഉപയോഗിക്കുന്ന പ്രത്യേക സ്റ്റോറേജ് സംവിധാനമാണ് NAS (Network Attached Storage).",
    subtopic: "Network Attached Storage (NAS)"
  },
  {
    id: "EX_M2_01",
    sheetName: "Module_2_Comp_Fundamentals",
    question: "Which motherboard bus architecture is a high-speed serial point-to-point interface used for modern graphics cards and M.2 SSDs?",
    option_a: "ISA",
    option_b: "AGP",
    option_c: "PCIe (PCI Express)",
    option_d: "MCA",
    correct_answer: "C",
    explanation: "PCIe (Peripheral Component Interconnect Express) uses full-duplex serial lanes (x1, x4, x8, x16) and replaced older parallel PCI and AGP slots.\n\n[മലയാളം]: ആധുനിക മദർബോർഡുകളിൽ ഗ്രാഫിക്സ് കാർഡുകൾക്കും NVMe SSD-കൾക്കും ഉപയോഗിക്കുന്ന അതിവേഗ സീരിയൽ ഇന്റർഫേസാണ് PCIe (PCI Express).",
    subtopic: "Expansion Slots & Bus Architecture"
  },

  // ================= MODULE 4: OS, PARTITIONS & BOOTING =================
  {
    id: "EX_M4_01",
    sheetName: "Module_4_OS_Deployment",
    question: "What is the maximum number of primary partitions (or 3 primary + 1 extended) supported by a standard MBR partition table?",
    option_a: "2",
    option_b: "4",
    option_c: "8",
    option_d: "128",
    correct_answer: "B",
    explanation: "Master Boot Record (MBR) supports a maximum of 4 primary partitions (or 3 primary + 1 extended) and drives up to 2 TB. GPT supports 128 primary partitions.\n\n[മലയാളം]: MBR പാർട്ടീഷൻ സ്കീമിൽ പരമാവധി 4 പ്രൈമറി പാർട്ടീഷനുകൾ (അല്ലെങ്കിൽ 3 പ്രൈമറി + 1 എക്സ്റ്റെൻഡഡ്) മാത്രമേ നിർമ്മിക്കാൻ സാധിക്കൂ (2 TB പരിധി). GPT-യിൽ 128 എണ്ണം സാധിക്കും.",
    subtopic: "Partition Schemes: MBR vs GPT"
  },
  {
    id: "EX_M4_02",
    sheetName: "Module_4_OS_Deployment",
    question: "Which popular Linux boot loader is commonly used to manage multi-boot configurations between Linux and Windows?",
    option_a: "BOOT.INI",
    option_b: "GRUB",
    option_c: "NTLDR",
    option_d: "DISKPART",
    correct_answer: "B",
    explanation: "GRUB (Grand Unified Bootloader) is the standard boot loader in most Linux distributions and supports multi-boot menus.\n\n[മലയാളം]: ലിനക്സും വിൻഡോസും ഒരേ കമ്പ്യൂട്ടറിൽ മൾട്ടി-ബൂട്ട് (Multi-boot) ചെയ്യാൻ സാധാരണയായി ഉപയോഗിക്കുന്ന ലിനക്സ് ബൂട്ട് ലോഡറാണ് GRUB.",
    subtopic: "Boot Management & Multi-boot"
  },
  {
    id: "EX_M4_03",
    sheetName: "Module_4_OS_Deployment",
    question: "In Linux, which command is used to change file access permissions (Read, Write, Execute)?",
    option_a: "chown",
    option_b: "chmod",
    option_c: "grep",
    option_d: "lsmod",
    correct_answer: "B",
    explanation: "'chmod' (change mode) modifies read (4), write (2), and execute (1) permissions for owner, group, and others.\n\n[മലയാളം]: ലിനക്സിൽ ഫയലുകളുടെയോ ഫോൾഡറുകളുടെയോ റീഡ്/റൈറ്റ്/എക്സിക്യൂട്ട് പെർമിഷനുകൾ മാറ്റാൻ 'chmod' കമാൻഡ് ഉപയോഗിക്കുന്നു.",
    subtopic: "Linux OS & Basic Commands"
  },
  {
    id: "EX_M4_04",
    sheetName: "Module_4_OS_Deployment",
    question: "Which tool/command is used in Windows Vista/7/10/11 to edit Boot Configuration Data (BCD) store?",
    option_a: "bcdedit",
    option_b: "regedit",
    option_c: "msconfig",
    option_d: "netstat",
    correct_answer: "A",
    explanation: "'bcdedit' is the command-line tool for managing the Boot Configuration Data (BCD) store used by Windows Boot Manager.\n\n[മലയാളം]: ആധുനിക വിൻഡോസ് സിസ്റ്റങ്ങളിൽ ബൂട്ട് കോൺഫിഗറേഷൻ ഡാറ്റ (BCD) എഡിറ്റ് ചെയ്യാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് 'bcdedit'.",
    subtopic: "Windows Boot Manager"
  },

  // ================= MODULE 5: SYSTEM UTILITIES & MAINTENANCE =================
  {
    id: "EX_M5_01",
    sheetName: "Module_5_System_Utilities",
    question: "Which Windows command scans and repairs corrupted or missing protected system files in the System32 directory?",
    option_a: "ipconfig /all",
    option_b: "sfc /scannow",
    option_c: "tracert",
    option_d: "defrag C:",
    correct_answer: "B",
    explanation: "System File Checker (sfc /scannow) verifies the integrity of all protected Windows system files and replaces corrupted files.\n\n[മലയാളം]: വിൻഡോസിലെ തകരാറിലായ സിസ്റ്റം ഫയലുകൾ പരിശോധിച്ച് നന്നാക്കാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് 'sfc /scannow' (System File Checker).",
    subtopic: "System Files & Commands"
  },
  {
    id: "EX_M5_02",
    sheetName: "Module_5_System_Utilities",
    question: "Where is the local 'hosts' file (used to map hostnames to IP addresses locally) located in Windows?",
    option_a: "C:\\Windows\\hosts",
    option_b: "C:\\Windows\\System32\\drivers\\etc\\hosts",
    option_c: "C:\\Program Files\\hosts",
    option_d: "C:\\Users\\Public\\hosts",
    correct_answer: "B",
    explanation: "In Windows, the local DNS override file is stored at C:\\Windows\\System32\\drivers\\etc\\hosts.\n\n[മലയാളം]: വിൻഡോസിൽ ഹോസ്റ്റ് പേരുകളെ ഐ.പി അഡ്രസുകളുമായി ബന്ധിപ്പിക്കുന്ന 'hosts' ഫയൽ C:\\Windows\\System32\\drivers\\etc\\hosts എന്ന പാത്തിലാണ് സ്ഥിതി ചെയ്യുന്നത്.",
    subtopic: "System32 & Hosts File Modification"
  },
  {
    id: "EX_M5_03",
    sheetName: "Module_5_System_Utilities",
    question: "Which command opens the Local Group Policy Editor in Windows?",
    option_a: "regedit",
    option_b: "gpedit.msc",
    option_c: "services.msc",
    option_d: "eventvwr.msc",
    correct_answer: "B",
    explanation: "'gpedit.msc' launches the Local Group Policy Editor; 'services.msc' opens Services, and 'eventvwr.msc' opens Event Viewer.\n\n[മലയാളം]: വിൻഡോസിൽ ലോക്കൽ ഗ്രൂപ്പ് പോളിസി എഡിറ്റർ തുറക്കാനുള്ള കമാൻഡാണ് 'gpedit.msc'.",
    subtopic: "User Account Security & Group Policies"
  },
  {
    id: "EX_M5_04",
    sheetName: "Module_5_System_Utilities",
    question: "Which Windows utility records system, security, and application logs for troubleshooting errors?",
    option_a: "Disk Defragmenter",
    option_b: "Event Viewer",
    option_c: "Device Manager",
    option_d: "Character Map",
    correct_answer: "B",
    explanation: "Event Viewer (eventvwr.msc) logs detailed system, security, and application events useful for diagnosing hardware and software crashes.\n\n[മലയാളം]: വിൻഡോസിലെ സിസ്റ്റം, സെക്യൂരിറ്റി, ആപ്ലിക്കേഷൻ എറർ ലോഗുകൾ പരിശോധിക്കാൻ ഉപയോഗിക്കുന്ന ടൂളാണ് ഇവന്റ് വ്യൂവർ (Event Viewer).",
    subtopic: "Event Viewer & Troubleshooting"
  },
  {
    id: "EX_M5_05",
    sheetName: "Module_5_System_Utilities",
    question: "Why should disk defragmentation NEVER be run regularly on a Solid State Drive (SSD)?",
    option_a: "SSDs store data magnetically",
    option_b: "SSDs have zero seek time and extra writes reduce flash lifespan",
    option_c: "Defragmentation deletes the OS",
    option_d: "SSDs cannot be partitioned",
    correct_answer: "B",
    explanation: "SSDs access all flash blocks uniformly with near-zero latency; traditional defragmentation causes unnecessary write wear without speed benefit (TRIM is used instead).\n\n[മലയാളം]: SSD-കൾക്ക് സീക്ക് ടൈം ഇല്ലാത്തതിനാലും, തുടർച്ചയായ റൈറ്റിംഗ് ഫ്ലാഷ് മെമ്മറിയുടെ ആയുസ്സ് കുറയ്ക്കുമെന്നതിനാലും SSD-കളിൽ ഡിഫ്രാഗ്മെന്റേഷൻ ചെയ്യാറില്ല (പകരം TRIM ഉപയോഗിക്കുന്നു).",
    subtopic: "Disk Maintenance & Defragmentation"
  },

  // ================= MODULE 6: OFFICE APPLICATIONS =================
  {
    id: "EX_M6_01",
    sheetName: "Module_6_Office_Applications",
    question: "In Microsoft Excel, which symbol is used to create an Absolute Cell Reference (e.g., locking row and column)?",
    option_a: "#",
    option_b: "@",
    option_c: "$",
    option_d: "&",
    correct_answer: "C",
    explanation: "The dollar sign ($) locks column and/or row references when copying formulas (e.g., $A$1).\n\n[മലയാളം]: എക്സലിൽ ഒരു സെൽ റെഫറൻസ് ഫിക്സ് ചെയ്യാൻ (Absolute Cell Reference - ഉദാ: $A$1) '$' ചിഹ്നമാണ് ഉപയോഗിക്കുന്നത്.",
    subtopic: "Spreadsheets & Cell Formulas"
  },
  {
    id: "EX_M6_02",
    sheetName: "Module_6_Office_Applications",
    question: "Which MS Word feature allows sending a personalized letter to multiple recipients by combining a main document with a data source?",
    option_a: "Macros",
    option_b: "Mail Merge",
    option_c: "Track Changes",
    option_d: "SmartArt",
    correct_answer: "B",
    explanation: "Mail Merge combines a template document with a recipient data source (such as an Excel list) to generate personalized letters, emails, or labels.\n\n[മലയാളം]: ഒരു പൊതുവായ കത്ത് വിവിധ ആളുകളുടെ പേരും വിലാസവും ചേർത്ത് ഒറ്റയടിക്ക് തയ്യാറാക്കാൻ MS Word-ൽ ഉപയോഗിക്കുന്ന സംവിധാനമാണ് മെയിൽ മെർജ് (Mail Merge).",
    subtopic: "Word Processing: Mail Merge"
  },
  {
    id: "EX_M6_03",
    sheetName: "Module_6_Office_Applications",
    question: "In MS PowerPoint, which shortcut key starts the Slide Show from the current slide?",
    option_a: "F5",
    option_b: "Shift + F5",
    option_c: "Ctrl + F5",
    option_d: "Alt + F4",
    correct_answer: "B",
    explanation: "F5 starts the slideshow from the first slide, while Shift + F5 starts it from the currently selected slide.\n\n[മലയാളം]: PowerPoint-ൽ ആദ്യത്തെ സ്ലൈഡ് മുതൽ തുടങ്ങാൻ F5-ഉം, നിലവിൽ നിൽക്കുന്ന സ്ലൈഡ് മുതൽ പ്രസന്റേഷൻ തുടങ്ങാൻ 'Shift + F5' ഉം ഉപയോഗിക്കുന്നു.",
    subtopic: "Presentations & Shortcuts"
  },
  {
    id: "EX_M6_04",
    sheetName: "Module_6_Office_Applications",
    question: "In MS Excel, which function searches for a value in the leftmost column of a table and returns a value from a specified column?",
    option_a: "COUNTIF",
    option_b: "VLOOKUP",
    option_c: "SUMIF",
    option_d: "CONCAT",
    correct_answer: "B",
    explanation: "VLOOKUP (Vertical Lookup) searches vertically down the first column of a range to retrieve a corresponding value from another column.\n\n[മലയാളം]: ഒരു ടേബിളിന്റെ ആദ്യ കോളത്തിൽ തിരഞ്ഞ് അതിന് നേരെയുള്ള മറ്റ് കോളങ്ങളിലെ വിവരങ്ങൾ കണ്ടെത്താൻ Excel-ൽ ഉപയോഗിക്കുന്ന ഫംഗ്ഷനാണ് VLOOKUP.",
    subtopic: "Excel Functions & Formulas"
  },

  // ================= MODULE 8 & 9: NETWORKING, CABLING, PROTOCOLS =================
  {
    id: "EX_M8_01",
    sheetName: "Module_8_Networking",
    question: "Which CAT6 twisted-pair wiring standard swaps the Green and Orange wire pairs between T568A and T568B?",
    option_a: "Pins 1, 2, 3, 6",
    option_b: "Pins 4, 5, 7, 8",
    option_c: "Pins 1, 4, 5, 8",
    option_d: "All 8 pins",
    correct_answer: "A",
    explanation: "T568A and T568B both keep Blue on pins 4-5 and Brown on pins 7-8, swapping only the Green and Orange pairs on pins 1, 2, 3, and 6.\n\n[മലയാളം]: T568A-യും T568B-യും തമ്മിൽ 1, 2, 3, 6 എന്നീ പിന്നുകളിലെ പച്ച (Green), ഓറഞ്ച് (Orange) ജോഡികൾ മാത്രമാണ് പരസ്പരം മാറുന്നത്.",
    subtopic: "CAT6 Wiring Conventions (T568A/T568B)"
  },
  {
    id: "EX_M8_02",
    sheetName: "Module_8_Networking",
    question: "Which command displays active TCP connections, listening ports, and routing statistics on both Windows and Linux?",
    option_a: "ping",
    option_b: "netstat",
    option_c: "hostname",
    option_d: "arp",
    correct_answer: "B",
    explanation: "'netstat' (Network Statistics) displays open network connections, listening TCP/UDP ports, and interface statistics.\n\n[മലയാളം]: കമ്പ്യൂട്ടറിലെ ആക്ടീവ് ആയ നെറ്റ്‌വർക്ക് കണക്ഷനുകളും ഓപ്പൺ പോർട്ടുകളും പരിശോധിക്കാൻ ഉപയോഗിക്കുന്ന കമാൻഡാണ് 'netstat'.",
    subtopic: "TCP/IP Utilities"
  },
  {
    id: "EX_M9_01",
    sheetName: "Module_9_Protocols_Servers",
    question: "What is the primary purpose of a Virtual LAN (VLAN) on a managed network switch?",
    option_a: "Increase internet bandwidth physically",
    option_b: "Logically segment a network into separate broadcast domains",
    option_c: "Replace DNS servers",
    option_d: "Convert fiber to coaxial",
    correct_answer: "B",
    explanation: "VLANs logically partition a single physical switch into multiple isolated Layer-2 broadcast domains, improving security and reducing broadcast traffic.\n\n[മലയാളം]: ഒരു സ്വിച്ചിനുള്ളിലെ നെറ്റ്‌വർക്കിനെ ലോജിക്കലായി വിവിധ ബ്രോഡ്‌കാസ്റ്റ് ഡൊമെയ്നുകളായി തിരിച്ച് സുരക്ഷയും വേഗതയും വർദ്ധിപ്പിക്കാനാണ് VLAN ഉപയോഗിക്കുന്നത്.",
    subtopic: "Virtual LAN (VLAN) Concepts"
  },
  {
    id: "EX_M9_02",
    sheetName: "Module_9_Protocols_Servers",
    question: "What is the 4-step message sequence (DORA) used by DHCP to assign an IP address dynamically?",
    option_a: "Discover, Offer, Request, Acknowledge",
    option_b: "Detect, Open, Route, Accept",
    option_c: "Define, Obtain, Reply, Assign",
    option_d: "Dial, Offer, Reset, Ack",
    correct_answer: "A",
    explanation: "DHCP clients obtain an IP address using the 4-step DORA process: Discover, Offer, Request, Acknowledge.\n\n[മലയാളം]: DHCP വഴി ഒരു കമ്പ്യൂട്ടറിന് IP അഡ്രസ് ലഭിക്കുന്ന 4 ഘട്ടങ്ങളാണ് DORA (Discover, Offer, Request, Acknowledge).",
    subtopic: "Application Protocols: DHCP"
  },

  // ================= MODULE 10: CYBER SECURITY, CLOUD & IT ACT 2000 =================
  {
    id: "EX_M10_01",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Under the Information Technology (IT) Act 2000 (as amended in 2008), which section deals with punishment for Identity Theft?",
    option_a: "Section 43",
    option_b: "Section 66C",
    option_c: "Section 66F",
    option_d: "Section 72",
    correct_answer: "B",
    explanation: "Section 66C of the IT Act deals with Identity Theft (fraudulently using another's electronic signature, password, or unique identification). Section 66F covers Cyber Terrorism.\n\n[മലയാളം]: ഐ.ടി. ആക്ട് (IT Act 2000) സെക്ഷൻ 66C 'ഐഡന്റിറ്റി തെഫ്റ്റ്' (Identity Theft - മറ്റൊരാളുടെ പാസ്‌വേഡോ ഡിജിറ്റൽ ഐഡിയോ മോഷ്ടിച്ച് ഉപയോഗിക്കുന്നത്) കുറ്റകരമാക്കുന്നു.",
    subtopic: "IT Act 2000 & Cyber Laws"
  },
  {
    id: "EX_M10_02",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Which section of the IT Act 2000 provides punishment for Cyber Terrorism?",
    option_a: "Section 66B",
    option_b: "Section 66D",
    option_c: "Section 66F",
    option_d: "Section 65",
    correct_answer: "C",
    explanation: "Section 66F of the IT Act 2000 prescribes strict punishment (up to life imprisonment) for acts of Cyber Terrorism.\n\n[മലയാളം]: സൈബർ തീവ്രവാദവുമായി (Cyber Terrorism) ബന്ധപ്പെട്ട ശിക്ഷാ വ്യവസ്ഥകൾ പ്രതിപാദിക്കുന്നത് ഐ.ടി. ആക്ട് സെക്ഷൻ 66F-ലാണ്.",
    subtopic: "IT Act 2000 & Cyber Laws"
  },
  {
    id: "EX_M10_03",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Which type of Hypervisor runs directly on the physical host hardware without needing an underlying host operating system?",
    option_a: "Type 1 (Bare-metal) Hypervisor",
    option_b: "Type 2 (Hosted) Hypervisor",
    option_c: "Application Container",
    option_d: "Client Emulator",
    correct_answer: "A",
    explanation: "Type 1 (Bare-metal) hypervisors like VMware ESXi, Microsoft Hyper-V, and KVM run directly on bare hardware; Type 2 (like VirtualBox) runs on a host OS.\n\n[മലയാളം]: ഹോസ്റ്റ് ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിന്റെ സഹായമില്ലാതെ നേരിട്ട് ഹാർഡ്‌വെയറിൽ പ്രവർത്തിക്കുന്ന വെർച്വലൈസേഷൻ സോഫ്റ്റ്‌വെയറാണ് Type 1 (Bare-metal) ഹൈപ്പർവൈസർ (ഉദാ: VMware ESXi).",
    subtopic: "Virtualization & Hypervisors"
  },
  {
    id: "EX_M10_04",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Which attack occurs when an attacker secretly intercepts and alters communication between two parties who believe they are communicating directly?",
    option_a: "Brute Force",
    option_b: "Man-in-the-Middle (MitM)",
    option_c: "Ransomware",
    option_d: "Keylogger",
    correct_answer: "B",
    explanation: "In a Man-in-the-Middle (MitM) attack, the attacker relays and possibly alters communication between two endpoints secretly.\n\n[മലയാളം]: രണ്ട് പേർ തമ്മിലുള്ള ആശയവിനിമയത്തിനിടയിൽ രഹസ്യമായി കടന്നുകയറി വിവരങ്ങൾ ചോർത്തുകയോ മാറ്റുകയോ ചെയ്യുന്ന സൈബർ ആക്രമണമാണ് Man-in-the-Middle (MitM).",
    subtopic: "Network Attacks & Security"
  }
];
