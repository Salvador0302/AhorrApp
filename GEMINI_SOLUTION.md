# Solución al Problema de API Key de Gemini

## Problema Detectado

Se ha identificado el siguiente problema:

```
Advertencia: no se encontró VITE_GEMINI_API_KEY en las variables de entorno.
Uncaught Error: An API Key must be set when running in a browser
```

Esto ocurre porque la API de Google Gemini requiere una clave API para funcionar en el navegador, y hay restricciones sobre cómo se pueden manejar las claves API en aplicaciones frontend.

## Solución Inmediata

1. **Verifica que el archivo `.env` existe y contiene la variable correcta**:
   ```
   VITE_GEMINI_API_KEY=tu_api_key_aquí
   ```

2. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Si el problema persiste**, prueba una de estas soluciones:

   a. Crea un nuevo archivo `.env.local` con el contenido:
   ```
   VITE_GEMINI_API_KEY=tu_api_key_aquí
   ```

   b. Aplica esta configuración temporal al iniciar el servidor:
   ```bash
   VITE_GEMINI_API_KEY=tu_api_key_aquí npm run dev
   ```

## Solución a Largo Plazo (Recomendada)

Para evitar exponer tu clave API en el frontend, la mejor práctica es crear un servidor proxy:

1. **Instala las dependencias necesarias**:
   ```bash
   npm install express cors dotenv
   npm install -D @types/express @types/cors
   ```

2. **Crea un archivo de servidor**:
   ```bash
   touch server.ts
   ```

3. **Implementa un servidor Express básico**:
   ```typescript
   // server.ts
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import { setupGeminiProxy } from './server/geminiProxy';

   // Cargar variables de entorno
   dotenv.config();

   const app = express();
   const PORT = process.env.PORT || 3001;

   // Middlewares
   app.use(cors());
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ extended: true, limit: '50mb' }));

   // Configurar proxy de Gemini
   setupGeminiProxy(app);

   // Iniciar servidor
   app.listen(PORT, () => {
     console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
   });
   ```

4. **Actualiza el servicio de Gemini para usar el proxy**:

   Actualiza el archivo `src/services/geminiService.ts` para que realice solicitudes a tu servidor proxy en lugar de directamente a la API de Gemini.

5. **Agrega un script para ejecutar el servidor**:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "server": "tsx server.ts",
       "dev:full": "concurrently \"npm run server\" \"npm run dev\""
     }
   }
   ```

6. **Instala las dependencias adicionales**:
   ```bash
   npm install concurrently tsx
   ```

7. **Ejecuta la aplicación completa**:
   ```bash
   npm run dev:full
   ```

De esta manera, tu clave API permanece segura en el servidor y nunca se expone al cliente.

## Nota Importante

Nunca subas tu archivo `.env` con claves API reales a un repositorio público. Asegúrate de que esté incluido en `.gitignore`.