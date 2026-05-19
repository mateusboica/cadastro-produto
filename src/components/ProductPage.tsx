import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import imageService from '../api/imageService'
import productService, { type Product } from '../api/productService'
import type { AppOutletContext } from '../App'
import type { FormState, ProductApiError } from '../features/products/types'
import {
  createEditableFormState,
  createProductPayload,
  gerarSlug,
  getApiErrorMessage,
  normalizeTag,
} from '../features/products/utils'
import ProductForm from './ProductForm'
import ProductList from './ProductList'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_TAGS = 12

const emptyFormState = (): FormState => ({
  nome: '',
  preco: '',
  categoria: '',
  descricao: '',
  isDisponivel: true,
  tags: [],
  imageFile: null,
  existingImage: null,
})

async function uploadParaImgBB(arquivo: File) {
  try {
    return await imageService.upload(arquivo)
  } catch (error) {
    console.error('Erro de conexao com ImgBB:', error)
    return null
  }
}

function validateProductForm(form: FormState) {
  const nome = form.nome.trim()
  const descricao = form.descricao.trim()
  const preco = Number.parseFloat(form.preco)

  if (!nome || nome.length < 3) {
    return 'Informe um nome com pelo menos 3 caracteres.'
  }

  if (Number.isNaN(preco) || preco <= 0) {
    return 'Informe um preco valido maior que zero.'
  }

  if (!descricao) {
    return 'Informe a descricao do produto.'
  }

  if (!form.categoria) {
    return 'Selecione a categoria do produto.'
  }

  if (!form.imageFile && !form.existingImage) {
    return 'Selecione uma imagem do produto.'
  }

  return null
}

export default function ProductPage() {
  const { showToast } = useOutletContext<AppOutletContext>()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(emptyFormState)
  const [tagInput, setTagInput] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productsError, setProductsError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const slug = gerarSlug(form.nome)
  const productStats = useMemo(() => {
    const available = products.filter((product) =>
      Boolean(product.isDisponivel ?? product.disponivel),
    ).length
    const categoryCount = new Set(products.map((product) => product.categoria)).size

    return {
      total: products.length,
      available,
      unavailable: products.length - available,
      categoryCount,
    }
  }, [products])

  useEffect(() => {
    carregarProdutos()
  }, [])

  useEffect(() => {
    if (!form.imageFile) {
      setPreviewUrl(form.existingImage)
      return
    }

    const objectUrl = URL.createObjectURL(form.imageFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [form.imageFile, form.existingImage])

  async function carregarProdutos() {
    setIsLoadingProducts(true)
    setProductsError(false)

    try {
      const productList = await productService.list()
      setProducts(productList)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
      setProductsError(true)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  function resetForm() {
    setForm(emptyFormState())
    setTagInput('')
    setEditingProductId(null)
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleDisponivelToggle() {
    setForm((current) => ({
      ...current,
      isDisponivel: !current.isDisponivel,
    }))
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (file && !file.type.startsWith('image/')) {
      event.target.value = ''
      showToast('Selecione um arquivo de imagem valido.', 'error')
      return
    }

    if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
      event.target.value = ''
      showToast('A imagem deve ter no maximo 5 MB.', 'error')
      return
    }

    setForm((current) => ({
      ...current,
      imageFile: file,
    }))
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') {
      return
    }

    event.preventDefault()

    const value = normalizeTag(tagInput)

    if (!value || form.tags.includes(value)) {
      setTagInput('')
      return
    }

    if (form.tags.length >= MAX_TAGS) {
      showToast(`Use no maximo ${MAX_TAGS} tags por produto.`, 'error')
      setTagInput('')
      return
    }

    setForm((current) => ({
      ...current,
      tags: [...current.tags, value],
    }))
    setTagInput('')
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nome = form.nome.trim()
    const validationMessage = validateProductForm(form)

    if (validationMessage) {
      showToast(validationMessage, 'error')
      return
    }

    setIsSubmitting(true)

    let imageUrl = form.existingImage

    try {
      if (form.imageFile) {
        showToast('Enviando imagem...', 'success')
        imageUrl = await uploadParaImgBB(form.imageFile)

        if (!imageUrl) {
          showToast('Falha no upload da imagem. Tente novamente.', 'error')
          return
        }
      }

      const productPayload = {
        ...createProductPayload(form),
        img: imageUrl,
      }

      if (editingProductId) {
        await productService.update(editingProductId, productPayload)
      } else {
        await productService.create(productPayload)
      }

      showToast(
        editingProductId
          ? `"${nome}" atualizado com sucesso!`
          : `"${nome}" adicionado com sucesso!`,
        'success',
      )
      resetForm()
      await carregarProdutos()
    } catch (error) {
      const { message, fields } = getApiErrorMessage(error as ProductApiError)

      console.error('Erro de rede:', error)

      if (fields) {
        const campos = Object.entries(fields)
          .map(([campo, valor]) => `${campo}: ${valor}`)
          .join(', ')

        showToast(`Campos invalidos -> ${campos}`, 'error')
      } else {
        showToast(message, 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(product: Product) {
    setEditingProductId(product.id)
    setTagInput('')
    setForm(createEditableFormState(product))
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Remover "${product.nome}" do cardapio?`)

    if (!confirmed) {
      return
    }

    try {
      await productService.remove(product.id)

      showToast(`"${product.nome}" removido.`, 'success')
      await carregarProdutos()
      if (editingProductId === product.id) {
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      showToast('Erro de conexao.', 'error')
    }
  }

  return (
    <div className="product-page-shell">
      <section className="product-command-bar">
        <div>
          <span className="product-kicker">Gestao de cardapio</span>
          <h1>Produtos</h1>
          <p>Controle de itens, imagens, categorias e disponibilidade da loja.</p>
        </div>

        <div className="product-stats" aria-label="Resumo do cardapio">
          <div className="product-stat">
            <span>Total</span>
            <strong>{productStats.total}</strong>
          </div>
          <div className="product-stat">
            <span>Ativos</span>
            <strong>{productStats.available}</strong>
          </div>
          <div className="product-stat">
            <span>Pausados</span>
            <strong>{productStats.unavailable}</strong>
          </div>
          <div className="product-stat">
            <span>Categorias</span>
            <strong>{productStats.categoryCount}</strong>
          </div>
        </div>
      </section>

      <div className="page product-page-grid">
        <ProductForm
          form={form}
          tagInput={tagInput}
          slug={slug}
          previewUrl={previewUrl}
          isSubmitting={isSubmitting}
          editingProductId={editingProductId}
          onSubmit={handleSubmit}
          onFieldChange={handleFieldChange}
          onImageChange={handleImageChange}
          onTagInputChange={setTagInput}
          onTagKeyDown={handleTagKeyDown}
          onRemoveTag={removeTag}
          onDisponivelToggle={handleDisponivelToggle}
          onResetForm={resetForm}
        />

        <ProductList
          products={products}
          isLoadingProducts={isLoadingProducts}
          productsError={productsError}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
