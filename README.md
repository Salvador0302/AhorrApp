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

3. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

> **Nota**: La API key de Google Gemini ya está incluida directamente en el código para facilitar el desarrollo.

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

La aplicación utiliza Google Gemini para el análisis de imágenes y el asistente conversacional. El servicio `geminiService.ts` ofrece varias funciones:

- `queryImage`: Analiza una imagen con un prompt específico
- `queryMultipleImages`: Analiza múltiples imágenes juntas
- `chatWithGemini`: Envía un mensaje de texto al modelo conversacional

La API key está incluida directamente en el código para simplificar el proceso de desarrollo.

## Licencia

MIT