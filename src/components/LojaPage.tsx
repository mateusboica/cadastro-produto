import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import imageService from '../api/imageService'
import lojaService, { type Loja } from '../api/lojaService'
import type { AppOutletContext } from '../App'
import type { LojaApiError, LojaFormState } from '../features/lojas/types'
import {
  createEditableLojaFormState,
  createDefaultHorarioFuncionamento,
  createLojaPayload,
  getLojaApiErrorMessage,
} from '../features/lojas/utils'
import LojaForm from './LojaForm'
import LojaList from './LojaList'

const emptyFormState = (): LojaFormState => ({
  nome: '',
  endereco: '',
  descricao: '',
  telefone: '',
  isAberto: true,
  logoFile: null,
  existingLogo: null,
  taxaServico: '',
  taxaEntrega: '',
  horarioFuncionamento: createDefaultHorarioFuncionamento(),
})

async function uploadParaImgBB(arquivo: File) {
  try {
    return await imageService.upload(arquivo)
  } catch (error) {
    console.error('Erro de conexao com ImgBB:', error)
    return null
  }
}

export default function LojaPage() {
  const { showToast } = useOutletContext<AppOutletContext>()
  const [lojas, setLojas] = useState<Loja[]>([])
  const [isLoadingLojas, setIsLoadingLojas] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<LojaFormState>(emptyFormState)
  const [editingLojaId, setEditingLojaId] = useState<string | null>(null)
  const [lojasError, setLojasError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    carregarLojas()
  }, [])

  useEffect(() => {
    if (!form.logoFile) {
      setPreviewUrl(form.existingLogo)
      return
    }

    const objectUrl = URL.createObjectURL(form.logoFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [form.logoFile, form.existingLogo])

  async function carregarLojas() {
    setIsLoadingLojas(true)
    setLojasError(false)

    try {
      const lojaList = await lojaService.list()
      setLojas(lojaList)
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
      setLojas([])
      setLojasError(true)
    } finally {
      setIsLoadingLojas(false)
    }
  }

  function resetForm() {
    setForm(emptyFormState())
    setEditingLojaId(null)
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleAbertoToggle() {
    setForm((current) => ({
      ...current,
      isAberto: !current.isAberto,
    }))
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setForm((current) => ({
      ...current,
      logoFile: file,
    }))
  }

  function handleHorarioChange(
    diaSemana: LojaFormState['horarioFuncionamento'][number]['diaSemana'],
    field: 'ativo' | 'horaAbertura' | 'horaFechamento',
    value: boolean | string,
  ) {
    setForm((current) => ({
      ...current,
      horarioFuncionamento: current.horarioFuncionamento.map((horario) =>
        horario.diaSemana === diaSemana ? { ...horario, [field]: value } : horario,
      ),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nome = form.nome.trim()
    const endereco = form.endereco.trim()
    const telefone = form.telefone.trim()
    const descricao = form.descricao.trim()
    const taxaServico = Number.parseFloat(form.taxaServico)
    const taxaEntrega = Number.parseFloat(form.taxaEntrega)
    const horariosAtivos = form.horarioFuncionamento.filter((horario) => horario.ativo)

    if (
      !nome ||
      !descricao ||
      !endereco ||
      !telefone ||
      Number.isNaN(taxaServico) ||
      Number.isNaN(taxaEntrega) ||
      horariosAtivos.length === 0
    ) {
      showToast('Preencha os campos obrigatorios.', 'error')
      return
    }

    const hasInvalidHorario = horariosAtivos.some(
      (horario) =>
        !horario.horaAbertura ||
        !horario.horaFechamento ||
        horario.horaFechamento <= horario.horaAbertura,
    )

    if (hasInvalidHorario) {
      showToast('Confira os horarios: o fechamento deve ser depois da abertura.', 'error')
      return
    }

    let logoUrl = form.existingLogo

    if (form.logoFile) {
      showToast('Fazendo upload da logo...', 'success')
      logoUrl = await uploadParaImgBB(form.logoFile)

      if (!logoUrl) {
        showToast('Falha no upload da logo. Tente novamente.', 'error')
        return
      }
    }

    if (!logoUrl) {
      showToast('A logo da loja e obrigatoria.', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const lojaPayload = {
        ...createLojaPayload(form),
        logoUrl,
      }

      if (editingLojaId) {
        await lojaService.update(editingLojaId, lojaPayload)
      } else {
        await lojaService.create(lojaPayload)
      }

      showToast(
        editingLojaId
          ? `"${nome}" atualizada com sucesso!`
          : `"${nome}" adicionada com sucesso!`,
        'success',
      )
      resetForm()
      await carregarLojas()
    } catch (error) {
      const { message, fields } = getLojaApiErrorMessage(error as LojaApiError)

      console.error('Erro de rede:', error)

      if (fields) {
        const campos = Object.entries(fields)
          .map(([campo, valor]) => `${campo}: ${valor}`)
          .join(', ')

        showToast(`Campos invalidos -> ${campos}`, 'error')
      } else {
        showToast(message, 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(loja: Loja) {
    setEditingLojaId(loja.id)
    setForm(createEditableLojaFormState(loja))
  }

  async function handleDelete(loja: Loja) {
    const confirmed = window.confirm(`Remover "${loja.nome}" da lista?`)

    if (!confirmed) {
      return
    }

    try {
      await lojaService.remove(loja.id)

      showToast(`"${loja.nome}" removida.`, 'success')
      await carregarLojas()
      if (editingLojaId === loja.id) {
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao remover loja:', error)
      showToast('Erro de conexao.', 'error')
    }
  }

  return (
    <div className="page">
      <LojaForm
        form={form}
        previewUrl={previewUrl}
        isSubmitting={isSubmitting}
        editingLojaId={editingLojaId}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        onLogoChange={handleLogoChange}
        onAbertoToggle={handleAbertoToggle}
        onHorarioChange={handleHorarioChange}
        onResetForm={resetForm}
      />

      <LojaList
        lojas={lojas}
        isLoadingLojas={isLoadingLojas}
        lojasError={lojasError}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
