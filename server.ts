import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if key is available
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for AI Word Insights, clues, and mnemonics
app.post('/api/word-insights', async (req: Request, res: Response) => {
  const { word, mode = 'overview' } = req.body;

  if (!word || typeof word !== 'string' || word.trim().length !== 5) {
    return res.status(400).json({ error: 'Valid 5-letter word required' });
  }

  const cleanWord = word.trim().toUpperCase();

  if (!ai) {
    return res.json({
      word: cleanWord,
      hint: `A 5-letter word beginning with '${cleanWord[0]}' and ending with '${cleanWord[4]}'.`,
      mnemonic: `Remember it by the distinct pattern: ${cleanWord.split('').join('-')}.`,
      etymology: `Derived from standard English lexicon, recognized in major tournament dictionaries.`,
      sentence: `Mastering '${cleanWord}' improves your 5-letter word game repertoire.`
    });
  }

  try {
    const prompt = `You are an expert lexicographer and word game strategist for Wordle, Scrabble, and crosswords.
Analyze this 5-letter English word: "${cleanWord}".
Respond with a strict JSON object with these keys:
{
  "hint": "A clever, cryptic-yet-solvable Wordle/crossword clue (do NOT give away the exact word)",
  "mnemonic": "A memorable memory trick, visual rhyme, or association hook to recall this word",
  "etymology": "A brief, fascinating 1-2 sentence origin story or linguistic history of the word",
  "funFact": "An interesting trivia fact about this word in Scrabble, Wordle, or English usage"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      word: cleanWord,
      hint: parsed.hint || `A 5-letter word starting with ${cleanWord[0]}`,
      mnemonic: parsed.mnemonic || `Think of: ${cleanWord}`,
      etymology: parsed.etymology || `Historical English root.`,
      funFact: parsed.funFact || `Scrabble points and tournament valid.`
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.json({
      word: cleanWord,
      hint: `A 5-letter word starting with '${cleanWord[0]}'`,
      mnemonic: `Pattern: ${cleanWord.split('').join(' ')}`,
      etymology: `Standard English dictionary entry.`,
      funFact: `High strategic value in five-letter word games.`
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
