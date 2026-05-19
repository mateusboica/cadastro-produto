import { useMemo, useState } from 'react'
import type { Loja } from '../api/lojaService'
import { formatHorarioFuncionamento } from '../features/lojas/utils'

type LojaListProps = {
  lojas: Loja[]
  isLoadingLojas: boolean
  lojasError: boolean
  onEdit: (loja: Loja) => void
  onDelete: (loja: Loja) => void
}

type StoreStatusFilter = 'all' | 'open' | 'closed'
type StoreSortOption = 'name' | 'delivery-desc' | 'delivery-asc' | 'status'

const getStoreOpenStatus = (loja: Loja) => Boolean(loja.aberto ?? loja.isAberto)

export default function LojaList({
  lojas,
  isLoadingLojas,
  lojasError,
  onEdit,
  onDelete,
}: LojaListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StoreStatusFilter>('all')
  const [sortOption, setSortOption] = useState<StoreSortOption>('name')

  const visibleLojas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return lojas
      .filter((loja) => {
        const isOpen = getStoreOpenStatus(loja)
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'open' && isOpen) ||
          (statusFilter === 'closed' && !isOpen)
        const horario = formatHorarioFuncionamento(loja.horarioFuncionamento)
        const searchableText = [
          loja.nome,
          loja.descricao,
          loja.endereco,
          loja.telefone,
          horario,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        const matchesSearch =
          !normalizedSearch || searchableText.includes(normalizedSearch)

        return matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        if (sortOption === 'delivery-desc') {
          return Number(b.taxaEntrega) - Number(a.taxaEntrega)
        }

        if (sortOption === 'delivery-asc') {
          return Number(a.taxaEntrega) - Number(b.taxaEntrega)
        }

        if (sortOption === 'status') {
          return Number(getStoreOpenStatus(b)) - Number(getStoreOpenStatus(a))
        }

        return a.nome.localeCompare(b.nome)
      })
  }, [lojas, searchTerm, sortOption, statusFilter])

  return (
    <section className="products-panel store-panel">
      <div className="panel-header product-panel-header">
        <div>
          <span className="panel-kicker">Unidades</span>
          <h2>Lojas</h2>
        </div>
        <span className="count-badge">
          {visibleLojas.length} de {lojas.length}
        </span>
      </div>

      <div className="product-toolbar store-toolbar" aria-label="Filtros de lojas">
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
            placeholder="Buscar loja, endereco ou telefone"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StoreStatusFilter)}
        >
          <option value="all">Todas operacoes</option>
          <option value="open">Abertas</option>
          <option value="closed">Fechadas</option>
        </select>

        <select
          aria-label="Ordenar lojas"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value as StoreSortOption)}
        >
          <option value="name">Nome A-Z</option>
          <option value="delivery-desc">Maior entrega/km</option>
          <option value="delivery-asc">Menor entrega/km</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="product-grid store-grid">
        {isLoadingLojas &&
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

        {!isLoadingLojas && lojasError && (
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

        {!isLoadingLojas && !lojasError && lojas.length === 0 && (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 21V7l9-4 9 4v14" />
              <path d="M9 21v-8h6v8" />
              <path d="M9 9h.01M15 9h.01" />
            </svg>
            <p>
              Nenhuma loja cadastrada ainda.
              <br />
              Adicione a primeira pelo formulario.
            </p>
          </div>
        )}

        {!isLoadingLojas &&
          !lojasError &&
          lojas.length > 0 &&
          visibleLojas.length === 0 && (
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
              <p>Nenhuma loja corresponde aos filtros atuais.</p>
            </div>
          )}

        {!isLoadingLojas &&
          !lojasError &&
          visibleLojas.map((loja, index) => {
            const isAberto = getStoreOpenStatus(loja)
            const horario = formatHorarioFuncionamento(loja.horarioFuncionamento)

            return (
              <article
                className="product-card product-card-shell store-card"
                key={loja.id}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="product-card-media store-card-media">
                  {loja.logoUrl || loja.logo ? (
                    <img
                      className="product-card-img store-card-img"
                      src={loja.logoUrl ?? loja.logo ?? ''}
                      alt={loja.nome}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-card-img-placeholder">Loja</div>
                  )}
                  <span
                    className={`product-card-status ${isAberto ? 'is-live' : 'is-paused'}`}
                  >
                    {isAberto ? 'Aberta' : 'Fechada'}
                  </span>
                </div>

                <div className="product-card-body store-card-body">
                  <div>
                    <div className="product-card-name" title={loja.nome}>
                      {loja.nome}
                    </div>

                    <p className="product-card-description" title={loja.descricao ?? ''}>
                      {loja.descricao || 'Sem descricao cadastrada.'}
                    </p>
                  </div>

                  <div className="store-card-details">
                    <span title={loja.endereco}>{loja.endereco}</span>
                    <span>{loja.telefone}</span>
                    <span title={horario}>{horario}</span>
                  </div>

                  <div className="store-card-fees">
                    <span>Servico: R$ {Number(loja.taxaServico).toFixed(2)}</span>
                    <span>Entrega/km: R$ {Number(loja.taxaEntrega).toFixed(2)}</span>
                  </div>
                </div>

                <div className="product-card-footer">
                  <span className={`disponivel-dot ${isAberto ? 'sim' : 'nao'}`}>
                    {isAberto ? 'Recebendo pedidos' : 'Pausada'}
                  </span>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      className="btn-delete"
                      title="Remover loja"
                      onClick={() => onDelete(loja)}
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
                      title="Editar loja"
                      onClick={() => onEdit(loja)}
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
