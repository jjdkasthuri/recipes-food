function initiateApp() {

    const selectCategories = document.querySelector("#categories");

    if(selectCategories) {
        selectCategories.addEventListener("change", selectCategorie);
        getCategories();
    }

    const favoritesDiv = document.querySelector(".favorites");
    if(favoritesDiv) {
        getFavorites();
    }
    
    const modal = new bootstrap.Modal('#modal', {});

    function getCategories() {
        const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
        fetch(url)
            .then( response => response.json())
            .then( result => showCategories(result.categories));  
    }

    function showCategories(categories = []) {
        categories.map( categorie => {
            const option = document.createElement("option");
            option.value = categorie.strCategory;
            option.textContent = categorie.strCategory;
            selectCategories.appendChild(option);
        })
    }

    function selectCategorie(e) {
        const categorie = e.target.value;
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorie}`;
        fetch(url)
            .then(response => response.json())
            .then(result => showRecipes(result.meals));
    }

    function showRecipes(recipes = []) {

        cleanHtml(result);

        const heading = document.createElement("h2");
        heading.classList.add("text-center", "text-black", "my-5");
        heading.textContent = recipes.length ? "Results" : "No results here";
        result.appendChild(heading);
        
        recipes.map( recipe => {
            const { idMeal, strMeal, strMealThumb } = recipe;
            const recipeBox = document.createElement("div");
            recipeBox.classList.add("col-md-4");

            const recipeCard = document.createElement("div");
            recipeCard.classList.add("card", "mb-4");

            const recipeImage = document.createElement("img");
            recipeImage.classList.add("card-img-top");
            recipeImage.alt = `image from ${strMeal ?? recipe.title}`
            recipeImage.src = strMealThumb ?? recipe.img;

            const recipeBody = document.createElement("div");
            recipeBody.classList.add("card-body");

            const recipeHeading = document.createElement("h3");
            recipeHeading.classList.add("card-title", "mb-3");
            recipeHeading.textContent = strMeal ?? recipe.title;

            const recipeButton = document.createElement("button");
            recipeButton.classList.add("btn", "btn-danger", "w-100");
            recipeButton.textContent = "See Recipe";

            recipeButton.onclick = function() {
                shooseRecipe(idMeal ?? recipe.id);
            }

            //add scripting to HTML
            recipeBody.appendChild(recipeHeading);
            recipeBody.appendChild(recipeButton);

            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeBody);

            recipeBox.appendChild(recipeCard);

            result.appendChild(recipeBox);
        })
    }

    function shooseRecipe(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then( result => result.json() )
            .then( result => showRecipeModal(result.meals[0]) )
    }

    function showRecipeModal(recipe) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

        const modalTitle = document.querySelector(".modal .modal-title");
        const modalBody = document.querySelector(".modal .modal-body");

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="image from ${strMeal}">
            <h3 class="my-3">Instructions:</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3 ">Ingredients and measures</h3>
        `
        const listGroup = document.createElement("ul");
        listGroup.classList.add("list-group");

        //show ingredients
        for(let i = 1; i <= 20; i++){
            if(recipe[`strIngredient${i}`]){
                const ingredient = recipe[`strIngredient${i}`];
                const measure = recipe[`strMeasure${i}`];

                const ingredientLi = document.createElement("li");
                ingredientLi.classList.add("list-group-item");
                ingredientLi.textContent = `${i}. ${ingredient} - Measure: ${measure}`;

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector(".modal-footer");
        cleanHtml(modalFooter);

        //boton close and favorites
        const btnFavorite = document.createElement("button");
        btnFavorite.classList.add("btn", "btn-danger", "col");
        btnFavorite.textContent = validateId(idMeal) ? "Delete favorite" : "Save in favorites";

        //localStorage
        btnFavorite.onclick = function () {

            if(validateId(idMeal)) {
                deleteFavorite(idMeal);
                btnFavorite.textContent = "Save in favorites";
                showToast("The recipe has been removed from favorites");
                return
            }

            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            })
            btnFavorite.textContent = "Delete favorite";
            showToast("The recipe has been added from favorites");
        }

        const btnClose = document.createElement("button");
        btnClose.classList.add("btn", "btn-secondary", "col");
        btnClose.textContent = "Close";
        btnClose.onclick = (() => modal.hide());

        modalFooter.appendChild(btnFavorite);
        modalFooter.appendChild(btnClose);

        modal.show();
    }

    function addFavorite(receta) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
        localStorage.setItem("favorites", JSON.stringify([...favorites, receta]))
    }

    function deleteFavorite(id) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    function validateId(id) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
        return favorites.some( favorite => favorite.id === id);
    }

    function showToast(msg) {
        Swal.fire({
            icon: 'success',
            title: 'Successfully',
            text: msg,
            showConfirmButton: false,
            timer: 3000,
        })
    }

    function getFavorites () {
        const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
        if(favorites.length) {
            showRecipes(favorites);
            return
        }
        const notFavorites = document.createElement("p");
        notFavorites.textContent = "Not favorites yet";
        notFavorites.classList.add("fs-4", "text-center", "font-bold", "mt-5");
        favoritesDiv.appendChild(notFavorites);
    }

    function cleanHtml(selector) {
        while(selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener("DOMContentLoaded", initiateApp);