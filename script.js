const meals = document.getElementById('meals');
const favMeals = document.getElementById('fav-meals')

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const response = await fetch(
        'https://www.themealdb.com/api/json/v1/1/random.php');
        const responseData = await response.json();
        const randomMeal = responseData.meals[0];

        addMeal(randomMeal, true);
}

async function getMealByID(id) {
    const reponse = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const responseData = await reponse.json();
    const meal = responseData.meals[0];

    return meal;
}

async function getMealBySearch(name) {
    const mealByName = await fetch('www.themealdb.com/api/json/v1/1/search.php?s=' + name)
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal-container');
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `
            <span class="random">Random Recipe
            </span>` : ``}
            
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        `;
        
    const btn =  meal.querySelector('.meal-body .fav-btn');
    btn.addEventListener('click', () => {
        if(btn.classList.contains('active')) {
            removeMealFromLocalStorage(mealData.idMeal)
            btn.classList.remove('active');
        } else {
            addMealToLocalStorage(mealData.idMeal)
            btn.classList.toggle('active');
        }
    });

    meals.appendChild(meal);
}

function getMealFromLocalStorage() {
    const mealIDs = JSON.parse(localStorage.getItem('mealIDs'));
    return mealIDs === null ? [] : mealIDs;
}

function addMealToLocalStorage(mealID) {
    const mealIDs = getMealFromLocalStorage();
    
    localStorage.setItem('mealIDs', JSON.stringify
    ([...mealIDs, mealID]));
}

function removeMealFromLocalStorage(mealID) {
    const mealIDs = getMealFromLocalStorage();

    localStorage.setItem('mealIDs', JSON.stringify
    (mealIDs.filter(id => id !== mealID)));
}


async function fetchFavMeals() {
    const mealIDs = getMealFromLocalStorage();

    for(let i=0; i<mealIDs.length; i++) {
        const mealID = mealIDs[i];
        const meal = await getMealByID(mealID);
        addMeal2Fav(meal);
    }
}

function addMeal2Fav(mealData, random = false) {
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        `;
        
    favMeals.appendChild(favMeal);
}