(()=>{window.ondrop = ((e) => {
  e.preventDefault();
  file.setWrapperVisibility(false);
  let dropText = e.dataTransfer.getData("text");
  if (dropText == "") {
    let reader = new FileReader();
    if (e.dataTransfer.files[0].name.split(".").at(-1) == "oc") {
      reader.readAsArrayBuffer(e.dataTransfer.files[0]);

      reader.onload = (readerEvent) => {
        file.loadDataBinary(new Uint8Array(readerEvent.target.result));
      };
    }
    else if (e.dataTransfer.files[0].name.split(".").at(-1) == "joc") {
      reader.readAsText(e.dataTransfer.files[0], "UTF-8");

      reader.onload = (readerEvent) => {
        file.loadDataJSON(readerEvent.target.result);
      };
    }
  } else {
    if (utility.isValidUrl(dropText)) {
      fetch(dropText)
        .then((response) => response.text())
        .then((text) => {
          file.loadData(String(text));
        });
    }
  }
})})()