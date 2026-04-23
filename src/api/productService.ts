import api from './api'

export type ProductPayload = {
  nome: string
  slug: string
  preco: number
  descricao: string
  img: string | null
  categoria: string
  isDisponivel: boolean
  tags: string[]
}

export type Product = {
  id: string
  nome: string
  slug: string
  preco: number
  descricao?: string | null
  img?: string | null
  categoria: string
  isDisponivel?: boolean
  disponivel?: boolean
  tags?: string[]
}

type ProductListResponse = {
  content?: Product[]
}

const productService = {
  list: async (): Promise<Product[]> => {
    const response = await api.get<ProductListResponse>('/v1/produtos?size=50')
    return response.data?.content || []
  },

  create: async (product: ProductPayload) => {
    const response = await api.post<Product>('/v1/produtos', product)
    return response.data
  },

  update: async (id: string, product: ProductPayload) => {
    const response = await api.put<Product>(`/v1/produtos/${id}`, product)
    return response.data
  },

  remove: async (id: string) => {
    const response = await api.delete<unknown>(`/v1/produtos/${id}`)
    return response.data
  },
}

export default productService
