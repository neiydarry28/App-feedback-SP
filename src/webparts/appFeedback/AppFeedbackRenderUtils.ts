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
  isAnalyst: boolean;
  strings: any;
}): string {
  const s = props.strings;
  return `
    <div class="${styles['portal-container']}">
      <header class="${styles['portal-header']}">
        <nav class="${styles['main-nav']}">
          <a href="#inicio" class="${styles['nav-link']} active">${s.Inicio}</a>
          <a href="#enviar" class="${styles['nav-link']}">${s.EnviarComentario}</a>
          ${props.isAnalyst ? `
            <a href="#consultar" class="${styles['nav-link']}">${s.ConsultComments}</a>
            <a href="#dashboard" class="${styles['nav-link']}">${s.Dashboard}</a>
          ` : ''}
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
          <h2>${s.FeedbackFormTitle}</h2>
          <form class="${styles['feedback-form']}">
            <div class="${styles['form-group']}">
              <textarea id="feedback-details" name="feedback-details" rows="5" required placeholder="${s.FeedbackPlaceholder}"></textarea>
            </div>
            <button type="submit" class="${styles['btn']} ${styles['btn-primary']}">${s.SendButton}</button>
          </form>
        </section>
        ${props.isAnalyst ? `
        <section id="consultar" class="${styles['portal-section']}">
          <h2>${s.ConsultComments} <span id="feedback-count" class="${styles['feedback-count']}">(0)</span></h2>
          <div class="${styles['filter-tabs']}">
            <button class="${styles['filter-btn']} ${styles['filter-all']} active" data-filter="all">${s.FilterAll}</button>
            <button class="${styles['filter-btn']} ${styles['filter-positive']}" data-filter="positive">${s.FilterPositive}</button>
            <button class="${styles['filter-btn']} ${styles['filter-negative']}" data-filter="negative">${s.FilterNegative}</button>
            <button class="${styles['filter-btn']} ${styles['filter-neutral']}" data-filter="neutral">${s.FilterNeutral}</button>
            <button class="${styles['filter-btn']} ${styles['filter-sort']}" data-sort="desc" title="${s.Recent}">&#8595; ${s.Recent}</button>
            <button class="${styles['filter-btn']} ${styles['filter-sort']}" data-sort="asc" title="${s.Oldest}">&#8593; ${s.Oldest}</button>
          </div>
          <div class="${styles['feedback-list']}"></div>
        </section>
        <section id="dashboard" class="${styles['portal-section']}">
          <h2>${s.DashboardTitle}</h2>
          <div class="${styles['dashboard-container']}">
            <div class="${styles['chart-container']}">
              <div class="chart-description">${s.ChartDescSentiment}</div>
              <div class="chart-title">${s.DistribucionSentimientos || 'Distribución de Sentimientos'}</div>
              <canvas id="categoryChart"></canvas>
            </div>
            <div class="${styles['chart-container']}">
              <div class="chart-description">${s.ChartDescMonthly}</div>
              <div class="chart-title">${s.EvolucionMensual || 'Evolución Mensual por Sentimiento'}</div>
              <canvas id="barSentimentChart"></canvas>
            </div>
            <div class="${styles['chart-container']}">
              <div class="chart-description">${s.ChartDescVolume}</div>
              <div class="chart-title">${s.VolumenTotal || 'Volumen Total de Comentarios'}</div>
              <canvas id="lineVolumeChart"></canvas>
            </div>
            <div class="${styles['chart-container']}">
              <div class="chart-description">${s.ChartDescKeyphrases}</div>
              <div class="chart-title">${s.FrecuenciaKeyphrases || 'Frecuencia de Palabras Clave'}</div>
              <canvas id="keyphrasesBarChart"></canvas>
            </div>
          </div>
        </section>
        ` : ''}
      </main>
    </div>
  `;
}