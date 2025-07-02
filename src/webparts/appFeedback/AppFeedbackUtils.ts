import { SPHttpClient } from '@microsoft/sp-http';
// @ts-ignore: Chart is loaded as an external global by SPFx externals
import Chart from 'Chart';

/**
 * Inicializa la lógica JS del portal de retroalimentación.
 * Debe llamarse después de renderizar el HTML.
 * @param domElement El elemento raíz del WebPart (this.domElement)
 * @param styles El objeto de estilos importado del módulo SCSS
 */
let chartLoaded = false;

export function initializePortalJS(domElement: HTMLElement, styles: { [key: string]: string }, listName: string, context: any): void {
  console.log('initializePortalJS ejecutándose');
  
  // Utiliza los nombres de clase generados por el módulo de estilos
  const navLinks = domElement.querySelectorAll('.' + styles['nav-link'] + ', .quick-access .' + styles['btn']);
  const sections = domElement.querySelectorAll('.' + styles['portal-section']);
  const menuToggle = domElement.querySelector('.' + styles['menu-toggle']);
  const mainNav = domElement.querySelector('.' + styles['main-nav']);

  // Navegación principal
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);

      sections.forEach(section => {
        section.classList.remove(styles.active);
        if (section.id === targetId) {
          section.classList.add(styles.active);
        }
      });

      navLinks.forEach(nav => nav.classList.remove(styles.active));
      const navLink = domElement.querySelector(`.${styles['nav-link']}[href="#${targetId}"]`);
      if (navLink) navLink.classList.add(styles.active);

      if (mainNav && mainNav.classList.contains(styles.active)) {
        mainNav.classList.remove(styles.active);
      }
    });
  });

  // Menú hamburguesa para móviles
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle(styles.active);
    });
  }

  const feedbackListContainer = domElement.querySelector('.' + styles['feedback-list']);

  // Obtiene los comentarios desde la lista de SharePoint
  async function fetchFeedbackFromList(filter = 'all') {
    const items: any[] = [];
    try {
      const response = await context.spHttpClient.get(
        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items?$select=Id,FeedbackDetails,Sentiment,Keyphrases,Created`,
        SPHttpClient.configurations.v1
      );
      if (response.ok) {
        const data = await response.json();
        // Mapea los campos de SharePoint a los usados en el render
        data.value.forEach((item: any) => {
          items.push({
            id: item.Id,
            title: item.FeedbackDetails,
            type: item.Sentiment,
            status: item.Sentiment,
            response: item.Keyphrases,
            created: item.Created // <-- Agregado
          });
        });
      }
    } catch (error) {
      console.error('Error al obtener comentarios de SharePoint:', error);
    }
    // Filtrado por tipo si aplica
    if (filter !== 'all') {
      return items.filter(item => item.type?.toLowerCase() === filter);
    }
    return items;
  }

  let currentSort: 'desc' | 'asc' = 'desc'; // Por defecto descendente
  let sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

  // Renderiza los comentarios obtenidos de la lista
  async function renderFeedback(filter = 'all', sort: 'desc' | 'asc' = currentSort) {
    if (!feedbackListContainer) return;
    feedbackListContainer.innerHTML = '<p>Cargando comentarios...</p>';
    let feedbackItems = await fetchFeedbackFromList(filter);

    // Ordenar por fecha
    feedbackItems = feedbackItems.sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // --- Contar por Sentiment ---
    sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    // --- Agrupar por mes y sentimiento ---
    const monthlySentiment: { [month: string]: { positive: number; negative: number; neutral: number } } = {};
    const monthlyVolume: { [month: string]: number } = {};
    // --- Contar keyphrases ---
    const keyphraseCounts: { [key: string]: number } = {};
    feedbackItems.forEach(item => {
      const sentiment = (item.type || '').toLowerCase() as keyof typeof sentimentCounts;
      if (sentimentCounts.hasOwnProperty(sentiment)) {
        sentimentCounts[sentiment]++;
      }
      // Agrupar por mes
      const date = new Date(item.created);
      const month = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`; // YYYY-MM
      if (!monthlySentiment[month]) monthlySentiment[month] = { positive: 0, negative: 0, neutral: 0 };
      if (!monthlyVolume[month]) monthlyVolume[month] = 0;
      if (sentimentCounts.hasOwnProperty(sentiment)) {
        monthlySentiment[month][sentiment]++;
      }
      monthlyVolume[month]++;
      // Procesar keyphrases
      if (item.response) {
        try {
          const phrases = JSON.parse(item.response);
          if (Array.isArray(phrases)) {
            phrases.forEach((phrase: string) => {
              keyphraseCounts[phrase] = (keyphraseCounts[phrase] || 0) + 1;
            });
          }
        } catch {
          item.response.split(',').forEach((phrase: string) => {
            const clean = phrase.trim().replace(/[\[\]"]/g, '');
            if (clean) keyphraseCounts[clean] = (keyphraseCounts[clean] || 0) + 1;
          });
        }
      }
    });

    if (!feedbackItems || feedbackItems.length === 0) {
      feedbackListContainer.innerHTML = '<p>No hay comentarios que coincidan con este filtro.</p>';
      return;
    }

    feedbackListContainer.innerHTML = '';
    feedbackItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add(styles['feedback-item']);
      // Formatea la fecha a un formato legible
      const fecha = item.created ? new Date(item.created).toLocaleString() : '';
      itemElement.innerHTML = `
        <div class="${styles['feedback-details']}">
          <h4>${item.title || ''}</h4>
          ${item.response ? `<p class="${styles.response}">Keyphrases: ${item.response}</p>` : ''}
          ${item.type ? `<p class="${styles.type}">Sentiment: ${item.type}</p>` : ''}
          ${fecha ? `<p class="${styles.date}">Fecha: ${fecha}</p>` : ''}
        </div>
      `;
      feedbackListContainer.appendChild(itemElement);
    });
    const feedbackCount = feedbackItems.length;
    const countSpan = domElement.querySelector('#feedback-count');
    if (countSpan) {
      countSpan.textContent = `(${feedbackCount})`;
    }

    // Actualizar el gráfico si ya está cargado
    if ((window as any).categoryChartInstance) {
      (window as any).categoryChartInstance.data.datasets[0].data = [
        sentimentCounts.positive,
        sentimentCounts.negative,
        sentimentCounts.neutral
      ];
      (window as any).categoryChartInstance.update();
    }
    // Actualizar gráfico de barras agrupadas
    if ((window as any).barSentimentChartInstance) {
      const months = Object.keys(monthlySentiment).sort();
      (window as any).barSentimentChartInstance.data.labels = months;
      (window as any).barSentimentChartInstance.data.datasets[0].data = months.map(m => monthlySentiment[m].positive);
      (window as any).barSentimentChartInstance.data.datasets[1].data = months.map(m => monthlySentiment[m].negative);
      (window as any).barSentimentChartInstance.data.datasets[2].data = months.map(m => monthlySentiment[m].neutral);
      (window as any).barSentimentChartInstance.update();
    }
    // Actualizar gráfico de líneas de volumen
    if ((window as any).lineVolumeChartInstance) {
      const months = Object.keys(monthlyVolume).sort();
      (window as any).lineVolumeChartInstance.data.labels = months;
      (window as any).lineVolumeChartInstance.data.datasets[0].data = months.map(m => monthlyVolume[m]);
      (window as any).lineVolumeChartInstance.update();
    }
    // Actualizar gráfico de barras horizontal de keyphrases
    if ((window as any).keyphrasesBarChartInstance) {
      const phrases = Object.keys(keyphraseCounts);
      const counts = phrases.map(p => keyphraseCounts[p]);
      (window as any).keyphrasesBarChartInstance.data.labels = phrases;
      (window as any).keyphrasesBarChartInstance.data.datasets[0].data = counts;
      (window as any).keyphrasesBarChartInstance.update();
    }
  }

  // Filtros de comentarios
  const filterButtons = domElement.querySelectorAll('.' + styles['filter-btn'] + ':not(.' + styles['filter-sort'] + ')');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove(styles.active));
      button.classList.add(styles.active);
      const filter = button.getAttribute('data-filter');
      renderFeedback(filter || 'all', currentSort);
    });
  });

  // Botones de orden
  const sortButtons = domElement.querySelectorAll('.' + styles['filter-sort']);
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      sortButtons.forEach(btn => btn.classList.remove(styles.active));
      button.classList.add(styles.active);
      const sort = button.getAttribute('data-sort') as 'desc' | 'asc';
      currentSort = sort;
      // Obtén el filtro activo actual
      const activeFilterBtn = domElement.querySelector('.' + styles['filter-btn'] + '.' + styles.active + ':not(.' + styles['filter-sort'] + ')');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      renderFeedback(filter || 'all', currentSort);
    });
  });

  // Carga inicial de comentarios desde SharePoint
  renderFeedback('all', currentSort);

  // Recargar comentarios al hacer click en "Consultar Comentarios"
  const consultarLink = domElement.querySelector('a[href="#consultar"]');
  if (consultarLink) {
    consultarLink.addEventListener('click', () => {
      renderFeedback('all'); // Vuelve a consultar y renderizar todos los comentarios
    });
  }

  // Cargar Chart.js solo una vez
  function loadChartJsAndInitChart(callback: () => void) {
    if ((window as any).Chart) {
      callback();
      return;
    }
    if (!chartLoaded) {
      chartLoaded = true;
      const chartScript = document.createElement('script');
      chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"; // Usa la versión UMD
      chartScript.onload = () => {
        // Espera activa hasta que Chart esté disponible
        const interval = setInterval(() => {
          if ((window as any).Chart) {
            clearInterval(interval);
            callback();
          }
        }, 50);
      };
      document.head.appendChild(chartScript);
    } else {
      // Si ya se está cargando, espera y reintenta
      const interval = setInterval(() => {
        if ((window as any).Chart) {
          clearInterval(interval);
          callback();
        }
      }, 100);
    }
  }

  // Inicializar el gráfico después de renderizar el HTML y cuando el canvas existe
  loadChartJsAndInitChart(() => {
    // Inicializar el gráfico de doughnut (ya existente)
    const canvas = domElement.querySelector('#categoryChart');
    const ctx = (canvas as HTMLCanvasElement)?.getContext('2d');
    if (ctx && Chart) {
      (window as any).categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Negative', 'Neutral'],
          datasets: [{
            label: 'Comentarios por Sentiment',
            data: [0, 0, 0],
            backgroundColor: [
              'rgba(40, 167, 69, 0.7)',
              'rgba(220, 53, 69, 0.7)',
              'rgba(255, 193, 7, 0.7)'
            ],
            borderColor: [
              'rgba(40, 167, 69, 1)',
              'rgba(220, 53, 69, 1)',
              'rgba(255, 193, 7, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
        }
      });
    }

    // Inicializar gráfico de barras agrupadas por mes y sentimiento
    const barCanvas = domElement.querySelector('#barSentimentChart');
    const barCtx = (barCanvas as HTMLCanvasElement)?.getContext('2d');
    if (barCtx && Chart) {
      (window as any).barSentimentChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: [], // meses
          datasets: [
            { label: 'Positivos', data: [], backgroundColor: 'rgba(40, 167, 69, 0.7)' },
            { label: 'Negativos', data: [], backgroundColor: 'rgba(220, 53, 69, 0.7)' },
            { label: 'Neutrales', data: [], backgroundColor: 'rgba(255, 193, 7, 0.7)' }
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      });
    }

    // Inicializar gráfico de líneas de volumen total por mes
    const lineCanvas = domElement.querySelector('#lineVolumeChart');
    const lineCtx = (lineCanvas as HTMLCanvasElement)?.getContext('2d');
    if (lineCtx && Chart) {
      (window as any).lineVolumeChartInstance = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: [], // meses
          datasets: [
            { label: 'Total Comentarios', data: [], fill: false, borderColor: '#0078D4', tension: 0.2 }
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Inicializar gráfico de barras horizontal de keyphrases
    const keyphrasesCanvas = domElement.querySelector('#keyphrasesBarChart') as HTMLCanvasElement;
    const keyphrasesCtx = keyphrasesCanvas?.getContext('2d');
    if (keyphrasesCtx && Chart) {
      (window as any).keyphrasesBarChartInstance = new Chart(keyphrasesCtx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Frecuencia',
            data: [],
            backgroundColor: '#0078D4'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      });
    }

    // Renderizar los comentarios inicialmente
    renderFeedback('all', currentSort);
  });

  // Manejo del formulario de feedback
  const feedbackForm = domElement.querySelector('.' + styles['feedback-form']) as HTMLFormElement;
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const details = (feedbackForm.querySelector('#feedback-details') as HTMLTextAreaElement)?.value;

      if (!details) {
        alert('Por favor, ingresa tu comentario.');
        return;
      }

      try {
        const now = new Date();
        const formattedDate = now.toISOString(); // ISO format, e.g., "2024-06-07T12:34:56.789Z"
        const response = await context.spHttpClient.post(
          `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=verbose',
              'Content-type': 'application/json;odata=verbose',
              'odata-version': ''
            },
            body: JSON.stringify({
              __metadata: { type: `SP.Data.${listName.replace(/\s/g, '')}ListItem` },
              'FeedbackDetails': details,
              'Title': "record-" + formattedDate
            })
          }
        );

        if (response.ok) {
          alert('¡Comentario enviado exitosamente!');
          feedbackForm.reset();
        } else {
          const errorText = await response.text();
          alert('Error al guardar el comentario en SharePoint.');
          console.error('Error HTTP:', response.status, errorText);
        }
      } catch (error) {
        alert('Error al guardar el comentario en SharePoint.');
        console.error(error);
      }
    });
  }
}

export async function getEnvironmentMessage(context: any, strings: any): Promise<string> {
  if (!!context.sdks.microsoftTeams) {
    const ctx = await context.sdks.microsoftTeams.teamsJs.app.getContext();
    let environmentMessage: string = '';
    switch (ctx.app.host.name) {
      case 'Office':
        environmentMessage = context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
        break;
      case 'Outlook':
        environmentMessage = context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
        break;
      case 'Teams':
      case 'TeamsModern':
        environmentMessage = context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
        break;
      default:
        environmentMessage = strings.UnknownEnvironment;
    }
    return environmentMessage;
  }
  return context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
}


