# Kerala PSC Tradesman - Computer Hardware Maintenance (Cat. No. 884/2025)
## Rank 1 MCQ Preparation Web App

ഈ വെബ് ആപ്ലിക്കേഷൻ നിങ്ങളുടെ കേരള PSC Tradesman (CHM) പരീക്ഷയ്ക്ക് വേണ്ടി പ്രത്യേകം തയ്യാറാക്കിയതാണ്. നിങ്ങളുടെ സ്വന്തം Google Sheet-നെ ഡാറ്റാബേസ് ആയി ഉപയോഗിച്ച് മൊഡ്യൂൾ അടിസ്ഥാനത്തിൽ ചോദ്യങ്ങൾ പരിശീലിക്കാനും തെറ്റിയ ചോദ്യങ്ങൾ റിവിഷൻ ചെയ്യാനും ഇത് സഹായിക്കുന്നു.

---

### സവിശേഷതകൾ (Features)
1. **സിലബസിലെ 10 മൊഡ്യൂളുകൾ:**
   - Module 1: Basic Electronics (12 Marks)
   - Module 2: Computer Fundamentals (8 Marks)
   - Module 3: Advanced Hardware & Storage (10 Marks)
   - Module 4: Operating Systems & Deployment (10 Marks)
   - Module 5: System Utilities & Maintenance (10 Marks)
   - Module 6: Office Applications (10 Marks)
   - Module 7: I/O Devices & Maintenance (10 Marks)
   - Module 8: Networking Fundamentals (10 Marks)
   - Module 9: Application Protocols & Servers (10 Marks)
   - Module 10: Security, Cloud & IT Law (10 Marks)
2. **Google Sheet Sync:** ഗൂഗിൾ ഷീറ്റിൽ ചോദ്യങ്ങൾ ടൈപ്പ് ചെയ്ത് സേവ് ചെയ്യുമ്പോൾ തന്നെ ഈ വെബ് ആപ്പിൽ സിങ്ക് ചെയ്യാനുള്ള സൗകര്യം.
3. **PSC Full Mock Test:** യഥാർത്ഥ PSC രീതിയിൽ 75 മിനിറ്റ് ടൈമറും നെഗറ്റീവ് മാർക്കിംഗും (-0.33) ഉള്ള 100 ചോദ്യങ്ങളുടെ ടെസ്റ്റ്.
4. **Mistake Notebook:** പ്രാക്ടീസ് ചെയ്യുമ്പോഴും മോക്ക് ടെസ്റ്റിലും തെറ്റുന്ന ചോദ്യങ്ങൾ ഓട്ടോമാറ്റിക്കായി ബ്രൗസറിൽ സേവ് ചെയ്യപ്പെടുന്നു. Rank 1 ലഭിക്കാൻ ഏറ്റവും ആവശ്യമായ 'തെറ്റുകൾ തിരുത്തൽ' ഇതിലൂടെ സാധ്യമാകും.
5. **Instant Explanation:** ശരിയുത്തരം എന്തുകൊണ്ട് വന്നു എന്ന് വ്യക്തമാക്കുന്ന വിശദീകരണങ്ങൾ.

---

### Google Sheet & Apps Script സെറ്റപ്പ് ചെയ്യുന്ന വിധം (Step-by-Step)

