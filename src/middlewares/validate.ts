import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
     return (req: Request, res: Response, next: NextFunction) => {
          const result = schema.safeParse(req.body);
          if (!result.success) {
               return res.status(400).json({
                    message: "Datos inválidos",
                    errors: result.error.flatten(),
               });
          }
          // sobre-escribimos el body con los datos parseados/coercidos
          req.body = result.data;
          next();
     };
}

export function validateParams(schema: ZodSchema) {
     return (req: Request, res: Response, next: NextFunction) => {
          const result = schema.safeParse(req.params);
          if (!result.success) {
               return res.status(400).json({
                    message: "Parámetros inválidos",
                    errors: result.error.flatten(),
               });
          }
          req.params = result.data as any;
          next();
     };
}

export function validateQuery(schema: ZodSchema) {
     return (req: Request, res: Response, next: NextFunction) => {
          const result = schema.safeParse(req.query);
          if (!result.success) {
               return res.status(400).json({
                    message: "Query inválida",
                    errors: result.error.flatten(),
               });
          }

          Object.assign(req.query, result.data);

          next();
     };
}
