<template>
  <div>
    <v-stepper
      hide-actions
      :model-value="form.step"
      v-if="!showFinal"
    >
      <v-stepper-header>
        <v-stepper-item
          color="primary"
          v-for="(item, i) in stepper"
          :title="item.title"
          :value="i + 1"
        ></v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item
          v-for="(item, i) in stepper"
          :value="i + 1"
        >
          <Form v-slot="{ validate, setValues }" class="bankrot__form">
            <v-row
              v-for="(item, i) in item.fields"
              :key="i"
              dense
            >
              <v-col :md="item?.additional ? 6 : 12" sm="12" cols="12">
                <Field
                  v-slot="{ field, errors, meta, handleChange}"
                  :rules="item.validate_rules"
                  :name="`form_${item.model}`"
                  v-model.trim="form[item.model]"
                  :type="item.type"
                >
                  <component
                    :is="item.component"
                    :base-color="meta.valid && meta.validated ? 'secondary' : ''"
                    :items="item?.items ? items[item.items] : ''"
                    :label="item.label"
                    :type="item.type"
                    :variant="item.variant"
                    v-bind="field"
                    :error-messages="errors"
                    v-maska:[options[item.maska]]
                    :disabled="disabled[item.model]"
                    color="primary"
                    @input="onInput(form[item.model], item.label, item?.items)"
                    @updateFromChildren="(val) => {form[item.model] = val; handleChange(val, false)}"
                    auto-select-first
                    return-object
                    @focus="onFocus(item)"
                    @blur="onBlur(item)"
                  ></component>
                </Field>
              </v-col>
              <template
                v-if="item?.additional"
                v-for="(item, i) in item.additional"
              >
                <v-col md="6" sm="12" cols="12">
                  <component
                    v-model="form[item.model]"
                    :name="`form_${item.model}`"
                    :type="item.type"
                    :items="item?.items ? items[item.items] : ''"
                    :is="item.component"
                    :label="item.label"
                    :disabled="disabled[item.model]"
                    :variant="item.variant"
                    v-maska:[options[item.maska]]
                    color="primary"
                    @input="onInput(form[item.model], item.label)"
                  ></component>
                </v-col>
              </template>
            </v-row>
            <v-row justify="space-between" align="center" class="px-2">
              <v-btn @click="prev(form.step)" variant="flat" :disabled="form.step === 1">Назад</v-btn>
              <v-btn color="primary" variant="flat" @click="next(form.step, validate)" :disabled="false">{{
                  nextText
                }}
              </v-btn>
            </v-row>
          </Form>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
    <v-card v-else
            class="mx-auto mt-3"
            width="400"
            prepend-icon="mdi-check-circle-outline"
            color="success"
    >
      <template v-slot:title>
        Ваша заявка принята
      </template>
      <v-card-text>
        <v-btn @click="clearAndBack">Отправить новую форму</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
// components
import {Field, Form} from 'vee-validate'
import {VTextField} from 'vuetify/components/VTextField'
import {VCombobox} from 'vuetify/components/VCombobox'
import {VCheckbox} from 'vuetify/components/VCheckbox'
import {VDatePicker} from 'vuetify/components/VDatePicker'
import {VSelect} from 'vuetify/components/VSelect'
import DateInput from "@/components/DateInput"
import DateTableEstate from "@/components/tables/DateTableEstate"
import DateTableSale from "@/components/tables/DataTableSale"


// mixins
import {requestHelper} from "@/mixins/requestHelper"

//other
import {vMaska} from 'maska'
import {v4 as uuidv4, validate as uuidValidate} from 'uuid'
import Cookies from 'js-cookie'

