import { CreateTransactionSchema } from "@/schemas/transaction.schema";
import { TransactionService } from "@/services/transactions.service";
import { Request, Response } from "express";
import { ZodError } from "zod";

export class TransactionsController {
     private service = new TransactionService();

     // POST /api/transactions
     async create(req: Request, res: Response) {
          try {
               const body = CreateTransactionSchema.parse(req.body);

               const transaction = await this.service.create({
                    user: { connect: { id: body.user_id } },
                    category: body.category_id ? { connect: { id: body.category_id } } : undefined,
                    amount: body.amount,
                    description: body.description ?? "",
                    date: body.date ?? new Date(),
               });

               return res.status(201).json({
                    success: true,
                    message: "Transacción registrada correctamente",
                    data: transaction,
               });
          } catch (error: any) {
               if (error instanceof ZodError) {
                    return res.status(400).json({
                         success: false,
                         message: "Datos inválidos",
                         data: error.issues.map((i) => ({
                              path: i.path.join("."),
                              message: i.message,
                         })),
                    });
               }

               if (error.code === "P2025") {
                    return res.status(404).json({
                         success: false,
                         message: "Usuario o categoría no existente",
                         data: null,
                    });
               }

               console.error("❌ Error al crear transacción:", error);
               return res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                    data: null,
               });
          }
     }

     // GET /api/transactions?user_id=1
     async getAll(req: Request, res: Response) {
          try {
               const userId = BigInt(req.query.user_id as string);
               const transactions = await this.service.findAllByUser(userId);
               return res.status(200).json({
                    success: true,
                    message: "Transacciones obtenidas correctamente",
                    data: transactions,
               });
          } catch (error) {
               return res.status(400).json({
                    success: false,
                    message: "user_id inválido o faltante",
                    data: null,
               });
          }
     }

     // GET /api/transactions/:id
     async getById(req: Request, res: Response) {
          try {
               const id = BigInt(req.params.id);
               const transaction = await this.service.findById(id);
               if (!transaction) {
                    return res.status(404).json({
                         success: false,
                         message: "Transacción no encontrada",
                         data: null,
                    });
               }
               return res.status(200).json({
                    success: true,
                    message: "Transacción obtenida correctamente",
                    data: transaction,
               });
          } catch {
               return res.status(400).json({
                    success: false,
                    message: "ID inválido",
                    data: null,
               });
          }
     }

     // DELETE /api/transactions/:id
     async delete(req: Request, res: Response) {
          try {
               const id = BigInt(req.params.id);
               const deleted = await this.service.delete(id);
               return res.status(200).json({
                    success: true,
                    message: "Transacción eliminada correctamente",
                    data: deleted,
               });
          } catch (error) {
               return res.status(400).json({
                    success: false,
                    message: "Error al eliminar transacción",
                    data: null,
               });
          }
     }
}
