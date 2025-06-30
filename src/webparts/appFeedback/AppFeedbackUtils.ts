import { SPHttpClient } from '@microsoft/sp-http';

/**
 * Inicializa la lógica JS del portal de retroalimentación.
 * Debe llamarse después de renderizar el HTML.
 * @param domElement El elemento raíz del WebPart (this.domElement)
 * @param styles El objeto de estilos importado del módulo SCSS
 */
export function initializePortalJS(domElement: HTMLElement, styles: { [key: string]: string }, listName: string, context: any): void {
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

  // Datos de ejemplo para la lista de comentarios
  const sampleFeedback = [
    { id: 1, title: "Excelente iniciativa de bienestar", type: "positivo", status: "Cerrado", response: "Gracias por tu comentario. Nos alegra que te haya gustado." },
    { id: 2, title: "Mejora en el sistema de tickets", type: "revision", status: "Pendiente de Revisión", response: null },
    { id: 3, title: "Idea para la cafetería", type: "revision", status: "Pendiente de Revisión", response: null },
    { id: 4, title: "Felicitaciones al equipo de soporte", type: "positivo", status: "Cerrado", response: "Hemos compartido tu felicitación con el equipo." },
    { id: 5, title: "Proceso de onboarding lento", type: "revision", status: "En Progreso", response: "Estamos trabajando en optimizar el proceso." },
    { id: 6, title: "Implementar horario flexible", type: "cerrado", status: "Cerrado", response: "Agradecemos la sugerencia. Por ahora, no se implementará." },
  ];

  const feedbackListContainer = domElement.querySelector('.' + styles['feedback-list']);

  function renderFeedback(filter = 'all') {
    if (!feedbackListContainer) return;
    feedbackListContainer.innerHTML = '';
    const filteredFeedback = sampleFeedback.filter(item => {
      if (filter === 'all') return true;
      return item.type.toLowerCase() === filter || item.status.toLowerCase().replace(' ', '') === filter;
    });

    if (filteredFeedback.length === 0) {
      feedbackListContainer.innerHTML = '<p>No hay comentarios que coincidan con este filtro.</p>';
      return;
    }

    filteredFeedback.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add(styles['feedback-item']);
      itemElement.innerHTML = `
        <div class="${styles['feedback-details']}">
          <h4>${item.title}</h4>
          <p>Estado: <strong>${item.status}</strong></p>
          ${item.response ? `<p class="${styles.response}">Respuesta: ${item.response}</p>` : ''}
        </div>
        <div class="${styles.status} ${item.type.toLowerCase()}">${item.type}</div>
      `;
      feedbackListContainer.appendChild(itemElement);
    });
  }

  // Filtros de comentarios
  const filterButtons = domElement.querySelectorAll('.' + styles['filter-btn']);
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove(styles.active));
      button.classList.add(styles.active);
      const filter = button.getAttribute('data-filter');
      renderFeedback(filter || 'all');
    });
  });

  // Carga inicial de comentarios
  renderFeedback();

  // Gráfico de Chart.js
  const chartScript = document.createElement('script');
  chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  chartScript.onload = () => {
    const ctx = (domElement.querySelector('#categoryChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx && (window as any).Chart) {
      new (window as any).Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Positivos', 'Oportunidades de Mejora', 'Ideas Innovadoras'],
          datasets: [{
            label: 'Comentarios por Categoría',
            data: [12, 19, 3],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(54, 162, 235, 0.7)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  };
  document.head.appendChild(chartScript);

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
              __metadata: { type: "SP.Data.FeedbackApplicationListItem" },
              'FeedbackDetails': details
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

