
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
  const title = document.querySelector(".title");
  const content = document.querySelector(".text");
  const img = document.querySelector(".class");

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
    var post_id = editButton.closest(".view-post-container").id;
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
      window.location.href = "/";
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
    var post_id = deleteButton.closest(".view-post-container").id;
    deleteButton.addEventListener("click", function () {
      deletePost(post_id);
    })
  })
})



