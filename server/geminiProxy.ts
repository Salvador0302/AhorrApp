import { Express, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

/**
 * Configura rutas de proxy para la API de Gemini
 * Esto permite que la API key se mantenga en el servidor y no se exponga al cliente
 */
export function setupGeminiProxy(app: Express) {
  // Obtener la API key de las variables de entorno
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: VITE_GEMINI_API_KEY no está definida en las variables de entorno');
    return;
  }

  // Inicializar la API de Gemini
  const genAI = new GoogleGenAI(apiKey);

  // Ruta para consultas de texto
  app.post('/api/gemini/text', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Se requiere un mensaje' });
      }

      const model = genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: message }],
      });

      const result = await model;
      return res.json({ response: result.text });
    } catch (error: any) {
      console.error('Error en la API de Gemini:', error);
      return res.status(500).json({ error: error.message || 'Error en la API de Gemini' });
    }
  });

  // Ruta para análisis de imágenes
  app.post('/api/gemini/image', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, promptText } = req.body;
      
      if (!imageBase64 || !mimeType || !promptText) {
        return res.status(400).json({ 
          error: 'Se requieren imageBase64, mimeType y promptText' 
        });
      }

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: promptText },
        ],
      });

      // Extraer JSON si existe en la respuesta
      const rawText = result.text || '';
      let jsonData = null;

      try {
        // Intenta extraer JSON de la respuesta
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         rawText.match(/\{[\s\S]*\}/);
                         
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
        }
      } catch (e) {
        console.warn('Error al parsear JSON de la respuesta:', e);
      }

      return res.json({ 
        rawText, 
        jsonData 
      });
    } catch (error: any) {
      console.error('Error en la API de Gemini:', error);
      return res.status(500).json({ error: error.message || 'Error en la API de Gemini' });
    }
  });

  console.log('Proxy de Gemini configurado correctamente');
}