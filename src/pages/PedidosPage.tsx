import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import pedidoService, { type Order, type OrderStatus } from '../api/pedidoService'
import type { AppOutletContext } from '../App'

type StatusFilter = OrderStatus | 'TODOS'

const STATUS_LABELS: Record<OrderStatus, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEBIDO: 'EM_PREPARO',
  EM_PREPARO: 'SAIU_PARA_ENTREGA',
  SAIU_PARA_ENTREGA: 'ENTREGUE',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Sem data'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

const normalizePhone = (value: string) => value.replace(/\D/g, '')

const getStatusLabel = (status: OrderStatus) => STATUS_LABELS[status] || status

export default function PedidosPage() {
  const { showToast } = useOutletContext<AppOutletContext>()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || orders[0] || null,
    [orders, selectedOrderId],
  )

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    const phone = normalizePhone(searchTerm)

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'TODOS' || order.status === statusFilter
      const matchesSearch =
        !search ||
        [
          order.codigo,
          order.nomeCliente,
          order.enderecoEntrega,
          order.metodoPagamento,
          order.statusLabel,
          getStatusLabel(order.status),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search) ||
        normalizePhone(order.telefoneCliente).includes(phone)

      return matchesStatus && matchesSearch
    })
  }, [orders, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const active = orders.filter(
      (order) => !['ENTREGUE', 'CANCELADO'].includes(order.status),
    )
    const revenueToday = orders
      .filter((order) => {
        if (!order.createdAt || order.status === 'CANCELADO') {
          return false
        }

        const created = new Date(order.createdAt)
        const now = new Date()
        return created.toDateString() === now.toDateString()
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0)

    return {
      total: orders.length,
      active: active.length,
      delivered: orders.filter((order) => order.status === 'ENTREGUE').length,
      revenueToday,
    }
  }, [orders])

  async function loadOrders() {
    setIsLoading(true)
    setHasError(false)

    try {
      const list = await pedidoService.list()
      setOrders(list)
      setSelectedOrderId((current) => current ?? list[0]?.id ?? null)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setHasError(true)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdvanceStatus(order: Order) {
    const nextStatus = NEXT_STATUS[order.status]

    if (!nextStatus) {
      return
    }

    try {
      setUpdatingOrderId(order.id)
      const updated = await pedidoService.updateStatus(order.id, nextStatus)
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedOrderId(updated.id)
      showToast(`Pedido ${updated.codigo || updated.id} atualizado.`, 'success')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showToast('Nao foi possivel atualizar o status.', 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleCancelOrder(order: Order) {
    const confirmed = window.confirm(`Cancelar o pedido ${order.codigo || order.id}?`)

    if (!confirmed) {
      return
    }

    try {
      setUpdatingOrderId(order.id)
      const updated = await pedidoService.updateStatus(order.id, 'CANCELADO', 'Cancelado pelo painel')
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSelectedOrderId(updated.id)
      showToast(`Pedido ${updated.codigo || updated.id} cancelado.`, 'success')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      showToast('Nao foi possivel cancelar o pedido.', 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="orders-page-shell">
      <section className="product-command-bar orders-command-bar">
        <div>
          <span className="product-kicker">Acompanhamento</span>
          <h1>Pedidos</h1>
          <p>Controle a fila, avance status e acompanhe cada pedido em tempo real operacional.</p>
        </div>

        <div className="product-stats" aria-label="Resumo dos pedidos">
          <div className="product-stat">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="product-stat">
            <span>Em aberto</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="product-stat">
            <span>Entregues</span>
            <strong>{stats.delivered}</strong>
          </div>
          <div className="product-stat">
            <span>Hoje</span>
            <strong>{formatCurrency(stats.revenueToday)}</strong>
          </div>
        </div>
      </section>

      <section className="orders-workspace">
        <div className="orders-list-panel">
          <div className="product-toolbar orders-toolbar">
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
                placeholder="Buscar codigo, cliente, telefone ou endereco"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              aria-label="Filtrar status"
            >
              <option value="TODOS">Todos status</option>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option value={status} key={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="orders-list">
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <div className="order-row skeleton-order-row" key={index}>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-subtitle"></div>
                </div>
              ))}

            {!isLoading && hasError && (
              <div className="empty-state">
                <p>Nao foi possivel conectar a API de pedidos.</p>
              </div>
            )}

            {!isLoading && !hasError && filteredOrders.length === 0 && (
              <div className="empty-state">
                <p>Nenhum pedido encontrado para os filtros atuais.</p>
              </div>
            )}

            {!isLoading &&
              !hasError &&
              filteredOrders.map((order) => (
                <button
                  type="button"
                  className={`order-row ${selectedOrder?.id === order.id ? 'is-selected' : ''}`}
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <span className={`order-status-dot status-${order.status.toLowerCase()}`}></span>
                  <span className="order-row-main">
                    <strong>{order.codigo || `#${order.id.slice(-6)}`}</strong>
                    <small>{order.nomeCliente}</small>
                  </span>
                  <span className="order-row-side">
                    <strong>{formatCurrency(order.total)}</strong>
                    <small>{formatDateTime(order.createdAt)}</small>
                  </span>
                </button>
              ))}
          </div>
        </div>

        <div className="order-detail-panel">
          {selectedOrder ? (
            <>
              <div className="order-detail-header">
                <div>
                  <span className={`order-status-pill status-${selectedOrder.status.toLowerCase()}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  <h2>{selectedOrder.codigo || `#${selectedOrder.id.slice(-6)}`}</h2>
                  <p>{formatDateTime(selectedOrder.createdAt)}</p>
                </div>

                <div className="order-detail-actions">
                  {NEXT_STATUS[selectedOrder.status] && (
                    <button
                      type="button"
                      className="btn-submit"
                      disabled={updatingOrderId === selectedOrder.id}
                      onClick={() => handleAdvanceStatus(selectedOrder)}
                    >
                      {updatingOrderId === selectedOrder.id
                        ? 'Atualizando...'
                        : `Avancar para ${getStatusLabel(NEXT_STATUS[selectedOrder.status] as OrderStatus)}`}
                    </button>
                  )}

                  {!['ENTREGUE', 'CANCELADO'].includes(selectedOrder.status) && (
                    <button
                      type="button"
                      className="btn-cancel"
                      disabled={updatingOrderId === selectedOrder.id}
                      onClick={() => handleCancelOrder(selectedOrder)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="order-detail-grid">
                <section>
                  <span>Cliente</span>
                  <strong>{selectedOrder.nomeCliente}</strong>
                  <p>{selectedOrder.telefoneCliente}</p>
                </section>
                <section>
                  <span>Entrega</span>
                  <strong>{selectedOrder.endereco?.bairro || 'Endereco'}</strong>
                  <p>{selectedOrder.enderecoEntrega}</p>
                </section>
                <section>
                  <span>Pagamento</span>
                  <strong>{selectedOrder.metodoPagamento || 'Nao informado'}</strong>
                  <p>
                    {selectedOrder.trocoPara
                      ? `Troco para ${formatCurrency(selectedOrder.trocoPara)}`
                      : 'Sem troco informado'}
                  </p>
                </section>
              </div>

              <section className="order-items-panel">
                <div className="order-section-heading">
                  <span>Itens</span>
                  <strong>{selectedOrder.itens.length} item{selectedOrder.itens.length !== 1 ? 's' : ''}</strong>
                </div>

                {selectedOrder.itens.map((item) => (
                  <div className="order-item-row" key={item.produtoId}>
                    <div>
                      <strong>{item.nomeProduto}</strong>
                      <span>{item.quantidade} x {formatCurrency(item.precoUnitario)}</span>
                    </div>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </section>

              <section className="order-total-panel">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(selectedOrder.subtotal)}</strong>
                </div>
                <div>
                  <span>Servico</span>
                  <strong>{formatCurrency(selectedOrder.taxaServico)}</strong>
                </div>
                <div>
                  <span>Entrega</span>
                  <strong>{formatCurrency(selectedOrder.taxaEntrega)}</strong>
                </div>
                <div className="order-total-main">
                  <span>Total</span>
                  <strong>{formatCurrency(selectedOrder.total)}</strong>
                </div>
              </section>

              <section className="order-history-panel">
                <div className="order-section-heading">
                  <span>Linha do tempo</span>
                  <strong>{formatDateTime(selectedOrder.statusAtualizadoEm || selectedOrder.updatedAt)}</strong>
                </div>

                {(selectedOrder.historicoStatus || []).map((history) => (
                  <div className="order-history-row" key={`${history.status}-${history.alteradoEm}`}>
                    <span className={`order-status-dot status-${history.status.toLowerCase()}`}></span>
                    <div>
                      <strong>{history.statusLabel || getStatusLabel(history.status)}</strong>
                      <small>{formatDateTime(history.alteradoEm)}</small>
                      {history.observacao && <p>{history.observacao}</p>}
                    </div>
                  </div>
                ))}
              </section>
            </>
          ) : (
            <div className="empty-state">
              <p>Selecione um pedido para acompanhar os detalhes.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
