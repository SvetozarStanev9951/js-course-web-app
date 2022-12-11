const searchRecipeInput = document.getElementById("search-recipe-input");
const categoriesFilterContainer = document.getElementById(
  "detailed-categories-filter"
);
const resultsContainer = document.getElementById("results-container");
const myAppLogo = document.getElementById("my-app-logo");
const areasSelectElement = document.getElementById("areas-of-origin");

const appData = {
  categories: { name: "categories", data: null },
  areas: { name: "areas", data: null },
  ingredients: { name: "ingredients", data: null },
  categoriesDetailed: {
    name: "categoriesDetailed",
    data: null,
  },
};

async function initializeApp() {
  return new Promise((resolve) => {
    Object.entries(appData).forEach(async ([key, { name }], index) => {
      appData[key].data = loadFromStorage(name);
      if (!appData[key].data) {
        if (key === "categoriesDetailed") {
          const { categories: categoriesDetailed } = await fetchData(
            categories
          );
          appData[key].data = categoriesDetailed;
        } else {
          const { meals } = await fetchData(listAll, name[0] + "=list");
          appData[key].data = meals;
        }
        saveToStorage(name, appData[key].data);
      }
      if (index === Object.entries(appData).length - 1) {
        resolve();
      }
    });
  });
}

async function getRecipeOfTheDay() {
  let recipeOfTheDay = loadFromStorage(dateAsKey);

  if (!recipeOfTheDay) {
    const {
      meals: [recipe],
    } = await fetchData(singleRandomMeal);

    recipeOfTheDay = recipe;

    clearOldDates();
    saveToStorage(dateAsKey, recipe);
  }

  const recipeOfTheDayMarkup = createRecipeMarkup(recipeOfTheDay);
  resultsContainer.insertAdjacentHTML("beforeend", recipeOfTheDayMarkup);
}

function createCategoryElement(dataObj) {
  const {
    strCategory: title,
    strCategoryDescription: description,
    strCategoryThumb: thumbSrc,
  } = dataObj;

  const categoryDiv = document.createElement("div");
  categoryDiv.className = "category-box";
  categoryDiv.title = description;
  categoryDiv.addEventListener("click", () => filterByCategory(title));

  const categoryImg = document.createElement("img");
  categoryImg.setAttribute("src", thumbSrc);
  categoryImg.setAttribute("alt", title + " category image");

  const categoryTitle = document.createElement("h4");
  categoryTitle.textContent = title;

  categoryDiv.appendChild(categoryImg);
  categoryDiv.appendChild(categoryTitle);
  return categoryDiv;
}

function renderCategories() {
  categoriesFilterContainer.innerHTML = "";

  appData.categoriesDetailed.data.forEach((category) => {
    const newDetailedCategoryElement = createCategoryElement(category);
    categoriesFilterContainer.appendChild(newDetailedCategoryElement);
  });
}

function createRecipeMarkup(recipe) {
  const {
    strMealThumb,
    strMeal,
    strCategory,
    strArea,
    strInstructions,
    strSource,
  } = recipe;

  const recipeViewMarkup = `
      <div>
        <h2>${strMeal}</h2>
        <h4><a href=${strSource} target="_blank" rel="noreferrer">Original Source</a></h4>
        <img src=${strMealThumb} alt="${strMeal} recipe of the day image" />
        <table>
          <tr>
            <th>Category</th>
            <th>Country of origin</th>
          </tr>
          <tr>
            <td>${strCategory}</td>
            <td>${strArea}</td>
          </tr>
        </table>
        <p>${strInstructions}</p>
      </div>
  `;

  resultsContainer.innerHTML = "";

  return recipeViewMarkup;
}

function createMealThumbnail(mealObj) {
  const { strMeal, idMeal, strMealThumb } = mealObj;
  const mealDiv = document.createElement("div");
  mealDiv.className = "category-box";
  mealDiv.setAttribute("id", idMeal);
  mealDiv.onclick = () => showMealWithId(idMeal);

  const mealMarkup = `
  <img src=${strMealThumb}/preview alt="${strMeal} image"><h4>${strMeal}</h4>
  `;

  mealDiv.insertAdjacentHTML("beforeend", mealMarkup);

  return mealDiv;
}

async function filterByCategory(category) {
  const { meals: recipes } = await fetchData(filterBy, "c=" + category);
  resultsContainer.innerHTML = "";
  resultsContainer.style.flexDirection = "row";
  resultsContainer.style.flexWrap = "wrap";

  recipes.forEach((recipe) => {
    const newRecipe = createMealThumbnail(recipe);
    resultsContainer.appendChild(newRecipe);
  });
}

async function showMealWithId(id) {
  const {
    meals: [meal],
  } = await fetchData(lookupFullMeal, "i=" + id);

  const recipeViewMarkup = createRecipeMarkup(meal);
  resultsContainer.insertAdjacentHTML("beforeend", recipeViewMarkup);
}

