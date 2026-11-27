// Hardware Cheat Sheet Data & Interactive Mini-Tools Logic
// Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025)

const CHEATSHEET_PORTS = [
  { port: "20 / 21", protocol: "FTP", layer: "Application", desc: "File Transfer Protocol (20: Data, 21: Control)" },
  { port: "22", protocol: "SSH / SFTP", layer: "Application", desc: "Secure Shell (Encrypted remote login)" },
  { port: "23", protocol: "Telnet", layer: "Application", desc: "Unencrypted remote terminal login" },
  { port: "25", protocol: "SMTP", layer: "Application", desc: "Simple Mail Transfer Protocol (Sending email)" },
  { port: "53", protocol: "DNS", layer: "Application", desc: "Domain Name System (Name to IP resolution)" },
  { port: "67 / 68", protocol: "DHCP", layer: "Application", desc: "Dynamic Host Configuration Protocol (Auto IP)" },
  { port: "80", protocol: "HTTP", layer: "Application", desc: "HyperText Transfer Protocol (Web)" },
  { port: "110", protocol: "POP3", layer: "Application", desc: "Post Office Protocol v3 (Receiving email)" },
  { port: "143", protocol: "IMAP", layer: "Application", desc: "Internet Message Access Protocol (Email sync)" },
  { port: "161 / 162", protocol: "SNMP", layer: "Application", desc: "Simple Network Management Protocol" },
  { port: "443", protocol: "HTTPS", layer: "Application", desc: "HTTP Secure (SSL/TLS encrypted web)" },
  { port: "3389", protocol: "RDP", layer: "Application", desc: "Remote Desktop Protocol (Windows)" }
];

const CHEATSHEET_SMPS_WIRES = [
  { color: "Yellow", hex: "#eab308", voltage: "+12V DC", use: "HDD/Optical motors, CPU VRM, Cooling Fans, PCIe" },
  { color: "Red", hex: "#ef4444", voltage: "+5V DC", use: "Logic circuits, USB ports, SATA/IDE drive electronics" },
  { color: "Orange", hex: "#f97316", voltage: "+3.3V DC", use: "Motherboard chipset, M.2 NVMe, RAM, PCIe" },
  { color: "Blue", hex: "#3b82f6", voltage: "-12V DC", use: "Legacy RS-232 serial ports, older PCI slots" },
  { color: "Purple", hex: "#a855f7", voltage: "+5V SB", use: "Standby power (Wake-on-LAN, USB charging when off)" },
  { color: "Green", hex: "#22c55e", voltage: "PS_ON#", use: "Power Supply On signal (Active LOW when shorted to Black)" },
  { color: "Grey", hex: "#94a3b8", voltage: "PWR_OK", use: "Power Good signal (+5V after voltages stabilize)" },
  { color: "Black", hex: "#1e293b", voltage: "GND (0V)", use: "Common Ground return path" }
];

const CHEATSHEET_HARDWARE_SPECS = [
  { item: "SDRAM (PC100/133)", spec: "168-pin DIMM", note: "2 notches, 3.3V, 64-bit" },
  { item: "DDR1 SDRAM", spec: "184-pin DIMM", note: "1 notch, 2.5V" },
  { item: "DDR2 / DDR3 SDRAM", spec: "240-pin DIMM", note: "Different notch positions; 1.8V (DDR2) / 1.5V (DDR3)" },
  { item: "DDR4 SDRAM", spec: "288-pin DIMM", note: "1.2V, higher density & speed" },
  { item: "Standard ATX Board", spec: "12 × 9.6 in (305 × 244 mm)", note: "20-pin (ATX 1.x) / 24-pin (ATX 2.x) power" },
  { item: "Micro-ATX Board", spec: "9.6 × 9.6 in (244 × 244 mm)", note: "Fits ATX & mATX cases" },
  { item: "VGA Connector (DE-15)", spec: "15 pins in 3 rows", note: "Analog RGB video signal" },
  { item: "Parallel Port (LPT)", spec: "DB-25 Female", note: "Legacy printers, 8-bit parallel data" },
  { item: "Serial Port (COM)", spec: "DB-9 Male (DE-9)", note: "RS-232 standard, 1 bit at a time" },
  { item: "HDD Sector Size", spec: "512 Bytes (Legacy) / 4 KB", note: "MBR located at Track 0, Sector 0 (LBA 0)" },
  { item: "POST Error Codes", spec: "1xx: Motherboard | 2xx: RAM", note: "3xx: Keyboard | 6xx: Floppy | 17xx: HDD" }
];