export default {
  name: "BankrotForm",
  directives: {maska: vMaska},
  mixins: [requestHelper],
  components: {
    Form, Field,
    VTextField, VCombobox, VCheckbox, VDatePicker, DateInput, VSelect, DateTableEstate, DateTableSale
  },
  data() {
    return {
      showFinal: false,
      options: {
        date: {
          mask: '##.##.####',
        },
        children: {
          mask: '##'
        },
        pass_code: {
          mask: '###-###'
        },
        series_and_number: {
          mask: '#### ######'
        },
        cyrillic_and_upper_case: {
          preProcess: val => {
            val = val.replace(/[^а-яё ,-]/ig, '')
            return val.charAt(0).toUpperCase() + val.slice(1)
          }
        },
        phone: {
          mask: '+7(9##) ###-##-##',
        },
        year: {
          mask: '####',
          postProcess: val => {
            const max = "" + new Date().getFullYear()
            return val > max ? max : val
          }
        },
        sum: {
          preProcess: val => val.replace(/\D/g, ''),
          postProcess: val => {
            if (val.length) {
              return val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
            } else {
              return ''
            }
          }
        }
      },
      form: {
        step: 1,
        form_id: null,
        manager_id: null,
      },
      items: {
        family_status_items: ['Женат/Замужем', 'Холост/Не замужем', 'Разведен/Разведена'],
        work_status_items: ['Работа в найме', 'Безработный', 'Индивидуальный предприниматель/ самозанятый', 'Пенсионер'],
        debt_sum_items: ['До 300 000 руб.', 'До 500 000 руб.', 'Более 500 000 руб.', 'Затрудняюсь ответить'],
        delay_items: ['Да', 'Нет'],
        criminal_record_items: ['Да', 'Нет'],
        delay_sum_items: ['1-3 мес.', '4-6 мес.', '7-12 мес.', 'Более года']
      },
      disabled: {
        patronymic: false,
        no_patronymic: false,
        children: false,
        no_children: false,
        delay_sum: true
      },

      stepper: [
        {
          step: 1,
          title: 'Базовая информация',
          fields: [
            {
              component: 'v-combobox',
              label: 'Фамилия',
              type: 'text',
              variant: "outlined",
              model: 'last_name',
              maska: 'cyrillic_and_upper_case',
              items: 'last_name',
              validate_rules: 'required|min:3|max:30',
            },
            {
              component: 'v-combobox',
              type: 'text',
              label: 'Имя',
              model: 'first_name',
              variant: "outlined",
              maska: 'cyrillic_and_upper_case',
              items: 'first_name',
              validate_rules: 'required|min:3|max:30',
            },
            {
              component: 'v-combobox',
              type: 'text',
              label: 'Отчество',
              model: 'patronymic',
              maska: 'cyrillic_and_upper_case',
              variant: "outlined",
              items: 'patronymic',
              validate_rules: 'min:3|max:30',
              additional: [
                {
                  component: 'v-checkbox',
                  type: 'checkbox',
                  label: 'Нет отчества',
                  model: 'no_patronymic'
                }
              ],
            },
            {
              component: 'v-text-field',
              type: 'tel',
              label: 'Телефон',
              model: 'phone',
              maska: 'phone',
              variant: "outlined",
              validate_rules: 'required|min:17|max:17',
            },
          ],
        },
        {
          step: 2,
          title: 'Личные данные',
          fields: [
            {
              component: 'v-combobox',
              label: 'Регион',
              type: 'text',
              variant: "outlined",
              model: 'region',
              maska: 'cyrillic_and_upper_case',
              items: 'region',
              validate_rules: 'required|min:3|max:100',
            },
            {
              component: 'DateInput',
              label: 'Дата рождения',
              type: 'datepicker',
              variant: "outlined",
              model: 'birthdate',
              maska: 'date',
              validate_rules: 'required',
            },
            {
              component: 'v-select',
              label: 'Семейное положение',
              type: 'text',
              items: 'family_status_items',
              variant: "outlined",
              model: 'family_status',
              validate_rules: 'required',
            },
            {
              component: 'v-text-field',
              type: 'text',
              label: 'Дети (до 18 лет) - укажите количество',
              model: 'children',
              maska: 'children',
              variant: "outlined",
              validate_rules: 'between:1,10',
              additional: [
                {
                  component: 'v-checkbox',
                  type: 'checkbox',
                  label: 'Нет детей',
                  model: 'no_children',
                  variant: "outlined",
                  validate_rules: 'required',
                }
              ],
            }
          ]
        },
        {
          step: 3,
          title: 'Доходы и задолженность',
          fields: [
            {
              component: 'v-select',
              label: 'Тип занятости ',
              type: 'text',
              variant: "outlined",
              model: 'work_status',
              maska: null,
              items: 'work_status_items',
              validate_rules: 'required',
            },
            {
              component: 'v-text-field',
              label: 'Уровень дохода (зарплата/ пенсия), ₽',
              type: 'text',
              variant: "outlined",
              maska: 'sum',
              model: 'salary',
              validate_rules: 'required',
            },
            {
              component: 'v-select',
              label: 'Сумма долга по кредитам',
              type: 'text',
              variant: "outlined",
              model: 'debt_sum',
              items: 'debt_sum_items',
              validate_rules: 'required',
            },
            {
              component: 'v-select',
              label: 'Наличие просроченной задолженности',
              type: 'text',
              variant: "outlined",
              model: 'delay',
              items: 'delay_items',
              validate_rules: 'required',
              additional: [
                {
                  component: 'v-select',
                  type: 'text',
                  label: 'Срок просрочки',
                  maska: 'sum',
                  variant: "outlined",
                  model: 'delay_sum',
                  items: 'delay_sum_items',
                  validate_rules: 'required_if:form_delay,Да',
                }
              ],
            },
            {
              component: 'v-select',
              label: 'Наличие судимости ',
              type: 'text',
              variant: "outlined",
              model: 'criminal_record',
              items: 'criminal_record_items',
              validate_rules: 'required',
            }
          ]
        },
        {
          step: 4,
          title: 'Собственность',
          fields: [
            {
              component: 'DateTableEstate',
              label: 'Имущество',
              model: 'estate_items',
              items: []
            },
            {
              component: 'DateTableSale',
              label: 'Сделки купли-продажи имущества за последние 3 года',
              model: 'sale_items',
              items: []
            }
          ]
        },
      ],
    }
  },
  computed: {
    nextText() {
      if (this.form.step < 4)
        return 'Дальше'
      else
        return 'Отправить'
    }
  },
  watch: {
    'form.family_status'(val) {
      this.stepper[3].fields[1].label = val === 'Женат/Замужем' ? 'Сделки купли-продажи совместного имущества за последние 3 года' : 'Сделки купли-продажи имущества за последние 3 года'
    },
    'form.no_children'(val) {
      this.disabled.children = null
    },
    'form.children'(val) {
      this.disabled.no_children = !!val
    },
    'form.patronymic'(val) {
      this.disabled.no_patronymic = !!val;
    },
    'form.no_patronymic'(val) {
      this.disabled.patronymic = null
    },
    'form.region'(val) {
      if (val && val.length > 1) {
        this.dadataRequest('address', {
          query: val,
          count: 5,
          from_bound: {value: "region"},
          to_bound: {value: "region"}
        }).then(({data}) => {
          this.items['region'] = []
          for (let item in data.suggestions) {
            this.items['region'].push(data.suggestions[item].value)
          }
        })
      }
    },
    'form.delay'(val) {
      this.disabled.delay_sum = val !== 'Да';
      this.form.delay_sum = null
    }
  },
  methods: {
    onFocus(item) {
      if (item.model === "children") {
        this.stepper[1].fields[3].label = 'Дети (до 18 лет)'
      }
    },
    onBlur(item) {
      if (item.model === "children") {
        this.stepper[1].fields[3].label = 'Дети (до 18 лет) - укажите количество'
      }
    },
    async next(step, validate) {
      let valid_data = await validate()
      if (valid_data.valid) {

        this.form.phone = this.form.phone.replace(/[-() ]/g, '')

        this.sendForm(this.form)
        if (step < 4) {
          this.form.step++
        }
        if (step === 4) {
          this.showFinal = true
          Cookies.remove('form_id')
        }
      }
    },
    async prev(step) {
      this.form.step--
    },
    async onInput(value, label, items_dadata = null) {
      if (label === 'Фамилия' || label === 'Имя' || label === 'Отчество') {
        let body = {query: value, count: 3, parts: ''}
        switch (label) {
          case 'Фамилия':
            body.parts = 'SURNAME'
            break
          case 'Имя':
            body.parts = 'NAME'
            break
          case 'Отчество':
            body.parts = 'PATRONYMIC'
            break
        }

        this.dadataRequest('fio', body).then(({data}) => {
          this.items[items_dadata] = []
          for (let fio in data.suggestions) {
            this.items[items_dadata].push(data.suggestions[fio].value)
          }
        })
      }
    },
    clearAndBack() {
      this.showFinal = false
      this.form = {
        form_id: '',
        step: 1,
      }
      this.cookiesInit()
    },
    cookiesInit() {
      let form_id = Cookies.get('form_id')
      if (form_id) {
        this.form.form_id = form_id
      } else {
        form_id = uuidv4()
        Cookies.set('form_id', form_id, {expires: 1 / 24})
        this.form.form_id = form_id
      }
    },
    managerInit() {
      const urlParams = new URLSearchParams(window.location.search);
      const managerId = urlParams.get('manager_id');
      if (managerId && uuidValidate(managerId)) {
        this.form.manager_id = managerId
      }
    }
  },
  mounted() {
    this.cookiesInit()
    this.managerInit()
  }
}
</script>

<style scoped>

</style>
