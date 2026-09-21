import { useEffect, useRef, useState } from 'react'
import { loadActions, saveActions } from './storage.js'

function newId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2)
}

export default function App() {
  // Būsena inicializuojama iš localStorage; išsaugoma po kiekvieno pakeitimo.
  const [actions, setActions] = useState(() => loadActions())
  const [newTitle, setNewTitle] = useState('')
  const [addError, setAddError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editError, setEditError] = useState('')
  const editInputRef = useRef(null)

  useEffect(() => {
    saveActions(actions)
  }, [actions])

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus()
  }, [editingId])

  function handleAdd(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      setAddError('Įveskite veiksmo pavadinimą.')
      return
    }
    setActions((prev) => [...prev, { id: newId(), title, done: false }])
    setNewTitle('')
    setAddError('')
  }

  // Šiame etape „Atlikta“ tik nustato būseną į true – pakartotinis
  // paspaudimas jos nekeičia (nėra perjungimo atgal).
  function handleDone(id) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: true } : a))
    )
  }

  function handleDelete(id) {
    setActions((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) cancelEdit()
  }

  function startEdit(action) {
    setEditingId(action.id)
    setEditTitle(action.title)
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditError('')
  }

  function saveEdit(e) {
    e.preventDefault()
    const title = editTitle.trim()
    if (!title) {
      setEditError('Pavadinimas negali būti tuščias.')
      return
    }
    setActions((prev) =>
      prev.map((a) => (a.id === editingId ? { ...a, title } : a))
    )
    cancelEdit()
  }

  const doneCount = actions.filter((a) => a.done).length

  return (
    <main className="app">
      <h1>Mano rutina</h1>
      <p className="subtitle">Kasdieniai veiksmai</p>

      <form className="add-form" onSubmit={handleAdd} noValidate>
        <label htmlFor="new-action" className="visually-hidden">
          Naujo veiksmo pavadinimas
        </label>
        <input
          id="new-action"
          type="text"
          placeholder="Pvz., Valytis dantis"
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value)
            if (addError) setAddError('')
          }}
        />
        <button type="submit" className="btn primary">
          Pridėti
        </button>
      </form>
      {addError && (
        <p className="error" role="alert">
          {addError}
        </p>
      )}

      {actions.length > 0 && (
        <p className="counter">
          Atlikta: {doneCount} iš {actions.length}
        </p>
      )}

      {actions.length === 0 ? (
        <p className="empty">Kol kas veiksmų nėra. Pridėkite pirmąjį.</p>
      ) : (
        <ul className="list">
          {actions.map((action) => (
            <li
              key={action.id}
              className={'item' + (action.done ? ' done' : '')}
              data-done={action.done}
            >
              {editingId === action.id ? (
                <form className="edit-form" onSubmit={saveEdit} noValidate>
                  <input
                    ref={editInputRef}
                    type="text"
                    aria-label="Veiksmo pavadinimas"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value)
                      if (editError) setEditError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button type="submit" className="btn primary">
                    Išsaugoti
                  </button>
                  <button type="button" className="btn" onClick={cancelEdit}>
                    Atšaukti
                  </button>
                  {editError && (
                    <p className="error" role="alert">
                      {editError}
                    </p>
                  )}
                </form>
              ) : (
                <>
                  <span className="status" aria-hidden="true">
                    {action.done ? '✓' : '○'}
                  </span>
                  <span className="title">{action.title}</span>
                  <span className="badge">
                    {action.done ? 'Atlikta' : 'Neatlikta'}
                  </span>
                  <span className="buttons">
                    <button
                      type="button"
                      className="btn success"
                      onClick={() => handleDone(action.id)}
                    >
                      Atlikta
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => startEdit(action)}
                    >
                      Keisti
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => handleDelete(action.id)}
                    >
                      Ištrinti
                    </button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
