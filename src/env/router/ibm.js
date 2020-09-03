import { remove } from 'lodash';
import routes from '@/router/routes';

const customRoutes = routes.map(route => {
  // Removes router definition that includes kvm
  // in name property (main and console layouts)

  // TODO: will revisit this, removing the definition
  // removes the route from the application but
  // the component is still included in the final build
  remove(route.children, ({ name }) => name.includes('kvm'));
  return route;
});

export default customRoutes;
