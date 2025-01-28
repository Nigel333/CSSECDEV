
// ._____________________________.
// ||                           ||
// ||      Text Functions       ||
// ||___________________________||
// '                             '

// Make text bold
function makeBold() {
  document.execCommand("bold", false, null);
}

// Make text underline
function makeUnderline() {
  document.execCommand("underline", false, null);
}

// Make text italic
function makeItalic() {
  document.execCommand("italic", false, null);
}

// Make text bullet list
function makeBullet() {
  document.execCommand("insertUnorderedList", false, null);
}

// Insert image
function insertImage() {
  var url = prompt("Enter the URL of the image:");
  return url;
}

function checkTitleLength() {
  var title = document.getElementById("title").value;
  document.getElementById("title-count").textContent = title.length + "/50";
}

// ._____________________________.
// ||                           ||
// ||    Edit Post Interface    ||
// ||___________________________||
// '                    
let currentPostId;


function openEditPopup() {
  document.getElementById("edit-overlay").style.display = "block";
  document.getElementById("edit-popup").style.display = "block";
}

function closeEditPopup() {
  document.getElementById("edit-overlay").style.display = "none";
  document.getElementById("edit-popup").style.display = "none";
}

function openEditPost(post_id) {
  currentPostId = post_id;

  // Get the information of popup
  const editPostContainer = document.getElementById("edit-popup");
  const editTitleInput = editPostContainer.querySelector("#edit-title");
  const editContentInput = editPostContainer.querySelector("#edit-content");
  const editUrlInput = editPostContainer.querySelector("#edit-url");

  // Get information from document
  const title = document.querySelector("#title-" + post_id);
  const content = document.querySelector("#text-" + post_id);
  const img = document.querySelector("#sample-" + post_id);

  // Fill with original values
  editTitleInput.value = title.innerText;
  editContentInput.innerHTML = content.innerText;
  editUrlInput.value = img.innerText;
}

