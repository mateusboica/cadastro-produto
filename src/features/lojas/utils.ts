import type { DiaSemana, Loja, LojaPayload } from '../../api/lojaService'
import type {
  HorarioFuncionamentoFormState,
  LojaApiError,
  LojaFormState,
} from './types'

export const diasSemana: { value: DiaSemana; label: string }[] = [
  { value: 'MONDAY', label: 'Segunda' },
  { value: 'TUESDAY', label: 'Terca' },
  { value: 'WEDNESDAY', label: 'Quarta' },
  { value: 'THURSDAY', label: 'Quinta' },
  { value: 'FRIDAY', label: 'Sexta' },
  { value: 'SATURDAY', label: 'Sabado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

export function createDefaultHorarioFuncionamento(): HorarioFuncionamentoFormState[] {
  return diasSemana.map(({ value }) => ({
    diaSemana: value,
    ativo: value !== 'SUNDAY',
    horaAbertura: '08:00',
    horaFechamento: '18:00',
  }))
}

export function createLojaPayload(form: LojaFormState): LojaPayload {
  const nome = form.nome.trim()

  return {
    nome,
    endereco: form.endereco.trim(),
    descricao: form.descricao.trim(),
    telefone: form.telefone.trim(),
    aberto: form.isAberto,
    logoUrl: form.existingLogo ?? '',
    taxaServico: Number.parseFloat(form.taxaServico),
    taxaEntrega: Number.parseFloat(form.taxaEntrega),
    horarioFuncionamento: form.horarioFuncionamento
      .filter((horario) => horario.ativo)
      .map(({ diaSemana, horaAbertura, horaFechamento }) => ({
        diaSemana,
        horaAbertura,
        horaFechamento,
      })),
  }
}

export function createEditableLojaFormState(loja: Loja): LojaFormState {
  const horarioFuncionamento = createDefaultHorarioFuncionamento().map((horario) => {
    const horarioSalvo = loja.horarioFuncionamento?.find(
      (item) => item.diaSemana === horario.diaSemana,
    )

    if (!horarioSalvo) {
      return { ...horario, ativo: false }
    }

    return {
      ...horario,
      ativo: true,
      horaAbertura: horarioSalvo.horaAbertura?.slice(0, 5) ?? horario.horaAbertura,
      horaFechamento:
        horarioSalvo.horaFechamento?.slice(0, 5) ?? horario.horaFechamento,
    }
  })

  return {
    nome: loja.nome ?? '',
    endereco: loja.endereco ?? '',
    descricao: loja.descricao ?? '',
    telefone: loja.telefone ?? '',
    isAberto: Boolean(loja.aberto ?? loja.isAberto),
    logoFile: null,
    existingLogo: loja.logoUrl ?? loja.logo ?? null,
    taxaServico: String(loja.taxaServico ?? ''),
    taxaEntrega: String(loja.taxaEntrega ?? ''),
    horarioFuncionamento,
  }
}

export function formatHorarioFuncionamento(
  horarioFuncionamento: Loja['horarioFuncionamento'],
) {
  if (!horarioFuncionamento?.length) {
    return 'Sem horario informado'
  }

  return horarioFuncionamento
    .map((horario) => {
      const dia = diasSemana.find((item) => item.value === horario.diaSemana)
      const abertura = horario.horaAbertura?.slice(0, 5)
      const fechamento = horario.horaFechamento?.slice(0, 5)

      return `${dia?.label ?? horario.diaSemana}: ${abertura}-${fechamento}`
    })
    .join(', ')
}

export function getLojaApiErrorMessage(error: LojaApiError) {
  const errorData = error.response?.data

  const message =
    errorData?.detail ||
    errorData?.message ||
    (error.response?.status
      ? `Erro ${error.response.status}`
      : 'Sem conexao com a API. Verifique se esta online.')

  return {
    message,
    fields: errorData?.campos,
  }
}
