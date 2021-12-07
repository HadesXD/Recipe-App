const mealsEl = document.getElementById('meals');
const favMeals = document.getElementById('fav-meals');
const mealPopup = document.getElementById('popup-meal');
const mealInfoEl = document.getElementById('meal-info');

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const popupCloseBtn = document.getElementById('close-popup');

searchBtn.addEventListener('click', async ()=> {
    // clean the container
    mealsEl.innerHTML = "";
    const search = searchTerm.value;

    const meals = await getMealBySearch(search);

    if (meals){
        meals.forEach((meal)=> {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener('click', async ()=> {
    //clean
    mealPopup.classList.add('hidden');
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

async function getMealByID(id) {
    const reponse = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const responseData = await reponse.json();
    const meal = responseData.meals[0];

    return meal;
}

async function getMealBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)
    const responseData = await response.json();
    const meals = responseData.meals;

    return meals;
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
            <button id="fav-btn" class="fav-btn">
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
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    })
    mealsEl.appendChild(meal);
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
    // Clean the container
    favMeals.innerHTML = "";

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
        <img src="${mealData.strMealThumb}" 
             alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear">
            <i class="fas fa-window-close"></i>
        </button>
        `;
    
    const btn = favMeal.querySelector('.clear'); 
    btn.addEventListener('click', () => {
        removeMealFromLocalStorage(mealData.idMeal);
        fetchFavMeals();

        /*
        if (mealData.idMeal === meals.idMeal){
            const btn = document.getElementById('fav-btn');
            btn.classList.remove('active');
        }*/

    });

    favMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    })

    favMeals.appendChild(favMeal);
}

function showMealInfo(mealData) {
    //clean
    mealInfoEl.innerHTML = "";

    //update
    const mealEl = document.createElement('div');
    
    const ingredients = [];
    // get ingredients and measure
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
    mealPopup.classList.remove('hidden');
}