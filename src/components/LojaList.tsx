import type { Loja } from '../api/lojaService'
import { formatHorarioFuncionamento } from '../features/lojas/utils'

type LojaListProps = {
    lojas: Loja[]
    isLoadingLojas: boolean
    lojasError: boolean
    onEdit: (loja: Loja) => void
    onDelete: (loja: Loja) => void
}

export default function LojaList({
    lojas,
    isLoadingLojas,
    lojasError,
    onEdit,
    onDelete,
}: LojaListProps) {
    return (
        <section className="products-panel">
            <div className="panel-header">
                <h2>Lojas</h2>
                <span className="count-badge">
                    {lojas.length} loja{lojas.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="product-grid">
                {isLoadingLojas &&
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
                            fill="currentColor"
                        >
                            <path d="M24,10a.988.988,0,0,0-.024-.217l-1.3-5.868A4.968,4.968,0,0,0,17.792,0H6.208a4.968,4.968,0,0,0-4.88,3.915L.024,9.783A.988.988,0,0,0,0,10v1a3.984,3.984,0,0,0,1,2.643V19a5.006,5.006,0,0,0,5,5H18a5.006,5.006,0,0,0,5-5V13.643A3.984,3.984,0,0,0,24,11ZM2,10.109l1.28-5.76A2.982,2.982,0,0,1,6.208,2H7V5A1,1,0,0,0,9,5V2h6V5a1,1,0,0,0,2,0V2h.792A2.982,2.982,0,0,1,20.72,4.349L22,10.109V11a2,2,0,0,1-2,2H19a2,2,0,0,1-2-2,1,1,0,0,0-2,0,2,2,0,0,1-2,2H11a2,2,0,0,1-2-2,1,1,0,0,0-2,0,2,2,0,0,1-2,2H4a2,2,0,0,1-2-2ZM18,22H6a3,3,0,0,1-3-3V14.873A3.978,3.978,0,0,0,4,15H5a3.99,3.99,0,0,0,3-1.357A3.99,3.99,0,0,0,11,15h2a3.99,3.99,0,0,0,3-1.357A3.99,3.99,0,0,0,19,15h1a3.978,3.978,0,0,0,1-.127V19A3,3,0,0,1,18,22Z" />
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
                  lojas.map((loja, index) => {
                    const isAberto = Boolean(loja.aberto)
                    const horario = formatHorarioFuncionamento(loja.horarioFuncionamento)

                    return (
                      <div
                        className="product-card"
                        key={loja.id}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {loja.logoUrl || loja.logo ? (
                          <img
                            className="product-card-img"
                            src={loja.logoUrl ?? loja.logo ?? ''}
                            alt={loja.nome}
                            loading="lazy"
                          />
                        ) : (
                          <div className="product-card-img-placeholder">Loja</div>
                        )}

                        <div className="product-card-body">
                          <div className="product-card-name" title={loja.nome}>
                            {loja.nome}
                          </div>

                          {loja.descricao && (
                            <p className="store-card-description" title={loja.descricao}>
                              {loja.descricao}
                            </p>
                          )}

                          <div className="store-card-details">
                            <span title={loja.endereco}>{loja.endereco}</span>
                            <span>{loja.telefone}</span>
                            <span title={horario}>{horario}</span>
                          </div>

                          <div className="store-card-fees">
                            <span>Servico: R$ {Number(loja.taxaServico).toFixed(2)}</span>
                            <span>Entrega: R$ {Number(loja.taxaEntrega).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="product-card-footer">
                          <span className={`disponivel-dot ${isAberto ? 'sim' : 'nao'}`}>
                            {isAberto ? 'Aberta' : 'Fechada'}
                          </span>

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
                    )
                  })}
            </div>
        </section>
    )
}
