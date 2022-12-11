class MealsAPI {
  #baseUrl = "https://www.themealdb.com/api/json/v1/1";
  static cache = {};

  constructor(apiBaseUrl) {
    this.#baseUrl = apiBaseUrl;
  }

  static clearCache() {
    MealsAPI.cache = {};
  }

  async get(endpoint, ...queryParams) {
    const queryString = queryParams.length > 0 ? queryParams.join("&") : "";
    const url =
      this.#baseUrl + endpoint + (queryString ? "?" + queryString : "");

    if (MealsAPI.cache[url]) {
      return MealsAPI.cache[url];
    }

    return fetch(url)
      .then((response) => response.json())
      .then((result) => {
        MealsAPI.cache[url] = result;
        return result;
      })
      .catch((err) => {
        alert("Something went wrong, see console for more details.");
        console.error(err);
      });
  }
}

export default MealsAPI;
