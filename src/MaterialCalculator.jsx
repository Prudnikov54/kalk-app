import { useState, useEffect } from 'react'

const COLOR_KEY = 'kalk_colors'
const MODEL_KEY = 'kalk_models'

function getColors() {
  return JSON.parse(localStorage.getItem(COLOR_KEY) || '[]')
}
function getModels() {
  return JSON.parse(localStorage.getItem(MODEL_KEY) || '[]')
}

const SIZES = [600, 700, 800, 900]
const SIZE_TO_PANEL = { 600: 394, 700: 494, 800: 594, 900: 694 }

export default function MaterialCalculator() {
  const [colors, setColors] = useState([])
  const [models, setModels] = useState([])
  const [orders, setOrders] = useState([])
  const [order, setOrder] = useState({ modelId: '', color: '', size: 600, count: 1, custom: false, customPanel: 394 })
  const [filterColor, setFilterColor] = useState('')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    setColors(getColors())
    setModels(getModels())
  }, [])

  function handleAddOrder(e) {
    e.preventDefault()
    if (!order.modelId || !order.color || !order.size || !order.count) return
    setOrders([...orders, { ...order, modelId: String(order.modelId), id: Date.now() }])
    setOrder({ modelId: '', color: '', size: 600, count: 1, custom: false, customPanel: 394 })
    setSummary(null) // сбрасываем сводку при изменении заказа
  }
  function handleDeleteOrder(id) {
    setOrders(orders.filter(o => o.id !== id))
    setSummary(null) // сбрасываем сводку при изменении заказа
  }

  // Сводка по материалу (учитываем филёнки и подпилы)
  function calculateSummary() {
    const summary = {}
    orders.filter(o => !filterColor || o.color === filterColor).forEach(o => {
      const model = models.find(m => String(m.id) === String(o.modelId))
      if (!model) return
      const panel = o.custom ? o.customPanel : SIZE_TO_PANEL[o.size]
      // Филёнки
      model.fillings.forEach(f => {
        if (!summary[f.type]) summary[f.type] = {}
        if (!summary[f.type][panel]) summary[f.type][panel] = 0
        summary[f.type][panel] += f.count * o.count
      })
      // Подпилы
      if (model.cuts && Array.isArray(model.cuts)) {
        model.cuts.filter(cut => cut.width && cut.count).forEach(cut => {
          const cutKey = `Подпил ${cut.width}`
          if (!summary[cutKey]) summary[cutKey] = {}
          if (!summary[cutKey][panel]) summary[cutKey][panel] = 0
          summary[cutKey][panel] += Number(cut.count) * o.count
        })
      }
    })
    setSummary(summary)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Добавить позицию заказа</h2>
      <form onSubmit={handleAddOrder} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select value={order.modelId} onChange={e => setOrder({ ...order, modelId: e.target.value })} required>
          <option value="">Модель</option>
          {models.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
        </select>
        <select value={order.color} onChange={e => setOrder({ ...order, color: e.target.value })} required>
          <option value="">Цвет</option>
          {colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={order.size} onChange={e => setOrder({ ...order, size: +e.target.value, customPanel: SIZE_TO_PANEL[e.target.value] })}>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" min={1} value={order.count} onChange={e => setOrder({ ...order, count: +e.target.value })} style={{ width: 60 }} />
        <label>
          <input type="checkbox" checked={order.custom} onChange={e => setOrder({ ...order, custom: e.target.checked })} /> Нестандарт
        </label>
        {order.custom && (
          <input type="number" min={1} value={order.customPanel} onChange={e => setOrder({ ...order, customPanel: +e.target.value })} placeholder="Размер филёнки" style={{ width: 100 }} />
        )}
        <button type="submit">Добавить</button>
      </form>
      <h3>Список позиций</h3>
      <ul>
        {orders.map(o => {
          const model = models.find(m => String(m.id) === String(o.modelId))
          return <li key={o.id}>{model?.name || '—'} / {o.color} / {o.size} / {o.count} шт. {o.custom ? `(нестандарт: ${o.customPanel})` : ''} <button onClick={() => handleDeleteOrder(o.id)}>Удалить</button></li>
        })}
      </ul>
      <hr />
      <h2>Сводка по материалу</h2>
      <div style={{ marginBottom: 8 }}>
        <span>Показать только цвет: </span>
        <select value={filterColor} onChange={e => setFilterColor(e.target.value)}>
          <option value="">Все</option>
          {colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button style={{ marginLeft: 8 }} onClick={calculateSummary}>Рассчитать сводку</button>
      </div>
      {summary === null ? <div>Нажмите "Рассчитать сводку"</div> : (
        Object.keys(summary).length === 0 ? <div>Нет данных</div> : (
          <div>
            {Object.entries(summary).sort().map(([type, panels]) => (
              <div key={type} style={{ marginBottom: 8 }}>
                <b>{type}:</b>
                <ul>
                  {Object.entries(panels).sort((a, b) => +a[0] - +b[0]).map(([panel, qty]) => (
                    <li key={panel}>{panel}: {qty} шт.</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
} 