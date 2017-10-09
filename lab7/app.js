new Vue({
    el: '#app',
    data: {
        users: []

    },
    mounted: function () {
        this.getUsers();

    },
    methods: {
        getUsers: function () {
            this.$http.get('http://localhost:3000/api/users')
                .then(function (response) {
                    this.users = response.data;
                }, function (error) {
                console.log(error);
            });

        }
    }
});