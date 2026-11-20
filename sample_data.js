// Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025)
// All 10 Modules Sample Question Bank

const MODULE_DEFINITIONS = [
  { id: "Module_1_Electronics", name: "Module 1: Basic Electronics", marks: 12, icon: "zap" },
  { id: "Module_2_Comp_Fundamentals", name: "Module 2: Computer Fundamentals", marks: 8, icon: "cpu" },
  { id: "Module_3_Adv_Hardware_Storage", name: "Module 3: Advanced Hardware & Storage", marks: 10, icon: "hard-drive" },
  { id: "Module_4_OS_Deployment", name: "Module 4: Operating Systems & Deployment", marks: 10, icon: "terminal" },
  { id: "Module_5_System_Utilities", name: "Module 5: System Utilities & Maintenance", marks: 10, icon: "tool" },
  { id: "Module_6_Office_Applications", name: "Module 6: Office Applications", marks: 10, icon: "file-text" },
  { id: "Module_7_IO_Devices", name: "Module 7: I/O Devices & Maintenance", marks: 10, icon: "printer" },
  { id: "Module_8_Networking", name: "Module 8: Networking Fundamentals", marks: 10, icon: "wifi" },
  { id: "Module_9_Protocols_Servers", name: "Module 9: Application Protocols & Servers", marks: 10, icon: "server" },
  { id: "Module_10_Security_Cloud_Law", name: "Module 10: Security, Cloud & IT Law", marks: 10, icon: "shield" }
];

