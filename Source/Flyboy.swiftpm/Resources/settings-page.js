///////////////////////////////////////////////////////////
// SETTINGS PAGE
///////////////////////////////////////////////////////////

/** Class representing the settings page shown in the settings dialog. */
class SettingsPage extends ui.Page
{
  sound;

  constructor({ sound } = {})
  {
    super();
    this.sound = sound;
  }

  /** Public method called when the page is initialized. */
  onInit()
  {
    let dialog = app.getComponentById({ id: 'settings-dialog' });
    this.navigationBarTitle = 'Settings';
    this.doneButton = new ui.BarButton({ text: 'Done', onTap: () => 
    { 
      this.save();
      dialog.dismiss(); 
      this.sound.play('tap', { volume: 0.8, loop: false });
    }});

    this.navigationBarButtonsRight = [ this.doneButton ];
    this.setupBody();
  }
  
  /** Public method called when the user taps the privacy policy item. */
  privacyPolicyItemTapped()
  {
    browser.open({ url: 'https://github.com/cobocombo/Flyboy/blob/main/PRIVACY_POLICY.md', inApp: true, animated: true });
  }
  
  /** Public method called when the user taps the report a bug item. */
  reportABugItemTapped()
  {
    let reportABugModal = new ui.Modal({ id: 'report-a-bug-modal' });
    reportABugModal.present({ root: new ReportABugPage() });
  }

  /** Public method called to set the body of the settings page. */
  setupBody()
  {
    let settings = userSettings.getSettings();
    this.soundSwitch = new ui.Switch({ checked: settings.soundOn });

    let settingsList = new ui.List();
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-musical-notes', size: '32px' }), center: 'Sound', right: this.soundSwitch }) });
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-bug', size: '32px' }), center: 'Report A Bug', tappable: true, modifiers: ['chevron'], onTap: this.reportABugItemTapped.bind(this) }) });
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-eye', size: '32px' }), center: "Privacy Policy", tappable: true, modifiers: ['chevron'], onTap: this.privacyPolicyItemTapped.bind(this) }) });
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-information-circle', size: '30px' }), center: 'Version: 1.0' }) });
    this.addComponents({ components: [ settingsList ]});
  }

  /** Public method called to save the current settings from settings page. */
  save()
  {
    userSettings.addSettings({ soundOn: this.soundSwitch.checked });
    if(this.soundSwitch.checked === true) this.sound.mute = false;
    else this.sound.mute = true;
  }
}

///////////////////////////////////////////////////////////