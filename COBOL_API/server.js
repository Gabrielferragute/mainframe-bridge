import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.GEMINI_API_KEY;
if (key) {
  console.log(`--- DEBUG CHAVE: ${key.substring(0, 6)}...${key.substring(key.length - 4)} (Tamanho: ${key.length})`);
} else {
  console.error('--- ERRO: GEMINI_API_KEY NÃO ENCONTRADA!');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;

// ─── Prompts separados para respostas menores e mais confiáveis ───

const PROMPT_CODE = `Você é um especialista sênior em modernização de Mainframe COBOL.
Analise o COPYBOOK COBOL e gere ESTRITAMENTE um JSON com estas 3 chaves:

1. "typescript": Interface TypeScript completa. camelCase, nível 88 = Union Literal Type, COMP-3 = number, OCCURS = Array<T>, REDEFINES = propriedade separada.

2. "jsonSchema": JSON Schema draft-07 como STRING (não como objeto). Com type, properties, required.

3. "zod": Código Zod completo como STRING. Use z.object(), z.string(), z.number(), z.array(), z.literal(), z.union(). Export const e export type.

Retorne APENAS o JSON. Sem markdown. Sem explicações.`;

const PROMPT_ANALYSIS = `Você é um especialista sênior em modernização de Mainframe COBOL.
Analise o COPYBOOK COBOL e gere ESTRITAMENTE um JSON com estas 3 chaves:

1. "semanticMap": Array de objetos com: {"cobolName":"NOME","modernName":"nomeModerno","type":"string|number|array|object","size":N,"offset":N,"description":"descrição curta em PT-BR"}.

2. "hierarchy": Objeto representando a árvore: {"name":"nome","level":N,"pic":"PIC clause ou null","children":[...]}. Nível 88 = filho do campo pai.

3. "documentation": String com resumo curto: nome do copybook, lista de campos principais com tipo e tamanho, e observações sobre COMP-3/REDEFINES/OCCURS. Máximo 20 linhas. Sem tabelas markdown.

Retorne APENAS o JSON. Sem markdown. Sem explicações.`;

// ─── Extrator robusto de JSON ───
// Encontra o primeiro objeto JSON { ... } completo no texto,
// ignorando qualquer lixo antes ou depois.
function extractJSON(text) {
  const start = text.indexOf('{');
  if (start === -1) throw new Error('Nenhum JSON encontrado na resposta');

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const c = text[i];

    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) {
        const jsonStr = text.substring(start, i + 1);
        return JSON.parse(jsonStr);
      }
    }
  }

  // Se chegou aqui, o JSON está incompleto — tenta reparar
  console.log('⚠ JSON incompleto, tentando reparar...');
  let partial = text.substring(start);
  
  // Remove vírgula final
  partial = partial.replace(/,\s*$/, '');
  
  // Conta e fecha aspas, colchetes e chaves
  let qCount = 0;
  let braces = 0;
  let brackets = 0;
  let inStr = false;
  for (let i = 0; i < partial.length; i++) {
    const c = partial[i];
    if (c === '\\' && inStr) { i++; continue; }
    if (c === '"') { inStr = !inStr; qCount++; continue; }
    if (inStr) continue;
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '[') brackets++;
    if (c === ']') brackets--;
  }
  if (qCount % 2 !== 0) partial += '"';
  for (let i = 0; i < brackets; i++) partial += ']';
  for (let i = 0; i < braces; i++) partial += '}';

  return JSON.parse(partial);
}

// ─── Função de chamada ao Gemini (com retry automático) ───

const MAX_RETRIES = 3;

async function callGemini(prompt, cobolCode, attempt = 1) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ 
        parts: [{ text: `${prompt}\n\nCódigo COBOL:\n${cobolCode}` }] 
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 65536
      }
    })
  });

  // Retry automático para 503 (sobrecarga) e 429 (rate limit)
  if ((response.status === 503 || response.status === 429) && attempt <= MAX_RETRIES) {
    const waitSec = attempt * 3; // 3s, 6s, 9s
    console.log(`   ⏳ Tentativa ${attempt}/${MAX_RETRIES} falhou (${response.status}). Aguardando ${waitSec}s...`);
    await new Promise(r => setTimeout(r, waitSec * 1000));
    return callGemini(prompt, cobolCode, attempt + 1);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API do Google (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  
  // Verifica se a resposta foi truncada
  const finishReason = result.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== 'STOP') {
    console.warn(`⚠ finishReason: ${finishReason} (resposta pode estar incompleta)`);
  }

  const rawText = result.candidates[0].content.parts[0].text;
  console.log(`   ↳ ${rawText.length} caracteres recebidos (finishReason: ${finishReason || 'STOP'})${attempt > 1 ? ` [tentativa ${attempt}]` : ''}`);
  
  // Extrai o primeiro objeto JSON completo da resposta
  return extractJSON(rawText);
}

// ─── Endpoint principal ───

app.post('/api/convert', async (req, res) => {
  try {
    const { cobolCode } = req.body;

    if (!cobolCode || !cobolCode.trim()) {
      return res.status(400).json({ error: 'O campo cobolCode é obrigatório.' });
    }

    console.log('--- Processando conversão (2 chamadas paralelas)...');
    
    // Executa as duas chamadas em paralelo para velocidade
    const [codeResult, analysisResult] = await Promise.all([
      callGemini(PROMPT_CODE, cobolCode),
      callGemini(PROMPT_ANALYSIS, cobolCode),
    ]);

    console.log('✓ Ambas as respostas recebidas com sucesso!');

    res.json({
      typescript: codeResult.typescript || '',
      jsonSchema: typeof codeResult.jsonSchema === 'string' 
        ? codeResult.jsonSchema 
        : JSON.stringify(codeResult.jsonSchema, null, 2),
      zod: codeResult.zod || '',
      semanticMap: analysisResult.semanticMap || [],
      hierarchy: analysisResult.hierarchy || {},
      documentation: analysisResult.documentation || '',
    });
  } catch (error) {
    console.error('ERRO DETALHADO NO BACKEND:', error);

    if (error.message && error.message.includes('429')) {
      return res.status(429).json({ error: 'Cota da API Gemini excedida. Aguarde alguns segundos e tente novamente.' });
    }

    if (error.message && (error.message.includes('API key not valid') || error.message.includes('invalid'))) {
      return res.status(500).json({ error: 'Chave da API Gemini inválida ou expirada.' });
    }

    res.status(500).json({ 
      error: 'Falha no processamento.',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mainframe Bridge v3.0 rodando na porta ${PORT}`);
  console.log(`   Saídas: TypeScript | JSON Schema | Zod | Mapeamento | Hierarquia | Docs`);
  console.log(`   Estratégia: 2 chamadas paralelas para máxima confiabilidade`);
});
