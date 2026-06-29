export const getErrorMessage = (error: any): string => { return error?.response?.data?.message || 'Ein Fehler ist aufgetreten.'; };
