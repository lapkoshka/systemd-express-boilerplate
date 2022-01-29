import * as core from 'express-serve-static-core';
import { isLeft } from 'fp-ts/Either'
import { Decoder, draw } from 'io-ts/Decoder';
import { ROUTES } from '../routes';
import Logger from '../../storage/logger';


export type Request<T = any> = core.Request<core.ParamsDictionary, any, T>;
export type Response = core.Response;

interface ControllerParams {
  type: 'get' | 'post';
  route: ROUTES;
}

export default abstract class BaseController<T = any> {
  public type?: Decoder<any, any>;
  private requestType: 'get' | 'post';
  private route: ROUTES;

  constructor(params: ControllerParams) {
    this.requestType = params.type;
    this.route = params.route;
  }

  public create(app: core.Express) {
    app[this.requestType](this.route, async (req, res) => {
      const log = Logger.arm(this.route, req);

      try {
        if (this.type) {
          const decoded = this.type.decode(req.body);
          if (isLeft(decoded)) {
            log.fail(draw(decoded.left));
            res.sendStatus(400);

            return;
          }

          req.body = decoded.right;
        }

        await this.handleRequest(res, req);
      } catch (e) {
        if (e instanceof Error) {
          log.fail('Internal controller error 500', e.message);
        }

        res.sendStatus(500);
      }
    });
  }

  abstract handleRequest(res: core.Response, req: Request<T>): Promise<void>;
}
