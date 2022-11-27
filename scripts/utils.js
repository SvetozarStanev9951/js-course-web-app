const storageType = "localStorage";
const today = new Date(Date.now());
const date = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const dateAsKey = `${date}-${month}-${year}`;

function saveToStorage(key, data) {
  if (storageType !== "localStorage" && storageType !== "sessionStorage")
    throw new Error("Invalid storage type.");
  window[storageType].setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
  if (storageType !== "localStorage" && storageType !== "sessionStorage")
    throw new Error("Invalid storage type.");
  return JSON.parse(window[storageType].getItem(key));
}

function clearOldDates() {
  const dateRgx = new RegExp(/^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/, "gm");

  for (let i = 0; i < window[storageType].length; i++) {
    const storageKey = window[storageType].key(i);
    if (dateRgx.test(storageKey)) {
      window[storageType].removeItem(storageKey);
    }
  }
}
