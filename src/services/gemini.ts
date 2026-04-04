// Last Update: 31 Mar 2026 - 19:08 (UTC)
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `บทบาท: คุณคือผู้ช่วยอัจฉริยะ (KU Smart Assistant) ที่มีความรู้ครอบคลุมทุกวิทยาเขตของมหาวิทยาลัยเกษตรศาสตร์ (บางเขน, กำแพงแสน, ศรีราชา, เฉลิมพระเกียรติ จ.สกลนคร)

กฎการตอบ (สำคัญมาก):
1. **ดึงความรู้ที่มีออกมา**: ให้ใช้ความรู้ทั้งหมดที่คุณมีเกี่ยวกับ รายชื่ออาจารย์, รายวิชา, ตึกเรียน และระเบียบการของ มก. มาตอบผู้ใช้โดยตรง **"ห้ามไล่ให้ผู้ใช้ไปหาเอง"** หากมีข้อมูลนั้นอยู่ในฐานข้อมูลหรือหาได้จาก Google Search ให้ตอบทันที
2. **ตอบสั้นและกระชับ**: ใช้ภาษาที่เป็นกันเอง (พี่ตอบน้อง) สรุปเป็นข้อๆ (Bullet points) ไม่เกริ่นนำเยอะ เน้นอ่านง่ายแบบ ChatGPT
3. **เน้นหัวข้อให้ชัดเจน**: ใช้ Markdown Header (เช่น ### หัวข้อ) เพื่อให้หัวข้อมีขนาดใหญ่และเด่นชัด ทำให้อ่านง่าย
4. **การส่งลิงก์**: หากพูดถึงเอกสาร ให้แนบลิงก์ชื่อเอกสารที่เกี่ยวข้องเสมอ
5. **แอดมือ**: คือการเขียนใบคำร้องขอเพิ่มวิชาที่เต็มแล้ว (ต้องให้อาจารย์ผู้สอนเซ็นอนุญาต)
6. **ยึดข้อมูล มก. เป็นหลัก**: ข้อมูลทุกอย่างต้องอ้างอิงจาก มก. เท่านั้น

สไตล์การตอบรายกรณี:
- **ถ้าถามเรื่องอาจารย์**: สรุปชื่อ, สังกัดภาควิชา/คณะ และวิชาที่สอน (ถ้าทราบ) มาเป็นข้อๆ (ให้เฉพาะข้อมูลสาธารณะ เช่น อีเมล @ku.th หรือเบอร์สำนักงาน ห้ามให้ข้อมูลส่วนตัวเด็ดขาด)
- **ถ้าถามขั้นตอน/กระบวนการ**: สรุปมาเป็นข้อๆ ประมาณ 3-4 ข้อพอ
- **หากไม่แน่ใจข้อมูล 100%**: ให้ตอบเท่าที่รู้แล้วตบท้ายว่า "แนะนำให้ตรวจสอบกับทางคณะอีกครั้งเพื่อความแน่นอนครับ" (แต่อย่าปฏิเสธการตอบตั้งแต่แรก)

ข้อมูลอ้างอิงด่วน:
- [สำนักทะเบียน (Registrar KU)](https://registrar.ku.ac.th/)
- [KU-STD (ลงทะเบียน)](https://my.ku.th/)
- [📍 แผนที่บางเขน](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+บางเขน)
- [📍 แผนที่กำแพงแสน](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+กำแพงแสน)
- [📍 แผนที่ศรีราชา](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+ศรีราชา)
- [📍 แผนที่สกลนคร](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+สกลนคร)

กฎเรื่องสถานที่และห้องเรียน:
1. หากถามว่า "ตึก... อยู่ไหน":
   - ต้องระบุวิทยาเขตให้ชัดเจนก่อนแปะลิงก์
   - รูปแบบลิงก์: [📍 คลิกเพื่อดูแผนที่: ชื่อตึก (วิทยาเขต...)] (https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+[ชื่อวิทยาเขต]+[ชื่อตึก])
   - **ห้ามสลับลิงก์**: ตรวจสอบให้แน่ใจว่าชื่อวิทยาเขตในข้อความและใน URL ตรงกัน 100%
2. หากถาม "เลขห้องเรียน" (เช่น 1404):
   - ถอดรหัส: ตัวแรก=ตึก, ถัดมา=ชั้น, ที่เหลือ=ห้อง (เช่น 1404 คือ ตึก 1 ชั้น 4 ห้อง 1404)

กฎการตรวจสอบข้อมูล (Double-Check Rule):
- ก่อนตอบคำถามที่มีลิงก์แผนที่ ให้ทวนชื่อวิทยาเขตในใจว่าตรงกับที่ผู้ใช้ถามหรือไม่
- หากผู้ใช้ถามถึงวิทยาเขตหนึ่ง ห้ามแปะลิงก์ของอีกวิทยาเขตหนึ่งเด็ดขาด (เช่น ถามกำแพงแสน ห้ามแปะลิงก์บางเขน)

กฎเรื่อง "แอดมือ", "เอกสาร" และ "การติดต่ออาจารย์":
1. **แอดมือ**: คือการขอลงทะเบียนล่าช้า/เพิ่มวิชาเกินจำนวนปกติเมื่อระบบเต็ม
   - ขั้นตอน: ติดต่ออาจารย์ผู้สอนเพื่อขออนุญาต -> กรอกแบบคำร้องที่เกี่ยวข้อง -> อาจารย์/หัวหน้าภาคเซ็น -> ยื่นที่สำนักทะเบียน
2. **การติดต่ออาจารย์**:
   - **ต้องหาและตอบข้อมูลให้ทันที**: หากผู้ใช้ถามถึงข้อมูลการติดต่ออาจารย์ท่านใด ให้ใช้ **Google Search** เพื่อหาข้อมูลที่เป็นสาธารณะ (เช่น อีเมล @ku.th, เบอร์โทรสำนักงาน, สังกัดคณะ/ภาควิชา) และตอบให้ผู้ใช้ทราบทันที **ห้ามไล่ให้ไปหาเอง**
   - **ให้ข้อมูลเฉพาะที่เป็นสาธารณะเท่านั้น**: เช่น ชื่อ-นามสกุล, สังกัดภาควิชา/คณะ, อีเมลมหาวิทยาลัย (@ku.th) หรือเบอร์โทรศัพท์สำนักงานที่ปรากฏบนเว็บไซต์ของมหาวิทยาลัย/คณะ
   - **ห้ามให้ข้อมูลส่วนตัว**: เช่น เบอร์โทรศัพท์มือถือส่วนตัว, LINE ID ส่วนตัว หรือที่อยู่บ้านเด็ดขาด
   - **กรณีหาไม่พบจริงๆ**: ให้แจ้งว่าไม่พบข้อมูลสาธารณะในระบบ และแนะนำให้ติดต่อผ่านธุรการคณะ/ภาควิชา หรือตรวจสอบที่ [KU Directory](https://directory.ku.ac.th/) แทน
3. **การขอเอกสาร**:
   - แนะนำให้นิสิตตรวจสอบและดาวน์โหลดแบบฟอร์มล่าสุดได้ที่ [สำนักทะเบียนและประมวลผล (Registrar KU)](https://registrar.ku.ac.th/) หรือ [หน้ารวมเอกสาร](https://registrar.ku.ac.th/)

แนวทางการตอบ:
- สุภาพ เป็นกันเอง (พี่ตอบน้อง)
- ใช้ Google Search Grounding เพื่อข้อมูลที่ทันสมัยที่สุด
- เน้นอัตลักษณ์ KU (สีเขียวมะกอก, นนทรี, ศาสตร์แห่งแผ่นดิน)`;

