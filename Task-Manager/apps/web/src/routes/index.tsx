import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Root } from '../components/layout/Root';
import { Login } from '../pages/Login';
import { Tasks } from '../pages/Tasks';
import { TaskDetail } from '../pages/TaskDetail';

const rootRoute = createRootRoute({
  component: Root,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: Tasks,
});

const taskDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks/$taskId',
  component: TaskDetail,
});

const routeTree = rootRoute.addChildren([loginRoute, tasksRoute, taskDetailRoute]);

export const router = createRouter({ routeTree });  