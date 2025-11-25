const token = "OMVQmt2Q0c221W0fZCdjzP3vaVf7nIuX";
const baseUrl = "https://blynk.cloud/external/api/get";

const umidadeData = [];
const tempoData = [];

const grafico = new Chart(document.getElementById("graficoUmidade"), {
  type: "line",
  data: {
    labels: tempoData,
    datasets: [{
      label: "Umidade (%)",
      data: umidadeData,
      borderColor: "#6FEC8A",
      backgroundColor: "rgba(111, 236, 138, 0.2)",
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    scales: {
      x: { title: { display: true, text: "Tempo" } },
      y: { min: 0, max: 100, title: { display: true, text: "Umidade (%)" } }
    }
  }
});

async function atualizarDashboard() {
  try {
    const [umidade, limiar, tempo, bomba, historico] = await Promise.all([
      fetch(`${baseUrl}?token=${token}&V3`).then(res => res.text()),
      fetch(`${baseUrl}?token=${token}&V1`).then(res => res.text()),
      fetch(`${baseUrl}?token=${token}&V2`).then(res => res.text()),
      fetch(`${baseUrl}?token=${token}&V4`).then(res => res.text()),
      fetch(`${baseUrl}?token=${token}&V5`).then(res => res.text())
    ]);

    document.getElementById("umidade").innerText = `${umidade}%`;
    document.getElementById("limiar").innerText = `${limiar}%`;
    document.getElementById("tempo").innerText = `${tempo} seg`;

    const bombaLigada = ["ON", "on", "1", "true", "HIGH"].includes(bomba.trim());
    document.getElementById("bomba").innerText = bombaLigada ? "💧 Ligada" : "⛔ Desligada";

    // Atualiza gráfico com no máximo 18 pontos
    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    if (tempoData.length >= 18) {
      tempoData.shift();         // Remove o horário mais antigo
      umidadeData.shift();       // Remove o valor correspondente
    }

    tempoData.push(horaAtual);
    umidadeData.push(parseInt(umidade));
    grafico.update();

    // Atualiza histórico de irrigações (V5)
    const linhas = historico.trim().split("\n").slice(0, 3);
    const lista = document.getElementById("historico");
    lista.innerHTML = "";
    linhas.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      lista.appendChild(li);
    });

  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
  }
}

setInterval(atualizarDashboard, 5000);
atualizarDashboard();
