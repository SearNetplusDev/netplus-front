export const useLogDifference = () => {
  const ignoredFields = ['updated_at', 'created_at', 'deleted_at', 'id']

  const getDiff = (before, after) => {
    const changes = []
    const allKeys = new Set([...Object.keys(after || {}), ...Object.keys(before || {})])
    allKeys.forEach((key) => {
      if (ignoredFields.includes(key)) return
      const beforeValue = before?.[key]
      const afterValue = after?.[key]
      if (beforeValue !== afterValue) {
        changes.push({
          field: key,
          before: beforeValue,
          after: afterValue,
          isChanged: true,
        })
      }
    })
    return changes.sort((a, b) => a.field.localeCompare(b.field))
  }

  const getCategoryIcon = (action) => {
    const icons = {
      create: 'mdi-plus-circle',
      update: 'mdi-pencil-circle',
      delete: 'mdi-delete-circle',
      restore: 'mdi-history',
    }
    return icons[action] || 'mdi-information-circle'
  }

  const getActionColor = (action) => {
    const colors = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      restore: 'orange',
    }
    return colors[action] || 'grey'
  }

  return { getDiff, getCategoryIcon, getActionColor, ignoredFields }
}
