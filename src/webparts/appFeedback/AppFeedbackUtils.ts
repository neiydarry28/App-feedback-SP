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