chrome.devtools.panels.create(
  "Syft Studio",
  "img/logo-48.png",
  "./devpanel.html",
  (panel) => {
    const isRecording = false;
    panel.onSearch.addListener((action, query) => {
      console.log("search", action, query);
    });
    // const recordButton = panel.createStatusBarButton(
    //   "img/logo-32.png",
    //   "Start Recording",
    //   false
    // );
    // const onRecordingClicked = () => {
    //   if (!isRecording) {
    //     recordButton.update("img/logo-32.png", "Stop Recording", false);
    //   } else {
    //     recordButton.update("img/logo-32.png", "Start Recording", false);
    //   }
    // };
    // recordButton.onClicked.addListener(onRecordingClicked);
  }
);
export {};
