// Pega o elemento HTML com id="container" para manipular depois
const containerHTML = document.getElementById("container");

// Variáveis globais para armazenar as perguntas, o índice da pergunta atual e os pontos do usuário
let listaDePerguntas = []
let perguntaAtual = 0
let pontos = 0

// Embaralhar de forma correta e segura (Fisher-Yates + Cópia)
function embaralharArray(array) {
    // Faz uma cópia do array para não alterar o original
    const copia = [...array];

    // Algoritmo Fisher-Yates para embaralhar
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]]; // Troca os elementos
    }

    return copia; // Retorna o array embaralhado
}


// Função principal para montar o quiz
async function montarPerguntas() {
    // Inicializa o conteúdo do container (limpa o que tinha antes)
    containerHTML.innerHTML = `
        <div class = "campoPontos">
            <p>Pontos: <span class = "pontos">0</span></p>
        </div>
        <div id = "quiz"></div>
    `
    // Pega a div onde as perguntas serão mostradas
    const quizDiv = document.getElementById("quiz")

    // Faz uma requisição para buscar as perguntas no servidor
    const perguntas = await fetch("http://localhost:3000/perguntas")
    listaDePerguntas = await perguntas.json()// Converte a resposta para JSON
    
    // Mostra a primeira pergunta
    mostrarPergunta(quizDiv)
}

// Função para mostrar uma pergunta por vez
function mostrarPergunta(quizDiv){
    // Limpa a div do quiz antes de mostrar uma nova pergunta
    quizDiv.innerHTML = ""

    // Se já respondeu todas as perguntas, mostra o resultado final
    if(perguntaAtual>=listaDePerguntas.length){
        quizDiv.innerHTML = `
            <h2>Quiz Finalizado!</h2>
            <p>Você fez ${pontos} ponto(s).</p>
            <button id="reiniciarQuiz">Reiniciar Quiz</button>
        `
        //Adiciona um evento que ao ser clicado no botão de reiniciar o quiz o programa é execultado novamente
        document.getElementById("reiniciarQuiz").addEventListener("click", reiniciarQuiz)
        return //Sai da função
    }

    // Pega a pergunta atual da lista
    const pergunta = listaDePerguntas[perguntaAtual]

    // Cria uma lista com as alternativas da pergunta
    const alternativas = [
        pergunta.resposta1, 
        pergunta.resposta2, 
        pergunta.resposta3, 
        pergunta.resposta4
    ]
    const alternativasEmbaralhadas = embaralharArray(alternativas)

    let opcoesHTML = "" 
    // Monta o HTML das alternativas como inputs do tipo "radio"
    alternativasEmbaralhadas.forEach((texto,i)=>{
        const idInput = `pergunta${pergunta.id}_resposta${i}`
        opcoesHTML +=`
            <span>
                <input type = "radio" id = "${idInput}" name = "resposta" value = "${texto}">
                <label for="${idInput}">${texto}</label>
            </span>
        `
    })

    // Insere a pergunta e as alternativas dentro da div do quiz
    quizDiv.innerHTML = `
        <h1>${pergunta.pergunta}</h1>
        <div class="respostas">${opcoesHTML}</div>
        <button id="confirmarResposta">Confirmar</button>
    `

    // Adiciona um evento de clique ao botão "Confirmar"
    document.getElementById("confirmarResposta").addEventListener("click", confirmarResposta)
}

// Função para confirmar a resposta selecionada
function confirmarResposta(){
    // Pega todos os inputs de resposta
    const respostas = document.getElementsByName("resposta")
    let respostaSelecionada = null
    
    // Verifica qual resposta foi selecionada
    respostas.forEach(resposta=>{

        if(resposta.checked){
            respostaSelecionada = resposta.value
        }
    })

    // Se não selecionou nenhuma resposta, alerta o usuário
    if (respostaSelecionada === null) {
        alert("Por favor, selecione uma resposta!")
        return
    }

    // Verifica se a resposta selecionada é a correta
    const pergunta = listaDePerguntas[perguntaAtual]
    
    // Pega todos os inputs e labels
    respostas.forEach(resposta => {
        const label = document.querySelector(`label[for="${resposta.id}"]`);

        // Destaca a resposta correta em verde
        if (resposta.value === pergunta.respostaCorreta) {
            label.style.color = "green";
            label.style.fontWeight = "bold";
        }

        // Se for a resposta marcada mas errada, destaca em vermelho
        if (resposta.checked && resposta.value !== pergunta.respostaCorreta) {
            label.style.color = "red";
            label.style.fontWeight = "bold";
        }
    });

    // Se acertou, soma ponto
    if (respostaSelecionada === pergunta.respostaCorreta) {
        pontos++;
        atualizarPontos();
    }

    // Desabilita os inputs para não mudar depois de responder
    respostas.forEach(resposta => resposta.disabled = true);

    // Verifica se é a última pergunta
    const botaoConfirmar = document.getElementById("confirmarResposta");

    if (perguntaAtual === listaDePerguntas.length - 1) {
        // Se for a última pergunta, muda para "Finalizar Quiz"
        botaoConfirmar.textContent = "Finalizar Quiz";
        botaoConfirmar.removeEventListener("click", confirmarResposta);
        botaoConfirmar.addEventListener("click", finalizarQuiz);
    } else {
        // Se não for a última pergunta, muda para "Próxima Pergunta"
        botaoConfirmar.textContent = "Próxima Pergunta";
        botaoConfirmar.removeEventListener("click", confirmarResposta);
        botaoConfirmar.addEventListener("click", () => {
            perguntaAtual++;
            mostrarPergunta(document.getElementById("quiz"));
        });
    }
}

function finalizarQuiz() {
    // Aqui você pode adicionar o código para finalizar o quiz, como exibir a pontuação final
    alert("Quiz finalizado! Sua pontuação final é: " + pontos);
    // Redireciona ou reinicia o quiz se necessário
    reiniciarQuiz()
}

// Função para atualizar a pontuação exibida na tela
function atualizarPontos() {
    // Atualiza o texto dentro do elemento com classe "pontos"
    document.querySelector(".pontos").textContent = pontos
}

//Função que execulta a ação de recomeçar o quiz quando solicitada
function reiniciarQuiz() {
    perguntaAtual = 0
    pontos = 0
    montarPerguntas()
}
// Chama a função para começar o quiz assim que o script for carregado
montarPerguntas()