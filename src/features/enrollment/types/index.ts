export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  schedule: string;
  maxStudents: number;
  currentStudents: number;
  price: number;
  description: string;
}

export interface CourseListResponse {
  courses: Course[];
}

export interface EnrollmentRequest {
  courseId: string;
  studentName: string;
  email: string;
  phone: string;
  paymentMethod: 'card' | 'transfer' | 'virtual';
}

export interface EnrollmentResponse {
  enrollmentId: string;
  message: string;
  createdAt: string;
}
