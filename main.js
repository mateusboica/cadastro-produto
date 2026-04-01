const API = 'https://back-camarao.onrender.com';
let tags = [];

// ── Slug ─────────────────────────────────────────────────────────────────
function gerarSlug(nome) {
    return nome.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

document.getElementById('nome').addEventListener('input', (e) => {
    const slug = gerarSlug(e.target.value);
    document.getElementById('slugVal').textContent = slug || '—';
});

// ── Image preview ─────────────────────────────────────────────────────────
document.getElementById('imagem').addEventListener('input', (e) => {
    const url = e.target.value.trim();
    const img = document.getElementById('imgPreview');
    const wrap = document.getElementById('imgPreviewWrap');
    if (url) {
        img.src = url;
        img.style.display = 'block';
        wrap.classList.add('has-image');
        img.onerror = () => {
            img.style.display = 'none';
            wrap.classList.remove('has-image');
        };
    } else {
        img.style.display = 'none';
        wrap.classList.remove('has-image');
    }
});

// ── Tags ──────────────────────────────────────────────────────────────────
document.getElementById('tagsInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = e.target.value.trim().replace(/,/g, '').replace(/\s+/g, '_').toLowerCase();
        if (val && !tags.includes(val)) {
            tags.push(val);
            renderTags();
        }
        e.target.value = '';
    }
});

function renderTags() {
    const wrap = document.getElementById('tagsWrap');
    const input = document.getElementById('tagsInput');
    wrap.innerHTML = '';
    tags.forEach((t, i) => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.innerHTML = `${t}<button onclick="removeTag(${i})" title="Remover">×</button>`;
        wrap.appendChild(chip);
    });
    wrap.appendChild(input);
    input.focus();
}

function removeTag(i) {
    tags.splice(i, 1);
    renderTags();
}

// ── Toggle disponível ─────────────────────────────────────────────────────
function toggleDisponivel() {
    const cb = document.getElementById('disponivel');
    cb.checked = !cb.checked;
}

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    document.getElementById('toastMsg').textContent = msg;
    toast.className = `show ${type}`;
    icon.textContent = type === 'success' ? '✓' : '✕';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = type; }, 3500);
}

// ── Loading state ─────────────────────────────────────────────────────────
function setLoading(on) {
    const btn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const icon = document.getElementById('submitIcon');
    const text = document.getElementById('submitText');
    btn.disabled = on;
    spinner.style.display = on ? 'block' : 'none';
    icon.style.display = on ? 'none' : 'block';
    text.textContent = on ? 'Salvando...' : 'Adicionar Produto';
}

