import {defineRule, configure} from 'vee-validate'
import  {setLocale, localize} from '@vee-validate/i18n'
import {required, email, min, max, regex, between} from '@vee-validate/rules';

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('between', between)

defineRule('required_if', (value, [target], ctx)=> {
  if(ctx.form[target] === ctx.rule.params[1] && !value) {
    return false
  } else {
    return true
  }
})

configure({
  generateMessage: localize({
    ru: {
      messages: {
        "alpha": "Поле может содержать только буквы",
        "alpha_dash": "Поле может содержать только буквы, цифры и дефис",
        "alpha_num": "Поле может содержать только буквы и цифры",
        "alpha_spaces": "Поле может содержать только буквы и пробелы",
        "between": "Поле должно быть между 0:{min} и 1:{max}",
        "confirmed": "Поле не совпадает Подтверждение",
        "digits": "Поле должно быть числовым и точно содержать 0:{length} цифры",
        "dimensions": "Поле должно быть 0:{width} пикселей на 1:{height} пикселей",
        "email": "Поле должно быть действительным электронным адресом",
        "excluded": "Поле должно быть допустимым значением",
        "ext": "Поле должно быть действительным файлом. ({args})",
        "image": "Поле должно быть изображением",
        "one_of": "Поле должно быть допустимым значением",
        "integer": "Поле должно быть целым числом",
        "length": "Длина поля должна быть 0:{length}",
        "max": "Поле не может быть более 0:{length} символов",
        "max_value": "Поле должно быть 0:{max} или менее",
        "mimes": "Поле должно иметь допустимый тип файла. ({args})",
        "min": "Поле должно быть не менее 0:{length} символов",
        "min_value": "Поле должно быть 0:{min} или больше",
        "numeric": "Поле должно быть числом",
        "regex": "Поле имеет ошибочный формат",
        "required": "Обязательное поле",
        "required_if": "Поле обязательно для заполнения",
        "size": "Поле должно быть меньше, чем 0:{size}KB"
      }
    }
  }),
})

setLocale('ru');

