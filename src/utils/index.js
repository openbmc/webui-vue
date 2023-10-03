import { getCurrentInstance } from 'vue';

export const useRoute = () => {
  const { proxy } = getCurrentInstance();
  const route = proxy.$route;
  return route;
};

export const useRouter = () => {
  const { proxy } = getCurrentInstance();
  const router = proxy.$router;
  return router;
};
