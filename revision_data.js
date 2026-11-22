// Quick Revision & Flashcards Data for Kerala PSC Tradesman CHM
const REVISION_DATA = {
  ports: [
    { port: 20, proto: "TCP", name: "FTP Data", desc: "File Transfer Protocol (Data Transfer)", note_ml: "ഫയൽ ഡാറ്റ കൈമാറ്റം ചെയ്യാൻ ഉപയോഗിക്കുന്നു." },
    { port: 21, proto: "TCP", name: "FTP Control", desc: "File Transfer Protocol (Command/Control)", note_ml: "കമാൻഡുകളും ലോഗിനും നിയന്ത്രിക്കുന്നു." },
    { port: 22, proto: "TCP", name: "SSH / SFTP", desc: "Secure Shell (Encrypted Remote Login)", note_ml: "സുരക്ഷിതമായ റിമോട്ട് ലോഗിൻ (Telnet-ന് പകരമായി)." },
    { port: 23, proto: "TCP", name: "Telnet", desc: "Unencrypted Plain Text Remote Login", note_ml: "പ്ലെയിൻ ടെക്സ്റ്റ് റിമോട്ട് ലോഗിൻ (സുരക്ഷിതമല്ല)." },
    { port: 25, proto: "TCP", name: "SMTP", desc: "Simple Mail Transfer Protocol (Send Mail)", note_ml: "മെയിലുകൾ അയക്കാൻ (Outgoing Mail Server)." },
    { port: 53, proto: "UDP/TCP", name: "DNS", desc: "Domain Name System (IP to Domain mapping)", note_ml: "ഡൊമെയ്ൻ നാമത്തെ IP അഡ്രസ്സാക്കി മാറ്റുന്നു (കൂടുതലും UDP)." },
    { port: 67, proto: "UDP", name: "DHCP Server", desc: "Dynamic Host Configuration Server", note_ml: "കമ്പ്യൂട്ടറുകൾക്ക് IP നൽകുന്ന DHCP സെർവർ പോർട്ട്." },
    { port: 68, proto: "UDP", name: "DHCP Client", desc: "Dynamic Host Configuration Client", note_ml: "IP സ്വീകരിക്കുന്ന ക്ലയന്റ് പോർട്ട്." },
    { port: 69, proto: "UDP", name: "TFTP", desc: "Trivial File Transfer Protocol", note_ml: "റൂട്ടറുകളിലും ബൂട്ടിലും ഉപയോഗിക്കുന്ന ലളിതമായ UDP ഫയൽ ട്രാൻസ്ഫർ." },
    { port: 80, proto: "TCP", name: "HTTP", desc: "HyperText Transfer Protocol (Web)", note_ml: "സാധാരണ വെബ്‌സൈറ്റുകൾക്കായി (Unencrypted)." },
    { port: 110, proto: "TCP", name: "POP3", desc: "Post Office Protocol v3 (Retrieve Mail)", note_ml: "സെർവറിൽ നിന്ന് മെയിൽ ഡൗൺലോഡ് ചെയ്ത് വായിക്കാൻ." },
    { port: 123, proto: "UDP", name: "NTP", desc: "Network Time Protocol (Clock Sync)", note_ml: "സിസ്റ്റം ക്ലോക്കുകൾ സിൻക്രൊണൈസ് ചെയ്യാൻ." },
    { port: 143, proto: "TCP", name: "IMAP", desc: "Internet Message Access Protocol", note_ml: "മെയിൽ സെർവറിൽ തന്നെ നിലനിർത്തിക്കൊണ്ട് പല ഡിവൈസുകളിൽ സിങ്ക് ചെയ്യാൻ." },
    { port: 161, proto: "UDP", name: "SNMP", desc: "Simple Network Management Protocol", note_ml: "നെറ്റ്‌വർക്ക് ഉപകരണങ്ങൾ മോണിറ്റർ ചെയ്യാൻ." },
    { port: 443, proto: "TCP", name: "HTTPS", desc: "HTTP Secure (SSL/TLS Encryption)", note_ml: "സുരക്ഷിതമായി എൻക്രിപ്റ്റ് ചെയ്ത വെബ് ബ്രൗസിംഗ്." },
    { port: 445, proto: "TCP", name: "SMB", desc: "Server Message Block (Windows File Sharing)", note_ml: "വിൻഡോസ് ഫയൽ & പ്രിന്റർ ഷെയറിംഗ്." },
    { port: 993, proto: "TCP", name: "IMAPS", desc: "IMAP over SSL/TLS", note_ml: "സുരക്ഷിതമായ IMAP മെയിൽ." },
    { port: 995, proto: "TCP", name: "POP3S", desc: "POP3 over SSL/TLS", note_ml: "സുരക്ഷിതമായ POP3 മെയിൽ." },
    { port: 3389, proto: "TCP/UDP", name: "RDP", desc: "Remote Desktop Protocol (Windows)", note_ml: "വിൻഡോസ് റിമോട്ട് ഡെസ്ക്ടോപ്പ് കണക്ഷൻ." }
  ],

  resistors: [
    { color: "Black (കറുപ്പ്)", digit: 0, mult: "1 Ω (10⁰)", tol: "-", hex: "#0f172a", text: "#ffffff" },
    { color: "Brown (തവിട്ട്)", digit: 1, mult: "10 Ω (10¹)", tol: "±1%", hex: "#78350f", text: "#ffffff" },
    { color: "Red (ചുവപ്പ്)", digit: 2, mult: "100 Ω (10²)", tol: "±2%", hex: "#dc2626", text: "#ffffff" },
    { color: "Orange (ഓറഞ്ച്)", digit: 3, mult: "1 kΩ (10³)", tol: "-", hex: "#ea580c", text: "#ffffff" },
    { color: "Yellow (മഞ്ഞ)", digit: 4, mult: "10 kΩ (10⁴)", tol: "-", hex: "#eab308", text: "#0f172a" },
    { color: "Green (പച്ച)", digit: 5, mult: "100 kΩ (10⁵)", tol: "±0.5%", hex: "#16a34a", text: "#ffffff" },
    { color: "Blue (നീല)", digit: 6, mult: "1 MΩ (10⁶)", tol: "±0.25%", hex: "#2563eb", text: "#ffffff" },
    { color: "Violet (വയലറ്റ്)", digit: 7, mult: "10 MΩ (10⁷)", tol: "±0.1%", hex: "#7c3aed", text: "#ffffff" },
    { color: "Grey (ചാരനിറം)", digit: 8, mult: "100 MΩ (10⁸)", tol: "±0.05%", hex: "#64748b", text: "#ffffff" },
    { color: "White (വെള്ള)", digit: 9, mult: "1 GΩ (10⁹)", tol: "-", hex: "#f8fafc", text: "#0f172a" },
    { color: "Gold (സ്വർണ്ണം)", digit: "-", mult: "0.1 Ω (10⁻¹)", tol: "±5%", hex: "#f59e0b", text: "#0f172a" },
    { color: "Silver (വെള്ളി)", digit: "-", mult: "0.01 Ω (10⁻²)", tol: "±10%", hex: "#94a3b8", text: "#0f172a" },
    { color: "None (നിറമില്ല)", digit: "-", mult: "-", tol: "±20%", hex: "#cbd5e1", text: "#0f172a" }
  ],

  cablePinout: {
    t568a: [
      { pin: 1, color: "White/Green", hex: "#86efac" },
      { pin: 2, color: "Green", hex: "#16a34a" },
      { pin: 3, color: "White/Orange", hex: "#fdba74" },
      { pin: 4, color: "Blue", hex: "#2563eb" },
      { pin: 5, color: "White/Blue", hex: "#93c5fd" },
      { pin: 6, color: "Orange", hex: "#ea580c" },
      { pin: 7, color: "White/Brown", hex: "#d6d3d1" },
      { pin: 8, color: "Brown", hex: "#78350f" }
    ],
    t568b: [
      { pin: 1, color: "White/Orange", hex: "#fdba74" },
      { pin: 2, color: "Orange", hex: "#ea580c" },
      { pin: 3, color: "White/Green", hex: "#86efac" },
      { pin: 4, color: "Blue", hex: "#2563eb" },
      { pin: 5, color: "White/Blue", hex: "#93c5fd" },
      { pin: 6, color: "Green", hex: "#16a34a" },
      { pin: 7, color: "White/Brown", hex: "#d6d3d1" },
      { pin: 8, color: "Brown", hex: "#78350f" }
    ],
    rules: [
      "Straight-Through Cable: Both ends T-568B (or both T-568A). Connects different devices (PC to Switch, Switch to Router).",
      "Crossover Cable: One end T-568A and the other end T-568B. Connects identical devices (PC to PC, Switch to Switch, Router to PC directly)."
    ]
  },

  acronyms: [
    { abbr: "BIOS", full: "Basic Input/Output System", desc: "Firmware that performs hardware initialization during booting (stored in ROM/Flash chip)." },
    { abbr: "CMOS", full: "Complementary Metal-Oxide Semiconductor", desc: "Battery-backed chip storing BIOS settings, date and time (uses CR2032 3V battery)." },
    { abbr: "POST", full: "Power-On Self-Test", desc: "Initial hardware diagnostic test run by BIOS right after power is switched on." },
    { abbr: "SMPS", full: "Switched-Mode Power Supply", desc: "Converts AC 230V mains to regulated DC voltages (+3.3V, +5V, +12V, -12V) for motherboard." },
    { abbr: "SATA", full: "Serial Advanced Technology Attachment", desc: "High-speed storage bus interface (SATA III max speed 6 Gbps / 600 MBps)." },
    { abbr: "NVMe", full: "Non-Volatile Memory Express", desc: "Ultra-fast SSD protocol communicating directly over PCIe bus lanes." },
    { abbr: "RAID", full: "Redundant Array of Independent Disks", desc: "Storage virtualization combining multiple disks (RAID 0=Striping, RAID 1=Mirroring, RAID 5=Parity)." },
    { abbr: "MBR vs GPT", full: "Master Boot Record vs GUID Partition Table", desc: "MBR supports max 2TB disk and 4 primary partitions; GPT supports >2TB and 128 partitions with UEFI." },
    { abbr: "UEFI", full: "Unified Extensible Firmware Interface", desc: "Modern BIOS replacement with Secure Boot, GUI, and support for drives > 2TB." },
    { abbr: "VRM", full: "Voltage Regulator Module", desc: "Regulates clean, low-voltage power (around 1.2V - 1.4V) from +12V rail to CPU core." },
    { abbr: "ZIF", full: "Zero Insertion Force", desc: "CPU socket type with lever to install CPU without applying bending pressure (PGA sockets)." },
    { abbr: "LGA vs PGA", full: "Land Grid Array vs Pin Grid Array", desc: "LGA has pins on motherboard socket (Intel/modern AMD); PGA has pins on CPU chip." },
    { abbr: "ESD", full: "Electrostatic Discharge", desc: "Sudden flow of static electricity damaging ICs; prevented using antistatic wrist straps and mats." },
    { abbr: "DHCP", full: "Dynamic Host Configuration Protocol", desc: "Automatically leases IP address, subnet mask, gateway, and DNS to network clients (DORA process)." },
    { abbr: "DNS", full: "Domain Name System", desc: "Resolves human-readable domain names (e.g. google.com) into numerical IP addresses." },
    { abbr: "NAT", full: "Network Address Translation", desc: "Maps multiple private IP addresses to a single public IP address on the internet router." },
    { abbr: "ARP", full: "Address Resolution Protocol", desc: "Resolves a known IP address to a physical MAC address on local Ethernet network." },
    { abbr: "VLAN", full: "Virtual Local Area Network", desc: "Logically segments physical switch ports into isolated broadcast domains (IEEE 802.1Q)." }
  ]
};

