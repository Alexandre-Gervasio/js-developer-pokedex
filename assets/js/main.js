const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')

const maxRecords = 1026
let limit = 20
let offset = 0

function convertPokemonToLi(pokemon) {
    const types = pokemon.types
    const hasTwoTypes = types.length > 1

    return `
        <li class="pokemon ${types.join(' ')} ${hasTwoTypes ? 'dual-type' : ''}"
            onclick="abrirPokedex(${pokemon.number})"
            style="
                --type-color-1: var(--${types[0]});
                --type-color-2: var(--${types[1] || types[0]});
            ">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${types.map(type =>
                        `<li class="type ${type}">${type}</li>`
                    ).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
        </li>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}

function getLimitByScreen() {

    const width = window.innerWidth

    if (width >= 1200) {
        return 40   // desktop
    }

    if (width >= 768) {
        return 30   // tablet
    }

    return 20       // celular
}

limit = getLimitByScreen()

loadPokemonItens(offset, limit)

let isLoading = false

window.addEventListener("scroll", () => {

    if (isLoading) return

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {

        if (offset >= maxRecords) return

        isLoading = true

        const screenLimit = getLimitByScreen()

        offset = offset + screenLimit

        loadPokemonItens(offset, screenLimit)

        setTimeout(() => {
            isLoading = false
        }, 500)

    }

})



// FILTRO
const searchInput = document.getElementById("searchPokemon")
const typeFilter = document.getElementById("filterType")

function filterVisiblePokemons(){

    const searchValue = searchInput.value.toLowerCase()
    const typeValue = typeFilter.value
    const pokemons = document.querySelectorAll(".pokemon")

    pokemons.forEach(pokemon => {

        const name = pokemon.querySelector(".name").textContent.toLowerCase()
        const types = [...pokemon.querySelectorAll(".type")].map(t => t.textContent)
        const matchName = name.includes(searchValue)
        const matchType = typeValue === "all" || types.includes(typeValue)

        if(matchName && matchType){
            pokemon.style.display = ""
        }else{
            pokemon.style.display = "none"
        }
    })
}

searchInput.addEventListener("input", filterVisiblePokemons)

typeFilter.addEventListener("change", async function(){

    const type = typeFilter.value
    pokemonList.innerHTML = ""

    if(type === "all"){
        location.reload()
        return
    }

    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
    const data = await response.json()
    const pokemons = data.pokemon.slice(0,50)
    const promises = pokemons.map(p => pokeApi.getPokemonDetail(p.pokemon))
    const results = await Promise.all(promises)

    results.forEach(pokemon => {
        pokemonList.innerHTML += convertPokemonToLi(pokemon)

    })

})

// loadMoreButton.addEventListener('click', () => {

//     offset += limit

//     const qtdRecordsWithNexPage = offset + limit

//     if (qtdRecordsWithNexPage >= maxRecords) {

//         const newLimit = maxRecords - offset
//         loadPokemonItens(offset, newLimit)

//         loadMoreButton.remove()

//     } else {

//         loadPokemonItens(offset, limit)

//     }
// })