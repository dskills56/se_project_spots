const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Resteraunt terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

// Profile modal
const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(".modal__close-button");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const nameInput = editProfileModal.querySelector("#profile-name-input");
const descriptionInput = editProfileModal.querySelector("#profile-description-input");

// Profile display
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Add card modal
const addCardButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = newPostModal.querySelector(".modal__form");
const imageInput = newPostModal.querySelector("#card-image-input");
const titleInput = newPostModal.querySelector("#card-description-input");

// Image preview modal
const previewModal = document.querySelector("#preview-image-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewCloseButton = previewModal.querySelector(".modal__close-button");

// Card template and container
const cardTemplate = document.querySelector("#card-template").content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

// Modal functions
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
    if (container) {
      container.removeEventListener("transitionend", onEnd);
    }
  };

  const onEnd = (evt) => {
    if (evt.target === container) finish();
  };

  if (container) {
    container.addEventListener("transitionend", onEnd);
  }
  setTimeout(finish, MODAL_ANIM_MS + 50);
}

function handleEscKey(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal.modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

// Close modal when clicking on overlay
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) closeModal(modal);
  });
});

// Edit profile modal handlers
editProfileButton.addEventListener("click", () => {
  nameInput.value = profileName.textContent;
  descriptionInput.value = profileDescription.textContent;
  openModal(editProfileModal);
});

editProfileCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
  editProfileForm.reset();
});

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  profileName.textContent = nameInput.value;
  profileDescription.textContent = descriptionInput.value;
  closeModal(editProfileModal);
});

// New post modal handlers
addCardButton.addEventListener("click", () => openModal(newPostModal));

newPostCloseButton.addEventListener("click", () => {
  closeModal(newPostModal);
  newPostForm.reset();
});

newPostForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const newCard = getCardElement(titleInput.value, imageInput.value);
  cardList.prepend(newCard);
  closeModal(newPostModal);
  newPostForm.reset();
});

// Preview modal handler
previewCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

// Card creation
function getCardElement(name, link) {
  const cardEl = cardTemplate.cloneNode(true);
  const cardImage = cardEl.querySelector(".card__image");
  const cardTitle = cardEl.querySelector(".card__name");
  const likeBtn = cardEl.querySelector(".card__like-button");
  const deleteBtn = cardEl.querySelector(".card__delete-button");

  cardTitle.textContent = name;
  cardImage.src = link;
  cardImage.alt = name;

  likeBtn.addEventListener("click", () => {
    likeBtn.classList.toggle("card__like-button_liked");
  });

  deleteBtn.addEventListener("click", () => {
    cardEl.remove();
  });

  cardImage.addEventListener("click", () => {
    previewImage.src = link;
    previewImage.alt = name;
    previewCaption.textContent = name;
    openModal(previewModal);
  });

  return cardEl;
}

// Initial cards render
initialCards.forEach(({ name, link }) => {
  cardList.append(getCardElement(name, link));
});