# AhorrApp - IA para ahorro energetico en Peru

AhorrApp es un MVP para hackathon que combate la falta de transparencia en los recibos electricos en Peru.

Objetivo: traducir datos tecnicos complejos en decisiones simples para que los hogares reduzcan consumo, gasto y huella de carbono.

## Caracteristicas

- Analisis de recibos con OCR asistido por Gemini
- Asistente inteligente personalizado segun consumo y aparatos
- Recomendaciones accionables y proyecciones de ahorro
- Registro de electrodomesticos por foto o carga manual
- Vampire Scanner (IA Vision + ROI de reemplazo)
- Green Tokens (mint simulado en Base/Polygon por reduccion validada de kWh)

## Problema que resuelve

Muchas familias reciben facturas con bajo nivel de detalle util para tomar decisiones.

Sin visibilidad clara, es dificil saber:
- Que equipos disparan el consumo
- Si los habitos de ahorro realmente funcionan
- Cuando conviene reemplazar un equipo antiguo

## Funcionalidades del MVP

### 1) Vampire Scanner (IA Vision)

- Entrada: foto de la placa tecnica o del equipo.
- Motor: Gemini 1.5 Flash via API con prompt multimodal.
- Salida IA:
   - Categoria del equipo
   - Edad estimada
   - Consumo promedio en Watts
- Comparativa: equipo actual vs alternativa moderna Energy Star A++.
- ROI:

$$ROI (meses) = \frac{Costo\ del\ nuevo\ equipo}{Ahorro\ mensual\ (S/.)}$$

### 2) Protocolo Green Tokens

- Validacion: si OCR detecta reduccion de kWh respecto al periodo anterior.
- Mecania de contrato (simulada en MVP): ejecuta mint() de GTKN.
- Red L2: Base o Polygon.
- Utilidad:
   - B2C: canje por merch o beneficios del dashboard
   - B2B: compra de GTKN para compensacion local de huella (offsetting descentralizado)

### 3) Asistente de ahorro

- Chat contextual con datos de recibo y electrodomesticos.
- Explica consumos, identifica riesgos y propone acciones concretas.

## Configuracion

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

> Nota: para un entorno real, mover la API key a variables de entorno y backend.

## Integracion con Google Gemini

Esta aplicación utiliza Google Gemini para varios fines:

- Analisis de imagenes de recibos electricos
- Reconocimiento de electrodomesticos
- Scanner multimodal para deteccion de consumo fantasma (Vampire Scanner)
- Asistente virtual conversacional de ahorro energetico

Los scripts en la carpeta `/scripts` demuestran diferentes maneras de utilizar la API:

- `gemini_inline.mjs`: Combina múltiples imágenes en una consulta
- `gemini_two_queries_sqlite.mjs`: Ejecuta consultas secuenciales guardando los resultados en SQLite
- `query_results_sqlite.mjs`: Consulta los resultados almacenados en la base de datos

## Componentes principales

- src/components/ImageUploader.tsx
- src/components/ReceiptScreen.tsx
- src/components/AppliancesScreen.tsx
- src/components/HomeScreen.tsx
- src/services/geminiService.ts
- src/services/vampireScannerService.ts
- src/services/greenTokenService.ts

## Uso de la API de Gemini

La aplicacion utiliza Google Gemini para analisis de imagenes y asistente conversacional. El servicio geminiService.ts ofrece varias funciones:

- queryImage: analiza imagen con prompt
- queryMultipleImages: procesa multiples imagenes en una consulta
- chatWithGemini: responde mensajes del usuario

## Alcance del hackathon

Durante el hackathon, el objetivo es validar que la combinacion de IA + UX:
- mejora comprension del recibo,
- conecta acciones con impacto medible,
- y crea incentivos de ahorro sostenibles mediante Green Tokens.

## Licencia

MIT
 