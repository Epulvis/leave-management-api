export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default class ApiResponse {
  /**
    Menggunakan Generic <T> untuk tipe Data, dan <M> untuk tipe Meta
    T diatur ke 'any' sebagai default fallback jika tidak diisi eksplisit
   **/
  public static success<T = any, M = PaginationMeta>(message: string, data: T, meta?: M) {
    const response = {
      success: true,
      message,
      data,
      errors: null,
    };
    
    return meta ? { ...response, meta } : response;
  }

  /**
    Menggunakan Generic <E> untuk tipe Errors (bisa berupa string[], object, dll)
   **/
  public static error<E = any>(message: string, errors: E | null = null) {
    return {
      success: false,
      message,
      data: null,
      errors,
    };
  }
}