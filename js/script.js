// 1. Configurações e Variáveis Globais
let semanaCiclo = 1;
const tarefasPrincipais = ["Lavar o Banheiro", "Arrumar o Quarto", "Devocional"];

// 2. Funções de Persistência (LocalStorage)
function salvar(dados) { localStorage.setItem("escala_estudantes", JSON.stringify(dados)); }
function carregar() { return JSON.parse(localStorage.getItem("escala_estudantes")) || []; }

// 3. Navegação de Tempo com Trava de Segurança
function navegarSemana(valor) {
    // Impede que a semana seja menor que 1
    if (semanaCiclo + valor < 1) {
        alert("Atenção: A escala começa na Semana 1!");
        return;
    }
    semanaCiclo += valor;
    renderizar();
}

// 4. Lógica de Adicionar e Remover
function adicionar() {
    const input = document.getElementById("nomeInput");
    const nome = input.value.trim();
    if (!nome) return;

    const lista = carregar();
    lista.push(nome);
    salvar(lista);
    input.value = "";
    renderizar();
}

function remover(index) {
    const lista = carregar();
    lista.splice(index, 1);
    salvar(lista);
    renderizar();
}

// 5. Função de Embaralhamento (Algoritmo Determinístico)
// Usa a semana como semente para que o resultado mude toda semana, mas seja igual para todos
function gerarSorteio(array, semente) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.abs(Math.sin(semente + m)) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// 6. Renderização da Escala e Regra de Negócio (3 vs 4 pessoas)
function renderizar() {
    const pessoas = carregar();
    const corpoTabela = document.getElementById("corpoTabela");
    const txtSemana = document.getElementById("txtSemana");

    txtSemana.innerText = "Semana " + semanaCiclo;
    corpoTabela.innerHTML = "";

    if (pessoas.length === 0) {
        corpoTabela.innerHTML = "<tr><td colspan='3'>Nenhum participante cadastrado.</td></tr>";
        return;
    }

    // 1. Definir tarefas da semana
    let tarefasDaVez = [...tarefasPrincipais];
    if (pessoas.length >= 4) {
        tarefasDaVez.push("Descanso 😴");
    }

    // Ajusta o tamanho da lista de tarefas para bater com o número de pessoas
    while (tarefasDaVez.length < pessoas.length) {
        tarefasDaVez.push("Auxiliar");
    }

    // 2. LÓGICA ANTI-REPETIÇÃO:
    // Em vez de embaralhar aleatoriamente, usamos um deslocamento (offset)
    // que muda obrigatoriamente a cada semana.
    pessoas.forEach((nome, i) => {
        // O cálculo (i + semanaCiclo) garante que a tarefa mude TODA semana.
        // O operador % (módulo) faz a lista de tarefas "girar" como um carrossel.
        const indiceCalculado = (i + semanaCiclo) % tarefasDaVez.length;
        const tarefa = tarefasDaVez[indiceCalculado];
        
        const ehDescanso = tarefa.includes("Descanso");

        corpoTabela.innerHTML += `
            <tr>
                <td><strong>${nome}</strong></td>
                <td><span class="badge ${ehDescanso ? 'badge-rest' : 'badge-work'}" onclick="abrirModal('${tarefa}')">${tarefa}</span></td>
                <td><span class="delete-icon" onclick="remover(${i})">×</span></td>
            </tr>
        `;
    });
}

// Funções de Importação/Exportação para o grupo
function exportarDados() {
    const dados = btoa(JSON.stringify(carregar()));
    navigator.clipboard.writeText(dados);
    alert("Código do grupo copiado com sucesso!");
}

function importarDados() {
    const codigo = prompt("Cole o código do grupo aqui:");
    if (codigo) {
        try {
            salvar(JSON.parse(atob(codigo)));
            renderizar();
        } catch(e) { alert("Código inválido!"); }
    }
}

// Inicializa a tabela ao carregar a página
renderizar();

function resetarTudo() {
    if (confirm("Tem certeza que deseja apagar todos os nomes e voltar para a Semana 1?")) {
        localStorage.clear();
        semanaCiclo = 1;
        renderizar();
    }
}

// Função para trocar o tema
function toggleTheme() {
    const html = document.documentElement;
    const btn = document.getElementById("themeBtn");
    
    if (html.getAttribute("data-theme") === "dark") {
        html.removeAttribute("data-theme");
        btn.innerText = "🌙";
        localStorage.setItem("tema", "light");
    } else {
        html.setAttribute("data-theme", "dark");
        btn.innerText = "☀️";
        localStorage.setItem("tema", "dark");
    }
}

// Verificar preferência salva ao carregar
(function carregarTema() {
    const temaSalvo = localStorage.getItem("tema");
    if (temaSalvo === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("themeBtn").innerText = "☀️";
    }
})();

// 1. Dicionário de Descrições das Tarefas
const descricoesTarefas = {
    "Lavar o Banheiro": "Limpar o vaso sanitário, lavar o chão, limpar o espelho e repor o papel higiênico.",
    "Arrumar o Quarto": "Organizar as camas, varrer o chão, tirar o pó dos móveis e organizar os sapatos.",
    "Devocional": "Preparar o tema do dia, separar os textos bíblicos/reflexões e conduzir o momento de oração.",
    "Descanso 😴": "Parabéns! Esta semana você está de folga das atividades principais. Aproveite para repor as energias.",
    "Auxiliar": "Ajudar em qualquer tarefa que esteja sobrecarregada ou conforme a necessidade do grupo."
};

// 2. Funções do Modal
function abrirModal(tarefa) {
    const modal = document.getElementById("modalTarefa");
    const titulo = document.getElementById("modalTitulo");
    const descricao = document.getElementById("modalDescricao");

    titulo.innerText = tarefa;
    // Pega a descrição no dicionário ou usa uma padrão caso não encontre
    descricao.innerText = descricoesTarefas[tarefa] || "Sem instruções específicas para esta tarefa.";

    modal.style.display = "block";
}

function fecharModal() {
    document.getElementById("modalTarefa").style.display = "none";
}

// Fechar se clicar fora da caixa branca
window.onclick = function(event) {
    const modal = document.getElementById("modalTarefa");
    if (event.target == modal) fecharModal();
}

// 3. Pequeno ajuste na função renderizar()
// No loop onde cria as linhas da tabela, mude o <span> da tarefa para incluir o onclick:
// Substitua o trecho antigo por este:
// <span class="badge ${ehDescanso ? 'badge-rest' : 'badge-work'}" onclick="abrirModal('${tarefa}')">${tarefa}</span>