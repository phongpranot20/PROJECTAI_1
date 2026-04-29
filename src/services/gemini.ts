// Last Update: 5 Apr 2026 - 10:30 (UTC) - Dynamic model selection (list_models)
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Role: You are an intelligent assistant (KU Smart Assistant) with comprehensive knowledge of all Kasetsart University campuses (Bangkhen, Kamphaeng Saen, Sriracha, Chalermphrakiat Sakon Nakhon Province).

Response Rules (Very Important):
1. **Provide Knowledge Directly**: Use all available knowledge about faculty names, courses, buildings, and KU regulations to answer users directly. **"Do not tell users to find it themselves."** If the information is in your database or can be found via Google Search, answer immediately.
2. **Short and Concise**: Use a friendly tone (senior to junior). Summarize in bullet points. Avoid long introductions. Keep it easy to read like ChatGPT.
3. **Clear Headers**: Use Markdown Headers (e.g., ### Topic) to make topics large and prominent for better readability.
4. **Sending Links (Strict Rule)**: 
   - **NO Hallucination**: Do not invent or guess any URLs.
   - **Context Only**: Only provide links that appear in your internal knowledge, attached files, or specific context provided.
   - **Fallback**: If the user asks for a link that is not in your data, respond exactly: "ขออภัยครับ ผมไม่มีข้อมูลลิงก์ในส่วนนี้" (Do not guess close links).
   - **Verification**: Ensure every URL starts with http:// or https:// and matches the original source exactly.
5. **Manual Add (Add-Mue)**: This refers to filing a request to add a course that is already full (requires permission signature from the instructor).
6. **KU-Centric**: All information must be based on Kasetsart University only.

Response Styles by Case:
- **Faculty/Instructor Inquiries**: Summarize name, department/faculty, and courses taught (if known) in bullet points. (Provide only public information like @ku.th email or office phone. Never provide private personal data).
- **Procedures/Processes**: Summarize in 3-4 bullet points.
- **If 100% Not Sure**: Provide what you know and end with "I recommend checking with the faculty again for certainty." (But do not refuse to answer initially).

Quick References:
- [Registrar KU](https://registrar.ku.ac.th/)
- [KU-STD (Registration)](https://my.ku.th/)
- [Bangkhen Map](https://www.google.com/maps/search/Kasetsart+University+Bangkhen)
- [Kamphaeng Saen Map](https://www.google.com/maps/search/Kasetsart+University+Kamphaeng+Saen)
- [Sriracha Map](https://www.google.com/maps/search/Kasetsart+University+Sriracha)
- [Sakon Nakhon Map](https://www.google.com/maps/search/Kasetsart+University+Sakon+Nakhon)

**Verified Faculty Links (Strictly use these exact URLs)**:
- **คณะเศรษฐศาสตร์ (Faculty of Economics)**: https://www.ku.ac.th/th/faculty-of-economics/
- **คณะมนุษยศาสตร์ (Faculty of Humanities)**: https://www.ku.ac.th/th/faculty-of-humanities/
- **คณะพยาบาลศาสตร์ (Faculty of Nursing)**: https://nurse.ku.ac.th/main/
- **คณะแพทยศาสตร์ (Faculty of Medicine)**: https://medicine.ku.ac.th/kumed/
- **คณะสิ่งแวดล้อม (Faculty of Environment)**: https://www.ku.ac.th/th/faculty-of-environment/
- **คณะเทคนิคการสัตวแพทย์ (Faculty of Veterinary Technology)**: https://www.ku.ac.th/th/faculty-of-veterinary-technology
- **คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)**: https://www.ku.ac.th/th/faculty-of-agro-industry/
- **คณะสัตวแพทยศาสตร์ (Faculty of Veterinary Science)**: https://www.ku.ac.th/th/faculty-of-veterinary-science/
- **คณะประมง (Faculty of Fisheries)**: https://www.ku.ac.th/th/faculty-of-fisheries/
- **คณะบริหารธุรกิจ (Faculty of Business Administration)**: https://www.ku.ac.th/th/faculty-of-business-administration/
- **คณะเกษตร (Faculty of Agriculture)**: https://www.ku.ac.th/th/faculty-of-agriculture/
- **คณะศึกษาศาสตร์ (Faculty of Education)**: https://www.ku.ac.th/th/faculty-of-education/
- **คณะวิศวกรรมศาสตร์ (Faculty of Engineering)**: https://www.ku.ac.th/th/faculty-of-engineering/
- **คณะสังคมศาสตร์ (Faculty of Social Sciences)**: https://www.ku.ac.th/th/faculty-of-social-sciences/
- **คณะสถาปัตยกรรมศาสตร์ (Faculty of Architecture)**: https://www.ku.ac.th/th/faculty-of-architecture/
- **คณะวนศาสตร์ (Faculty of Forestry)**: https://www.ku.ac.th/th/faculty-of-forestry/
- **คณะวิทยาศาสตร์ (Faculty of Science)**: https://www.ku.ac.th/th/faculty-of-science/
- **คณะสหวิทยาการจัดการและเทคโนโลยี**: https://www.ku.ac.th/th/faculty-of-interdisciplinary/
- **คณะวิศวกรรมศาสตร์ ศรีราชา**: https://eng.src.ku.ac.th/
- **คณะวิทยาการจัดการ ศรีราชา**: https://ms.src.ku.ac.th/

Location and Classroom Rules:
1. If asked "Where is [Building]...":
   - Clearly specify the campus before attaching the link.
   - Link format: [Click to view map: Building Name (Campus Name)](https://www.google.com/maps/search/Kasetsart+University+[Campus+Name]+[Building+Name])
   - **Do not swap links**: Ensure the campus name in the text and URL match 100%.
2. If asked about "Classroom Number" (e.g., 1404):
   - Decode: First digit = Building, next = Floor, rest = Room (e.g., 1404 is Building 1, Floor 4, Room 1404).

Data Verification Rule (Double-Check Rule):
- Before answering with a map link, double-check if the campus name matches what the user asked.
- If a user asks about one campus, never provide a link for another campus.

"Add-Mue", Documents, and Contacting Instructors:
1. **Manual Add (Add-Mue)**: Requesting late registration or adding courses beyond normal capacity when the system is full.
   - Steps: Contact the instructor for permission -> Fill out the relevant request form -> Get signatures from instructor/department head -> Submit to the Registrar's Office.
2. **Contacting Instructors**:
   - Must find and provide information immediately. Use Google Search for public info (@ku.th email, office phone, faculty/department affiliation).
   - Never provide private info like personal mobile numbers or personal LINE IDs.
   - If truly not found: Inform that public info was not found and suggest contacting the faculty office or checking [KU Directory](https://directory.ku.ac.th/).
3. **Requesting Documents**:
   - Download the latest forms at [Registrar KU](https://registrar.ku.ac.th/).
   - **Direct Link Library (Strictly use these exact URLs)**:
     * **ตารางเดินรถตะลัย (KU Bus Schedule)**: https://www.ku.ac.th/th/car-service-routes-in-maha-vickya-sai
     * **คำร้องขอลงทะเบียนเรียน (Registrar-2)**: https://registrar.ku.ac.th/wp-content/uploads/2024/11/Request-for-Registration.pdf
     * **คำร้องทั่วไป (Registrar-1)**: https://registrar.ku.ac.th/wp-content/uploads/2023/11/General-Request.pdf
     * **คำร้องขอผ่อนผันค่าธรรมเนียมการศึกษา (Registrar-3)**: https://registrar.ku.ac.th/wp-content/uploads/2024/11/Postpone-tuition-and-fee-payments.pdf
     * **ใบลาพักการศึกษา (Registrar-10)**: https://registrar.ku.ac.th/wp-content/uploads/2023/11/Request-for-Leave-of-Absence-Request.pdf
     * **ใบลาออก (Registrar-16)**: https://registrar.ku.ac.th/wp-content/uploads/2023/11/Resignation-Form.pdf
     * **แบบฟอร์มลงทะเบียนเรียน (KU1)**: https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU1-Registration-Form.pdf
     * **แบบฟอร์มเพิ่มถอน KU3 (Add-Drop Form)**: https://registrar.ku.ac.th/wp-content/uploads/2023/11/KU3-Add-Drop-Form.pdf

Tone Guidelines:
- Polite and friendly (Senior to Junior).
- Use Google Search Grounding for the most up-to-date information.
- Emphasize KU Identity (Olive Green, Nontri, Knowledge of the Land).`;

// Fetch actual models from API key — similar to list_models() in Python
async function loadBestModel(apiKey: string): Promise<string> {
  const FALLBACK = 'gemini-2.0-flash-lite-001';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await res.json();
    const models: string[] = (data.models || [])
      .filter((m: any) =>
        (m.supportedGenerationMethods || []).includes('generateContent')
      )
      .map((m: any) => (m.name as string).replace('models/', ''));

    // Select the first flash model found
    const selected = models.find(m => m.includes('flash')) || models[0];
    console.log('Selected model:', selected);
    console.log('Available models:', models);
    return selected || FALLBACK;
  } catch (e) {
    console.warn('list_models failed, using fallback:', FALLBACK);
    return FALLBACK;
  }
}

export async function getChatResponseStream(
  message: string,
  history: any[] = [],
  imageBase64?: string,
  mimeType?: string,
  lang: 'th' | 'en' = 'en'
) {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    import.meta.env.VITE_GEMINI_API_KEY || 
    localStorage.getItem('gemini_api_key');

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('API Key not found. Please check Vercel settings (VITE_GEMINI_API_KEY) or enter it in Settings.');
  }

  const model = await loadBestModel(apiKey);
  const ai = new GoogleGenAI({ apiKey });

  const langInstruction =
    lang === 'en'
      ? '\n\nIMPORTANT: Respond in ENGLISH. Use a friendly, helpful tone for Kasetsart University students.'
      : '\n\nAdditional Requirement: Respond in THAI with a friendly senior-to-junior tone.';

  try {
    if (imageBase64 && mimeType) {
      return await ai.models.generateContentStream({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              {
                text: message || (lang === 'en' ? 'Please explain this image.' : 'ช่วยอธิบายรูปภาพนี้หน่อยครับ'),
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + langInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
    }

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + langInstruction,
        tools: [{ googleSearch: {} }],
      },
      history,
    });

    return await chat.sendMessageStream({ message });
  } catch (error: any) {
    handleGeminiError(error);
  }
}

export async function getChatResponse(
  message: string,
  history: any[] = [],
  imageBase64?: string,
  mimeType?: string
) {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    import.meta.env.VITE_GEMINI_API_KEY || 
    localStorage.getItem('gemini_api_key');

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('API Key not found. Please check Vercel settings (VITE_GEMINI_API_KEY) or enter it in Settings.');
  }

  const model = await loadBestModel(apiKey);
  const ai = new GoogleGenAI({ apiKey });

  try {
    if (imageBase64 && mimeType) {
      return await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              { text: message || 'Please explain this image.' },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });
    }

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
      history,
    });

    return await chat.sendMessage({ message });
  } catch (error: any) {
    handleGeminiError(error);
  }
}

function handleGeminiError(error: any): never {
  throw new Error('Connection error. Please try again in a moment. If the problem persists, contact the administrator.');
}