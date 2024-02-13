import axios from "axios";

export const requestHelper = {
  methods: {
    dadataRequest(type, body) {
      return axios.post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/' + type, body, {
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + import.meta.env.VITE_DADATA_TOKEN
        }
      })
    },
    sendForm(data) {
      return axios.post(import.meta.env.VITE_API_URL_TEST, data, {
        headers: {"Accept": "application/json",},
      })
    }
  }
}
