<template>
    <script>
        export default {
            data() {
                return {
                    error: "",
                    errorFlag: false,
                    users: []
                }
            },
            mounted: function () {
                this.getUser();
            },
            methods: {
                getUser: function () {
                    this.$http.get('http://localhost:4941/api/v2/users')
                        .then(function (response) {
                            this.user = response.data;
                        }, function (error) {
                            this.error = error;
                            this.errorFlag = true;
                        });
                }
            }
        }
    </script>
    <div>
        <div v-if="errorFlag" style="color: red;">
            {{error}}
        </div>

        <div v-if="$route.params.userID">
            <div id="user">
                <router-link :to="{ name: 'user'}">Back to User</router-link>
                <br /><br />
                <table>
                    <tr>
                        <td>User ID</td>
                        <td>Username</td>
                    </tr>
                    <tr>
                        <td>{{ $route.params.userID }}</td>
                        <td>{{ getUser($route.params.userID).username }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div v-else>
            <div id="users">
                <table>
                    <tr v-for="user in users">
                        <td>{{ user.username}}</td>
                        <td><route-link :to="{name: 'user', params: { userID: user.user_id}}">View</route-link></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>