manageChatForm();

function manageChatForm() {
  const form = document.querySelector("#chatForm");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    blurAndLoad(true);

    // Client side validation
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      blurAndLoad(false);
      return;
    } else {
      form.classList.remove("was-validated");
      const messageTextArea = document.getElementById("messageTextArea");
      messageTextArea.value = "";
    }

    // Add chat into a database
    postChat(formData).then(() => {
      listAllChats();
      $("#preview").empty();
    });
    blurAndLoad(false);
  });
}

/* *****  HELPER FUNCTIONS ***** */
// for rendered chat-form.ejs
function readFiles(input) {
  validateFiles(input);

  const files = input.files;
  if (files) {
    $("#preview").empty();
    Object.keys(files).forEach((i) => {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "img-thumbnail rounded icon float-start me-2";
        document.getElementById("preview").appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
  //console.log(input.files);
}

function validateFiles(input) {
  let i = 0;
  while (i < input.files.length) {
    if (!isImage(input, i)) removeFileFromFileList(i--);
    i++;
  }
  while (input.files.length > 3) removeFileFromFileList(input.files.length - 1);
}

function removeFileFromFileList(index) {
  const dt = new DataTransfer();
  const input = document.getElementById("formFileImg");
  const { files } = input;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (index !== i) dt.items.add(file);
  }
  input.files = dt.files;
}

function isImage(input, index) {
  const type = input.files[index].type;
  switch (type) {
    case "image/jpeg":
    case "image/webp":
    case "image/png":
    case "image/gif":
      return true;
  }
  return false;
}
