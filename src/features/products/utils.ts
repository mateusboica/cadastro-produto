import type { Product, ProductPayload } from '../../api/productService'
import { CATEGORY_LABELS } from './constants'
import type { FormState, ProductApiError } from './types'

export function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function gerarCorAleatoria(nomeUsuario: string) {
  const [nome = 'Usuario'] = nomeUsuario.trim().split(' ')
  let hash = 0

  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  }

  const cor = (hash & 0x00ffffff).toString(16).toUpperCase()
  return `00000${cor}`.slice(-6)
}

export function formatCategoria(categoria: string) {
  return CATEGORY_LABELS[categoria] || categoria
}

export function normalizeTag(value: string) {
  return value.trim().replace(/,/g, '').replace(/\s+/g, '_').toLowerCase()
}

export function createProductPayload(form: FormState): ProductPayload {
  const nome = form.nome.trim()

  return {
    nome,
    slug: gerarSlug(nome),
    preco: Number.parseFloat(form.preco),
    descricao: form.descricao.trim(),
    img: form.existingImage || null,
    categoria: form.categoria,
    isDisponivel: form.isDisponivel,
    tags: form.tags,
  }
}

export function createEditableFormState(product: Product): FormState {
  return {
    nome: product.nome ?? '',
    preco: String(product.preco ?? ''),
    categoria: product.categoria ?? '',
    descricao: product.descricao ?? '',
    isDisponivel: Boolean(product.isDisponivel ?? product.disponivel),
    tags: Array.isArray(product.tags) ? product.tags : [],
    imageFile: null,
    existingImage: product.img ?? null,
  }
}

export function getApiErrorMessage(error: ProductApiError) {
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
