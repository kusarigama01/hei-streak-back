import type { Request, Response } from "express";
import { asyncHandler, getIdParam } from "./asyncHandler.js";
import { StudentService } from "../Service/StudentService.js";

export const listStudents = asyncHandler(async (_req: Request, res: Response) => {
  const students = await StudentService.list();
  res.status(200).json(students);
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ message: "email, name and password are required" });
    return;
  }
  const student = await StudentService.create(email, name, password);
  res.status(201).json(student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const student = await StudentService.update(getIdParam(req), email, name, password);
  res.status(200).json(student);
});

export const deactivateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await StudentService.deactivate(getIdParam(req));
  res.status(200).json(student);
});