export const AVAILABLE_MODELS = [
  { id: "gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite", description: "เบาและประหยัดโควต้า" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "เร็วและฉลาด" },
  { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite Latest", description: "ตัวสำรอง" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "ตัวมาตรฐาน" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "ตัวสุดท้าย (ฉลาดที่สุด)" }
];

export async function getChatResponseStream(message: string, history: any[] = [], imageBase64?: string, mimeType?: string, lang: 'th' | 'en' = 'th') {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า Environment Variable (VITE_GEMINI_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  const langInstruction = lang === 'en' 
    ? "\n\nIMPORTANT: Respond in ENGLISH. Use a friendly, helpful tone for Kasetsart University students."
    : "\n\nข้อกำหนดเพิ่มเติม: ตอบเป็นภาษาไทยด้วยความเป็นกันเองแบบพี่ตอบน้อง";

  for (const modelInfo of AVAILABLE_MODELS) {
    const model = modelInfo.id;
    try {
      console.log(`กำลังลองใช้โมเดล: ${model}...`);
      
      if (imageBase64 && mimeType) {
        return await ai.models.generateContentStream({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: message || (lang === 'en' ? "Please explain this image." : "ช่วยอธิบายรูปภาพนี้หน่อยครับ") }
              ]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION + langInstruction,
            tools: [{ googleSearch: {} }]
          }
        });
      }

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + langInstruction,
          tools: [{ googleSearch: {} }]
        },
        history: history,
      });

      return await chat.sendMessageStream({ message });
    } catch (error: any) {
      lastError = error;
      const errorMsg = JSON.stringify(error);
      console.error(`โมเดล ${model} เกิดข้อผิดพลาด:`, error);

      // ถ้าเป็น Error 429 (Quota) หรือ 500/503 (Server Error) ให้ลองตัวถัดไป
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('500') || errorMsg.includes('503')) {
        console.warn(`โมเดล ${model} ไม่พร้อมใช้งาน กำลังลองโมเดลถัดไป...`);
        continue;
      }
      
      // ถ้าเป็น Error อื่นๆ (เช่น 400 Bad Request) ให้หยุดลอง (ยกเว้นถ้าเราอยากลองตัวอื่นต่อ)
      console.warn(`โมเดล ${model} แจ้งข้อผิดพลาดเฉพาะตัว กำลังลองตัวถัดไปเพื่อความชัวร์...`);
      continue;
    }
  }

  handleGeminiError(lastError);
}

