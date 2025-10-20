class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl.replace(/\/$/, "");
    this._headers = headers;
  }

  _handleServerResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(`Error: ${res.status}`);
  }

  _request(path, options = {}) {
    const url = `${this._baseUrl}${path}`;
    const opts = {
      headers: this._headers,
      ...options,
    };
    return fetch(url, opts).then(this._handleServerResponse);
  }

  // ----- User -----
  getUserInfo() {
    return this._request(`/users/me`);
  }

  editUserInfo({ name, about }) {
    return this._request(`/users/me`, {
      method: "PATCH",
      body: JSON.stringify({ name, about }),
    });
  }

  updateAvatar(avatarUrl) {
    return this._request(`/users/me/avatar`, {
      method: "PATCH",
      body: JSON.stringify({ avatar: avatarUrl }),
    });
  }

  // ----- Cards -----
  getInitialCards() {
    return this._request(`/cards`);
  }

  addCard({ name, link }) {
    return this._request(`/cards`, {
      method: "POST",
      body: JSON.stringify({ name, link }),
    });
  }

  removeCard(cardId) {
    return this._request(`/cards/${cardId}`, {
      method: "DELETE",
    });
  }

  likeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, {
      method: "PUT",
    });
  }

  unlikeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, {
      method: "DELETE",
    });
  }
}

export default Api;