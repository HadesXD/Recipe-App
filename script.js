// API: https://www.themealdb.com/api.php

// - Elemental consts
const mealsEl = document.getElementById('meals-id');
const favMealsEl = document.getElementById('fav-id');
const mealPopupEl = document.getElementById('popup-id');
const mealInfoEl = document.getElementById('info-id');

const searchTerm = document.getElementById('search-term-id');
const searchBtn = document.getElementById('search-btn-id');
// - Event listener, if button is clicked the wished meal will be searched up within the API.
searchBtn.addEventListener('click', async ()=> {
    mealsEl.innerHTML = ""; // Container cleaning
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);

    if (meals){
        meals.forEach((meal)=> {
            addMeal(meal);
        });
    }
});
const popupCloseBtn = document.getElementById('close-btn-id');
popupCloseBtn.addEventListener('click', async ()=> {
    //clean
    mealPopupEl.classList.add('hidden');
})

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const response = await fetch(
        'https://www.themealdb.com/api/json/v1/1/random.php');
        const responseData = await response.json();
        const randomMeal = responseData.meals[0];

        addMeal(randomMeal, true);
}

// searches the mealID on the API.
async function getMealByID(id) {
    const reponse = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const responseData = await reponse.json();
    const meal = responseData.meals[0];

    return meal;
}

// searches for results within the API based on the term.
async function getMealBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)
    const responseData = await response.json();
    const meals = responseData.meals;

    return meals;
}

// creates the HTML for the selected meal, default for random var is false.
function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal-container');
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `
            <span id="meal-id" class="meal-id">ID: ${mealData.idMeal}</span>` : ``}
            <img src="${mealData.strMealThumb}" 
                 alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button id="fav-btn" class="fav-btn">
            <i class="fas fa-heart"></i></button>
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
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    })
    mealsEl.appendChild(meal);
}

// returns the key-values.
function getMealFromLocalStorage() {
    const mealIDs = JSON.parse(localStorage.getItem('mealIDs'));
    return mealIDs === null ? [] : mealIDs;
}

// localStorage saves key-value pairs in a web browser with no expiration date.
// this function Adds a new key-value.
function addMealToLocalStorage(mealID) {
    const mealIDs = getMealFromLocalStorage();
    
    localStorage.setItem('mealIDs', JSON.stringify
    ([...mealIDs, mealID]));
}

// this function removes a specific key-value.
function removeMealFromLocalStorage(mealID) {
    const mealIDs = getMealFromLocalStorage();

    localStorage.setItem('mealIDs', JSON.stringify
    (mealIDs.filter(id => id !== mealID)));
}

// a function called to update the fav-meals container.
async function fetchFavMeals() {
    favMealsEl.innerHTML = "";  // Clean the container.
    const mealIDs = getMealFromLocalStorage();

    for(let i=0; i<mealIDs.length; i++) {
        const mealID = mealIDs[i];
        const meal = await getMealByID(mealID);
        addMeal2Fav(meal);
    }
}

// adds each meal to the fav-meals container.
function addMeal2Fav(mealData) {
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
        <img class="image" src="${mealData.strMealThumb}" 
             alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear">
        <i class="fas fa-window-close"></i></button>
        `;


    const img = favMeal.querySelector('.image');
    img.addEventListener('click', () => {
        showMealInfo(mealData);
    })

    const btn = favMeal.querySelector('.clear'); 
    btn.addEventListener('click', () => {
        favMeal.removeEventListener('click', arguments.callee);
        removeMealFromLocalStorage(mealData.idMeal);
        fetchFavMeals();

        const presetnedMealEL = document.getElementById("meal-id").innerHTML;
        const presentedID = presetnedMealEL.slice(4);
        
        if (mealData.idMeal === presentedID){
            const btn = document.getElementById('fav-btn');
            btn.classList.remove('active');
        }
    });

    favMealsEl.appendChild(favMeal);
}

// opens the popup with the recipe & ingredients about the meal.
function showMealInfo(mealData) {
    mealInfoEl.innerHTML = "";  // clean container.
    const mealEl = document.createElement('div');   // update container.
    
    const ingredients = [];     // get ingredients and measure
    for(let i=1; i<=20; i++) {
        if(mealData['strIngredient' + i]){
            ingredients.push(`
            ${mealData['strIngredient'+i]} -
            ${mealData ['strMeasure'+i]}`)
        }
        else break;
    }
    
    mealEl.innerHTML = `
            <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}" 
                 alt="${mealData.strMeal}">
            <p>
            ${mealData.strInstructions}
            </p>
            <h3>Ingredients</h3>
            <ul>
                ${ingredients
                    .map(
                        (ing) => `
                <li>${ing}</li>
                `
                )
                .join("")}
            </ul>
            `

    mealInfoEl.appendChild(mealEl);
    mealPopupEl.classList.remove('hidden');
}