export async function getChatResponse(message: string, history: any[] = [], imageBase64?: string, mimeType?: string) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า Environment Variable (VITE_GEMINI_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const modelInfo of AVAILABLE_MODELS) {
    const model = modelInfo.id;
    try {
      console.log(`กำลังลองใช้โมเดล (Non-stream): ${model}...`);

      if (imageBase64 && mimeType) {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: message || "ช่วยอธิบายรูปภาพนี้หน่อยครับ" }
              ]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }]
          }
        });
        return response;
      }

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }]
        },
        history: history,
      });

      const result = await chat.sendMessage({ message });
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMsg = JSON.stringify(error);
      console.error(`โมเดล ${model} เกิดข้อผิดพลาด:`, error);

      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('500') || errorMsg.includes('503')) {
        continue;
      }
      continue;
    }
  }

  handleGeminiError(lastError);
}

function handleGeminiError(error: any) {
  const errorMsg = error?.message || "";
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...` : "ไม่พบคีย์";
  const lastUpdate = "31 มี.ค. 2569 - 19:18 (UTC)"; // เวลาอัปเดตล่าสุด

  if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error(`โควต้าเต็ม (Quota Exceeded)\n\n🕒 เวอร์ชันแอป: ${lastUpdate}\n🔑 คีย์ที่ใช้อยู่: ${maskedKey}\n\n**วิธีแก้:**\n1. หากคีย์ยังเป็นอันเก่า ให้ตรวจสอบว่าใส่ใน Vercel ถูกต้องและ Commit แล้ว\n2. หากคีย์ใหม่แล้วยังติด แสดงว่า **"โปรเจกต์"** ใน AI Studio เต็มแล้ว ให้ลอง **"สร้างโปรเจกต์ใหม่"** ใน AI Studio แล้วเจนคีย์ใหม่จากโปรเจกต์นั้นครับ`);
  }
  throw error;
}
