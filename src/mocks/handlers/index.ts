import { courseHandlers } from './course';
import { enrollmentHandlers } from './enrollment';

export const handlers = [...courseHandlers, ...enrollmentHandlers];
