import { escape } from '@microsoft/sp-lodash-subset';

export function getAppFeedbackHtml(params: {
  isDarkTheme: boolean,
  environmentMessage: string,
  userDisplayName: string,
  description: string,
  styles: any
}): string {
  return `
    <section class="${params.styles.appFeedback}">
      <div class="${params.styles.welcome}">
        <img alt="" src="${params.isDarkTheme ? require('./assets/welcome-dark.png') : require('./assets/welcome-light.png')}" class="${params.styles.welcomeImage}" />
        <h2>Well done, ${escape(params.userDisplayName)}!</h2>
        <div>${params.environmentMessage}</div>
        <div>Web part property value: <strong>${escape(params.description)}</strong></div>
      </div>
      <!-- ...resto del HTML... -->
    </section>
  `;
}