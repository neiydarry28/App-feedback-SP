# App Feedback WebPart SPFx

## Español

### Descripción General
Este WebPart avanzado para SharePoint Online, desarrollado con SPFx, permite recolectar, consultar y analizar comentarios de usuarios sobre eventos u otros procesos. Es modular, profesional, reutilizable y fácil de configurar para otros proyectos similares.

### ¿Cómo funciona?
- Los usuarios pueden enviar comentarios a una lista de SharePoint mediante un formulario integrado en el WebPart.
- Un flujo de Power Automate se activa automáticamente al registrar un nuevo comentario en la lista.
- El flujo utiliza Azure Cognitive Services (Azure AI Language) para:
  - Analizar el **sentimiento** del comentario (positivo, negativo, neutral, mixto).
  - Extraer **frases clave** (Key Phrase Extraction) del comentario.
- El flujo actualiza el registro en la lista de SharePoint con los resultados de IA.
- El WebPart consulta la lista y muestra los comentarios, sentimientos y frases clave, permitiendo análisis visuales y filtrado.

### Vistas condicionales y grupo de SharePoint
- El WebPart muestra diferentes vistas según la pertenencia del usuario a un grupo de SharePoint (configurable desde el panel de propiedades):
  - **Usuarios comunes:** Solo pueden ver "Inicio" y "Enviar Comentario".
  - **Miembros del grupo analista:** Acceso adicional a "Consultar Comentarios" y "Dashboard".
- La comprobación de pertenencia al grupo es robusta y compara el loginName del usuario.

### Funcionalidad de registro y consulta
- **Registro:** El formulario del WebPart guarda los comentarios directamente en la lista de SharePoint.
- **Consulta:** Los analistas pueden ver todos los comentarios, filtrarlos por sentimiento y analizar frases clave.

### Campos requeridos en la lista de SharePoint
La lista debe contener al menos los siguientes campos:
- **Title** (Título del comentario)
- **Comment** (Texto del comentario)
- **CreatedBy** (Usuario que registró)
- **Created** (Fecha de registro)
- **Sentiment** (Resultado de análisis de sentimiento por Azure AI Language)
- **KeyPhrases** (Frases clave extraídas por Azure AI Language)
- (Opcional) Otros campos personalizados según necesidades del proyecto

### Bilingüismo
- Todo el WebPart, incluidos textos, panel de propiedades y descripciones de gráficos, está disponible en español e inglés.
- La localización se gestiona mediante archivos en `/loc`.

### División de archivos y arquitectura
- `AppFeedbackWebPart.ts`: lógica principal y renderizado del WebPart.
- `AppFeedbackRenderUtils.ts`: utilidades para renderizado de HTML.
- `AppFeedbackUtils.ts`: lógica de negocio y operaciones CRUD con SharePoint.
- `AppFeedbackWebPart.module.scss`: estilos en SCSS.
- `IAppFeedbackWebPartProps.ts`: definición de propiedades configurables.
- `/loc/en-us.js` y `/loc/es-es.js`: archivos de localización bilingüe.

### Uso de Chart.js y gráficos
- Integración con Chart.js (como librería externa) para mostrar:
  - **Gráfico de dona:** distribución de sentimientos.
  - **Barras:** evolución mensual de comentarios.
  - **Líneas:** volumen de comentarios en el tiempo.
  - **Barras horizontales:** frases clave más frecuentes.
- Los gráficos se actualizan dinámicamente con los datos de SharePoint y solo se carga Chart.js una vez.
- Todas las descripciones y leyendas de los gráficos son bilingües.

### Beneficios y áreas de aplicación
- **Beneficios:**
  - Permite obtener feedback estructurado y analizado automáticamente.
  - Facilita la toma de decisiones basada en datos y sentimientos reales de los usuarios.
  - Modularidad y facilidad de reutilización en otros proyectos.
  - Integración nativa con herramientas de Microsoft 365 y Azure.
