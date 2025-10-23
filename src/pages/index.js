import "./index.css";
import Api from "../scripts/Api.js";
import {
  enableValidation,
  validationSettings,
  resetFormValidation,
} from "../scripts/validation.js";

/* ========= API INSTANCE ========= */
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "497190fc-b630-4391-a86f-174bbbea0f3e",
    "Content-Type": "application/json",
  },
});

/* ========= DOM ========= */
// profile
const editProfileButton = document.querySelector(".profile__edit-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

// edit profile modal
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);
const editProfileForm = document.querySelector("#edit-profile-form");
const nameInput = editProfileModal.querySelector("#profile-name-input");
const descriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

// add card modal
const addCardButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = document.querySelector("#new-post-form");
const imageInput = newPostModal.querySelector("#card-image-input");
const titleInput = newPostModal.querySelector("#card-description-input");

// preview modal
const previewModal = document.querySelector("#preview-image-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewCloseButton = previewModal.querySelector(".modal__close-button");

// delete confirm modal
const deleteModal = document.querySelector("#delete-card-modal");
const deleteForm = document.querySelector("#delete-card-form");
const deleteSubmitBtn = document.querySelector("#delete-submit");

const deleteCloseBtn = deleteModal.querySelector(".modal__close-button");
deleteCloseBtn.addEventListener("click", () => closeModal(deleteModal));

// edit avatar modal
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = avatarForm.querySelector("#avatar-link-input");

// card template + list
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

/* ========= MODAL HELPERS ========= */
const MODAL_ANIM_MS = 300;

function openModal(modal) {
  modal.classList.remove("modal_is-closing");
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscKey);
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.add("modal_is-closing");
  const container = modal.querySelector(".modal__container");

  const finish = () => {
    modal.classList.remove("modal_is-opened", "modal_is-closing");
    if (!document.querySelector(".modal.modal_is-opened")) {
      document.removeEventListener("keydown", handleEscKey);
      document.body.classList.remove("modal-open");
    }
    if (container) container.removeEventListener("transitionend", onEnd);
  };

  const onEnd = (evt) => {
    if (evt.target === container) finish();
  };

  if (container) container.addEventListener("transitionend", onEnd);
  setTimeout(finish, MODAL_ANIM_MS + 50);
}

function handleEscKey(evt) {
  if (evt.key === "Escape") {
    const opened = document.querySelector(".modal.modal_is-opened");
    if (opened) closeModal(opened);
  }
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) closeModal(modal);
  });
});

/* ========= SMALL UTIL ========= */
function renderLoading(isLoading, btn, defaultText, loadingText = "Saving...") {
  if (!btn) return;
  btn.textContent = isLoading ? loadingText : defaultText;
  btn.disabled = !!isLoading;
}

/* ========= CARD FACTORY ========= */
let selectedCardEl = null;
let selectedCardId = null;

function buildCardElement(cardData) {
  const { _id, name, link, isLiked } = cardData;

  const el = cardTemplate.cloneNode(true);
  const img = el.querySelector(".card__image");
  const title = el.querySelector(".card__name");
  const likeBtn = el.querySelector(".card__like-button");
  const delBtn = el.querySelector(".card__delete-button");

  title.textContent = name;
  img.src = link;
  img.alt = name;

  if (isLiked) likeBtn.classList.add("card__like-button_liked");

  likeBtn.addEventListener("click", () => {
    const active = likeBtn.classList.contains("card__like-button_liked");
    const req = active ? api.unlikeCard(_id) : api.likeCard(_id);
    req
      .then((updated) => {
        if (updated.isLiked) likeBtn.classList.add("card__like-button_liked");
        else likeBtn.classList.remove("card__like-button_liked");
      })
      .catch(console.error);
  });

  delBtn.addEventListener("click", () => {
    selectedCardEl = el;
    selectedCardId = _id;
    openModal(deleteModal);
  });

  img.addEventListener("click", () => openPreview(name, link));

  return el;
}

function prependCardFromServer(card) {
  cardList.prepend(buildCardElement(card));
}

function appendCardFromServer(card) {
  cardList.append(buildCardElement(card));
}

/* ========= PREVIEW ========= */
function openPreview(name, link) {
  previewImage.src = link;
  previewImage.alt = name;
  previewCaption.textContent = name;
  openModal(previewModal);
}

previewCloseButton.addEventListener("click", () => closeModal(previewModal));

/* ========= PROFILE: OPEN/CLOSE ========= */
editProfileButton.addEventListener("click", () => {
  nameInput.value = profileName.textContent;
  descriptionInput.value = profileDescription.textContent;
  resetFormValidation(editProfileForm, validationSettings, {
    keepValues: true,
  });
  openModal(editProfileModal);
});

editProfileCloseButton.addEventListener("click", () =>
  closeModal(editProfileModal)
);

/* ========= PROFILE: SUBMIT ========= */
editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitBtn = editProfileForm.querySelector(".modal__submit-button");
  renderLoading(true, submitBtn, "Save", "Saving...");
  api
    .editUserInfo({
      name: nameInput.value.trim(),
      about: descriptionInput.value.trim(),
    })
    .then((user) => {
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => renderLoading(false, submitBtn, "Save"));
});

/* ========= NEW POST ========= */
addCardButton.addEventListener("click", () => openModal(newPostModal));
newPostCloseButton.addEventListener("click", () => closeModal(newPostModal));

newPostForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitBtn = newPostForm.querySelector(".modal__submit-button");
  renderLoading(true, submitBtn, "Save", "Saving...");
  api
    .addCard({ name: titleInput.value.trim(), link: imageInput.value.trim() })
    .then((card) => {
      prependCardFromServer(card);
      closeModal(newPostModal);
      newPostForm.reset();
      resetFormValidation(newPostForm, validationSettings, {
        keepValues: false,
      });
    })
    .catch(console.error)
    .finally(() => renderLoading(false, submitBtn, "Save"));
});

/* ========= DELETE CONFIRM ========= */
const deleteCancelBtn = document.querySelector("#delete-cancel");
if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener("click", () => closeModal(deleteModal));
}

deleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!selectedCardId) return;
  renderLoading(true, deleteSubmitBtn, "Delete", "Deleting...");
  api
    .removeCard(selectedCardId)
    .then(() => {
      if (selectedCardEl) selectedCardEl.remove();
      selectedCardEl = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => renderLoading(false, deleteSubmitBtn, "Delete"));
});

/* ========= EDIT AVATAR ========= */
profileAvatar.addEventListener("click", () => {
  resetFormValidation(avatarForm, validationSettings, { keepValues: false });
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".modal__submit-button");
  renderLoading(true, submitBtn, "Save", "Saving...");
  api
    .updateAvatar(avatarInput.value.trim())
    .then((user) => {
      profileAvatar.src = user.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => renderLoading(false, submitBtn, "Save"));
});

/* ========= INIT (user + cards) ========= */
function init() {
  Promise.all([api.getUserInfo(), api.getInitialCards()])
    .then(([user, cards]) => {
      // user
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      if (user.avatar) profileAvatar.src = user.avatar;

      // cards
      cards.forEach(appendCardFromServer);
    })
    .catch(console.error);
}

document.addEventListener("DOMContentLoaded", () => {
  enableValidation(validationSettings);
  init();
});
