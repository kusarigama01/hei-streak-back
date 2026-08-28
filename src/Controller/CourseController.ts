import type { Request, Response } from "express";
import { asyncHandler, getIdParam } from "./asyncHandler.js";
import { CourseService } from "../Service/CourseService.js";

export const listCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await CourseService.list();
  res.status(200).json(courses);
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const { code, name, description } = req.body;
  if (!code || !name) {
    res.status(400).json({ message: "code and name are required" });
    return;
  }
  const course = await CourseService.create(code, name, description);
  res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { code, name, description } = req.body;
  const course = await CourseService.update(getIdParam(req), code, name, description);
  res.status(200).json(course);
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  await CourseService.remove(getIdParam(req));
  res.status(200).json({ message: "Course deleted" });
});
