import type { Product } from '../api/productService'
import { formatCategoria } from '../features/products/utils'

type ProductListProps = {
  products: Product[]
  isLoadingProducts: boolean
  productsError: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductList({
  products,
  isLoadingProducts,
  productsError,
  onEdit,
  onDelete,
}: ProductListProps) {
  return (
    <section className="products-panel">
      <div className="panel-header">
        <h2>Cardapio</h2>
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
          products.map((product, index) => {
            const isDisponivel = Boolean(product.isDisponivel ?? product.disponivel)

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
                  <div className="product-card-img-placeholder">Produto</div>
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
                  <span className={`disponivel-dot ${isDisponivel ? 'sim' : 'nao'}`}>
                    {isDisponivel ? 'Disponivel' : 'Indisponivel'}
                  </span>

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
            )
          })}
      </div>
    </section>
  )
}
