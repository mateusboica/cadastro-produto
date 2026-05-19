import type { ChangeEvent, FormEvent } from 'react'
import type { LojaFormState } from '../features/lojas/types'
import { diasSemana } from '../features/lojas/utils'

type LojaFormProps = {
  form: LojaFormState
  previewUrl: string | null
  isSubmitting: boolean
  editingLojaId: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onAbertoToggle: () => void
  onHorarioChange: (
    diaSemana: LojaFormState['horarioFuncionamento'][number]['diaSemana'],
    field: 'ativo' | 'horaAbertura' | 'horaFechamento',
    value: boolean | string,
  ) => void
  onResetForm: () => void
}

export default function LojaForm({
  form,
  previewUrl,
  isSubmitting,
  editingLojaId,
  onSubmit,
  onFieldChange,
  onLogoChange,
  onAbertoToggle,
  onHorarioChange,
  onResetForm,
}: LojaFormProps) {
  const descriptionLength = form.descricao.trim().length
  const activeDays = form.horarioFuncionamento.filter((horario) => horario.ativo).length

  return (
    <aside className="product-editor">
      <div className="form-card product-form-card store-form-card">
        <div className="form-card-header product-form-header">
          <div>
            <span className="form-mode-badge">{editingLojaId ? 'Edicao' : 'Nova'}</span>
            <h2>{editingLojaId ? 'Editar loja' : 'Nova loja'}</h2>
          </div>
          <span className={`form-status-pill ${form.isAberto ? 'is-live' : 'is-paused'}`}>
            {form.isAberto ? 'Aberta' : 'Fechada'}
          </span>
        </div>

        <form className="product-form store-form" onSubmit={onSubmit} noValidate>
          <section className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <h3>Identidade</h3>
            </div>

            <div className="field">
              <label htmlFor="nome">Nome da loja *</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Ex: Delicia Potiguar"
                value={form.nome}
                onChange={onFieldChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="descricao">Descricao *</label>
                <span>{descriptionLength}/1000</span>
              </div>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Especialidade, proposta da casa, diferenciais e regiao atendida."
                value={form.descricao}
                onChange={onFieldChange}
                disabled={isSubmitting}
                maxLength={1000}
              />
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <h3>Contato e taxas</h3>
            </div>

            <div className="field">
              <label htmlFor="endereco">Endereco *</label>
              <input
                id="endereco"
                name="endereco"
                type="text"
                placeholder="Rua, numero, bairro e cidade"
                value={form.endereco}
                onChange={onFieldChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="telefone">Telefone *</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="Ex: (84) 99999-9999"
                value={form.telefone}
                onChange={onFieldChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="taxaServico">Taxa de servico (R$) *</label>
                <input
                  id="taxaServico"
                  name="taxaServico"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={form.taxaServico}
                  onChange={onFieldChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="taxaEntrega">Entrega por KM (R$) *</label>
                <input
                  id="taxaEntrega"
                  name="taxaEntrega"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={form.taxaEntrega}
                  onChange={onFieldChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>03</span>
              <h3>Funcionamento</h3>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label>Horario de funcionamento *</label>
                <span>{activeDays} dia{activeDays !== 1 ? 's' : ''} ativo{activeDays !== 1 ? 's' : ''}</span>
              </div>

              <div className="schedule-grid store-schedule-grid">
                {form.horarioFuncionamento.map((horario) => {
                  const dia = diasSemana.find((item) => item.value === horario.diaSemana)

                  return (
                    <div
                      className={`schedule-row store-schedule-row ${horario.ativo ? 'is-active' : ''}`}
                      key={horario.diaSemana}
                    >
                      <label className="schedule-day">
                        <input
                          type="checkbox"
                          checked={horario.ativo}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            onHorarioChange(
                              horario.diaSemana,
                              'ativo',
                              event.target.checked,
                            )
                          }
                        />
                        <span>{dia?.label ?? horario.diaSemana}</span>
                      </label>

                      <div className="schedule-times">
                        <input
                          type="time"
                          aria-label={`${dia?.label ?? horario.diaSemana} abertura`}
                          value={horario.horaAbertura}
                          disabled={!horario.ativo || isSubmitting}
                          onChange={(event) =>
                            onHorarioChange(
                              horario.diaSemana,
                              'horaAbertura',
                              event.target.value,
                            )
                          }
                        />
                        <input
                          type="time"
                          aria-label={`${dia?.label ?? horario.diaSemana} fechamento`}
                          value={horario.horaFechamento}
                          disabled={!horario.ativo || isSubmitting}
                          onChange={(event) =>
                            onHorarioChange(
                              horario.diaSemana,
                              'horaFechamento',
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-title">
              <span>04</span>
              <h3>Logo e operacao</h3>
            </div>

            <div className="field">
              <label htmlFor="logo">Logo da loja *</label>
              <div className={`img-preview-wrap store-logo-preview ${previewUrl ? 'has-image' : ''}`}>
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
                    <p>Preview da logo</p>
                  </div>
                )}
                {previewUrl && (
                  <img
                    id="logoPreview"
                    src={previewUrl}
                    alt="Preview"
                    className="visible-image"
                  />
                )}
                <label className="image-upload-action" htmlFor="logo">
                  Trocar logo
                </label>
              </div>
              <input
                id="logo"
                type="file"
                accept="image/*"
                className="input-file input-file-hidden"
                onChange={onLogoChange}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              className="toggle-row product-switch"
              aria-pressed={form.isAberto}
              onClick={onAbertoToggle}
              disabled={isSubmitting}
            >
              <span>
                <span className="toggle-label-text">Loja aberta</span>
                <span className="toggle-helper">
                  {form.isAberto ? 'Recebendo pedidos' : 'Pausada para pedidos'}
                </span>
              </span>
              <span className="toggle">
                <input type="checkbox" checked={form.isAberto} readOnly />
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span>
                {isSubmitting
                  ? 'Salvando...'
                  : editingLojaId
                    ? 'Salvar alteracoes'
                    : 'Cadastrar loja'}
              </span>
            </button>

            {editingLojaId && (
              <button
                type="button"
                className="btn-cancel"
                onClick={onResetForm}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </aside>
  )
}
