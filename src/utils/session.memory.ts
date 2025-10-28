interface SessionState {
     step: "initial" | "awaiting_name" | "awaiting_age" | "registered";
     tempData?: { name?: string; age?: number };
}

const sessionMemory: Record<string, SessionState> = {};

/**
 * Devuelve el estado actual del usuario o "initial" si no tiene.
 */
export function getSession(chatId: string): SessionState {
     return sessionMemory[chatId] || { step: "initial" };
}

/**
 * Guarda o actualiza el estado del usuario.
 */
export function setSession(chatId: string, state: SessionState) {
     sessionMemory[chatId] = state;
}

/**
 * Limpia la sesión del usuario.
 */
export function clearSession(chatId: string) {
     delete sessionMemory[chatId];
}
