const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal
  ? editProfileModal.querySelector(".modal__close-button")
  : null;
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal
  ? newPostModal.querySelector(".modal__close-button")
  : null;
const newPostButton = document.querySelector(".profile__add-button");

// Add event listeners only if elements exist
if (editProfileButton && editProfileModal) {
  editProfileButton.addEventListener("click", function () {
    editProfileModal.classList.add("modal_is-opened");
  });
}

if (editProfileCloseButton && editProfileModal) {
  editProfileCloseButton.addEventListener("click", function () {
    editProfileModal.classList.remove("modal_is-opened");
  });
}

if (newPostButton && newPostModal) {
  newPostButton.addEventListener("click", function () {
    newPostModal.classList.add("modal_is-opened");
  });
}

if (newPostCloseButton && newPostModal) {
  newPostCloseButton.addEventListener("click", function () {
    newPostModal.classList.remove("modal_is-opened");
  });
}
