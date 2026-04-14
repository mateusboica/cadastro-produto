import type { FormState } from './types'

export const CATEGORY_LABELS: Record<string, string> = {
  MOQUECAS: 'Moquecas',
  FRUTOS_DO_MAR: 'Frutos do Mar',
  ENTRADAS: 'Entradas',
  ACOMPANHAMENTOS: 'Acomp.',
  BEBIDAS: 'Bebidas',
  SOBREMESAS: 'Sobremesas',
}

export const CATEGORY_OPTIONS = [
  { value: 'MOQUECAS', label: 'Moquecas' },
  { value: 'FRUTOS_DO_MAR', label: 'Frutos do Mar' },
  { value: 'ENTRADAS', label: 'Entradas' },
  { value: 'ACOMPANHAMENTOS', label: 'Acompanhamentos' },
  { value: 'BEBIDAS', label: 'Bebidas' },
  { value: 'SOBREMESAS', label: 'Sobremesas' },
] as const

export const EMPTY_FORM_STATE = (): FormState => ({
  nome: '',
  preco: '',
  categoria: '',
  descricao: '',
  isDisponivel: true,
  tags: [],
  imageFile: null,
  existingImage: null,
})
