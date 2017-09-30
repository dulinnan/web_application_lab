//noinspection JSAnnotator
/**
 * Created by ldu32 on 26/09/17.
 */
const app = new Vue({
    el: '#app',
    data: {
        message: 'Hello World!',
        visible: true,
        shopping_list: [
            {name: 'bread', price: 2.75},
            {name: 'milk', price: 2.50},
            {name: 'pasta', price: 1.99}
        ]
    },
    methods: {
        calculateTotal: function () {
            let totalNumber = 0.0;
            let len = this.shopping_list.length;
            let i = 0;
            for (; i<len; i++) {
                totalNumber += this.shopping_list[i].price;
            }
            return totalNumber;
        }
    }
});