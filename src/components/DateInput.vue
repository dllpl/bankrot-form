<template>
  <div class="w-100">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="end"
    >
      <template
        v-slot:activator="{ props }"
      >
        <v-text-field
          v-model="date"
          :label="label"
          :variant="variant"
          color="primary"
          :error-messages="errorMessage"
          :base-color="errorMessage === '' ? 'secondary' : ''"
          clearable
          @click:clear="$emit('updateFromChildren', null); date = null"
          @focusout=" !date ? errorMessage = 'Заполните поле' : ''"
        >
          <template v-slot:append-inner>
            <v-icon icon="mdi-calendar-edit" v-bind="props"></v-icon>
          </template>
        </v-text-field>

      </template>
      <v-date-picker
        hide-header
        :max="(new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().substr(0, 10))"
        :min="(new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().substr(0, 10))"
        first-day-of-week="1"
        :view-mode="viewMode"
        @update:modelValue="savePickerDate"
        @update:year="viewMode = 'months'"
      ></v-date-picker>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: "DateInput",
  props: ['label', 'variant', 'errorMessages'],
  data() {
    return {
      date: null,
      menu: false,
      viewMode: 'year',
      errorMessage: null,
    }
  },
  watch: {
    errorMessages(val) {
      if(val.length) {
        this.errorMessage = val
      }
    },
    menu() {
      this.viewMode = 'year'
    },
    date(date) {
      if (date && date.length) {
        const [day, month, year] = date.split('.').map(Number);
        const inputDate = new Date(year, month - 1, day);

        const currentDate = new Date();
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);

        if (inputDate <= currentDate && inputDate >= minDate) {
          this.errorMessage = ''
          this.$emit('updateFromChildren', date)
        } else {
          this.errorMessage = 'Введите корректную дату'
        }
      } else {
        this.errorMessage = 'Заполните поле'
      }
    }
  },
  methods: {
    savePickerDate(date) {
      date = date.toLocaleDateString('ru-RU')
      this.date = date
      this.$emit('updateFromChildren', date)
      this.menu = !this.menu
    },
  },
}
</script>
