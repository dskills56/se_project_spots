import "./index.css";
import Api from "../scripts/Api.js";
import {
  enableValidation,
  validationSettings,
  resetFormValidation,
} from "../scripts/validation.js";

// ---------- API ----------
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "497190fc-b630-4391-a86f-174bbbea0f3e",
    "Content-Type": "application/json",
  },
});

// ---------- DOM ----------
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

// Modals (existing)
const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);
const editProfileForm = document.querySelector("#edit-profile-form");
const nameInput = editProfileModal.querySelector("#profile-name-input");
const descriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const addCardButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = document.querySelector("#new-post-form");
const imageInput = newPostModal.querySelector("#card-image-input");
const titleInput = newPostModal.querySelector("#card-description-input");

const previewModal = document.querySelector("#preview-image-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewCloseButton = previewModal.querySelector(".modal__close-button");

// Modals (new, added below in HTML section)
const deleteModal = document.querySelector("#delete-card-modal");
const deleteForm = deleteModal?.querySelector("#delete-card-form");
const deleteSubmitBtn = deleteModal?.querySelector(".modal__submit-button");

const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarForm = avatarModal?.querySelector("#edit-avatar-form");
const avatarInput = avatarModal?.querySelector("#avatar-link-input");

// ---------- Modal helpers (yours) ----------
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
    const openedModal = document.querySelector(".modal.modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) closeModal(modal);
  });
});

// Simple loading text helper for submit buttons
function renderLoading(isLoading, button, defaultText, loadingText) {
  if (!button) return;
  button.textContent = isLoading ? loadingText : defaultText;
  button.disabled = !!isLoading;
}

// ---------- Delete state ----------
let selectedCardEl = null;
let selectedCardId = null;

// ---------- Preview ----------
function openPreview(name, link) {
  previewImage.src = link;
  previewImage.alt = name;
  previewCaption.textContent = name;
  openModal(previewModal);
}
previewCloseButton.addEventListener("click", () => closeModal(previewModal));

// ---------- Cards ----------
function buildCardElement(data) {
  // API shape: { _id, name, link, isLiked, owner, createdAt }
  const { _id, name, link, isLiked } = data;

  const cardEl = cardTemplate.cloneNode(true);
  const cardImage = cardEl.querySelector(".card__image");
  const cardTitle = cardEl.querySelector(".card__name");
  const likeBtn = cardEl.querySelector(".card__like-button");
  const deleteBtn = cardEl.querySelector(".card__delete-button");

  cardTitle.textContent = name;
  cardImage.src = link;
  cardImage.alt = name;

  // like state
  if (isLiked) likeBtn.classList.add("card__like-button_liked");

  likeBtn.addEventListener("click", () => {
    const active = likeBtn.classList.contains("card__like-button_liked");
    const req = active ? api.unlikeCard(_id) : api.likeCard(_id);

    req
      .then((updated) => {
        // server returns updated card with updated isLiked
        if (updated.isLiked) {
          likeBtn.classList.add("card__like-button_liked");
        } else {
          likeBtn.classList.remove("card__like-button_liked");
        }
      })
      .catch(console.error);
  });

  // delete with confirmation
  deleteBtn.addEventListener("click", () => {
    if (!deleteModal) {
      // No delete modal in DOM (failsafe: allow immediate delete)
      api
        .removeCard(_id)
        .then(() => cardEl.remove())
        .catch(console.error);
      return;
    }
    selectedCardEl = cardEl;
    selectedCardId = _id;
    openModal(deleteModal);
  });

  // preview
  cardImage.addEventListener("click", () => openPreview(name, link));

  return cardEl;
}

// ---------- Render helpers ----------
function prependCardFromServer(cardData) {
  const el = buildCardElement(cardData);
  cardList.prepend(el);
}
function appendCardFromServer(cardData) {
  const el = buildCardElement(cardData);
  cardList.append(el);
}

// ---------- Profile: open/close/edit ----------
editProfileButton.addEventListener("click", () => {
  nameInput.value = profileName.textContent;
  descriptionInput.value = profileDescription.textContent || profileDescription.textContent;

  resetFormValidation(editProfileForm, validationSettings, { keepValues: true });
  openModal(editProfileModal);
});
editProfileCloseButton.addEventListener("click", () =>
  closeModal(editProfileModal)
);

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

// ---------- Add card ----------
addCardButton.addEventListener("click", () => {
  openModal(newPostModal);
});
newPostCloseButton.addEventListener("click", () => {
  closeModal(newPostModal);
});

newPostForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitBtn = newPostForm.querySelector(".modal__submit-button");
  renderLoading(true, submitBtn, "Save", "Saving...");

  api
    .addCard({
      name: titleInput.value.trim(),
      link: imageInput.value.trim(),
    })
    .then((card) => {
      prependCardFromServer(card);
      closeModal(newPostModal);
      newPostForm.reset();
      resetFormValidation(newPostForm, validationSettings, { keepValues: false });
    })
    .catch(console.error)
    .finally(() => renderLoading(false, submitBtn, "Save"));
});

// ---------- Delete confirmation (new) ----------
if (deleteForm && deleteSubmitBtn) {
  deleteForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (!selectedCardId) return;

    renderLoading(true, deleteSubmitBtn, "Yes, delete", "Deleting...");

    api
      .removeCard(selectedCardId)
      .then(() => {
        if (selectedCardEl) selectedCardEl.remove();
        selectedCardEl = null;
        selectedCardId = null;
        closeModal(deleteModal);
      })
      .catch(console.error)
      .finally(() =>
        renderLoading(false, deleteSubmitBtn, "Yes, delete")
      );
  });
}

// ---------- Avatar edit (new) ----------
if (profileAvatar && avatarModal && avatarForm && avatarInput) {
  // Desktop usually shows overlay button; we’ll allow clicking the avatar to edit
  profileAvatar.addEventListener("click", () => {
    resetFormValidation(avatarForm, validationSettings, { keepValues: false });
    openModal(avatarModal);
  });

  const avatarSubmitBtn = avatarForm.querySelector(".modal__submit-button");
  avatarForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const url = avatarInput.value.trim();
    renderLoading(true, avatarSubmitBtn, "Save", "Saving...");

    api
      .updateAvatar(url)
      .then((user) => {
        profileAvatar.src = user.avatar;
        closeModal(avatarModal);
        avatarForm.reset();
      })
      .catch(console.error)
      .finally(() => renderLoading(false, avatarSubmitBtn, "Save"));
  });
}

// ---------- Initial load ----------
function init() {
  // Enable validation once DOM is ready
  enableValidation(validationSettings);

  // Fetch user + cards
  Promise.all([api.getUserInfo(), api.getInitialCards()])
    .then(([user, cards]) => {
      // User
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      if (user.avatar) profileAvatar.src = user.avatar;

      // Cards (API may return newest last; render in order)
      cards.forEach(appendCardFromServer);
    })
    .catch(console.error);
}

document.addEventListener("DOMContentLoaded", init);