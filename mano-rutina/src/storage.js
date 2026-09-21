// Duomenų saugojimas naršyklės localStorage.
// Raktas versijuojamas neatsitiktinai: vėlesni etapai gali plėsti veiksmo
// objektą (pvz., pridėti laukų), o seni įrašai turi likti skaitomi.
export const STORAGE_KEY = 'mano-rutina:veiksmai'

export function loadActions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Paliekame tik tinkamus įrašus, bet nieko nekeičiame ir neišvalome.
    return parsed.filter(
      (a) => a && typeof a.id === 'string' && typeof a.title === 'string'
    )
  } catch {
    return []
  }
}

export function saveActions(actions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
  } catch {
    // Jei saugykla nepasiekiama, programa vis tiek veikia sesijos metu.
  }
}
