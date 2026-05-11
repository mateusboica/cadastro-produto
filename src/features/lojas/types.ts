import type { DiaSemana } from '../../api/lojaService'

export type ToastType = 'success' | 'error'

export type ToastState = {
  message: string
  type: ToastType
} | null

export type HorarioFuncionamentoFormState = {
  diaSemana: DiaSemana
  ativo: boolean
  horaAbertura: string
  horaFechamento: string
}

export type LojaFormState = {
  nome: string
  endereco: string
  descricao: string
  telefone: string
  isAberto: boolean
  logoFile: File | null
  existingLogo: string | null
  taxaServico: string
  taxaEntrega: string
  horarioFuncionamento: HorarioFuncionamentoFormState[]
}

export type LojaApiError = {
  response?: {
    status?: number
    data?: {
      detail?: string
      message?: string
      campos?: Record<string, string>
    }
  }
}
