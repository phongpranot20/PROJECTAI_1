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
  'gemini-2.0-flash-lite-001', // ตัวนี้เบาและฟรี น่าจะรอด
  'gemini-2.0-flash',          // ตัวรอง
  'gemini-flash-lite-latest',  // ตัวสำรอง
  'gemini-1.5-flash',          // ตัวมาตรฐาน
  'gemini-pro'                 // ตัวสุดท้าย
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

  for (const model of AVAILABLE_MODELS) {
    try {
      console.log(`กำลังลองใช้โมเดล: ${model}...`);
      
      // แอบเทสเงียบๆ ว่าใช้ได้ไหม (ตามแพทเทิร์นที่ผู้ใช้แนะนำ)
      // Note: ใน JS SDK เราจะลองเรียกใช้งานจริงเลย ถ้าพังจะไป catch แล้ว continue
      
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
      console.warn(`โมเดล ${model} พัง ข้ามไปตัวถัดไปเงียบๆ...`);
      lastError = error;
      continue; 
    }
  }

  // ถ้าพังทุกตัว ให้ใช้ตัวแรกวัดดวง (ตามตรรกะผู้ใช้)
  try {
    const fallbackModel = AVAILABLE_MODELS[0];
    const chat = ai.chats.create({
      model: fallbackModel,
      config: { systemInstruction: SYSTEM_INSTRUCTION + langInstruction },
      history: history,
    });
    return await chat.sendMessageStream({ message });
  } catch (finalError) {
    handleGeminiError(lastError || finalError);
  }
}

export async function getChatResponse(message: string, history: any[] = [], imageBase64?: string, mimeType?: string) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ไม่พบ API Key กรุณาตรวจสอบการตั้งค่า Environment Variable (VITE_GEMINI_API_KEY)");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of AVAILABLE_MODELS) {
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
      console.warn(`โมเดล ${model} (Non-stream) พัง ข้ามไปตัวถัดไปเงียบๆ...`);
      continue;
    }
  }

  // ถ้าพังทุกตัว ให้ใช้ตัวแรกวัดดวง
  try {
    const fallbackModel = AVAILABLE_MODELS[0];
    const chat = ai.chats.create({
      model: fallbackModel,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: history,
    });
    return await chat.sendMessage({ message });
  } catch (finalError) {
    handleGeminiError(lastError || finalError);
  }
}

function handleGeminiError(error: any) {
  const errorMsg = error?.message || String(error);
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...` : "ไม่พบคีย์";
  const lastUpdate = "4 เม.ย. 2569 - 22:45 (UTC)"; // เวลาอัปเดตล่าสุด

  if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error(`❌ โควต้าเต็ม (Quota Exceeded)\n\n🕒 เวอร์ชันแอป: ${lastUpdate}\n🔑 คีย์ที่ใช้อยู่: ${maskedKey}\n\n**วิธีแก้ที่ได้ผลที่สุด:**\n1. ไปที่ [AI Studio](https://aistudio.google.com/app/apikey)\n2. กดปุ่ม **"Create API key in new project"** (ห้ามสร้างในโปรเจกต์เดิม)\n3. คัดลอกคีย์ใหม่มาใส่ใน Settings ของแอปนี้\n4. หากยังไม่ได้ ให้ลองสลับไปใช้เน็ตมือถือหรือ VPN เพราะบางครั้ง Google บล็อกที่ IP ครับ`);
  }

  // แจ้ง Error อื่นๆ ตามที่ผู้ใช้ขอ
  throw new Error(`❌ เกิดข้อผิดพลาด: ${errorMsg}\n\n🕒 เวอร์ชันแอป: ${lastUpdate}\n🔑 คีย์ที่ใช้อยู่: ${maskedKey}\n\n**คำแนะนำ:** หากขึ้น 404 แสดงว่าโมเดลตัวนั้นถูกปิดไปแล้ว หรือหากขึ้น 400 แสดงว่ารูปแบบคำถามมีปัญหาครับ`);
}
