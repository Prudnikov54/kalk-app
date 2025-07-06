import { useState, useEffect } from 'react'

// Храним цвета и модели в localStorage
const COLOR_KEY = 'kalk_colors'
const MODEL_KEY = 'kalk_models'

function getColors() {
  return JSON.parse(localStorage.getItem(COLOR_KEY) || '[]')
}
function setColors(colors) {
  localStorage.setItem(COLOR_KEY, JSON.stringify(colors))
}
function getModels() {
  return JSON.parse(localStorage.getItem(MODEL_KEY) || '[]')
}
function setModels(models) {
  localStorage.setItem(MODEL_KEY, JSON.stringify(models))
}

const FILLING_TYPES = ['205', '213', '260']

export default function ManagePage() {
  // Цвета
  const [colors, setColorsState] = useState([])
  const [newColor, setNewColor] = useState('')
  // Модели
  const [models, setModelsState] = useState([])
  const [newModel, setNewModel] = useState({ name: '', fillings: [{ type: '205', count: 1 }], basePanelSize: 394, cuts: [{ width: '', count: '' }] })

  useEffect(() => {
    setColorsState(getColors())
    setModelsState(getModels())
  }, [])

  // Цвета
  function handleAddColor(e) {
    e.preventDefault()
    if (!newColor.trim() || colors.includes(newColor.trim())) return
    const updated = [...colors, newColor.trim()]
    setColors(updated)
    setColorsState(updated)
    setNewColor('')
  }
  function handleDeleteColor(color) {
    if (!window.confirm('Удалить цвет?')) return
    const updated = colors.filter(c => c !== color)
    setColors(updated)
    setColorsState(updated)
  }

  // Модели
  function handleAddModel(e) {
    e.preventDefault()
    if (!newModel.name.trim()) return
    // Оставляем только валидные подпилы
    const validCuts = (newModel.cuts || []).filter(cut => cut.width && cut.count)
    const updated = [...models, { ...newModel, id: Date.now(), cuts: validCuts }]
    setModels(updated)
    setModelsState(updated)
    setNewModel({ name: '', fillings: [{ type: '205', count: 1 }], basePanelSize: 394, cuts: [{ width: '', count: '' }] })
  }
  function handleDeleteModel(id) {
    if (!window.confirm('Удалить модель?')) return
    const updated = models.filter(m => m.id !== id)
    setModels(updated)
    setModelsState(updated)
  }

  // Филёнки
  function handleFillingChange(idx, field, value) {
    const fillings = newModel.fillings.map((f, i) => i === idx ? { ...f, [field]: field === 'count' ? +value : value } : f)
    setNewModel({ ...newModel, fillings })
  }
  function handleAddFilling() {
    setNewModel({ ...newModel, fillings: [...newModel.fillings, { type: '205', count: 1 }] })
  }
  function handleRemoveFilling(idx) {
    setNewModel({ ...newModel, fillings: newModel.fillings.filter((_, i) => i !== idx) })
  }

  // Подпилы
  function handleCutChange(idx, field, value) {
    const cuts = newModel.cuts.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    setNewModel({ ...newModel, cuts })
  }
  function handleAddCutRow() {
    setNewModel({ ...newModel, cuts: [...newModel.cuts, { width: '', count: '' }] })
  }
  function handleRemoveCut(idx) {
    setNewModel({ ...newModel, cuts: newModel.cuts.filter((_, i) => i !== idx) })
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Цвета</h2>
      <form onSubmit={handleAddColor} style={{ marginBottom: 16 }}>
        <input value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Новый цвет" />
        <button type="submit">Добавить</button>
      </form>
      <ul>
        {colors.map(color => (
          <li key={color}>{color} <button onClick={() => handleDeleteColor(color)}>Удалить</button></li>
        ))}
      </ul>
      <hr />
      <h2>Модели дверей</h2>
      <form onSubmit={handleAddModel} style={{ marginBottom: 16 }}>
        <input value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} placeholder="Название модели" />
        <input type="number" value={newModel.basePanelSize} onChange={e => setNewModel({ ...newModel, basePanelSize: +e.target.value })} placeholder="Размер филёнки (600)" min={1} />
        <div style={{ margin: '8px 0' }}>
          <b>Филёнки:</b>
          {newModel.fillings.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <select value={f.type} onChange={e => handleFillingChange(idx, 'type', e.target.value)}>
                {FILLING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" min={1} value={f.count} onChange={e => handleFillingChange(idx, 'count', e.target.value)} style={{ width: 60 }} />
              <button type="button" onClick={() => handleRemoveFilling(idx)} disabled={newModel.fillings.length === 1}>Удалить</button>
            </div>
          ))}
          <button type="button" onClick={handleAddFilling}>Добавить филёнку</button>
        </div>
        <div style={{ margin: '8px 0' }}>
          <b>Подпилы:</b>
          {newModel.cuts.map((cut, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <input type="number" min={1} value={cut.width} onChange={e => handleCutChange(idx, 'width', e.target.value)} placeholder="Ширина подпила" style={{ width: 100 }} />
              <input type="number" min={1} value={cut.count} onChange={e => handleCutChange(idx, 'count', e.target.value)} placeholder="Кол-во" style={{ width: 60 }} />
              <button type="button" onClick={() => handleRemoveCut(idx)} disabled={newModel.cuts.length === 1}>Удалить</button>
            </div>
          ))}
          <button type="button" onClick={handleAddCutRow}>Добавить строку подпила</button>
        </div>
        <button type="submit">Добавить модель</button>
      </form>
      <ul>
        {models.map(model => (
          <li key={model.id}>
            <b>{model.name}</b> — филёнки: {model.fillings.map(f => `${f.type}-${f.count}`).join(', ')} (размер: {model.basePanelSize})
            {model.cuts && model.cuts.filter(c=>c.width&&c.count).length > 0 && (
              <span> | подпилы: {model.cuts.filter(c=>c.width&&c.count).map(c => `${c.width}мм-${c.count}шт`).join(', ')}</span>
            )}
            <button onClick={() => handleDeleteModel(model.id)} style={{ marginLeft: 8 }}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  )
} 