async function handleSearchInput(e) {
  const validInput = e.target.value.trim();
  if (!validInput) {
    return;
  }

  const { meals: searchResult } = await fetchData(searchBy, "s=" + validInput);

  if (!searchResult || searchResult.length === 0) {
    resultsContainer.innerHTML = "No results found";
    return;
  }

  resultsContainer.innerHTML = "";
  resultsContainer.style.flexDirection = "row";
  resultsContainer.style.flexWrap = "wrap";
  resultsContainer.style.height = "100%";
  resultsContainer.style.margin = "0";

  searchResult.forEach((recipe) => {
    const recipeDiv = createMealThumbnail(recipe);
    resultsContainer.appendChild(recipeDiv);
  });
}

function createAreaFilterDropdown() {
  appData.areas.data.forEach(({ strArea }) => {
    const option = document.createElement("option");
    option.setAttribute("value", strArea);
    option.textContent = strArea;
    areasSelectElement.appendChild(option);
  });
}

async function renderMealsByCountry(e) {
  const selectedArea = e.currentTarget.value;
  const { meals } = await fetchData(filterBy, "a=" + selectedArea);

  resultsContainer.innerHTML = "";
  resultsContainer.style.flexDirection = "row";
  resultsContainer.style.flexWrap = "wrap";

  meals.forEach((meal) => {
    const newMeal = createMealThumbnail(meal);
    resultsContainer.appendChild(newMeal);
  });

  window.scrollTo({ top: 0 });
}

async function main() {
  await initializeApp();
  renderCategories();
  await getRecipeOfTheDay();
  createAreaFilterDropdown();
  clearUI();
  // event listeners are in control from now on...
}

searchRecipeInput.addEventListener("input", handleSearchInput);
myAppLogo.addEventListener("click", main);
areasSelectElement.addEventListener("change", renderMealsByCountry);

main();

function collapse(div) {
  div.classList.toggle('toggled');
  const group = div.closest('.collapsible-group');
  const collapsible = group.querySelector('.collapsible-wrapper');
  collapsible.classList.toggle('collapsed');
}

// 

const ingredients = document.getElementById("search-ingredients-input");
const ingredientsList = document.getElementById("search-ingredients-list");


ingredients.addEventListener('keyup', () => {
  removeElements();
  let index = 0;
  for (let { strIngredient: i } of appData.ingredients.data) {
    // limit to 10 suggestions
    if (index > 9) break;
    if (
      i.toLowerCase().startsWith(ingredients.value.toLowerCase()) &&
      ingredients.value != ""
    ) {
      index++;
      let listItem = document.createElement("li");
      listItem.classList.add("list-items");
      listItem.style.cursor = "pointer";
      listItem.setAttribute("onclick", "addIngredient('" + i + "')");
      let word = "<b>" + i.substr(0, ingredients.value.length) + "</b>";
      word += i.substr(ingredients.value.length);
      listItem.innerHTML = word;
      document.getElementById("search-ingredients-suggestions").appendChild(listItem);
    }
  }
});

let ingredientsArray = [];

async function addIngredient(value) {
  ingredients.value = '';
  if (!ingredientsArray.includes(value)) {
    const div = document.createElement('div');
    div.className = 'search-ingredients-list-item';
    const label = document.createElement('h4');
    label.textContent = value;
    div.appendChild(label);
    const btn = document.createElement('button');
    btn.innerHTML = 'X';
    btn.addEventListener('click', () => {
      ingredientsArray.splice(ingredientsArray.indexOf(value), 1);
      div.remove();
      renderMealsByIngredients(ingredientsArray);
    });
    div.appendChild(btn);
    ingredientsArray.push(value);
    ingredientsList.appendChild(div);
    renderMealsByIngredients(ingredientsArray);
  }
  removeElements();
}
function removeElements() {
  let items = document.querySelectorAll(".list-items");
  items.forEach((item) => {
    item.remove();
  });
}


function renderMealsByIngredients(inArr) {
  const filtered = [];

  for (const meal of mockData) {
    let multiple = 0;
    for (const ingr of inArr) {
      for (const value of Object.values(meal))
        if (ingr.toLowerCase() === value.toLowerCase()) {
          multiple++;
          break;
        }
    }
    if (multiple === inArr.length)
      filtered.push(meal);
  }

  resultsContainer.innerHTML = "";
  resultsContainer.style.flexDirection = "row";
  resultsContainer.style.flexWrap = "wrap";

  if (filtered.length == 0) {
    const h1 = document.createElement('h1');
    h1.textContent = `No recipes found with ${inArr.join(',')}`;
    resultsContainer.appendChild(h1);
  } else
    filtered.forEach((meal) => {
      const newMeal = createMealThumbnail(meal);
      resultsContainer.appendChild(newMeal);
    });

  window.scrollTo({ top: 0 });
}

function clearUI() {
  removeElements();
  ingredients.value = '';
  ingredientsArray = [];
  ingredientsList.innerHTML = '';
}