- **Áreas de aplicación:**
  - Eventos corporativos, capacitaciones, encuestas de satisfacción, gestión de incidencias, mejora continua, etc.

---

## English

### Overview
This advanced WebPart for SharePoint Online, built with SPFx, enables the collection, consultation, and analysis of user feedback on events or other processes. It is modular, professional, reusable, and easy to configure for similar projects.

### How does it work?
- Users can submit comments to a SharePoint list via an integrated form in the WebPart.
- A Power Automate flow is automatically triggered when a new comment is registered in the list.
- The flow uses Azure Cognitive Services (Azure AI Language) to:
  - Analyze the **sentiment** of the comment (positive, negative, neutral, mixed).
  - Extract **key phrases** (Key Phrase Extraction) from the comment.
- The flow updates the SharePoint list item with the AI results.
- The WebPart queries the list and displays comments, sentiments, and key phrases, enabling visual analysis and filtering.

### Conditional views and SharePoint group
- The WebPart displays different views based on the user's membership in a SharePoint group (configurable from the property pane):
  - **Regular users:** Only see "Home" and "Submit Feedback".
  - **Analyst group members:** Additional access to "Consult Feedback" and "Dashboard".
- Group membership check is robust and compares the user's loginName.

### Registration and consultation functionality
- **Registration:** The WebPart form saves comments directly to the SharePoint list.
- **Consultation:** Analysts can view all comments, filter by sentiment, and analyze key phrases.

### Required fields in the SharePoint list
The list must contain at least the following fields:
- **Title** (Comment title)
- **Comment** (Comment text)
- **CreatedBy** (User who registered)
- **Created** (Registration date)
- **Sentiment** (Sentiment analysis result by Azure AI Language)
- **KeyPhrases** (Key phrases extracted by Azure AI Language)
- (Optional) Other custom fields as needed

### Bilingual support
- The entire WebPart, including texts, property pane, and chart descriptions, is available in Spanish and English.
- Localization is managed via `/loc` files.

### File structure and architecture
- `AppFeedbackWebPart.ts`: main logic and rendering of the WebPart.
- `AppFeedbackRenderUtils.ts`: HTML rendering utilities.
- `AppFeedbackUtils.ts`: business logic and CRUD operations with SharePoint.
- `AppFeedbackWebPart.module.scss`: SCSS styles.
- `IAppFeedbackWebPartProps.ts`: definition of configurable properties.
- `/loc/en-us.js` and `/loc/es-es.js`: bilingual localization files.

### Chart.js usage and charts
- Integration with Chart.js (as an external library) to display:
  - **Doughnut chart:** sentiment distribution.
  - **Bar chart:** monthly evolution of comments.
  - **Line chart:** comment volume over time.
  - **Horizontal bar chart:** most frequent key phrases.
- Charts update dynamically with SharePoint data and Chart.js is loaded only once.
- All chart descriptions and legends are bilingual.

### Benefits and application areas
- **Benefits:**
  - Enables structured and automatically analyzed feedback collection.
  - Facilitates data-driven decision making based on real user sentiment.
  - Modularity and ease of reuse in other projects.
  - Native integration with Microsoft 365 and Azure tools.
- **Application areas:**
  - Corporate events, trainings, satisfaction surveys, incident management, continuous improvement, etc.

---

> **Nota / Note:**
> Este WebPart requiere la configuración de un flujo de Power Automate que utilice Azure AI Language para análisis de sentimiento y extracción de frases clave. El flujo debe actualizar los registros de la lista de SharePoint con los resultados de IA para que el WebPart pueda visualizarlos correctamente.

# app-feedback

## Summary

Short summary on functionality and used technologies, holis.

[picture of the solution in action, if possible]

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Any special pre-requisites?

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| folder name | Author details (name, company, twitter alias with link) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

- topic 1
- topic 2
- topic 3

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
