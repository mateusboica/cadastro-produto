import { useMemo, useState } from 'react'
import type { Product } from '../api/productService'
import { CATEGORY_OPTIONS } from '../features/products/constants'
import { formatCategoria } from '../features/products/utils'

type ProductListProps = {
  products: Product[]
  isLoadingProducts: boolean
  productsError: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

type AvailabilityFilter = 'all' | 'available' | 'paused'
type SortOption = 'name' | 'price-desc' | 'price-asc' | 'availability'

const getAvailability = (product: Product) =>
  Boolean(product.isDisponivel ?? product.disponivel)

export default function ProductList({
  products,
  isLoadingProducts,
  productsError,
  onEdit,
  onDelete,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('name')

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return products
      .filter((product) => {
        const isAvailable = getAvailability(product)
        const matchesCategory =
          categoryFilter === 'all' || product.categoria === categoryFilter
        const matchesAvailability =
          availabilityFilter === 'all' ||
          (availabilityFilter === 'available' && isAvailable) ||
          (availabilityFilter === 'paused' && !isAvailable)
        const searchableText = [
          product.nome,
          product.descricao,
          product.categoria,
          ...(product.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch)

        return matchesCategory && matchesAvailability && matchesSearch
      })
      .sort((a, b) => {
        if (sortOption === 'price-desc') {
          return Number(b.preco) - Number(a.preco)
        }

        if (sortOption === 'price-asc') {
          return Number(a.preco) - Number(b.preco)
        }

        if (sortOption === 'availability') {
          return Number(getAvailability(b)) - Number(getAvailability(a))
        }

        return a.nome.localeCompare(b.nome)
      })
  }, [availabilityFilter, categoryFilter, products, searchTerm, sortOption])

  return (
    <section className="products-panel">
      <div className="panel-header product-panel-header">
        <div>
          <span className="panel-kicker">Catalogo</span>
          <h2>Cardapio</h2>
        </div>
        <span className="count-badge">
          {visibleProducts.length} de {products.length}
        </span>
      </div>

      <div className="product-toolbar" aria-label="Filtros de produtos">
        <label className="product-search">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Buscar produto, tag ou descricao"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <select
          aria-label="Filtrar por categoria"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">Todas categorias</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por disponibilidade"
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(event.target.value as AvailabilityFilter)
          }
        >
          <option value="all">Todos status</option>
          <option value="available">Disponiveis</option>
          <option value="paused">Pausados</option>
        </select>

        <select
          aria-label="Ordenar produtos"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value as SortOption)}
        >
          <option value="name">Nome A-Z</option>
          <option value="price-desc">Maior preco</option>
          <option value="price-asc">Menor preco</option>
          <option value="availability">Disponibilidade</option>
        </select>
      </div>

      <div className="product-grid">
        {isLoadingProducts &&
          Array.from({ length: 6 }).map((_, index) => (
            <div className="skeleton-card product-card-shell" key={index}>
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
              Nao foi possivel conectar a API.
              <br />
              Verifique se o servidor esta online.
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
              Adicione o primeiro pelo formulario.
            </p>
          </div>
        )}

        {!isLoadingProducts &&
          !productsError &&
          products.length > 0 &&
          visibleProducts.length === 0 && (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p>Nenhum produto corresponde aos filtros atuais.</p>
            </div>
          )}

        {!isLoadingProducts &&
          !productsError &&
          visibleProducts.map((product, index) => {
            const isDisponivel = getAvailability(product)
            const tags = product.tags?.slice(0, 3) ?? []

            return (
              <article
                className="product-card product-card-shell"
                key={product.id}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="product-card-media">
                  {product.img ? (
                    <img
                      className="product-card-img"
                      src={product.img}
                      alt={product.nome}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-card-img-placeholder">Produto</div>
                  )}
                  <span
                    className={`product-card-status ${isDisponivel ? 'is-live' : 'is-paused'}`}
                  >
                    {isDisponivel ? 'Ativo' : 'Pausado'}
                  </span>
                </div>

                <div className="product-card-body">
                  <div>
                    <div className="product-card-name" title={product.nome}>
                      {product.nome}
                    </div>
                    <p className="product-card-description">
                      {product.descricao || 'Sem descricao cadastrada.'}
                    </p>
                  </div>

                  <div className="product-card-meta">
                    <span className="product-card-price">
                      R$ {Number(product.preco).toFixed(2)}
                    </span>
                    <span className="product-card-cat">
                      {formatCategoria(product.categoria)}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="product-card-tags">
                      {tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="product-card-footer">
                  <span className={`disponivel-dot ${isDisponivel ? 'sim' : 'nao'}`}>
                    {isDisponivel ? 'Disponivel' : 'Indisponivel'}
                  </span>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="btn-delete"
                      title="Remover produto"
                      onClick={() => onDelete(product)}
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
                      onClick={() => onEdit(product)}
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
              </article>
            )
          })}
      </div>
    </section>
  )
}
