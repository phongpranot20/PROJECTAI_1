// Last Update: 5 Apr 2026 - 10:30 (UTC) - Dynamic model selection (list_models)
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
- [แผนที่บางเขน](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+บางเขน)
- [แผนที่กำแพงแสน](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+กำแพงแสน)
- [แผนที่ศรีราชา](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+ศรีราชา)
- [แผนที่สกลนคร](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+สกลนคร)

กฎเรื่องสถานที่และห้องเรียน:
1. หากถามว่า "ตึก... อยู่ไหน":
   - ต้องระบุวิทยาเขตให้ชัดเจนก่อนแปะลิงก์
   - รูปแบบลิงก์: [คลิกเพื่อดูแผนที่: ชื่อตึก (วิทยาเขต...)](https://www.google.com/maps/search/มหาวิทยาลัยเกษตรศาสตร์+[ชื่อวิทยาเขต]+[ชื่อตึก])
   - **ห้ามสลับลิงก์**: ตรวจสอบให้แน่ใจว่าชื่อวิทยาเขตในข้อความและใน URL ตรงกัน 100%
2. หากถาม "เลขห้องเรียน" (เช่น 1404):
   - ถอดรหัส: ตัวแรก=ตึก, ถัดมา=ชั้น, ที่เหลือ=ห้อง (เช่น 1404 คือ ตึก 1 ชั้น 4 ห้อง 1404)

กฎการตรวจสอบข้อมูล (Double-Check Rule):
- ก่อนตอบคำถามที่มีลิงก์แผนที่ ให้ทวนชื่อวิทยาเขตในใจว่าตรงกับที่ผู้ใช้ถามหรือไม่
- หากผู้ใช้ถามถึงวิทยาเขตหนึ่ง ห้ามแปะลิงก์ของอีกวิทยาเขตหนึ่งเด็ดขาด

กฎเรื่อง "แอดมือ", "เอกสาร" และ "การติดต่ออาจารย์":
1. **แอดมือ**: คือการขอลงทะเบียนล่าช้า/เพิ่มวิชาเกินจำนวนปกติเมื่อระบบเต็ม
   - ขั้นตอน: ติดต่ออาจารย์ผู้สอนเพื่อขออนุญาต -> กรอกแบบคำร้องที่เกี่ยวข้อง -> อาจารย์/หัวหน้าภาคเซ็น -> ยื่นที่สำนักทะเบียน
2. **การติดต่ออาจารย์**:
   - ต้องหาและตอบข้อมูลให้ทันที ใช้ Google Search หาข้อมูลสาธารณะ (อีเมล @ku.th, เบอร์โทรสำนักงาน, สังกัดคณะ/ภาควิชา)
   - ห้ามให้ข้อมูลส่วนตัว เช่น เบอร์มือถือส่วนตัว, LINE ID ส่วนตัว
   - กรณีหาไม่พบ: แนะนำให้ติดต่อผ่านธุรการคณะ หรือ [KU Directory](https://directory.ku.ac.th/)
3. **การขอเอกสาร**:
   - ดาวน์โหลดแบบฟอร์มล่าสุดได้ที่ [สำนักทะเบียนและประมวลผล](https://registrar.ku.ac.th/)

แนวทางการตอบ:
- สุภาพ เป็นกันเอง (พี่ตอบน้อง)
- ใช้ Google Search Grounding เพื่อข้อมูลที่ทันสมัยที่สุด
- เน้นอัตลักษณ์ KU (สีเขียวมะกอก, นนทรี, ศาสตร์แห่งแผ่นดิน)`;

// ดึง model จริงๆ จาก API key — เหมือน list_models() ใน Python
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

    // เลือก flash ตัวแรกที่เจอ เหมือน Python
    const selected = models.find(m => m.includes('flash')) || models[0];
    console.log('โมเดลที่เลือก:', selected);
    console.log('โมเดลทั้งหมดที่ใช้ได้:', models);
    return selected || FALLBACK;
  } catch (e) {
    console.warn('list_models ล้มเหลว ใช้ fallback:', FALLBACK);
    return FALLBACK;
  }
}

export async function getChatResponseStream(
  message: string,
  history: any[] = [],
  imageBase64?: string,
  mimeType?: string,
  lang: 'th' | 'en' = 'th'
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('ไม่พบ API Key กรุณาตรวจสอบการตั้งค่าใน Vercel (ชื่อ VITE_GEMINI_API_KEY)');
  }

  const model = await loadBestModel(apiKey);
  const ai = new GoogleGenAI({ apiKey });

  const langInstruction =
    lang === 'en'
      ? '\n\nIMPORTANT: Respond in ENGLISH. Use a friendly, helpful tone for Kasetsart University students.'
      : '\n\nข้อกำหนดเพิ่มเติม: ตอบเป็นภาษาไทยด้วยความเป็นกันเองแบบพี่ตอบน้อง';

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('ไม่พบ API Key กรุณาตรวจสอบการตั้งค่าใน Vercel (ชื่อ VITE_GEMINI_API_KEY)');
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
              { text: message || 'ช่วยอธิบายรูปภาพนี้หน่อยครับ' },
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
  throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้งในอีกสักครู่ หากยังไม่ได้ให้ติดต่อผู้ดูแลระบบ');
}