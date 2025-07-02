import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'AppFeedbackWebPartStrings';
import type { IAppFeedbackWebPartProps } from './IAppFeedbackWebPartProps';
import { getEnvironmentMessage } from './AppFeedbackUtils';
import { getPortalHtml } from './AppFeedbackRenderUtils';
import { initializePortalJS } from './AppFeedbackUtils';
import styles from './AppFeedbackWebPart.module.scss';
import { SPHttpClient } from '@microsoft/sp-http';

export default class AppFeedbackWebPart extends BaseClientSideWebPart<IAppFeedbackWebPartProps> {

  private async isUserInGroup(groupName: string): Promise<boolean> {
    const webUrl = this.context.pageContext.web.absoluteUrl;
    const userLogin = this.context.pageContext.user.loginName; // Este es el login actual
    const url = `${webUrl}/_api/web/sitegroups/getbyname('${groupName}')/users`;
    const response = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const data = await response.json();
    // Busca si el login actual está en la lista de logins del grupo
    const isMember = data.value.some((u: any) =>
      u.LoginName.toLowerCase().endsWith(userLogin.toLowerCase())
    );
    console.log('Login actual:', userLogin);
    console.log('Miembros del grupo:', data.value.map((u: any) => u.LoginName));
    console.log('¿Es miembro?', isMember);
    return isMember;
  }

  /**
   * Renderiza el contenido HTML del WebPart en el DOM.
   * Llama a la función auxiliar getAppFeedbackHtml para obtener el HTML y lo asigna al elemento raíz.
   */
  public async render(): Promise<void> {
    const isAnalyst = await this.isUserInGroup(this.properties.analystGroupName);
    this.domElement.innerHTML = getPortalHtml({
      userDisplayName: this.context.pageContext.user.displayName,
      heroTitle: this.properties.heroTitle,
      heroDescription: this.properties.heroDescription,
      heroButtonText: this.properties.heroButtonText,
      isAnalyst,
      strings
    });
    initializePortalJS(
      this.domElement,
      styles,
      this.properties.feedbackListName,
      this.context
    );
    // Eliminada la carga de Chart.js aquí. Ahora solo se carga e inicializa en initializePortalJS.
  }

  /**
   * Método de inicialización del WebPart.
   * Obtiene el mensaje del entorno de ejecución y luego renderiza el WebPart.
   * @returns Promise<void>
   */
  protected onInit(): Promise<void> {
    return getEnvironmentMessage(this.context, strings).then(message => {
      
      this.render(); // Asegura que el mensaje se muestre después de obtenerlo
    });
  }

  /**
   * Se ejecuta cuando cambia el tema (oscuro/claro).
   * Actualiza la variable interna y aplica los colores semánticos al DOM.
   * @param currentTheme Tema actual de SharePoint/Teams
   */
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

   
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  /**
   * Devuelve la versión de los datos del WebPart.
   * Es útil para el control de versiones de la configuración.
   */
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /**
   * Configuración del panel de propiedades del WebPart.
   * Permite al usuario modificar propiedades como la descripción desde la interfaz de SharePoint.
   * @returns IPropertyPaneConfiguration
   */
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('heroTitle', { label: strings.HeroTitleLabel }),
                PropertyPaneTextField('heroDescription', { label: strings.HeroDescriptionLabel }),
                PropertyPaneTextField('heroButtonText', { label: strings.HeroButtonTextLabel }),
                PropertyPaneTextField('feedbackListName', { label: strings.FeedbackListNameLabel }),
                PropertyPaneTextField('analystGroupName', { label: strings.AnalystGroupNameLabel })
              ]
            }
          ]
        }
      ]
    };
  }
}


