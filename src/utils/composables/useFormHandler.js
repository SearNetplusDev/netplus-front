export function resetFieldErrors(fields) {
  for (const field of Object.values(fields)) {
    if ('error' in field) {
      field.error = false
      field['error-message'] = ''
    }
  }
}

export function buildFormData(fields, extras = {}) {
  const form = new FormData()
  for (const [key, field] of Object.entries(fields)) {
    if ('data' in field) {
      // If it's boolean converting to numeric
      //     let value = typeof field.data === 'boolean' ? Number(field.data) : field.data
      //     if (key === 'pwd' && !value) continue // avoid empty passwords
      //     form.append(key, value)
      const val = convertValue(field.data)
      if (val === '') continue
      if (key === 'pwd' && !val) continue
      form.append(key, val)
    }
  }
  //  Extras like permissions or _method
  // Object.entries(extras).forEach(([key, val]) => form.append(key, val))
  //
  Object.entries(extras).forEach(([key, val]) => {
    if (val !== '' && val !== null && val !== undefined) {
      form.append(key, val)
    }
  })
  return form
}

export function handleSubmissionError(error, fields) {
  if (error.response?.status === 422) {
    const errors = error.response?.data?.errors || {}

    for (const [key, field] of Object.entries(fields)) {
      if ('error' in field) {
        const messages = errors[key]
        field.error = !!messages
        field['error-message'] = messages ? messages[0] : ''
      }
    }
  } else {
    console.error('La regamos')
  }
}

function convertValue(val) {
  if (typeof val === 'boolean') {
    return val ? '1' : '0'
  }
  if (val === null || val === undefined) {
    return ''
  }
  return String(val)
}
