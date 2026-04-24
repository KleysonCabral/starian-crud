import { createRouter, createWebHistory } from 'vue-router';
import PersonView from '../modules/person/views/PersonView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'persons',
      component: PersonView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
