import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index";
import AppLayout from "../layouts/AppLayout.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "",
    meta: {
      requiresAuth: true
    },
    component: AppLayout,
    children: [
      {
        path: "",
        component: () => import("@/views/Overview")
      },
      {
        path: "/access-control/local-user-management",
        name: "local-users",
        component: () => import("@/views/AccessControl/LocalUserManagement")
      }
    ]
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  linkExactActiveClass: "nav__link--current"
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters["authentication/isLoggedIn"]) {
      next();
      return;
    }
    next("/login");
  } else {
    next();
  }
});

export default router;
