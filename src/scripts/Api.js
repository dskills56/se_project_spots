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
    return fetch(`${this._baseUrl}${path}`, {
      headers: this._headers,
      ...options,
    }).then(this._handleServerResponse);
  }

  // Users
  getUserInfo() {
    return this._request(`/users/me`);
  }

  editUserInfo({ name, about }) {
    return this._request(`/users/me`, {
      method: "PATCH",
      body: JSON.stringify({ name, about }),
    });
  }

  updateAvatar(avatar) {
    return this._request(`/users/me/avatar`, {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
  }

  // Cards
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
    return this._request(`/cards/${cardId}`, { method: "DELETE" });
  }

  likeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, { method: "PUT" });
  }

  unlikeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, { method: "DELETE" });
  }
}

export default Api;
