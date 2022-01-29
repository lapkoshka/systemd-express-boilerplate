import BaseController, { Request, Response } from '../middleware/base';
import * as D from 'io-ts/Decoder';

const OrderData = D.struct({
    username: D.string,
    amount: D.number,
});

export type OrderData = D.TypeOf<typeof OrderData>;

export default class OrderController extends BaseController<OrderData> {
    type = OrderData;

    public async handleRequest(res: Response, req: Request<OrderData>): Promise<void> {
        const { username, amount } = req.body;

        console.log(username, amount);
        console.log(typeof username === 'string');
        console.log(typeof amount === 'number');

        res.sendStatus(200);
    }
}
