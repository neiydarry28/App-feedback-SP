import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
//import { escape } from '@microsoft/sp-lodash-subset';

import styles from './AppFeedbackWebPart.module.scss';
import * as strings from 'AppFeedbackWebPartStrings';
import type { IAppFeedbackWebPartProps } from './IAppFeedbackWebPartProps';
import { getEnvironmentMessage } from './AppFeedbackUtils';
import { getAppFeedbackHtml } from './AppFeedbackRenderUtils';

export default class AppFeedbackWebPart extends BaseClientSideWebPart<IAppFeedbackWebPartProps> {

  // Indica si el tema actual es oscuro
  private _isDarkTheme: boolean = false;
  // Almacena el mensaje del entorno (Teams, SharePoint, etc.)
  private _environmentMessage: string = '';

  /**
   * Renderiza el contenido HTML del WebPart en el DOM.
   * Llama a la función auxiliar getAppFeedbackHtml para obtener el HTML y lo asigna al elemento raíz.
   */
  public render(): void {
    this.domElement.innerHTML = getAppFeedbackHtml({
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      userDisplayName: this.context.pageContext.user.displayName,
      description: this.properties.description,
      styles
    });
  }

  /**
   * Método de inicialización del WebPart.
   * Obtiene el mensaje del entorno de ejecución y luego renderiza el WebPart.
   * @returns Promise<void>
   */
  protected onInit(): Promise<void> {
    return getEnvironmentMessage(this.context, strings).then(message => {
      this._environmentMessage = message;
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

    this._isDarkTheme = !!currentTheme.isInverted;
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
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
