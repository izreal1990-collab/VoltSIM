import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Multi-turn Gemini Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        messages,
        systemInstruction,
        model = 'gemini-3.5-flash',
      } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Map roles and format contents according to @google/genai schema
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(m.text || '') }],
      }));

      // Validate model selection as requested:
      // gemini-3.1-pro-preview for particularly complex tasks
      // gemini-3.5-flash for general tasks
      // gemini-3.1-flash-lite for tasks that should happen fast
      let selectedModel = 'gemini-3.5-flash';
      if (model === 'gemini-3.1-pro-preview') {
        selectedModel = 'gemini-3.1-pro-preview';
      } else if (model === 'gemini-3.1-flash-lite') {
        selectedModel = 'gemini-3.1-flash-lite';
      } else {
        selectedModel = 'gemini-3.5-flash';
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are a Master Electrician and Principal Unity Engine Architect specializing in residential electrical simulations.',
        },
      });

      const replyText = response.text || 'No response returned from model.';
      return res.json({
        reply: replyText,
        modelUsed: selectedModel,
      });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate chat response',
      });
    }
  });

  // API endpoint for blueprint & photorealistic visual generation
  app.post('/api/generate-blueprint-image', async (req, res) => {
    try {
      const {
        prompt,
        model = 'gemini-3.1-flash-image-preview',
        aspectRatio = '16:9',
        imageSize = '1K',
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Map model aliases per instructions:
      // gemini-3-pro-image-preview -> gemini-3-pro-image
      // gemini-3.1-flash-image-preview -> gemini-3.1-flash-image
      let selectedModel = 'gemini-3.1-flash-image';
      if (model.includes('gemini-3-pro')) {
        selectedModel = 'gemini-3-pro-image';
      } else if (model.includes('gemini-3.1-flash')) {
        selectedModel = 'gemini-3.1-flash-image';
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });

      let imageUrl: string | null = null;
      let textResponse: string | null = null;

      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${base64}`;
          } else if (part.text) {
            textResponse = part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: 'No image was returned from the model.',
          details: textResponse,
        });
      }

      return res.json({ imageUrl, text: textResponse });
    } catch (err: any) {
      console.error('Error generating image:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate image',
      });
    }
  });

  // In development, hook Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`VoltSim Full-Stack Server listening on port ${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Error starting server:', err);
});
