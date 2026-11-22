// Official Detailed Syllabus Data for Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025)
const SYLLABUS_DATA = [
  {
    moduleId: "Module_1_Electronics",
    moduleName: "Module 1: Basic Electronics",
    marks: 12,
    icon: "fa-bolt",
    topics: [
      {
        title: "Basic principles of electricity",
        text: "Basic principles of electricity: Voltage, current, resistance, power, energy, ohm's law, Kirchhoff's law (KCL & KVL)."
      },
      {
        title: "Resistors & Color Coding",
        text: "Resistors: types, color coding, power rating, series/parallel combinations, applications."
      },
      {
        title: "Capacitors & Dielectric Materials",
        text: "Capacitors: principles, dielectric materials, types, series/parallel circuits."
      },
      {
        title: "Inductors & Transformers",
        text: "Inductors & Transformers: inductance, mutual inductance, magnetic cores, inductive reactance, transformer action, turns ratio, and impedance matching."
      },
      {
        title: "Semiconductor Fundamentals & PN Junction",
        text: "Semiconductor fundamentals: intrinsic and extrinsic semiconductors, p-type and n-type doping, majority/minority carriers, PN junction formation."
      },
      {
        title: "PN Junction Diode & Specialized Diodes",
        text: "PN junction diode: Forward and reverse bias characteristics, barrier potential, breakdown mechanisms, diode applications, specialized diodes (Zener, LED, Photodiode, Varactor, Schottky)."
      },
      {
        title: "Power Semiconductor Devices (SCR, DIAC, TRIAC)",
        text: "Power semiconductor devices: SCR: Structure, triggering methods, latching and holding current, phase control circuits. DIAC: Construction, bidirectional switching characteristics, triggering applications. TRIAC: Operations, power control."
      },
      {
        title: "Transistors (BJT, FET, JFET, MOSFET)",
        text: "Transistor operation: NPN and PNP structures, biasing conditions. Configurations: BJT as a switch & amplifier, FET, JFET, MOSFET, Applications, amplifiers."
      },
      {
        title: "Power Supplies & Voltage Regulation (Linear & SMPS)",
        text: "Power Supplies & voltage regulation: Linear Regulators: Zener regulators, current limiting, and thermal protection. Fixed & adjustable 3-Pin IC Regulators, power fluctuation hazards and protection devices Switched-Mode Power Supplies: Linear, Switching regulation."
      },
      {
        title: "Digital Electronics & Logic Gates",
        text: "Digital Electronics: Number systems (Binary, Octal, Decimal, Hexadecimal, 1's and 2's complement), Logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) and truth tables."
      }
    ]
  },
  {
    moduleId: "Module_2_Comp_Fundamentals",
    moduleName: "Module 2: Computer Fundamentals",
    marks: 8,
    icon: "fa-microchip",
    topics: [
      {
        title: "Characteristics, Generations & Architecture",
        text: "Characteristics of digital computers, generations, classification, applications, hardware and software concepts, functional blocks, internal architecture, instruction cycle."
      },
      {
        title: "Motherboard Components & Form Factors",
        text: "Motherboard components, Cabinet form factors, motherboard form factors (ATX, Micro-ATX, Mini-ITX), expansion slots (PCI, PCIe, AGP), bus architecture, add-on cards, chipset architecture (Northbridge/Southbridge, PCH), processor families, socket types (LGA, PGA)."
      },
      {
        title: "Memory Hierarchy, Units & RAM/ROM",
        text: "Memory hierarchy, memory units (Bit, Byte, KB, MB, GB, TB, PB), primary memory, RAM (SRAM, DRAM, DDR2, DDR3, DDR4, DDR5), ROM (PROM, EPROM, EEPROM, Flash), cache memory (L1, L2, L3)."
      }
    ]
  },
  {
    moduleId: "Module_3_Adv_Hardware_Storage",
    moduleName: "Module 3: Advanced Hardware & Storage",
    marks: 10,
    icon: "fa-hard-drive",
    topics: [
      {
        title: "CPU Technology & Cooling",
        text: "CPU Technology: Internal organization, Modern CPU architectures, multicore processing, thermal cooling mechanisms (heat sinks, thermal paste, liquid cooling), overclocking."
      },
      {
        title: "Magnetic Storage & Hard Disk Drives",
        text: "Storage Devices: Magnetic storage devices, hard disk drive (HDD), Internal architecture (platters, spindle motor, read/write heads, voice coil actuator), hard drive controller electronics."
      },
      {
        title: "SSD, Storage Interfaces & Optical Media",
        text: "Solid state devices (SSD, NAND Flash, SLC/MLC/TLC), storage interfaces (SATA, SAS, NVMe, M.2, PCIe), optical storage devices (CD, DVD, Blu-ray)."
      },
      {
        title: "RAID Concepts & NAS",
        text: "Redundant Array of Independent Disks (RAID) concepts and levels (RAID 0 striping, RAID 1 mirroring, RAID 5 distributed parity, RAID 10), Network Attached Storage (NAS)."
      }
    ]
  },
  {
    moduleId: "Module_4_OS_Deployment",
    moduleName: "Module 4: Operating Systems and Deployment",
    marks: 10,
    icon: "fa-terminal",
    topics: [
      {
        title: "Software Classification",
        text: "Software Classification: System software, application software, utility programs, high level language, low level language (machine language, assembly language), compilers, interpreters."
      },
      {
        title: "OS Setup, Recovery & Linux Basics",
        text: "OS Setup & Recovery: OS functions, open source and proprietary softwares, disk operating system (DOS), GUI environments, OS deployment methods, recovery partitions, system image creation, backup and restore, registry fundamentals, Linux OS features and structure, file system (ext4) and process architecture, basic commands."
      },
      {
        title: "Partition Schemes (MBR vs GPT)",
        text: "Partition Schemes: Master boot record (MBR), GUID Partition Table (GPT), partition tables, primary partitions, extended partition, logical partitions."
      },
      {
        title: "Boot Management & Multi-Boot",
        text: "Boot Management: Boot loaders (GRUB, LILO), windows boot manager (bootmgr, BCD) and alternative boot managers, multi-boot configuration."
      }
    ]
  },
  {
    moduleId: "Module_5_System_Utilities",
    moduleName: "Module 5: System Utilities & Maintenance",
    marks: 10,
    icon: "fa-wrench",
    topics: [
      {
        title: "System Files & Command Line Tools",
        text: "Windows Explorer, file system properties (NTFS, FAT32, exFAT), 32-bit vs 64-bit architecture, critical system32 directory files, command-line operations (CMD) and PowerShell basics, task manager, windows services, process priorities, event viewer, system monitor (perfmon), safe mode functionality."
      },
      {
        title: "User Account Security & Group Policies",
        text: "User Account Security: Account types (Administrator, Standard, Guest), User Account Control (UAC), user access levels, NTFS permissions, group policies (GPO), and time-based permission expiration."
      },
      {
        title: "Malware & System Maintenance",
        text: "Malware & System Maintenance: Antivirus configuration, definitions update, port blocking, hosts file modification, junk file cleanup (Disk Cleanup), defragmentation (Defrag/Trim), and software licensing compliance."
      }
    ]
  },
  {
    moduleId: "Module_6_Office_Applications",
    moduleName: "Module 6: Office Applications",
    marks: 10,
    icon: "fa-file-lines",
    topics: [
      {
        title: "Word Processing",
        text: "Word Processing: Document creation, editing, formatting, page setup, header & footer, tables, mail merge, macros, export formats."
      },
      {
        title: "Spreadsheets & Formulas",
        text: "Spreadsheets: Workbook and worksheet creation, cell formatting, cell referencing (relative, absolute, mixed), cell formulas, mathematical/statistical/lookup functions, chart generation, data sorting and filtering."
      },
      {
        title: "Presentations & Multimedia Integration",
        text: "Presentations: Slide creation, design templates and themes, slide formatting, custom animation, slide transitions, multimedia integration (audio/video embedding), slide master, slideshow delivery."
      }
    ]
  },
  {
    moduleId: "Module_7_IO_Devices",
    moduleName: "Module 7: I/O Devices & Maintenance",
    marks: 10,
    icon: "fa-print",
    topics: [
      {
        title: "Input Peripherals & Biometrics",
        text: "I/O Devices: Keyboards (mechanical, membrane), mice (optical, laser), audio & visual input (microphones, webcams), biometric & commercial input output peripherals (fingerprint scanners, barcode/QR readers, POS terminals)."
      },
      {
        title: "Display Technologies & Video Interfacing",
        text: "Display technologies (CRT, LCD, LED, OLED), video interfacing (VGA, DVI, HDMI, DisplayPort), audio I/O systems (sound cards, analog jacks, S/PDIF)."
      },
      {
        title: "Printers & Multi-Function Devices (MFDs)",
        text: "Impact and non-impact printers: Dot matrix printers (print heads, ribbons), Inkjet printers (ink cartridges, piezoelectric/thermal nozzles), Laser printers (toner, OPC drum, laser scanning unit, fuser assembly), Scanners & MFDs (flatbed, CIS vs CCD, optical resolution), thermal printers."
      },
      {
        title: "Peripheral Bus Standards & Driver Deployment",
        text: "Peripheral bus standards (USB 2.0, USB 3.0/3.1/3.2, USB Type-C, Thunderbolt), installation, configuration, driver deployment, Device Manager diagnostics, maintenance & repair."
      }
    ]
  },
  {
    moduleId: "Module_8_Networking",
    moduleName: "Module 8: Networking Fundamentals",
    marks: 10,
    icon: "fa-network-wired",
    topics: [
      {
        title: "Network Architectures & Topologies",
        text: "Network Architectures & Topologies: Peer-to-Peer, Client-Server models, Topologies (Star, Bus, Ring, Mesh, Tree, Hybrid). LAN, MAN, PAN, WAN structures. IEEE 802 standards (802.3 Ethernet, 802.11 Wi-Fi), Wireless networking."
      },
      {
        title: "Transmission Media, Cables & Connectors",
        text: "Transmission Media & Standards: Twisted-pair (UTP/STP, Cat5e, Cat6), coaxial cable, fiber-optic cables (single-mode, multi-mode); RJ-45, RJ-11, and BNC connectors, CAT6 wiring conventions (T568A vs T568B), simplex, half-duplex, and full-duplex data transmission."
      },
      {
        title: "Reference Models (OSI & TCP/IP)",
        text: "Reference Models: Layered architectures and functions of the OSI 7-Layer model (Physical, Data Link, Network, Transport, Session, Presentation, Application) and TCP/IP 4-layer protocol suite, encapsulation and PDU."
      },
      {
        title: "Network Hardware & Devices",
        text: "Hardware: Hubs (active/passive), switches (unmanaged, managed, Layer 2/3), routers, gateways, repeaters, transceivers, wireless access points (WAP), firewalls."
      },
      {
        title: "IP Addressing & Subnetting",
        text: "IP Addressing & Network Services: IPv4 address classes (A, B, C, D, E), private vs public IP, subnet masks, CIDR subnetting, IPv6 structure and advantages, TCP/IP utilities (ping, traceroute/tracert, ipconfig/ifconfig, netstat, nslookup, arp)."
      }
    ]
  },
  {
    moduleId: "Module_9_Protocols_Servers",
    moduleName: "Module 9: Application Protocols and Server Administration",
    marks: 10,
    icon: "fa-server",
    topics: [
      {
        title: "Application Protocols & VLANs",
        text: "Application Protocols: DHCP (DORA process, ports 67/68), DNS (domain resolution, port 53), FTP (ports 20/21), Telnet (port 23), SSH (port 22), HTTP (port 80), HTTPS (port 443), SMTP (port 25). Virtual LAN (VLAN, IEEE 802.1Q) concepts, packet simulators (Packet Tracer)."
      },
      {
        title: "Server Systems & Administration",
        text: "Server Systems: Hardware server architectures (rack mount, blade servers, ECC memory, redundant power supply), Windows and Linux Server deployment, Active Directory basics, network management utilities, remote administration (RDP port 3389, SSH, VNC)."
      }
    ]
  },
  {
    moduleId: "Module_10_Security_Cloud_Law",
    moduleName: "Module 10: Network Security, Cloud Computing & IT Law",
    marks: 10,
    icon: "fa-shield-halved",
    topics: [
      {
        title: "Network Security & Cyber Threats",
        text: "Network Security Fundamentals, Security concepts (Confidentiality, Integrity, Availability - CIA triad), types of network attacks (DoS/DDoS, Man-in-the-Middle, Phishing, Spoofing, Brute-force, Malware, Ransomware), identification and prevention strategies, cyber threats, data breaches, safe browsing practices, email security, cryptography (symmetric vs asymmetric, AES, RSA, hash functions) & authentication (MFA/2FA, digital certificates)."
      },
      {
        title: "Virtualization & Cloud Computing",
        text: "Virtualization & Cloud Computing: Server virtualization, Hypervisor Type 1 (bare-metal) vs Type 2 (hosted), virtual machine requirements, cloud infrastructure, cloud service models (IaaS, PaaS, SaaS), cloud deployment models (public, private, hybrid, community cloud), public cloud services (AWS, Azure, Google Cloud)."
      },
      {
        title: "The IT Act & Cyber Laws",
        text: "The IT Act & Cyber Laws: Introduction to the Information Technology (IT) Act 2000 and amendments, legal provisions regarding cybercrime (hacking, data theft, identity theft, cyber terrorism), digital signatures and electronic signatures, legal frameworks for electronic governance, data privacy regulations."
      }
    ]
  }
];

