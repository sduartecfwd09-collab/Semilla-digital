export const isValidCedulaNacional = (value: string) => /^\d{9}$/.test(value)
export const isValidDimex = (value: string) => /^\d{11,12}$/.test(value)
export const isValidNite = (value: string) => /^\d{10}$/.test(value)
export const isValidCRPhone = (value: string) => /^\d{8}$/.test(value)
