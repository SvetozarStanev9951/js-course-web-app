const apiBaseUrl = "https://www.themealdb.com/api/json/v1/1";
const categories = "/categories.php";
const filterBy = "/filter.php";
const searchBy = "/search.php";
const lookupFullMeal = "/lookup.php";
const singleRandomMeal = "/random.php";
const listAll = "/list.php";

async function fetchData(endpoint, ...queryParams) {
  const queryString = queryParams.length > 0 ? queryParams.join("&") : "";
  const url = apiBaseUrl + endpoint + (queryString ? "?" + queryString : "");

  return fetch(url)
    .then((response) => response.json())
    .then((result) => result);
}
