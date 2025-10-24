import { Response } from "express";

interface ApiResponse<T = any> {
     success: boolean;
     message: string;
     data?: T | null;
}

export function successResponse<T>(res: Response, message: string, data?: T | null, statusCode: number = 200) {
     const body: ApiResponse<T> = { success: true, message, data: data ?? null };
     return res.status(statusCode).json(body);
}

export function errorResponse(res: Response, message: string, statusCode: number = 400, data: any = null) {
     const body: ApiResponse = { success: false, message, data };
     return res.status(statusCode).json(body);
}