async function editPost() {
  try {
    const post_id = currentPostId;
    const updatedTitle = document.getElementById('edit-title').value;
    const updatedContent = document.getElementById('edit-content').innerHTML;
    const updatedUrl = document.getElementById('edit-url').value;

    const jString = JSON.stringify({ title: updatedTitle, content: updatedContent, img: updatedUrl });

    const response = await fetch(`/post/${post_id}`, {
      method: 'PUT',
      body: jString,
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 200) {
      console.log("Post updated");
      const post = await response.json();
      const editedFlag = document.getElementById(`post-edited-${post_id}`);
      if (post.edited) {
        editedFlag.setAttribute('data-edited', 'true');
        editedFlag.innerText = 'Edited';
      } else {
        editedFlag.setAttribute('data-edited', 'false');
        editedFlag.innerText = '';
      }
      location.reload();
    } else {
      console.error("Bad request");
    }
  } catch (error) {
    console.error("Error during post update:", error);
  }
  closeEditPopup();
}

document.addEventListener("DOMContentLoaded", function () {

  var editButtons = document.querySelectorAll(".edit-button");
  var editPostButtons = document.querySelectorAll(".edit-popup-submit");

  editButtons.forEach(function (editButton) {
    var post_id = editButton.closest(".post-container").id;
    editButton.addEventListener("click", function () {
      openEditPost(post_id);
    })
  })

  editPostButtons.forEach(function (editPopupButton) {
    var post_id = editPopupButton.closest(".edit-popup-submit").id;
    editPopupButton.addEventListener("click", function () {
      editPost(post_id);
    })
  })
})

// ._____________________________.
// ||                           ||
// ||        Delete Post        ||
// ||___________________________||
// '                    

async function deletePost(post_id) {
  try {
    const response = await fetch(`/post/${post_id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.status === 200) {
      console.log("Post deleted");
      location.reload();
    } else {
      console.error("Bad request");
    }
  } catch (error) {
    console.error("Error during post deletion:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {

  var deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach(function (deleteButton) {
    var post_id = deleteButton.closest(".post-container").id;
    deleteButton.addEventListener("click", function () {
      deletePost(post_id);
    })
  })
})

// ._____________________________.
// ||                           ||
// ||   Create Post Interface   ||
// ||___________________________||
// '                             '

function openPopup() {
  document.getElementById("overlay").style.display = "";
  document.getElementById("popup").style.display = "";
}

function closePopup() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
}

function openCreatePost() {
  const createPostContainer = document.createElement("div");
  createPostContainer.innerHTML = `<div id="overlay" style="display: none;"></div>
  <div id="popup" style="display: none;">
      <span id="close" onclick="closePopup()">✕</span>
      <h2>Create a post</h2>
      <div id="title-container">
          <textarea id="title" placeholder="Title" maxlength="50"
              oninput="checkTitleLength()"></textarea>
          <span id="title-count">0/50</span>
      </div>

      <div id="toolbar">
          <button class="toolbar-buttons" onclick="makeBold()"><strong>B</strong></button>
          <button class="toolbar-buttons" onclick="makeUnderline()"><u>U</u></button>
          <button class="toolbar-buttons" onclick="makeItalic()"><em>I</em></button>
          <button class="toolbar-buttons" onclick="makeBullet()"><img src="/static/images/icons/bullet.png"
                  alt="Bullet Form"></button>
          <button class="toolbar-buttons" onclick="insertImage()"><img src="/static/images/icons/image.png"
                  alt="Insert Image"></button>
      </div>

      <div id="content" contenteditable="true" placeholder="Content"
          style="border: 1px solid #ccc; padding: 5px;"></div>
      <br>

      <div>
          <label for="url">URL:</label>
          <input type="text" id="url" placeholder="Enter URL" style="padding: 15px 10px; margin: 0;">
      </div>
      <br>
      <button id="popup-submit">Submit</button>
  </div>`;

  document.body.appendChild(createPostContainer);
}

function resetCreatePost() {
  const content = document.querySelector('#content');
  const title = document.querySelector('#title');
  const url = document.querySelector('#url');
  const titleCtr = document.querySelector('#title-count');

  content.innerHTML = "";
  title.value = "";
  url.value = "";
  titleCtr.innerText = "0/50";
}

// .________________________.
// ||			                 ||
// ||     Submits Post     ||
// ||______________________||
// '			                  '
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#popup-submit")?.addEventListener("click", async e => {
    e.preventDefault();

    const content = document.querySelector("#content").innerText;
    const title = document.getElementById("title").value;
    const image = document.getElementById("url").value;

    console.log({ title, content, image });
    const jString = JSON.stringify({ title, content, image });
    console.log(jString);

    const response = await fetch("/post", {
      method: 'POST',
      body: jString,
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    // Access the post_id from the response data
    const newPost = data.post_id;

    if (response.status == 200)
      window.location.href = '/view/' + newPost;
    else
      console.error("Bad request");

    resetCreatePost();
    document.getElementById("submit-message").innerHTML = "Post Submitted!";
    document.getElementById("submit-message").style.color = "green";

  })
});

document.addEventListener("DOMContentLoaded", function () {

  // .________________________.
  // ||			                 ||
  // ||      Save Post       ||
  // ||______________________||
  // '			                  '
  var saveButtons = document.querySelectorAll(".save-button");

  saveButtons.forEach(function (saveButton) {
    var parentPost = saveButton.closest(".post-container"); // Get the closest parent post container
    var currentPost = parentPost;

    var saveImage = saveButton.querySelector(".save");
    saveButton.addEventListener("click", savePost);

    async function savePost() {
      if (saveImage.src.includes("save.png")) {
        saveImage.src = "/static/images/post/clicked/c-saved.png";
      } else {
        saveImage.src = "/static/images/post/save.png";
      }

      const jString = JSON.stringify({ post_id: currentPost.id });
      const response = await fetch("/save", {
        method: 'POST',
        body: jString,
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response);
      if (response.status == 200)
        console.log("success");
      else
        console.error("Bad request");
    }
  });

  // .________________________.
  // ||			                 ||
  // ||     Vote Buttons     ||
  // ||______________________||
  // '			                  '

  var upvoteButtons = document.querySelectorAll(".upvote-button");

  upvoteButtons.forEach(function (upvoteButton) {
    var parentPost = upvoteButton.closest(".post-container"); // Get the closest parent post container
    var downvoteButton = parentPost.querySelector(".downvote-button");
    var numVotes = parentPost.querySelector(".num-votes");
    var post_id = parentPost.id;

    var upvoteImage = upvoteButton.querySelector(".upvote");
    var downvoteImage = downvoteButton.querySelector(".downvote");

    upvoteButton.addEventListener("click", upvotePost);
    downvoteButton.addEventListener("click", downvotePost);
    //var votes = parseInt(numVotes.textContent)

    async function upvotePost() {
      if (upvoteImage.src.includes("upvote.png") && downvoteImage.src.includes("downvote.png")) {
        upvoteImage.src = "/static/images/post/clicked/c-upvoted.png";
        numVotes.textContent++;
      }
      else if (downvoteImage.src.includes("c-downvoted.png")) {
        upvoteImage.src = "/static/images/post/clicked/c-upvoted.png";
        downvoteImage.src = "/static/images/post/downvote.png"
        numVotes.textContent++;
        numVotes.textContent++;
      } else {
        upvoteImage.src = "/static/images/post/upvote.png";
        numVotes.textContent--;
      }

      const jString = JSON.stringify({ votes: parseInt(numVotes.textContent), post_id, check: "up" });
      const response = await fetch("/vote", {
        method: 'POST',
        body: jString,
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response);
      if (response.status == 200)
        console.log("Success");
      else
        console.error("Bad request");
    }

    async function downvotePost() {
      if (downvoteImage.src.includes("downvote.png") && upvoteImage.src.includes("upvote.png")) {
        downvoteImage.src = "/static/images/post/clicked/c-downvoted.png";
        upvoteImage.src = "/static/images/post/upvote.png";
        numVotes.textContent--;
      }
      else if (upvoteImage.src.includes("c-upvoted.png")) {
        downvoteImage.src = "/static/images/post/clicked/c-downvoted.png";
        upvoteImage.src = "/static/images/post/upvote.png";
        numVotes.textContent--;
        numVotes.textContent--;
      }
      else {
        downvoteImage.src = "/static/images/post/downvote.png";
        numVotes.textContent++;
      }
      const jString = JSON.stringify({ votes: parseInt(numVotes.textContent), post_id, check: "down" });
      const response = await fetch("/vote", {
        method: 'POST',
        body: jString,
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response);
      if (response.status == 200)
        console.log("Success");
      else
        console.error("Bad request");
    }
  });
});

