import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import './styles.css'

const API = import.meta.env.VITE_API_URL
const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY


const CATEGORY_LABELS: Record<string, string> = {
  MOQUECAS: 'Moquecas',
  FRUTOS_DO_MAR: 'Frutos do Mar',
  ENTRADAS: 'Entradas',
  ACOMPANHAMENTOS: 'Acomp.',
  BEBIDAS: 'Bebidas',
  SOBREMESAS: 'Sobremesas',
}

const CATEGORY_OPTIONS = [
  { value: 'MOQUECAS', label: 'Moquecas' },
  { value: 'FRUTOS_DO_MAR', label: 'Frutos do Mar' },
  { value: 'ENTRADAS', label: 'Entradas' },
  { value: 'ACOMPANHAMENTOS', label: 'Acompanhamentos' },
  { value: 'BEBIDAS', label: 'Bebidas' },
  { value: 'SOBREMESAS', label: 'Sobremesas' },
] as const

type ToastType = 'success' | 'error'

type ToastState = {
  message: string
  type: ToastType
} | null

type Product = {
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

type FormState = {
  nome: string
  preco: string
  categoria: string
  descricao: string
  isDisponivel: boolean
  tags: string[]
  imageFile: File | null
  existingImage: string | null
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

function gerarSlug(nome: string) {
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function formatCategoria(categoria: string) {
  return CATEGORY_LABELS[categoria] || categoria
}

async function uploadParaImgBB(arquivo: File) {
  const formData = new FormData()
  formData.append('image', arquivo)

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const data = await response.json()
    return data.success ? data.data.url : null
  } catch (error) {
    console.error('Erro de conexão com ImgBB:', error)
    return null
  }
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
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
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [toast])

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
      const response = await fetch(`${API}/api/v1/produtos?size=50`)
      const data = await response.json()
      setProducts(data.content || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
      setProductsError(true)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type })
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
      existingImage: file ? current.existingImage : current.existingImage,
    }))
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' && event.key !== ',') {
      return
    }

    event.preventDefault()

    const value = tagInput
      .trim()
      .replace(/,/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()

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
      showToast('Preencha os campos obrigatórios.', 'error')
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

    const productPayload = {
      nome,
      slug: gerarSlug(nome),
      preco,
      descricao: form.descricao.trim(),
      img: imageUrl || null,
      categoria: form.categoria,
      isDisponivel: form.isDisponivel,
      tags: form.tags,
    }

    const endpoint = editingProductId
      ? `${API}/api/v1/produtos/${editingProductId}`
      : `${API}/api/v1/produtos`
    const method = editingProductId ? 'PUT' : 'POST'

    setIsSubmitting(true)

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          errorData.detail ||
          errorData.message ||
          `Erro ${response.status}`

        if (errorData.campos) {
          const campos = Object.entries(errorData.campos)
            .map(([campo, valor]) => `${campo}: ${valor}`)
            .join(', ')

          showToast(`Campos inválidos -> ${campos}`, 'error')
        } else {
          showToast(message, 'error')
        }

        return
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
      console.error('Erro de rede:', error)
      showToast('Sem conexão com a API. Verifique se está online.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(product: Product) {
    setEditingProductId(product.id)
    setTagInput('')
    setForm({
      nome: product.nome ?? '',
      preco: String(product.preco ?? ''),
      categoria: product.categoria ?? '',
      descricao: product.descricao ?? '',
      isDisponivel: Boolean(product.isDisponivel ?? product.disponivel),
      tags: Array.isArray(product.tags) ? product.tags : [],
      imageFile: null,
      existingImage: product.img ?? null,
    })
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Remover "${product.nome}" do cardápio?`,
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API}/api/v1/produtos/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok && response.status !== 204) {
        showToast('Erro ao remover produto.', 'error')
        return
      }

      showToast(`"${product.nome}" removido.`, 'success')
      await carregarProdutos()
      if (editingProductId === product.id) {
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      showToast('Erro de conexão.', 'error')
    }
  }

  return (
    <>
      <header>
        <span className="logo">Delícia Potiguar</span>
        <span className="header-badge">Gerenciador</span>
      </header>

      <div className="page">
        <aside>
          <div className="form-card">
            <div className="form-card-header">
              <h2>{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <p>
                {editingProductId
                  ? 'Atualize os campos para salvar as alterações'
                  : 'Preencha os campos para adicionar ao cardápio'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="nome">Nome do Produto *</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Moqueca de Camarão"
                  value={form.nome}
                  onChange={handleFieldChange}
                  required
                />
                <div className="slug-preview">
                  URL: <span>/produto/{slug || '—'}</span>
                </div>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label htmlFor="preco">Preço (R$) *</label>
                  <input
                    id="preco"
                    name="preco"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={form.preco}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="categoria">Categoria *</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleFieldChange}
                    required
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Descreva o prato, ingredientes, modo de preparo..."
                  value={form.descricao}
                  onChange={handleFieldChange}
                />
              </div>

              <div className="field">
                <label htmlFor="imagem">Imagem do Produto</label>
                <div
                  className={`img-preview-wrap ${previewUrl ? 'has-image' : ''}`}
                >
                  {!previewUrl && (
                    <div className="img-preview-placeholder">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p>Selecione uma imagem</p>
                    </div>
                  )}
                  {previewUrl && (
                    <img
                      id="imgPreview"
                      src={previewUrl}
                      alt="Preview"
                      className="visible-image"
                    />
                  )}
                </div>
                <input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  className="input-file"
                  onChange={handleImageChange}
                />
              </div>

              <div className="field">
                <label htmlFor="tagsInput">Tags</label>
                <div className="tags-input-wrap">
                  {form.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button
                        type="button"
                        title="Remover"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    id="tagsInput"
                    className="tags-input"
                    placeholder="Digite e pressione Enter..."
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                <p className="field-help">
                  Ex: vegano, sem_gluten, picante
                </p>
              </div>

              <button
                type="button"
                className="toggle-row"
                onClick={handleDisponivelToggle}
              >
                <span className="toggle-label-text">
                  Disponível no cardápio
                </span>
                <span className="toggle">
                  <input
                    type="checkbox"
                    checked={form.isDisponivel}
                    onChange={handleDisponivelToggle}
                  />
                  <span className="toggle-track"></span>
                  <span className="toggle-thumb"></span>
                </span>
              </button>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting && <span className="spinner"></span>}
                  {!isSubmitting && (
                    <svg
                      id="submitIcon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      {editingProductId ? (
                        <path d="M12 20h9" />
                      ) : (
                        <>
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </>
                      )}
                      {editingProductId && (
                        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                      )}
                    </svg>
                  )}
                  <span>
                    {isSubmitting
                      ? 'Salvando...'
                      : editingProductId
                        ? 'Salvar'
                        : 'Adicionar Produto'}
                  </span>
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={resetForm}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </aside>

        <section className="products-panel">
          <div className="panel-header">
            <h2>Cardápio</h2>
            <span className="count-badge">
              {products.length} produto{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="product-grid">
            {isLoadingProducts &&
              Array.from({ length: 6 }).map((_, index) => (
                <div className="skeleton-card" key={index}>
                  <div
                    className="skeleton"
                    style={{ height: '165px', borderRadius: 0 }}
                  ></div>
                  <div className="skeleton-body">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-subtitle"></div>
                  </div>
                </div>
              ))}

            {!isLoadingProducts && productsError && (
              <div className="empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>
                  Não foi possível conectar à API.
                  <br />
                  Verifique se o servidor está online.
                </p>
              </div>
            )}

            {!isLoadingProducts && !productsError && products.length === 0 && (
              <div className="empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h11" />
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                </svg>
                <p>
                  Nenhum produto cadastrado ainda.
                  <br />
                  Adicione o primeiro pelo formulário.
                </p>
              </div>
            )}

            {!isLoadingProducts &&
              !productsError &&
              products.map((product, index) => {
                const isDisponivel = Boolean(
                  product.isDisponivel ?? product.disponivel,
                )

                return (
                  <div
                    className="product-card"
                    key={product.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {product.img ? (
                      <img
                        className="product-card-img"
                        src={product.img}
                        alt={product.nome}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-card-img-placeholder">🍽️</div>
                    )}

                    <div className="product-card-body">
                      <div className="product-card-name" title={product.nome}>
                        {product.nome}
                      </div>
                      <div className="product-card-meta">
                        <span className="product-card-price">
                          R$ {Number(product.preco).toFixed(2)}
                        </span>
                        <span className="product-card-cat">
                          {formatCategoria(product.categoria)}
                        </span>
                      </div>
                    </div>

                    <div className="product-card-footer">
                      <span
                        className={`disponivel-dot ${isDisponivel ? 'sim' : 'nao'}`}
                      >
                        {isDisponivel ? 'Disponível' : 'Indisponível'}
                      </span>

                      <button
                        type="button"
                        className="btn-delete"
                        title="Remover produto"
                        onClick={() => handleDelete(product)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="btn-edit"
                        title="Editar produto"
                        onClick={() => handleEdit(product)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      </div>

      <div
        id="toast"
        className={`${toast ? 'show' : ''} ${toast?.type ?? ''}`.trim()}
      >
        <div className="toast-icon">{toast?.type === 'error' ? '✕' : '✓'}</div>
        <span>{toast?.message ?? ''}</span>
      </div>
    </>
  )
}

export default App
