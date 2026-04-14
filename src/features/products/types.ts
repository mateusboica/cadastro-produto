export type ToastType = 'success' | 'error'

export type ToastState = {
  message: string
  type: ToastType
} | null

export type FormState = {
  nome: string
  preco: string
  categoria: string
  descricao: string
  isDisponivel: boolean
  tags: string[]
  imageFile: File | null
  existingImage: string | null
}

export type ProductApiError = {
  response?: {
    status?: number
    data?: {
      detail?: string
      message?: string
      campos?: Record<string, string>
    }
  }
}
