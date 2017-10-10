import Vue from 'vue';
import App from './App.vue';
import Home from './Component/Home.vue';
import Users from './Component/Users.vue';
import Search from './Component/Search.vue';
import Projects from './Component/Projects.vue';

import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
Vue.use(VueResource);


const routes = [
    {
      path: "/",
        component: Home
    },
    {
      path: "/search",
        component: Search
    },
    {
      path: "/users/:userid",
        component: Users
    },
    {
      path: "/projects",
        name: "projects",
        component: Projects
    },
    {
        path: "/projects/:projectid",
        name: "project",
        component: Projects
    },
    {
        path: "/projects/:projectid/edit",
        name: "edit",
        component: Projects
    }

];

const router = new VueRouter({
    routes: routes,
    mode: 'history'
});

Vue.http.options.emulateJSON = true;

new Vue({
  el: '#app',
    router: router,
  render: h => h(App)
});
