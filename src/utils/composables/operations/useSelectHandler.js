export const useSelectHandler = (fields, { onNodeChange, onStateChange, onMunicipalityChange }) => {
  const handleSelectChange = (name, val) => {
    const handlers = {
      type: () => {
        fields.type.data = val
      },
      profile: () => {
        fields.profile.data = val
      },
      node: () => {
        fields.node.data = val
        onNodeChange(true)
      },
      equipment: () => {
        fields.equipment.data = val
      },
      branch: () => {
        fields.branch.data = val
      },
      state: () => {
        fields.state.data = val
        onStateChange(true)
      },
      municipality: () => {
        fields.municipality.data = val
        onMunicipalityChange(true)
      },
      district: () => {
        fields.district.data = val
      },
      status: () => {
        fields.status.data = val
      },
    }
    handlers[name]?.()
  }

  return { handleSelectChange }
}
