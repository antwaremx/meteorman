import {extend, localize} from 'vee-validate';
import {
    required,
    email,
    length,
    max,
    min,
    confirmed,
    alpha_spaces,
    alpha_dash,
    alpha_num,
    min_value,
    max_value,
    numeric,
    digits,
    between,
    integer
} from 'vee-validate/dist/rules';

extend('email', email);
extend('required', required);
extend('length', length);
extend('max', max);
extend('min', min);
extend('min_value', min_value);
extend('max_value', max_value);
extend('confirmed', confirmed);
extend('alpha_spaces', alpha_spaces);
extend('alpha_num', alpha_num);
extend('alpha_dash', alpha_dash);
extend('numeric', numeric);
extend('digits', digits);
extend('between', between);
extend('integer', integer);
extend("decimal", {
    validate: (value, {decimals = '*', separator = '.'} = {}) => {
        if (value === null || value === undefined || value === '') {
            return {
                valid: false
            };
        }
        if (Number(decimals) === 0) {
            return {
                valid: /^-?\d*$/.test(value),
            };
        }
        const regexPart = decimals === '*' ? '+' : `{1,${decimals}}`;
        const regex = new RegExp(`^[-+]?\\d*(\\${separator}\\d${regexPart})?([eE]{1}[-]?\\d+)?$`);

        return {
            valid: regex.test(value),
        };
    },
    message: field => `El campo ${field} debe contener solo números decimales`
})
extend('strength_password', {
    message: field => `El campo ${field} debe contener al menos: 1 letra mayúscula, 1 letra minúscula, 1 número y un
   carácter especial (por ejemplo,. _ &? Etc.)`,
    validate: value => {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\_\.\/\?\¡\¿])(?=.{8,})");
        return strongRegex.test(value);
    }
});

extend('curp', {
   message: field => `El campo ${field} debe cumplir con la estructura correcta.`,
   validate: value => {
       const curpRegex = new RegExp(/[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/g)
       return curpRegex.test(value);
   }
});
