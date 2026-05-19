import api from './api'

export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'

export type OrderItem = {
  produtoId: string
  nomeProduto: string
  precoUnitario: number
  quantidade: number
  subtotal: number
}

export type OrderAddress = {
  cep?: string | null
  rua?: string | null
  numero?: string | null
  bairro?: string | null
  complemento?: string | null
  referencia?: string | null
}

export type OrderStatusHistory = {
  status: OrderStatus
  statusLabel?: string
  alteradoEm: string
  observacao?: string | null
}

export type Order = {
  id: string
  codigo?: string | null
  lojaId: string
  nomeCliente: string
  telefoneCliente: string
  enderecoEntrega: string
  endereco?: OrderAddress | null
  metodoPagamento?: string | null
  trocoPara?: number | null
  observacao?: string | null
  itens: OrderItem[]
  subtotal: number
  taxaServico: number
  taxaEntrega: number
  total: number
  status: OrderStatus
  statusLabel?: string
  statusAtualizadoEm?: string | null
  historicoStatus?: OrderStatusHistory[]
  createdAt?: string
  updatedAt?: string
}

type OrderListResponse = {
  content?: Order[]
}

const pedidoService = {
  list: async (): Promise<Order[]> => {
    const response = await api.get<OrderListResponse>('/v1/pedidos?size=100')
    return response.data?.content || []
  },

  updateStatus: async (id: string, status: OrderStatus, observacao?: string) => {
    const response = await api.patch<Order>(`/v1/pedidos/${id}/status`, {
      status,
      observacao,
    })
    return response.data
  },
}

export default pedidoService
