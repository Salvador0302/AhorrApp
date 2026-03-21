# AhorrApp - Asistente con Gemini

Esta aplicación ayuda a los usuarios a optimizar su consumo eléctrico mediante el análisis inteligente de recibos y electrodomésticos.

## Características

- **Análisis de recibos** utilizando Google Gemini
- **Chatbot inteligente** integrado con la API de Gemini
- **Reconocimiento de etiquetas** de electrodomésticos
- **Recomendaciones personalizadas** para reducir consumo

## Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Salvador0302/AhorrApp.git
   cd AhorrApp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - Copia `.env.sample` a `.env`
   - Añade tu API key de Google Gemini:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

## Integración con Google Gemini

Esta aplicación utiliza Google Gemini para varios fines:

- **Análisis de imágenes** de recibos eléctricos
- **Reconocimiento de etiquetas** de electrodomésticos
- **Asistente virtual** para responder consultas relacionadas con ahorro energético

Los scripts en la carpeta `/scripts` demuestran diferentes maneras de utilizar la API:

- `gemini_inline.mjs`: Combina múltiples imágenes en una consulta
- `gemini_two_queries_sqlite.mjs`: Ejecuta consultas secuenciales guardando los resultados en SQLite
- `query_results_sqlite.mjs`: Consulta los resultados almacenados en la base de datos

## Componentes principales

- `src/components/Assistant.tsx`: Chatbot integrado con Gemini
- `src/components/ImageUploader.tsx`: Componente para subir y analizar imágenes
- `src/services/geminiService.ts`: Servicio para comunicarse con la API de Gemini

## Uso de la API de Gemini

Para hacer solicitudes a la API, utilizamos el servicio `geminiService.ts` que ofrece varias funciones:

- `queryImage`: Analiza una imagen con un prompt específico
- `queryMultipleImages`: Analiza múltiples imágenes juntas
- `chatWithGemini`: Envía un mensaje de texto al modelo conversacional

## Licencia

MIT