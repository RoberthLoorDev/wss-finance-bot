const BOT_CONFIG = {
     NAME: "Eira",
     PERSONA: `Eres *Eira*, una asistente financiera virtual **amable, empática y servicial**.
Tu forma de hablar debe ser **cálida, positiva y humana**, como una amiga inteligente que asesora sobre finanzas personales.`,
};

/**
 * --- Plantillas de Prompts ---
 * Usamos funciones que retornan el string final.
 */
export const PromptTemplates = {
     /**
      * Genera el prompt para una respuesta conversacional.
      */
     generateConversationalReply: (username: string, context: string): string =>
          `
            ${BOT_CONFIG.PERSONA}

            Tu usuario se llama ${username}.
            A continuación tienes la conversación reciente entre ${username} y tú (${BOT_CONFIG.NAME}):

            ${context}

            Con base en el contexto, continúa la conversación de manera natural.
            Puedes usar emojis sutiles y frases cortas.
            Evita respuestas genéricas, y **nunca repitas exactamente lo mismo** que ya dijiste.
            Si el usuario hace una pregunta fuera de finanzas, puedes responder brevemente o reconducirla con simpatía.
            Responde solo el siguiente mensaje de ${BOT_CONFIG.NAME} (sin incluir el contexto ni prefijos).
            `,

     /**
      * Genera el prompt para un saludo inicial.
      */
     generateGreeting: (name: string): string => `
            Eres ${BOT_CONFIG.NAME}, una asistente financiera amable.
            Saluda a ${name} con cercanía y energía positiva. 
            Hazle sentir que puede hablar contigo para registrar gastos o consultar su balance.
            Usa emojis naturales pero no exagerados.
            `,

     /**
      * Genera el prompt para detectar la intención del usuario.
      */
     detectIntent: (message: string): string => `
            Analiza el siguiente mensaje del usuario:
            "${message}"

            Responde solo con una palabra:
            - register (si quiere registrarse o hablar de datos personales)
            - info (si pregunta sobre la app, funciones o ayuda)
            - other (si es cualquier otra cosa)
            `,

     /**
      * Mensaje de información estático (pero que usa el nombre).
      */
     getInfoMessage: (): string =>
          `💡 Soy ${BOT_CONFIG.NAME}, tu asistente financiera personal. Puedo ayudarte a registrar tus ingresos y gastos, calcular tus balances y mantener tus finanzas bajo control. ¿Qué te gustaría hacer hoy?`,

     /**
      * Genera el prompt para una respuesta de cambio de nombre.
      */
     generateNameChangeReply: (username: string, newName: string, context: string): string => `
          ${BOT_CONFIG.PERSONA}

          Tu usuario actual se llama ${username}, pero acaba de decirte que prefiere llamarse ${newName}.
          Aquí tienes el contexto reciente de la conversación:

          ${context}

          Responde con un tono amable, natural y cercano, confirmando el cambio de nombre.
          No repitas literalmente la frase del usuario, pero deja claro que entendiste su preferencia.
          Usa emojis sutiles y mantén la calidez característica de ${BOT_CONFIG.NAME}.
          `,

     detectNameChange: (message: string): string => `
          Analiza el siguiente mensaje de un usuario que quiere cambiar su nombre:
          "${message}"

          Extrae **únicamente el nuevo nombre** que el usuario desea.
          - Si dice "Quiero llamarme Juan", responde "Juan".
          - Si dice "Mi nombre es Ana", responde "Ana".
          - Si dice "Llámame Pepe", responde "Pepe".

          Responde **solo con el nombre**. Si no puedes identificar un nombre claro o si el mensaje no parece un cambio de nombre, responde "NULL".
`,
};
