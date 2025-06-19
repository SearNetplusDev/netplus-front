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
      let value = typeof field.data === 'boolean' ? Number(field.data) : field.data
      if (key === 'pwd' && !value) continue // avoid empty passwords
      form.append(key, value)
    }
  }

  //  Extras like permissions or _method
  Object.entries(extras).forEach(([key, val]) => form.append(key, val))

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
  }else{
    console.error('La regamos')
  }
}
