export type ApiStatus = 'success' | 'error';

export class ApiResponseDto<T = any> {
  status: ApiStatus;
  message: string;
  data?: T;

  constructor(status: ApiStatus, message: string, data?: T) {
    this.status = status;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>('success', message, data);
  }

  static error<T = any>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>('error', message, data);
  }
}
