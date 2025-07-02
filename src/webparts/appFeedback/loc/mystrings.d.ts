declare interface IAppFeedbackWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  HeroTitleLabel: string;
  HeroDescriptionLabel: string;
  HeroButtonTextLabel: string;
  FeedbackListNameLabel: string;
  AnalystGroupNameLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
}

declare module 'AppFeedbackWebPartStrings' {
  const strings: IAppFeedbackWebPartStrings;
  export = strings;
}
