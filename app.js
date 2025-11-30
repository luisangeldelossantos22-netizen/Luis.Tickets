const appContainer = document.getElementById('app')

const DATA_FILE = 'data.json'
const STYLISTS = ['Luis', 'Maria', 'Pedro']
const WORKING_HOURS = { start: 9, end: 18, interval: 30 }
let appointments = []
let currentDate = new Date().toISOString().split('T')[0]

const fetchData = async () => {
  try {
    const response = await fetch(DATA_FILE)
    const data = await response.json()
    appointments = data.appointments || []
  } catch (error) {
    appointments = []
    await saveData()
  }
}

const saveData = async () => {
  try {
    const data = { appointments }
    await fetch(DATA_FILE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } catch (error) {
    console.error('Error al guardar los datos', error)
  }
}

const createNode = (tag, classes = [], content = '', attributes = {}) => {
  const node = document.createElement(tag)
  node.className = classes.join(' ')
  node.innerHTML = content

  Object.keys(attributes).forEach(key => {
    node.setAttribute(key, attributes[key])
  })

  return node
}

const getFormattedTimeSlots = () => {
  const slots = []
  for (let h = WORKING_HOURS.start; h < WORKING_HOURS.end; h++) {
    for (let m = 0; m < 60; m += WORKING_HOURS.interval) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

const renderAgendaGrid = () => {
  const timeSlots = getFormattedTimeSlots()
  const filteredAppointments = appointments.filter(a => a.date === currentDate)
  const agendaGrid = createNode('div', ['agenda-grid'])

  agendaGrid.appendChild(createNode('div', ['grid-header'], 'Hora'))
  STYLISTS.forEach(stylist => {
    agendaGrid.appendChild(createNode('div', ['grid-header'], stylist))
  })

  timeSlots.forEach(time => {
    agendaGrid.appendChild(createNode('div', ['grid-cell', 'time-slot'], time))

    STYLISTS.forEach(stylist => {
      const cell = createNode('div', ['grid-cell', 'appointment-cell'], '', {
        'data-time': time,
        'data-stylist': stylist
      })

      const cellAppointments = filteredAppointments.filter(
        a => a.time === time && a.stylist === stylist
      )

      cellAppointments.forEach(a => {
        const statusClass = a.status === 'Confirmada' ? 'confirmada' : 'pendiente'
        const appointmentNode = createNode('div', ['appointment', statusClass], `${a.clientName} (${a.service})`)
        cell.appendChild(appointmentNode)
      })

      cell.addEventListener('click', () => openModal(time, stylist))
      agendaGrid.appendChild(cell)
    })
  })

  return agendaGrid
}

const renderMainView = () => {
  appContainer.innerHTML = ''

  const header = createNode('div', ['header'])
  header.appendChild(createNode('h1', ['title'], 'LuisTickets'))

  const controls = createNode('div', ['controls'])
  const datePicker = createNode('input', ['input-field'], '', { type: 'date', value: currentDate, id: 'datePicker' })
  const newAppointmentBtn = createNode('button', ['button'], '+ Nueva Cita')

  newAppointmentBtn.addEventListener('click', () => openModal())
  datePicker.addEventListener('change', (e) => {
    currentDate = e.target.value
    render()
  })

  controls.appendChild(datePicker)
  controls.appendChild(newAppointmentBtn)
  header.appendChild(controls)
  appContainer.appendChild(header)
  appContainer.appendChild(createNode('h2', ['subtitle'], `Agenda para ${currentDate}`))
  appContainer.appendChild(renderAgendaGrid())
}

const renderModal = () => {
  const modal = createNode('div', ['modal-backdrop'], '', { id: 'appointmentModal' })
  const content = createNode('div', ['modal-content'])
  content.appendChild(createNode('h3', ['title'], 'Agendar Cita'))

  const form = createNode('form', ['appointment-form'], '', { id: 'appointmentForm' })

  const clientNameGroup = createNode('div', ['form-group'])
  clientNameGroup.appendChild(createNode('label', [], 'Nombre del Cliente', { for: 'clientName' }))
  clientNameGroup.appendChild(createNode('input', ['input-field'], '', { type: 'text', id: 'clientName', required: true }))
  form.appendChild(clientNameGroup)

  const serviceGroup = createNode('div', ['form-group'])
  serviceGroup.appendChild(createNode('label', [], 'Servicio', { for: 'service' }))
  const serviceSelect = createNode('select', ['input-field'], '', { id: 'service', required: true })
  serviceSelect.appendChild(createNode('option', [], 'Corte de Cabello'))
  serviceSelect.appendChild(createNode('option', [], 'Barba y Afeitado'))
  serviceSelect.appendChild(createNode('option', [], 'Manicura'))
  serviceSelect.appendChild(createNode('option', [], 'Tinte'))
  serviceGroup.appendChild(serviceSelect)
  form.appendChild(serviceGroup)

  const timeGroup = createNode('div', ['form-group'])
  timeGroup.appendChild(createNode('label', [], 'Hora', { for: 'time' }))
  const timeSelect = createNode('select', ['input-field'], '', { id: 'time', required: true })
  getFormattedTimeSlots().forEach(time => {
    timeSelect.appendChild(createNode('option', [], time, { value: time }))
  })
  timeGroup.appendChild(timeSelect)
  form.appendChild(timeGroup)

  const stylistGroup = createNode('div', ['form-group'])
  stylistGroup.appendChild(createNode('label', [], 'Estilista', { for: 'stylist' }))
  const stylistSelect = createNode('select', ['input-field'], '', { id: 'stylist', required: true })
  STYLISTS.forEach(stylist => {
    stylistSelect.appendChild(createNode('option', [], stylist, { value: stylist }))
  })
  stylistGroup.appendChild(stylistSelect)
  form.appendChild(stylistGroup)

  const actions = createNode('div', ['form-actions'])
  const cancelBtn = createNode('button', ['button', 'button-cancel'], 'Cancelar', { type: 'button' })
  const saveBtn = createNode('button', ['button'], 'Guardar Cita', { type: 'submit' })

  cancelBtn.addEventListener('click', closeModal)
  form.addEventListener('submit', handleSaveAppointment)

  actions.appendChild(cancelBtn)
  actions.appendChild(saveBtn)
  form.appendChild(actions)
  content.appendChild(form)
  modal.appendChild(content)
  
  appContainer.appendChild(modal)
}

const openModal = (time = null, stylist = null) => {
  const modal = document.getElementById('appointmentModal')
  if (!modal) return

  const datePicker = document.getElementById('datePicker')
  const timeSelect = document.getElementById('time')
  const stylistSelect = document.getElementById('stylist')

  if (time) timeSelect.value = time
  if (stylist) stylistSelect.value = stylist

  modal.querySelector('#appointmentForm').querySelector('input[type="text"]').focus()
  
  modal.classList.add('open')
}

const closeModal = () => {
  const modal = document.getElementById('appointmentModal')
  const form = document.getElementById('appointmentForm')
  if (modal) modal.classList.remove('open')
  if (form) form.reset()
}

const handleSaveAppointment = async (e) => {
  e.preventDefault()

  const form = e.target
  const clientName = form.clientName.value
  const service = form.service.value
  const time = form.time.value
  const stylist = form.stylist.value
  
  const newAppointment = {
    id: Date.now(),
    date: currentDate,
    time: time,
    stylist: stylist,
    clientName: clientName,
    service: service,
    status: 'Pendiente'
  }

  appointments.push(newAppointment)
  await saveData()
  closeModal()
  render()
}

const render = () => {
  renderMainView()
  if (!document.getElementById('appointmentModal')) {
    renderModal()
  }
}

const init = async () => {
  await fetchData()
  render()
}

init()