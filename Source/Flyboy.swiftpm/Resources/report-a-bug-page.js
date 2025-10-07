///////////////////////////////////////////////////////////
// REPORT A BUG PAGE
///////////////////////////////////////////////////////////

/** Class representing the report a bug page of Flyboy. */
class ReportABugPage extends ui.Page
{
  /** Public method called to dismiss the modal the report a bug page is being served in. */
  dismiss()
  {
    let reportABugModal = app.getComponentById({ id: 'report-a-bug-modal' });
    reportABugModal.dismiss();
  }
  
  /** Public method called to check if a user input string is empty or not. */
  isStringEmpty({ string } = {})
  {
    return string.trim() === '';
  }

  /** Public method called to check if a email string is a valid email or not. */
  isValidEmail({ email } = {}) 
  {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /** Public method called when the page is initialized. */
  onInit()
  {
    this.setupNavBar();
    this.setupList();
    this.setupLoadingModal();
  }

  /** Public method called to present an invalid input alert. */
  presentInvalidInputAlert({ message } = {})
  {
    let okButton = new ui.AlertDialogButton({ text: 'Ok' });
    let invalidReportAlert = new ui.AlertDialog({ title: 'Invalid input', rowfooter: true, buttons: [ okButton ] });
    invalidReportAlert.addComponents({ components: [ new ui.Text({ text: message }) ]});
    invalidReportAlert.present();
  }

  /** Public method called to present a thank you alert. */
  presentThankYouAlert()
  {
    let okButton = new ui.AlertDialogButton({ text: 'Ok', onTap: () => { this.dismiss() } });
    let thankyouAlert = new ui.AlertDialog({ title: 'Success', rowfooter: true, buttons: [ okButton ] });
    thankyouAlert.addComponents({ components: [ new ui.Text({ text: 'Bug reported successfully' }) ]});
    thankyouAlert.present();
  }

  /** Public method called to set up the list with all of it's items and components. */
  setupList()
  {
    this.titleTextfield = new ui.Textfield({ width: '100%', placeholder: 'A title that summarizes the bug...' });
    this.titleTextfield.underbar = false;

    this.descriptionTextArea = new ui.TextArea({ width: '100%', placeholder: "A detailed description of what's going wrong...", rows: 5, maxLength: 240 });
    this.descriptionTextArea.element.classList = 'textarea textarea--transparent';

    this.emailTextfield = new ui.Textfield({ type: 'email', width: '100%', placeholder: 'A good email for discussing the bug...' });
    this.emailTextfield.underbar = false;

    let reportABugList = new ui.List();
    reportABugList.addItem({ item: new ui.ListHeader({ text: 'Title' }) });
    reportABugList.addItem({ item: new ui.ListItem({ center: this.titleTextfield  }) });
    reportABugList.addItem({ item: new ui.ListHeader({ text: 'Description' }) });
    reportABugList.addItem({ item: new ui.ListItem({ center: this.descriptionTextArea }) });
    reportABugList.addItem({ item: new ui.ListHeader({ text: 'Email' }) });
    reportABugList.addItem({ item: new ui.ListItem({ center: this.emailTextfield  }) });
    
    this.addComponents({ components: [ reportABugList ] });
  }

  /** Public method called to set up the loading modal. */
  setupLoadingModal()
  {
    this.loadingModal = new ui.Modal();
    this.loadingModal.addComponents({ components: [ new ui.CircularProgress({ indeterminate: true, size: '80px', color: 'white' }) ] });
  }

  /** Public method called to set the navigation bar of the report a bug page. */
  setupNavBar()
  {
    this.navigationBarTitle = 'Report A Bug';
    let cancelButton = new ui.BarButton({ text: 'Cancel', onTap: () => { this.dismiss() } });
    let sendButton = new ui.BarButton({ icon: 'ion-ios-paper-plane', onTap: () => { this.submitBugReport() } });
    this.navigationBarButtonsLeft = [ cancelButton ];
    this.navigationBarButtonsRight = [ sendButton ];
  }

  /** Public method called to submit the bug report to github. Shows modal state until a response comes in and then gives the user a success message. */
  submitBugReport()
  {
    if(this.isStringEmpty({ string: this.titleTextfield.text }))
    {
      this.presentInvalidInputAlert({ message: 'Title cannot be empty' });
      return;
    } 

    if(this.isStringEmpty({ string: this.descriptionTextArea.text }))
    {
      this.presentInvalidInputAlert({ message: 'Description cannot be empty' });
      return;
    } 
      
    if(!this.isValidEmail({ email: this.emailTextfield.text })) 
    {
      this.presentInvalidInputAlert({ message: 'Email must be in the correct form' });
      return;
    }

    this.loadingModal.present();

    let issue = 
    {
      title: `[Reported In App] ${this.titleTextfield.text}`,
      body: `## Description\n${this.descriptionTextArea.text}\n\n**Reported by:** ${this.emailTextfield.text}\n\n**Core version:** ${app.coreVersion}\n\n**Core release date:** ${app.coreReleaseDate}`,
      labels: ['bug']
    };

    fetch('https://api.github.com/repos/cobocombo/Flyboy/issues', 
    {
      method: 'POST',
      headers: 
      {
        'Authorization': `Bearer ${_githubSecret_}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issue)
    })
    .then(response => 
    {
      if(response.ok) console.log('Bug reported successfully'); 
      else return response.json().then(data => { console.error(data.message); });
      setTimeout(() => { this.loadingModal.dismiss(); }, 2000);
      setTimeout(() => { this.presentThankYouAlert(); }, 2500);
    })
    .catch(error => 
    {
      console.error(error);
      setTimeout(() => { this.loadingModal.dismiss(); }, 2000);
      setTimeout(() => { this.presentThankYouAlert(); }, 2500);
    });
  }
}

///////////////////////////////////////////////////////////