const SAMPLE_QUESTIONS = [
  // Module 1: Basic Electronics
  {
    id: "M1_01",
    sheetName: "Module_1_Electronics",
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
    id: "M1_02",
    sheetName: "Module_1_Electronics",
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
    id: "M1_03",
    sheetName: "Module_1_Electronics",
    question: "Which power semiconductor device is bidirectional and triggered by either positive or negative gate pulses?",
    option_a: "SCR",
    option_b: "DIAC",
    option_c: "TRIAC",
    option_d: "UJT",
    correct_answer: "C",
    explanation: "TRIAC (Triode for Alternating Current) is a bidirectional thyristor that can conduct current in either direction and be triggered by either polarity.",
    subtopic: "Power Devices"
  },
  {
    id: "M1_04",
    sheetName: "Module_1_Electronics",
    question: "In an IC voltage regulator like 7805, what is the output voltage provided?",
    option_a: "+12 V",
    option_b: "-5 V",
    option_c: "+5 V",
    option_d: "+9 V",
    correct_answer: "C",
    explanation: "78xx series ICs are positive voltage regulators; the last two digits specify the output voltage. '7805' outputs +5V. (79xx is for negative voltages).",
    subtopic: "Voltage Regulation"
  },

  // Module 2: Computer Fundamentals
  {
    id: "M2_01",
    sheetName: "Module_2_Comp_Fundamentals",
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
    id: "M2_02",
    sheetName: "Module_2_Comp_Fundamentals",
    question: "Which CPU cache level is typically the fastest and located closest to the processor core?",
    option_a: "L1 Cache",
    option_b: "L2 Cache",
    option_c: "L3 Cache",
    option_d: "Virtual Memory",
    correct_answer: "A",
    explanation: "L1 (Level 1) cache is the fastest, smallest cache integrated directly into the CPU core.",
    subtopic: "Cache Memory"
  },

  // Module 3: Advanced Hardware & Storage
  {
    id: "M3_01",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "Which RAID level provides block-level striping without parity or fault tolerance?",
    option_a: "RAID 0",
    option_b: "RAID 1",
    option_c: "RAID 5",
    option_d: "RAID 10",
    correct_answer: "A",
    explanation: "RAID 0 divides data evenly across two or more disks (striping) without parity or redundancy; if one drive fails, all data is lost.",
    subtopic: "RAID"
  },
  {
    id: "M3_02",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "Which interface protocol connects SSDs directly to the PCIe bus for maximum read/write speeds?",
    option_a: "SATA III",
    option_b: "PATA",
    option_c: "NVMe",
    option_d: "SCSI",
    correct_answer: "C",
    explanation: "NVMe (Non-Volatile Memory Express) is designed specifically for flash memory communicating over high-speed PCIe lanes.",
    subtopic: "Storage Interfaces"
  },

  // Module 4: Operating Systems & Deployment
  {
    id: "M4_01",
    sheetName: "Module_4_OS_Deployment",
    question: "What is the maximum disk partition size supported by the traditional Master Boot Record (MBR) scheme?",
    option_a: "1 TB",
    option_b: "2 TB",
    option_c: "4 TB",
    option_d: "8 TB",
    correct_answer: "B",
    explanation: "MBR partitioning uses 32-bit sector addressing, limiting partition capacity to 2.19 TB (approx. 2 TB). GPT is used for larger disks.",
    subtopic: "Partition Schemes"
  },
  {
    id: "M4_02",
    sheetName: "Module_4_OS_Deployment",
    question: "Which Linux command displays the current working directory path?",
    option_a: "dir",
    option_b: "ls",
    option_c: "pwd",
    option_d: "cd",
    correct_answer: "C",
    explanation: "'pwd' stands for 'Print Working Directory', which outputs the absolute path of the current directory.",
    subtopic: "Linux Commands"
  },

  // Module 5: System Utilities & Maintenance
  {
    id: "M5_01",
    sheetName: "Module_5_System_Utilities",
    question: "Which Windows directory stores critical system DLLs, kernel files, and system executables for 64-bit systems?",
    option_a: "C:\\Program Files",
    option_b: "C:\\Windows\\System32",
    option_c: "C:\\Windows\\Temp",
    option_d: "C:\\Users",
    correct_answer: "B",
    explanation: "C:\\Windows\\System32 contains essential core operating system files, DLLs, and commands.",
    subtopic: "System Files"
  },
  {
    id: "M5_02",
    sheetName: "Module_5_System_Utilities",
    question: "Which file in Windows/Linux maps hostnames to IP addresses locally before querying DNS servers?",
    option_a: "resolv.conf",
    option_b: "hosts",
    option_c: "services",
    option_d: "lmhosts",
    correct_answer: "B",
    explanation: "The 'hosts' file (located in C:\\Windows\\System32\\drivers\\etc\\hosts) provides local static name resolution overriding DNS.",
    subtopic: "Malware & System Maintenance"
  },

  // Module 6: Office Applications
  {
    id: "M6_01",
    sheetName: "Module_6_Office_Applications",
    question: "Which feature in word processing is used to generate personalized letters to multiple recipients simultaneously?",
    option_a: "Track Changes",
    option_b: "Mail Merge",
    option_c: "AutoCorrect",
    option_d: "Macro",
    correct_answer: "B",
    explanation: "Mail Merge allows creating multiple documents (letters, envelopes, certificates) combining a standard template with a data source.",
    subtopic: "Word Processing"
  },

  // Module 7: I/O Devices & Maintenance
  {
    id: "M7_01",
    sheetName: "Module_7_IO_Devices",
    question: "Which printer type utilizes a photosensitive drum, laser beam, and toner powder to produce printouts?",
    option_a: "Dot Matrix Printer",
    option_b: "Inkjet Printer",
    option_c: "Thermal Printer",
    option_d: "Laser Printer",
    correct_answer: "D",
    explanation: "Laser printers use an electrostatic digital printing process with a rotating photosensitive drum and powdered toner.",
    subtopic: "Printers"
  },

  // Module 8: Networking Fundamentals
  {
    id: "M8_01",
    sheetName: "Module_8_Networking",
    question: "Which OSI model layer is responsible for logical IP addressing and path determination (routing)?",
    option_a: "Data Link Layer (Layer 2)",
    option_b: "Network Layer (Layer 3)",
    option_c: "Transport Layer (Layer 4)",
    option_d: "Session Layer (Layer 5)",
    correct_answer: "B",
    explanation: "The Network Layer (Layer 3) handles IP addressing, packet forwarding, and routing protocols.",
    subtopic: "OSI Reference Model"
  },
  {
    id: "M8_02",
    sheetName: "Module_8_Networking",
    question: "What connector type is standard for terminating Cat6 Twisted Pair Ethernet cables?",
    option_a: "RJ-11",
    option_b: "BNC",
    option_c: "RJ-45",
    option_d: "ST Connector",
    correct_answer: "C",
    explanation: "RJ-45 (Registered Jack 45) is an 8P8C modular connector standard for Ethernet network cables.",
    subtopic: "Transmission Media"
  },

  // Module 9: Application Protocols & Server Administration
  {
    id: "M9_01",
    sheetName: "Module_9_Protocols_Servers",
    question: "Which protocol automatically assigns IP addresses, subnet masks, and default gateways to network clients?",
    option_a: "DNS",
    option_b: "DHCP",
    option_c: "SNMP",
    option_d: "SMTP",
    correct_answer: "B",
    explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP configuration parameters to network devices.",
    subtopic: "Application Protocols"
  },

  // Module 10: Network Security, Cloud Computing & IT Law
  {
    id: "M10_01",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Which cyber attack floods a server or network with excessive traffic to make services unavailable to legitimate users?",
    option_a: "Phishing",
    option_b: "SQL Injection",
    option_c: "Denial of Service (DoS / DDoS)",
    option_d: "Man-in-the-Middle",
    correct_answer: "C",
    explanation: "DoS (Denial of Service) attacks overload server resources or bandwidth so that intended users cannot access the service.",
    subtopic: "Security Concepts"
  },
  {
    id: "M10_02",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "In India, which legislation governs electronic commerce, digital signatures, and cybercrimes?",
    option_a: "Indian Penal Code (IPC) 1860",
    option_b: "Information Technology Act 2000 (IT Act)",
    option_c: "Digital Data Act 1998",
    option_d: "Copyright Act 1957",
    correct_answer: "B",
    explanation: "The Information Technology Act, 2000 (IT Act) is the primary law in India dealing with cybercrime and electronic commerce.",
    subtopic: "IT Act & Cyber Laws"
  },

  // --- AUTOMATED BATCH RUN: 10 MODULE MCQS ---
  {
    id: "M1_05",
    sheetName: "Module_1_Electronics",
    question: "Which parameter of an SCR defines the minimum anode current required to maintain it in conduction state after the gate trigger pulse is removed?",
    option_a: "Latching current",
    option_b: "Holding current",
    option_c: "Breakover current",
    option_d: "Peak inverse current",
    correct_answer: "B",
    explanation: "Holding current is the minimum anode current below which the SCR turns OFF. Latching current is the minimum anode current required to turn ON and maintain conduction when the gate signal is removed (Latching current is typically 2 to 3 times greater than holding current).",
    subtopic: "SCR & Power Semiconductor"
  },
  {
    id: "M2_03",
    sheetName: "Module_2_Comp_Fundamentals",
    question: "In modern motherboard chipset architectures, which bus or interface connects the CPU directly to high-speed graphics expansion slots (PCIe x16)?",
    option_a: "LPC Bus",
    option_b: "PCIe Lanes directly from CPU / Northbridge",
    option_c: "Southbridge (ICH) via PCI bus",
    option_d: "Serial ATA Interface",
    correct_answer: "B",
    explanation: "Modern CPUs incorporate PCIe controller lanes directly on the processor die, connecting directly to the primary PCIe x16 graphics slot for minimum latency without passing through the chipset.",
    subtopic: "Chipset & Bus Architecture"
  },
  {
    id: "M3_03",
    sheetName: "Module_3_Adv_Hardware_Storage",
    question: "What S.M.A.R.T attribute in a hard disk drive (HDD) monitors sectors that have encountered read errors and have been remapped to spare sectors?",
    option_a: "Spin-Up Time",
    option_b: "Power-On Hours",
    option_c: "Reallocated Sectors Count",
    option_d: "Seek Error Rate",
    correct_answer: "C",
    explanation: "Reallocated Sectors Count represents the number of bad sectors that have been remapped to the reserved spare space. A rising count indicates impending hard drive failure.",
    subtopic: "Hard Disk Drive & S.M.A.R.T"
  },
  {
    id: "M4_03",
    sheetName: "Module_4_OS_Deployment",
    question: "In Linux operating systems, which signal sent by the 'kill' command forces unconditional termination of an unresponsive process?",
    option_a: "SIGINT (Signal 2)",
    option_b: "SIGTERM (Signal 15)",
    option_c: "SIGKILL (Signal 9)",
    option_d: "SIGHUP (Signal 1)",
    correct_answer: "C",
    explanation: "SIGKILL (kill -9) cannot be caught, blocked, or ignored by the process, forcing the Linux kernel to terminate the process immediately.",
    subtopic: "Linux Process Architecture"
  },
  {
    id: "M5_03",
    sheetName: "Module_5_System_Utilities",
    question: "Which Windows command-line utility scans the integrity of all protected system files and replaces corrupted files with a cached copy?",
    option_a: "chkdsk /f",
    option_b: "sfc /scannow",
    option_c: "dism /cleanup-image",
    option_d: "bootrec /fixmbr",
    correct_answer: "B",
    explanation: "System File Checker (SFC) with the /scannow switch checks the integrity of all system files in Windows and repairs corrupted files from C:\\Windows\\System32\\dllcache.",
    subtopic: "System Maintenance & Utilities"
  },
  {
    id: "M6_02",
    sheetName: "Module_6_Office_Applications",
    question: "In spreadsheet formulas (e.g. MS Excel), what symbol is used to create an absolute cell reference that does not change when copied to another cell?",
    option_a: "&",
    option_b: "%",
    option_c: "$",
    option_d: "#",
    correct_answer: "C",
    explanation: "The dollar sign ($) locks the column letter or row number (e.g. $A$1 is absolute, A$1 locks row, $A1 locks column).",
    subtopic: "Spreadsheet Formulas"
  },
  {
    id: "M7_02",
    sheetName: "Module_7_IO_Devices",
    question: "During computer system startup, what does a continuous repeating short beep code usually indicate in standard AMI BIOS?",
    option_a: "Normal POST completion",
    option_b: "Power supply or Motherboard/RAM fault",
    option_c: "Keyboard unplugged",
    option_d: "Hard drive unformatted",
    correct_answer: "B",
    explanation: "Continuous short beeps during POST indicate a problem with the Power Supply unit (PSU) or motherboard memory subsystem.",
    subtopic: "Diagnostics & POST Codes"
  },
  {
    id: "M8_03",
    sheetName: "Module_8_Networking",
    question: "In IPv4 networking, what is the default subnet mask for a Class C network?",
    option_a: "255.0.0.0",
    option_b: "255.255.0.0",
    option_c: "255.255.255.0",
    option_d: "255.255.255.240",
    correct_answer: "C",
    explanation: "Class A default mask is 255.0.0.0 (/8), Class B is 255.255.0.0 (/16), and Class C is 255.255.255.0 (/24).",
    subtopic: "IP Addressing & Subnetting"
  },
  {
    id: "M9_02",
    sheetName: "Module_9_Protocols_Servers",
    question: "Which secure protocol utilizes TCP Port 22 to provide encrypted remote terminal access and administrative command execution?",
    option_a: "Telnet",
    option_b: "FTP",
    option_c: "SSH (Secure Shell)",
    option_d: "SNMP",
    correct_answer: "C",
    explanation: "SSH operates over TCP port 22 and replaces unencrypted Telnet (port 23) by encrypting all credentials and session communications.",
    subtopic: "Application Protocols & Administration"
  },
  {
    id: "M10_03",
    sheetName: "Module_10_Security_Cloud_Law",
    question: "Which cryptographic algorithm is an asymmetric (public-key) cipher widely used for secure key exchange and digital signatures?",
    option_a: "AES (Advanced Encryption Standard)",
    option_b: "DES (Data Encryption Standard)",
    option_c: "RSA (Rivest–Shamir–Adleman)",
    option_d: "Blowfish",
    correct_answer: "C",
    explanation: "RSA is an asymmetric cryptographic algorithm using a public and private key pair. AES, DES, and Blowfish are symmetric ciphers.",
    subtopic: "Cryptography & Authentication"
  }
];

