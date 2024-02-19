<template>
  <v-data-table-virtual
    :headers="headers"
    :items="list"
    hover
  >
    <template v-slot:top>
      <v-toolbar
        density="compact"
      >
        <h4 class="px-2">{{ label }}</h4>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              variant="text"
              density="compact"
              v-bind="props"
            >
              Добавить
            </v-btn>
          </template>
          <v-card>
            <Form v-slot="{ validate }">
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col sm="6" cols="12">
                    <Field
                      v-slot="{ field, errors, meta}"
                      rules="required"
                      name="type"
                      v-model="editedItem.type"
                    >
                      <v-row justify="start" class="h-100">
                        <v-col v-for="(item, i) in type_items" align="start" cols="6" :key="i"
                               :title="item.value"
                        >
                          <div class="border-md rounded h-100 d-flex justify-center align-center cursor-pointer pa-2"
                               :class="[editedItem.type === item.value ? 'border-secondary' : '']"
                               @click="editedItem.type = item.value"
                          >
                            <v-icon
                              :icon="item.icon"
                              size="xx-large"
                              :color="editedItem.type === item.value ? 'secondary' : 'primary'"
                            >
                            </v-icon>
                          </div>

                        </v-col>
                      </v-row>
                      <div class="v-input__details">
                        <error-message name="type" class="text-error">{{errors[0]}}</error-message>
                      </div>
                    </Field>
                  </v-col>
                  <v-col sm="6" cols="12">
                    <Field
                      v-slot="{ field, errors, meta}"
                      rules="required"
                      name="price"
                      v-model="editedItem.price"
                    >
                      <v-text-field
                        variant="outlined"
                        v-bind="field"
                        :error-messages="errors"
                        label="Цена, ₽"
                        color="primary"
                        v-maska:[options.sum]
                        :base-color="meta.valid && meta.validated ? 'secondary' : ''"
                      >
                      </v-text-field>
                    </Field>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="close"
                >
                  Закрыть
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="save(validate)"
                >
                  Сохранить
                </v-btn>
              </v-card-actions>
            </Form>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 text-center text-wrap">Удалить это?
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Нет</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">Да</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <!--      <v-icon-->
      <!--        size="small"-->
      <!--        class="me-2"-->
      <!--        @click="editItem(item)"-->
      <!--        icon="mdi-pencil"-->
      <!--      ></v-icon>-->
      <v-icon
        size="small"
        @click="deleteItem(item)"
        icon="mdi-delete"
      ></v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        variant="text"
        density="compact"
        @click="dialog = true"
      >
        Добавить
      </v-btn>
    </template>
  </v-data-table-virtual>
</template>
<script>
import {vMaska} from 'maska'
import {Field, Form} from "vee-validate";

export default {
  props: ['items', 'label', 'errorMessages'],
  directives: {maska: vMaska},
  components: {Form, Field},
  data: () => ({
    options: {
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
    dialog: false,
    dialogDelete: false,
    type_items: [{icon: 'mdi-car-hatchback', value: 'Движимое'}, {icon: 'mdi-home-city', value: 'Недвижимое'}],
    headers: [
      {title: 'Вид имущества', key: 'type', sortable: false},
      {title: 'Цена, ₽', key: 'price', sortable: false},
      {title: '', key: 'actions', sortable: false},
    ],
    list: [],
    editedIndex: -1,
    editedItem: {
      type: null,
      price: null,
    },
    defaultItem: {
      type: null,
      price: null
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Добавить' : 'Редактировать'
    },
  },

  watch: {
    list: {
      handler(val) {
        this.$emit('updateFromChildren', val)
      },
      deep: true
    },
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  methods: {
    editItem(item) {
      this.editedIndex = this.list.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.list.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm() {
      this.list.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save(validate) {
      let valid_data = await validate()
      if (valid_data.valid) {
        if (this.editedIndex > -1) {
          Object.assign(this.list[this.editedIndex], this.editedItem)
        } else {
          this.list.push(this.editedItem)
        }
        this.close()
      }
    },
  },
}
</script>
