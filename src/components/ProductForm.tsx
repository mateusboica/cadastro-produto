import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { CATEGORY_OPTIONS } from '../features/products/constants'
import type { FormState } from '../features/products/types'

type ProductFormProps = {
  form: FormState
  tagInput: string
  slug: string
  previewUrl: string | null
  isSubmitting: boolean
  editingProductId: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onTagInputChange: (value: string) => void
  onTagKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onRemoveTag: (tag: string) => void
  onDisponivelToggle: () => void
  onResetForm: () => void
}

export default function ProductForm({
  form,
  tagInput,
  slug,
  previewUrl,
  isSubmitting,
  editingProductId,
  onSubmit,
  onFieldChange,
  onImageChange,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
  onDisponivelToggle,
  onResetForm,
}: ProductFormProps) {
  const modeLabel = editingProductId ? 'Edicao' : 'Novo'
  const descriptionLength = form.descricao.trim().length

  return (
    <aside className="product-editor">
      <div className="form-card product-form-card">
        <div className="form-card-header product-form-header">
          <div>
            <span className="form-mode-badge">{modeLabel}</span>
            <h2>{editingProductId ? 'Editar produto' : 'Novo produto'}</h2>
          </div>
          <span className={`form-status-pill ${form.isDisponivel ? 'is-live' : 'is-paused'}`}>
            {form.isDisponivel ? 'Publicado' : 'Pausado'}
          </span>
        </div>

        <form className="product-form" onSubmit={onSubmit} noValidate>
          <section className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <h3>Identificacao</h3>
            </div>

            <div className="field">
              <label htmlFor="nome">Nome do produto *</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Ex: Moqueca de Camarao"
                value={form.nome}
                onChange={onFieldChange}
                disabled={isSubmitting}
                required
              />
              <div className="slug-preview">
                <span>/produto/{slug || '-'}</span>
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="preco">Preco (R$) *</label>
                <input
                  id="preco"
                  name="preco"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={form.preco}
                  onChange={onFieldChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="categoria">Categoria *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={onFieldChange}
                  disabled={isSubmitting}
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
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <h3>Conteudo</h3>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="descricao">Descricao *</label>
                <span>{descriptionLength}/1000</span>
              </div>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Ingredientes, preparo, acompanhamentos e diferenciais."
                value={form.descricao}
                onChange={onFieldChange}
                disabled={isSubmitting}
                maxLength={1000}
              />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="tagsInput">Tags</label>
                <span>{form.tags.length}/12</span>
              </div>
              <div className="tags-input-wrap">
                {form.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      title="Remover"
                      disabled={isSubmitting}
                      onClick={() => onRemoveTag(tag)}
                    >
                      x
                    </button>
                  </span>
                ))}
                <input
                  id="tagsInput"
                  className="tags-input"
                  placeholder="Digite e pressione Enter"
                  value={tagInput}
                  onChange={(event) => onTagInputChange(event.target.value)}
                  onKeyDown={onTagKeyDown}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>03</span>
              <h3>Imagem e venda</h3>
            </div>

            <div className="field">
              <label htmlFor="imagem">Imagem do produto *</label>
              <div className={`img-preview-wrap ${previewUrl ? 'has-image' : ''}`}>
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
                    <p>Preview da foto</p>
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
                <label className="image-upload-action" htmlFor="imagem">
                  Trocar imagem
                </label>
              </div>
              <input
                id="imagem"
                type="file"
                accept="image/*"
                className="input-file input-file-hidden"
                onChange={onImageChange}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              className="toggle-row product-switch"
              aria-pressed={form.isDisponivel}
              onClick={onDisponivelToggle}
              disabled={isSubmitting}
            >
              <span>
                <span className="toggle-label-text">Disponivel no cardapio</span>
                <span className="toggle-helper">
                  {form.isDisponivel ? 'Cliente pode comprar' : 'Oculto para compra'}
                </span>
              </span>
              <span className="toggle">
                <input type="checkbox" checked={form.isDisponivel} readOnly />
                <span className="toggle-track"></span>
                <span className="toggle-thumb"></span>
              </span>
            </button>
          </section>

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
                    <>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </>
                  ) : (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </>
                  )}
                </svg>
              )}
              <span>
                {isSubmitting
                  ? 'Salvando...'
                  : editingProductId
                    ? 'Salvar alteracoes'
                    : 'Cadastrar produto'}
              </span>
            </button>

            {editingProductId && (
              <button
                type="button"
                className="btn-cancel"
                onClick={onResetForm}
                disabled={isSubmitting}
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
  )
}
