import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { notifyAuthUpdated } from "../api/authContext";
import useAuthContext from "../api/authContext";
import type { AppOutletContext } from "../App";
import { gerarCorAleatoria } from "../features/products/utils";
import accountService from "../api/accountService";
import { useNavigate } from "react-router-dom";

function EditAccount() {
  const { nome, email } = useAuthContext();
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const { showToast } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const avatarColor = useMemo(
    () => (email === "Carregando..." ? "383838" : gerarCorAleatoria(nome)),
    [email, nome]
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      nome: nome === "Usuario" ? current.nome : nome,
      email: email === "Carregando..." ? current.email : email,
    }));
  }, [nome, email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.nome == nome && form.email == email) {
      showToast("Nenhuma alteracao foi feita nos dados da conta.", "error");
      return;
    }

    else {
      try {
        await accountService.editAccount(form.email, form.nome);
        notifyAuthUpdated();
        showToast("Dados da conta atualizados com sucesso.", "success");
      } catch (error) {
        console.log(error);
        showToast("Erro ao atualizar os dados da conta.", "error");
      }
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    try {
      setCarregando(true);
      await accountService.editSenha(senhaAtual, novaSenha);
      showToast("Senha atualizada com sucesso.", "success");
      setSenhaAtual('');
      setNovaSenha('');
    } catch (error) {
      console.log(error)
      showToast("Erro ao atualizar a senha.", "error");
    } finally {
      setCarregando(false);
    }
  }
  return (
    <section className="account-page">
      <div className="account-hero">
        <div className="account-hero-copy">
          <span className="account-kicker">Minha conta</span>
          <h1>Editar conta</h1>
          <p>
            Atualize seus dados de acesso e mantenha seu perfil administrativo
            organizado.
          </p>
        </div>

        <div className="account-profile-summary">
          <div className="account-avatar" aria-hidden="true">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=${avatarColor}&color=fff`}
              alt="Perfil do usuario"
            />
          </div>
          <div>
            <strong>{form.nome || "Usuario"}</strong>
            <span>{form.email || "Conta ativa"}</span>
          </div>
        </div>
      </div>

      <div className="account-layout">
        <form className="account-panel" onSubmit={handleSubmit}>
          <div className="account-panel-header">
            <span className="material-symbols-outlined" aria-hidden="true">
              badge
            </span>
            <div>
              <h2>Dados pessoais</h2>
              <p>Essas informacoes aparecem no menu da sua sessao.</p>
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="accountNome">Nome</label>
              <input
                id="accountNome"
                type="text"
                value={form.nome}
                placeholder="Seu nome"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="accountEmail">Email</label>
              <input
                id="accountEmail"
                type="email"
                value={form.email}
                placeholder="voce@empresa.com"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="account-actions">
            <button
              className="btn-cancel account-secondary-action"
              type="button"
              onClick={() => navigate('/produtos')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
              Cancelar
            </button>
            <button className="btn-submit" type="submit">
              <span className="material-symbols-outlined" aria-hidden="true">
                save
              </span>
              Salvar alteracoes
            </button>
          </div>
        </form>

        <form className="account-panel" onSubmit={handlePasswordSubmit}>
          <aside className="account-side-panel">
            <div className="account-panel-header">
              <span className="material-symbols-outlined" aria-hidden="true">
                lock
              </span>
              <div>
                <h2>Seguranca</h2>
                <p>Configure uma nova senha quando precisar reforcar o acesso.</p>
              </div>
            </div>

            <div className="field">
              <label htmlFor="senhaAtual">Senha atual</label>
              <input
                id="senhaAtual"
                type="password"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChange={event => setSenhaAtual(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                placeholder="Digite a nova senha"
                value={novaSenha}
                onChange={ (event) => setNovaSenha(event.target.value) }
              />
            </div>

            <button className="account-password-action" type="submit" disabled={carregando}>
               {carregando && <span className="spinner"></span>}
              <span>{carregando ? 'Atualizando...' : 'Atualizar senha'}</span>
              <span className="material-symbols-outlined" aria-hidden="true">
                key
              </span>
            </button>
          </aside>
           </form>
      </div>
    </section >
  );
}

export default EditAccount;
