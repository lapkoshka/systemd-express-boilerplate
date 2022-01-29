import * as core from 'express-serve-static-core';
import OrderController from './controllers/order';

export enum ROUTES {
  ORDER = '/api/order'
}

/**
 * Define your controller
 */
const controllers = [
  new OrderController({
    type: 'post',
    route: ROUTES.ORDER,
  }),
];

export default function (app: core.Express): void {
  controllers.forEach((controller) => controller.create(app));
}
