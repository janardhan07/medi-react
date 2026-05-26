import React from 'react'

export function Stars({ rating = 0, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

export function StarPicker({ value, onChange }) {
  return (
    <div className="star-picker">
      {[1,2,3,4,5].map(s => (
        <span key={s} className="star-pick"
          onClick={() => onChange(s)}
          style={{ color: s <= value ? '#f59e0b' : '#e2e8f0' }}>
          ★
        </span>
      ))}
    </div>
  )
}

export const SPECIALTY_ICONS = {
  'General Physician':'🩺','Cardiologist':'❤️','Neurologist':'🧠',
  'Ophthalmologist':'👁️','Dermatologist':'🧴','Orthopedist':'🦴',
  'Gastroenterologist':'🫁','ENT Specialist':'👂','Gynecologist':'👩‍⚕️',
  'Pediatrician':'🧒','Psychiatrist':'🧘','Urologist':'🔬',
}

export const ALL_SPECIALTIES = Object.keys(SPECIALTY_ICONS)

export const INDIAN_CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune',
  'Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Indore','Kochi',
  'Coimbatore','Chandigarh','Bhopal','Visakhapatnam','Patna','Vadodara',
]

export function statusBadge(status) {
  const map = {
    PENDING:   ['badge badge-yellow','Pending'],
    CONFIRMED: ['badge badge-blue','Confirmed'],
    COMPLETED: ['badge badge-green','Completed'],
    CANCELLED: ['badge badge-red','Cancelled'],
  }
  const [cls, label] = map[status] || ['badge badge-gray', status]
  return <span className={cls}>{label}</span>
}