// ── SUBMIT ────────────────────────────────────────────────────────────────
document.getElementById('produtoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const preco = parseFloat(document.getElementById('preco').value);
    const categoria = document.getElementById('categoria').value;

    if (!nome || !preco || !categoria) {
        showToast('Preencha os campos obrigatórios.', 'error');
        return;
    }

    const produto = {
        nome,
        slug: gerarSlug(nome),
        preco,
        descricao: document.getElementById('descricao').value.trim(),
        img: document.getElementById('imagem').value.trim() || null,
        categoria,
        isDisponivel: document.getElementById('disponivel').checked,
        tags,
    };

    setLoading(true);

    try {
        const res = await fetch(`${API}/api/v1/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto),
        });

        if (res.ok) {
            showToast(`"${nome}" adicionado com sucesso!`, 'success');
            e.target.reset();
            tags = [];
            renderTags();
            document.getElementById('slugVal').textContent = '—';
            document.getElementById('imgPreview').style.display = 'none';
            document.getElementById('imgPreviewWrap').classList.remove('has-image');
            document.getElementById('disponivel').checked = true;
            carregarProdutos();
        } else {
            const erro = await res.json().catch(() => ({}));
            const msg = erro.detail || erro.message || `Erro ${res.status}`;

            console.error('[Maré API] Erro ao salvar:', erro);

            if (erro.campos) {
                const campos = Object.entries(erro.campos).map(([k, v]) => `${k}: ${v}`).join(', ');
                showToast(`Campos inválidos → ${campos}`, 'error');
            } else {
                showToast(msg, 'error');
            }
        }
    } catch (err) {
        console.error('[Maré API] Erro de rede:', err);
        showToast('Sem conexão com a API. Verifique se está online.', 'error');
    } finally {
        setLoading(false);
    }
});

// ── LISTAR PRODUTOS ────────────────────────────────────────────────────────
async function carregarProdutos() {
    try {
        const res = await fetch(`${API}/api/v1/produtos?size=50`);
        const data = await res.json();
        const lista = data.content || [];
        renderProdutos(lista);
    } catch (err) {
        console.error('[Maré API] Erro ao carregar produtos:', err);
        document.getElementById('productGrid').innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>Não foi possível conectar à API.<br/>Verifique se o servidor está online.</p>
          </div>`;
    }
}

function renderProdutos(lista) {
    const grid = document.getElementById('productGrid');
    const badge = document.getElementById('countBadge');
    badge.textContent = `${lista.length} produto${lista.length !== 1 ? 's' : ''}`;

    if (!lista.length) {
        grid.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h11"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
            <p>Nenhum produto cadastrado ainda.<br/>Adicione o primeiro pelo formulário.</p>
          </div>`;
        return;
    }

    grid.innerHTML = lista.map((p, i) => `
        <div class="product-card" style="animation-delay:${i * 0.05}s">
          ${p.img
            ? `<img class="product-card-img" src="${p.img}" alt="${p.nome}" loading="lazy" onerror="this.parentElement.querySelector('.product-card-img-placeholder') && (this.style.display='none')" />`
            : `<div class="product-card-img-placeholder">🍽️</div>`
        }
          <div class="product-card-body">
            <div class="product-card-name" title="${p.nome}">${p.nome}</div>
            <div class="product-card-meta">
              <span class="product-card-price">R$ ${Number(p.preco).toFixed(2)}</span>
              <span class="product-card-cat">${formatCategoria(p.categoria)}</span>
            </div>
          </div>
          <div class="product-card-footer">
            <span class="disponivel-dot ${p.isDisponivel || p.disponivel ? 'sim' : 'nao'}">
              ${p.isDisponivel || p.disponivel ? 'Disponível' : 'Indisponível'}
            </span>
            <button class="btn-delete" onclick="deletarProduto('${p.id}', '${p.nome.replace(/'/g, "\\'")}', this)" title="Remover produto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
}

function formatCategoria(cat) {
    const map = {
        MOQUECAS: 'Moquecas', FRUTOS_DO_MAR: 'Frutos do Mar',
        ENTRADAS: 'Entradas', ACOMPANHAMENTOS: 'Acomp.',
        BEBIDAS: 'Bebidas', SOBREMESAS: 'Sobremesas',
    };
    return map[cat] || cat;
}

// ── DELETAR ───────────────────────────────────────────────────────────────
async function deletarProduto(id, nome, btn) {
    if (!confirm(`Remover "${nome}" do cardápio?`)) return;
    btn.disabled = true;
    try {
        const res = await fetch(`${API}/api/v1/produtos/${id}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            showToast(`"${nome}" removido.`, 'success');
            carregarProdutos();
        } else {
            showToast('Erro ao remover produto.', 'error');
            btn.disabled = false;
        }
    } catch {
        showToast('Erro de conexão.', 'error');
        btn.disabled = false;
    }
}

// EDITAR

async function editarProduto(id, nome, slug, preco, categoria, descricao, img, disponivel) {
    const editarProduto = document.getElementById('produtoForm');
    editarProduto.innerHTML = ` 
        <h2>Editar Produto</h2>
        <form id="editarForm">
          <input type="hidden" id="editarId" value="${id}" />
          <label for="editarNome">Nome:</label>
          <input type="text" id="editarNome" value="${nome}" required />
          <label for="editarPreco">Preço:</label>
          <input type="number" id="editarPreco" step="0.01" value="${preco}" required />
          <label for="editarCategoria">Categoria:</label>
          <select id="editarCategoria" value="${categoria}" required>
            <option value="">Selecione uma categoria</option>
            <option value="MOQUECAS">Moquecas</option>
            <option value="FRUTOS_DO_MAR">Frutos do Mar</option>
            <option value="ENTRADAS">Entradas</option>
            <option value="ACOMPANHAMENTOS">Acomp.</option>
            <option value="BEBIDAS">Bebidas</option>
            <option value="SOBREMESAS">Sobremesas</option>
          </select>
          <label for="editarDescricao">Descrição:</label>
          <textarea id="editarDescricao">${descricao}</textarea>
          <label for="editarImagem">URL da Imagem:</label>
          <input type="text" id="editarImagem" value="${img}" />
          <label for="editarDisponivel">Disponível:</label>
          <input type="checkbox" id="editarDisponivel" ${disponivel ? 'checked' : ''} />
          <button type="submit">Salvar Alterações</button>
        </form>
      `;
    document.getElementById('editarForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedProduto = {
            nome: document.getElementById('editarNome').value.trim(),
            slug: gerarSlug(document.getElementById('editarNome').value.trim()),
            preco: parseFloat(document.getElementById('editarPreco').value),
            categoria: document.getElementById('editarCategoria').value,
            descricao: document.getElementById('editarDescricao').value.trim(),
            img: document.getElementById('editarImagem').value.trim() || null,
            isDisponivel: document.getElementById('editarDisponivel').checked,
        };
        try {
            const res = await fetch(`${API}/api/v1/produtos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduto),
            });
            if (res.ok) {
                showToast(`"${updatedProduto.nome}" atualizado com sucesso!`, 'success');
                carregarProdutos();
                exibirForm();
            } else {
                const erro = await res.json().catch(() => ({}));
                const msg = erro.detail || erro.message || `Erro ${res.status}`;
                showToast(msg, 'error');
            }
        } catch (err) {
            console.error('[Maré API] Erro de rede:', err);
            showToast('Sem conexão com a API. Verifique se está online.', 'error');
        }
    });

}

