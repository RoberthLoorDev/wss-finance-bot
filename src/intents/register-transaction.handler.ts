export class RegisterTransactionHandler /*implements IIntentHandler*/ {
     async execute(user: any, text: string, context: string) {
          const reply =
               "¡Ups! 😅 Todavía estoy aprendiendo a registrar transacciones. ¡Pronto podré hacerlo! Por ahora, ¿puedo ayudarte en algo más?";

          return { reply };
     }
}
