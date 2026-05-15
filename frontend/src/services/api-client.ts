import axios, { type AxiosError } from 'axios';
import { APP_CONFIG } from '@/lib/constants';

/**
 * ตัวจัดการ HTTP client กลางของระบบ
 * API ทุกตัวจะถูกเรียกผ่าน instance นี้เพื่อให้:
 * - จัดการ Base URL และ Auth header (API Key) ได้จากที่เดียว
 * - มีระบบจัดการ Error ส่วนกลาง (Interceptor)
 * - สามารถเปลี่ยน Backend ได้ง่ายในอนาคต
 */
export const http = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
  headers: {
    'x-api-key': APP_CONFIG.api.key,
  },
  timeout: 15_000,
});

// Interceptor ขาตอบกลับ — จัดรูปแบบ Error ให้อ่านง่ายขึ้น
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';

    // ส่ง Error กลับไปพร้อมข้อความที่อ่านง่ายขึ้นสำหรับให้ UI นำไปใช้
    return Promise.reject(new Error(message));
  },
);
