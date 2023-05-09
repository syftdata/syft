chrome.devtools.panels.create(
  "Syft Studio",
  "img/logo-48.png",
  "./devpanel.html",
  (panel) => {
    panel.onSearch.addListener((action, query) => {
      console.log("search", action, query);
    });
    // const recordButton = panel.createStatusBarButton(
    //   "img/logo-32.png",
    //   "Play Recording",
    //   false
    // );
    // const onRecordingClicked = () => {
    //   void openNewTab();
    // };
    // recordButton.onClicked.addListener(onRecordingClicked);
  }
);
export {};