function exibirForm() {
    const container = document.getElementById('produtoForm');
    container.innerHTML = `
          <div class="field">
            <label for="nome">Nome do Produto *</label>
            <input type="text" id="nome" placeholder="Ex: Moqueca de Camarão" required />
            <div class="slug-preview" id="slugPreview">
              URL: <span>/produto/<span id="slugVal">—</span></span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div class="field">
              <label for="preco">Preço (R$) *</label>
              <input type="number" id="preco" placeholder="0.00" step="0.01" min="0.01" required />
            </div>
            <div class="field">
              <label for="categoria">Categoria *</label>
              <select id="categoria" required>
                <option value="" disabled selected>Selecione</option>
                <option value="MOQUECAS">Moquecas</option>
                <option value="FRUTOS_DO_MAR">Frutos do Mar</option>
                <option value="ENTRADAS">Entradas</option>
                <option value="ACOMPANHAMENTOS">Acompanhamentos</option>
                <option value="BEBIDAS">Bebidas</option>
                <option value="SOBREMESAS">Sobremesas</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label for="descricao">Descrição</label>
            <textarea id="descricao" placeholder="Descreva o prato, ingredientes, modo de preparo..."></textarea>
          </div>

          <div class="field">
            <label>Imagem do Produto</label>
            <div class="img-preview-wrap" id="imgPreviewWrap">
              <div class="img-preview-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>Cole a URL da imagem abaixo</p>
              </div>
              <img id="imgPreview" alt="Preview" />
            </div>
            <input type="url" id="imagem" placeholder="https://exemplo.com/foto.jpg" />
          </div>

          <div class="field">
            <label>Tags</label>
            <div class="tags-input-wrap" id="tagsWrap">
              <input class="tags-input" id="tagsInput" placeholder="Digite e pressione Enter..." />
            </div>
            <p style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem;">
              Ex: vegano, sem_gluten, picante
            </p>
          </div>

          <div class="toggle-row" onclick="toggleDisponivel()">
            <span class="toggle-label-text">Disponível no cardápio</span>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" id="disponivel" checked onchange="void(0)" />
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>

          <button type="submit" class="btn-submit" id="submitBtn">
            <div class="spinner" id="spinner"></div>
            <svg id="submitIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span id="submitText">Adicionar Produto</span>
          </button>

            `;
    document.getElementById('produtoForm').addEventListener('submit', async (e) => {
        e.preventDefault();

    });

}

// ── INIT ──────────────────────────────────────────────────────────────────
carregarProdutos();
exibirForm();