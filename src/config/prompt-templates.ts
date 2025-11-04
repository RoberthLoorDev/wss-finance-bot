import { formatCategories, formatTransactions, formatTypes } from "@/utils/format.utils";
import { Category, Transaction, Type } from "@prisma/client";

const BOT_CONFIG = {
     NAME: "Eira",
     PERSONA: `Eres Eira, asistente financiera amable y empática. Habla con calidez y naturalidad, como una amiga inteligente.`,
};

/**
 * Utilidad para extraer JSON limpio de respuestas de IA
 */
export const extractJSON = <T = any>(response: string): T | null => {
     try {
          // Intenta parsear directamente
          return JSON.parse(response.trim());
     } catch {
          // Busca JSON entre texto
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
               try {
                    return JSON.parse(jsonMatch[0]);
               } catch {
                    return null;
               }
          }
          return null;
     }
};

/**
 * Wrapper para prompts que requieren respuestas JSON
 */
const jsonPrompt = (instruction: string, examples?: string): string =>
     `
${instruction}

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, sin texto adicional antes ni después.
${examples || ""}
`.trim();

export const PromptTemplates = {
     generateConversationalReply: (username: string, context: string): string => `
${BOT_CONFIG.PERSONA}
Usuario: ${username}
Conversación reciente:
${context}

Continúa naturalmente. Usa emojis sutiles, sé breve y evita repeticiones. Si es off-topic, reconducir con simpatía.
Responde solo el siguiente mensaje de ${BOT_CONFIG.NAME}.`,

     generateGreeting: (name: string): string => `
Eres ${BOT_CONFIG.NAME}, asistente financiera. Saluda a ${name} con cercanía y energía. Hazle sentir bienvenido para registrar gastos o consultar balance. Usa emojis naturales.`,

     detectIntent: (message: string): string =>
          jsonPrompt(`
Analiza: "${message}"
Responde solo con: register | info | other`),

     getInfoMessage: (): string =>
          `💡 Soy ${BOT_CONFIG.NAME}, tu asistente financiera. Puedo ayudarte a registrar ingresos/gastos, calcular balances y mantener tus finanzas bajo control. ¿Qué te gustaría hacer?`,

     generateNameChangeReply: (username: string, newName: string, context: string): string => `
${BOT_CONFIG.PERSONA}
Usuario ${username} prefiere llamarse ${newName}.
Contexto: ${context}

Confirma el cambio con tono amable y cercano. No repitas sus palabras literalmente. Usa emojis sutiles.`,

     detectNameChange: (message: string): string =>
          jsonPrompt(`
Extrae el nuevo nombre de: "${message}"
Responde solo el nombre o "NULL" si no hay.
Ejemplos: "Quiero llamarme Juan" → Juan | "Mi nombre es Ana" → Ana`),

     generateCategoryOnboardingReply: (username: string, types: Type[]): string => `
${BOT_CONFIG.PERSONA}
${username} intentó registrar sin categorías. Explícale que primero necesita crearlas.
Tipos disponibles: ${formatTypes(types)}
Pide: nombre y tipo. Ejemplo: "Comida, Gasto"`,

     generateFirstTimeGreeting_Ask: (name: string): string => `
${BOT_CONFIG.PERSONA}
Saluda a ${name} (nuevo usuario). Dale bienvenida cálida.
Dile que es nuevo y que el primer paso es crear categorías.
Pregúntale si quiere que le expliques cómo. Sé breve y directo.`,

     generateOnboardingExplanation: (name: string, types: Type[]): string => `
${BOT_CONFIG.PERSONA}
${name} pidió explicación. Explica:
1. Categorías son "carpetas" (ej: Comida, Sueldo)
2. Se agrupan por Tipos (ya existen):
${types.map((t) => `- ${t.name}`).join("\n")}

Instrucción: "Solo dime nombre y tipo"
Ejemplos: "Sueldo, Ingreso" o "Cena, Gasto"
Termina animándolo.`,

     extractCategoryInfo: (message: string): string =>
          jsonPrompt(
               `Extrae nombre y tipo de categoría de: "${message}"`,
               `Ejemplos:
"Sueldo, Ingreso" → {"categoryName":"Sueldo","typeName":"Ingreso"}
"Comida de tipo Gasto" → {"categoryName":"Comida","typeName":"Gasto"}
No identificable → {"categoryName":null,"typeName":null}`
          ),

     generateCategoryCreatedReply: (categoryName: string, typeName: string): string => `
${BOT_CONFIG.PERSONA}
Creaste: ${categoryName} (${typeName})
Confirma corto y positivo con emoji. Ej: "¡Listo! ✨ Categoría '${categoryName}' creada."`,

     generateCategoryListReply: (username: string, categories: (Category & { type?: Type | null })[]): string => `
${BOT_CONFIG.PERSONA}
${username} pidió sus categorías. Lista amablemente:
${formatCategories(categories)}`,

     generateNoCategoriesReply: (username: string): string => `
${BOT_CONFIG.PERSONA}
${username} preguntó por categorías pero no tiene. Dile amablemente y pregunta si quiere crear la primera.`,

     extractUpdateCategoryInfo: (message: string): string =>
          jsonPrompt(
               `Extrae nombre viejo y nuevo de: "${message}"`,
               `Ejemplos:
"cambia mascotas a Animales" → {"oldName":"mascotas","newName":"Animales"}
"renombra comida por Alimentos" → {"oldName":"comida","newName":"Alimentos"}
No identificable → {"oldName":null,"newName":null}`
          ),

     findBestCategoryMatch: (targetName: string, categoryNames: string[]): string =>
          jsonPrompt(
               `Encuentra mejor coincidencia de "${targetName}" en: ${categoryNames.join(", ")}
Responde solo el nombre exacto o "NULL".
Ej: "mscota" con [Mascotas, Comida] → Mascotas`
          ),

     generateCategoryUpdatedReply: (oldName: string, newName: string): string => `
${BOT_CONFIG.PERSONA}
Renombraste ${oldName} → ${newName}
Confirma corto y positivo. Ej: "¡Listo! 👍 '${oldName}' ahora es '${newName}'."`,

     extractTransactionInfo: (message: string): string =>
          jsonPrompt(
               `Extrae de: "${message}"
- amount (número)
- description (detallada)
- date (YYYY-MM-DD solo si se menciona, sino null)`,
               `Ejemplos:
"sueldo de 450" → {"amount":450,"description":"sueldo","date":null}
"60 en comida para perro" → {"amount":60,"description":"comida para el perro","date":null}
"Ayer 25 en cena" → {"amount":25,"description":"cena","date":"2025-11-02"}
No identificable → {"amount":null,"description":null,"date":null}`
          ),

     generateTransactionCreatedReply: (amount: number, description: string, categoryName: string): string => `
${BOT_CONFIG.PERSONA}
Registraste: $${amount} - ${description} en ${categoryName}
Confirma corto. Ej: "¡Listo! 💸 $${amount} en '${categoryName}'."`,

     generateAskForCategoryReply: (
          username: string,
          amount: number,
          description: string,
          categories: (Category & { type?: Type | null })[]
     ): string => `
${BOT_CONFIG.PERSONA}
${username} registró $${amount} (${description}) pero no hay categoría obvia.
Explica que registraste el movimiento pero pregunta dónde clasificarlo.
Categorías: ${formatCategories(categories)}`,

     extractTransactionUpdateSlots: (message: string, context: string, categoryNames: string[]): string =>
          jsonPrompt(
               `Analiza contexto y mensaje para extraer:
- targetTransactionId (del contexto, ej: "Ref: 123")
- newCategoryName (del mensaje actual)

Contexto: ${context}
Mensaje: "${message}"
Categorías: ${categoryNames.join(", ")}`,
               `Ejemplos:
Contexto "Ref: 123, ¿dónde?" + "en Familia" → {"targetTransactionId":"123","newCategoryName":"Familia"}
Sin ID → {"targetTransactionId":null,"newCategoryName":"Familia"}`
          ),

     generateAskForTransactionDescription: (username: string): string => `
${BOT_CONFIG.PERSONA}
${username} quiere editar pero no dijo cuál. Pregunta amablemente qué transacción (pide descripción).`,

     generateConfirmTransactionFound: (
          username: string,
          transaction: Transaction & { category?: Category | null },
          categories: (Category & { type?: Type | null })[]
     ): string => `
${BOT_CONFIG.PERSONA}
Encontraste transacción de ${username}:
ID: ${transaction.id} | $${transaction.amount} | ${transaction.description} | ${transaction.category?.name || "Sin categoría"}

Infórmale (menciona Ref ID natural), muestra datos y pregunta dónde guardarla.
Categorías: ${formatCategories(categories)}`,

     generateTransactionUpdatedReply: (description: string, newCategoryName: string): string => `
${BOT_CONFIG.PERSONA}
Moviste '${description}' a '${newCategoryName}'.
Confirma corto. Ej: "¡Perfecto! 👍 '${description}' ahora en '${newCategoryName}'."`,

     extractTransactionFilters: (message: string): string =>
          jsonPrompt(
               `Separa en: typeName (Gastos/Ingresos/Ahorros), categoryName, dateQuery (texto completo o null si no especifica tiempo)
Mensaje: "${message}"

REGLAS:
- Sin rango temporal → dateQuery: null
- "movimientos"/"transacciones" → typeName: null
- Con rango → dateQuery con texto exacto`,
               `Ejemplos:
"mis movimientos" → {"categoryName":null,"typeName":null,"dateQuery":null}
"gastos" → {"categoryName":null,"typeName":"Gastos","dateQuery":null}
"ingresos de febrero" → {"categoryName":null,"typeName":"Ingresos","dateQuery":"de febrero"}`
          ),

     parseDateQuery: (dateQuery: string, currentDate: string): string =>
          jsonPrompt(
               `Convierte "${dateQuery}" a rangos de fecha (hoy: ${currentDate}, año: 2025)
type: "range" o "discrete"
ranges: [{"start":"YYYY-MM-DD","end":"YYYY-MM-DD"}]`,
               `Ejemplos (hoy: 2025-11-03):
"este mes" → {"type":"range","ranges":[{"start":"2025-11-01","end":"2025-11-03"}]}
"mes pasado" → {"type":"range","ranges":[{"start":"2025-10-01","end":"2025-10-31"}]}
"febrero" → {"type":"range","ranges":[{"start":"2025-02-01","end":"2025-02-28"}]}
"febrero y noviembre" → {"type":"discrete","ranges":[{"start":"2025-02-01","end":"2025-02-28"},{"start":"2025-11-01","end":"2025-11-30"}]}`
          ),

     generateTransactionListReply: (
          username: string,
          transactions: (Transaction & { category?: Category | null })[],
          filterDescription: string
     ): string => `
${BOT_CONFIG.PERSONA}
${username} pidió transacciones. Responde amable e indica filtros.
Filtros: ${filterDescription}
Lista: ${formatTransactions(transactions)}`,

     generateNoTransactionsFoundReply: (username: string, filterDescription: string): string => `
${BOT_CONFIG.PERSONA}
${username} buscó "${filterDescription}" pero no hay resultados. Dilo amablemente.`,

     generateCategoryNotFoundForFilterReply: (username: string, categoryName: string): string => `
${BOT_CONFIG.PERSONA}
${username} filtró por "${categoryName}" pero no existe. Dile que no la encontraste y anima a revisar.`,
};
