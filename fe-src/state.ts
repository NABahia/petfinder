export const state = {
  data: {
    token: localStorage.getItem("token") || "",
    lat: 0,
    lng: 0,
  },

  getState() {
    return this.data;
  },

  setState(newState: any) {
    this.data = newState;
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
    const currentState = this.getState();
    currentState.token = token;
    this.setState(currentState);
  },

  clearToken() {
    localStorage.removeItem("token");
    const currentState = this.getState();
    currentState.token = "";
    this.setState(currentState);
  },

  setLocation(lat: number, lng: number) {
    const currentState = this.getState();
    currentState.lat = lat;
    currentState.lng = lng;
    this.setState(currentState);
  },
};
