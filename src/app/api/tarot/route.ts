import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import tarotSpreads from '@/data/tarot-spreads.json';

export const runtime = 'nodejs';

type TarotCardInput = {
  card?: {
    name?: string;
    nameCn?: string;
  };
  name?: string;
  nameCn?: string;
  orientation?: string;
  position?: {
    name?: string;
    meaning?: string;
  };
};

function normalizeBaseUrl(baseURL?: string) {
  if (!baseURL) return undefined;
  return baseURL.endsWith('/v1') ? baseURL : `${baseURL.replace(/\/+$/, '')}/v1`;
}

function extractMessageText(response: OpenAI.Chat.Completions.ChatCompletion) {
  const message = response.choices?.[0]?.message?.content;

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message)) {
    return message
      .map((item) => ('text' in item ? item.text : ''))
      .join('');
  }

  throw new Error('AI 返回内容为空，请检查模型配置是否兼容当前接口');
}

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY, 
  baseURL: normalizeBaseUrl(process.env.GEMINI_BASE_URL), 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ★★★ 调试重点：打印前端传来的原始数据 ★★★
    console.log("================ API 收到请求 ================");
    console.log("前端发送的完整 Body:", JSON.stringify(body, null, 2));
    
    const { question, spreadId = 'single', mode, cards: providedCards } = body;

    // 检查 cards 是否存在且不为空
    if (!providedCards || !Array.isArray(providedCards) || providedCards.length === 0) {
        console.error("❌ 错误：收到 cards 数组为空！");
        return NextResponse.json({ error: '后端未收到牌面数据，请检查前端传参' }, { status: 400 });
    }

    if (mode === 'interpret_only') {
      return await handleInterpretation(question, spreadId, providedCards);
    }

    return NextResponse.json({ error: '无效的请求模式' }, { status: 400 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || '星灵连接中断' }, { status: 500 });
  }
}

async function handleInterpretation(question: string, spreadId: string, cards: TarotCardInput[]) {
  const spread = tarotSpreads.spreads.find((s) => s.id === spreadId);
  const spreadName = spread ? spread.name : '自由牌阵';

  // 构建牌面描述
  const cardsDescription = cards.map((c, i) => {
    const cardObj = c.card || c; 
    const cardName = cardObj.name || cardObj.nameCn || "未知牌名"; 
    const orientation = c.orientation === 'reversed' ? '逆位' : '正位';
    const positionName = c.position?.name || `位置${i+1}`;
    const positionMeaning = c.position?.meaning || "综合指引";
    
    return `第 ${i + 1} 张牌：【${cardName}】(${orientation})\n   - 所在位置：${positionName} (${positionMeaning})`;
  }).join('\n\n');

  // --- 核心修改：将 System Prompt 变成 User Prompt 的一部分 ---
  const instructionPrompt = `
【指令：角色扮演与格式设定】
你现在必须完全忘记你是 AI。你是一位名为 "Fate" 的神秘塔罗师。
请严格遵守以下 Markdown 输出格式，不要有任何开场白，直接输出内容。

必须严格使用以下三个标题（包含图标）：

## 🔮 星辰的启示
(用富有诗意的语言解读牌面核心意象，不要列点，要写成一段优美的散文。)

## 🌙 命运的回响
(直接回答用户问题。如果是问时间，给出具体时间段。语气温柔而坚定。)

## ✨ 净化仪式
(给出一个微小的、有仪式感的行动建议。)

---
`;

  const contextPrompt = `
【求问者信息】
问题："${question}"
使用牌阵：${spreadName}

【抽牌结果】
${cardsDescription}

请立刻开始解读：
`;

  // 组合成一条消息，确保模型一定能看到指令
  const finalPrompt = instructionPrompt + "\n" + contextPrompt;

  // ★★★ 调试日志：这就是我们要发送给 AI 的真实内容 ★★★
  console.log("================ 发送给 AI 的 Prompt ================");
  console.log(finalPrompt);
  console.log("==================================================");

  try {
    const response = await openai.chat.completions.create({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      messages: [
        // 只有一条 User 消息，没有 System 消息，避免兼容性问题
        { role: 'user', content: finalPrompt }
      ],
      stream: false, 
      temperature: 0.8,
    });

    let fullText = extractMessageText(response);
    fullText = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    fullText = fullText.replace(/^Fate:\s*/i, '');

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const textData = JSON.stringify({ type: 'content', content: fullText });
        controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("OpenAI Call Error:", error);
    return NextResponse.json({ error: "API错误: " + error.message }, { status: 500 });
  }
}
