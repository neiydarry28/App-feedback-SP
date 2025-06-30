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
export function getPortalHtml(userDisplayName: string): string {
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
            <h2>Bienvenido al Portal de Retroalimentación</h2>
            <p>Tu voz es importante para nosotros. Este es el espacio centralizado para compartir tus ideas, sugerencias y preocupaciones. Juntos, construimos una mejor organización.</p>
            <div class="quick-access">
              <a href="#enviar" class="${styles['btn']} ${styles['btn-primary']}">Enviar un nuevo comentario</a>
            
            </div>
          </div>
        </section>
        <section id="enviar" class="${styles['portal-section']}">
          <h2>Enviar un Nuevo Comentario</h2>
          <form class="${styles['feedback-form']}">
            <div class="${styles['form-group']}">
              <label for="feedback-type">Tipo de Retroalimentación</label>
              <select id="feedback-type" name="feedback-type">
                <option value="positivo">Positivo</option>
                <option value="mejora">Oportunidad de Mejora</option>
                <option value="idea">Idea Innovadora</option>
              </select>
            </div>
            <div class="${styles['form-group']}">
              <label for="feedback-area">Área o Departamento</label>
              <input type="text" id="feedback-area" name="feedback-area" placeholder="Ej: Recursos Humanos, TI, etc.">
            </div>
            <div class="${styles['form-group']}">
              <label for="feedback-details">Descripción Detallada</label>
              <textarea id="feedback-details" name="feedback-details" rows="5" required></textarea>
            </div>
            <div class="${styles['form-group']}">
              <label for="attachment">Adjuntar Archivo (Opcional)</label>
              <input type="file" id="attachment" name="attachment">
            </div>
            <div class="${styles['form-group']} ${styles['gamification']}">
              <p>¡Gracias por tu contribución! Cada comentario te acerca a nuestra próxima insignia de "Colaborador Estrella".</p>
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