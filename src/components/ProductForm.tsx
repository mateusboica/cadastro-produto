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
  return (
    <aside>
      <div className="form-card">
        <div className="form-card-header">
          <h2>{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h2>
          <p>
            {editingProductId
              ? 'Atualize os campos para salvar as alteracoes'
              : 'Preencha os campos para adicionar ao cardapio'}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nome">Nome do Produto *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Ex: Moqueca de Camarao"
              value={form.nome}
              onChange={onFieldChange}
              required
            />
            <div className="slug-preview">
              URL: <span>/produto/{slug || '-'}</span>
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
            <label htmlFor="descricao">Descricao</label>
            <textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva o prato, ingredientes, modo de preparo..."
              value={form.descricao}
              onChange={onFieldChange}
            />
          </div>

          <div className="field">
            <label htmlFor="imagem">Imagem do Produto</label>
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
              onChange={onImageChange}
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
                    onClick={() => onRemoveTag(tag)}
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                id="tagsInput"
                className="tags-input"
                placeholder="Digite e pressione Enter..."
                value={tagInput}
                onChange={(event) => onTagInputChange(event.target.value)}
                onKeyDown={onTagKeyDown}
              />
            </div>
            <p className="field-help">Ex: vegano, sem_gluten, picante</p>
          </div>

          <button type="button" className="toggle-row" onClick={onDisponivelToggle}>
            <span className="toggle-label-text">Disponivel no cardapio</span>
            <span className="toggle">
              <input
                type="checkbox"
                checked={form.isDisponivel}
                onChange={onDisponivelToggle}
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
              <button type="button" className="btn-cancel" onClick={onResetForm}>
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
