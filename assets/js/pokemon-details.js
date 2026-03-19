const modal = document.getElementById("pokemonModal")
const modalContent = document.getElementById("pokemonDetails")
const evolutionList = document.getElementById("evolutionList")
const closeBtn = document.querySelector(".close")

let isLoadingModal = false

const typeColors = {
    normal: "#a6a877", fire: "#ee7f30", water: "#678fee",
    grass: "#49d0b0", electric: "#f4c92b", ice: "#98d5d7",
    fighting: "#bf3029", poison: "#a040a0", ground: "#e0c068",
    flying: "#a98ff0", psychic: "#f65687", bug: "#a8b720",
    rock: "#b8a137", ghost: "#705898", dragon: "#6f38f6",
    dark: "#705848", steel: "#b7b7ce", fairy: "#f9aec7", stellar: "#7cc7ff"
}

const statLabels = {
    "hp": "HP", "attack": "ATK", "defense": "DEF",
    "special-attack": "Sp.ATK", "special-defense": "Sp.DEF", "speed": "SPD"
}

const generationMap = {
    "generation-i": "Kanto", "generation-ii": "Johto",
    "generation-iii": "Hoenn", "generation-iv": "Sinnoh",
    "generation-v": "Unova", "generation-vi": "Kalos",
    "generation-vii": "Alola", "generation-viii": "Galar",
    "generation-ix": "Paldea"
}

window.abrirPokedex = async function(id) {
    if (isLoadingModal) return
    isLoadingModal = true

    modalContent.innerHTML = ""
    evolutionList.innerHTML = ""
    modal.classList.add("active")

    const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    ])
    const pokemon = await pokemonRes.json()
    const species = await speciesRes.json()

    const types = pokemon.types.map(t => t.type.name)
    const mainColor = typeColors[types[0]] || "#678fee"
    const description = species.flavor_text_entries
        .find(e => e.language.name === "en")
        ?.flavor_text.replace(/\f/g, " ") || ""
    const region = generationMap[species.generation.name] || "Unknown"
    const moves = pokemon.moves.slice(0, 5).map(m => m.move.name).join(", ")
    const abilities = pokemon.abilities.map(a => a.ability.name).join(", ")

    document.querySelector(".modal-content").style.setProperty("--modal-color", mainColor)

    modalContent.innerHTML = `
        <div class="modal-header" style="background: linear-gradient(135deg, ${mainColor}, ${mainColor}cc);">
            <h2>${pokemon.name} <span>#${String(pokemon.id).padStart(3,"0")}</span></h2>
            <div class="poke-types">
                ${types.map(t => `<span class="type ${t}">${t}</span>`).join("")}
            </div>
        </div>
        <div class="modal-body">
            <img class="poke-main-img" src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            <p class="poke-description">${description}</p>
            <div class="poke-info-grid">
                <div class="poke-info-item"><strong>Altura</strong>${(pokemon.height/10).toFixed(1)} m</div>
                <div class="poke-info-item"><strong>Peso</strong>${(pokemon.weight/10).toFixed(1)} kg</div>
                <div class="poke-info-item"><strong>Geração</strong>${region}</div>
                <div class="poke-info-item"><strong>Habitat</strong>${species.habitat?.name || "Unknown"}</div>
                <div class="poke-info-item" style="grid-column:span 2"><strong>Habilidades</strong>${abilities}</div>
                <div class="poke-info-item" style="grid-column:span 2"><strong>Ataques</strong>${moves}</div>
            </div>
            <div class="stats-section">
                <h3>Status Base</h3>
                ${pokemon.stats.map(stat => {
                    const label = statLabels[stat.stat.name] || stat.stat.name
                    const pct = Math.min((stat.base_stat / 255) * 100, 100).toFixed(1)
                    return `<div class="stat-row">
                        <span class="stat-name">${label}</span>
                        <div class="stat-bar-bg"><div class="stat-bar" style="width:${pct}%"></div></div>
                        <span class="stat-value">${stat.base_stat}</span>
                    </div>`
                }).join("")}
            </div>
            <p class="evo-title">Evoluções</p>
        </div>
    `

    isLoadingModal = false
    loadEvolutions(species)
}

async function loadEvolutions(species) {
    const evoRes = await fetch(species.evolution_chain.url)
    const evoData = await evoRes.json()

    const names = []
    let evo = evoData.chain
    do {
        names.push(evo.species.name)
        evo = evo.evolves_to[0]
    } while (evo)

    const results = await Promise.all(
        names.map(name => fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json()))
    )

    evolutionList.innerHTML = results.map(data => `
        <div class="evolution-card" onclick="abrirPokedex(${data.id})" style="cursor:pointer">
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
            <div>${data.name}</div>
        </div>
    `).join("")
}

function fecharModal() {
    modal.classList.remove("active")
    modalContent.innerHTML = ""
    evolutionList.innerHTML = ""
}

closeBtn.onclick = fecharModal
window.onclick = (e) => { if (e.target === modal) fecharModal() }