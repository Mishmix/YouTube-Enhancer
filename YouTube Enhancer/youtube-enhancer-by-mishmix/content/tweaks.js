export const GROUPS = {
  primaryMenu: {
    id: 'primaryMenu',
    titleKey: 'grpPrimaryMenu',
    descriptionKey: 'grpPrimaryMenu_desc',
    tweaks: [
      'hideHome',
      'hideSubscriptionsMenuItem',
      'hideSubscriptionsChannelsList',
      'removeEmptySubscriptionsBlock',
      'hideShortsMenuItem',
      'hideYouTubeMusicMenuItem',
      'hideDownloads',
      'hideYourVideos',
      'hideNavigatorBlock'
    ]
  },
  personalNav: {
    id: 'personalNav',
    titleKey: 'grpPersonalNav',
    descriptionKey: 'grpPersonalNav_desc',
    tweaks: [
      'hideHistory',
      'hidePlaylists',
      'hideWatchLater',
      'hideLiked',
      'hideYourClips'
    ]
  },
  moreFromYouTube: {
    id: 'moreFromYouTube',
    titleKey: 'grpMoreFromYT',
    descriptionKey: 'grpMoreFromYT_desc',
    tweaks: [
      'hideYouTubeStudio',
      'hideYouTubeKids',
      'hideMoreFromYouTubeBlockWhenEmpty'
    ]
  },
  systemLinks: {
    id: 'systemLinks',
    titleKey: 'grpSystemLinks',
    descriptionKey: 'grpSystemLinks_desc',
    tweaks: [
      'hideReportHistory',
      'hideHelp',
      'hideSendFeedback',
      'hideGuidePrimarySecondaryLinks',
      'removeCopyrightNode',
      'hideSettings'
    ]
  }
};

export const TWEAKS = {
  hideHome: {
    id: 'hideHome',
    groupId: 'primaryMenu',
    titleKey: 'hideHome_title',
    descKey: 'hideHome_desc',
    defaultEnabled: false
  },
  hideSubscriptionsMenuItem: {
    id: 'hideSubscriptionsMenuItem',
    groupId: 'primaryMenu',
    titleKey: 'hideSubscriptionsMenuItem_title',
    descKey: 'hideSubscriptionsMenuItem_desc',
    defaultEnabled: false
  },
  hideSubscriptionsChannelsList: {
    id: 'hideSubscriptionsChannelsList',
    groupId: 'primaryMenu',
    titleKey: 'hideSubscriptionsChannelsList_title',
    descKey: 'hideSubscriptionsChannelsList_desc',
    defaultEnabled: false
  },
  removeEmptySubscriptionsBlock: {
    id: 'removeEmptySubscriptionsBlock',
    groupId: 'primaryMenu',
    titleKey: 'removeEmptySubscriptionsBlock_title',
    descKey: 'removeEmptySubscriptionsBlock_desc',
    defaultEnabled: false
  },
  hideShortsMenuItem: {
    id: 'hideShortsMenuItem',
    groupId: 'primaryMenu',
    titleKey: 'hideShortsMenuItem_title',
    descKey: 'hideShortsMenuItem_desc',
    defaultEnabled: false
  },
  hideYouTubeMusicMenuItem: {
    id: 'hideYouTubeMusicMenuItem',
    groupId: 'primaryMenu',
    titleKey: 'hideYouTubeMusicMenuItem_title',
    descKey: 'hideYouTubeMusicMenuItem_desc',
    defaultEnabled: false
  },
  hideDownloads: {
    id: 'hideDownloads',
    groupId: 'primaryMenu',
    titleKey: 'hideDownloads_title',
    descKey: 'hideDownloads_desc',
    defaultEnabled: false
  },
  hideYourVideos: {
    id: 'hideYourVideos',
    groupId: 'primaryMenu',
    titleKey: 'hideYourVideos_title',
    descKey: 'hideYourVideos_desc',
    defaultEnabled: false
  },
  hideNavigatorBlock: {
    id: 'hideNavigatorBlock',
    groupId: 'primaryMenu',
    titleKey: 'hideNavigatorBlock_title',
    descKey: 'hideNavigatorBlock_desc',
    defaultEnabled: false
  },
  hideHistory: {
    id: 'hideHistory',
    groupId: 'personalNav',
    titleKey: 'hideHistory_title',
    descKey: 'hideHistory_desc',
    defaultEnabled: false
  },
  hidePlaylists: {
    id: 'hidePlaylists',
    groupId: 'personalNav',
    titleKey: 'hidePlaylists_title',
    descKey: 'hidePlaylists_desc',
    defaultEnabled: false
  },
  hideWatchLater: {
    id: 'hideWatchLater',
    groupId: 'personalNav',
    titleKey: 'hideWatchLater_title',
    descKey: 'hideWatchLater_desc',
    defaultEnabled: false
  },
  hideLiked: {
    id: 'hideLiked',
    groupId: 'personalNav',
    titleKey: 'hideLiked_title',
    descKey: 'hideLiked_desc',
    defaultEnabled: false
  },
  hideYourClips: {
    id: 'hideYourClips',
    groupId: 'personalNav',
    titleKey: 'hideYourClips_title',
    descKey: 'hideYourClips_desc',
    defaultEnabled: false
  },
  hideYouTubeStudio: {
    id: 'hideYouTubeStudio',
    groupId: 'moreFromYouTube',
    titleKey: 'hideYouTubeStudio_title',
    descKey: 'hideYouTubeStudio_desc',
    defaultEnabled: false
  },
  hideYouTubeKids: {
    id: 'hideYouTubeKids',
    groupId: 'moreFromYouTube',
    titleKey: 'hideYouTubeKids_title',
    descKey: 'hideYouTubeKids_desc',
    defaultEnabled: false
  },
  hideMoreFromYouTubeBlockWhenEmpty: {
    id: 'hideMoreFromYouTubeBlockWhenEmpty',
    groupId: 'moreFromYouTube',
    titleKey: 'hideMoreFromYouTubeBlockWhenEmpty_title',
    descKey: 'hideMoreFromYouTubeBlockWhenEmpty_desc',
    defaultEnabled: false
  },
  hideReportHistory: {
    id: 'hideReportHistory',
    groupId: 'systemLinks',
    titleKey: 'hideReportHistory_title',
    descKey: 'hideReportHistory_desc',
    defaultEnabled: false
  },
  hideHelp: {
    id: 'hideHelp',
    groupId: 'systemLinks',
    titleKey: 'hideHelp_title',
    descKey: 'hideHelp_desc',
    defaultEnabled: false
  },
  hideSendFeedback: {
    id: 'hideSendFeedback',
    groupId: 'systemLinks',
    titleKey: 'hideSendFeedback_title',
    descKey: 'hideSendFeedback_desc',
    defaultEnabled: false
  },
  hideGuidePrimarySecondaryLinks: {
    id: 'hideGuidePrimarySecondaryLinks',
    groupId: 'systemLinks',
    titleKey: 'hideGuidePrimarySecondaryLinks_title',
    descKey: 'hideGuidePrimarySecondaryLinks_desc',
    defaultEnabled: false
  },
  removeCopyrightNode: {
    id: 'removeCopyrightNode',
    groupId: 'systemLinks',
    titleKey: 'removeCopyrightNode_title',
    descKey: 'removeCopyrightNode_desc',
    defaultEnabled: false
  },
  hideSettings: {
    id: 'hideSettings',
    groupId: 'systemLinks',
    titleKey: 'hideSettings_title',
    descKey: 'hideSettings_desc',
    defaultEnabled: false
  }
};