const CHEATSHEET_OSI_LAYERS = [
  { num: 7, name: "Application", pdu: "Data", devices: "Gateway, Firewall", protocols: "HTTP, FTP, SMTP, DNS, DHCP" },
  { num: 6, name: "Presentation", pdu: "Data", devices: "Gateway", protocols: "SSL/TLS, JPEG, ASCII, Encryption" },
  { num: 5, name: "Session", pdu: "Data", devices: "Gateway", protocols: "NetBIOS, RPC, PPTP" },
  { num: 4, name: "Transport", pdu: "Segment / Datagram", devices: "Gateway, Firewall", protocols: "TCP, UDP" },
  { num: 3, name: "Network", pdu: "Packet", devices: "Router, Layer-3 Switch", protocols: "IP (IPv4/IPv6), ICMP, ARP" },
  { num: 2, name: "Data Link", pdu: "Frame", devices: "Switch, Bridge, NIC", protocols: "Ethernet (MAC), PPP, IEEE 802.3" },
  { num: 1, name: "Physical", pdu: "Bit", devices: "Hub, Repeater, Cables", protocols: "RJ-45, Cat6, Fiber, Coaxial" }
];

const RESISTOR_COLORS = [
  { name: "Black", val: 0, mult: 1, multLabel: "×1 Ω", tol: null, bg: "#0f172a", text: "#ffffff" },
  { name: "Brown", val: 1, mult: 10, multLabel: "×10 Ω", tol: "±1%", bg: "#78350f", text: "#ffffff" },
  { name: "Red", val: 2, mult: 100, multLabel: "×100 Ω", tol: "±2%", bg: "#dc2626", text: "#ffffff" },
  { name: "Orange", val: 3, mult: 1000, multLabel: "×1 kΩ", tol: null, bg: "#f97316", text: "#ffffff" },
  { name: "Yellow", val: 4, mult: 10000, multLabel: "×10 kΩ", tol: null, bg: "#eab308", text: "#0f172a" },
  { name: "Green", val: 5, mult: 100000, multLabel: "×100 kΩ", tol: "±0.5%", bg: "#16a34a", text: "#ffffff" },
  { name: "Blue", val: 6, mult: 1000000, multLabel: "×1 MΩ", tol: "±0.25%", bg: "#2563eb", text: "#ffffff" },
  { name: "Violet", val: 7, mult: 10000000, multLabel: "×10 MΩ", tol: "±0.1%", bg: "#7c3aed", text: "#ffffff" },
  { name: "Grey", val: 8, mult: null, multLabel: "-", tol: "±0.05%", bg: "#64748b", text: "#ffffff" },
  { name: "White", val: 9, mult: null, multLabel: "-", tol: null, bg: "#f8fafc", text: "#0f172a" },
  { name: "Gold", val: null, mult: 0.1, multLabel: "×0.1 Ω", tol: "±5%", bg: "#f59e0b", text: "#0f172a" },
  { name: "Silver", val: null, mult: 0.01, multLabel: "×0.01 Ω", tol: "±10%", bg: "#cbd5e1", text: "#0f172a" }
];


