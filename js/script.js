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

    // --- REGRA DE NEGÓCIO ---
    let tarefasDaVez = [...tarefasPrincipais];
    
    // Se tiver 4 ou mais pessoas, adicionamos o "Descanso"
    if (pessoas.length >= 4) {
        tarefasDaVez.push("Descanso 😴");
    }

    // Se houver mais pessoas que tarefas, preenchemos com "Auxiliar"
    while (tarefasDaVez.length < pessoas.length) {
        tarefasDaVez.push("Auxiliar");
    }

    // Embaralha as tarefas com base na semana atual (Semente)
    const tarefasSorteadas = gerarSorteio([...tarefasDaVez], semanaCiclo);

    pessoas.forEach((nome, i) => {
        const tarefa = tarefasSorteadas[i];
        const ehDescanso = tarefa.includes("Descanso");

        corpoTabela.innerHTML += `
            <tr>
                <td><strong>${nome}</strong></td>
                <td><span class="badge ${ehDescanso ? 'badge-rest' : 'badge-work'}">${tarefa}</span></td>
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