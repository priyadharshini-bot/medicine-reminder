import { useState, useEffect } from 'react'

function App() {

  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('medicines')
    return saved ? JSON.parse(saved) : []
  })

  const [form, setForm] = useState({
    name: '',
    dose: '',
    time: '',
    meal: 'after food'
  })

  // Save to localStorage every time medicines changes
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(medicines))
  }, [medicines])

  // Ask for notification permission when app loads
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // Schedule a browser notification for a medicine
  function scheduleNotification(medicine) {
    if (!medicine.time) return
    if (Notification.permission !== 'granted') return

    const [hours, minutes] = medicine.time.split(':')
    const now = new Date()
    const target = new Date()

    target.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // If time already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }

    const delay = target - now

    setTimeout(() => {
      new Notification(`Time to take ${medicine.name}! 💊`, {
        body: `${medicine.dose ? medicine.dose + ' · ' : ''}${medicine.meal}`,
      })
    }, delay)
  }

  function handleAdd() {
    if (!form.name) return

    const newMedicine = {
      id: Date.now(),
      name: form.name,
      dose: form.dose,
      time: form.time,
      meal: form.meal,
      taken: false
    }

    setMedicines([...medicines, newMedicine])

    // Schedule notification for this medicine
    scheduleNotification(newMedicine)

    setForm({ name: '', dose: '', time: '', meal: 'after food' })
  }

  function handleTaken(id) {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ))
  }

  function handleDelete(id) {
    setMedicines(medicines.filter(med => med.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">

      {/* Header */}
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          MedRemind
        </h1>
        <p className="text-gray-400 text-sm mt-1">never miss a dose again</p>
      </div>

      {/* Notification Permission Banner */}
      {Notification.permission !== 'granted' && (
        <div className="max-w-md mx-auto mb-4 bg-yellow-900 border border-yellow-700 rounded-2xl px-4 py-3 flex items-center justify-between">
          <p className="text-yellow-300 text-xs">enable notifications for reminders 🔔</p>
          <button
            onClick={() => Notification.requestPermission()}
            className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-3 py-1 rounded-lg transition-all"
          >
            enable
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="max-w-md mx-auto grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
          <p className="text-2xl font-bold text-white">{medicines.length}</p>
          <p className="text-xs text-gray-400 mt-1">medicines</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
          <p className="text-2xl font-bold text-white">
            {medicines.filter(m => m.time).length}
          </p>
          <p className="text-xs text-gray-400 mt-1">today</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
          <p className="text-2xl font-bold text-purple-400">
            {medicines.filter(m => m.taken).length}
          </p>
          <p className="text-xs text-gray-400 mt-1">taken</p>
        </div>
      </div>

      {/* Add Medicine Form */}
      <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-6 border border-gray-800 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">+ add medicine</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="medicine name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="dosage (e.g. 500mg)"
            value={form.dose}
            onChange={e => setForm({ ...form, dose: e.target.value })}
            className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
              className="bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={form.meal}
              onChange={e => setForm({ ...form, meal: e.target.value })}
              className="bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option>after food</option>
              <option>before food</option>
              <option>with food</option>
              <option>anytime</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          >
            add medicine
          </button>
        </div>
      </div>

      {/* Medicine List */}
      <div className="max-w-md mx-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          your medicines
        </h2>

        {medicines.length === 0 ? (
          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 text-center">
            <p className="text-gray-400 text-sm">no medicines added yet</p>
            <p className="text-gray-600 text-xs mt-1">add one above to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {medicines.map(med => (
              <div
                key={med.id}
                className={`bg-gray-900 rounded-2xl p-4 border flex items-center gap-4 transition-all ${
                  med.taken ? 'border-purple-800 opacity-60' : 'border-gray-800'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-bold text-sm ${med.taken ? 'line-through text-gray-500' : 'text-white'}`}>
                    {med.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {med.dose && `${med.dose} · `}{med.meal}{med.time && ` · ${med.time}`}
                  </p>
                </div>

                <button
                  onClick={() => handleTaken(med.id)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                    med.taken
                      ? 'bg-purple-900 text-purple-300'
                      : 'bg-gray-800 text-gray-400 hover:bg-purple-900 hover:text-purple-300'
                  }`}
                >
                  {med.taken ? 'taken ✓' : 'mark taken'}
                </button>

                <button
                  onClick={() => handleDelete(med.id)}
                  className="text-gray-600 hover:text-red-400 text-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default App