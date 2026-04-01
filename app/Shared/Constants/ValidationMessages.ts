export const ValidationMessages = {
  leave: {
    start_date: {
      required: 'Tanggal mulai wajib diisi.',
      format: 'Format tanggal mulai harus yyyy-MM-dd.'
    },
    end_date: {
      required: 'Tanggal selesai wajib diisi.',
      format: 'Format tanggal selesai harus yyyy-MM-dd.'
    },
    reason: {
      required: 'Alasan cuti wajib diisi.',
      maxLength: 'Alasan cuti tidak boleh lebih dari 255 karakter.'
    },
    attachment: {
      size: 'Ukuran file maksimal 2MB.',
      extnames: 'File harus berformat jpg, png, atau pdf.'
    }
  },

  adminLeave: {
    action: 'Aksi harus berupa "approve" atau "reject".',
    required: 'Aksi (approve/reject) wajib diisi.',
  },

  auth: {
    email: {
      required: 'Email wajib diisi.',
      email: 'Format email tidak valid.',
      invalid: 'Email atau password yang Anda masukkan salah.'
    },
    password: {
      required: 'Password wajib diisi.',
      minLength: 'Password minimal 8 karakter.'
    },
    fullName: {
      required: 'Nama lengkap wajib diisi.'
    }
  }
}