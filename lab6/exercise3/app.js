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
    }
});