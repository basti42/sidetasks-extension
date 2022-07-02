var myWindowId;
const contentBox = document.querySelector("#content");
const addButton = document.querySelector("#add-new-todo-button");
const listParent = document.querySelector("#tasks-wrapper");

// global variable for todays notes
let TASKS = undefined;


function KeyPress(e) {
  var evtobj = window.event? event : e
  if (evtobj.keyCode == 13 && evtobj.ctrlKey) {
    // console.debug("[D] 'Ctrl+Enter' was just pressed.");
    // console.debug("Text content: ", getContentText()); 
    createNewNote();
  }
}

function getContentText() {
  return contentBox.value.replace(/(\r\n|\n|\r)/gm, " ");
}

function handleAddNoteButtonClick(e){
  let evtobj = window.event? event : e;
  // console.debug("[D] Button was clicked: ", evtobj);
  // console.debug("Text content: ", getContentText()); 
  createNewNote();
}

contentBox.addEventListener("keydown", KeyPress);
addButton.addEventListener("click", handleAddNoteButtonClick);

function  getKey() {
  return "sidenotes_" + new Date().getDay().toString();
}


function createNewNote(){
  let text = getContentText();
  // make a key from day of week --> sidenotes_{day-of-week}, 0 indexed starting sunday
  let today = new Date().toISOString();

  let task = { text: text, date: today, done: false };
  TASKS.push(task);
  window.localStorage.setItem(getKey(), JSON.stringify(TASKS));
  console.log("[i] added new task: ", task);

  clearAndUpdate();
}


function clearAndUpdate() {
  contentBox.value = "";
  updateContent();
}


function handleNoteClick(evt){
  let idString = this.firstChild.lastChild.innerText;
  const index = parseInt(idString.substring(1, idString.length));
  TASKS.splice(index, 1);  // remove note by index from list of notes
  window.localStorage.setItem(getKey(), JSON.stringify(TASKS));
  console.log("[i] removed task with index = ", index);
  clearAndUpdate();
}


/*  */
function updateContent() {
  let retrieval_str = window.localStorage.getItem(getKey());
  let retrieval = JSON.parse(retrieval_str);
  TASKS = retrieval != undefined ? retrieval : [];
  TASKS.sort((left, right) => { (left.date > right.date) ? 1 : ((left.date < right.date) ? -1 : 0) });
  // console.debug("[D] retrieved notes: ", NOTES);
  listParent.innerHTML = "";

  let frag = document.createDocumentFragment();
  TASKS.forEach((note, index) => {
    // console.log(`Index: ${index}, Note: `, note);
    let div = document.createElement("div");
    div.classList.add("task-element");
    let divHeader = document.createElement("div");
    divHeader.classList.add("task-element-header");
    let idSpan = document.createElement("span");
    let dateSpan = document.createElement("span");
    idSpan.innerText = "#" + index.toString();
    dateSpan.innerText = new Date(note.date).toUTCString();
    divHeader.appendChild(dateSpan);
    divHeader.appendChild(idSpan);
    let divBody = document.createElement("div");
    divBody.classList.add("task-element-body");
    divBody.innerText = note.text;
    // div.innerText = note.text;
    div.appendChild(divHeader);
    div.appendChild(divBody);
    div.addEventListener("click", handleNoteClick);

    frag.appendChild(div);

  });
  listParent.appendChild(frag);

}

/*
Update content when a new tab becomes active.
*/
browser.tabs.onActivated.addListener(updateContent);

/*
Update content when a new page is loaded into a tab.
*/
browser.tabs.onUpdated.addListener(updateContent);

/*
When the sidebar loads, reload the content to be displayed
*/
browser.windows.getCurrent({populate: true}).then((windowInfo) => {
  myWindowId = windowInfo.id;
  updateContent();
});