const CHEATSHEET_RAID_LEVELS = [
  { level: "RAID 0", name: "Striping", minDisks: "2", faultTol: "None (0 disk)", capacity: "100% (N)", use: "Maximum speed, gaming/scratch disk (No redundancy)" },
  { level: "RAID 1", name: "Mirroring", minDisks: "2", faultTol: "1 disk failure", capacity: "50% (N/2)", use: "OS boot drives, high reliability" },
  { level: "RAID 5", name: "Striping + Distributed Parity", minDisks: "3", faultTol: "1 disk failure", capacity: "(N - 1) / N", use: "Balanced performance, capacity & redundancy" },
  { level: "RAID 6", name: "Striping + Double Parity", minDisks: "4", faultTol: "2 disk failures", capacity: "(N - 2) / N", use: "Critical enterprise storage servers" },
  { level: "RAID 10", name: "Mirrored Stripes (1+0)", minDisks: "4", faultTol: "1 per mirror pair", capacity: "50% (N/2)", use: "High-speed databases with strong fault tolerance" }
];

const CHEATSHEET_CLI_COMMANDS = [
  { cmd: "sfc /scannow", os: "Windows", desc: "Scans and repairs corrupted System32 & protected OS files" },
  { cmd: "chkdsk /f /r", os: "Windows", desc: "Checks disk file system errors and locates bad sectors" },
  { cmd: "diskpart", os: "Windows", desc: "Command-line disk partitioning utility (MBR/GPT, clean, create)" },
  { cmd: "bcdedit", os: "Windows", desc: "Manages Boot Configuration Data (BCD) & multi-boot entries" },
  { cmd: "gpedit.msc / services.msc", os: "Windows", desc: "Opens Local Group Policy Editor / Windows Services console" },
  { cmd: "eventvwr.msc", os: "Windows", desc: "Opens Event Viewer to inspect system & application crash logs" },
  { cmd: "ping / tracert / netstat", os: "Win/Linux", desc: "Test reachability, trace route hops, view active ports/connections" },
  { cmd: "nslookup / ipconfig", os: "Windows", desc: "Query DNS records / view IP, Subnet Mask & Default Gateway" },
  { cmd: "chmod / chown", os: "Linux", desc: "Change file permissions (r=4, w=2, x=1) / change file owner" },
  { cmd: "grep / ps / kill", os: "Linux", desc: "Search text patterns / list running processes / terminate process" }
];

const CHEATSHEET_OFFICE_FORMULAS = [
  { item: "=VLOOKUP(val, tbl, col, FALSE)", app: "Excel", desc: "Searches 1st column vertically and returns matching row value" },
  { item: "=IF(cond, true_val, false_val)", app: "Excel", desc: "Conditional logic test returning different values" },
  { item: "=COUNTIF(range, criteria)", app: "Excel", desc: "Counts cells matching a specific condition (e.g. \">50\")" },
  { item: "$A$1 (Dollar Sign $)", app: "Excel", desc: "Absolute Cell Reference — locks both column and row when copied" },
  { item: "Mail Merge", app: "Word", desc: "Combines a template letter with Excel/CSV list for bulk letters" },
  { item: "F5 / Shift + F5", app: "PowerPoint", desc: "Start Slide Show from Beginning (F5) / Current Slide (Shift+F5)" }
];

const CHEATSHEET_IT_ACT = [
  { sec: "Section 43", topic: "Damage to Computer System", desc: "Unauthorized access, downloading data, introducing viruses (Civil penalty)" },
  { sec: "Section 65", topic: "Tampering with Source Code", desc: "Concealing, destroying or altering computer source code intentionally" },
  { sec: "Section 66", topic: "Computer Related Offences", desc: "Dishonestly or fraudulently committing acts under Sec 43 (Up to 3 yrs)" },
  { sec: "Section 66C", topic: "Identity Theft", desc: "Fraudulent use of another person's password or electronic signature" },
  { sec: "Section 66D", topic: "Cheating by Personation", desc: "Cheating using computer resources / fake identity" },
  { sec: "Section 66F", topic: "Cyber Terrorism", desc: "Threatening unity/integrity/security of India (Up to life imprisonment)" },
  { sec: "Section 67", topic: "Obscene Material", desc: "Publishing or transmitting obscene material in electronic form" },
  { sec: "Digital Signature", topic: "Authentication (Asymmetric)", desc: "Uses Public Key Infrastructure (PKI) & Certifying Authorities (CA)" }
];
