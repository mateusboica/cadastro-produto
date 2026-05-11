import api from './api'

export type DiaSemana =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'

export type HorarioFuncionamento = {
    diaSemana: DiaSemana
    horaAbertura: string
    horaFechamento: string
}

export type LojaPayload = {
    nome: string
    endereco: string
    descricao: string
    telefone: string
    aberto: boolean
    logoUrl: string
    taxaServico: number
    taxaEntrega: number
    horarioFuncionamento: HorarioFuncionamento[]
}

export type Loja = {
    id: string
    nome: string
    endereco: string
    descricao?: string | null
    telefone: string
    isAberto?: boolean
    aberto?: boolean
    logoUrl?: string | null
    logo?: string | null
    taxaServico: number
    taxaEntrega: number
    horarioFuncionamento: HorarioFuncionamento[]
    createdAt?: string
    updatedAt?: string
}

type LojaListResponse = {
    content?: Loja[]
}

const lojaService = {
    list: async (): Promise<Loja[]> => {
        const response = await api.get<LojaListResponse>('/v1/lojas?size=50')
        return response.data?.content || []
    },

    create: async (loja: LojaPayload) => {
        const response = await api.post<Loja>('/v1/lojas', loja)
        return response.data
    },

    update: async (id: string, loja: LojaPayload) => {
        const response = await api.put<Loja>(`/v1/lojas/${id}`, loja)
        return response.data
    },

    remove: async (id: string) => {
        const response = await api.delete<unknown>(`/v1/lojas/${id}`)
        return response.data
    },
}

export default lojaService