#### 1. ഗൂഗിൾ ഷീറ്റ് നിർമ്മിക്കുക
1. [Google Sheets](https://sheets.new) തുറക്കുക.
2. താഴെ കൊടുത്തിരിക്കുന്ന പേരുകളിൽ **10 Tabs (ഷീറ്റുകൾ)** ഉണ്ടാക്കുക:
   - `Module_1_Electronics`
   - `Module_2_Comp_Fundamentals`
   - `Module_3_Adv_Hardware_Storage`
   - `Module_4_OS_Deployment`
   - `Module_5_System_Utilities`
   - `Module_6_Office_Applications`
   - `Module_7_IO_Devices`
   - `Module_8_Networking`
   - `Module_9_Protocols_Servers`
   - `Module_10_Security_Cloud_Law`
3. ഓരോ ഷീറ്റിന്റെയും **Row 1-ൽ** താഴെ പറയുന്ന ഹെഡറുകൾ നൽകുക:
   | A | B | C | D | E | F | G | H | I |
   |---|---|---|---|---|---|---|---|---|
   | `id` | `question` | `option_a` | `option_b` | `option_c` | `option_d` | `correct_answer` | `explanation` | `subtopic` |

   *(ശ്രദ്ധിക്കുക: `correct_answer` കോളത്തിൽ `A`, `B`, `C`, അല്ലെങ്കിൽ `D` എന്ന് വലിയക്ഷരത്തിൽ നൽകുക).*

#### 2. Apps Script കോഡ് പേസ്റ്റ് ചെയ്യുക
1. ഗൂഗിൾ ഷീറ്റിന്റെ മെനുവിൽ **Extensions ➡️ Apps Script** ക്ലിക്ക് ചെയ്യുക.
2. അവിടെയുള്ള പഴയ കോഡ് മാറ്റി, ഈ ഫോൾഡറിലെ `google_apps_script.js` ഫയലിലെ കോഡ് പൂർണ്ണമായും കോപ്പി ചെയ്ത് പേസ്റ്റ് ചെയ്യുക.
3. ഫയൽ സേവ് ചെയ്യുക (`Ctrl + S`).

#### 3. Web App ആയി Deploy ചെയ്യുക
1. മുകളിൽ വലതുവശത്തുള്ള **Deploy ➡️ New deployment** ക്ലിക്ക് ചെയ്യുക.
2. **Select type** എന്നതിൽ ഗിയർ ഐക്കൺ ക്ലിക്ക് ചെയ്ത് **Web app** തിരഞ്ഞെടുക്കുക.
3. താഴെ പറയുന്ന രീതിയിൽ സെറ്റിങ്സ് നൽകുക:
   - **Description:** `CHM MCQ API`
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone` *(ഇത് തെരഞ്ഞെടുക്കാൻ പ്രത്യേകം ശ്രദ്ധിക്കുക)*
4. **Deploy** ക്ലിക്ക് ചെയ്യുക (Google Account Permission ചോദിച്ചാൽ Advanced ➡️ Go to project ക്ലിക്ക് ചെയ്ത് Allow നൽകുക).
5. അവിടെ ലഭിക്കുന്ന **Web App URL** (`https://script.google.com/macros/s/.../exec`) കോപ്പി ചെയ്യുക.

---

### 🤖 ദിവസവും ഓട്ടോമാറ്റിക്കായി ചോദ്യങ്ങൾ ആഡ് ചെയ്യാൻ (Daily AI Generator)

നിങ്ങളുടെ കമ്പ്യൂട്ടർ ഓൺ ചെയ്യാതെ തന്നെ, ഗൂഗിളിന്റെ ക്ലൗഡ് വഴി എല്ലാ ദിവസവും രാവിലെ നിങ്ങളുടെ ഷീറ്റിലേക്ക് ചോദ്യങ്ങൾ ഓട്ടോമാറ്റിക്കായി ചേർക്കാം:

1. **സൗജന്യ Gemini API Key എടുക്കുക:**
   - [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/app/apikey) സന്ദർശിച്ച് ഒരു സൗജന്യ API Key ക്രിയേറ്റ് ചെയ്യുക.
2. **Apps Script-ൽ നൽകുക:**
   - ഗൂഗിൾ ഷീറ്റിലെ `Apps Script` തുറന്ന്, കോഡിലെ മുകളിലുള്ള `const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";` മാറ്റി നിങ്ങളുടെ API Key പേസ്റ്റ് ചെയ്യുക. ഫയൽ സേവ് ചെയ്യുക (`Ctrl + S`).
3. **ഷീറ്റിലെ മെനുവിലൂടെ ആക്ടിവേറ്റ് ചെയ്യുക:**
   - ഗൂഗിൾ ഷീറ്റ് റീഫ്രഷ് ചെയ്യുമ്പോൾ മെനുബാറിൽ **'🤖 PSC AI Generator'** എന്നൊരു പുതിയ മെനു കാണാം.
   - അതിൽ **'⏰ Setup Daily Auto-Trigger (Every Day 6 AM)'** ക്ലിക്ക് ചെയ്യുക.
   - അത്രമാത്രം! ഇനി മുതൽ എല്ലാ ദിവസവും രാവിലെ 6 മണിക്ക് നിങ്ങളുടെ എല്ലാ മൊഡ്യൂളുകളിലേക്കും പുതിയ PSC ചോദ്യങ്ങൾ ഓട്ടോമാറ്റിക്കായി ആഡ് ആയിക്കൊണ്ടിരിക്കും.


---

### വെബ് ആപ്പ് എങ്ങനെ ഉപയോഗിക്കാം?

1. നിങ്ങളുടെ കമ്പ്യൂട്ടറിലെ `d:\CHM_EXAM_MCQ\index.html` ഫയലിൽ ഡബിൾ ക്ലിക്ക് ചെയ്ത് ഏതൊരു ബ്രൗസറിലും (Chrome, Edge, Firefox) തുറക്കാവുന്നതാണ്.
2. മുകളിലുള്ള **Google Sheet Sync** ബട്ടൺ ക്ലിക്ക് ചെയ്ത് നിങ്ങളുടെ Web App URL പേസ്റ്റ് ചെയ്ത് **Sync Questions Now** നൽകുക.
3. നിമിഷങ്ങൾക്കകം നിങ്ങളുടെ എല്ലാ ചോദ്യങ്ങളും വെബ് ആപ്പിൽ ലോഡ് ആകും!
4. ഇൻറർനെറ്റ് ഇല്ലാതെയും (Offline) ഈ ആപ്പ് പ്രവർത്തിക്കും; ലോക്കലായി ബ്രൗസർ മെമ്മറിയിൽ ചോദ്യങ്ങൾ സേവ് ചെയ്യപ്പെടും.

---

### മൊബൈലിൽ ആപ്പ് പോലെ ഉപയോഗിക്കാൻ (Free Deployment)
ഈ പ്രോജക്റ്റ് ഫോൾഡർ സൗജന്യമായി **GitHub Pages** അല്ലെങ്കിൽ **Vercel**-ലേക്ക് അപ്‌ലോഡ് ചെയ്താൽ, ലഭിക്കുന്ന വെബ് ലിങ്ക് നിങ്ങളുടെ മൊബൈൽ ഫോണിൽ തുറന്ന് **Add to Home screen** ക്ലിക്ക് ചെയ്താൽ അതൊരു മൊബൈൽ ആപ്പ് ആയി മാറും!

