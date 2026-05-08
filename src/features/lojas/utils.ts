import type { Loja, LojaPayload } from '../../api/lojaService'
import type { LojaFormState, LojaApiError } from './types'

export function createLojaPayload(form: LojaFormState): LojaPayload {
  const nome = form.nome.trim()

  return {
    nome,
    endereco: form.endereco.trim(),
    descricao: form.descricao.trim(),
    telefone: form.telefone.trim(),
    aberto: form.isAberto,
    logoUrl: form.existingLogo || null,
    taxaServico: Number.parseFloat(form.taxaServico),
    taxaEntrega: Number.parseFloat(form.taxaEntrega),
    horarioFuncionamento: form.horarioFuncionamento.trim(),
  }
}

export function createEditableLojaFormState(loja: Loja): LojaFormState {
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
    horarioFuncionamento: loja.horarioFuncionamento ?? '',
  }
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