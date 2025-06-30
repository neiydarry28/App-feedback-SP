import { escape } from '@microsoft/sp-lodash-subset';
import styles from './AppFeedbackWebPart.module.scss';

export function getAppFeedbackHtml(params: {
  isDarkTheme: boolean,
  environmentMessage: string,
  userDisplayName: string,
  description: string,
  styles: any
}): string {
  return `
    <section class="${params.styles['appFeedback']}">
      <div class="${params.styles['welcome']}">
        <img alt="" src="${params.isDarkTheme ? require('./assets/welcome-dark.png') : require('./assets/welcome-light.png')}" class="${params.styles['welcomeImage']}" />
        <h2>Well done, ${escape(params.userDisplayName)}!</h2>
        <div>${params.environmentMessage}</div>
        <div>Web part property value: <strong>${escape(params.description)}</strong></div>
      </div>
      <!-- ...resto del HTML... -->
    </section>
  `;
}



/**
 * Devuelve el HTML completo del portal de retroalimentación.
 * Todas las clases relevantes usan styles['nombre-con-guion'] para compatibilidad con módulos de estilos.
 */
export function getPortalHtml(props: {
  userDisplayName: string;
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  // ...otras props si necesitas...
}): string {
  return `
    <div class="${styles['portal-container']}">
      <header class="${styles['portal-header']}">
      
        <nav class="${styles['main-nav']}">
          <a href="#inicio" class="${styles['nav-link']} active">Inicio</a>
          <a href="#enviar" class="${styles['nav-link']}">Enviar Comentario</a>
          <a href="#consultar" class="${styles['nav-link']}">Consultar Comentarios</a>
          <a href="#dashboard" class="${styles['nav-link']}">Dashboard</a>
         
        </nav>
       
      </header>
      <main class="${styles['portal-main']}">
        <section id="inicio" class="${styles['portal-section']} ${styles['active']}">
          <div class="${styles['hero-section']}">
            <h2>${props.heroTitle}</h2>
            <p>${props.heroDescription}</p>
            <div class="quick-access">
              <a href="#enviar" class="${styles['btn']} ${styles['btn-primary']}">${props.heroButtonText}</a>
            
            </div>
          </div>
        </section>
        <section id="enviar" class="${styles['portal-section']}">
          <h2>Enviar un Nuevo Comentario</h2>
          <form class="${styles['feedback-form']}">
           
           
            <div class="${styles['form-group']}">
              <label for="feedback-details">Descripción Detallada</label>
              <textarea id="feedback-details" name="feedback-details" rows="5" required></textarea>
            </div>
            
            
            <button type="submit" class="${styles['btn']} ${styles['btn-primary']}">Enviar Retroalimentación</button>
          </form>
        </section>
        <section id="consultar" class="${styles['portal-section']}">
          <h2>Consultar Comentarios</h2>
          <div class="${styles['filter-tabs']}">
            <button class="${styles['filter-btn']} active" data-filter="all">Todos</button>
            <button class="${styles['filter-btn']}" data-filter="positivo">Positivos</button>
            <button class="${styles['filter-btn']}" data-filter="revision">Pendientes de Revisión</button>
            <button class="${styles['filter-btn']}" data-filter="cerrado">Histórico Cerrado</button>
          </div>
          <div class="${styles['feedback-list']}"></div>
        </section>
        <section id="dashboard" class="${styles['portal-section']}">
          <h2>Dashboard Interactivo</h2>
          <div class="${styles['dashboard-container']}">
            <div class="${styles['chart-container']}">
              <h3>Comentarios por Categoría</h3>
              <canvas id="categoryChart"></canvas>
            </div>
          
          </div>
        </section>
       
      </main>
    </div>
  `;
}

/**
 * Inicializa la lógica de JavaScript para el portal de retroalimentación.
 */
export function initializePortalJS(domElement: HTMLElement, styles: { [key: string]: string }, listName: string, context: any): void {
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
        await context.spHttpClient.post(
          `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items`,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'Content-type': 'application/json;odata=verbose',
              'odata-version': ''
            },
            body: JSON.stringify({
              'feedback-details': details // Nombre interno del campo en la lista
            })
          }
        );
        alert('¡Comentario enviado exitosamente!');
        feedbackForm.reset();
      } catch (error) {
        alert('Error al guardar el comentario en SharePoint.');
        console.error(error);
      }
    });
  }
}