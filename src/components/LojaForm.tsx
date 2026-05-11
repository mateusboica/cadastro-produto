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
  return (
    <aside>
      <div className="form-card">
        <div className="form-card-header">
          <h2>{editingLojaId ? 'Editar Loja' : 'Nova Loja'}</h2>
          <p>
            {editingLojaId
              ? 'Atualize os campos para salvar as alteracoes'
              : 'Preencha os campos para adicionar uma loja'}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="nome">Nome da Loja *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Ex: Restaurante do João"
              value={form.nome}
              onChange={onFieldChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="endereco">Endereco *</label>
            <input
              id="endereco"
              name="endereco"
              type="text"
              placeholder="Ex: Rua das Flores, 123 - Centro"
              value={form.endereco}
              onChange={onFieldChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="telefone">Telefone *</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={form.telefone}
              onChange={onFieldChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="descricao">Descricao *</label>
            <textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva a loja, especialidades, ambiente..."
              value={form.descricao}
              onChange={onFieldChange}
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="taxaServico">Taxa de Servico (R$) *</label>
              <input
                id="taxaServico"
                name="taxaServico"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={form.taxaServico}
                onChange={onFieldChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="taxaEntrega">Taxa de Entrega por KM (R$) *</label>
              <input
                id="taxaEntrega"
                name="taxaEntrega"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={form.taxaEntrega}
                onChange={onFieldChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Horario de Funcionamento *</label>
            <div className="schedule-grid">
              {form.horarioFuncionamento.map((horario) => {
                const dia = diasSemana.find((item) => item.value === horario.diaSemana)

                return (
                  <div
                    className={`schedule-row ${horario.ativo ? 'is-active' : ''}`}
                    key={horario.diaSemana}
                  >
                    <label className="schedule-day">
                      <input
                        type="checkbox"
                        checked={horario.ativo}
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
                        disabled={!horario.ativo}
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
                        disabled={!horario.ativo}
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

          <div className="field">
            <label htmlFor="logo">Logo da Loja *</label>
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
                  <p>Selecione uma logo</p>
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
            </div>
            <input
              id="logo"
              type="file"
              accept="image/*"
              className="input-file"
              onChange={onLogoChange}
            />
          </div>

          <button type="button" className="toggle-row" onClick={onAbertoToggle}>
            <span className="toggle-label-text">Loja Aberta</span>
            <span className="toggle">
              <input
                type="checkbox"
                checked={form.isAberto}
                onChange={onAbertoToggle}
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
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {editingLojaId ? 'Atualizar Loja' : 'Adicionar Loja'}
            </button>

            {editingLojaId && (
              <button type="button" className="btn-cancel" onClick={onResetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </aside>
  )
}
