import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import imageService from '../api/imageService'
import productService, { type Product } from '../api/productService'
import type { FormState, ProductApiError, ToastType } from '../features/products/types'
import {
  createEditableFormState,
  createProductPayload,
  gerarSlug,
  getApiErrorMessage,
  normalizeTag,
} from '../features/products/utils'
import ProductForm from './ProductForm'
import ProductList from './ProductList'

type ProductPageProps = {
  showToast: (message: string, type?: ToastType) => void
}

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

export default function ProductPage({ showToast }: ProductPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(emptyFormState)
  const [tagInput, setTagInput] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productsError, setProductsError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const slug = gerarSlug(form.nome)

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
    const preco = Number.parseFloat(form.preco)

    if (!nome || Number.isNaN(preco) || preco <= 0 || !form.categoria) {
      showToast('Preencha os campos obrigatorios.', 'error')
      return
    }

    let imageUrl = form.existingImage

    if (form.imageFile) {
      showToast('Fazendo upload da imagem...', 'success')
      imageUrl = await uploadParaImgBB(form.imageFile)

      if (!imageUrl) {
        showToast('Falha no upload da imagem. Tente novamente.', 'error')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const productPayload = {
        ...createProductPayload(form),
        img: imageUrl || null,
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
    <div className="page">
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
  )
}
