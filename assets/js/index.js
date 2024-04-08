const conversorForm = document.getElementById("conversorForm");
const api_url = "https://mindicador.cl/api/";
let myCanvaChart = null;

conversorForm.addEventListener("submit", function (e) {
  e.preventDefault();
  convert();
  loadChart();
});

const initCurrencyData = async () => {
  try {
    const response = await fetch(api_url);
    const currencyData = await response.json();

    const currencyFiltered = Object.keys(currencyData).filter(
      (element) => currencyData[element]["unidad_medida"] === "Dólar"
    );

    const currencyInfo = currencyFiltered.map((element) => ({
      codigo: currencyData[element]["codigo"],
      nombre: currencyData[element]["nombre"],
      valor: currencyData[element]["valor"],
    }));

    const selectContainer = document.querySelector("#currencySelected");

    currencyInfo.forEach((element) => {
      selectContainer.innerHTML += `<option value="${element.codigo}">${element.nombre}</option>`; });
  } catch (error) {
    console.log(error);
  }
};

const getCurrencyData = async (currency) => {
  const response = await fetch(`${api_url}${currency}`);
  const data = await response.json();
  const dataFiltered = data.serie.splice(0, 10);
  return dataFiltered;
};

const convert = async () => {
  try {
    const amount = document.getElementById("amountInput").value;
    const currency = document.getElementById("currencySelected").value;
    const data = await getCurrencyData(currency);

    const currencyValue = data[0].valor;
    const result = amount / currencyValue;

    document.getElementById("result").innerText = `Resultado: ${result.toFixed(
      2
    )} ${currency.toUpperCase()}`;
  } catch (error) {
    console.log(error);
    document.getElementById("result").innerText = `Error: ${error.message}`;
  }
}

const loadChart = async () => {
  try {
    const loading = document.getElementById("loading");
    loading.innerText = "Cargando resultados...";
    loading.style.display = "block";
  
    const currency = document.getElementById("currencySelected").value;
  
    if (myCanvaChart) myCanvaChart.destroy();
  
    const currencyData = await getCurrencyData(currency);
  
    const labels = currencyData.map((element) => new Date(element.fecha).toLocaleDateString("es-CL"));
    const data = currencyData.map((element) => element.valor);
    const datasets = [
      {
        label: currency,
        borderColor: "rgb(255, 255, 255)",
        data,
      },
    ];
    const data_render = { labels, datasets };
    handleRenderChart(data_render);
  
  } catch (error) {
    document.getElementById("result").innerText = "Error: ¡Debe seleccionar un tipo de moneda!";
  }  finally {
    loading.style.display = "none";
    loading.innerText = "";
  }
}

const handleRenderChart = (data) => {
  const config = {
    type: "line",
    data,
    options: {
      plugins: {legend: {labels: {color: "black",},},},
      scales: {
        x: {
          ticks: {color: "black",},grid: {color: "rgba(255, 255, 255,)",},
        },
        y: {ticks: {color: "black",},grid: {color: "rgba(255, 255, 255,)",},
        },
      },
    },
  };
  const myChart = document.getElementById("chart");
  myChart.style.backgroundColor = "gray";
  myCanvaChart = new Chart(myChart, config);
};

initCurrencyData();
