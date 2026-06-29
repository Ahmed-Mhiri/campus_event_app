export const createEventSource = (url: string) => new EventSource(url, { withCredentials: true });
